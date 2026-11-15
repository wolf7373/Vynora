import React, { useRef, useEffect } from 'react'
import type { BackgroundProps } from './AuroraBackground'

export const PlasmaBackground: React.FC<BackgroundProps> = ({
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

    let time = 0
    let blobX = width / 2
    let blobY = height / 2

    const render = () => {
      time += isPlaying ? 0.03 : 0.018
      ctx.clearRect(0, 0, width, height)

      // Base background
      ctx.fillStyle = '#07080B'
      ctx.fillRect(0, 0, width, height)

      // Smooth gravity pull toward mouse
      const targetBlobX = width / 2 + mousePos.dirX * (width * 0.22)
      const targetBlobY = height / 2 + mousePos.dirY * (height * 0.22)
      blobX += (targetBlobX - blobX) * 0.06
      blobY += (targetBlobY - blobY) * 0.06

      // Outer radial aura
      const auraGrad = ctx.createRadialGradient(
        blobX,
        blobY,
        50,
        blobX,
        blobY,
        Math.min(width, height) * 0.65
      )
      auraGrad.addColorStop(0, `${vibrantColors.primary}44`)
      auraGrad.addColorStop(0.4, `${vibrantColors.electric}25`)
      auraGrad.addColorStop(0.8, `${vibrantColors.accent}10`)
      auraGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = auraGrad
      ctx.fillRect(0, 0, width, height)

      // Draw multi-layered morphing liquid blob
      const baseRadius = Math.min(width, height) * 0.24 + (isPlaying ? Math.sin(time * 3) * 18 : 0)
      const numPoints = 64
      const angleStep = (Math.PI * 2) / numPoints

      // Secondary magnetic stretch toward cursor
      const dx = mousePos.pixelX - blobX
      const dy = mousePos.pixelY - blobY
      const mouseAngle = Math.atan2(dy, dx)
      const mouseDist = Math.sqrt(dx * dx + dy * dy)
      const stretchStrength = Math.min(1, 400 / (mouseDist + 1)) * 60

      const drawBlob = (radiusMod: number, alpha: number, color1: string, color2: string) => {
        ctx.save()
        ctx.beginPath()

        for (let i = 0; i <= numPoints; i++) {
          const angle = i * angleStep
          // Harmonic wave distortion
          const wave1 = Math.sin(angle * 3 + time * 1.5) * 22
          const wave2 = Math.cos(angle * 5 - time * 2) * 16
          const wave3 = Math.sin(angle * 7 + time) * 10

          // Directional stretch toward mouse
          const angleDiff = Math.cos(angle - mouseAngle)
          const stretch = Math.max(0, angleDiff) * stretchStrength

          const r = baseRadius * radiusMod + wave1 + wave2 + wave3 + stretch
          const px = blobX + Math.cos(angle) * r
          const py = blobY + Math.sin(angle) * r

          if (i === 0) {
            ctx.moveTo(px, py)
          } else {
            ctx.lineTo(px, py)
          }
        }

        ctx.closePath()
        const grad = ctx.createRadialGradient(blobX, blobY, 20, blobX, blobY, baseRadius * radiusMod + stretchStrength)
        grad.addColorStop(0, color1)
        grad.addColorStop(0.7, color2)
        grad.addColorStop(1, 'transparent')

        ctx.fillStyle = grad
        ctx.globalAlpha = alpha
        ctx.shadowColor = color2
        ctx.shadowBlur = 45
        ctx.fill()
        ctx.restore()
      }

      // Layer 1: Outer glowing fluid skirt
      drawBlob(1.15, 0.45, vibrantColors.electric, vibrantColors.accent)
      // Layer 2: Main liquid body
      drawBlob(0.95, 0.75, '#FFFFFF', vibrantColors.primary)
      // Layer 3: Inner bright mercury core
      drawBlob(0.65, 0.9, '#FFFFFF', vibrantColors.electric)

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
