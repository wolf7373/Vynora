import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Drawer } from 'vaul'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Mic2,
  Tv,
  Music,
  Disc3,
  Heart,
  ChevronDown,
  Clock,
  Sliders,
  ListMusic,
  Sparkles,
  Loader2,
  Volume2,
  Volume1,
  VolumeX,
  Download,
} from 'lucide-react'
import { PWAInstallModal } from '@/components/modals/PWAInstallModal'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useUIStore } from '@/stores/useUIStore'
import { usePlaylistStore } from '@/stores/usePlaylistStore'
import { useQueueStore } from '@/stores/useQueueStore'
import { PlaybackAdapterManager } from '@/adapters'
import { formatTime } from '@/utils/formatTime'
import { extractColorFromImage, type ExtractedPalette, createPaletteFromHex } from '@/utils/colorExtractor'
import { lrcLibClient, findActiveLyricIndex, type ParsedLyrics } from '@/services/lyrics'

export const MobileNowPlayingDrawer: React.FC = () => {
  const {
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    setIsQueueDrawerOpen,
    setIsSleepTimerOpen,
    setIsPlaybackSettingsOpen,
    setMobileDrawerTab,
  } = useUIStore()

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
    cycleRepeatMode,
    toggleShuffle,
    setVolume,
    toggleMute,
  } = usePlayerStore()

  const { toggleLikeTrack, isLiked } = usePlaylistStore()
  const queue = useQueueStore((state) => state.queue)
  const adapterManager = PlaybackAdapterManager.getInstance()
  const isRealFFT = adapterManager.isRealFFT()

  // Drawer View Tabs: 'visualizer' | 'lyrics' | 'video'
  const [activeTab, setActiveTab] = useState<'visualizer' | 'lyrics' | 'video'>('visualizer')
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false)

  // Dynamic extracted palette from song album art
  const [palette, setPalette] = useState<ExtractedPalette>(() =>
    createPaletteFromHex(currentTrack?.color || '#00F2FE')
  )

  useEffect(() => {
    let isCancelled = false
    if (currentTrack?.coverUrl) {
      extractColorFromImage(currentTrack.coverUrl, currentTrack.color || '#00F2FE')
        .then((newPalette) => {
          if (!isCancelled) setPalette(newPalette)
        })
        .catch(() => {
          if (!isCancelled) setPalette(createPaletteFromHex(currentTrack.color || '#00F2FE'))
        })
    } else {
      setPalette(createPaletteFromHex(currentTrack?.color || '#00F2FE'))
    }
    return () => {
      isCancelled = true
    }
  }, [currentTrack?.id, currentTrack?.coverUrl, currentTrack?.color])

  // --- Smooth Touch & Gesture Swipe Carousel Animation ---
  const [swipeOffset, setSwipeOffset] = useState<number>(0)
  const [isSwiping, setIsSwiping] = useState<boolean>(false)
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false)
  const touchStartXRef = useRef<number>(0)
  const touchStartYRef = useRef<number>(0)
  const isHorizontalGestureRef = useRef<boolean | null>(null)

  const handleGestureStart = useCallback((clientX: number, clientY: number) => {
    if (isTransitioning) return
    touchStartXRef.current = clientX
    touchStartYRef.current = clientY
    isHorizontalGestureRef.current = null
    setIsSwiping(true)
  }, [isTransitioning])

  const handleGestureMove = useCallback((clientX: number, clientY: number) => {
    if (!isSwiping || isTransitioning) return
    const deltaX = clientX - touchStartXRef.current
    const deltaY = clientY - touchStartYRef.current

    if (isHorizontalGestureRef.current === null) {
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        isHorizontalGestureRef.current = Math.abs(deltaX) >= Math.abs(deltaY)
      }
    }

    if (isHorizontalGestureRef.current) {
      setSwipeOffset(deltaX * 0.85)
    }
  }, [isSwiping, isTransitioning])

  const handleGestureEnd = useCallback(() => {
    if (!isSwiping || isTransitioning) return
    setIsSwiping(false)

    const SWIPE_THRESHOLD = 38
    if (isHorizontalGestureRef.current) {
      if (swipeOffset < -SWIPE_THRESHOLD) {
        // Swiped Left -> Next Song
        setIsTransitioning(true)
        setSwipeOffset(-300)
        setTimeout(() => {
          adapterManager.playNext()
          setSwipeOffset(200)
          setTimeout(() => {
            setSwipeOffset(0)
            setIsTransitioning(false)
          }, 40)
        }, 180)
        isHorizontalGestureRef.current = null
        return
      } else if (swipeOffset > SWIPE_THRESHOLD) {
        // Swiped Right -> Previous Song
        setIsTransitioning(true)
        setSwipeOffset(300)
        setTimeout(() => {
          adapterManager.playPrevious()
          setSwipeOffset(-200)
          setTimeout(() => {
            setSwipeOffset(0)
            setIsTransitioning(false)
          }, 40)
        }, 180)
        isHorizontalGestureRef.current = null
        return
      }
    }

    // Snap back to center
    setSwipeOffset(0)
    isHorizontalGestureRef.current = null
  }, [isSwiping, swipeOffset, isTransitioning, adapterManager])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) handleGestureStart(e.touches[0].clientX, e.touches[0].clientY)
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) handleGestureMove(e.touches[0].clientX, e.touches[0].clientY)
  }
  const handleTouchEnd = () => handleGestureEnd()

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    try {
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    } catch {}
    handleGestureStart(e.clientX, e.clientY)
  }
  const handlePointerMove = (e: React.PointerEvent) => {
    if (isSwiping) handleGestureMove(e.clientX, e.clientY)
  }
  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
    } catch {}
    handleGestureEnd()
  }

  // --- Real-time Synced Lyrics Fetching ---
  const [lyrics, setLyrics] = useState<ParsedLyrics | null>(null)
  const [isLyricsLoading, setIsLyricsLoading] = useState(false)
  const activeLineRef = useRef<HTMLParagraphElement>(null)
  const lyricsContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!currentTrack) {
      setLyrics(null)
      return
    }

    setIsLyricsLoading(true)
    lrcLibClient
      .getLyrics(
        currentTrack.title,
        currentTrack.artist,
        currentTrack.duration,
        currentTrack.id,
        currentTrack.lyrics
      )
      .then((data) => {
        setLyrics(data)
      })
      .finally(() => {
        setIsLyricsLoading(false)
      })
  }, [currentTrack])

  const activeLyricIdx = lyrics?.lines ? findActiveLyricIndex(lyrics.lines, currentTime) : -1

  // Smooth auto-scroll active lyric into center
  useEffect(() => {
    if (activeLineRef.current && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current
      const el = activeLineRef.current
      const targetScroll = el.offsetTop - container.offsetTop - (container.clientHeight / 2) + (el.clientHeight / 2)
      container.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth',
      })
    }
  }, [activeLyricIdx])

  // --- High-Precision Touchable & Scrubbable Seekbar ---
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false)
  const [scrubPreviewTime, setScrubPreviewTime] = useState<number | null>(null)
  const progressBarRef = useRef<HTMLDivElement | null>(null)

  const calculateSeekTime = useCallback((clientX: number): number => {
    if (!progressBarRef.current) return 0
    const rect = progressBarRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return ratio * (duration || 180)
  }, [duration])

  const handleSeekPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId)
    } catch {}
    setIsScrubbing(true)
    const target = calculateSeekTime(e.clientX)
    setScrubPreviewTime(target)
    adapterManager.seek(target)
  }

  const handleSeekPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return
    const target = calculateSeekTime(e.clientX)
    setScrubPreviewTime(target)
    adapterManager.seek(target)
  }

  const handleSeekPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId)
    } catch {}
    const target = calculateSeekTime(e.clientX)
    adapterManager.seek(target)
    setIsScrubbing(false)
    setScrubPreviewTime(null)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    adapterManager.seek(newTime)
  }

  // Synchronize active drawer tab with useUIStore for SingletonYouTubePlayer positioning
  useEffect(() => {
    if (isMobileDrawerOpen) {
      setMobileDrawerTab(activeTab)
    }
  }, [activeTab, isMobileDrawerOpen, setMobileDrawerTab])

  const handlePlayPause = async () => {
    if (isPlaying) {
      await adapterManager.pause()
    } else {
      await adapterManager.play()
    }
  }

  // --- Volume Handlers ---
  const prevVolumeRef = useRef<number>(0.8)

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value)
    if (newVol > 0) {
      prevVolumeRef.current = newVol
    }
    adapterManager.setVolume(newVol)
    setVolume(newVol)
  }

  const handleToggleMute = () => {
    if (isMuted || volume === 0) {
      const restoreVol = prevVolumeRef.current > 0 ? prevVolumeRef.current : 0.8
      adapterManager.setVolume(restoreVol)
      setVolume(restoreVol)
      if (isMuted) toggleMute()
    } else {
      prevVolumeRef.current = volume > 0 ? volume : 0.8
      adapterManager.setVolume(0)
      setVolume(0)
      if (!isMuted) toggleMute()
    }
  }

  const liked = currentTrack ? isLiked(currentTrack.id) : false
  const displayCurrentTime = isScrubbing && scrubPreviewTime !== null ? scrubPreviewTime : currentTime
  const progressPercent = duration > 0 ? Math.min(100, (displayCurrentTime / duration) * 100) : 0

  return (
    <Drawer.Root open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-50 transition-opacity duration-300" />
        <Drawer.Content
          aria-label="Now Playing Drawer"
          style={{
            background: palette.gradient,
            transition: 'background 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="fixed inset-0 h-[100dvh] max-h-[100dvh] w-full z-50 flex flex-col outline-none select-none text-text-primary shadow-[0_-25px_80px_rgba(0,0,0,0.95)] overflow-hidden"
        >
          {/* Animated Dynamic Aurora Glow Orbs in Background */}
          <div
            style={{ backgroundColor: palette.primary }}
            className="absolute -top-36 -left-36 w-96 h-96 rounded-full blur-[120px] opacity-40 pointer-events-none animate-aurora-1"
          />
          <div
            style={{ backgroundColor: palette.secondary }}
            className="absolute top-1/4 -right-32 w-88 h-88 rounded-full blur-[110px] opacity-35 pointer-events-none animate-aurora-2"
          />
          <div
            style={{ backgroundColor: palette.glowColor }}
            className="absolute -bottom-32 left-1/4 w-[420px] h-[420px] rounded-full blur-[130px] opacity-30 pointer-events-none animate-pulse-glow"
          />

          {/* Inner Content Wrapper */}
          <div className="relative z-10 flex flex-col h-full w-full max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 pt-3 pb-6 justify-between overflow-hidden">
            {/* 1. Header Bar: Minimize, Track Info, Sleep Timer & Like */}
            <div className="flex items-center justify-between pt-1 pb-2 border-b border-white/10 flex-shrink-0">
              {/* Minimize Chevron */}
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="min-h-[44px] min-w-[44px] p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white/80 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-md"
                aria-label="Close now playing drawer"
                title="Minimize player"
              >
                <ChevronDown className="w-5 h-5" />
              </button>

              {/* Center Title */}
              <div className="flex flex-col items-center text-center px-2 min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-widest text-vyn-primary/90 font-mono truncate max-w-[200px] sm:max-w-[320px]">
                  {currentTrack?.artist || 'Vynora Studio'}
                </span>
                <span className="text-xs sm:text-sm font-black text-white truncate max-w-[200px] sm:max-w-[320px]">
                  {currentTrack?.title || 'No Track Playing'}
                </span>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => setIsInstallModalOpen(true)}
                  className="min-h-[44px] min-w-[44px] p-2 rounded-full bg-vyn-primary/15 border border-vyn-primary/30 text-vyn-primary hover:bg-vyn-primary/25 active:scale-90 transition-all flex items-center justify-center cursor-pointer shadow-md"
                  title="Install Mobile App"
                  aria-label="Install mobile app"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsSleepTimerOpen(true)}
                  className="min-h-[44px] min-w-[44px] p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white/80 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-md"
                  title="Sleep Timer"
                  aria-label="Sleep timer"
                >
                  <Clock className="w-4 h-4" />
                </button>

                <button
                  onClick={() => currentTrack && toggleLikeTrack(currentTrack)}
                  className="min-h-[44px] min-w-[44px] p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white/80 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-md"
                  aria-label="Toggle like"
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-white/70'}`} />
                </button>
              </div>
            </div>

            {/* 2. Mode Selector Tabs: Card | Lyrics | Video */}
            <div className="flex items-center justify-center my-1.5 gap-1.5 flex-shrink-0">
              <div className="flex items-center gap-1 bg-black/45 p-1 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg">
                <button
                  onClick={() => setActiveTab('visualizer')}
                  className={`min-h-[44px] px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'visualizer'
                      ? 'bg-vyn-primary text-black shadow-glow-cyan'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Disc3 className="w-4 h-4" />
                  <span>Card</span>
                </button>

                <button
                  onClick={() => setActiveTab('lyrics')}
                  className={`min-h-[44px] px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'lyrics'
                      ? 'bg-vyn-primary text-black shadow-glow-cyan'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Mic2 className="w-4 h-4" />
                  <span>Lyrics</span>
                </button>

                <button
                  onClick={() => setActiveTab('video')}
                  className={`min-h-[44px] px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'video'
                      ? 'bg-vyn-primary text-black shadow-glow-cyan'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Tv className="w-4 h-4" />
                  <span>Video</span>
                </button>
              </div>
            </div>

            {/* 3. Center Dynamic Section (Card / Lyrics / Video) */}
            <div className="flex-1 min-h-0 relative flex flex-col justify-center my-1 overflow-hidden">
              {/* TAB 1: SWIPEABLE ALBUM CARD */}
              {activeTab === 'visualizer' && (
                <div className="h-full flex flex-col items-center justify-center min-h-0 py-2 relative">
                  {/* Glowing Animated Aura Orb behind Album Art */}
                  <div
                    style={{
                      backgroundColor: palette.primary,
                      boxShadow: `0 0 100px 30px ${palette.glowColor}`,
                    }}
                    className="absolute w-56 h-56 rounded-full blur-[80px] opacity-45 pointer-events-none animate-pulse"
                  />

                  <div
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{
                      transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.04}deg)`,
                      opacity: 1 - Math.min(0.4, Math.abs(swipeOffset) / 360),
                      transition: isSwiping ? 'none' : 'transform 0.35s cubic-bezier(0.18, 0.9, 0.3, 1), opacity 0.35s ease',
                      boxShadow: `0 30px 80px -15px ${palette.glowColor}, 0 0 35px ${palette.secondary}40`,
                      borderColor: `${palette.primary}40`,
                      touchAction: 'none',
                    }}
                    className="w-56 h-56 sm:w-68 sm:h-68 md:w-76 md:h-76 rounded-3xl bg-canvas-base border overflow-hidden flex items-center justify-center relative group cursor-grab active:cursor-grabbing select-none shadow-2xl z-10"
                  >
                    {currentTrack?.coverUrl ? (
                      <img
                        src={currentTrack.coverUrl}
                        alt={currentTrack.title}
                        draggable={false}
                        onError={(e) => {
                          if (currentTrack.youtubeId) {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = `https://i.ytimg.com/vi/${currentTrack.youtubeId}/hqdefault.jpg`
                          }
                        }}
                        className="w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-text-muted">
                        <Music className="w-16 h-16 text-vyn-primary mb-2" />
                        <span className="text-xs">Vynora 3D Audio</span>
                      </div>
                    )}

                    {/* Drag Hints */}
                    {isSwiping && swipeOffset < -20 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white text-xs font-black flex items-center gap-1.5 shadow-xl animate-pulse pointer-events-none">
                        <span>Next Track</span>
                        <SkipForward className="w-4 h-4 text-vyn-primary" />
                      </div>
                    )}
                    {isSwiping && swipeOffset > 20 && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white text-xs font-black flex items-center gap-1.5 shadow-xl animate-pulse pointer-events-none">
                        <SkipBack className="w-4 h-4 text-vyn-primary" />
                        <span>Prev Track</span>
                      </div>
                    )}

                    {/* Equalizer Playing Bars */}
                    {isPlaying && (
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10 pointer-events-none">
                        <span className="w-1 h-3 animate-pulse rounded-full" style={{ backgroundColor: palette.primary }} />
                        <span className="w-1 h-5 animate-pulse delay-75 rounded-full" style={{ backgroundColor: palette.primary }} />
                        <span className="w-1 h-2 animate-pulse delay-150 rounded-full" style={{ backgroundColor: palette.primary }} />
                      </div>
                    )}

                    {/* Swipe Hint Top Left */}
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-md border border-white/10 text-[10px] text-white/80 font-mono">
                      ↔ Swipe to change
                    </div>
                  </div>

                  {/* Track Info Card */}
                  <div className="w-full flex items-center justify-between mt-3 mb-1 px-1 z-10">
                    <div className="min-w-0 pr-3">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white truncate drop-shadow-md leading-tight">
                        {currentTrack ? currentTrack.title : 'No Track Loaded'}
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base font-semibold text-white/70 truncate mt-0.5">
                        {currentTrack ? currentTrack.artist : 'Vynora Studio'}
                      </p>
                    </div>

                    <span
                      className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border uppercase shrink-0 shadow-sm ${
                        isRealFFT
                          ? 'bg-vyn-primary/20 text-vyn-primary border-vyn-primary/50'
                          : 'bg-vyn-secondary/20 text-vyn-secondary border-vyn-secondary/50'
                      }`}
                    >
                      {isRealFFT ? 'REAL FFT' : 'BEAT SIM'}
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 2: FULL-HEIGHT KARAOKE SYNCED LYRICS */}
              {activeTab === 'lyrics' && (
                <div className="h-full flex flex-col min-h-0 w-full overflow-hidden">
                  {/* Lyrics Header Status */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 flex-shrink-0 px-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-vyn-primary font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>LRCLIB SYNCHRONIZED</span>
                    </div>
                    <span className="text-[10px] text-white/50 font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Full Height Lyrics Scroll View */}
                  <div
                    ref={lyricsContainerRef}
                    className="flex-1 overflow-y-auto flex flex-col gap-4 py-8 px-4 text-center scrollbar-none custom-scrollbar"
                  >
                    {isLyricsLoading ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/60">
                        <Loader2 className="w-8 h-8 text-vyn-primary animate-spin mb-1" />
                        <p className="text-sm font-bold text-white/80">Syncing live subtitles...</p>
                        <p className="text-xs text-white/40">Matching LRC timestamps with audio tempo</p>
                      </div>
                    ) : !lyrics || (!lyrics.isSynced && !lyrics.plainText) || lyrics.lines.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/40">
                        <Mic2 className="w-10 h-10 text-white/20 mb-1" />
                        <p className="text-sm font-semibold text-white/70">No synchronized lyrics available</p>
                        <p className="text-xs text-white/40 max-w-xs">
                          Synchronized LRC timestamps could not be found for this track. Switch to Card or Video mode!
                        </p>
                      </div>
                    ) : lyrics.isSynced ? (
                      lyrics.lines.map((line, idx) => {
                        const isCurrent = idx === activeLyricIdx
                        const isPast = idx < activeLyricIdx

                        return (
                          <p
                            key={`${line.rawTime}-${idx}`}
                            ref={isCurrent ? activeLineRef : null}
                            onClick={() => {
                              adapterManager.seek(line.rawTime)
                            }}
                            className={`transition-all duration-300 cursor-pointer select-none leading-relaxed px-3 py-1 rounded-xl ${
                              isCurrent
                                ? 'text-xl sm:text-2xl md:text-3xl font-black scale-105 text-white'
                                : isPast
                                ? 'text-white/50 text-sm sm:text-base font-medium hover:text-white/80'
                                : 'text-white/20 text-sm sm:text-base font-normal hover:text-white/50'
                            }`}
                            style={
                              isCurrent
                                ? {
                                    color: palette.primary,
                                    textShadow: `0 0 30px ${palette.glowColor}`,
                                  }
                                : undefined
                            }
                          >
                            <span className="text-[10px] font-mono mr-2.5 opacity-40">
                              {formatTime(line.rawTime)}
                            </span>
                            {line.text}
                          </p>
                        )
                      })
                    ) : (
                      <div className="whitespace-pre-line text-sm text-white/70 leading-relaxed py-6">
                        {lyrics.plainText}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: DOCKED FULL HD YOUTUBE VIDEO STREAM (ZERO SOUND OVERLAP & SYNCHRONIZED) */}
              {activeTab === 'video' && (
                <div className="h-full flex flex-col items-center justify-center min-h-0 py-2 w-full">
                  <div
                    id="vynora-drawer-video-anchor"
                    className="w-full max-w-lg aspect-video rounded-2xl bg-black border border-white/20 shadow-2xl relative overflow-hidden ring-1 ring-white/10 group flex items-center justify-center"
                  >
                    {!currentTrack?.youtubeId && (
                      <div className="text-xs text-white/50">
                        No official video stream found for this track
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-white/50 mt-3 font-mono flex items-center gap-2 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>Official HD Video • Zero Audio Overlap • Studio Master Sound</span>
                  </p>
                </div>
              )}
            </div>

            {/* 4. High-Precision Touchable & Draggable Seekbar Anywhere */}
            <div className="w-full flex flex-col gap-1 my-1 flex-shrink-0">
              <div
                ref={progressBarRef}
                onPointerDown={handleSeekPointerDown}
                onPointerMove={handleSeekPointerMove}
                onPointerUp={handleSeekPointerUp}
                className="w-full h-8 flex items-center cursor-pointer select-none group relative touch-none"
                title="Tap or drag anywhere to seek"
              >
                {/* Visual Track Bar */}
                <div className="w-full h-2.5 bg-white/15 rounded-full overflow-hidden relative group-hover:h-3 transition-all">
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: palette.primary,
                      boxShadow: `0 0 12px ${palette.glowColor}`,
                    }}
                    className="h-full rounded-full transition-all duration-75"
                  />
                </div>

                {/* Floating Glow Thumb */}
                <div
                  style={{
                    left: `${progressPercent}%`,
                    backgroundColor: '#FFFFFF',
                    boxShadow: `0 0 14px 2px ${palette.glowColor}`,
                  }}
                  className="absolute w-4 h-4 rounded-full -ml-2 group-hover:scale-125 transition-transform duration-75 pointer-events-none"
                />

                {/* Hidden accessible input for screen readers and automated test suites */}
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={displayCurrentTime}
                  onChange={handleSeek}
                  aria-label="Seek track position"
                  className="sr-only"
                />
              </div>

              {/* Time Indicators */}
              <div className="flex justify-between text-[11px] font-mono text-white/60 tabular-nums px-0.5">
                <span>{formatTime(displayCurrentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* 5. Main Playback Controls: Shuffle, Prev, Play/Pause, Next, Repeat */}
            <div className="w-full flex items-center justify-between max-w-md mx-auto my-1 flex-shrink-0">
              <button
                onClick={toggleShuffle}
                aria-label="Toggle shuffle"
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-all active:scale-90 hover:scale-105 cursor-pointer ${
                  isShuffle ? 'text-vyn-primary bg-vyn-primary/20 scale-105 shadow-glow-cyan' : 'text-white/60 hover:text-white'
                }`}
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                onClick={() => adapterManager.playPrevious()}
                aria-label="Previous track"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-white/80 hover:text-white active:scale-90 hover:scale-105 transition-all cursor-pointer"
              >
                <SkipBack className="w-6 h-6 fill-current" />
              </button>

              <button
                onClick={handlePlayPause}
                aria-label={isPlaying ? 'Pause track' : 'Play track'}
                style={{
                  backgroundColor: palette.primary,
                  boxShadow: `0 8px 30px ${palette.glowColor}`,
                }}
                className="min-h-[56px] min-w-[56px] w-14 h-14 rounded-full text-black flex items-center justify-center active:scale-90 hover:scale-105 transition-all shadow-xl cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current text-black" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-0.5 text-black" />
                )}
              </button>

              <button
                onClick={() => adapterManager.playNext()}
                aria-label="Next track"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-white/80 hover:text-white active:scale-90 hover:scale-105 transition-all cursor-pointer"
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </button>

              <button
                onClick={cycleRepeatMode}
                aria-label="Toggle repeat mode"
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-all active:scale-90 hover:scale-105 relative cursor-pointer ${
                  repeatMode !== 'off' ? 'text-vyn-primary bg-vyn-primary/20 scale-105 shadow-glow-cyan' : 'text-white/60 hover:text-white'
                }`}
              >
                <Repeat className="w-5 h-5" />
                {repeatMode === 'one' && (
                  <span className="absolute text-[9px] font-bold bottom-1 text-vyn-primary font-mono">1</span>
                )}
              </button>
            </div>

            {/* 6. Restored Dedicated Volume Slider Bar */}
            <div className="w-full max-w-md mx-auto flex items-center gap-3 px-3.5 py-1.5 my-1 bg-white/10 hover:bg-white/15 rounded-2xl border border-white/10 backdrop-blur-md transition-all shadow-md flex-shrink-0">
              <button
                onClick={handleToggleMute}
                aria-label={isMuted || volume === 0 ? 'Unmute volume' : 'Mute volume'}
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-white/80 hover:text-white active:scale-90 flex items-center justify-center transition-all cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Drawer volume slider"
                className="flex-1 h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-vyn-primary"
              />

              <span className="text-[11px] font-mono text-white/70 w-8 text-right tabular-nums">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>

            {/* 7. Clean Bottom Auxiliary Toolbar (Queue, Crossfade, Lossless Badge) */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 flex-shrink-0 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsQueueDrawerOpen(true)}
                  className="min-h-[44px] px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 hover:scale-105 text-white/85 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <ListMusic className="w-3.5 h-3.5 text-vyn-primary" />
                  <span>Queue {queue.length > 0 ? `(${queue.length})` : ''}</span>
                </button>

                <button
                  onClick={() => setIsPlaybackSettingsOpen(true)}
                  className="min-h-[44px] px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 hover:scale-105 text-white/85 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Sliders className="w-3.5 h-3.5 text-vyn-primary" />
                  <span>Crossfade</span>
                </button>
              </div>

              <span className="text-[10px] uppercase tracking-wider text-vyn-primary font-mono font-bold px-2.5 py-1 rounded-full bg-vyn-primary/10 border border-vyn-primary/20 shadow-sm flex-shrink-0">
                Hi-Res Lossless
              </span>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>

      <PWAInstallModal isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} />
    </Drawer.Root>
  )
}
