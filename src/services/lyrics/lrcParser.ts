import type { LyricLine, ParsedLyrics } from './types'

// Vocal lead compensation: 180ms (0.18s) early highlight for optimal human reading flow
export const VOCAL_LEAD_OFFSET_SECONDS = 0.18

const LRC_TIMESTAMP_REGEX = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/

/**
 * Parses raw LRC string into structured LyricLine array.
 * Applies +180ms vocal lead offset for display triggering while preserving rawTime for seeking.
 */
export function parseLrcString(lrcContent: string): ParsedLyrics {
  if (!lrcContent || lrcContent.trim().length === 0) {
    return { lines: [], isSynced: false, instrumental: false }
  }

  const rawLines = lrcContent.split('\n')
  const parsedLines: LyricLine[] = []

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim()
    if (!trimmed) continue

    const match = trimmed.match(LRC_TIMESTAMP_REGEX)
    if (!match) continue

    const minutes = parseInt(match[1], 10)
    const seconds = parseInt(match[2], 10)
    const millisStr = match[3] || '0'
    const millis = parseInt(millisStr.padEnd(3, '0').slice(0, 3), 10)

    const rawTime = minutes * 60 + seconds + millis / 1000
    // +180ms vocal lead compensation
    const leadTime = Math.max(0, rawTime - VOCAL_LEAD_OFFSET_SECONDS)

    // Strip timestamp tag to get text
    const text = trimmed.replace(LRC_TIMESTAMP_REGEX, '').trim()

    if (text.length > 0) {
      parsedLines.push({
        time: leadTime,
        rawTime,
        text,
      })
    }
  }

  // Sort lines chronologically
  parsedLines.sort((a, b) => a.rawTime - b.rawTime)

  return {
    lines: parsedLines,
    isSynced: parsedLines.length > 0,
    instrumental: parsedLines.length === 0,
  }
}

/**
 * Finds the index of the currently active lyric line based on playback currentTime.
 */
export function findActiveLyricIndex(lines: LyricLine[], currentTime: number): number {
  if (lines.length === 0) return -1
  if (currentTime < lines[0].time) return -1

  for (let i = lines.length - 1; i >= 0; i--) {
    if (currentTime >= lines[i].time) {
      return i
    }
  }

  return 0
}

