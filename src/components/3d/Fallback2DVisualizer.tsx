import React, { useEffect, useRef } from 'react'
import { Disc3 } from 'lucide-react'
import type { VisualizerMode } from '@/types'

interface Fallback2DVisualizerProps {
  mode: VisualizerMode
  isPlaying: boolean
  getAudioData: () => Uint8Array
}

export const Fallback2DVisualizer: React.FC<Fallback2DVisualizerProps> = ({
  mode,
  isPlaying,
  getAudioData,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const render = () => {
      const data = getAudioData()
      const width = canvas.width
      const height = canvas.height

      ctx.clearRect(0, 0, width, height)

      if (mode === 'turntable') {
        // Draw 2D vinyl disc representation
        const centerX = width / 2
        const centerY = height / 2
        const radius = Math.min(centerX, centerY) * 0.75

        // Outer vinyl disc
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.fillStyle = '#111318'
        ctx.fill()
        ctx.strokeStyle = '#00F2FE'
        ctx.lineWidth = 2
        ctx.stroke()

        // Grooves
        for (let r = radius * 0.4; r < radius * 0.9; r += 12) {
          ctx.beginPath()
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
          ctx.strokeStyle = '#181B22'
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        // Center label
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius * 0.28, 0, Math.PI * 2)
        ctx.fillStyle = '#00F2FE'
        ctx.fill()
      } else {
        // Draw 64-bin FFT spectrum bars
        const barCount = 64
        const barWidth = width / barCount

        for (let i = 0; i < barCount; i++) {
          const val = isPlaying ? data[i] || 0 : Math.sin(Date.now() * 0.003 + i * 0.1) * 25 + 30
          const barHeight = (val / 255) * (height - 20)

          const grad = ctx.createLinearGradient(0, height, 0, height - barHeight)
          grad.addColorStop(0, '#00F2FE')
          grad.addColorStop(0.5, '#4FACFE')
          grad.addColorStop(1, '#7F00FF')

          ctx.fillStyle = grad
          ctx.fillRect(i * barWidth + 1, height - barHeight, barWidth - 2, barHeight)
        }
      }

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
    }
  }, [mode, isPlaying, getAudioData])

  return (
    <div className="relative w-full h-full min-h-[380px] flex flex-col items-center justify-center p-6 bg-canvas-base/80 rounded-2xl border border-white/5">
      <div className="w-full max-w-lg h-56 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={240}
          className="w-full h-full rounded-xl bg-canvas-surface/40"
        />
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
        <Disc3 className="w-3.5 h-3.5 text-accent-cyan" />
        <span>2D Canvas Mode (WebGL Fallback Active)</span>
      </div>
    </div>
  )
}

