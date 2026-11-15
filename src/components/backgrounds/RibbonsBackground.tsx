import React, { useRef, useEffect } from 'react'
import type { BackgroundProps } from './AuroraBackground'

export const RibbonsBackground: React.FC<BackgroundProps> = ({
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

    const ribbonLayers = [
      { color1: vibrantColors.primary, color2: vibrantColors.electric, speed: 0.012, amp: 85, freq: 0.003, yOffset: 0.28 },
      { color1: vibrantColors.electric, color2: vibrantColors.accent, speed: 0.016, amp: 105, freq: 0.0025, yOffset: 0.44 },
      { color1: vibrantColors.accent, color2: '#00F2FE', speed: 0.014, amp: 95, freq: 0.0035, yOffset: 0.60 },
      { color1: '#00F2FE', color2: vibrantColors.secondary, speed: 0.018, amp: 115, freq: 0.002, yOffset: 0.76 },
    ]

    const render = () => {
      time += isPlaying ? 0.022 : 0.014
      ctx.clearRect(0, 0, width, height)

      // Base background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height)
      bgGrad.addColorStop(0, '#07080B')
      bgGrad.addColorStop(0.5, '#0C0F17')
      bgGrad.addColorStop(1, '#07080B')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      // Ambient mouse glow
      const mouseGlow = ctx.createRadialGradient(
        mousePos.pixelX,
        mousePos.pixelY,
        20,
        mousePos.pixelX,
        mousePos.pixelY,
        400
      )
      mouseGlow.addColorStop(0, `${vibrantColors.primary}35`)
      mouseGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = mouseGlow
      ctx.fillRect(0, 0, width, height)

      // Render undulating silk ribbons
      ribbonLayers.forEach((ribbon, idx) => {
        ctx.save()
        const baseCy = height * ribbon.yOffset + mousePos.dirY * 45

        // Gradient for ribbon
        const ribbonGrad = ctx.createLinearGradient(0, baseCy - 100, width, baseCy + 100)
        ribbonGrad.addColorStop(0, `${ribbon.color1}40`)
        ribbonGrad.addColorStop(0.5, `${ribbon.color2}65`)
        ribbonGrad.addColorStop(1, `${ribbon.color1}15`)

        ctx.fillStyle = ribbonGrad
        ctx.beginPath()
        ctx.moveTo(0, height)
        ctx.lineTo(0, baseCy)

        const step = 20
        for (let x = 0; x <= width; x += step) {
          // Distance to mouse for cursor pull
          const mouseDist = Math.abs(x - mousePos.pixelX)
          const mousePull = Math.max(0, 1 - mouseDist / 350) * (mousePos.dirY * 65)

          const wave1 = Math.sin(x * ribbon.freq + time * (idx + 1) * 0.7) * ribbon.amp
          const wave2 = Math.cos(x * ribbon.freq * 1.5 - time * 0.5) * (ribbon.amp * 0.4)
          const y = baseCy + wave1 + wave2 + mousePull

          ctx.lineTo(x, y)
        }

        ctx.lineTo(width, height)
        ctx.closePath()
        ctx.shadowColor = ribbon.color2
        ctx.shadowBlur = 35
        ctx.fill()
        ctx.restore()
      })

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
      <div className="absolute inset-0 bg-radial-vignette opacity-30 pointer-events-none" />
    </div>
  )
}
