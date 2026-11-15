import React, { useRef, useEffect } from 'react'
import type { BackgroundProps } from './AuroraBackground'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  pulseSpeed: number
  pulsePhase: number
}

export const ParticlesBackground: React.FC<BackgroundProps> = ({
  vibrantColors,
  isPlaying,
  mousePos,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const isTestEnv =
      import.meta.env?.MODE === 'test' ||
      (typeof globalThis !== 'undefined' &&
        (globalThis as any).process?.env?.NODE_ENV === 'test')
    if (isTestEnv) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Palette colors for particles
    const particleColors = [
      vibrantColors.primary,
      vibrantColors.electric,
      vibrantColors.accent,
      '#FFFFFF',
      '#00F2FE',
    ]

    const PARTICLE_COUNT = Math.min(160, Math.floor((width * height) / 8000))
    const particles: Particle[] = []

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2.2 + 1,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        alpha: Math.random() * 0.6 + 0.3,
        pulseSpeed: Math.random() * 0.03 + 0.015,
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    let time = 0

    const render = () => {
      time += 0.02
      ctx.clearRect(0, 0, width, height)

      // Ambient deep space background gradient
      const bgGrad = ctx.createRadialGradient(
        mousePos.pixelX,
        mousePos.pixelY,
        40,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.9
      )
      bgGrad.addColorStop(0, `${vibrantColors.electric}20`)
      bgGrad.addColorStop(0.5, `${vibrantColors.primary}12`)
      bgGrad.addColorStop(1, '#07080B')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      const mouseRadius = 180
      const mouseRadiusSq = mouseRadius * mouseRadius

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Normal drift
        p.x += p.vx
        p.y += p.vy

        // Screen wrap
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        if (p.y > height + 10) p.y = -10

        // Magnetic Cursor Attraction / Swirl
        const dx = mousePos.pixelX - p.x
        const dy = mousePos.pixelY - p.y
        const distSq = dx * dx + dy * dy

        if (distSq < mouseRadiusSq && distSq > 10) {
          const dist = Math.sqrt(distSq)
          const force = (1 - dist / mouseRadius) * 0.08
          // Pull toward cursor + slight perpendicular swirl
          p.vx += (dx / dist) * force - (dy / dist) * (force * 0.4)
          p.vy += (dy / dist) * force + (dx / dist) * (force * 0.4)
        }

        // Friction dampening to prevent infinite acceleration
        p.vx *= 0.98
        p.vy *= 0.98

        // Pulse size
        p.pulsePhase += p.pulseSpeed
        const pulse = Math.sin(p.pulsePhase) * 0.4
        const renderSize = Math.max(0.8, p.size + pulse + (isPlaying ? 0.6 : 0))

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, renderSize, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha + (isPlaying ? 0.2 : 0)
        ctx.shadowColor = p.color
        ctx.shadowBlur = renderSize * 4
        ctx.fill()

        // Constellation lines with adjacent particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const cdx = p.x - p2.x
          const cdy = p.y - p2.y
          const cdistSq = cdx * cdx + cdy * cdy
          if (cdistSq < 5500) {
            const lineAlpha = (1 - Math.sqrt(cdistSq) / 75) * 0.22
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = vibrantColors.primary
            ctx.globalAlpha = lineAlpha
            ctx.lineWidth = 0.7
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 1
      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animId)
    }
  }, [vibrantColors, isPlaying, mousePos])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block mix-blend-screen opacity-90"
      />
      <div className="absolute inset-0 bg-radial-vignette opacity-35 pointer-events-none" />
    </div>
  )
}
