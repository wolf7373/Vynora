import { describe, it, expect, beforeEach } from 'vitest'
import { usePlayerStore } from '@/stores/usePlayerStore'
import type { Track } from '@/types/track'

const sampleTrack: Track = {
  id: 't-1',
  title: 'Starboy',
  artist: 'The Weeknd',
  duration: 230,
  source: 'youtube',
  youtubeId: '34Na4j8AVgA',
}

describe('usePlayerStore', () => {
  beforeEach(() => {
    usePlayerStore.getState().resetPlayer()
  })

  it('initializes with default player state', () => {
    const state = usePlayerStore.getState()
    expect(state.currentTrack).toBeNull()
    expect(state.isPlaying).toBe(false)
    expect(state.status).toBe('idle')
    expect(state.currentTime).toBe(0)
    expect(state.volume).toBe(0.8)
    expect(state.isMuted).toBe(false)
    expect(state.repeatMode).toBe('off')
    expect(state.isShuffle).toBe(false)
    expect(state.activeSource).toBeNull()
  })

  it('updates currentTrack and sets activeSource and duration', () => {
    const { setCurrentTrack } = usePlayerStore.getState()
    setCurrentTrack(sampleTrack)

    const state = usePlayerStore.getState()
    expect(state.currentTrack).toEqual(sampleTrack)
    expect(state.activeSource).toBe('youtube')
    expect(state.duration).toBe(230)
    expect(state.currentTime).toBe(0)
    expect(state.status).toBe('loading')
  })

  it('controls play and pause state correctly', () => {
    const { setIsPlaying, setStatus } = usePlayerStore.getState()
    setIsPlaying(true)
    expect(usePlayerStore.getState().isPlaying).toBe(true)
    expect(usePlayerStore.getState().status).toBe('playing')

    setIsPlaying(false)
    expect(usePlayerStore.getState().isPlaying).toBe(false)
    expect(usePlayerStore.getState().status).toBe('paused')

    setStatus('buffering')
    expect(usePlayerStore.getState().status).toBe('buffering')
    expect(usePlayerStore.getState().isPlaying).toBe(false)
  })

  it('clamps currentTime between 0 and duration', () => {
    const { setCurrentTrack, setCurrentTime } = usePlayerStore.getState()
    setCurrentTrack(sampleTrack) // duration: 230

    setCurrentTime(100)
    expect(usePlayerStore.getState().currentTime).toBe(100)

    // Over duration
    setCurrentTime(300)
    expect(usePlayerStore.getState().currentTime).toBe(230)

    // Negative time
    setCurrentTime(-50)
    expect(usePlayerStore.getState().currentTime).toBe(0)
  })

  it('manages volume and mute toggling', () => {
    const { setVolume, toggleMute } = usePlayerStore.getState()

    setVolume(0.5)
    expect(usePlayerStore.getState().volume).toBe(0.5)
    expect(usePlayerStore.getState().isMuted).toBe(false)

    // Clamping
    setVolume(1.5)
    expect(usePlayerStore.getState().volume).toBe(1.0)

    setVolume(-0.2)
    expect(usePlayerStore.getState().volume).toBe(0)
    expect(usePlayerStore.getState().isMuted).toBe(true)

    // Toggle mute
    setVolume(0.7)
    toggleMute()
    expect(usePlayerStore.getState().isMuted).toBe(true)
    toggleMute()
    expect(usePlayerStore.getState().isMuted).toBe(false)
    expect(usePlayerStore.getState().volume).toBe(0.7)
  })

  it('cycles repeat modes: off -> all -> one -> off', () => {
    const { cycleRepeatMode } = usePlayerStore.getState()

    expect(usePlayerStore.getState().repeatMode).toBe('off')
    expect(cycleRepeatMode()).toBe('all')
    expect(usePlayerStore.getState().repeatMode).toBe('all')

    expect(cycleRepeatMode()).toBe('one')
    expect(usePlayerStore.getState().repeatMode).toBe('one')

    expect(cycleRepeatMode()).toBe('off')
    expect(usePlayerStore.getState().repeatMode).toBe('off')
  })

  it('toggles shuffle state', () => {
    const { toggleShuffle } = usePlayerStore.getState()
    expect(usePlayerStore.getState().isShuffle).toBe(false)

    const next = toggleShuffle()
    expect(next).toBe(true)
    expect(usePlayerStore.getState().isShuffle).toBe(true)

    const back = toggleShuffle()
    expect(back).toBe(false)
    expect(usePlayerStore.getState().isShuffle).toBe(false)
  })

  it('handles playbackRate clamping and error states', () => {
    const { setPlaybackRate, setError } = usePlayerStore.getState()

    setPlaybackRate(1.5)
    expect(usePlayerStore.getState().playbackRate).toBe(1.5)

    setPlaybackRate(5.0)
    expect(usePlayerStore.getState().playbackRate).toBe(2.0)

    setPlaybackRate(0.01)
    expect(usePlayerStore.getState().playbackRate).toBe(0.25)

    setError('Network error')
    expect(usePlayerStore.getState().error).toBe('Network error')
    expect(usePlayerStore.getState().status).toBe('error')
    expect(usePlayerStore.getState().isPlaying).toBe(false)
  })
})

