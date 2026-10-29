import { describe, it, expect } from 'vitest'
import { extractAudioFileDuration } from '@/utils/audioMetadata'

describe('audioMetadata utility', () => {
  it('extracts duration from an audio File object or provides fallback', async () => {
    const fakeFile = new File([new Uint8Array(100)], 'song.mp3', { type: 'audio/mpeg' })
    const duration = await extractAudioFileDuration(fakeFile)

    expect(duration).toBeGreaterThan(0)
    expect(typeof duration).toBe('number')
  })
})
