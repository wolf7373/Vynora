import type { Playlist } from '../../types/playlist'
import type { Track } from '../../types/track'

export interface SyncPayload {
  type: 'SYNC_SNAPSHOT' | 'SYNC_PLAYLIST_UPDATE' | 'SYNC_PLAYBACK_STATE'
  senderDeviceId: string
  timestamp: number
  playlists: Playlist[]
  currentTrack?: Track | null
  isPlaying?: boolean
}

export interface SyncCodeSession {
  code: string
  deviceId: string
  createdAt: number
  expiresAt: number
}

export interface SyncStatus {
  state: 'idle' | 'generating' | 'broadcasting' | 'connecting' | 'connected' | 'error'
  activeCode?: string
  connectedPeer?: string
  errorMessage?: string
}
