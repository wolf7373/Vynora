import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LrcLibClient } from '@/services/lyrics/lrcClient'

describe('LRCLIB Lyrics Client (Milestone 5)', () => {
  let client: LrcLibClient

  beforeEach(() => {
    client = new LrcLibClient()
    client.clearCache()
    vi.restoreAllMocks()
  })

  it('retrieves preloaded canonical lyrics for known tracks', async () => {
    const lyrics295 = await client.getLyrics('295', 'Sidhu Moose Wala', 270, 'punj-295')
    expect(lyrics295.isSynced).toBe(true)
    expect(lyrics295.lines.length).toBeGreaterThan(0)
    expect(lyrics295.lines[0].text).toContain('Dash maheene')

    const lyricsCheques = await client.getLyrics('Cheques', 'Shubh', 185, 'punj-cheques')
    expect(lyricsCheques.isSynced).toBe(true)
    expect(lyricsCheques.lines[0].text).toContain('Karde aa gallan')
  })

  it('caches retrieved lyrics and serves subsequent calls from cache', async () => {
    const first = await client.getLyrics('Starboy', 'The Weeknd', 230, 'yt-starboy')
    expect(first.isSynced).toBe(true)

    // Second call should return cached object
    const second = await client.getLyrics('Starboy', 'The Weeknd', 230, 'yt-starboy')
    expect(second).toEqual(first)
  })
})

