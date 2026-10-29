import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'

// Mock HTMLMediaElement methods in jsdom
if (typeof window !== 'undefined') {
  if (typeof URL !== 'undefined' && !URL.createObjectURL) {
    URL.createObjectURL = () => 'blob:mock-url-' + Math.random().toString(36).substring(2, 7)
    URL.revokeObjectURL = () => {}
  }
  window.HTMLElement.prototype.scrollIntoView = () => {}
  window.HTMLMediaElement.prototype.load = () => {}
  window.HTMLMediaElement.prototype.play = async () => {}
  window.HTMLMediaElement.prototype.pause = () => {}

  // Mock AudioContext & AnalyserNode
  if (!window.AudioContext) {
    class MockAnalyserNode {
      fftSize = 128
      frequencyBinCount = 64
      smoothingTimeConstant = 0.8
      connect() {}
      disconnect() {}
      getByteFrequencyData(array: Uint8Array) {
        for (let i = 0; i < array.length; i++) {
          array[i] = 128
        }
      }
    }

    class MockGainNode {
      gain = {
        value: 1.0,
        setValueAtTime: vi.fn(),
      }
      connect() {}
      disconnect() {}
    }

    class MockAudioContext {
      state = 'running'
      currentTime = 0
      destination = {}
      createAnalyser() {
        return new MockAnalyserNode()
      }
      createGain() {
        return new MockGainNode()
      }
      createDynamicsCompressor() {
        return {
          threshold: { setValueAtTime: vi.fn(), value: -1 },
          knee: { setValueAtTime: vi.fn(), value: 4 },
          ratio: { setValueAtTime: vi.fn(), value: 12 },
          attack: { setValueAtTime: vi.fn(), value: 0.003 },
          release: { setValueAtTime: vi.fn(), value: 0.25 },
          connect() {},
          disconnect() {},
        }
      }
      createMediaElementSource() {
        return {
          connect() {},
          disconnect() {},
        }
      }
      async resume() {}
      async close() {
        this.state = 'closed'
      }
    }

    // @ts-expect-error mock window.AudioContext
    window.AudioContext = MockAudioContext
  }

  // Mock MediaMetadata
  if (typeof MediaMetadata === 'undefined') {
    class MockMediaMetadata {
      title: string
      artist: string
      album: string
      artwork: Array<{ src: string; sizes: string; type: string }>
      constructor(init: { title?: string; artist?: string; album?: string; artwork?: Array<{ src: string; sizes: string; type: string }> }) {
        this.title = init.title || ''
        this.artist = init.artist || ''
        this.album = init.album || ''
        this.artwork = init.artwork || []
      }
    }
    // @ts-expect-error mock MediaMetadata
    window.MediaMetadata = MockMediaMetadata
    // @ts-expect-error mock globalThis MediaMetadata
    globalThis.MediaMetadata = MockMediaMetadata
  }

  // Mock navigator.mediaSession
  if (!('mediaSession' in navigator)) {
    const actionHandlers = new Map<string, Function>()
    // @ts-expect-error mock mediaSession
    navigator.mediaSession = {
      metadata: null,
      playbackState: 'none',
      setActionHandler: (action: string, handler: Function | null) => {
        if (handler) {
          actionHandlers.set(action, handler)
        } else {
          actionHandlers.delete(action)
        }
      },
      setPositionState: () => {},
    }
  }

  // Mock fetch default for node test environment to prevent network hanging
  globalThis.fetch = () => {
    return Promise.reject(new Error('Test network disabled: fallback instantly'))
  }
}
