import React, { useMemo } from 'react'
import {
  X,
  ListMusic,
  Trash2,
  Sparkles,
  Plus,
  Music,
} from 'lucide-react'
import { useQueueStore } from '@/stores/useQueueStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useUIStore } from '@/stores/useUIStore'
import { PlaybackAdapterManager } from '@/adapters'
import { getRecommendations } from '@/services/recommendations/recommendationEngine'
import { formatTime } from '@/utils/formatTime'
import type { Track } from '@/types/track'

export const QueueDrawer: React.FC = () => {
  const { isQueueDrawerOpen, setIsQueueDrawerOpen } = useUIStore()
  const { queue, currentIndex, removeFromQueue, clearQueue, addToQueue, jumpToIndex } = useQueueStore()
  const { currentTrack, isPlaying } = usePlayerStore()

  const adapterManager = PlaybackAdapterManager.getInstance()

  // Generate upcoming smart vibe autoplay tracks based on currently playing song
  const upcomingVibeTracks = useMemo(() => {
    return getRecommendations(currentTrack).slice(0, 8)
  }, [currentTrack])

  if (!isQueueDrawerOpen) return null

  // Future user queue items
  const upcomingQueueItems = queue.slice(currentIndex + 1)

  const handlePlayFromQueue = async (track: Track, relativeIndex: number) => {
    const targetIndex = currentIndex + 1 + relativeIndex
    jumpToIndex(targetIndex)
    await adapterManager.playTrack(track)
  }

  const handlePlayRecommendation = async (track: Track) => {
    addToQueue(track)
    await adapterManager.playTrack(track)
  }

  return (
    <div
      role="dialog"
      aria-label="Play Queue"
      onClick={() => setIsQueueDrawerOpen(false)}
      className="fixed inset-0 z-[70] flex justify-end bg-black/75 backdrop-blur-md select-none transition-all duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md h-full bg-vyn-surface/95 border-l border-white/10 shadow-2xl flex flex-col p-4 sm:p-6 text-vyn-high overflow-hidden backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-accent-cyan" />
            <h2 className="text-base font-bold tracking-wide">Play Queue</h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30">
              {upcomingQueueItems.length + 1}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {upcomingQueueItems.length > 0 && (
              <button
                onClick={clearQueue}
                title="Clear queue"
                aria-label="Clear queue"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-xs text-text-muted hover:text-red-400 hover:bg-white/5 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsQueueDrawerOpen(false)}
              aria-label="Close queue drawer"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Queue Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* Section 1: Now Playing */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2.5">
              Now Playing
            </h3>
            {currentTrack ? (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-canvas-elevated border border-accent-cyan/30 shadow-lg">
                <div className="relative w-12 h-12 rounded-xl bg-canvas-base border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {currentTrack.coverUrl ? (
                    <img
                      src={currentTrack.coverUrl}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-6 h-6 text-accent-cyan" />
                  )}
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="w-3 h-3 rounded-full bg-accent-cyan animate-ping" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-accent-cyan truncate block">
                    {currentTrack.title}
                  </span>
                  <span className="text-[11px] text-text-muted truncate block">
                    {currentTrack.artist}
                  </span>
                </div>

                <span className="text-xs font-mono text-text-muted">
                  {formatTime(currentTrack.duration)}
                </span>
              </div>
            ) : (
              <p className="text-xs text-text-muted">No track currently playing</p>
            )}
          </div>

          {/* Section 2: Next In Queue */}
          {upcomingQueueItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Next in Queue
                </h3>
                <span className="text-[11px] text-accent-cyan font-semibold">
                  {upcomingQueueItems.length} track{upcomingQueueItems.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="space-y-1.5">
                {upcomingQueueItems.map((track, idx) => (
                  <div
                    key={`${track.id}-${idx}`}
                    className="flex items-center gap-3 p-2 rounded-xl bg-canvas-base/80 border border-white/5 hover:border-white/10 transition-colors group"
                  >
                    <span className="text-xs font-mono font-bold text-text-muted w-4 text-center">
                      {idx + 1}
                    </span>

                    <div
                      onClick={() => handlePlayFromQueue(track, idx)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-canvas-surface overflow-hidden flex-shrink-0">
                        {track.coverUrl ? (
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Music className="w-5 h-5 text-text-muted m-2.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-vyn-high group-hover:text-accent-cyan truncate block transition-colors">
                          {track.title}
                        </span>
                        <span className="text-[10px] text-text-muted truncate block">
                          {track.artist}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromQueue(currentIndex + 1 + idx)}
                      aria-label={`Remove ${track.title} from queue`}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-white/5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Next Up (Smart Vibe Autoplay) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Next Up (Smart Vibe Autoplay)
                </h3>
              </div>
              <span className="text-[10px] text-text-muted font-mono">Spotify-Style</span>
            </div>

            <div className="space-y-1.5">
              {upcomingVibeTracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-canvas-base/50 hover:bg-canvas-base border border-transparent hover:border-white/5 transition-colors group"
                >
                  <div
                    onClick={() => handlePlayRecommendation(track)}
                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-lg bg-canvas-surface overflow-hidden flex-shrink-0">
                      {track.coverUrl ? (
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music className="w-4 h-4 text-text-muted m-2.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-vyn-high group-hover:text-accent-cyan truncate block transition-colors">
                        {track.title}
                      </span>
                      <span className="text-[10px] text-text-muted truncate block">
                        {track.artist}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => addToQueue(track)}
                      aria-label={`Add ${track.title} to queue`}
                      className="min-h-[44px] px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white/5 hover:bg-accent-cyan hover:text-canvas-base text-text-muted transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Queue</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

