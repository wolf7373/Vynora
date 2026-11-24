import React, { useState } from 'react'
import { X, Sliders, Zap, Check, Sparkles, Download } from 'lucide-react'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { PWAInstallModal } from './PWAInstallModal'

interface PlaybackSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const PRESET_CROSSFADES = [0, 2, 4, 6, 8, 12]

export const PlaybackSettingsModal: React.FC<PlaybackSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [crossfadeSec, setCrossfadeSec] = useState<number>(() => {
    try {
      const val = localStorage.getItem('vynora_crossfade_sec')
      return val ? parseInt(val, 10) : 3
    } catch {
      return 3
    }
  })

  const { isAutoplay, toggleAutoplay } = usePlayerStore()
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false)

  if (!isOpen) return null

  const handleCrossfadeChange = (sec: number) => {
    setCrossfadeSec(sec)
    try {
      localStorage.setItem('vynora_crossfade_sec', sec.toString())
    } catch {
      // ignore
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Playback Settings"
      onClick={onClose}
      className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md liquid-glass-card rounded-[2.5rem] border border-white/20 shadow-2xl p-6 text-white overflow-hidden"
      >
        <div className="liquid-specular-edge pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-300" />
            <h2 className="text-base font-bold tracking-wide text-white">Playback & Crossfade Engine</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close playback settings modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full liquid-glass-pill text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crossfade Section */}
        <div className="my-5 p-4 rounded-2xl liquid-glass-pane border border-white/15 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Smooth Crossfade</span>
              <span className="text-[11px] text-white/60">
                Blends songs seamlessly without silent gaps
              </span>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                crossfadeSec > 0
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'bg-white/5 text-white/50'
              }`}
            >
              {crossfadeSec > 0 ? `${crossfadeSec}s` : 'Off'}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={12}
            step={1}
            value={crossfadeSec}
            onChange={(e) => handleCrossfadeChange(parseInt(e.target.value, 10))}
            aria-label="Crossfade slider"
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />

          {/* Quick Select Buttons */}
          <div className="flex items-center gap-1.5 justify-between pt-1">
            {PRESET_CROSSFADES.map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => handleCrossfadeChange(sec)}
                className={`flex-1 min-h-[44px] py-1 rounded-xl text-[11px] font-bold transition-all ${
                  crossfadeSec === sec
                    ? 'bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 font-bold shadow-md'
                    : 'liquid-glass-pill border-white/10 text-white/70 hover:text-white hover:border-white/20'
                }`}
              >
                {sec === 0 ? 'Off' : `${sec}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Gapless Audio Engine Badge */}
        <div className="p-3.5 rounded-2xl liquid-glass-pane border border-white/15 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Gapless Audio Engine</span>
              <span className="text-[10px] text-white/60">
                0ms pre-buffering buffer active for instant playback
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Active
          </span>
        </div>

        {/* Smart Vibe Autoplay Toggle */}
        <div className="p-3.5 rounded-2xl liquid-glass-pane border border-white/15 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Smart Autoplay</span>
              <span className="text-[10px] text-white/60">
                Keeps playing similar songs when your queue finishes
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleAutoplay}
            className={`min-h-[44px] px-3.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isAutoplay
                ? 'bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 font-bold shadow-md'
                : 'liquid-glass-pill border-white/10 text-white/70 hover:text-white'
            }`}
          >
            {isAutoplay ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* PWA App Installation Option */}
        <div className="p-3.5 rounded-2xl liquid-glass-pane border border-white/15 flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center border border-white/15">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Install App on Device</span>
              <span className="text-[10px] text-white/60">
                Add to Home Screen for Fullscreen & Lock-Screen Audio
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsInstallModalOpen(true)}
            className="min-h-[44px] px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Install
          </button>
        </div>

        {/* Done Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 font-bold text-xs shadow-md active:scale-95 transition-transform flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Done</span>
          </button>
        </div>

        <PWAInstallModal isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} />
      </div>
    </div>
  )
}

