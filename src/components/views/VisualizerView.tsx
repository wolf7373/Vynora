import React, { useState } from 'react'
import { Disc3, Waves, Box, Sparkles, Sliders } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { PlaybackAdapterManager } from '@/adapters'
import { isWebGLAvailable } from '@/components/3d/webglCheck'
import { ThreeStudioCanvas } from '@/components/3d/ThreeStudioCanvas'
import { Fallback2DVisualizer } from '@/components/3d/Fallback2DVisualizer'
import type { VisualizerMode } from '@/types'

export const VisualizerView: React.FC = () => {
  const { visualizerMode, setVisualizerMode } = useUIStore()
  const { currentTrack, isPlaying, activeSource } = usePlayerStore()
  const [quality, setQuality] = useState<'high' | 'balanced' | 'low'>('high')
  const [hasWebGL] = useState<boolean>(() => isWebGLAvailable())

  const adapterManager = PlaybackAdapterManager.getInstance()
  const isRealFFT = adapterManager.isRealFFT()

  const modes: { mode: VisualizerMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { mode: 'turntable', label: '33 RPM Turntable', icon: Disc3 },
    { mode: 'waves', label: 'Particle Waves', icon: Waves },
    { mode: 'tunnel', label: 'Cyber Tunnel', icon: Box },
  ]

  const getAudioData = () => adapterManager.getAudioData()

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto select-none">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill border-amber-400/30 text-amber-300 text-xs font-medium mb-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-bold">3D WebGL Studio Engine</span>
          </div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-white">
            Audio Reactive Visualizer
          </h1>
        </div>

        {/* Controls: Mode Selector & Quality Preset */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Selector */}
          <div className="flex items-center gap-1.5 liquid-glass-pane p-1.5 rounded-2xl border border-white/15">
            {modes.map((item) => {
              const Icon = item.icon
              const isActive = visualizerMode === item.mode
              return (
                <button
                  key={item.mode}
                  onClick={() => setVisualizerMode(item.mode)}
                  className={`min-h-[44px] min-w-[44px] px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-vyn-primary bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 font-bold shadow-md'
                      : 'text-white/60 hover:text-white liquid-glass-pill'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Quality Selector */}
          <div className="flex items-center gap-1 liquid-glass-pane p-1.5 rounded-2xl border border-white/15">
            <Sliders className="w-3.5 h-3.5 text-white/50 ml-2 mr-1" />
            {(['high', 'balanced', 'low'] as const).map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={`min-h-[44px] px-3 py-1 rounded-xl text-[11px] font-medium uppercase transition-all cursor-pointer ${
                  quality === q
                    ? 'bg-white/10 bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 3D Studio Stage Card */}
      <div className="liquid-glass-card p-4 md:p-6 rounded-[2.5rem] border border-white/20 relative overflow-hidden flex flex-col items-center justify-center min-h-[450px] shadow-2xl">
        <div className="liquid-specular-edge pointer-events-none" />

        {/* REG-08 Indicator Badge & Track Metadata */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
          <div className="liquid-glass-pane backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/20 pointer-events-auto shadow-lg">
            <span className="text-xs font-bold text-white block">
              {currentTrack ? `${currentTrack.title} — ${currentTrack.artist}` : 'Vynora 3D Visualizer'}
            </span>
            <span className="text-[10px] text-white/60 block">
              Mode: {visualizerMode} • Source: {activeSource || 'Standby'}
            </span>
          </div>

          <span
            className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border uppercase shadow-sm pointer-events-auto ${
              isRealFFT
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-glow-amber'
                : 'bg-rose-400/20 text-rose-300 border-rose-400/40'
            }`}
          >
            {isRealFFT ? 'REAL FFT (64-BIN)' : 'BEAT SIM (64-BIN)'}
          </span>
        </div>

        {/* 3D WebGL Canvas or 2D Fallback */}
        <div className="w-full h-[450px] z-10 flex items-center justify-center mt-6">
          {hasWebGL ? (
            <ThreeStudioCanvas
              mode={visualizerMode}
              isPlaying={isPlaying}
              quality={quality}
              getAudioData={getAudioData}
            />
          ) : (
            <Fallback2DVisualizer
              mode={visualizerMode}
              isPlaying={isPlaying}
              getAudioData={getAudioData}
            />
          )}
        </div>
      </div>
    </div>
  )
}
