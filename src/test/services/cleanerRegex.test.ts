import { describe, it, expect } from 'vitest'
import {
  cleanLyricsTrackTitle,
  cleanLyricsArtistName,
  extractCleanSearchTerms,
} from '@/services/lyrics/cleanerRegex'

describe('Lyrics Title & Artist Cleaner Regex (Milestone 5)', () => {
  it('strips video tag noise from song titles', () => {
    expect(cleanLyricsTrackTitle('295 (Official Music Video)')).toBe('295')
    expect(cleanLyricsTrackTitle('Cheques [Official Video]')).toBe('Cheques')
    expect(cleanLyricsTrackTitle('Starboy (Official Audio)')).toBe('Starboy')
    expect(cleanLyricsTrackTitle('Blinding Lights [4K] [Official Music Video]')).toBe('Blinding Lights')
    expect(cleanLyricsTrackTitle('Midnight City (Visualizer)')).toBe('Midnight City')
    expect(cleanLyricsTrackTitle('Maula Mere Maula (Remastered 2021)')).toBe('Maula Mere Maula')
  })

  it('strips featuring credits from song titles for clean lyrics database lookup', () => {
    expect(cleanLyricsTrackTitle('Starboy ft. Daft Punk')).toBe('Starboy')
    expect(cleanLyricsTrackTitle('Starboy (feat. Daft Punk)')).toBe('Starboy')
    expect(cleanLyricsTrackTitle('Industry Baby featuring Jack Harlow')).toBe('Industry Baby')
  })

  it('strips topic channels and VEVO from artist names', () => {
    expect(cleanLyricsArtistName('The Weeknd - Topic')).toBe('The Weeknd')
    expect(cleanLyricsArtistName('Taylor Swift VEVO')).toBe('Taylor Swift')
    expect(cleanLyricsArtistName('Drake ft. 21 Savage')).toBe('Drake')
  })

  it('cleans messy YouTube titles with pipes, 8K, and bracketed descriptors', () => {
    expect(cleanLyricsTrackTitle('Parvati Song (8K Video) | Jab Zid Pe Aa Gay...')).toBe('Parvati Song')
    expect(cleanLyricsTrackTitle('PARVATI trending dance by Hanuman Ansh....')).toBe('PARVATI trending dance by Hanuman Ansh')
    expect(cleanLyricsTrackTitle('Kesariya (From "Brahmastra") [Official Video]')).toBe('Kesariya')
  })

  it('filters out record labels like Times Music, T-Series, Zee Music from artist names', () => {
    expect(cleanLyricsArtistName('Times Music')).toBe('')
    expect(cleanLyricsArtistName('T-Series')).toBe('')
    expect(cleanLyricsArtistName('Zee Music Company')).toBe('')
    expect(cleanLyricsArtistName('Arijit Singh, Pritam')).toBe('Arijit Singh')
  })

  it('extracts multi-query search terms for LRCLIB fallback', () => {
    const terms = extractCleanSearchTerms(
      'Parvati Song (8K Video) | Jab Zid Pe Aa Gay...',
      'Times Music'
    )
    expect(terms.cleanTitle).toBe('Parvati Song')
    expect(terms.cleanArtist).toBe('')
    expect(terms.searchQueries).toContain('Parvati Song')
    expect(terms.searchQueries).toContain('Parvati')
  })
})
