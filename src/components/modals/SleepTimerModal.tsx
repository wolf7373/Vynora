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
      className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-canvas-surface border border-white/10 rounded-2xl shadow-2xl p-6 text-text-primary"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent-cyan" />
            <h2 className="text-base font-bold tracking-wide">Sleep Timer</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sleep timer modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Timer Indicator */}
        {activeMode && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 my-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
              <span className="text-xs font-bold text-accent-cyan">
                {activeMode === 'end_of_track'
                  ? 'Pauses at end of track'
                  : `Active: ${formatCountdown(remainingSec)} left`}
              </span>
            </div>
            <button
              onClick={handleTurnOff}
              className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 flex items-center gap-1 transition-colors"
            >
              <PowerOff className="w-3 h-3" />
              <span>Turn off</span>
            </button>
          </div>
        )}

        <p className="text-xs text-text-muted mt-2 mb-3">
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
                className={`min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-accent-cyan text-canvas-base shadow-glow-cyan font-bold'
                    : 'bg-white/5 text-text-secondary hover:text-white hover:bg-white/10'
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

