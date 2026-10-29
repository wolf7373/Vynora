export interface LyricLine {
  time: number // in seconds (with +180ms vocal lead offset applied)
  rawTime: number // original timestamp in seconds
  text: string
}

export interface LrcLibResponse {
  id: number
  trackName: string
  artistName: string
  albumName?: string
  duration: number
  instrumental: boolean
  plainLyrics?: string
  syncedLyrics?: string
}

export interface ParsedLyrics {
  lines: LyricLine[]
  plainText?: string
  isSynced: boolean
  instrumental: boolean
}

