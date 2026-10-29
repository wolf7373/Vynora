import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InstanceRacingSearcher } from '@/services/search/instanceRacing'
import type { SearchConfig } from '@/services/search/types'

describe('Multi-Instance Search Racing & 24hr Cache', () => {
  let searcher: InstanceRacingSearcher

  const testConfig: SearchConfig = {
    instances: ['https://fast-instance.org', 'https://slow-instance.org', 'https://failing-instance.org'],
    timeoutMs: 1000,
    minDurationSeconds: 75,
    maxDurationSeconds: 540,
  }

  beforeEach(() => {
    searcher = new InstanceRacingSearcher(testConfig)
    searcher.clearCache()
    vi.restoreAllMocks()
  })

  it('races instances and returns the fastest responding instance data', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('failing-instance')) {
        return Promise.reject(new Error('Network offline'))
      }
      if (url.includes('fast-instance')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => [
            {
              videoId: 'Ww_6k9ZvxoM',
              title: 'Roop Kumar Rathod - Maula Mere Maula',
              duration: 350,
            },
          ],
        })
      }
      // Slow instance
      return new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              ok: true,
              status: 200,
              json: async () => [],
            }),
          500
        )
      )
    })

    const result = await searcher.search('maula mere maula')

    expect(result.tracks).toHaveLength(1)
    expect(result.tracks[0].youtubeId).toBe('Ww_6k9ZvxoM')
    expect(result.instance).toBe('https://fast-instance.org')
    expect(result.cached).toBe(false)
  })

  it('serves repeated queries directly from in-memory cache without calling fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          videoId: 'n_FCrCQ6-bA',
          title: 'Sidhu Moose Wala - 295',
          duration: 270,
        },
      ],
    })
    globalThis.fetch = fetchMock

    // First query - invokes fetch
    const firstCall = await searcher.search('295')
    expect(firstCall.cached).toBe(false)
    const callCount = fetchMock.mock.calls.length
    expect(callCount).toBeGreaterThan(0)

    // Second query - served from cache
    const secondCall = await searcher.search('295')
    expect(secondCall.cached).toBe(true)
    expect(secondCall.tracks[0].youtubeId).toBe('n_FCrCQ6-bA')
    // Fetch count should not increase
    expect(fetchMock.mock.calls.length).toBe(callCount)
  })

  it('gracefully falls back to local sample catalog when all remote instances fail', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('All instances blocked'))

    const result = await searcher.search('295')

    expect(result.instance).toBe('local-fallback')
    expect(result.tracks.length).toBeGreaterThan(0)
    expect(result.tracks[0].title).toBe('295')
  })
})

