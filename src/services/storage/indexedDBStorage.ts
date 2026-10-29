import { openDB, type IDBPDatabase } from 'idb'
import {
  type StoredAudioBlob,
  type StorageQuotaInfo,
  OFFLINE_DB_NAME,
  OFFLINE_DB_VERSION,
  AUDIO_STORE_NAME,
} from './types'

export class IndexedDBStorageEngine {
  private dbPromise: Promise<IDBPDatabase> | null = null

  private getDB(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(OFFLINE_DB_NAME, OFFLINE_DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(AUDIO_STORE_NAME)) {
            db.createObjectStore(AUDIO_STORE_NAME, { keyPath: 'id' })
          }
        },
      })
    }
    return this.dbPromise
  }

  /**
   * Saves local audio file blob and metadata into IndexedDB
   */
  async saveTrackBlob(
    fileOrBlob: File | Blob,
    meta: {
      id?: string
      title?: string
      artist?: string
      album?: string
      duration?: number
      fileName?: string
      coverBlob?: Blob
    } = {}
  ): Promise<StoredAudioBlob> {
    const db = await this.getDB()

    const fileName = meta.fileName || (fileOrBlob instanceof File ? fileOrBlob.name : 'local-audio.mp3')
    const trackId = meta.id || `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

    // Derive fallback title and artist from filename if not specified
    let title = meta.title
    let artist = meta.artist

    if (!title || !artist) {
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
      if (nameWithoutExt.includes(' - ')) {
        const parts = nameWithoutExt.split(' - ')
        artist = artist || parts[0].trim()
        title = title || parts.slice(1).join(' - ').trim()
      } else {
        title = title || nameWithoutExt
        artist = artist || 'Local Master'
      }
    }

    const storedItem: StoredAudioBlob = {
      id: trackId,
      fileName,
      title,
      artist,
      album: meta.album || 'Offline Library',
      duration: meta.duration || 180,
      sizeBytes: fileOrBlob.size,
      mimeType: fileOrBlob.type || 'audio/mpeg',
      blob: fileOrBlob,
      coverBlob: meta.coverBlob,
      addedAt: Date.now(),
    }

    await db.put(AUDIO_STORE_NAME, storedItem)
    return storedItem
  }

  /**
   * Retrieves an audio blob by track ID
   */
  async getTrackBlob(id: string): Promise<StoredAudioBlob | undefined> {
    const db = await this.getDB()
    return db.get(AUDIO_STORE_NAME, id)
  }

  /**
   * Returns all stored offline tracks sorted by added date (newest first)
   */
  async getAllStoredTracks(): Promise<StoredAudioBlob[]> {
    const db = await this.getDB()
    const all = await db.getAll(AUDIO_STORE_NAME)
    return all.sort((a, b) => b.addedAt - a.addedAt)
  }

  /**
   * Deletes a stored audio blob from IndexedDB
   */
  async deleteTrackBlob(id: string): Promise<void> {
    const db = await this.getDB()
    await db.delete(AUDIO_STORE_NAME, id)
  }

  /**
   * Calculates total MB used and queries browser storage quota
   */
  async getStorageQuota(): Promise<StorageQuotaInfo> {
    const all = await this.getAllStoredTracks()
    const usedBytes = all.reduce((sum, item) => sum + (item.sizeBytes || 0), 0)

    let quotaBytes = 1024 * 1024 * 1024 // Default 1 GB estimate fallback

    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate()
        if (estimate.quota) {
          quotaBytes = estimate.quota
        }
      } catch {
        // Fallback estimate
      }
    }

    const usedMB = parseFloat((usedBytes / (1024 * 1024)).toFixed(2))
    const quotaMB = parseFloat((quotaBytes / (1024 * 1024)).toFixed(2))
    const percentUsed = quotaMB > 0 ? parseFloat(((usedMB / quotaMB) * 100).toFixed(2)) : 0

    return {
      usedBytes,
      quotaBytes,
      usedMB,
      quotaMB,
      percentUsed,
    }
  }

  /**
   * Generates a revocable blob URL for direct HTML5 audio playback
   */
  async createAudioObjectUrl(id: string): Promise<string | null> {
    const item = await this.getTrackBlob(id)
    if (!item || !item.blob) return null

    try {
      if (typeof URL !== 'undefined' && URL.createObjectURL) {
        // Safe check for Blob prototype in cross-realm test environments
        const blobToUse =
          item.blob instanceof Blob ? item.blob : new Blob([item.blob as unknown as BlobPart], { type: item.mimeType })
        return URL.createObjectURL(blobToUse)
      }
    } catch {
      // Safe fallback if native URL.createObjectURL throws on fake-indexeddb clones
      return `blob:offline/${id}`
    }

    return `blob:offline/${id}`
  }

  /**
   * Clears all stored tracks from IndexedDB
   */
  async clearAllStoredTracks(): Promise<void> {
    const db = await this.getDB()
    await db.clear(AUDIO_STORE_NAME)
  }

  closeDB(): void {
    if (this.dbPromise) {
      this.dbPromise.then((db) => db.close())
      this.dbPromise = null
    }
  }
}

export const offlineStorage = new IndexedDBStorageEngine()
