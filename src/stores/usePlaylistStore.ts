import { create } from 'zustand'
import type { Playlist, PlaylistState, PlaylistActions, Track } from '@/types'
import { CATALOG_PLAYLISTS } from '@/data/tracksCatalog'

export type PlaylistStore = PlaylistState & PlaylistActions

const LIKED_STORAGE_KEY = 'vynora_liked_tracks_v1'

const loadInitialLikedTracks = (): Track[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LIKED_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore
  }
  return []
}

const INITIAL_STATE: PlaylistState = {
  playlists: CATALOG_PLAYLISTS,
  activePlaylistId: null,
  likedTracks: loadInitialLikedTracks(),
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  ...INITIAL_STATE,

  createPlaylist: (name: string, description?: string, coverUrl?: string) => {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim() || 'Untitled Playlist',
      description,
      coverUrl,
      tracks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    set((state) => ({
      playlists: [newPlaylist, ...state.playlists],
      activePlaylistId: newPlaylist.id,
    }))

    return newPlaylist
  },

  updatePlaylist: (id: string, updates: Partial<Omit<Playlist, 'id' | 'createdAt'>>) => {
    set((state) => ({
      playlists: state.playlists.map((pl) =>
        pl.id === id
          ? {
              ...pl,
              ...updates,
              updatedAt: Date.now(),
            }
          : pl
      ),
    }))
  },

  deletePlaylist: (id: string) => {
    set((state) => ({
      playlists: state.playlists.filter((pl) => pl.id !== id),
      activePlaylistId: state.activePlaylistId === id ? null : state.activePlaylistId,
    }))
  },

  addTrackToPlaylist: (playlistId: string, track: Track) => {
    set((state) => ({
      playlists: state.playlists.map((pl) => {
        if (pl.id !== playlistId) return pl
        if (pl.tracks.some((t) => t.id === track.id)) return pl
        return {
          ...pl,
          tracks: [...pl.tracks, track],
          updatedAt: Date.now(),
        }
      }),
    }))
  },

  removeTrackFromPlaylist: (playlistId: string, trackId: string) => {
    set((state) => ({
      playlists: state.playlists.map((pl) => {
        if (pl.id !== playlistId) return pl
        return {
          ...pl,
          tracks: pl.tracks.filter((t) => t.id !== trackId),
          updatedAt: Date.now(),
        }
      }),
    }))
  },

  reorderPlaylistTracks: (playlistId: string, fromIndex: number, toIndex: number) => {
    const playlist = get().playlists.find((pl) => pl.id === playlistId)
    if (!playlist) return
    if (
      fromIndex < 0 ||
      fromIndex >= playlist.tracks.length ||
      toIndex < 0 ||
      toIndex >= playlist.tracks.length ||
      fromIndex === toIndex
    ) {
      return
    }

    const updatedTracks = [...playlist.tracks]
    const [movedTrack] = updatedTracks.splice(fromIndex, 1)
    updatedTracks.splice(toIndex, 0, movedTrack)

    set((state) => ({
      playlists: state.playlists.map((pl) =>
        pl.id === playlistId
          ? {
              ...pl,
              tracks: updatedTracks,
              updatedAt: Date.now(),
            }
          : pl
      ),
    }))
  },

  setActivePlaylistId: (id: string | null) => {
    set({ activePlaylistId: id })
  },

  setPlaylists: (playlists: Playlist[]) => {
    set({ playlists })
  },

  toggleLikeTrack: (track: Track): boolean => {
    const { likedTracks } = get()
    const isAlreadyLiked = likedTracks.some((t) => t.id === track.id)
    const updated = isAlreadyLiked
      ? likedTracks.filter((t) => t.id !== track.id)
      : [{ ...track, isLiked: true }, ...likedTracks]

    set({ likedTracks: updated })
    try {
      localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // ignore
    }
    return !isAlreadyLiked
  },

  isLiked: (trackId: string): boolean => {
    return get().likedTracks.some((t) => t.id === trackId)
  },
}))
