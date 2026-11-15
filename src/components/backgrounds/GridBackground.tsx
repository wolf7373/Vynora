import React, { useRef, useEffect } from 'react'
import type { BackgroundProps } from './AuroraBackground'

export const GridBackground: React.FC<BackgroundProps> = ({
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

    let gridOffset = 0

    const render = () => {
      gridOffset = (gridOffset + (isPlaying ? 1.5 : 0.8)) % 40
      ctx.clearRect(0, 0, width, height)

      const m = mouseRef.current || { pixelX: width / 2, pixelY: height / 2, dirX: 0, dirY: 0 }

      // Base background
      ctx.fillStyle = '#07080B'
      ctx.fillRect(0, 0, width, height)

      // Horizon line position tilted with mouse
      const horizonY = height * 0.45 + m.dirY * 40
      const vanishingX = width / 2 + m.dirX * 90

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
        m.pixelX,
        m.pixelY,
        20,
        m.pixelX,
        m.pixelY,
        280
      )
      cursorPuddle.addColorStop(0, `${vibrantColors.primary}44`)
      cursorPuddle.addColorStop(0.5, `${vibrantColors.electric}20`)
      cursorPuddle.addColorStop(1, 'transparent')
      ctx.fillStyle = cursorPuddle
      ctx.fillRect(0, 0, width, height)

      // Batched perspective floor lines (Z-rays)
      ctx.beginPath()
      const numRays = 26
      for (let i = 0; i <= numRays; i++) {
        const bottomX = (width / numRays) * i
        ctx.moveTo(vanishingX, horizonY)
        ctx.lineTo(bottomX, height)
      }
      ctx.strokeStyle = vibrantColors.primary
      ctx.globalAlpha = 0.22
      ctx.lineWidth = 1
      ctx.stroke()

      // Batched horizontal grid lines with exponential perspective spacing
      ctx.beginPath()
      const numHoriz = 16
      for (let j = 0; j < numHoriz; j++) {
        const factor = Math.pow((j + gridOffset / 40) / numHoriz, 2.2)
        const lineY = horizonY + (height - horizonY) * factor
        ctx.moveTo(0, lineY)
        ctx.lineTo(width, lineY)
      }
      ctx.strokeStyle = vibrantColors.electric
      ctx.globalAlpha = 0.25
      ctx.lineWidth = 1
      ctx.stroke()

      // Horizon beam line
      ctx.beginPath()
      ctx.moveTo(0, horizonY)
      ctx.lineTo(width, horizonY)
      ctx.strokeStyle = vibrantColors.primary
      ctx.globalAlpha = 0.65
      ctx.lineWidth = 1.5
      ctx.stroke()

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
      <div className="absolute inset-0 bg-gradient-to-t from-[#07080B] via-transparent to-[#07080B]/80 pointer-events-none" />
    </div>
  )
}
