import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PlaybackAdapterManager } from '@/adapters/PlaybackAdapterManager'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useQueueStore } from '@/stores/useQueueStore'
import type { Track } from '@/types/track'

const ytTrack1: Track = {
  id: 'yt-1',
  title: 'Starboy',
  artist: 'The Weeknd',
  duration: 230,
  source: 'youtube',
  youtubeId: '34Na4j8AVgA',
}

const ytTrack2: Track = {
  id: 'yt-2',
  title: 'Blinding Lights',
  artist: 'The Weeknd',
  duration: 200,
  source: 'youtube',
  youtubeId: '4NRXx6U8ABQ',
}

const localTrack: Track = {
  id: 'local-1',
  title: 'Local Master WAV',
  artist: 'Studio Artist',
  duration: 150,
  source: 'local',
  audioUrl: 'blob:http://localhost/local.wav',
  isLocal: true,
}

describe('PlaybackAdapterManager', () => {
  let manager: PlaybackAdapterManager

  beforeEach(() => {
    PlaybackAdapterManager.resetInstance()
    usePlayerStore.getState().resetPlayer()
    useQueueStore.getState().clearQueue()

    const mockYTInstance = {
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
      getCurrentTime: vi.fn().mockReturnValue(0),
      getDuration: vi.fn().mockReturnValue(230),
      destroy: vi.fn(),
    }

    class MockYTPlayer {
      constructor(_el: HTMLElement | string, options: { events?: Record<string, Function> }) {
        setTimeout(() => options.events?.onReady?.({ target: mockYTInstance }), 0)
        return mockYTInstance
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

    manager = PlaybackAdapterManager.getInstance()
  })

  afterEach(() => {
    manager.destroy()
  })

  it('routes playback to YouTubeAdapter for YouTube tracks', async () => {
    await manager.playTrack(ytTrack1)

    const activeAdapter = manager.getActiveAdapter()
    expect(activeAdapter).not.toBeNull()
    expect(activeAdapter?.name).toBe('youtube')
    expect(usePlayerStore.getState().currentTrack?.id).toBe('yt-1')
    expect(usePlayerStore.getState().activeSource).toBe('youtube')
    expect(manager.isRealFFT()).toBe(false)
  })

  it('routes playback to WebAudioAdapter for local tracks and sets isRealFFT: true', async () => {
    await manager.playTrack(localTrack)

    const activeAdapter = manager.getActiveAdapter()
    expect(activeAdapter).not.toBeNull()
    expect(activeAdapter?.name).toBe('local')
    expect(usePlayerStore.getState().currentTrack?.id).toBe('local-1')
    expect(usePlayerStore.getState().activeSource).toBe('local')
    expect(manager.isRealFFT()).toBe(true)
  })

  it('Zero Audio Overlap: pauses active adapter when switching between different sources', async () => {
    await manager.playTrack(localTrack)
    const localAdapter = manager.getActiveAdapter()
    const pauseSpy = vi.spyOn(localAdapter!, 'pause')

    // Switch to YouTube
    await manager.playTrack(ytTrack1)

    expect(pauseSpy).toHaveBeenCalled()
    expect(manager.getActiveAdapter()?.name).toBe('youtube')
  })

  describe('REG-02: Track advancement only on native ENDED event', () => {
    it('advances to next track when repeatMode is off and stops at end of queue', async () => {
      useQueueStore.getState().setQueue([ytTrack1, ytTrack2], 0)
      usePlayerStore.getState().setRepeatMode('off')
      usePlayerStore.getState().setIsAutoplay(false)

      await manager.playTrack(ytTrack1)

      // Simulate native ended
      await (manager as unknown as { handleTrackEnded: () => Promise<void> }).handleTrackEnded()

      expect(usePlayerStore.getState().currentTrack?.id).toBe('yt-2')

      // Second song ends
      await (manager as unknown as { handleTrackEnded: () => Promise<void> }).handleTrackEnded()

      // At end of queue, playback stops
      expect(usePlayerStore.getState().status).toBe('ended')
    })

    it('loops back to index 0 when repeatMode is all', async () => {
      useQueueStore.getState().setQueue([ytTrack1, ytTrack2], 1) // start at track 2
      usePlayerStore.getState().setRepeatMode('all')

      await manager.playTrack(ytTrack2)

      // Track 2 ends -> should loop to track 1
      await (manager as unknown as { handleTrackEnded: () => Promise<void> }).handleTrackEnded()

      expect(usePlayerStore.getState().currentTrack?.id).toBe('yt-1')
    })

    it('re-plays same track when repeatMode is one', async () => {
      useQueueStore.getState().setQueue([ytTrack1, ytTrack2], 0)
      usePlayerStore.getState().setRepeatMode('one')

      await manager.playTrack(ytTrack1)
      const seekSpy = vi.spyOn(manager, 'seek')
      const playSpy = vi.spyOn(manager, 'play')

      await (manager as unknown as { handleTrackEnded: () => Promise<void> }).handleTrackEnded()

      expect(seekSpy).toHaveBeenCalledWith(0)
      expect(playSpy).toHaveBeenCalled()
      expect(usePlayerStore.getState().currentTrack?.id).toBe('yt-1')
    })

    it('does NOT advance track on timer estimations (REG-02)', async () => {
      useQueueStore.getState().setQueue([ytTrack1, ytTrack2], 0)
      await manager.playTrack(ytTrack1)

      // Simulate timer ticking close to duration: currentTime >= duration - 0.5
      usePlayerStore.getState().setCurrentTime(229.8) // duration is 230
      usePlayerStore.getState().setDuration(230)

      // Track should still be ytTrack1
      expect(usePlayerStore.getState().currentTrack?.id).toBe('yt-1')
      expect(useQueueStore.getState().currentIndex).toBe(0)
    })
  })
})
