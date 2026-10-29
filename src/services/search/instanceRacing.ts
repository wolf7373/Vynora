import type { RawSearchItem, SearchResultTrack, SearchConfig } from './types'
import { DEFAULT_SEARCH_CONFIG } from './types'
import { filterMusicTracks } from './filterUtils'
import { CATALOG_TRACKS } from '@/data/tracksCatalog'

interface CacheEntry {
  tracks: SearchResultTrack[]
  timestamp: number
  instance: string
}

// 24-hour cache TTL in milliseconds
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

export class InstanceRacingSearcher {
  private config: SearchConfig
  private cache = new Map<string, CacheEntry>()

  constructor(config: SearchConfig = DEFAULT_SEARCH_CONFIG) {
    this.config = config
  }

  /**
   * Searches for tracks across multi-endpoint instances using request racing.
   */
  async search(query: string, parentSignal?: AbortSignal): Promise<{ tracks: SearchResultTrack[]; instance: string; cached: boolean }> {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) {
      return { tracks: [], instance: 'none', cached: false }
    }

    // 1. Check in-memory cache
    const cached = this.cache.get(trimmed)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return { tracks: cached.tracks, instance: cached.instance, cached: true }
    }

    // Direct Studio Streaming Priority: Find matching verified catalog tracks with direct audio
    const directCatalogMatches = this.searchFallback(trimmed)

    // 2. Race public instances
    try {
      const result = await this.raceInstances(query, parentSignal)
      if (result.tracks.length > 0) {
        // Prepend direct studio streaming matches so high-fidelity WebAudio plays first
        const mergedTracks = [...directCatalogMatches]
        for (const t of result.tracks) {
          const alreadyInCatalog = mergedTracks.some(
            (m) => m.id === t.id || (m.youtubeId && m.youtubeId === t.youtubeId)
          )
          if (!alreadyInCatalog) {
            mergedTracks.push(t)
          }
        }

        this.cache.set(trimmed, {
          tracks: mergedTracks,
          timestamp: Date.now(),
          instance: result.instance,
        })
        return { tracks: mergedTracks, instance: result.instance, cached: false }
      }
    } catch {
      // Racing failed or all instances timed out, fall back to sample tracks
    }

    // 3. Graceful offline / network failure fallback
    return { tracks: directCatalogMatches, instance: 'local-fallback', cached: false }
  }

  /**
   * Races multiple Piped and Invidious public instances concurrently
   */
  private async raceInstances(query: string, parentSignal?: AbortSignal): Promise<{ tracks: SearchResultTrack[]; instance: string }> {
    const encoded = encodeURIComponent(query)
    const instances = this.config.instances

    // Create an overall timeout controller
    const abortController = new AbortController()

    if (parentSignal) {
      parentSignal.addEventListener('abort', () => abortController.abort())
    }

    const timeoutId = setTimeout(() => {
      abortController.abort()
    }, this.config.timeoutMs)

    const fetchPromises = instances.map(async (instance) => {
      const isPiped = instance.includes('piped')
      const url = isPiped
        ? `${instance}/search?q=${encoded}&filter=videos`
        : `${instance}/api/v1/search?q=${encoded}&type=video`

      const response = await fetch(url, {
        signal: abortController.signal,
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Instance HTTP ${response.status}`)
      }

      const data = await response.json()
      let items: RawSearchItem[] = []

      if (Array.isArray(data)) {
        items = data
      } else if (data && Array.isArray(data.items)) {
        items = data.items
      }

      const filtered = filterMusicTracks(items, {
        minDuration: this.config.minDurationSeconds,
        maxDuration: this.config.maxDurationSeconds,
        sourceInstance: instance,
      })

      if (filtered.length > 0) {
        return { tracks: filtered, instance }
      }
      throw new Error('No valid music tracks found on instance')
    })

    try {
      // First instance to successfully return non-empty tracks wins
      const winningResult = await Promise.any(fetchPromises)
      clearTimeout(timeoutId)
      return winningResult
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Local fallback matching full verified catalog tracks
   */
  private searchFallback(query: string): SearchResultTrack[] {
    return CATALOG_TRACKS.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.artist.toLowerCase().includes(query) ||
        (t.album && t.album.toLowerCase().includes(query))
    ).map((t) => ({ ...t, sourceInstance: 'catalog' }))
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const instanceRacingSearcher = new InstanceRacingSearcher()

