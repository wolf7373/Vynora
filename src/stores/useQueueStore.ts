import { create } from 'zustand'
import type { QueueState, QueueActions, Track, RepeatMode } from '@/types'

export type QueueStore = QueueState & QueueActions

const INITIAL_STATE: QueueState = {
  queue: [],
  currentIndex: -1,
  originalQueue: [],
  history: [],
}

/**
 * Fisher-Yates shuffle implementation.
 * Returns a new shuffled array without mutating input.
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = temp
  }
  return shuffled
}

export const useQueueStore = create<QueueStore>((set, get) => ({
  ...INITIAL_STATE,

  setQueue: (tracks: Track[], startIndex: number = 0) => {
    const validIndex = tracks.length > 0 ? Math.max(0, Math.min(startIndex, tracks.length - 1)) : -1
    set({
      queue: [...tracks],
      originalQueue: [...tracks],
      currentIndex: validIndex,
      history: [],
    })
  },

  addToQueue: (trackOrTracks: Track | Track[], position: 'next' | 'end' = 'end') => {
    const newTracks = Array.isArray(trackOrTracks) ? trackOrTracks : [trackOrTracks]
    if (newTracks.length === 0) return

    const { queue, currentIndex, originalQueue } = get()

    if (queue.length === 0) {
      set({
        queue: newTracks,
        originalQueue: newTracks,
        currentIndex: 0,
      })
      return
    }

    if (position === 'next') {
      const insertAt = currentIndex + 1
      const updatedQueue = [
        ...queue.slice(0, insertAt),
        ...newTracks,
        ...queue.slice(insertAt),
      ]
      set({
        queue: updatedQueue,
        originalQueue: [...originalQueue, ...newTracks],
      })
    } else {
      set({
        queue: [...queue, ...newTracks],
        originalQueue: [...originalQueue, ...newTracks],
      })
    }
  },

  removeFromQueue: (index: number) => {
    const { queue, currentIndex, originalQueue } = get()
    if (index < 0 || index >= queue.length) return

    const removedTrack = queue[index]
    const updatedQueue = queue.filter((_, i) => i !== index)
    const updatedOriginal = originalQueue.filter((t) => t.id !== removedTrack.id)

    let nextIndex = currentIndex
    if (index < currentIndex) {
      nextIndex = currentIndex - 1
    } else if (index === currentIndex) {
      // If we remove the active track, keep current index unless it's now out of bounds
      nextIndex = updatedQueue.length === 0 ? -1 : Math.min(currentIndex, updatedQueue.length - 1)
    }

    set({
      queue: updatedQueue,
      originalQueue: updatedOriginal,
      currentIndex: nextIndex,
    })
  },

  reorderQueue: (fromIndex: number, toIndex: number) => {
    const { queue, currentIndex } = get()
    if (
      fromIndex < 0 ||
      fromIndex >= queue.length ||
      toIndex < 0 ||
      toIndex >= queue.length ||
      fromIndex === toIndex
    ) {
      return
    }

    const updatedQueue = [...queue]
    const [movedItem] = updatedQueue.splice(fromIndex, 1)
    updatedQueue.splice(toIndex, 0, movedItem)

    let newCurrentIndex = currentIndex
    if (currentIndex === fromIndex) {
      newCurrentIndex = toIndex
    } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
      newCurrentIndex = currentIndex - 1
    } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
      newCurrentIndex = currentIndex + 1
    }

    set({
      queue: updatedQueue,
      currentIndex: newCurrentIndex,
    })
  },

  clearQueue: () => {
    set({
      queue: [],
      originalQueue: [],
      currentIndex: -1,
      history: [],
    })
  },

  playNext: (repeatMode: RepeatMode = 'off') => {
    const { queue, currentIndex, history } = get()
    if (queue.length === 0 || currentIndex === -1) return null

    // Repeat 'one': re-play current track
    if (repeatMode === 'one') {
      return queue[currentIndex]
    }

    const currentTrack = queue[currentIndex]

    // Has a next track in queue
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1
      set({
        currentIndex: nextIndex,
        history: [...history, currentTrack],
      })
      return queue[nextIndex]
    }

    // At the end of queue: check if repeat 'all'
    if (repeatMode === 'all' && queue.length > 0) {
      set({
        currentIndex: 0,
        history: [...history, currentTrack],
      })
      return queue[0]
    }

    // Repeat 'off' and reached end
    return null
  },

  playPrevious: () => {
    const { queue, currentIndex } = get()
    if (queue.length === 0 || currentIndex === -1) return null

    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      set({ currentIndex: prevIndex })
      return queue[prevIndex]
    }

    // If at index 0, return index 0 (restart track)
    return queue[0]
  },

  jumpToIndex: (index: number) => {
    const { queue, currentIndex, history } = get()
    if (index < 0 || index >= queue.length) return null

    if (currentIndex >= 0 && currentIndex < queue.length) {
      const currentTrack = queue[currentIndex]
      set({
        currentIndex: index,
        history: [...history, currentTrack],
      })
    } else {
      set({ currentIndex: index })
    }

    return queue[index]
  },

  shuffleQueue: () => {
    const { queue, currentIndex, originalQueue } = get()
    if (queue.length <= 1) return

    const currentTrack = currentIndex >= 0 ? queue[currentIndex] : null
    const otherTracks = queue.filter((_, i) => i !== currentIndex)
    const shuffledOthers = fisherYatesShuffle(otherTracks)

    // Current track remains at top (index 0) if active
    const newQueue = currentTrack ? [currentTrack, ...shuffledOthers] : shuffledOthers

    set({
      queue: newQueue,
      currentIndex: currentTrack ? 0 : -1,
      // preserve originalQueue if not already saved
      originalQueue: originalQueue.length === queue.length ? originalQueue : [...queue],
    })
  },

  unshuffleQueue: () => {
    const { queue, currentIndex, originalQueue } = get()
    if (originalQueue.length === 0) return

    const currentTrack = currentIndex >= 0 ? queue[currentIndex] : null
    let restoredIndex = 0

    if (currentTrack) {
      const found = originalQueue.findIndex((t) => t.id === currentTrack.id)
      restoredIndex = found >= 0 ? found : 0
    }

    set({
      queue: [...originalQueue],
      currentIndex: restoredIndex,
    })
  },

  getCurrentTrack: () => {
    const { queue, currentIndex } = get()
    if (currentIndex >= 0 && currentIndex < queue.length) {
      return queue[currentIndex]
    }
    return null
  },

  getNextTrack: () => {
    const { queue, currentIndex } = get()
    if (currentIndex >= 0 && currentIndex < queue.length - 1) {
      return queue[currentIndex + 1]
    }
    return null
  },

  getPreviousTrack: () => {
    const { queue, currentIndex } = get()
    if (currentIndex > 0 && currentIndex < queue.length) {
      return queue[currentIndex - 1]
    }
    return null
  },
}))

