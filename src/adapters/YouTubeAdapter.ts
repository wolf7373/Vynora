import type { Track, TrackSource } from '@/types'
import type { PlaybackAdapter, AdapterCallbacks } from './types'
import { usePlayerStore } from '@/stores/usePlayerStore'

// Global YouTube Iframe API types
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          height?: string | number
          width?: string | number
          videoId?: string
          playerVars?: Record<string, unknown>
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void
            onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void
            onError?: (event: { data: number }) => void
          }
        }
      ) => YTPlayerInstance
      PlayerState: {
        UNSTARTED: number
        ENDED: number
        PLAYING: number
        PAUSED: number
        BUFFERING: number
        CUED: number
      }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

export interface YTPlayerInstance {
  loadVideoById: (videoId: string, startSeconds?: number) => void
  cueVideoById: (videoId: string, startSeconds?: number) => void
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void
  setVolume: (volume: number) => void // 0 to 100
  getVolume: () => number
  setPlaybackRate: (suggestedRate: number) => void
  getPlaybackRate: () => number
  getPlayerState: () => number
  getCurrentTime: () => number
  getDuration: () => number
  destroy: () => void
}

export class YouTubeAdapter implements PlaybackAdapter {
  readonly name: TrackSource = 'youtube'
  private player: YTPlayerInstance | null = null
  private callbacks: AdapterCallbacks
  private pollInterval: ReturnType<typeof setInterval> | null = null
  private isReady = false
  private currentTrack: Track | null = null
  private containerId = 'vynora-yt-audio-engine'
  private simFFTData = new Uint8Array(64)
  private animFrame = 0

  constructor(callbacks: AdapterCallbacks, containerId?: string) {
    this.callbacks = callbacks
    if (containerId) {
      this.containerId = containerId
    }
  }

