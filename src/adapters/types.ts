import type { Track, PlaybackStatus, TrackSource } from '@/types'

export interface AdapterCallbacks {
  onStateChange: (status: PlaybackStatus) => void
  onTimeUpdate: (currentTime: number) => void
  onDurationChange: (duration: number) => void
  onEnded: () => void
  onError: (error: string) => void
}

export interface PlaybackAdapter {
  readonly name: TrackSource
  init: (container?: HTMLElement) => Promise<void>
  loadTrack: (track: Track) => Promise<void>
  play: () => Promise<void>
  pause: () => Promise<void>
  seek: (seconds: number) => Promise<void>
  setVolume: (volume: number) => void // 0.0 to 1.0
  setPlaybackRate: (rate: number) => void
  getCurrentTime: () => number
  getDuration: () => number
  getAudioData?: () => Uint8Array
  isRealFFT: () => boolean // REG-08: true for WebAudio, false for YouTube simulated
  destroy: () => void
}

