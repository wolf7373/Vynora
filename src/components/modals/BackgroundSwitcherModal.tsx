import React, { useEffect } from 'react'
import {
  X,
  Sparkles,
  Droplets,
  Waves,
  Wind,
  Disc3,
  Grid,
  Check,
  type LucideIcon,
} from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import type { BackgroundStyle } from '@/types/ui'

interface StyleOption {
  id: BackgroundStyle
  title: string
  subtitle: string
  icon: LucideIcon
  badge: string
  accentColor: string
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'aurora',
    title: 'Fluid Aurora',
    subtitle: 'Smooth colorful lights flowing like the Northern Lights',
    icon: Waves,
    badge: 'Popular',
    accentColor: '#00F2FE',
  },
  {
    id: 'ripples',
    title: 'Water Ripples',
    subtitle: 'Calming water surface that ripples with your touch',
    icon: Droplets,
    badge: 'Relaxing',
    accentColor: '#38BDF8',
  },
  {
    id: 'particles',
    title: 'Cosmic Stardust',
    subtitle: 'Glowing stars that float and follow your movement',
    icon: Sparkles,
    badge: 'Cosmic',
    accentColor: '#8B5CF6',
  },
  {
    id: 'ribbons',
    title: 'Silk Ribbons',
    subtitle: 'Smooth flowing ribbons that sway with your motion',
    icon: Wind,
    badge: 'Smooth',
    accentColor: '#EC4899',
  },
  {
    id: 'plasma',
    title: 'Energy Glow',
    subtitle: 'Vibrant glowing sphere pulsing with the beat',
    icon: Disc3,
    badge: 'Dynamic',
    accentColor: '#F59E0B',
  },
  {
    id: 'grid',
    title: 'Neon Horizon',
    subtitle: 'Futuristic neon grid with ambient reflections',
    icon: Grid,
    badge: 'Neon',
    accentColor: '#10B981',
  },
]

export const BackgroundSwitcherModal: React.FC = () => {
  const {
    isBackgroundSwitcherOpen,
    setIsBackgroundSwitcherOpen,
    backgroundStyle,
    setBackgroundStyle,
  } = useUIStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isBackgroundSwitcherOpen) {
        setIsBackgroundSwitcherOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isBackgroundSwitcherOpen, setIsBackgroundSwitcherOpen])

  if (!isBackgroundSwitcherOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bg-switcher-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl transition-all duration-300 animate-fade-in"
      onClick={() => setIsBackgroundSwitcherOpen(false)}
    >
      <div
        className="w-full max-w-2xl heavy-liquid-glass-chassis rounded-3xl p-6 sm:p-7 border border-white/20 shadow-2xl relative overflow-hidden flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="liquid-specular-edge pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl liquid-glass-pill flex items-center justify-center border-cyan-400/30 shadow-glow-cyan">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h2 id="bg-switcher-title" className="text-base sm:text-lg font-bold text-white">
                Background Themes
              </h2>
              <p className="text-xs text-white/60">
                Choose an animated theme for your music experience
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBackgroundSwitcherOpen(false)}
            aria-label="Close background switcher"
            className="min-h-[44px] min-w-[44px] w-10 h-10 rounded-full liquid-glass-pill flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer border-white/15"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 6 Visual Background Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
          {STYLE_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = backgroundStyle === option.id

            return (
              <button
                key={option.id}
                onClick={() => {
                  setBackgroundStyle(option.id)
                }}
                className={`group relative p-4 rounded-2xl flex items-start gap-3.5 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'liquid-glass-card border-cyan-400/60 bg-white/15 shadow-glow-cyan scale-[1.02]'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 active:scale-98'
                }`}
              >
                {/* Icon Pod */}
                <div
                  className="w-11 h-11 rounded-xl liquid-glass-pill flex items-center justify-center flex-shrink-0 border border-white/20 transition-transform group-hover:scale-110"
                  style={{
                    boxShadow: isSelected ? `0 0 16px ${option.accentColor}80` : undefined,
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: isSelected ? option.accentColor : '#FFFFFF' }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {option.title}
                    </span>
                    <span
                      className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border border-white/15 text-white/75 bg-white/5"
                    >
                      {option.badge}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-1 leading-snug line-clamp-2">
                    {option.subtitle}
                  </p>
                </div>

                {/* Selection Checkmark */}
                {isSelected && (
                  <div className="absolute right-3.5 top-3.5 w-6 h-6 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-md animate-scale-up">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-white/50">
          <span>Themes react to your music and touch</span>
          <span className="text-cyan-400 font-bold">Tap any style to apply</span>
        </div>
      </div>
    </div>
  )
}
