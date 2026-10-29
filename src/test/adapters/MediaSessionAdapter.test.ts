import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MediaSessionAdapter, type MediaSessionControls } from '@/adapters/MediaSessionAdapter'
import type { Track } from '@/types/track'

const sampleTrack: Track = {
  id: 'ms-track-1',
  title: 'Starboy',
  artist: 'The Weeknd',
  album: 'Starboy Deluxe',
  duration: 230,
  source: 'youtube',
  youtubeId: '34Na4j8AVgA',
  coverUrl: 'https://img.youtube.com/vi/34Na4j8AVgA/hqdefault.jpg',
}

describe('MediaSessionAdapter (Browser lock screen & notification controls)', () => {
  let adapter: MediaSessionAdapter
  let controls: {
    onPlay: ReturnType<typeof vi.fn>
    onPause: ReturnType<typeof vi.fn>
    onNext: ReturnType<typeof vi.fn>
    onPrevious: ReturnType<typeof vi.fn>
    onSeek: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    controls = {
      onPlay: vi.fn(),
      onPause: vi.fn(),
      onNext: vi.fn(),
      onPrevious: vi.fn(),
      onSeek: vi.fn(),
    }
    adapter = new MediaSessionAdapter()
    adapter.init(controls as unknown as MediaSessionControls)
  })

  afterEach(() => {
    adapter.destroy()
  })

  it('updates metadata with track title, artist, album and artwork', () => {
    adapter.updateMetadata(sampleTrack)

    expect(navigator.mediaSession.metadata).not.toBeNull()
    expect(navigator.mediaSession.metadata?.title).toBe('Starboy')
    expect(navigator.mediaSession.metadata?.artist).toBe('The Weeknd')
    expect(navigator.mediaSession.metadata?.album).toBe('Starboy Deluxe')
  })

  it('clears metadata when track is null', () => {
    adapter.updateMetadata(null)
    expect(navigator.mediaSession.metadata).toBeNull()
  })

  it('updates playback state to playing and paused', () => {
    adapter.updatePlaybackState(true)
    expect(navigator.mediaSession.playbackState).toBe('playing')

    adapter.updatePlaybackState(false)
    expect(navigator.mediaSession.playbackState).toBe('paused')
  })
})
