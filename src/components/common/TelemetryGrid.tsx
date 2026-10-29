import React from 'react'
import { usePlayerStore, useQueueStore } from '@/stores'
import { formatTime } from '@/utils/formatTime'
import { PlaybackAdapterManager } from '@/adapters'

export const TelemetryGrid: React.FC = () => {
  const { status, repeatMode, isShuffle, currentTime, duration, activeSource } = usePlayerStore()
  const { queue, currentIndex, getCurrentTrack } = useQueueStore()
  const currentTrack = getCurrentTrack()
  const isRealFFT = PlaybackAdapterManager.getInstance().isRealFFT()

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
      <div className="p-3 rounded-xl bg-vyn-surface/80 border border-vyn-border">
        <span className="text-[10px] text-vyn-muted uppercase tracking-wider block mb-0.5">Status & Source</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold capitalize text-vyn-primary flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-vyn-primary animate-pulse" />
            {status}
          </span>
          {/* REG-08: Real vs Simulated FFT Badge */}
          {activeSource && (
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold tracking-wider uppercase border ${
                isRealFFT
                  ? 'bg-vyn-primary/10 text-vyn-primary border-vyn-primary/30'
                  : 'bg-vyn-accent/10 text-vyn-secondary border-vyn-secondary/30'
              }`}
            >
              {isRealFFT ? 'REAL FFT' : 'BEAT SIM'}
            </span>
          )}
        </div>
      </div>

      <div className="p-3 rounded-xl bg-vyn-surface/80 border border-vyn-border">
        <span className="text-[10px] text-vyn-muted uppercase tracking-wider block mb-0.5">Track</span>
        <span className="text-xs font-semibold text-vyn-high truncate block" title={currentTrack?.title}>
          {currentTrack ? `${currentTrack.title} — ${currentTrack.artist}` : 'None loaded'}
        </span>
      </div>

      <div className="p-3 rounded-xl bg-vyn-surface/80 border border-vyn-border">
        <span className="text-[10px] text-vyn-muted uppercase tracking-wider block mb-0.5">Timeline</span>
        <span className="text-xs font-semibold text-vyn-high tabular-nums block">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <div className="p-3 rounded-xl bg-vyn-surface/80 border border-vyn-border">
        <span className="text-[10px] text-vyn-muted uppercase tracking-wider block mb-0.5">Queue & Mode</span>
        <span className="text-xs font-semibold text-vyn-high capitalize block truncate">
          {queue.length}t (idx {currentIndex}) • {repeatMode} • {isShuffle ? 'shf' : 'ord'}
        </span>
      </div>
    </div>
  )
}
