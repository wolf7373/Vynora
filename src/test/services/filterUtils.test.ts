import { describe, it, expect } from 'vitest'
import {
  isNonMusicVideo,
  cleanVideoTitle,
  parseArtistAndTitle,
  extractVideoId,
  filterMusicTracks,
} from '@/services/search/filterUtils'
import type { RawSearchItem } from '@/services/search/types'

describe('Search Filter & Anti-Vlog Engine (Milestone 4)', () => {
  describe('isNonMusicVideo', () => {
    it('detects vlog, reaction, and podcast keywords', () => {
      expect(isNonMusicVideo('My Daily Vlog #42 in Mumbai')).toBe(true)
      expect(isNonMusicVideo('Americans Reacting to Sidhu Moose Wala')).toBe(true)
      expect(isNonMusicVideo('GTA 5 Ultra Gameplay Walkthrough')).toBe(true)
      expect(isNonMusicVideo('iPhone 16 Pro Max Unboxing and Review')).toBe(true)
      expect(isNonMusicVideo('The Ranveer Show Podcast #350')).toBe(true)
    })

    it('permits pure music track titles', () => {
      expect(isNonMusicVideo('Sidhu Moose Wala - 295 (Official Video)')).toBe(false)
      expect(isNonMusicVideo('Shubh - Cheques (Audio)')).toBe(false)
      expect(isNonMusicVideo('The Weeknd - Starboy ft. Daft Punk')).toBe(false)
      expect(isNonMusicVideo('Roop Kumar Rathod - Maula Mere Maula')).toBe(false)
    })
  })

  describe('cleanVideoTitle', () => {
    it('strips redundant video tag suffixes', () => {
      expect(cleanVideoTitle('295 (Official Music Video)')).toBe('295')
      expect(cleanVideoTitle('Cheques [Official Video]')).toBe('Cheques')
      expect(cleanVideoTitle('Starboy (Official Audio)')).toBe('Starboy')
      expect(cleanVideoTitle('Blinding Lights [4K] [Official Music Video]')).toBe('Blinding Lights')
      expect(cleanVideoTitle('Midnight City (Visualizer)')).toBe('Midnight City')
    })
  })

  describe('parseArtistAndTitle', () => {
    it('splits Artist and Song Title using hyphens and dashes', () => {
      const res1 = parseArtistAndTitle('Sidhu Moose Wala - 295 (Official Video)')
      expect(res1.artist).toBe('Sidhu Moose Wala')
      expect(res1.title).toBe('295')

      const res2 = parseArtistAndTitle('Shubh — Cheques')
      expect(res2.artist).toBe('Shubh')
      expect(res2.title).toBe('Cheques')
    })

    it('falls back to author when no separator is present', () => {
      const res = parseArtistAndTitle('Starboy', 'The Weeknd - Topic')
      expect(res.artist).toBe('The Weeknd')
      expect(res.title).toBe('Starboy')
    })
  })

  describe('extractVideoId', () => {
    it('extracts 11-char YouTube ID from videoId, id, or url', () => {
      expect(extractVideoId({ title: 'Song', videoId: 'n_FCrCQ6-bA' })).toBe('n_FCrCQ6-bA')
      expect(extractVideoId({ title: 'Song', id: '4tywp83zkmk' })).toBe('4tywp83zkmk')
      expect(extractVideoId({ title: 'Song', url: '/watch?v=34Na4j8AVgA' })).toBe('34Na4j8AVgA')
      expect(extractVideoId({ title: 'Song', url: 'https://youtu.be/dX3k_QDnzHE' })).toBe('dX3k_QDnzHE')
    })
  })

  describe('filterMusicTracks (Milestone 4 Duration & Vlog Bounds)', () => {
    const rawItems: RawSearchItem[] = [
      {
        videoId: 'n_FCrCQ6-bA',
        title: 'Sidhu Moose Wala - 295 (Official Video)',
        duration: 270, // 4m30s - valid music track
      },
      {
        videoId: 'short-12345',
        title: 'Hilarious Comedy Short #shorts',
        duration: 45, // < 75s: MUST BE DISCARDED (Shorts/Trailers)
      },
      {
        videoId: 'long-movie-1',
        title: 'Full Movie HD Hindi Dubbed 2026',
        duration: 7200, // > 540s: MUST BE DISCARDED (Movies/Long podcasts)
      },
      {
        videoId: 'vlog-item-99',
        title: 'My Trip to Goa - Travel Vlog',
        duration: 320, // non-music vlog keyword: MUST BE DISCARDED
      },
      {
        videoId: '4tywp83zkmk',
        title: 'Shubh - Cheques [Official Audio]',
        duration: 185, // valid music track
      },
    ]

    it('filters out tracks with duration < 75s or > 540s, and eliminates vlogs', () => {
      const filtered = filterMusicTracks(rawItems, { minDuration: 75, maxDuration: 540 })

      expect(filtered).toHaveLength(2)
      expect(filtered[0].youtubeId).toBe('n_FCrCQ6-bA')
      expect(filtered[0].title).toBe('295')
      expect(filtered[0].artist).toBe('Sidhu Moose Wala')

      expect(filtered[1].youtubeId).toBe('4tywp83zkmk')
      expect(filtered[1].title).toBe('Cheques')
      expect(filtered[1].artist).toBe('Shubh')
    })
  })
})

