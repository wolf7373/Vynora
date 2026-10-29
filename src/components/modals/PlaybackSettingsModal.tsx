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
      className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-canvas-surface border border-white/10 rounded-2xl shadow-2xl p-6 text-text-primary"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-accent-cyan" />
            <h2 className="text-base font-bold tracking-wide">Playback & Crossfade Engine</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close playback settings modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crossfade Section */}
        <div className="my-5 p-4 rounded-xl bg-canvas-base border border-white/5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-vyn-high block">Smooth Crossfade</span>
              <span className="text-[11px] text-text-muted">
                Blends songs seamlessly without silent gaps
              </span>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                crossfadeSec > 0
                  ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30'
                  : 'bg-white/5 text-text-muted'
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
            className="w-full h-1.5 bg-canvas-elevated rounded-lg appearance-none cursor-pointer accent-accent-cyan"
          />

          {/* Quick Select Buttons */}
          <div className="flex items-center gap-1.5 justify-between pt-1">
            {PRESET_CROSSFADES.map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => handleCrossfadeChange(sec)}
                className={`flex-1 min-h-[44px] py-1 rounded-lg text-[11px] font-bold transition-all ${
                  crossfadeSec === sec
                    ? 'bg-accent-cyan text-canvas-base shadow-glow-cyan'
                    : 'bg-white/5 text-text-muted hover:text-white hover:bg-white/10'
                }`}
              >
                {sec === 0 ? 'Off' : `${sec}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Gapless Audio Engine Badge */}
        <div className="p-3.5 rounded-xl bg-canvas-base border border-white/5 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-vyn-high block">Gapless Audio Engine</span>
              <span className="text-[10px] text-text-muted">
                0ms pre-buffering buffer active for instant playback
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Active
          </span>
        </div>

        {/* Smart Vibe Autoplay Toggle */}
        <div className="p-3.5 rounded-xl bg-canvas-base border border-white/5 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-cyan/15 text-accent-cyan flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-vyn-high block">Spotify-Style Smart Autoplay</span>
              <span className="text-[10px] text-text-muted">
                Keeps playing similar genre hits when queue finishes
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleAutoplay}
            className={`min-h-[44px] px-3.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isAutoplay
                ? 'bg-accent-cyan text-canvas-base shadow-glow-cyan'
                : 'bg-white/10 text-text-muted hover:text-white'
            }`}
          >
            {isAutoplay ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* PWA App Installation Option */}
        <div className="p-3.5 rounded-xl bg-canvas-base border border-white/5 flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-vyn-primary/15 text-vyn-primary flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-vyn-high block">Install Mobile App (PWA)</span>
              <span className="text-[10px] text-text-muted">
                Add to Home Screen for Fullscreen & Lock-Screen Audio
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsInstallModalOpen(true)}
            className="min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-bold bg-vyn-primary text-vyn-canvas shadow-glow-cyan active:scale-95 transition-all cursor-pointer"
          >
            Install
          </button>
        </div>

        {/* Done Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-violet text-canvas-base font-bold text-xs shadow-md active:scale-95 transition-transform flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>

        <PWAInstallModal isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} />
      </div>
    </div>
  )
}

