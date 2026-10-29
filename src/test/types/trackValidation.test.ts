import { describe, it, expect } from 'vitest'
import { isValidTrack, KNOWN_CANONICAL_TRACKS, type Track } from '@/types/track'

describe('Track Schema & REG-01 Regression Guardrails', () => {
  it('validates a correct YouTube track', () => {
    const validTrack: Track = {
      id: 'track-1',
      title: 'Maula Mere Maula',
      artist: 'Roop Kumar Rathod',
      duration: 350,
      source: 'youtube',
      youtubeId: 'Ww_6k9ZvxoM',
    }
    expect(isValidTrack(validTrack)).toBe(true)
  })

  it('validates a correct Local audio track', () => {
    const localTrack: Track = {
      id: 'local-1',
      title: 'Studio Master Mix',
      artist: 'Local Artist',
      duration: 180,
      source: 'local',
      audioUrl: 'blob:http://localhost:5173/mock-audio',
      isLocal: true,
    }
    expect(isValidTrack(localTrack)).toBe(true)
  })

  it('rejects invalid tracks with missing title or negative duration', () => {
    expect(isValidTrack(null)).toBe(false)
    expect(isValidTrack({})).toBe(false)
    expect(isValidTrack({ id: '1', title: '', artist: 'A', duration: 100, source: 'youtube', youtubeId: 'abc' })).toBe(false)
    expect(isValidTrack({ id: '1', title: 'Song', artist: '', duration: 100, source: 'youtube', youtubeId: 'abc' })).toBe(false)
    expect(isValidTrack({ id: '1', title: 'Song', artist: 'A', duration: -10, source: 'youtube', youtubeId: 'abc' })).toBe(false)
    expect(isValidTrack({ id: '1', title: 'Song', artist: 'A', duration: 100, source: 'unknown' })).toBe(false)
  })

  it('rejects YouTube track without a youtubeId', () => {
    const missingYT: Track = {
      id: 'track-no-yt',
      title: 'YouTube Track',
      artist: 'Artist',
      duration: 200,
      source: 'youtube',
    }
    expect(isValidTrack(missingYT)).toBe(false)
  })

  it('enforces REG-01: prevents swapped YouTube track IDs on known canonical tracks', () => {
    // Correct canonical mapping
    const correct295: Track = {
      id: 'punj-295',
      title: '295',
      artist: 'Sidhu Moose Wala',
      duration: 270,
      source: 'youtube',
      youtubeId: KNOWN_CANONICAL_TRACKS['punj-295'].youtubeId, // n_FCrCQ6-bA
    }
    expect(isValidTrack(correct295)).toBe(true)

    // Swapped ID bug (REG-01)
    const swapped295: Track = {
      id: 'punj-295',
      title: '295',
      artist: 'Sidhu Moose Wala',
      duration: 270,
      source: 'youtube',
      youtubeId: '4tywp83zkmk', // Swapped with Cheques!
    }
    expect(isValidTrack(swapped295)).toBe(false)

    // Correct canonical cheques
    const correctCheques: Track = {
      id: 'punj-cheques',
      title: 'Cheques',
      artist: 'Shubh',
      duration: 185,
      source: 'youtube',
      youtubeId: KNOWN_CANONICAL_TRACKS['punj-cheques'].youtubeId, // 4tywp83zkmk
    }
    expect(isValidTrack(correctCheques)).toBe(true)

    // Swapped cheques
    const swappedCheques: Track = {
      id: 'punj-cheques',
      title: 'Cheques',
      artist: 'Shubh',
      duration: 185,
      source: 'youtube',
      youtubeId: 'n_FCrCQ6-bA', // Swapped with 295!
    }
    expect(isValidTrack(swappedCheques)).toBe(false)
  })
})

