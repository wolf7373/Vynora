export interface StoredAudioBlob {
  id: string
  fileName: string
  title: string
  artist: string
  album?: string
  duration: number
  sizeBytes: number
  mimeType: string
  blob: Blob
  coverBlob?: Blob
  addedAt: number
}

export interface StorageQuotaInfo {
  usedBytes: number
  quotaBytes: number
  usedMB: number
  quotaMB: number
  percentUsed: number
}

export const OFFLINE_DB_NAME = 'vynora-offline-db'
export const OFFLINE_DB_VERSION = 1
export const AUDIO_STORE_NAME = 'audio_blobs'
