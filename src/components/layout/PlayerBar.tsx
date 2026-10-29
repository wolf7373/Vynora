import React from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Volume1,
  Tv,
  Mic2,
  Music,
  Heart,
  ListMusic,
  Clock,
  Sliders,
} from 'lucide-react'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useUIStore } from '@/stores/useUIStore'
import { usePlaylistStore } from '@/stores/usePlaylistStore'
import { PlaybackAdapterManager } from '@/adapters'
import { formatTime } from '@/utils/formatTime'

export const PlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
    activeSource,
    cycleRepeatMode,
    toggleShuffle,
  } = usePlayerStore()

  const {
    rightSidebarView,
    toggleRightSidebarView,
    setIsMobileDrawerOpen,
    setMobileDrawerTab,
    isQueueDrawerOpen,
    setIsQueueDrawerOpen,
    setIsSleepTimerOpen,
    setIsPlaybackSettingsOpen,
  } = useUIStore()

  const { toggleLikeTrack, isLiked } = usePlaylistStore()
  const adapterManager = PlaybackAdapterManager.getInstance()
  const isRealFFT = adapterManager.isRealFFT()

  const prevVolumeRef = React.useRef<number>(0.8)

  if (!currentTrack) {
    return null
  }

  const liked = isLiked(currentTrack.id)

  const handlePlayPause = async () => {
    if (isPlaying) {
      await adapterManager.pause()
    } else {
      await adapterManager.play()
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    adapterManager.seek(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value)
    if (newVol > 0) {
      prevVolumeRef.current = newVol
    }
    adapterManager.setVolume(newVol)
    usePlayerStore.getState().setVolume(newVol)
  }

  const handleToggleMute = () => {
    if (isMuted || volume === 0) {
      const restoreVol = prevVolumeRef.current > 0 ? prevVolumeRef.current : 0.8
      adapterManager.setVolume(restoreVol)
      usePlayerStore.getState().setVolume(restoreVol)
      if (usePlayerStore.getState().isMuted) {
        usePlayerStore.getState().toggleMute()
      }
    } else {
      prevVolumeRef.current = volume > 0 ? volume : 0.8
      adapterManager.setVolume(0)
      usePlayerStore.getState().setVolume(0)
      if (!usePlayerStore.getState().isMuted) {
        usePlayerStore.getState().toggleMute()
      }
    }
  }

  const handleOpenDrawer = () => {
    if (rightSidebarView === 'video') {
      setMobileDrawerTab('video')
    }
    setIsMobileDrawerOpen(true)
  }

  const handleBarClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement
    // Don't open drawer if user clicked a button, slider, or interactive control
    if (target.closest('button') || target.closest('input') || target.closest('a')) {
      return
    }
    handleOpenDrawer()
  }

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  return (
    <footer
      onClick={handleBarClick}
      title="Click anywhere to open full now playing screen & lyrics"
      className="relative h-16 md:h-20 bg-vyn-surface/95 border-t border-vyn-border hover:border-vyn-primary/30 px-3 md:px-6 flex items-center justify-between gap-2 md:gap-4 z-40 flex-shrink-0 select-none backdrop-blur-xl cursor-pointer transition-all duration-200 group/footer"
    >
      {/* Mobile Top Progress Scrubber Line (Like Spotify) */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
        <div
          className="h-full bg-vyn-primary transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Left: Active Track Details */}
      <div className="flex items-center gap-2 flex-1 md:flex-initial md:w-1/4 md:min-w-[180px] min-w-0 pr-1">
        {/* Desktop Expand Button */}
        <button
          onClick={handleOpenDrawer}
          className="hidden md:flex min-h-[44px] min-w-[44px] h-11 w-11 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-vyn-muted hover:text-white transition-all flex-shrink-0 cursor-pointer"
          title="Open Full Now Playing & Lyrics"
          aria-label="Open Full Now Playing"
        >
          <span className="text-xs">▲</span>
        </button>

        <div
          onClick={handleOpenDrawer}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-90 transition-opacity flex-1 group"
          title="Click to open Full Now Playing View"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-vyn-canvas border border-vyn-border flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:ring-2 group-hover:ring-vyn-primary/50 transition-all shadow-md">
            {currentTrack?.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                onError={(e) => {
                  if (currentTrack.youtubeId) {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = `https://i.ytimg.com/vi/${currentTrack.youtubeId}/hqdefault.jpg`
                  }
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music className="w-5 h-5 md:w-6 md:h-6 text-vyn-muted" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span
              className="text-xs md:text-sm font-semibold text-vyn-high group-hover:text-vyn-primary transition-colors truncate block"
              title={currentTrack.title}
            >
              {currentTrack.title}
            </span>
            <span className="text-[10px] md:text-xs text-vyn-muted truncate block" title={currentTrack.artist}>
              {currentTrack.artist}
            </span>
          </div>
        </div>

        {/* Desktop Like Button */}
        <button
          onClick={() => toggleLikeTrack(currentTrack)}
          title={liked ? 'Unlike' : 'Like'}
          aria-label={liked ? 'Unlike track' : 'Like track'}
          className="hidden md:flex min-h-[44px] min-w-[44px] p-2 rounded-lg text-text-muted hover:text-white items-center justify-center transition-colors"
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : 'text-vyn-muted'}`} />
        </button>
      </div>

      {/* Mobile-Only Action Cluster (Heart + Play/Pause) */}
      <div className="flex md:hidden items-center gap-1 flex-shrink-0">
        <button
          onClick={() => toggleLikeTrack(currentTrack)}
          title={liked ? 'Unlike' : 'Like'}
          aria-label={liked ? 'Unlike track' : 'Like track'}
          className="min-h-[44px] min-w-[44px] p-2 flex items-center justify-center text-text-muted hover:text-white"
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-vyn-muted'}`} />
        </button>

        <button
          onClick={handlePlayPause}
          title={isPlaying ? 'Pause' : 'Play'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="min-h-[44px] min-w-[44px] w-10 h-10 rounded-full bg-vyn-primary text-vyn-canvas flex items-center justify-center shadow-glow-cyan active:scale-95"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>
      </div>

      {/* Center: Playback Controls & Scrubber (Always rendered for tests, responsive display) */}
      <div
        className="hidden md:flex flex-1 max-w-xl flex-col items-center gap-1.5 px-2 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Buttons Row with Generous Spacing */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={toggleShuffle}
            title={`Shuffle: ${isShuffle ? 'On' : 'Off'}`}
            aria-label="Toggle shuffle"
            className={`min-h-[44px] min-w-[44px] p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              isShuffle ? 'text-vyn-primary bg-vyn-primary/10 shadow-glow-cyan' : 'text-vyn-muted hover:text-vyn-high'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={() => adapterManager.playPrevious()}
            title="Previous track"
            aria-label="Previous track"
            className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-vyn-muted hover:text-vyn-high flex items-center justify-center transition-all active:scale-90 cursor-pointer"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={handlePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="min-h-[44px] min-w-[44px] w-12 h-12 rounded-full bg-vyn-primary text-vyn-canvas flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-glow-cyan cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => adapterManager.playNext()}
            title="Next track"
            aria-label="Next track"
            className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-vyn-muted hover:text-vyn-high flex items-center justify-center transition-all active:scale-90 cursor-pointer"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={cycleRepeatMode}
            title={`Repeat mode: ${repeatMode}`}
            aria-label={`Repeat mode: ${repeatMode}`}
            className={`min-h-[44px] min-w-[44px] p-2 rounded-xl flex items-center justify-center transition-all relative cursor-pointer active:scale-95 ${
              repeatMode !== 'off' ? 'text-vyn-primary bg-vyn-primary/10 shadow-glow-cyan' : 'text-vyn-muted hover:text-vyn-high'
            }`}
          >
            <Repeat className="w-4 h-4" />
            {repeatMode === 'one' && (
              <span className="absolute text-[8px] font-bold top-1.5 right-1.5 text-vyn-primary">1</span>
            )}
          </button>
        </div>

        {/* Generous High-Precision Scrubber Row */}
        <div
          className="w-full flex items-center gap-3 text-[11px] text-vyn-muted tabular-nums py-1 group cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="w-10 text-right font-mono">{formatTime(currentTime)}</span>
          <div className="flex-1 relative flex items-center py-2">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              disabled={duration === 0}
              aria-label="Seek playback position"
              className="w-full h-2 group-hover:h-2.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-vyn-primary disabled:opacity-40 transition-all focus:outline-none"
            />
          </div>
          <span className="w-10 text-left font-mono">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Desktop Dock Toggles & Volume (Always rendered for tests, responsive display) */}
      <div className="hidden md:flex items-center justify-end gap-2 w-1/4 min-w-[180px]">
        {/* Real vs Sim FFT Indicator Badge (REG-08) */}
        {activeSource && (
          <span
            className={`hidden xl:inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
              isRealFFT
                ? 'bg-vyn-primary/10 text-vyn-primary border-vyn-primary/30'
                : 'bg-vyn-secondary/10 text-vyn-secondary border-vyn-secondary/30'
            }`}
          >
            {isRealFFT ? 'REAL FFT' : 'BEAT SIM'}
          </span>
        )}

        {/* Synced Lyrics Dock Toggle */}
        <button
          onClick={() => toggleRightSidebarView('lyrics')}
          title="Toggle Lyrics Dock"
          aria-label="Toggle Lyrics Dock"
          className={`min-h-[44px] min-w-[44px] p-2 rounded-lg flex items-center justify-center transition-all ${
            rightSidebarView === 'lyrics' ? 'text-vyn-primary bg-vyn-primary/10' : 'text-vyn-muted hover:text-vyn-high'
          }`}
        >
          <Mic2 className="w-4 h-4" />
        </button>

        {/* Video Player Dock Toggle (REG-04) */}
        <button
          onClick={() => toggleRightSidebarView('video')}
          title="Toggle Video Dock"
          aria-label="Toggle Video Dock"
          className={`min-h-[44px] min-w-[44px] p-2 rounded-lg flex items-center justify-center transition-all ${
            rightSidebarView === 'video' ? 'text-vyn-primary bg-vyn-primary/10' : 'text-vyn-muted hover:text-vyn-high'
          }`}
        >
          <Tv className="w-4 h-4" />
        </button>

        {/* Play Queue Drawer Toggle */}
        <button
          onClick={() => setIsQueueDrawerOpen(!isQueueDrawerOpen)}
          title="Play Queue"
          aria-label="Toggle Play Queue"
          className={`min-h-[44px] min-w-[44px] p-2 rounded-lg flex items-center justify-center transition-all ${
            isQueueDrawerOpen ? 'text-vyn-primary bg-vyn-primary/10' : 'text-vyn-muted hover:text-vyn-high'
          }`}
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Sleep Timer Modal Toggle */}
        <button
          onClick={() => setIsSleepTimerOpen(true)}
          title="Sleep Timer"
          aria-label="Open Sleep Timer"
          className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-vyn-muted hover:text-vyn-high flex items-center justify-center transition-all"
        >
          <Clock className="w-4 h-4" />
        </button>

        {/* Playback Settings Modal Toggle */}
        <button
          onClick={() => setIsPlaybackSettingsOpen(true)}
          title="Playback Settings"
          aria-label="Open Playback Settings"
          className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-vyn-muted hover:text-vyn-high flex items-center justify-center transition-all"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Volume Slider Group */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-vyn-muted hover:text-vyn-high flex items-center justify-center"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            aria-label="Volume slider"
            className="w-16 md:w-20 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-vyn-primary"
          />
        </div>
      </div>
    </footer>
  )
}
