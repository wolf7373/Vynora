import type { RawSearchItem, SearchResultTrack } from './types'

// Non-music keywords to strictly exclude non-song content
const EXCLUDED_KEYWORDS = [
  'vlog',
  'vlogs',
  'reaction',
  'reacting to',
  'gameplay',
  'walkthrough',
  'unboxing',
  'prank',
  'roast',
  'review',
  'podcast',
  'behind the scenes',
  'interview',
  'trailer',
  'teaser',
  'news',
  'live stream',
  'livestream',
  'meme',
]

// Common video tag suffixes to clean from title
const TITLE_CLEAN_PATTERNS = [
  /\(official\s+music\s+video\)/gi,
  /\[official\s+music\s+video\]/gi,
  /\(official\s+video\)/gi,
  /\[official\s+video\]/gi,
  /\(official\s+audio\)/gi,
  /\[official\s+audio\]/gi,
  /\(lyric\s+video\)/gi,
  /\[lyric\s+video\]/gi,
  /\(official\s+lyric\s+video\)/gi,
  /\[official\s+lyric\s+video\]/gi,
  /\(visualizer\)/gi,
  /\[visualizer\]/gi,
  /\[4k\]/gi,
  /\[hd\]/gi,
  /\(audio\)/gi,
  /\[audio\]/gi,
  /\|\s*official\s+video/gi,
  /\|\s*official\s+music\s+video/gi,
]

/**
 * Checks if a video title contains vlog/non-music content
 */
export function isNonMusicVideo(title: string): boolean {
  const lower = title.toLowerCase()
  return EXCLUDED_KEYWORDS.some((kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, 'i')
    return regex.test(lower)
  })
}

/**
 * Cleans YouTube video titles by stripping noise tags
 */
export function cleanVideoTitle(rawTitle: string): string {
  let cleaned = rawTitle
  for (const pattern of TITLE_CLEAN_PATTERNS) {
    cleaned = cleaned.replace(pattern, '')
  }
  return cleaned.trim().replace(/\s{2,}/g, ' ')
}

/**
 * Parses artist and title from "Artist - Song Title" strings
 */
export function parseArtistAndTitle(rawTitle: string, fallbackAuthor?: string): { artist: string; title: string } {
  const cleaned = cleanVideoTitle(rawTitle)
  const separators = [' - ', ' – ', ' — ', ' : ']

  for (const sep of separators) {
    if (cleaned.includes(sep)) {
      const parts = cleaned.split(sep)
      if (parts.length >= 2) {
        const potentialArtist = parts[0].trim()
        const potentialTitle = parts.slice(1).join(sep).trim()
        if (potentialArtist.length > 0 && potentialTitle.length > 0) {
          return {
            artist: potentialArtist,
            title: potentialTitle,
          }
        }
      }
    }
  }

  // Fallback if no separator found
  return {
    artist: (fallbackAuthor || 'YouTube Artist').replace(/ - Topic$/i, '').trim(),
    title: cleaned,
  }
}

/**
 * Extracts YouTube video ID from various ID or URL formats
 */
export function extractVideoId(item: RawSearchItem): string {
  if (item.videoId && item.videoId.trim().length > 0) {
    return item.videoId.trim()
  }
  if (item.id && !item.id.startsWith('http') && item.id.length === 11) {
    return item.id.trim()
  }
  if (item.url) {
    const vMatch = item.url.match(/[?&]v=([^&]+)/)
    if (vMatch && vMatch[1]) return vMatch[1]
    const shortMatch = item.url.match(/youtu\.be\/([^?]+)/)
    if (shortMatch && shortMatch[1]) return shortMatch[1]
    const pipedMatch = item.url.match(/\/watch\?v=([^&]+)/)
    if (pipedMatch && pipedMatch[1]) return pipedMatch[1]
  }
  return ''
}

/**
 * Strict Pure Music filter:
 * 1. Checks duration between minDuration (75s) and maxDuration (540s).
 * 2. Excludes vlogs/reactions/non-music content.
 * 3. Formats into clean SearchResultTrack.
 */
export function filterMusicTracks(
  items: RawSearchItem[],
  options: { minDuration?: number; maxDuration?: number; sourceInstance?: string } = {}
): SearchResultTrack[] {
  const minDur = options.minDuration ?? 75
  const maxDur = options.maxDuration ?? 540

  const results: SearchResultTrack[] = []

  for (const item of items) {
    // 1. Duration check
    const duration = item.duration ?? item.lengthSeconds ?? 0
    if (duration < minDur || duration > maxDur) {
      continue
    }

    // 2. Non-music check
    if (isNonMusicVideo(item.title) || item.isShort || item.isLive) {
      continue
    }

    // 3. Extract Video ID
    const ytId = extractVideoId(item)
    if (!ytId || ytId.length !== 11) {
      continue
    }

    // 4. Clean Artist & Title
    const author = item.uploaderName || item.author || ''
    const { artist, title } = parseArtistAndTitle(item.title, author)

    // 5. Extract best thumbnail
    let coverUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
    if (item.thumbnail) {
      coverUrl = item.thumbnail
    } else if (item.thumbnails && item.thumbnails.length > 0) {
      coverUrl = item.thumbnails[item.thumbnails.length - 1].url
    }

    results.push({
      id: `yt-${ytId}`,
      title,
      artist,
      duration,
      source: 'youtube',
      youtubeId: ytId,
      coverUrl,
      sourceInstance: options.sourceInstance,
    })
  }

  return results
}

