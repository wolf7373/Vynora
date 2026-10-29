import { describe, it, expect } from 'vitest'
import { parseLrcString, findActiveLyricIndex, VOCAL_LEAD_OFFSET_SECONDS } from '@/services/lyrics/lrcParser'

const sampleLrc = `[00:10.50] Line one text
[00:20.00] Line two text
[00:35.80] Line three text
[01:10.00] Line four text`

describe('LRC Parser & +180ms Vocal Lead Sync (Milestone 5)', () => {
  it('parses timestamps and applies +180ms vocal lead offset to trigger display', () => {
    const parsed = parseLrcString(sampleLrc)

    expect(parsed.isSynced).toBe(true)
    expect(parsed.lines).toHaveLength(4)

    // Line 1: rawTime = 10.50s, time = 10.50 - 0.18 = 10.32s
    expect(parsed.lines[0].rawTime).toBeCloseTo(10.5, 2)
    expect(parsed.lines[0].time).toBeCloseTo(10.5 - VOCAL_LEAD_OFFSET_SECONDS, 2)
    expect(parsed.lines[0].text).toBe('Line one text')

    // Line 2: rawTime = 20.00s, time = 19.82s
    expect(parsed.lines[1].rawTime).toBeCloseTo(20.0, 2)
    expect(parsed.lines[1].time).toBeCloseTo(20.0 - VOCAL_LEAD_OFFSET_SECONDS, 2)
    expect(parsed.lines[1].text).toBe('Line two text')

    // Line 4: rawTime = 70.00s (1m10s)
    expect(parsed.lines[3].rawTime).toBeCloseTo(70.0, 2)
    expect(parsed.lines[3].time).toBeCloseTo(70.0 - VOCAL_LEAD_OFFSET_SECONDS, 2)
    expect(parsed.lines[3].text).toBe('Line four text')
  })

  it('tracks active lyric index as currentTime advances', () => {
    const parsed = parseLrcString(sampleLrc)
    const lines = parsed.lines

    // Before any line: < 10.32s
    expect(findActiveLyricIndex(lines, 5.0)).toBe(-1)

    // Line 1: between 10.32s and 19.82s
    expect(findActiveLyricIndex(lines, 10.32)).toBe(0)
    expect(findActiveLyricIndex(lines, 15.0)).toBe(0)

    // Line 2: between 19.82s and 35.62s
    expect(findActiveLyricIndex(lines, 19.85)).toBe(1)
    expect(findActiveLyricIndex(lines, 25.0)).toBe(1)

    // Line 4: after 69.82s
    expect(findActiveLyricIndex(lines, 72.0)).toBe(3)
  })

  it('handles empty or malformed strings gracefully', () => {
    expect(parseLrcString('').lines).toHaveLength(0)
    expect(parseLrcString('Just plain text with no timestamps').lines).toHaveLength(0)
  })
})

