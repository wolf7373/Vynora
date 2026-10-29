import type { Track, TrackSource } from './track'

export type RepeatMode = 'off' | 'one' | 'all'

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'ended' | 'error'

export type VisualizerMode = 'turntable' | 'waves' | 'tunnel'

export interface PlayerState {
  currentTrack: Track | null
  status: PlaybackStatus
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number // 0.0 to 1.0
  isMuted: boolean
  bufferedTime: number
  playbackRate: number
  repeatMode: RepeatMode
  isShuffle: boolean
  isAutoplay: boolean
  activeSource: TrackSource | null
  error: string | null
}

export interface PlayerActions {
  setCurrentTrack: (track: Track | null) => void
  setIsPlaying: (isPlaying: boolean) => void
  setStatus: (status: PlaybackStatus) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setBufferedTime: (time: number) => void
  setPlaybackRate: (rate: number) => void
  setRepeatMode: (mode: RepeatMode) => void
  cycleRepeatMode: () => RepeatMode
  toggleShuffle: () => boolean
  toggleAutoplay: () => boolean
  setIsAutoplay: (enabled: boolean) => void
  setActiveSource: (source: TrackSource | null) => void
  setError: (error: string | null) => void
  resetPlayer: () => void
}

