import type { Track, TrackSource, PlaybackStatus } from '@/types'
import type { PlaybackAdapter, AdapterCallbacks } from './types'
import { WebAudioAdapter } from './WebAudioAdapter'
import { YouTubeAdapter } from './YouTubeAdapter'
import { MediaSessionAdapter } from './MediaSessionAdapter'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useQueueStore } from '@/stores/useQueueStore'
import { SleepTimerManager } from '@/services/playback/sleepTimerManager'
import { getSmartAutoplayNextTrack } from '@/services/recommendations/recommendationEngine'

export class PlaybackAdapterManager {
  private static instance: PlaybackAdapterManager | null = null
  private adapters: Map<TrackSource, PlaybackAdapter> = new Map()
  private activeAdapter: PlaybackAdapter | null = null
  private mediaSession = new MediaSessionAdapter()

  private constructor() {
    this.initAdapters()
  }

  static getInstance(): PlaybackAdapterManager {
    if (!PlaybackAdapterManager.instance) {
      PlaybackAdapterManager.instance = new PlaybackAdapterManager()
    }
    return PlaybackAdapterManager.instance
  }

  // Used for testing/mocking
  static resetInstance(): void {
    if (PlaybackAdapterManager.instance) {
      PlaybackAdapterManager.instance.destroy()
      PlaybackAdapterManager.instance = null
    }
  }

  private initAdapters(): void {
    const callbacks: AdapterCallbacks = {
      onStateChange: (status: PlaybackStatus) => {
        usePlayerStore.getState().setStatus(status)
        this.mediaSession.updatePlaybackState(status === 'playing')
      },
      onTimeUpdate: (currentTime: number) => {
        usePlayerStore.getState().setCurrentTime(currentTime)
        const duration = usePlayerStore.getState().duration
        this.mediaSession.updatePositionState(currentTime, duration)
      },
      onDurationChange: (duration: number) => {
        usePlayerStore.getState().setDuration(duration)
      },
      // REG-02: Native ENDED event handler only
      onEnded: () => {
        this.handleTrackEnded()
      },
      onError: (error: string) => {
        usePlayerStore.getState().setError(error)
      },
    }

    this.adapters.set('youtube', new YouTubeAdapter(callbacks))
    this.adapters.set('local', new WebAudioAdapter(callbacks))
    this.adapters.set('stream', new WebAudioAdapter(callbacks))

    this.mediaSession.init({
      onPlay: () => this.play(),
      onPause: () => this.pause(),
      onNext: () => this.playNext(),
      onPrevious: () => this.playPrevious(),
      onSeek: (position: number) => {
        if (position < 0) {
          // relative seek backwards
          const current = usePlayerStore.getState().currentTime
          this.seek(Math.max(0, current + position))
        } else if (position > 0 && position < 30 && position !== Math.floor(position)) {
          // relative seek forwards
          const current = usePlayerStore.getState().currentTime
          this.seek(current + position)
        } else {
          this.seek(position)
        }
      },
    })

  }

  async playTrack(track: Track): Promise<void> {
    const targetSource: TrackSource = track.source === 'stream' ? 'stream' : track.source === 'youtube' ? 'youtube' : 'local'
    const targetAdapter = this.adapters.get(targetSource)

    if (!targetAdapter) {
      usePlayerStore.getState().setError(`No adapter registered for source: ${track.source}`)
      return
    }

    // Zero Audio Overlap: Silence and pause all other adapters before switching
    for (const [source, adapter] of this.adapters.entries()) {
      if (source !== targetSource) {
        try {
          await adapter.pause()
        } catch {}
      }
    }

    // If switching to direct audio stream (WebAudio), ensure YouTube adapter is muted
    if (targetSource !== 'youtube') {
      const ytAdapter = this.adapters.get('youtube')
      if (ytAdapter) {
        try {
          ytAdapter.setVolume(0)
        } catch {}
      }
    }

    this.activeAdapter = targetAdapter

    // Update stores
    usePlayerStore.getState().setCurrentTrack(track)
    usePlayerStore.getState().setActiveSource(targetSource)
    this.mediaSession.updateMetadata(track)

    // Load track and start playback
    try {
      await targetAdapter.loadTrack(track)
      const currentVolume = usePlayerStore.getState().isMuted ? 0 : usePlayerStore.getState().volume
      targetAdapter.setVolume(currentVolume)
      await targetAdapter.play()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Playback failed'
      usePlayerStore.getState().setError(msg)
    }
  }

