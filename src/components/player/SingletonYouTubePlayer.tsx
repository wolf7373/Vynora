import React, { useEffect, useRef, useState, useCallback } from 'react'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useUIStore } from '@/stores/useUIStore'
import { PlaybackAdapterManager } from '@/adapters'
import { Minimize2 } from 'lucide-react'

// High-compatibility 1-second silent WAV base64 data URI
const SILENT_WAV_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'

interface AnchorRect {
  top: number
  left: number
  width: number
  height: number
  visible: boolean
}

export const SingletonYouTubePlayer: React.FC = () => {
  const { currentTrack, isPlaying, volume, isMuted, activeSource } = usePlayerStore()
  const { rightSidebarView, isMobileDrawerOpen, mobileDrawerTab } = useUIStore()

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const bgAudioRef = useRef<HTMLAudioElement | null>(null)
  const wakeLockRef = useRef<any>(null)
  const lastReportedTimeRef = useRef<number>(0)
  const lastErrorSkipRef = useRef<number>(0)
  const lastTrackEndedRef = useRef<number>(0)
  const autoErrorSkipCountRef = useRef<number>(0)
  const prevYoutubeIdRef = useRef<string>(currentTrack?.youtubeId || '')

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [targetRect, setTargetRect] = useState<AnchorRect>({
    top: -9999,
    left: -9999,
    width: 1,
    height: 1,
    visible: false,
  })

  const youtubeId = currentTrack?.youtubeId || ''

  // 1. Silent Audio Background Loop & Screen Wake Lock for Mobile Background Playback
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!bgAudioRef.current) {
      const audio = new Audio(SILENT_WAV_URI)
      audio.loop = true
      audio.volume = 0.001
      bgAudioRef.current = audio
    }

    if (isPlaying && youtubeId) {
      // Play silent loop to register active audio session with mobile OS
      bgAudioRef.current.play().catch(() => {})

      // Request screen wake lock if supported
      if ('wakeLock' in navigator && !wakeLockRef.current) {
        navigator.wakeLock
          .request('screen')
          .then((lock) => {
            wakeLockRef.current = lock
            lock.addEventListener('release', () => {
              wakeLockRef.current = null
            })
          })
          .catch(() => {})
      }
    } else {
      if (bgAudioRef.current && !bgAudioRef.current.paused) {
        bgAudioRef.current.pause()
      }
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
        wakeLockRef.current = null
      }
    }

    // Phone Screen Lock & Tab Visibility listener:
    // When screen locks or user switches apps, ensure audio loop stays active and iframe keeps playing
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (usePlayerStore.getState().isPlaying && bgAudioRef.current) {
          bgAudioRef.current.play().catch(() => {})
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
              '*'
            )
          }
        }
      } else if (document.visibilityState === 'visible') {
        if (usePlayerStore.getState().isPlaying && 'wakeLock' in navigator && !wakeLockRef.current) {
          navigator.wakeLock
            .request('screen')
            .then((lock) => {
              wakeLockRef.current = lock
            })
            .catch(() => {})
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
        wakeLockRef.current = null
      }
    }
  }, [isPlaying, youtubeId])

  // 2. Measure & Track Visible Anchor Slot (Desktop Dock vs Mobile Drawer)
  const updatePosition = useCallback(() => {
    if (isFullscreen) {
      setTargetRect({
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        visible: true,
      })
      return
    }

    let anchor: HTMLElement | null = null
    if (isMobileDrawerOpen && mobileDrawerTab === 'video') {
      anchor = document.getElementById('vynora-drawer-video-anchor')
    } else if (rightSidebarView === 'video' && !isMobileDrawerOpen) {
      anchor = document.getElementById('vynora-dock-video-anchor')
    }

    if (anchor) {
      const rect = anchor.getBoundingClientRect()
      if (rect.width > 20 && rect.height > 20) {
        setTargetRect({
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          visible: true,
        })
        return
      }
    }

    // Default: Offscreen background positioning
    setTargetRect({
      top: -9999,
      left: -9999,
      width: 1,
      height: 1,
      visible: false,
    })
  }, [isFullscreen, isMobileDrawerOpen, mobileDrawerTab, rightSidebarView])

  useEffect(() => {
    updatePosition()
    const handleResize = () => updatePosition()
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize, true)

    const interval = setInterval(updatePosition, 300)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize, true)
      clearInterval(interval)
    }
  }, [updatePosition])

  // 3. YouTube Iframe 2-Way Message Bus (Synchronizing Video <-> Bottom Bar <-> Player Store)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (!event.data) return
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data

        // Auto-advance strictly if YouTube is the active audio source AND a genuine positive error code occurred
        const hasRealErrorCode = typeof data.info?.errorCode === 'number' && data.info.errorCode > 0
        const isRealError = data.event === 'onError' || hasRealErrorCode

        if (isRealError) {
          const activeSource = usePlayerStore.getState().activeSource
          const now = Date.now()

          // If the track is playing direct studio audio (WebAudio), do NOT skip the song
          if (activeSource !== 'youtube') {
            console.warn('[SingletonYT] Video stream unavailable for direct-audio track, preserving audio playback.')
            return
          }

          // Strict Skip Guard: Allow at most 1 automatic skip, debounced by 3s, NEVER cascade
          if (now - lastErrorSkipRef.current > 3000 && autoErrorSkipCountRef.current < 1) {
            lastErrorSkipRef.current = now
            autoErrorSkipCountRef.current += 1
            console.warn('[SingletonYT] YouTube playback error (code:', data.info?.errorCode || data.data, '), advancing to next track...')
            PlaybackAdapterManager.getInstance().playNext()
          } else {
            console.warn('[SingletonYT] Auto-advance halted to prevent infinite loop. Pausing playback.')
            usePlayerStore.getState().setIsPlaying(false)
            usePlayerStore.getState().setStatus('paused')
          }
          return
        }

        // Play / Pause / Ended state synchronization
        if (
          data.event === 'onStateChange' ||
          (data.event === 'infoDelivery' && data.info?.playerState !== undefined)
        ) {
          const state =
            data.info?.playerState !== undefined ? data.info.playerState : data.info
          if (state === 1) {
            // Playing - reset error skip counter on successful playback
            autoErrorSkipCountRef.current = 0
            if (!usePlayerStore.getState().isPlaying) {
              usePlayerStore.getState().setIsPlaying(true)
              usePlayerStore.getState().setStatus('playing')
              PlaybackAdapterManager.getInstance().getMediaSession().updatePlaybackState(true)
            }
          } else if (state === 2) {
            // Paused: Accurately reflect paused state so UI doesn't fake silent playback
            if (usePlayerStore.getState().isPlaying) {
              usePlayerStore.getState().setIsPlaying(false)
              usePlayerStore.getState().setStatus('paused')
              PlaybackAdapterManager.getInstance().getMediaSession().updatePlaybackState(false)
            }
          } else if (state === 0) {
            // REG-02: Native YouTube Track Advancement on ENDED with duplicate suppression
            const now = Date.now()
            if (now - lastTrackEndedRef.current > 1500) {
              lastTrackEndedRef.current = now
              autoErrorSkipCountRef.current = 0
              PlaybackAdapterManager.getInstance().playNext()
            }
          }
        }

        // Live Current Time & Duration synchronization
        if (data.event === 'infoDelivery' && typeof data.info?.currentTime === 'number') {
          const curTime = Math.round(data.info.currentTime * 10) / 10
          if (Math.abs(curTime - lastReportedTimeRef.current) >= 0.5) {
            lastReportedTimeRef.current = curTime
            usePlayerStore.getState().setCurrentTime(curTime)
            const duration = usePlayerStore.getState().duration
            PlaybackAdapterManager.getInstance().getMediaSession().updatePositionState(curTime, duration)
          }
        }

        if (data.event === 'infoDelivery' && typeof data.info?.duration === 'number' && data.info.duration > 0) {
          const dur = Math.round(data.info.duration)
          if (dur !== usePlayerStore.getState().duration) {
            usePlayerStore.getState().setDuration(dur)
          }
        }

        // Volume & Mute synchronization if adjusted inside YouTube player controls (only when YouTube is the primary audio source)
        if (data.event === 'infoDelivery' && typeof data.info?.volume === 'number') {
          if (usePlayerStore.getState().activeSource !== 'youtube') return
          const ytVol = data.info.volume / 100
          const ytMuted = Boolean(data.info.muted || ytVol === 0)
          if (ytMuted && !usePlayerStore.getState().isMuted) {
            usePlayerStore.getState().setVolume(0)
          } else if (!ytMuted && Math.abs(ytVol - usePlayerStore.getState().volume) > 0.05) {
            usePlayerStore.getState().setVolume(ytVol)
          }
        }
      } catch {}
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // 4. Periodically Ping Iframe to ensure listening state
  useEffect(() => {
    if (!youtubeId || !isPlaying) return
    const interval = setInterval(() => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), '*')
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [youtubeId, isPlaying])

  // 5. Volume and Play/Pause command sync to singleton iframe
  // Strictly enforce 100% mute when playing direct studio audio (activeSource !== 'youtube') to prevent dual audio
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      const isYTAudio = activeSource === 'youtube'
      const vol = (isMuted || !isYTAudio) ? 0 : Math.round(volume * 100)

      if (!isYTAudio || isMuted || vol === 0) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'mute', args: [] }),
          '*'
        )
      } else {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
          '*'
        )
      }

      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setVolume', args: [vol] }),
        '*'
      )
    }
  }, [volume, isMuted, activeSource])

  // Seamless track transition without iframe destruction/re-creation
  useEffect(() => {
    if (!youtubeId) return
    if (prevYoutubeIdRef.current !== youtubeId) {
      prevYoutubeIdRef.current = youtubeId
      if (iframeRef.current?.contentWindow) {
        try {
          const isYTAudio = activeSource === 'youtube'
          if (!isYTAudio) {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'mute', args: [] }),
              '*'
            )
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'setVolume', args: [0] }),
              '*'
            )
          }
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'loadVideoById', args: [youtubeId] }),
            '*'
          )
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
            '*'
          )
        } catch {}
      }
    }
  }, [youtubeId, activeSource])

  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    try {
      e.currentTarget.contentWindow?.postMessage(JSON.stringify({ event: 'listening' }), '*')
    } catch {}
  }

  // Fullscreen Esc key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  if (!youtubeId) {
    return (
      <div
        id="vynora-singleton-yt-host"
        className="fixed -top-[9999px] -left-[9999px] w-[1px] h-[1px] opacity-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      />
    )
  }

  const containerStyle: React.CSSProperties = targetRect.visible
    ? {
        position: 'fixed',
        top: `${targetRect.top}px`,
        left: `${targetRect.left}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
        zIndex: isFullscreen ? 100 : isMobileDrawerOpen ? 75 : 35,
        borderRadius: isFullscreen ? '0px' : isMobileDrawerOpen ? '16px' : '12px',
        overflow: 'hidden',
        pointerEvents: 'auto',
        opacity: 1,
        transition: 'border-radius 0.2s ease',
      }
    : {
        position: 'fixed',
        top: '-9999px',
        left: '-9999px',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }

  return (
    <div
      id="vynora-singleton-yt-host"
      style={containerStyle}
      className="bg-black shadow-2xl flex flex-col group select-none"
    >
      {/* Fullscreen Overlay Controls Bar (Visible only on hover when fullscreen) */}
      {isFullscreen && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsFullscreen(false)}
            className="min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            title="Exit Fullscreen (Esc)"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Exit Fullscreen</span>
          </button>
        </div>
      )}

      {/* Singleton YouTube Iframe */}
      <iframe
        id="youtube-player-iframe"
        ref={iframeRef}
        key="vynora-single-yt-iframe"
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&enablejsapi=1&rel=0&playsinline=1&mute=${activeSource === 'youtube' && !isMuted ? 0 : 1}&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
        title={currentTrack?.title || 'Vynora Singleton YouTube Player'}
        onLoad={handleIframeLoad}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen={true}
        className="w-full h-full border-none flex-1 bg-black"
      />
    </div>
  )
}
