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
      <div className="p-3.5 rounded-2xl liquid-glass-card border border-white/15 shadow-md">
        <span className="text-[10px] text-white/60 uppercase tracking-wider block mb-0.5">Status & Source</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold capitalize text-amber-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {status}
          </span>
          {/* REG-08: Real vs Simulated FFT Badge */}
          {activeSource && (
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase border ${
                isRealFFT
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                  : 'bg-rose-400/20 text-rose-300 border-rose-400/30'
              }`}
            >
              {isRealFFT ? 'REAL FFT' : 'BEAT SIM'}
            </span>
          )}
        </div>
      </div>

      <div className="p-3.5 rounded-2xl liquid-glass-card border border-white/15 shadow-md">
        <span className="text-[10px] text-white/60 uppercase tracking-wider block mb-0.5">Track</span>
        <span className="text-xs font-semibold text-white truncate block" title={currentTrack?.title}>
          {currentTrack ? `${currentTrack.title} — ${currentTrack.artist}` : 'None loaded'}
        </span>
      </div>

      <div className="p-3.5 rounded-2xl liquid-glass-card border border-white/15 shadow-md">
        <span className="text-[10px] text-white/60 uppercase tracking-wider block mb-0.5">Timeline</span>
        <span className="text-xs font-semibold text-white tabular-nums block">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <div className="p-3.5 rounded-2xl liquid-glass-card border border-white/15 shadow-md">
        <span className="text-[10px] text-white/60 uppercase tracking-wider block mb-0.5">Queue & Mode</span>
        <span className="text-xs font-semibold text-white capitalize block truncate">
          {queue.length}t (idx {currentIndex}) • {repeatMode} • {isShuffle ? 'shf' : 'ord'}
        </span>
      </div>
    </div>
  )
}