  private sendIframeCommand(func: string, args: unknown[] = []): void {
    if (typeof document === 'undefined') return
    const iframe = document.getElementById('youtube-player-iframe') as HTMLIFrameElement | null
    if (iframe?.contentWindow) {
      try {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        )
      } catch {}
    }
  }

  async init(container?: HTMLElement): Promise<void> {
    if (this.isReady && this.player) return

    // In a live browser session where SingletonYouTubePlayer is mounted, we strictly reuse the singleton iframe
    // and NEVER spawn a second hidden player that causes dual audio echo or desynchronization.
    if (
      typeof document !== 'undefined' &&
      (document.getElementById('youtube-player-iframe') ||
        document.getElementById('vynora-singleton-yt-host'))
    ) {
      // Clean up any stale fallback engine element
      const staleEl = document.getElementById(this.containerId)
      if (staleEl && staleEl.parentNode) {
        staleEl.parentNode.removeChild(staleEl)
      }
      this.isReady = true
      return
    }

    await this.loadYouTubeIframeAPI()

    return new Promise((resolve) => {
      // Find or create container element (Used strictly in headless/mock test runs)
      let mountEl = document.getElementById(this.containerId)
      if (!mountEl) {
        mountEl = document.createElement('div')
        mountEl.id = this.containerId
        mountEl.style.position = 'fixed'
        mountEl.style.bottom = '-9999px'
        mountEl.style.left = '-9999px'
        mountEl.style.width = '1px'
        mountEl.style.height = '1px'
        mountEl.style.opacity = '0.001'
        mountEl.style.pointerEvents = 'none'
        mountEl.setAttribute('aria-hidden', 'true')
        if (container) {
          container.appendChild(mountEl)
        } else {
          document.body.appendChild(mountEl)
        }
      }

      this.player = new window.YT.Player(mountEl, {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 0,
          controls: 1,
          disablekb: 1,
          fs: 1,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            this.isReady = true
            resolve()
          },
          onStateChange: (event) => this.handlePlayerStateChange(event.data),
          onError: (event) => this.handlePlayerError(event.data),
        },
      })
    })
  }

  private loadYouTubeIframeAPI(): Promise<void> {
    if (typeof window === 'undefined') return Promise.resolve()
    if (window.YT && window.YT.Player) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      const existingScript = document.getElementById('youtube-iframe-api')
      if (!existingScript) {
        const script = document.createElement('script')
        script.id = 'youtube-iframe-api'
        script.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(script)
      }

      const prevCallback = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback()
        resolve()
      }
    })
  }

  private handlePlayerStateChange(state: number): void {
    const YTState = window.YT?.PlayerState
    if (!YTState) return

    switch (state) {
      case YTState.UNSTARTED:
        this.stopPolling()
        this.callbacks.onStateChange('idle')
        break

      case YTState.PLAYING:
        this.callbacks.onStateChange('playing')
        this.startPolling()
        if (this.player) {
          const duration = this.player.getDuration()
          if (duration > 0) {
            this.callbacks.onDurationChange(duration)
          }
        }
        break

      case YTState.PAUSED:
        this.stopPolling()
        this.callbacks.onStateChange('paused')
        break

      case YTState.BUFFERING:
        this.callbacks.onStateChange('buffering')
        break

      // REG-02: Track advancement must ONLY trigger on native YT.PlayerState.ENDED (0)
      case YTState.ENDED:
        this.stopPolling()
        this.callbacks.onStateChange('ended')
        this.callbacks.onEnded()
        break

      case YTState.CUED:
        this.stopPolling()
        this.callbacks.onStateChange('idle')
        break
    }
  }

  private handlePlayerError(code: number): void {
    this.stopPolling()
    let msg = 'YouTube playback error'
    if (code === 2) msg = 'Invalid YouTube video ID parameter'
    if (code === 5) msg = 'HTML5 player playback error'
    if (code === 100) msg = 'Requested YouTube track not found or removed'
    if (code === 101 || code === 150) msg = 'Video owner does not allow embedded playback'
    this.callbacks.onError(msg)
  }

  private startPolling(): void {
    this.stopPolling()
    this.pollInterval = setInterval(() => {
      if (!this.player || !this.isReady) return
      try {
        const time = this.player.getCurrentTime()
        this.callbacks.onTimeUpdate(time)

        const duration = this.player.getDuration()
        if (duration > 0) {
          this.callbacks.onDurationChange(duration)
        }
        // REG-02 ENFORCEMENT: Strictly no nextTrack() or onEnded trigger here!
      } catch {
        // Ignore cross-origin polling hiccups
      }
    }, 250)
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
  }

  async loadTrack(track: Track): Promise<void> {
    this.currentTrack = track
    this.callbacks.onStateChange('loading')

    const videoId = track.youtubeId || ''
    if (!videoId) {
      this.callbacks.onError('Missing YouTube video ID')
      return
    }

    const isSingletonActive =
      typeof document !== 'undefined' &&
      (document.getElementById('youtube-player-iframe') ||
        document.getElementById('vynora-singleton-yt-host'))

    if (isSingletonActive) {
      this.isReady = true
      this.sendIframeCommand('loadVideoById', [videoId])
      this.sendIframeCommand('playVideo')
      return
    }

    if (!this.isReady || !this.player) {
      await this.init()
    }
    if (this.player) {
      this.player.loadVideoById(videoId)
    }
  }

  async play(): Promise<void> {
    const hasSingleton =
      typeof document !== 'undefined' &&
      Boolean(document.getElementById('youtube-player-iframe'))

    if (hasSingleton) {
      this.sendIframeCommand('playVideo')
    } else if (this.player) {
      this.player.playVideo()
    }
  }

  async pause(): Promise<void> {
    const hasSingleton =
      typeof document !== 'undefined' &&
      Boolean(document.getElementById('youtube-player-iframe'))

    if (hasSingleton) {
      this.sendIframeCommand('pauseVideo')
    } else if (this.player) {
      this.player.pauseVideo()
    }
  }

  async seek(seconds: number): Promise<void> {
    const hasSingleton =
      typeof document !== 'undefined' &&
      Boolean(document.getElementById('youtube-player-iframe'))

    if (hasSingleton) {
      this.sendIframeCommand('seekTo', [seconds, true])
    } else if (this.player) {
      this.player.seekTo(seconds, true)
    }
  }

  setVolume(volume: number): void {
    const ytVolume = Math.round(Math.max(0, Math.min(1, volume)) * 100)
    const hasSingleton =
      typeof document !== 'undefined' &&
      Boolean(document.getElementById('youtube-player-iframe'))

    if (hasSingleton) {
      if (ytVolume === 0) {
        this.sendIframeCommand('mute')
      } else {
        this.sendIframeCommand('unMute')
      }
      this.sendIframeCommand('setVolume', [ytVolume])
    } else if (this.player) {
      this.player.setVolume(ytVolume)
    }
  }

  setPlaybackRate(rate: number): void {
    if (!this.player) return
    this.player.setPlaybackRate(rate)
  }

  getCurrentTime(): number {
    if (this.player) {
      return this.player.getCurrentTime()
    }
    return usePlayerStore.getState().currentTime
  }

  getDuration(): number {
    if (this.player) {
      return this.player.getDuration()
    }
    return usePlayerStore.getState().duration || this.currentTrack?.duration || 0
  }

  // REG-08: YouTube stream cannot tap raw cross-origin audio, returns simulated beat FFT
  getAudioData(): Uint8Array {
    this.animFrame++
    for (let i = 0; i < 64; i++) {
      const beat = Math.sin((this.animFrame * 0.1) + i * 0.2) * 0.5 + 0.5
      const decay = Math.max(0, 1 - (i / 64))
      this.simFFTData[i] = Math.floor(beat * decay * 255)
    }
    return this.simFFTData
  }

  isRealFFT(): boolean {
    return false // REG-08: Displays BEAT SIM badge
  }

  destroy(): void {
    this.stopPolling()
    if (this.player) {
      try {
        this.player.destroy()
      } catch {
        // Ignore destroy error
      }
      this.player = null
    }
    if (typeof document !== 'undefined') {
      const el = document.getElementById(this.containerId)
      if (el && el.parentNode) {
        el.parentNode.removeChild(el)
      }
    }
    this.isReady = false
    this.currentTrack = null
  }
}
