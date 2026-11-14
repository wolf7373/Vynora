import React, { useState, useEffect } from 'react'
import { X, Clock, Check, PowerOff } from 'lucide-react'
import { SleepTimerManager, type SleepTimerMode } from '@/services/playback/sleepTimerManager'

interface SleepTimerModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ isOpen, onClose }) => {
  const [activeMode, setActiveMode] = useState<SleepTimerMode>(null)
  const [remainingSec, setRemainingSec] = useState<number | null>(null)

  useEffect(() => {
    const timerManager = SleepTimerManager.getInstance()
    return timerManager.subscribe((rem, mode) => {
      setRemainingSec(rem)
      setActiveMode(mode)
    })
  }, [])

  if (!isOpen) return null

  const options = [
    { label: '5 minutes', value: 5 },
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '45 minutes', value: 45 },
    { label: '1 hour', value: 60 },
    { label: 'End of track', value: 'end_of_track' as const },
  ]

  const formatCountdown = (sec: number | null) => {
    if (!sec || sec <= 0) return '0:00'
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const handleSelect = (val: number | 'end_of_track') => {
    SleepTimerManager.getInstance().setTimer(val)
    onClose()
  }

  const handleTurnOff = () => {
    SleepTimerManager.getInstance().setTimer(null)
  }

  return (
    <div
      role="dialog"
      aria-label="Sleep Timer"
      onClick={onClose}
      className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm liquid-glass-card rounded-[2.5rem] border border-white/20 shadow-2xl p-6 text-white overflow-hidden"
      >
        <div className="liquid-specular-edge pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-300" />
            <h2 className="text-base font-bold tracking-wide text-white">Sleep Timer</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sleep timer modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full liquid-glass-pill text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Timer Indicator */}
        {activeMode && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-400/15 border border-amber-400/40 my-3 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-300">
                {activeMode === 'end_of_track'
                  ? 'Pauses at end of track'
                  : `Active: ${formatCountdown(remainingSec)} left`}
              </span>
            </div>
            <button
              onClick={handleTurnOff}
              className="min-h-[44px] text-xs text-rose-300 hover:text-rose-200 font-bold px-3 py-1 rounded-xl liquid-glass-pill border-rose-400/30 hover:border-rose-400/60 flex items-center gap-1 transition-colors"
            >
              <PowerOff className="w-3.5 h-3.5" />
              <span>Turn off</span>
            </button>
          </div>
        )}

        <p className="text-xs text-white/60 mt-2 mb-3">
          Audio will smoothly fade out and pause when the timer expires.
        </p>

        {/* Options List */}
        <div className="flex flex-col gap-2">
          {options.map((opt) => {
            const isSelected =
              (opt.value === 'end_of_track' && activeMode === 'end_of_track') ||
              (typeof opt.value === 'number' &&
                activeMode === 'time' &&
                remainingSec !== null &&
                Math.round(remainingSec / 60) === opt.value)

            return (
              <button
                key={opt.label}
                onClick={() => handleSelect(opt.value)}
                className={`min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 font-bold shadow-lg'
                    : 'liquid-glass-pill border-white/10 hover:border-white/20 text-white/80 hover:text-white'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

