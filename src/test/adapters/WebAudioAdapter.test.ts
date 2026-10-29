import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WebAudioAdapter } from '@/adapters/WebAudioAdapter'
import type { AdapterCallbacks } from '@/adapters/types'
import type { Track } from '@/types/track'

const sampleLocalTrack: Track = {
  id: 'local-mp3-1',
  title: 'Synthwave Sunset',
  artist: 'Nightdrive',
  duration: 215,
  source: 'local',
  audioUrl: 'blob:http://localhost:5173/synthwave.mp3',
  isLocal: true,
}

describe('WebAudioAdapter (HTML5 Audio + 64-bin AnalyserNode)', () => {
  let callbacks: AdapterCallbacks
  let adapter: WebAudioAdapter

  beforeEach(() => {
    callbacks = {
      onStateChange: vi.fn(),
      onTimeUpdate: vi.fn(),
      onDurationChange: vi.fn(),
      onEnded: vi.fn(),
      onError: vi.fn(),
    }
    adapter = new WebAudioAdapter(callbacks)
  })

  afterEach(() => {
    adapter.destroy()
  })

  it('identifies as local source and reports isRealFFT: true (REG-08)', () => {
    expect(adapter.name).toBe('local')
    expect(adapter.isRealFFT()).toBe(true)
  })

  it('initializes and loads a local audio track', async () => {
    await adapter.loadTrack(sampleLocalTrack)
    expect(callbacks.onStateChange).toHaveBeenCalledWith('loading')
    expect(adapter.getDuration()).toBe(215)
  })

  it('handles play, pause, seek, volume, and playback rate', async () => {
    await adapter.loadTrack(sampleLocalTrack)

    await adapter.play()
    await adapter.pause()
    await adapter.seek(50)
    expect(adapter.getCurrentTime()).toBe(50)

    adapter.setVolume(0.5)
    adapter.setPlaybackRate(1.25)
  })

  it('provides 64-bin FFT frequency data from AnalyserNode', async () => {
    await adapter.loadTrack(sampleLocalTrack)
    const audioData = adapter.getAudioData()

    expect(audioData).toBeInstanceOf(Uint8Array)
    expect(audioData.length).toBe(64)
  })

  it('REG-02: triggers onEnded callback strictly on native ended event', async () => {
    await adapter.loadTrack(sampleLocalTrack)

    // Simulate native ended event on audio element
    // Access internal audio element or dispatch event
    const audioEl = (adapter as unknown as { audio: HTMLAudioElement }).audio
    expect(audioEl).toBeTruthy()

    audioEl.dispatchEvent(new Event('ended'))

    expect(callbacks.onStateChange).toHaveBeenCalledWith('ended')
    expect(callbacks.onEnded).toHaveBeenCalledTimes(1)
  })
})

