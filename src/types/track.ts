export type TrackSource = 'youtube' | 'local' | 'stream'

export interface Track {
  id: string
  title: string
  artist: string
  album?: string
  duration: number // in seconds
  source: TrackSource
  youtubeId?: string
  audioUrl?: string
  coverUrl?: string
  lyrics?: string
  syncedLyrics?: Array<{ time: number; text: string }>
  isLocal?: boolean
  createdAt?: number
  genre?: string
  year?: number
  color?: string
  bpm?: number
  style?: string
  playlistId?: string
  isLiked?: boolean
}

// Known canonical mappings for Regression Guardrail REG-01
export const KNOWN_CANONICAL_TRACKS: Record<string, { title: string; artist: string; youtubeId: string }> = {
  'punj-295': {
    title: '295',
    artist: 'Sidhu Moose Wala',
    youtubeId: 'n_FCrCQ6-bA',
  },
  'punj-cheques': {
    title: 'Cheques',
    artist: 'Shubh',
    youtubeId: '4tywp83zkmk',
  },
}

/**
 * Strict validator for Track objects.
 * Validates fields and ensures REG-01 (track IDs and YouTube ID mapping) is preserved.
 */
export function isValidTrack(track: unknown): track is Track {
  if (!track || typeof track !== 'object') return false
  const t = track as Partial<Track>

  if (typeof t.id !== 'string' || t.id.trim() === '') return false
  if (typeof t.title !== 'string' || t.title.trim() === '') return false
  if (typeof t.artist !== 'string' || t.artist.trim() === '') return false
  if (typeof t.duration !== 'number' || isNaN(t.duration) || t.duration < 0) return false
  if (!t.source || !['youtube', 'local', 'stream'].includes(t.source)) return false

  // For YouTube tracks, youtubeId must be non-empty string
  if (t.source === 'youtube') {
    if (typeof t.youtubeId !== 'string' || t.youtubeId.trim().length === 0) {
      return false
    }
  }

  // REG-01 regression check: Known tracks must not have swapped youtubeId
  const canonical = KNOWN_CANONICAL_TRACKS[t.id]
  if (canonical && t.youtubeId && t.youtubeId !== canonical.youtubeId) {
    return false
  }

  return true
}

