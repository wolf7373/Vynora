import React, { useRef, useEffect } from 'react'
import type { BackgroundProps } from './AuroraBackground'

export const GridBackground: React.FC<BackgroundProps> = ({
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

    let gridOffset = 0

    const render = () => {
      gridOffset = (gridOffset + (isPlaying ? 1.6 : 0.8)) % 50
      ctx.clearRect(0, 0, width, height)

      // Base background
      ctx.fillStyle = '#07080B'
      ctx.fillRect(0, 0, width, height)

      // Horizon line position tilted with mouse
      const horizonY = height * 0.45 + mousePos.dirY * 40
      const vanishingX = width / 2 + mousePos.dirX * 90

      // Horizon atmospheric glow
      const horizonGlow = ctx.createRadialGradient(
        vanishingX,
        horizonY,
        10,
        vanishingX,
        horizonY,
        width * 0.75
      )
      horizonGlow.addColorStop(0, `${vibrantColors.primary}55`)
      horizonGlow.addColorStop(0.3, `${vibrantColors.electric}30`)
      horizonGlow.addColorStop(0.7, `${vibrantColors.accent}15`)
      horizonGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = horizonGlow
      ctx.fillRect(0, 0, width, height)

      // Specular cursor puddle
      const cursorPuddle = ctx.createRadialGradient(
        mousePos.pixelX,
        mousePos.pixelY,
        20,
        mousePos.pixelX,
        mousePos.pixelY,
        350
      )
      cursorPuddle.addColorStop(0, `${vibrantColors.primary}45`)
      cursorPuddle.addColorStop(0.5, `${vibrantColors.electric}20`)
      cursorPuddle.addColorStop(1, 'transparent')
      ctx.fillStyle = cursorPuddle
      ctx.fillRect(0, 0, width, height)

      // Perspective Grid Floor Lines
      ctx.save()

      // 1. Vertical perspective lines radiating from vanishing point
      const numRays = 32
      for (let i = -numRays / 2; i <= numRays / 2; i++) {
        const bottomX = width / 2 + i * (width / (numRays * 0.45))
        ctx.beginPath()
        ctx.moveTo(vanishingX, horizonY)
        ctx.lineTo(bottomX, height)
        ctx.strokeStyle = `${vibrantColors.primary}25`
        ctx.lineWidth = 1.2
        ctx.stroke()
      }

      // 2. Horizontal depth lines with exponential spacing
      const numHoriz = 24
      for (let i = 1; i <= numHoriz; i++) {
        // Exponential spacing for 3D depth
        const progress = Math.pow(i / numHoriz, 2.4)
        const y = horizonY + (height - horizonY) * progress + (gridOffset * progress * 0.2)

        if (y > horizonY && y < height) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          const lineAlpha = (progress * 0.45).toFixed(3)
          ctx.strokeStyle = `rgba(0, 242, 254, ${lineAlpha})`
          ctx.lineWidth = 1 + progress * 1.5
          ctx.stroke()
        }
      }

      ctx.restore()

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
        className="w-full h-full block mix-blend-screen opacity-85"
      />
      <div className="absolute inset-0 bg-radial-vignette opacity-35 pointer-events-none" />
    </div>
  )
}