  async play(): Promise<void> {
    if (!this.activeAdapter) {
      // If no active adapter but track in store or queue
      const currentTrack = usePlayerStore.getState().currentTrack || useQueueStore.getState().getCurrentTrack()
      if (currentTrack) {
        await this.playTrack(currentTrack)
        return
      }
      return
    }

    try {
      await this.activeAdapter.play()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Play failed'
      usePlayerStore.getState().setError(msg)
    }
  }

  async pause(): Promise<void> {
    if (this.activeAdapter) {
      await this.activeAdapter.pause()
    }
  }

  async seek(seconds: number): Promise<void> {
    if (this.activeAdapter) {
      await this.activeAdapter.seek(seconds)
      usePlayerStore.getState().setCurrentTime(seconds)
    }
  }

  setVolume(volume: number): void {
    usePlayerStore.getState().setVolume(volume)
    if (this.activeAdapter) {
      this.activeAdapter.setVolume(volume)
    }
  }

  setPlaybackRate(rate: number): void {
    usePlayerStore.getState().setPlaybackRate(rate)
    if (this.activeAdapter) {
      this.activeAdapter.setPlaybackRate(rate)
    }
  }

  async playNext(): Promise<void> {
    const repeatMode = usePlayerStore.getState().repeatMode
    const nextTrack = useQueueStore.getState().playNext(repeatMode)
    if (nextTrack) {
      await this.playTrack(nextTrack)
    } else {
      // Smart Vibe Autoplay: When enabled and queue finishes, pick next track with exact same vibe
      const { isAutoplay, currentTrack } = usePlayerStore.getState()
      if (isAutoplay && currentTrack) {
        const { nextTrack: autoplayTrack } = getSmartAutoplayNextTrack(currentTrack)
        if (autoplayTrack && autoplayTrack.id !== currentTrack.id) {
          useQueueStore.getState().addToQueue(autoplayTrack)
          await this.playTrack(autoplayTrack)
          return
        }
      }
      await this.pause()
      usePlayerStore.getState().setStatus('ended')
    }
  }

  async playPrevious(): Promise<void> {
    const prevTrack = useQueueStore.getState().playPrevious()
    if (prevTrack) {
      await this.playTrack(prevTrack)
    }
  }

  // REG-02: Track advancement triggers strictly on native ENDED events
  private async handleTrackEnded(): Promise<void> {
    SleepTimerManager.getInstance().onTrackEnded()

    const repeatMode = usePlayerStore.getState().repeatMode

    if (repeatMode === 'one') {
      // Replay current track from 0
      const currentTrack = usePlayerStore.getState().currentTrack
      if (currentTrack && this.activeAdapter) {
        await this.seek(0)
        await this.play()
        return
      }
    }

    await this.playNext()
  }

  getActiveAdapter(): PlaybackAdapter | null {
    return this.activeAdapter
  }

  // REG-08: Check if current audio stream has real FFT data or simulated
  isRealFFT(): boolean {
    if (this.activeAdapter) {
      return this.activeAdapter.isRealFFT()
    }
    return false
  }

  getAudioData(): Uint8Array {
    if (this.activeAdapter && this.activeAdapter.getAudioData) {
      return this.activeAdapter.getAudioData()
    }
    return new Uint8Array(64)
  }

  getMediaSession(): MediaSessionAdapter {
    return this.mediaSession
  }

  destroy(): void {
    this.adapters.forEach((adapter) => {
      adapter.destroy()
    })
    this.adapters.clear()
    this.activeAdapter = null
    this.mediaSession.destroy()
  }
}
