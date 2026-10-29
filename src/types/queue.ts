import type { Track } from './track'

export interface QueueState {
  queue: Track[]
  currentIndex: number
  originalQueue: Track[]
  history: Track[]
}

export interface QueueActions {
  setQueue: (tracks: Track[], startIndex?: number) => void
  addToQueue: (track: Track | Track[], position?: 'next' | 'end') => void
  removeFromQueue: (index: number) => void
  reorderQueue: (fromIndex: number, toIndex: number) => void
  clearQueue: () => void
  playNext: (repeatMode?: 'off' | 'one' | 'all') => Track | null
  playPrevious: () => Track | null
  jumpToIndex: (index: number) => Track | null
  shuffleQueue: () => void
  unshuffleQueue: () => void
  getCurrentTrack: () => Track | null
  getNextTrack: () => Track | null
  getPreviousTrack: () => Track | null
}

