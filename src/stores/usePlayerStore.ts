import { create } from 'zustand'
import type { PlayerState, PlayerActions, RepeatMode, PlaybackStatus, TrackSource } from '@/types'
import type { Track } from '@/types'

export type PlayerStore = PlayerState & PlayerActions

const getInitialVolume = (): number => {
  if (typeof window === 'undefined') return 0.8
  try {
    const saved = localStorage.getItem('vynora_volume')
    if (saved !== null) {
      const parsed = parseFloat(saved)
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed
    }
  } catch {}
  return 0.8
}

const getInitialAutoplay = (): boolean => {
  if (typeof window === 'undefined') return true
  try {
    const saved = localStorage.getItem('vynora_autoplay')
    if (saved !== null) return saved === 'true'
  } catch {}
  return true
}

const INITIAL_STATE: PlayerState = {
  currentTrack: null,
  status: 'idle',
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: getInitialVolume(),
  isMuted: false,
  bufferedTime: 0,
  playbackRate: 1.0,
  repeatMode: 'off',
  isShuffle: false,
  isAutoplay: getInitialAutoplay(),
  activeSource: null,
  error: null,
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  ...INITIAL_STATE,

  setCurrentTrack: (track: Track | null) => {
    set({
      currentTrack: track,
      activeSource: track ? track.source : null,
      currentTime: 0,
      duration: track ? track.duration : 0,
      bufferedTime: 0,
      error: null,
      status: track ? 'loading' : 'idle',
    })
  },

  setIsPlaying: (isPlaying: boolean) => {
    set({
      isPlaying,
      status: isPlaying ? 'playing' : 'paused',
    })
  },

  setStatus: (status: PlaybackStatus) => {
    set({
      status,
      isPlaying: status === 'playing',
    })
  },

  setCurrentTime: (time: number) => {
    const duration = get().duration
    const clamped = Math.max(0, duration > 0 ? Math.min(time, duration) : time)
    set({ currentTime: clamped })
  },

  setDuration: (duration: number) => {
    set({ duration: Math.max(0, duration) })
  },

  setVolume: (volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume))
    try {
      localStorage.setItem('vynora_volume', clamped.toString())
    } catch {}
    set({
      volume: clamped,
      isMuted: clamped === 0,
    })
  },

  toggleMute: () => {
    const { isMuted, volume } = get()
    if (isMuted) {
      set({ isMuted: false, volume: volume === 0 ? 0.8 : volume })
    } else {
      set({ isMuted: true })
    }
  },

  setBufferedTime: (time: number) => {
    set({ bufferedTime: Math.max(0, time) })
  },

  setPlaybackRate: (rate: number) => {
    const clamped = Math.max(0.25, Math.min(2.0, rate))
    set({ playbackRate: clamped })
  },

  setRepeatMode: (mode: RepeatMode) => {
    set({ repeatMode: mode })
  },

  cycleRepeatMode: () => {
    const current = get().repeatMode
    const next: RepeatMode = current === 'off' ? 'all' : current === 'all' ? 'one' : 'off'
    set({ repeatMode: next })
    return next
  },

  toggleShuffle: () => {
    const next = !get().isShuffle
    set({ isShuffle: next })
    return next
  },

  toggleAutoplay: () => {
    const next = !get().isAutoplay
    try {
      localStorage.setItem('vynora_autoplay', next.toString())
    } catch {}
    set({ isAutoplay: next })
    return next
  },

  setIsAutoplay: (enabled: boolean) => {
    set({ isAutoplay: enabled })
  },

  setActiveSource: (source: TrackSource | null) => {
    set({ activeSource: source })
  },

  setError: (error: string | null) => {
    set({
      error,
      status: error ? 'error' : get().status,
      isPlaying: error ? false : get().isPlaying,
    })
  },

  resetPlayer: () => {
    set({ ...INITIAL_STATE })
  },
}))

