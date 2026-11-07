import React, { useState, useEffect, useRef } from 'react'
import {
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Cpu,
  Activity,
} from 'lucide-react'

interface StemTrack {
  id: string
  name: string
  category: 'kick' | 'bass' | 'lead' | 'vocal'
  color: string
  volume: number
  isMuted: boolean
  isSolo: boolean
  steps: boolean[]
}

const INITIAL_STEMS: StemTrack[] = [
  {
    id: 'stem-kick',
    name: 'Analog Kick 909',
    category: 'kick',
    color: '#00F2FE',
    volume: 0.9,
    isMuted: false,
    isSolo: false,
    steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
  },
  {
    id: 'stem-bass',
    name: 'Moog Sub Bass 32Hz',
    category: 'bass',
    color: '#4FACFE',
    volume: 0.85,
    isMuted: false,
    isSolo: false,
    steps: [true, false, true, false, false, false, true, false, true, false, false, true, false, false, true, false],
  },
  {
    id: 'stem-lead',
    name: 'OB-Xa Polyphonic Synth',
    category: 'lead',
    color: '#38EF7D',
    volume: 0.75,
    isMuted: false,
    isSolo: false,
    steps: [false, false, true, false, false, true, false, false, false, true, false, false, true, false, false, true],
  },
  {
    id: 'stem-vocal',
    name: 'Harmonic Vocal Resonator',
    category: 'vocal',
    color: '#F59E0B',
    volume: 0.8,
    isMuted: false,
    isSolo: false,
    steps: [false, false, false, false, true, false, false, true, false, false, false, false, false, true, false, false],
  },
]

