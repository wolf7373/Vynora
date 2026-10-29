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
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-vyn-primary/10 border border-vyn-primary/20 text-vyn-primary text-xs font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>3D WebGL Studio Engine</span>
          </div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-vyn-high">
            Audio Reactive Visualizer
          </h1>
        </div>

        {/* Controls: Mode Selector & Quality Preset */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Selector */}
          <div className="flex items-center gap-1.5 bg-vyn-elevated p-1 rounded-xl border border-vyn-border">
            {modes.map((item) => {
              const Icon = item.icon
              const isActive = visualizerMode === item.mode
              return (
                <button
                  key={item.mode}
                  onClick={() => setVisualizerMode(item.mode)}
                  className={`min-h-[44px] min-w-[44px] px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-vyn-primary text-vyn-canvas font-semibold shadow-glow-cyan'
                      : 'text-vyn-muted hover:text-vyn-high hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Quality Selector */}
          <div className="flex items-center gap-1 bg-vyn-elevated p-1 rounded-xl border border-vyn-border">
            <Sliders className="w-3.5 h-3.5 text-vyn-muted ml-2 mr-1" />
            {(['high', 'balanced', 'low'] as const).map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={`min-h-[44px] px-2.5 py-1 rounded-lg text-[11px] font-medium uppercase transition-all ${
                  quality === q
                    ? 'bg-white/10 text-vyn-primary font-bold'
                    : 'text-vyn-muted hover:text-vyn-high'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 3D Studio Stage Card */}
      <div className="glass-panel-elevated p-4 md:p-6 rounded-3xl border border-vyn-border relative overflow-hidden flex flex-col items-center justify-center min-h-[450px] shadow-2xl">
        {/* Subtle Ambient Background Glow */}
        <div className="absolute w-[500px] h-[500px] bg-vyn-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* REG-08 Indicator Badge & Track Metadata */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
          <div className="bg-canvas-base/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 pointer-events-auto">
            <span className="text-xs font-bold text-vyn-high block">
              {currentTrack ? `${currentTrack.title} — ${currentTrack.artist}` : 'Vynora 3D Visualizer'}
            </span>
            <span className="text-[10px] text-vyn-muted block">
              Mode: {visualizerMode} • Source: {activeSource || 'Standby'}
            </span>
          </div>

          <span
            className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border uppercase shadow-sm pointer-events-auto ${
              isRealFFT
                ? 'bg-vyn-primary/20 text-vyn-primary border-vyn-primary/40'
                : 'bg-vyn-accent/20 text-vyn-secondary border-vyn-secondary/40'
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
