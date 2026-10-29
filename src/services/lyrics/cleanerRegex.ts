/**
 * Robust title and artist cleaner regex engine
 * Strips noisy YouTube video tags, pipes, record labels, and featuring credits
 * to maximize match accuracy on LRCLIB and lyrics services.
 */

export const KNOWN_RECORD_LABELS = [
  'universal music',
  't-series',
  'tseries',
  'zee music',
  'sony music',
  'yrf',
  'speed records',
  'white hill',
  'tips',
  'tips official',
  'saregama',
  'times music',
  'times music spiritual',
  'eros now',
  'desi music factory',
  'vyrl',
  'geet mp3',
  'jjust music',
  'aditya music',
  'lahari music',
  'think music',
  'dm - desi melodies',
  'single track studios',
  'saga hits',
  'nav haryanvi',
  'vyrloriginals',
  'svf music',
]

/**
 * Strips noisy video tags, pipes, and featuring credits from track title
 * to optimize LRCLIB lyrics lookup accuracy.
 */
export function cleanLyricsTrackTitle(title: string): string {
  if (!title) return ''

  // 1. YouTube title pattern: Take primary portion before pipe or double-slash
  // e.g. "Parvati Song (8K Video) | Jab Zid Pe Aa Gay..." -> "Parvati Song (8K Video)"
  let cleaned = title.split('|')[0].split('//')[0].trim()

  // 2. Check "Artist - Song" or "Song - Movie/Album" pattern
  if (cleaned.includes(' - ')) {
    const parts = cleaned.split(' - ')
    if (parts.length >= 2) {
      const p0 = parts[0].trim()
      const p1 = parts[1].trim()
      // If parts[0] looks like an artist name, prefer parts[1] as song title
      const p0IsArtist = /(singh|kumar|kaur|aujla|moose|dosanjh|weeknd|arijit|diljit|shubh|karan|badshah|pritam|shreya|jubin)/i.test(p0)
      cleaned = p0IsArtist ? p1 || p0 : p0 || p1
    }
  }

  // 3. Remove featuring credits (e.g. "ft. Daft Punk", "(feat. Daft Punk)", "featuring Jack Harlow")
  cleaned = cleaned.replace(/\s*(?:\(|\[)?\s*(?:ft|feat|featuring)\.?\s+.*$/gi, '')

  // 4. Remove movie soundtracks prefix/suffix: [From "Movie Name"]
  cleaned = cleaned.replace(/[([]\s*from\s+["'][^"']+["']\s*[)\]]/gi, '')

  // 5. Strip bracketed noise (e.g. (8K Video), [Official Video], (Lyrical), (Full Song))
  cleaned = cleaned
    .replace(/\(.*?\)|\[.*?\]/g, '')
    .replace(/\b(official|music video|lyric video|lyrical|video|audio|full song|full video|8k|4k|hd|remix|slowed|reverb)\b/gi, '')

  // 6. Strip leading/trailing punctuation and collapse spaces
  cleaned = cleaned.replace(/^[\s\-–—:.]+/, '').replace(/[\s\-–—:.]+$/, '').trim()
  return cleaned.replace(/\s{2,}/g, ' ')
}

/**
 * Cleans artist name by stripping Topic channels, VEVO, featuring credits,
 * and filtering out corporate record labels.
 */
export function cleanLyricsArtistName(artist: string): string {
  if (!artist) return ''
  let cleaned = (artist || '').split(',')[0].replace(/\(.*?\)|\[.*?\]/g, '').trim()
  cleaned = cleaned.replace(/\s*-\s*Topic$/i, '')
  cleaned = cleaned.replace(/\s*VEVO$/i, '')
  cleaned = cleaned.replace(/\s*(?:\(|\[)?\s*(?:ft|feat|featuring)\.?\s+.*$/gi, '')
  cleaned = cleaned.trim().replace(/\s{2,}/g, ' ')

  // If the artist is actually a known record label or YouTube channel, clear it
  const isLabel = KNOWN_RECORD_LABELS.some((lbl) => cleaned.toLowerCase().includes(lbl))
  if (isLabel) {
    return ''
  }

  return cleaned
}

/**
 * Comprehensive query extractor for LRCLIB search fallback
 */
export function extractCleanSearchTerms(rawTitle: string, rawArtist: string = ''): {
  cleanTitle: string
  cleanArtist: string
  searchQueries: string[]
} {
  const cleanTitle = cleanLyricsTrackTitle(rawTitle)
  const cleanArtist = cleanLyricsArtistName(rawArtist)

  const queries: string[] = []
  if (cleanTitle && cleanArtist) {
    queries.push(`${cleanTitle} ${cleanArtist}`)
  }
  if (cleanTitle) {
    queries.push(cleanTitle)
  }

  // If raw title had " - ", add both components as candidate search terms
  if (rawTitle.includes(' - ')) {
    const rawParts = rawTitle.split(' - ')
    for (const part of rawParts) {
      const cleanedPart = cleanLyricsTrackTitle(part)
      if (cleanedPart && cleanedPart.length >= 3 && !queries.includes(cleanedPart)) {
        queries.push(cleanedPart)
      }
    }
  }

  // Extract primary single/double word title if long
  const words = cleanTitle.split(' ').filter(Boolean)
  if (words.length > 1) {
    const twoWords = words.slice(0, 2).join(' ')
    if (!queries.includes(twoWords)) {
      queries.push(twoWords)
    }
  }
  if (words.length > 0 && words[0].length > 3 && !queries.includes(words[0])) {
    queries.push(words[0])
  }

  return { cleanTitle, cleanArtist, searchQueries: queries }
}
