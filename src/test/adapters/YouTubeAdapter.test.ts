import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { YouTubeAdapter, type YTPlayerInstance } from '@/adapters/YouTubeAdapter'
import type { AdapterCallbacks } from '@/adapters/types'
import type { Track } from '@/types/track'

const sampleYTTrack: Track = {
  id: 'yt-song-1',
  title: 'Starboy',
  artist: 'The Weeknd',
  duration: 230,
  source: 'youtube',
  youtubeId: '34Na4j8AVgA',
}

describe('YouTubeAdapter (Singleton Iframe + postMessage bus)', () => {
  let callbacks: AdapterCallbacks
  let adapter: YouTubeAdapter
  let mockPlayerInstance: YTPlayerInstance
  let playerEvents: Record<string, Function> = {}

  beforeEach(() => {
    playerEvents = {}
    mockPlayerInstance = {
      loadVideoById: vi.fn(),
      cueVideoById: vi.fn(),
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      stopVideo: vi.fn(),
      seekTo: vi.fn(),
      setVolume: vi.fn(),
      getVolume: vi.fn().mockReturnValue(70),
      setPlaybackRate: vi.fn(),
      getPlaybackRate: vi.fn().mockReturnValue(1),
      getPlayerState: vi.fn().mockReturnValue(1),
      getCurrentTime: vi.fn().mockReturnValue(120),
      getDuration: vi.fn().mockReturnValue(230),
      destroy: vi.fn(),
    }

    class MockYTPlayer {
      constructor(_el: HTMLElement | string, options: { events?: Record<string, Function> }) {
        playerEvents = options.events || {}
        setTimeout(() => {
          playerEvents.onReady?.({ target: mockPlayerInstance })
        }, 0)
        return mockPlayerInstance
      }
    }

    window.YT = {
      Player: MockYTPlayer as unknown as typeof window.YT.Player,
      PlayerState: {
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5,
      },
    }

    callbacks = {
      onStateChange: vi.fn(),
      onTimeUpdate: vi.fn(),
      onDurationChange: vi.fn(),
      onEnded: vi.fn(),
      onError: vi.fn(),
    }

    adapter = new YouTubeAdapter(callbacks, 'test-yt-container')
  })

  afterEach(() => {
    adapter.destroy()
  })

  it('identifies as youtube source and reports isRealFFT: false (REG-08)', () => {
    expect(adapter.name).toBe('youtube')
    expect(adapter.isRealFFT()).toBe(false)
  })

  it('generates 64-bin simulated beat FFT data for WebGL visualizer (REG-08)', () => {
    const simData = adapter.getAudioData()
    expect(simData).toBeInstanceOf(Uint8Array)
    expect(simData.length).toBe(64)
  })

  it('loads track and delegates to loadVideoById with youtubeId', async () => {
    await adapter.loadTrack(sampleYTTrack)
    expect(mockPlayerInstance.loadVideoById).toHaveBeenCalledWith('34Na4j8AVgA')
    expect(callbacks.onStateChange).toHaveBeenCalledWith('loading')
  })

  it('handles player controls: play, pause, seek, volume, playback rate', async () => {
    await adapter.loadTrack(sampleYTTrack)

    await adapter.play()
    expect(mockPlayerInstance.playVideo).toHaveBeenCalled()

    await adapter.pause()
    expect(mockPlayerInstance.pauseVideo).toHaveBeenCalled()

    await adapter.seek(80)
    expect(mockPlayerInstance.seekTo).toHaveBeenCalledWith(80, true)

    adapter.setVolume(0.7)
    expect(mockPlayerInstance.setVolume).toHaveBeenCalledWith(70)

    adapter.setPlaybackRate(1.5)
    expect(mockPlayerInstance.setPlaybackRate).toHaveBeenCalledWith(1.5)
  })

  it('handles playback state transitions correctly', async () => {
    await adapter.loadTrack(sampleYTTrack)

    // PLAYING state
    playerEvents.onStateChange?.({ data: window.YT.PlayerState.PLAYING })
    expect(callbacks.onStateChange).toHaveBeenCalledWith('playing')

    // PAUSED state
    playerEvents.onStateChange?.({ data: window.YT.PlayerState.PAUSED })
    expect(callbacks.onStateChange).toHaveBeenCalledWith('paused')

    // BUFFERING state
    playerEvents.onStateChange?.({ data: window.YT.PlayerState.BUFFERING })
    expect(callbacks.onStateChange).toHaveBeenCalledWith('buffering')
  })

  it('REG-02: triggers onEnded strictly on native YT.PlayerState.ENDED (0)', async () => {
    await adapter.loadTrack(sampleYTTrack)

    playerEvents.onStateChange?.({ data: window.YT.PlayerState.ENDED })
    expect(callbacks.onStateChange).toHaveBeenCalledWith('ended')
    expect(callbacks.onEnded).toHaveBeenCalledTimes(1)
  })

  it('handles YouTube player error codes gracefully', async () => {
    await adapter.loadTrack(sampleYTTrack)

    playerEvents.onError?.({ data: 100 })
    expect(callbacks.onError).toHaveBeenCalledWith('Requested YouTube track not found or removed')

    playerEvents.onError?.({ data: 150 })
    expect(callbacks.onError).toHaveBeenCalledWith('Video owner does not allow embedded playback')
  })
})
