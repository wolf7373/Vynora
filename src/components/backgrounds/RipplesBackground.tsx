import React, { useRef, useEffect } from 'react'
import type { BackgroundProps } from './AuroraBackground'

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
  speed: number
  width: number
}

export const RipplesBackground: React.FC<BackgroundProps> = ({
  vibrantColors,
  isPlaying,
  mouseRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ripplesRef = useRef<Ripple[]>([])
  const lastSpawnRef = useRef<number>(0)
  const lastBeatSpawnRef = useRef<number>(0)

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

    // Click / PointerDown shockwave ripple
    const handlePointerDown = (e: PointerEvent) => {
      if (ripplesRef.current.length > 14) {
        ripplesRef.current.shift()
      }
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        maxRadius: Math.max(width, height) * 0.45,
        alpha: 0.85,
        speed: 4.5,
        width: 3,
      })
    }
    window.addEventListener('pointerdown', handlePointerDown, { passive: true })

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      const m = mouseRef.current || { pixelX: width / 2, pixelY: height / 2, dirX: 0, dirY: 0 }

      // Ambient caustics gradient base
      const bgGrad = ctx.createRadialGradient(
        m.pixelX,
        m.pixelY,
        50,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.85
      )
      bgGrad.addColorStop(0, `${vibrantColors.primary}30`)
      bgGrad.addColorStop(0.4, `${vibrantColors.electric}18`)
      bgGrad.addColorStop(1, '#07080B')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      // Spawn mouse movement trail ripples (throttled to every 120ms)
      const now = Date.now()
      if (now - lastSpawnRef.current > 120) {
        lastSpawnRef.current = now
        if (ripplesRef.current.length > 12) {
          ripplesRef.current.shift()
        }
        ripplesRef.current.push({
          x: m.pixelX,
          y: m.pixelY,
          radius: 2,
          maxRadius: 160,
          alpha: 0.45,
          speed: 2.4,
          width: 1.8,
        })
      }

      // Audio beat ripple
      if (isPlaying && now - lastBeatSpawnRef.current > 1200) {
        lastBeatSpawnRef.current = now
        ripplesRef.current.push({
          x: width / 2 + m.dirX * 60,
          y: height / 2 + m.dirY * 40,
          radius: 5,
          maxRadius: Math.max(width, height) * 0.55,
          alpha: 0.7,
          speed: 3.5,
          width: 2.5,
        })
      }

      // Update and draw active ripples
      const ripples = ripplesRef.current
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        r.radius += r.speed
        r.alpha -= 0.009

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1)
          continue
        }

        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
        ctx.strokeStyle = vibrantColors.primary
        ctx.lineWidth = r.width
        ctx.globalAlpha = Math.max(0, r.alpha)
        ctx.stroke()
      }

      ctx.globalAlpha = 1
      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointerdown', handlePointerDown)
      cancelAnimationFrame(animId)
    }
  }, [vibrantColors, isPlaying])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block mix-blend-screen opacity-90 will-change-transform"
      />
      <div className="absolute inset-0 bg-radial-vignette opacity-30 pointer-events-none" />
    </div>
  )
}
