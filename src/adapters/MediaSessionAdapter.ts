import type { Track } from '@/types'

export interface MediaSessionControls {
  onPlay: () => void
  onPause: () => void
  onNext: () => void
  onPrevious: () => void
  onSeek: (position: number) => void
}

export class MediaSessionAdapter {
  private controls: MediaSessionControls | null = null

  init(controls: MediaSessionControls): void {
    this.controls = controls
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        this.controls?.onPlay()
      })

      navigator.mediaSession.setActionHandler('pause', () => {
        this.controls?.onPause()
      })

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        this.controls?.onPrevious()
      })

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        this.controls?.onNext()
      })

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (typeof details.seekTime === 'number') {
          this.controls?.onSeek(details.seekTime)
        }
      })

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset || 10
        this.controls?.onSeek(-offset)
      })

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const offset = details.seekOffset || 10
        this.controls?.onSeek(offset)
      })
    } catch {
      // Ignore unsupported media session actions
    }
  }

  updateMetadata(track: Track | null): void {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return

    if (!track) {
      navigator.mediaSession.metadata = null
      return
    }

    const artwork = track.coverUrl
      ? [
          { src: track.coverUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: track.coverUrl, sizes: '128x128', type: 'image/jpeg' },
          { src: track.coverUrl, sizes: '256x256', type: 'image/jpeg' },
          { src: track.coverUrl, sizes: '512x512', type: 'image/jpeg' },
        ]
      : [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ]

    const MetaClass = typeof MediaMetadata !== 'undefined' ? MediaMetadata : (window as unknown as { MediaMetadata: typeof MediaMetadata })?.MediaMetadata
    if (MetaClass) {
      navigator.mediaSession.metadata = new MetaClass({
        title: track.title,
        artist: track.artist,
        album: track.album || 'Vynora Studio',
        artwork,
      })
    }
  }

  updatePlaybackState(isPlaying: boolean): void {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
  }

  updatePositionState(position: number, duration: number, playbackRate = 1.0): void {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return
    if (!('setPositionState' in navigator.mediaSession)) return

    if (duration > 0 && position <= duration) {
      try {
        navigator.mediaSession.setPositionState({
          duration,
          playbackRate,
          position: Math.max(0, position),
        })
      } catch {
        // Ignore position state error
      }
    }
  }

  destroy(): void {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return
    const actions: MediaSessionAction[] = [
      'play',
      'pause',
      'previoustrack',
      'nexttrack',
      'seekto',
      'seekbackward',
      'seekforward',
    ]

    actions.forEach((action) => {
      try {
        navigator.mediaSession.setActionHandler(action, null)
      } catch {
        // Ignore unregister error
      }
    })
    navigator.mediaSession.metadata = null
    this.controls = null
  }
}