export const WorkstationView: React.FC = () => {
  const [bpm, setBpm] = useState<number>(124)
  const [isPlayingSeq, setIsPlayingSeq] = useState<boolean>(false)
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [stems, setStems] = useState<StemTrack[]>(INITIAL_STEMS)
  const [masterVolume, setMasterVolume] = useState<number>(0.85)
  const [activePreset, setActivePreset] = useState<string>('Tape Saturation')

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const stepTimerRef = useRef<number | null>(null)

  // Step sequencer clock
  useEffect(() => {
    if (!isPlayingSeq) {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current)
      return
    }

    const intervalMs = (60 / bpm / 4) * 1000
    stepTimerRef.current = window.setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 16)
    }, intervalMs)

    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current)
    }
  }, [isPlayingSeq, bpm])

  // Live Oscilloscope Waveform Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let phase = 0

    const render = () => {
      const width = canvas.width
      const height = canvas.height
      ctx.fillStyle = '#06080b'
      ctx.fillRect(0, 0, width, height)

      // Oscilloscope background grid
      ctx.strokeStyle = '#141820'
      ctx.lineWidth = 1
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Live waveform calculation from active stems
      ctx.beginPath()
      ctx.lineWidth = 2.5
      ctx.strokeStyle = '#00F2FE'
      ctx.shadowColor = '#00F2FE'
      ctx.shadowBlur = isPlayingSeq ? 12 : 2

      const centerY = height / 2
      const sliceWidth = width / 120

      for (let i = 0; i < 120; i++) {
        const x = i * sliceWidth
        const activeMultiplier = isPlayingSeq ? 1 : 0.15
        const wave =
          Math.sin(i * 0.15 + phase) * 24 * activeMultiplier +
          Math.sin(i * 0.05 - phase * 0.5) * 16 * activeMultiplier
        const y = centerY + wave

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.stroke()
      ctx.shadowBlur = 0
      phase += isPlayingSeq ? 0.08 : 0.01
      animFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isPlayingSeq])

  const toggleStep = (stemId: string, stepIdx: number) => {
    setStems((prev) =>
      prev.map((s) => {
        if (s.id !== stemId) return s
        const nextSteps = [...s.steps]
        nextSteps[stepIdx] = !nextSteps[stepIdx]
        return { ...s, steps: nextSteps }
      })
    )
  }

  const toggleMuteStem = (stemId: string) => {
    setStems((prev) =>
      prev.map((s) => (s.id === stemId ? { ...s, isMuted: !s.isMuted } : s))
    )
  }

  const toggleSoloStem = (stemId: string) => {
    setStems((prev) =>
      prev.map((s) => (s.id === stemId ? { ...s, isSolo: !s.isSolo } : s))
    )
  }

  const updateStemVolume = (stemId: string, val: number) => {
    setStems((prev) =>
      prev.map((s) => (s.id === stemId ? { ...s, volume: val } : s))
    )
  }

  const resetPattern = () => {
    setCurrentStep(0)
    setStems(INITIAL_STEMS)
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto select-none font-body text-vyn-high">
      {/* 1. WORKSTATION HARDWARE HEADER */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-vyn-border">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-vyn-primary/10 border border-vyn-primary/20 text-vyn-primary text-xs font-medium mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Ribbon hardware engine, low-latency audio</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-display font-extrabold tracking-tight text-white">
            Artist Audio Workstation
          </h1>
          <p className="text-xs text-vyn-muted mt-1 max-w-xl">
            Multi-stem sequencing, live oscilloscope DSP inspection, and lossless artist master mixing.
          </p>
        </div>

        {/* Master Transport & BPM Rack */}
        <div className="flex flex-wrap items-center gap-3 bg-vyn-surface p-3 rounded-2xl border border-vyn-border">
          <button
            onClick={() => setIsPlayingSeq(!isPlayingSeq)}
            aria-label={isPlayingSeq ? 'Pause Sequencer' : 'Start Sequencer'}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-vyn-primary text-vyn-canvas font-bold text-xs flex items-center gap-2 shadow-glow-cyan active:scale-95 transition-transform motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-vyn-primary focus-visible:outline-none"
          >
            {isPlayingSeq ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlayingSeq ? 'Halt clock' : 'Engage clock'}</span>
          </button>

          <button
            onClick={resetPattern}
            title="Reset Pattern"
            aria-label="Reset Pattern"
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-vyn-high border border-vyn-border flex items-center justify-center transition-colors active:scale-95 motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-vyn-primary focus-visible:outline-none"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* BPM Knob Control */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-vyn-canvas border border-white/5 text-xs">
            <span className="text-vyn-muted">Tempo</span>
            <input
              type="range"
              min={60}
              max={180}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              aria-label="Sequencer Tempo BPM"
              className="w-20 accent-vyn-primary cursor-pointer"
            />
            <span className="text-vyn-primary font-bold tabular-nums font-mono w-12 text-right">{bpm} BPM</span>
          </div>

          {/* Master Out Level */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-vyn-canvas border border-white/5 text-xs">
            <span className="text-vyn-muted">Out</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              aria-label="Master Level"
              className="w-16 accent-vyn-primary cursor-pointer"
            />
            <span className="text-vyn-high font-bold tabular-nums font-mono w-8 text-right">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>
        </div>
      </header>

      {/* 2. REAL-TIME DSP OSCILLOSCOPE MONITOR */}
      <section className="bg-vyn-surface rounded-2xl border border-vyn-border p-4 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2 text-vyn-muted">
            <Activity className="w-4 h-4 text-vyn-primary" />
            <span className="text-vyn-high font-bold">Real-time spectral oscilloscope</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono">44.1 kHz, 32-bit Float</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-vyn-muted">
            <span>Clock step: <strong className="text-vyn-primary font-mono">{(currentStep + 1).toString().padStart(2, '0')}/16</strong></span>
            <span>Latency: <strong className="text-accent-cyan font-mono">4.2ms</strong></span>
          </div>
        </div>

        <div className="w-full h-32 md:h-44 rounded-xl overflow-hidden border border-white/10 relative">
          <canvas
            ref={canvasRef}
            width={960}
            height={180}
            aria-label="Live audio frequency and waveform visualizer"
            className="w-full h-full block bg-vyn-canvas"
          />
        </div>
      </section>

      {/* 3. MULTI-STEM 16-STEP SEQUENCER RACK */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-vyn-primary" />
            <h2 className="text-lg font-display font-bold text-white">Stem Isolation & Step Matrix</h2>
          </div>
          <span className="text-xs text-vyn-muted">16 steps, quantized to 1/16 note</span>
        </div>

        <div className="space-y-3">
          {stems.map((stem) => (
            <div
              key={stem.id}
              className="p-3.5 rounded-2xl bg-vyn-surface border border-vyn-border hover:border-vyn-border/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors"
            >
              {/* Stem Info & Mixing Controls */}
              <div className="flex items-center gap-3 w-full md:w-64 flex-shrink-0">
                <span
                  className="w-2.5 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stem.color }}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-white truncate">{stem.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => toggleMuteStem(stem.id)}
                      className={`text-[10px] px-2 py-0.5 rounded font-bold transition-colors ${
                        stem.isMuted
                          ? 'bg-vyn-primary/20 text-vyn-primary border border-vyn-primary/40'
                          : 'bg-white/5 text-vyn-muted hover:text-white border border-white/10'
                      }`}
                    >
                      {stem.isMuted ? 'Muted' : 'Mute'}
                    </button>
                    <button
                      onClick={() => toggleSoloStem(stem.id)}
                      className={`text-[10px] px-2 py-0.5 rounded font-bold transition-colors ${
                        stem.isSolo
                          ? 'bg-vyn-primary/20 text-vyn-primary border border-vyn-primary/40'
                          : 'bg-white/5 text-vyn-muted hover:text-white border border-white/10'
                      }`}
                    >
                      Solo
                    </button>
                  </div>
                </div>

                {/* Level Slider */}
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={stem.volume}
                  onChange={(e) => updateStemVolume(stem.id, Number(e.target.value))}
                  aria-label={`${stem.name} level`}
                  className="w-16 accent-vyn-primary cursor-pointer"
                />
              </div>

              {/* 16 Matrix Step Triggers */}
              <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 flex-1 w-full">
                {stem.steps.map((active, stepIdx) => {
                  const isCurrent = currentStep === stepIdx && isPlayingSeq
                  const isBeatQuarter = stepIdx % 4 === 0

                  return (
                    <button
                      key={stepIdx}
                      onClick={() => toggleStep(stem.id, stepIdx)}
                      aria-label={`Step ${stepIdx + 1} for ${stem.name}`}
                      className={`min-h-[44px] min-w-[28px] rounded-lg text-[10px] font-mono font-bold flex flex-col items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-vyn-primary focus-visible:outline-none ${
                        isCurrent
                          ? 'ring-2 ring-white scale-105 z-10'
                          : isBeatQuarter
                          ? 'border border-white/20'
                          : 'border border-white/5'
                      } ${
                        active
                          ? 'bg-vyn-primary text-vyn-canvas shadow-glow-cyan'
                          : 'bg-vyn-elevated text-vyn-muted hover:bg-white/10'
                      }`}
                    >
                      <span>{(stepIdx + 1).toString().padStart(2, '0')}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HARDWARE DSP SIGNAL PROCESSOR RACK */}
      <section className="p-6 rounded-2xl bg-vyn-surface border border-vyn-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-vyn-primary" />
              <h2 className="text-lg font-display font-bold text-white">Analog Master Emulation Rack</h2>
            </div>
            <p className="text-xs text-vyn-muted">Zero-latency tube warmth, stereo widening, and harmonic saturation.</p>
          </div>

          <div className="flex items-center gap-2">
            {['Tape Saturation', 'Pultec EQ', 'SSL G-Bus Comp', 'Linear Phase'].map((preset) => (
              <button
                key={preset}
                onClick={() => setActivePreset(preset)}
                className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-vyn-primary ${
                  activePreset === preset
                    ? 'bg-vyn-primary/20 text-vyn-primary border border-vyn-primary/40'
                    : 'bg-white/5 text-vyn-muted hover:text-white border border-white/10'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Tube drive', value: '+4.2 dB', sub: 'Even Harmonics' },
            { label: 'Tape flutter', value: '0.08%', sub: 'Analog Wow' },
            { label: 'Stereo spread', value: '138%', sub: 'Haas Delay' },
            { label: 'Headroom', value: '-0.3 dB', sub: 'True Peak Limiter' },
          ].map((dial) => (
            <div
              key={dial.label}
              className="p-4 rounded-xl bg-vyn-elevated border border-white/5 text-center flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full border-2 border-vyn-primary/30 flex items-center justify-center mb-2 bg-vyn-canvas text-vyn-primary font-mono text-xs font-bold">
                {dial.value}
              </div>
              <span className="text-[11px] font-bold text-white">{dial.label}</span>
              <span className="text-[10px] text-vyn-muted">{dial.sub}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
