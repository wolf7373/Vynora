import type { ParsedLyrics, LrcLibResponse } from './types'
import { extractCleanSearchTerms } from './cleanerRegex'
import { parseLrcString } from './lrcParser'
import { getCatalogTrackById } from '@/data/tracksCatalog'
import { findPreloadedLrc } from './preloadedLyrics'

const LRCLIB_API_BASE = 'https://lrclib.net/api'

// Canonical sample lyrics for immediate offline / test availability
const PRELOADED_SAMPLE_LYRICS: Record<string, string> = {
  'punj-295': `[00:15.20] Dash maheene vich 9 saal da
[00:18.50] Kehnde si ga munda bohot kamaal da
[00:22.00] 295 laga ditti mere te
[00:25.40] Darrda nahi jatt kade gair te
[00:30.00] Nitt nawa koyi vivad khada hunda
[00:34.20] Sach bolan da mull bura hunda
[00:38.10] Moose Wala naam lokaan de dilan te raj karda`,
  'punj-cheques': `[00:12.40] Karde aa gallan jivein jande ne mainu
[00:15.80] Paise di na kami jivein chaapde aa check nu
[00:19.50] Gaddi kaali vich baitha yaar tera
[00:23.00] Still rollin jatt dekh lai ve tu
[00:27.50] Duniya de piche kade lagda ni jatt
[00:31.00] Cheques sign hunde jivein game saari set`,
  'yt-starboy': `[00:08.00] I'm tryna put you in the worst mood, ah
[00:12.50] P1 cleaner than your church shoes, ah
[00:16.80] Milli point two just to hurt you, ah
[00:21.00] All red Lamb' just to tease you, ah
[00:25.40] Look what you've done
[00:27.50] I'm a motherfuckin' starboy
[00:33.20] Look what you've done
[00:35.80] I'm a motherfuckin' starboy`,
  'yt-midnight-city': `[00:32.00] Waiting in a car
[00:36.50] Waiting for a ride in the dark
[00:40.80] The night city grows
[00:45.00] Look and see her eyes, they glow
[00:53.00] Waiting in a car
[00:57.20] Waiting for a ride in the dark`,
}

export class LrcLibClient {
  private cache = new Map<string, ParsedLyrics>()

  /**
   * Fetches synchronized lyrics from LRCLIB for a given track
   */
  async getLyrics(
    title: string,
    artist: string,
    duration?: number,
    trackId?: string,
    trackLyrics?: string
  ): Promise<ParsedLyrics> {
    const { cleanTitle, cleanArtist, searchQueries } = extractCleanSearchTerms(title, artist)
    const cacheKey = `${cleanArtist.toLowerCase()}__${cleanTitle.toLowerCase()}`

    // 1. Check in-memory cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    // 2. Check localStorage persistent cache
    try {
      const stored = localStorage.getItem(`vynora_lyrics_${cacheKey}`)
      if (stored) {
        const parsed = JSON.parse(stored) as ParsedLyrics
        if (parsed.lines && parsed.lines.length > 0) {
          this.cache.set(cacheKey, parsed)
          return parsed
        }
      }
    } catch {}

    // 3. Check preloaded LRC database (0ms instant hits for Kesariya, Apna Bana Le, Die With A Smile, etc.)
    const preloadedMatch =
      findPreloadedLrc(cleanTitle) || (trackId ? PRELOADED_SAMPLE_LYRICS[trackId] : null)
    if (preloadedMatch) {
      const parsed = parseLrcString(preloadedMatch)
      if (parsed.isSynced && parsed.lines.length > 0) {
        this.cache.set(cacheKey, parsed)
        return parsed
      }
    }

    // 4. If track already has LRC lyrics attached, parse immediately
    if (trackLyrics && trackLyrics.includes('[')) {
      const parsed = parseLrcString(trackLyrics)
      if (parsed.isSynced && parsed.lines.length > 0) {
        this.cache.set(cacheKey, parsed)
        return parsed
      }
    }

    // 5. Check catalog track by ID
    if (trackId) {
      const catalogMatch = getCatalogTrackById(trackId)
      if (catalogMatch?.lyrics && catalogMatch.lyrics.includes('[')) {
        const parsed = parseLrcString(catalogMatch.lyrics)
        if (parsed.isSynced && parsed.lines.length > 0) {
          this.cache.set(cacheKey, parsed)
          return parsed
        }
      }
    }

    // 6. Check by title match in preloaded samples
    for (const [key, lrc] of Object.entries(PRELOADED_SAMPLE_LYRICS)) {
      if (cleanTitle.toLowerCase().includes(key.replace(/^(punj-|yt-)/, ''))) {
        const parsed = parseLrcString(lrc)
        this.cache.set(cacheKey, parsed)
        return parsed
      }
    }

    // 7. Query remote LRCLIB API - Method A: Direct GET (only if artist is present)
    if (cleanArtist) {
      try {
        const params = new URLSearchParams({
          track_name: cleanTitle,
          artist_name: cleanArtist,
        })
        if (duration && duration > 0) {
          params.append('duration', Math.round(duration).toString())
        }

        const response = await fetch(`${LRCLIB_API_BASE}/get?${params.toString()}`, {
          headers: {
            'User-Agent': 'Vynora/3.0 (https://github.com/vynora/vynora)',
          },
        })

        if (response.ok) {
          const data: LrcLibResponse = await response.json()
          if (data.syncedLyrics) {
            const parsed = parseLrcString(data.syncedLyrics)
            if (parsed.lines.length > 0) {
              this.cache.set(cacheKey, parsed)
              try {
                localStorage.setItem(`vynora_lyrics_${cacheKey}`, JSON.stringify(parsed))
              } catch {}
              return parsed
            }
          }
          if (data.plainLyrics) {
            const parsed: ParsedLyrics = {
              lines: [],
              plainText: data.plainLyrics,
              isSynced: false,
              instrumental: false,
            }
            this.cache.set(cacheKey, parsed)
            return parsed
          }
        }
      } catch {
        // Continue to search fallback
      }
    }

    // 8. Query remote LRCLIB API - Method B: Multi-Query Search Fallback
    for (const q of searchQueries) {
      try {
        const searchRes = await fetch(`${LRCLIB_API_BASE}/search?q=${encodeURIComponent(q)}`, {
          headers: {
            'User-Agent': 'Vynora/3.0 (https://github.com/vynora/vynora)',
          },
        })

        if (searchRes.ok) {
          const items = await searchRes.json()
          if (Array.isArray(items) && items.length > 0) {
            // Find first item with synchronized lyrics
            for (const item of items) {
              if (item.syncedLyrics) {
                const parsed = parseLrcString(item.syncedLyrics)
                if (parsed.isSynced && parsed.lines.length > 0) {
                  this.cache.set(cacheKey, parsed)
                  try {
                    localStorage.setItem(`vynora_lyrics_${cacheKey}`, JSON.stringify(parsed))
                  } catch {}
                  return parsed
                }
              }
            }

            // Fallback to first item with plain lyrics if no synced lyrics
            const itemWithPlain = items.find((i) => i.plainLyrics)
            if (itemWithPlain?.plainLyrics) {
              const parsed: ParsedLyrics = {
                lines: [],
                plainText: itemWithPlain.plainLyrics,
                isSynced: false,
                instrumental: false,
              }
              this.cache.set(cacheKey, parsed)
              return parsed
            }
          }
        }
      } catch {
        // Continue to next query
      }
    }

    return {
      lines: [],
      isSynced: false,
      instrumental: false,
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const lrcLibClient = new LrcLibClient()
