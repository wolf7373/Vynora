import { describe, it, expect, beforeEach } from 'vitest'
import { useQueueStore, fisherYatesShuffle } from '@/stores/useQueueStore'
import type { Track } from '@/types/track'

const mockTracks: Track[] = [
  { id: 'track-1', title: 'Track 1', artist: 'Artist 1', duration: 180, source: 'youtube', youtubeId: 'yt-1' },
  { id: 'track-2', title: 'Track 2', artist: 'Artist 2', duration: 200, source: 'youtube', youtubeId: 'yt-2' },
  { id: 'track-3', title: 'Track 3', artist: 'Artist 3', duration: 220, source: 'youtube', youtubeId: 'yt-3' },
  { id: 'track-4', title: 'Track 4', artist: 'Artist 4', duration: 240, source: 'youtube', youtubeId: 'yt-4' },
]

describe('useQueueStore & Shuffle Algorithm', () => {
  beforeEach(() => {
    useQueueStore.getState().clearQueue()
  })

  it('sets queue and active track index', () => {
    const { setQueue } = useQueueStore.getState()
    setQueue(mockTracks, 1)

    const state = useQueueStore.getState()
    expect(state.queue).toHaveLength(4)
    expect(state.currentIndex).toBe(1)
    expect(state.getCurrentTrack()?.id).toBe('track-2')
    expect(state.getNextTrack()?.id).toBe('track-3')
    expect(state.getPreviousTrack()?.id).toBe('track-1')
  })

  it('adds tracks to queue at end and next', () => {
    const { setQueue, addToQueue } = useQueueStore.getState()
    setQueue([mockTracks[0], mockTracks[1]], 0)

    // Add at end
    addToQueue(mockTracks[2], 'end')
    expect(useQueueStore.getState().queue.map((t) => t.id)).toEqual(['track-1', 'track-2', 'track-3'])

    // Add at next (should insert after currentIndex 0)
    addToQueue(mockTracks[3], 'next')
    expect(useQueueStore.getState().queue.map((t) => t.id)).toEqual(['track-1', 'track-4', 'track-2', 'track-3'])
  })

  it('removes track from queue and adjusts currentIndex safely', () => {
    const { setQueue, removeFromQueue } = useQueueStore.getState()
    setQueue(mockTracks, 2) // current: track-3 (index 2)

    // Remove index 0 (before currentIndex)
    removeFromQueue(0)
    expect(useQueueStore.getState().currentIndex).toBe(1)
    expect(useQueueStore.getState().getCurrentTrack()?.id).toBe('track-3')

    // Remove current track (index 1)
    removeFromQueue(1)
    expect(useQueueStore.getState().queue.map((t) => t.id)).toEqual(['track-2', 'track-4'])
    expect(useQueueStore.getState().getCurrentTrack()?.id).toBe('track-4')
  })

  it('reorders queue tracks correctly', () => {
    const { setQueue, reorderQueue } = useQueueStore.getState()
    setQueue(mockTracks, 0) // current is track-1

    // Move track-1 from 0 to 2
    reorderQueue(0, 2)
    const state = useQueueStore.getState()
    expect(state.queue.map((t) => t.id)).toEqual(['track-2', 'track-3', 'track-1', 'track-4'])
    expect(state.currentIndex).toBe(2)
    expect(state.getCurrentTrack()?.id).toBe('track-1')
  })

  describe('playNext and repeat modes', () => {
    it('advances through tracks with repeatMode off and stops at end', () => {
      const { setQueue, playNext } = useQueueStore.getState()
      setQueue(mockTracks, 0)

      expect(playNext('off')?.id).toBe('track-2')
      expect(playNext('off')?.id).toBe('track-3')
      expect(playNext('off')?.id).toBe('track-4')
      // At the end
      expect(playNext('off')).toBeNull()
      expect(useQueueStore.getState().currentIndex).toBe(3)
    })

    it('loops to start when repeatMode is all', () => {
      const { setQueue, playNext } = useQueueStore.getState()
      setQueue(mockTracks, 3) // at last track

      const next = playNext('all')
      expect(next?.id).toBe('track-1')
      expect(useQueueStore.getState().currentIndex).toBe(0)
    })

    it('repeats the same track when repeatMode is one', () => {
      const { setQueue, playNext } = useQueueStore.getState()
      setQueue(mockTracks, 1)

      const next = playNext('one')
      expect(next?.id).toBe('track-2')
      expect(useQueueStore.getState().currentIndex).toBe(1)
    })
  })

  describe('playPrevious and jumpToIndex', () => {
    it('goes to previous track until start', () => {
      const { setQueue, playPrevious } = useQueueStore.getState()
      setQueue(mockTracks, 2)

      expect(playPrevious()?.id).toBe('track-2')
      expect(playPrevious()?.id).toBe('track-1')
      // At start, returns track-1
      expect(playPrevious()?.id).toBe('track-1')
    })

    it('jumps directly to a valid queue index', () => {
      const { setQueue, jumpToIndex } = useQueueStore.getState()
      setQueue(mockTracks, 0)

      const jumped = jumpToIndex(3)
      expect(jumped?.id).toBe('track-4')
      expect(useQueueStore.getState().currentIndex).toBe(3)

      // Invalid index
      expect(jumpToIndex(10)).toBeNull()
      expect(jumpToIndex(-2)).toBeNull()
    })
  })

  describe('Shuffle & Unshuffle Algorithm', () => {
    it('fisherYatesShuffle produces a valid permutation containing all elements', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const shuffled = fisherYatesShuffle(array)

      expect(shuffled).toHaveLength(array.length)
      expect(new Set(shuffled).size).toBe(array.length)
      expect(shuffled.sort((a, b) => a - b)).toEqual(array)
    })

    it('shuffles queue preserving current playing track at top index 0', () => {
      const { setQueue, shuffleQueue } = useQueueStore.getState()
      setQueue(mockTracks, 2) // current track is track-3

      shuffleQueue()
      const state = useQueueStore.getState()
      expect(state.queue[0].id).toBe('track-3')
      expect(state.currentIndex).toBe(0)
      expect(state.queue).toHaveLength(4)
      expect(new Set(state.queue.map((t) => t.id)).size).toBe(4)
    })

    it('unshuffles queue restoring original order and active track index', () => {
      const { setQueue, shuffleQueue, unshuffleQueue } = useQueueStore.getState()
      setQueue(mockTracks, 1) // track-2 at index 1

      shuffleQueue()
      // Now unshuffle
      unshuffleQueue()

      const state = useQueueStore.getState()
      expect(state.queue.map((t) => t.id)).toEqual(['track-1', 'track-2', 'track-3', 'track-4'])
      expect(state.currentIndex).toBe(1)
      expect(state.getCurrentTrack()?.id).toBe('track-2')
    })
  })
})

