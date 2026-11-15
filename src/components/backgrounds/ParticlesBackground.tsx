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
  mouseRef,
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
    const ctx = canvas.getContext('2d', { alpha: true })
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
      '#00F2FE',
      '#FFFFFF',
    ]

    // Optimized particle count: 80 on desktop, 45 on mobile
    const isMobile = width < 768
    const PARTICLE_COUNT = isMobile ? 45 : 80
    const particles: Particle[] = []

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.9,
        size: Math.random() * 2.2 + 0.8,
        color: particleColors[i % particleColors.length],
        alpha: Math.random() * 0.6 + 0.35,
        pulseSpeed: Math.random() * 0.03 + 0.015,
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      const m = mouseRef.current || { pixelX: width / 2, pixelY: height / 2, dirX: 0, dirY: 0 }
      const cursorX = m.pixelX
      const cursorY = m.pixelY

      // Ambient background gradient
      const bgGrad = ctx.createRadialGradient(
        cursorX,
        cursorY,
        40,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      )
      bgGrad.addColorStop(0, `${vibrantColors.primary}25`)
      bgGrad.addColorStop(0.5, `${vibrantColors.electric}15`)
      bgGrad.addColorStop(1, '#07080B')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      // Update & Draw Particles (Fast Batch)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Drift
        p.x += p.vx
        p.y += p.vy

        // Wrap around screen boundaries
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        if (p.y > height + 10) p.y = -10

        // Magnetic Attraction toward Cursor
        const dx = cursorX - p.x
        const dy = cursorY - p.y
        const distSq = dx * dx + dy * dy
        const maxDist = 240
        const maxDistSq = maxDist * maxDist

        if (distSq < maxDistSq && distSq > 100) {
          const dist = Math.sqrt(distSq)
          const force = (1 - dist / maxDist) * 0.4
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }

        // Friction dampening
        p.vx *= 0.97
        p.vy *= 0.97

        // Pulse size
        p.pulsePhase += p.pulseSpeed
        const pulse = Math.sin(p.pulsePhase) * 0.4
        const renderSize = Math.max(0.8, p.size + pulse + (isPlaying ? 0.5 : 0))

        // Draw particle without expensive shadowBlur
        ctx.beginPath()
        ctx.arc(p.x, p.y, renderSize, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha + (isPlaying ? 0.2 : 0)
        ctx.fill()

        // Constellation lines with nearby particles (capped to next 6 particles)
        const checkLimit = Math.min(particles.length, i + 6)
        for (let j = i + 1; j < checkLimit; j++) {
          const p2 = particles[j]
          const cdx = p.x - p2.x
          const cdy = p.y - p2.y
          const cdistSq = cdx * cdx + cdy * cdy
          if (cdistSq < 4900) {
            const lineAlpha = (1 - Math.sqrt(cdistSq) / 70) * 0.25
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = vibrantColors.primary
            ctx.globalAlpha = lineAlpha
            ctx.lineWidth = 0.8
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
  }, [vibrantColors, isPlaying])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block mix-blend-screen opacity-90 will-change-transform"
      />
      <div className="absolute inset-0 bg-radial-vignette opacity-35 pointer-events-none" />
    </div>
  )
}
