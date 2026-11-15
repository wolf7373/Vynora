import React, { useRef, useEffect } from 'react'
import type { BackgroundProps } from './AuroraBackground'

export const PlasmaBackground: React.FC<BackgroundProps> = ({
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

    let time = 0
    let blobX = width / 2
    let blobY = height / 2

    const render = () => {
      time += isPlaying ? 0.03 : 0.018
      ctx.clearRect(0, 0, width, height)

      const m = mouseRef.current || { pixelX: width / 2, pixelY: height / 2, dirX: 0, dirY: 0 }

      // Base background
      ctx.fillStyle = '#07080B'
      ctx.fillRect(0, 0, width, height)

      // Smooth gravity pull toward mouse
      const targetBlobX = width / 2 + m.dirX * (width * 0.22)
      const targetBlobY = height / 2 + m.dirY * (height * 0.22)
      blobX += (targetBlobX - blobX) * 0.08
      blobY += (targetBlobY - blobY) * 0.08

      // Outer radial aura
      const auraGrad = ctx.createRadialGradient(
        blobX,
        blobY,
        50,
        blobX,
        blobY,
        Math.min(width, height) * 0.65
      )
      auraGrad.addColorStop(0, `${vibrantColors.primary}50`)
      auraGrad.addColorStop(0.35, `${vibrantColors.electric}25`)
      auraGrad.addColorStop(0.7, `${vibrantColors.accent}12`)
      auraGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = auraGrad
      ctx.fillRect(0, 0, width, height)

      // Morphing Blob Core
      const baseRadius = Math.min(width, height) * 0.22 + (isPlaying ? 15 : 0)
      const points = 10
      const angleStep = (Math.PI * 2) / points

      ctx.beginPath()
      const coords: { x: number; y: number }[] = []

      for (let i = 0; i < points; i++) {
        const theta = i * angleStep
        const wave1 = Math.sin(theta * 3 + time * 1.5) * 32
        const wave2 = Math.cos(theta * 2 - time * 2.2) * 22
        const r = baseRadius + wave1 + wave2

        // Stretch toward mouse cursor
        const toMouseAngle = Math.atan2(m.pixelY - blobY, m.pixelX - blobX)
        const angleDiff = Math.abs(theta - toMouseAngle)
        const stretchFactor = Math.max(0, Math.cos(angleDiff)) * 45

        const px = blobX + Math.cos(theta) * (r + stretchFactor)
        const py = blobY + Math.sin(theta) * (r + stretchFactor)
        coords.push({ x: px, y: py })
      }

      // Smooth bezier loop through points
      ctx.moveTo((coords[0].x + coords[points - 1].x) / 2, (coords[0].y + coords[points - 1].y) / 2)
      for (let i = 0; i < points; i++) {
        const p1 = coords[i]
        const p2 = coords[(i + 1) % points]
        const midX = (p1.x + p2.x) / 2
        const midY = (p1.y + p2.y) / 2
        ctx.quadraticCurveTo(p1.x, p1.y, midX, midY)
      }
      ctx.closePath()

      // Bioluminescent Plasma Core Gradient
      const plasmaGrad = ctx.createRadialGradient(
        blobX,
        blobY,
        20,
        blobX,
        blobY,
        baseRadius * 1.4
      )
      plasmaGrad.addColorStop(0, '#FFFFFF')
      plasmaGrad.addColorStop(0.2, vibrantColors.primary)
      plasmaGrad.addColorStop(0.55, vibrantColors.electric)
      plasmaGrad.addColorStop(0.85, vibrantColors.accent)
      plasmaGrad.addColorStop(1, 'transparent')

      ctx.fillStyle = plasmaGrad
      ctx.globalAlpha = 0.8
      ctx.fill()

      // Specular rim stroke
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 1.2
      ctx.globalAlpha = 0.4
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
      <div className="absolute inset-0 bg-radial-vignette opacity-25 pointer-events-none" />
    </div>
  )
}
