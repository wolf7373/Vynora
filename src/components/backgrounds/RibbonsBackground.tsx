import React, { useRef, useEffect } from 'react'
import type { BackgroundProps } from './AuroraBackground'

export const RibbonsBackground: React.FC<BackgroundProps> = ({
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

    const ribbonLayers = [
      { color1: vibrantColors.primary, color2: vibrantColors.electric, speed: 0.014, amp: 85, freq: 0.003, yOffset: 0.28 },
      { color1: vibrantColors.electric, color2: vibrantColors.accent, speed: 0.018, amp: 105, freq: 0.0025, yOffset: 0.44 },
      { color1: vibrantColors.accent, color2: '#00F2FE', speed: 0.016, amp: 95, freq: 0.0035, yOffset: 0.60 },
      { color1: '#00F2FE', color2: vibrantColors.secondary, speed: 0.02, amp: 115, freq: 0.002, yOffset: 0.76 },
    ]

    const render = () => {
      time += isPlaying ? 0.022 : 0.014
      ctx.clearRect(0, 0, width, height)

      const m = mouseRef.current || { pixelX: width / 2, pixelY: height / 2, dirX: 0, dirY: 0 }

      // Base background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height)
      bgGrad.addColorStop(0, '#07080B')
      bgGrad.addColorStop(0.5, '#0C0F17')
      bgGrad.addColorStop(1, '#07080B')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      // Ambient mouse glow
      const mouseGlow = ctx.createRadialGradient(
        m.pixelX,
        m.pixelY,
        20,
        m.pixelX,
        m.pixelY,
        350
      )
      mouseGlow.addColorStop(0, `${vibrantColors.primary}35`)
      mouseGlow.addColorStop(0.5, `${vibrantColors.electric}15`)
      mouseGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = mouseGlow
      ctx.fillRect(0, 0, width, height)

      // Draw undulating silk ribbons with step spacing of 16px (ultra fast)
      const step = 16
      const numSteps = Math.ceil(width / step) + 1

      ribbonLayers.forEach((layer, idx) => {
        const baseY = height * layer.yOffset + m.dirY * (40 * (idx + 1))
        const ribbonGrad = ctx.createLinearGradient(0, baseY - 60, width, baseY + 60)
        ribbonGrad.addColorStop(0, layer.color1)
        ribbonGrad.addColorStop(0.5, layer.color2)
        ribbonGrad.addColorStop(1, layer.color1)

        ctx.beginPath()
        ctx.moveTo(0, baseY)

        for (let i = 0; i <= numSteps; i++) {
          const x = i * step
          const mouseInfluence = Math.exp(-Math.pow((x - m.pixelX) / 320, 2)) * (m.dirY * 50)
          const y =
            baseY +
            Math.sin(x * layer.freq + time * (idx + 1) * 0.8) * layer.amp +
            Math.cos(x * layer.freq * 1.5 + time * 0.5) * (layer.amp * 0.35) +
            mouseInfluence

          ctx.lineTo(x, y)
        }

        ctx.lineTo(width, height)
        ctx.lineTo(0, height)
        ctx.closePath()

        ctx.fillStyle = ribbonGrad
        ctx.globalAlpha = 0.18 + idx * 0.06
        ctx.fill()
      })

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
