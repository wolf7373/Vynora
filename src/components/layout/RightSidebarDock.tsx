import React from 'react'
import { Tv, Mic2, X, Music, Maximize2 } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { PlaybackAdapterManager } from '@/adapters'
import { SyncedLyricsViewer } from './SyncedLyricsViewer'

export const RightSidebarDock: React.FC = () => {
  const { rightSidebarView, setRightSidebarView } = useUIStore()
  const { currentTrack, activeSource } = usePlayerStore()
  const isRealFFT = PlaybackAdapterManager.getInstance().isRealFFT()
  const handleToggleFullscreen = () => {
    const singleHost = document.getElementById('youtube-player-iframe')
    if (singleHost) {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {})
      } else {
        singleHost.requestFullscreen?.().catch(() => {})
      }
    }
  }

  if (rightSidebarView === 'closed') {
    return null
  }

  return (
    <aside
      id="vynora-right-dock"
      aria-label="Right Media Dock"
      className="hidden md:flex w-80 md:w-96 bg-vyn-surface/95 border-l border-vyn-border flex-col h-full flex-shrink-0 z-20 select-none shadow-2xl transition-all duration-300"
    >
      {/* Dock Header */}
      <div className="h-16 px-4 border-b border-vyn-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-vyn-elevated/80 p-1 rounded-lg border border-vyn-border">
          <button
            onClick={() => setRightSidebarView('video')}
            className={`min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${
              rightSidebarView === 'video'
                ? 'bg-vyn-primary text-vyn-canvas font-semibold shadow-glow-cyan'
                : 'text-vyn-muted hover:text-vyn-high'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Video</span>
          </button>

          <button
            onClick={() => setRightSidebarView('lyrics')}
            className={`min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${
              rightSidebarView === 'lyrics'
                ? 'bg-vyn-primary text-vyn-canvas font-semibold shadow-glow-cyan'
                : 'text-vyn-muted hover:text-vyn-high'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {rightSidebarView === 'video' && (
            <button
              onClick={handleToggleFullscreen}
              title="Toggle Fullscreen Video"
              aria-label="Toggle Fullscreen Video"
              className="min-h-[44px] min-w-[44px] w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center text-vyn-muted hover:text-white transition-colors cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setRightSidebarView('closed')}
            title="Close dock"
            aria-label="Close media dock"
            className="min-h-[44px] min-w-[44px] w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center text-vyn-muted hover:text-vyn-high transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dock Content Body */}
      <div className="flex-1 overflow-hidden flex flex-col p-4">
        {/* Track Header Card */}
        {currentTrack && (
          <div className="p-3 mb-3 rounded-xl bg-vyn-elevated/70 border border-vyn-border flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-vyn-canvas flex items-center justify-center overflow-hidden flex-shrink-0 border border-vyn-border">
              {currentTrack.coverUrl ? (
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
                <Music className="w-6 h-6 text-vyn-muted" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-vyn-high truncate block">{currentTrack.title}</span>
              <span className="text-[11px] text-vyn-muted truncate block">{currentTrack.artist}</span>
              <span
                className={`inline-block text-[9px] font-mono font-bold mt-1 px-1.5 py-0.2 rounded border ${
                  isRealFFT
                    ? 'text-vyn-primary border-vyn-primary/30 bg-vyn-primary/10'
                    : 'text-vyn-secondary border-vyn-secondary/30 bg-vyn-secondary/10'
                }`}
              >
                {activeSource === 'youtube' ? 'YOUTUBE STREAM' : 'LOCAL AUDIO'}
              </span>
            </div>
          </div>
        )}

        {/* Video Mode: REG-04 Docked Video Anchor Slot */}
        <div className={`flex-1 flex flex-col ${rightSidebarView === 'video' ? 'block' : 'hidden'}`}>
          <div
            id="vynora-yt-singleton"
            className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-vyn-border shadow-lg relative group"
          >
            <div
              id="vynora-dock-video-anchor"
              className="w-full h-full flex items-center justify-center bg-black"
            >
              {!currentTrack?.youtubeId && (
                <div className="text-xs text-vyn-muted">
                  No video stream available
                </div>
              )}
            </div>

            {/* Quick Fullscreen Hover Button */}
            {currentTrack?.youtubeId && (
              <button
                onClick={handleToggleFullscreen}
                title="Expand to Fullscreen"
                aria-label="Expand to Fullscreen"
                className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/75 hover:bg-black text-white/80 hover:text-white transition-opacity opacity-0 group-hover:opacity-100 shadow-md backdrop-blur-sm cursor-pointer z-10"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-[11px] text-vyn-muted/70 mt-2 text-center font-mono flex items-center justify-center gap-1.5">
            <span>Official HD Video • Zero Audio Overlap • Studio Master Sound</span>
          </p>
        </div>

        {/* Lyrics Mode: Milestone 5 Real-time Synced LRCLIB Viewer */}
        <div className={`flex-1 flex flex-col overflow-hidden ${rightSidebarView === 'lyrics' ? 'block' : 'hidden'}`}>
          <SyncedLyricsViewer />
        </div>
      </div>
    </aside>
  )
}
