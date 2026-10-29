import type { Track } from './track'

export interface Playlist {
  id: string
  name: string
  description?: string
  coverUrl?: string
  tracks: Track[]
  createdAt: number
  updatedAt: number
  isPinned?: boolean
  syncCode?: string
}

export interface PlaylistState {
  playlists: Playlist[]
  activePlaylistId: string | null
  likedTracks: Track[]
}

export interface PlaylistActions {
  createPlaylist: (name: string, description?: string, coverUrl?: string) => Playlist
  updatePlaylist: (id: string, updates: Partial<Omit<Playlist, 'id' | 'createdAt'>>) => void
  deletePlaylist: (id: string) => void
  addTrackToPlaylist: (playlistId: string, track: Track) => void
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void
  reorderPlaylistTracks: (playlistId: string, fromIndex: number, toIndex: number) => void
  setActivePlaylistId: (id: string | null) => void
  setPlaylists: (playlists: Playlist[]) => void
  toggleLikeTrack: (track: Track) => boolean
  isLiked: (trackId: string) => boolean
}

