import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { IndexedDBStorageEngine } from '@/services/storage/indexedDBStorage'

describe('IndexedDB Offline Audio Storage Engine (Decision D4)', () => {
  let storage: IndexedDBStorageEngine

  beforeEach(async () => {
    storage = new IndexedDBStorageEngine()
    await storage.clearAllStoredTracks()
  })

  afterEach(() => {
    storage.closeDB()
  })

  it('saves an audio blob with metadata and retrieves it intact', async () => {
    const fakeAudioContent = new Uint8Array([0x49, 0x44, 0x33, 0x03, 0x00, 0x00]) // Mock ID3 header
    const blob = new Blob([fakeAudioContent], { type: 'audio/mpeg' })

    const saved = await storage.saveTrackBlob(blob, {
      id: 'local-test-1',
      title: 'Midnight Drive',
      artist: 'Synthwave Artist',
      duration: 210,
      fileName: 'midnight-drive.mp3',
    })

    expect(saved.id).toBe('local-test-1')
    expect(saved.title).toBe('Midnight Drive')
    expect(saved.artist).toBe('Synthwave Artist')
    expect(saved.duration).toBe(210)
    expect(saved.sizeBytes).toBe(fakeAudioContent.length)

    // Retrieve from DB
    const retrieved = await storage.getTrackBlob('local-test-1')
    expect(retrieved).toBeDefined()
    expect(retrieved?.title).toBe('Midnight Drive')
    expect(retrieved?.sizeBytes).toBe(fakeAudioContent.length)
  })

  it('derives title and artist from filename when not explicitly provided', async () => {
    const blob = new Blob([new Uint8Array(100)], { type: 'audio/mpeg' })
    const saved = await storage.saveTrackBlob(blob, {
      fileName: 'The Weeknd - Blinding Lights.mp3',
    })

    expect(saved.artist).toBe('The Weeknd')
    expect(saved.title).toBe('Blinding Lights')
  })

  it('calculates total used MB and storage quota accurately (Milestone 6 acceptance criteria)', async () => {
    // Save 1 MB blob
    const oneMB = new Uint8Array(1024 * 1024)
    const blob = new Blob([oneMB], { type: 'audio/mpeg' })

    await storage.saveTrackBlob(blob, { id: 'track-1mb', fileName: 'song1.mp3' })
    await storage.saveTrackBlob(blob, { id: 'track-2mb', fileName: 'song2.mp3' })

    const quota = await storage.getStorageQuota()

    expect(quota.usedBytes).toBe(2 * 1024 * 1024)
    expect(quota.usedMB).toBe(2.0)
    expect(quota.quotaMB).toBeGreaterThan(0)
    expect(quota.percentUsed).toBeGreaterThan(0)
  })

  it('deletes an audio blob from IndexedDB', async () => {
    const blob = new Blob([new Uint8Array(50)], { type: 'audio/mpeg' })
    await storage.saveTrackBlob(blob, { id: 'to-delete' })

    expect(await storage.getTrackBlob('to-delete')).toBeDefined()

    await storage.deleteTrackBlob('to-delete')
    expect(await storage.getTrackBlob('to-delete')).toBeUndefined()
  })

  it('creates an audio object URL for playback', async () => {
    const blob = new Blob([new Uint8Array(50)], { type: 'audio/mpeg' })
    await storage.saveTrackBlob(blob, { id: 'url-track' })

    const objectUrl = await storage.createAudioObjectUrl('url-track')
    expect(objectUrl).toBeTruthy()
    expect(typeof objectUrl).toBe('string')
  })
})
