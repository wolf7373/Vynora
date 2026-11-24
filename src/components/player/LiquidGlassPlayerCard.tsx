import React, { useRef } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Heart,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { usePlaylistStore } from '@/stores/usePlaylistStore'
import { PlaybackAdapterManager } from '@/adapters'
import { formatTime } from '@/utils/formatTime'
import { useLiquidGlass } from '@/services/ui/liquidEngine'
import { CATALOG_TRACKS } from '@/data/tracksCatalog'

interface LiquidGlassPlayerCardProps {
  className?: string
  showAmbientGlow?: boolean
  variant?: 'hero' | 'compact' | 'drawer'
}

export const LiquidGlassPlayerCard: React.FC<LiquidGlassPlayerCardProps> = ({
  className = '',
  showAmbientGlow = true,
  variant: _variant = 'hero',
}) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    cycleRepeatMode,
  } = usePlayerStore()

  const { isLiked, toggleLikeTrack } = usePlaylistStore()
  const adapterManager = PlaybackAdapterManager.getInstance()

  // Display current track or first catalog track as default preview
  const activeTrack = currentTrack || CATALOG_TRACKS[0]
  const liked = isLiked(activeTrack.id)

  const progressTrackRef = useRef<HTMLDivElement>(null)

  // Attach primary liquidGL glass lens to the card container
  useLiquidGlass(
    '#vynora-liquid-card',
    {
      refraction: 0.045,
      aberration: 0.04,
      bevelDepth: 0.12,
      bevelWidth: 0.13,
      frost: 1.5,
      specular: true,
      shadow: true,
      interaction: 'fluid',
      interactionStrength: 0.7,
      interactionRadius: 0.4,
      interactionViscosity: 0.65,
      audioReactive: true,
    },
    activeTrack,
    isPlaying
  )

  // Attach secondary stacked liquid lens to the progress knob (just like official demo)
  useLiquidGlass(
    '#liquid-card-knob',
    {
      refraction: 0.12,
      bevelDepth: 0.2,
      bevelWidth: 0.12,
      specular: true,
      shadow: true,
      interaction: 'none',
      frost: 0,
    },
    activeTrack,
    isPlaying
  )

  const handlePlayPause = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!currentTrack) {
      await adapterManager.playTrack(activeTrack)
      return
    }
    if (isPlaying) {
      await adapterManager.pause()
    } else {
      await adapterManager.play()
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (!progressTrackRef.current) return
    const rect = progressTrackRef.current.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const trackDur = duration > 0 ? duration : activeTrack.duration || 180
    const targetSeconds = ratio * trackDur
    adapterManager.seek(targetSeconds)
  }

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isMuted || volume === 0) {
      adapterManager.setVolume(0.8)
    } else {
      adapterManager.setVolume(0)
    }
  }

  const trackDuration = duration > 0 ? duration : activeTrack.duration || 180
  const progressPercent = trackDuration > 0 ? Math.min(100, (currentTime / trackDuration) * 100) : 0
  const remainingSeconds = Math.max(0, trackDuration - currentTime)

  return (
    <div className={`relative flex items-center justify-center p-2 select-none ${className}`}>
      {/* Dynamic Ambient Fluid Aurora Background (Matches liquidgl.naughtyduk.com/demos/audio-player) */}
      {showAmbientGlow && (
        <div className="absolute inset-0 overflow-hidden rounded-[3rem] pointer-events-none -z-10">
          <div
            style={{
              background: `radial-gradient(circle at 30% 30%, ${activeTrack.color || '#FF5E3A'} 0%, #FF2A6D 45%, #050508 85%)`,
            }}
            className="absolute inset-0 opacity-80 blur-2xl transition-all duration-1000 animate-pulse-glow"
          />
          <div
            style={{
              background: 'radial-gradient(circle at 75% 70%, #00F2FE 0%, #4FACFE 50%, transparent 80%)',
            }}
            className="absolute -bottom-10 -right-10 w-72 h-72 rounded-full blur-3xl opacity-50 animate-aurora-2"
          />
        </div>
      )}

      {/* Main Liquid Glass Player Card (Target for liquidGL WebGPU/WebGL shader) */}
      <div
        id="vynora-liquid-card"
        className="w-full max-w-sm sm:max-w-md rounded-[2.5rem] p-6 sm:p-7 liquid-glass-card border border-white/25 shadow-2xl relative overflow-hidden backdrop-blur-2xl transition-all"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Specular Edge Highlight */}
        <div className="liquid-specular-edge" />

        {/* Card Header: Badge & Live Visualizer Pill */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-white/90 shadow-sm backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-vyn-primary" />
            <span className="font-sans font-bold tracking-wide">Now Playing</span>
          </div>

          <button
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white transition-all flex items-center justify-center cursor-pointer"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-white/90" />
            )}
          </button>
        </div>

        {/* Top: Album Artwork & Track Info */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black/40 border border-white/20 overflow-hidden flex-shrink-0 shadow-lg relative group">
            {activeTrack.coverUrl ? (
              <img
                src={activeTrack.coverUrl}
                alt={activeTrack.title}
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-vyn-muted">
                <Sparkles className="w-6 h-6 text-vyn-primary" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-display font-bold text-white truncate" title={activeTrack.title}>
              {activeTrack.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/70 font-medium truncate" title={activeTrack.artist}>
              {activeTrack.artist}
            </p>
            {activeTrack.album && (
              <span className="text-[10px] text-white/40 truncate block font-mono mt-0.5">
                {activeTrack.album}
              </span>
            )}
          </div>

          <button
            onClick={() => toggleLikeTrack(activeTrack)}
            aria-label="Like track"
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-full bg-white/5 hover:bg-white/15 active:scale-90 text-white/80 transition-all flex items-center justify-center cursor-pointer flex-shrink-0"
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : 'text-white/70'}`} />
          </button>
        </div>

        {/* Progress Scrubber with Stacked Liquid Glass Knob */}
        <div className="mb-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-white/70 tabular-nums px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(remainingSeconds)}</span>
          </div>

          <div
            ref={progressTrackRef}
            onClick={handleSeek}
            className="h-6 flex items-center cursor-pointer relative group"
            title="Click or drag to seek"
          >
            {/* Visual background track line */}
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden relative">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-white transition-all duration-75 shadow-sm"
              />
            </div>

            {/* Stacked Liquid Glass Knob (Target for second liquidGL lens) */}
            <div
              id="liquid-card-knob"
              style={{ left: `${progressPercent}%` }}
              className="absolute w-5 h-5 -ml-2.5 rounded-full bg-white/90 border border-white/40 shadow-lg pointer-events-none group-hover:scale-125 transition-transform"
            />
          </div>
        </div>

        {/* Playback Controls Row */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={cycleRepeatMode}
            aria-label={`Repeat mode: ${repeatMode}`}
            className={`min-h-[44px] min-w-[44px] p-2.5 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
              repeatMode !== 'off'
                ? 'bg-white/20 text-vyn-primary shadow-glow-cyan'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Repeat className="w-4 h-4" />
          </button>

          <button
            onClick={() => adapterManager.playPrevious()}
            aria-label="Previous track"
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer active:scale-90 flex items-center justify-center"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="min-h-[44px] min-w-[44px] min-h-[52px] min-w-[52px] w-13 h-13 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => adapterManager.playNext()}
            aria-label="Next track"
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer active:scale-90 flex items-center justify-center"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <div className="w-10 h-10 flex items-center justify-center">
            {isPlaying ? (
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-0.5 h-2.5 bg-white animate-pulse rounded-full" />
                <span className="w-0.5 h-3.5 bg-white animate-pulse delay-75 rounded-full" />
                <span className="w-0.5 h-2 bg-white animate-pulse delay-150 rounded-full" />
              </div>
            ) : (
              <span className="text-[10px] text-white/40 font-mono">PAUSED</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
