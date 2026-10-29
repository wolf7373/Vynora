import type { Track, TrackSource } from '@/types'
import type { PlaybackAdapter, AdapterCallbacks } from './types'

export class WebAudioAdapter implements PlaybackAdapter {
  readonly name: TrackSource = 'local'
  private audio: HTMLAudioElement | null = null
  private audioCtx: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private sourceNode: MediaElementAudioSourceNode | null = null
  private gainNode: GainNode | null = null
  private compressorNode: DynamicsCompressorNode | null = null
  private callbacks: AdapterCallbacks
  private isInitialized = false
  private currentTrack: Track | null = null
  private freqData: Uint8Array<ArrayBuffer> | null = null

  constructor(callbacks: AdapterCallbacks) {
    this.callbacks = callbacks
  }

  async init(): Promise<void> {
    if (this.isInitialized && this.audio) return

    this.audio = new Audio()
    this.audio.preload = 'auto'
    this.audio.crossOrigin = 'anonymous'

    // Attach HTML5 audio events
    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        this.callbacks.onTimeUpdate(this.audio.currentTime)
      }
    })

    this.audio.addEventListener('durationchange', () => {
      if (this.audio && !isNaN(this.audio.duration)) {
        this.callbacks.onDurationChange(this.audio.duration)
      }
    })

    this.audio.addEventListener('play', () => {
      this.callbacks.onStateChange('playing')
    })

    this.audio.addEventListener('pause', () => {
      if (this.audio && !this.audio.ended) {
        this.callbacks.onStateChange('paused')
      }
    })

    this.audio.addEventListener('waiting', () => {
      this.callbacks.onStateChange('buffering')
    })

    // REG-02: Track advancement must ONLY trigger on native audio.onended event
    this.audio.addEventListener('ended', () => {
      this.callbacks.onStateChange('ended')
      this.callbacks.onEnded()
    })

    this.audio.addEventListener('error', () => {
      const errMsg = this.audio?.error?.message || 'Local audio playback error'
      this.callbacks.onError(errMsg)
    })

    this.isInitialized = true
  }

  private ensureAudioGraph(): void {
    if (typeof window === 'undefined') return
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtxClass || !this.audio) return

    if (!this.audioCtx) {
      this.audioCtx = new AudioCtxClass()
      this.analyser = this.audioCtx.createAnalyser()
      this.analyser.fftSize = 128
      this.analyser.smoothingTimeConstant = 0.8
      this.freqData = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount))

      this.gainNode = this.audioCtx.createGain()

      // Studio Dynamics Limiter / Anti-Clipping Stage
      try {
        if (typeof this.audioCtx.createDynamicsCompressor === 'function') {
          this.compressorNode = this.audioCtx.createDynamicsCompressor()
          this.compressorNode.threshold.setValueAtTime(-1.0, this.audioCtx.currentTime)
          this.compressorNode.knee.setValueAtTime(4, this.audioCtx.currentTime)
          this.compressorNode.ratio.setValueAtTime(12, this.audioCtx.currentTime)
          this.compressorNode.attack.setValueAtTime(0.003, this.audioCtx.currentTime)
          this.compressorNode.release.setValueAtTime(0.25, this.audioCtx.currentTime)
        }
      } catch {
        // Fallback if compressor unsupported
      }

      try {
        this.sourceNode = this.audioCtx.createMediaElementSource(this.audio)
        this.sourceNode.connect(this.analyser)
        this.analyser.connect(this.gainNode)
        if (this.compressorNode) {
          this.gainNode.connect(this.compressorNode)
          this.compressorNode.connect(this.audioCtx.destination)
        } else {
          this.gainNode.connect(this.audioCtx.destination)
        }
      } catch {
        // Fallback for mocked media element source node
      }
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {})
    }
  }

  async loadTrack(track: Track): Promise<void> {
    await this.init()
    this.currentTrack = track
    this.callbacks.onStateChange('loading')

    if (!this.audio) return

    const sourceUrl = track.audioUrl || ''
    this.audio.src = sourceUrl
    this.audio.load()

    this.ensureAudioGraph()
  }

  async play(): Promise<void> {
    if (!this.audio) return
    this.ensureAudioGraph()
    try {
      await this.audio.play()
      this.callbacks.onStateChange('playing')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Play request interrupted'
      this.callbacks.onError(msg)
    }
  }

  async pause(): Promise<void> {
    if (!this.audio) return
    this.audio.pause()
    this.callbacks.onStateChange('paused')
  }

  async seek(seconds: number): Promise<void> {
    if (!this.audio) return
    const safeTime = Math.max(0, Math.min(seconds, this.audio.duration || seconds))
    this.audio.currentTime = safeTime
  }

  setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume))
    if (this.audio) {
      this.audio.volume = clamped
    }
    if (this.gainNode) {
      if (typeof this.gainNode.gain.setValueAtTime === 'function' && this.audioCtx) {
        this.gainNode.gain.setValueAtTime(clamped, this.audioCtx.currentTime)
      } else {
        this.gainNode.gain.value = clamped
      }
    }
  }

  setPlaybackRate(rate: number): void {
    if (this.audio) {
      this.audio.playbackRate = Math.max(0.25, Math.min(2.0, rate))
    }
  }

  getCurrentTime(): number {
    return this.audio?.currentTime || 0
  }

  getDuration(): number {
    return this.audio?.duration || this.currentTrack?.duration || 0
  }

  getAudioData(): Uint8Array {
    if (this.analyser && this.freqData) {
      this.analyser.getByteFrequencyData(this.freqData)
      return this.freqData
    }
    return new Uint8Array(64)
  }

  isRealFFT(): boolean {
    return true
  }

  destroy(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.src = ''
      this.audio = null
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {})
      this.audioCtx = null
    }
    this.isInitialized = false
    this.currentTrack = null
  }
}
