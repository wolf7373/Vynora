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
  mousePos,
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

    // Click / PointerDown shockwave ripple
    const handlePointerDown = (e: MouseEvent | PointerEvent) => {
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        maxRadius: Math.max(width, height) * 0.45,
        alpha: 0.85,
        speed: 4.5,
        width: 3.5,
      })
    }
    window.addEventListener('pointerdown', handlePointerDown)

    let time = 0

    const render = () => {
      time += 0.02
      ctx.clearRect(0, 0, width, height)

      // Ambient caustics gradient base
      const bgGrad = ctx.createRadialGradient(
        mousePos.pixelX,
        mousePos.pixelY,
        50,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.85
      )
      bgGrad.addColorStop(0, `${vibrantColors.primary}33`)
      bgGrad.addColorStop(0.4, `${vibrantColors.electric}22`)
      bgGrad.addColorStop(1, '#07080B')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      // Spawn mouse movement trail ripples (throttled to every 120ms)
      const now = Date.now()
      if (now - lastSpawnRef.current > 120) {
        lastSpawnRef.current = now
        ripplesRef.current.push({
          x: mousePos.pixelX,
          y: mousePos.pixelY,
          radius: 2,
          maxRadius: 180,
          alpha: 0.5,
          speed: 2.2,
          width: 1.8,
        })
      }

      // Audio beat ripple
      if (isPlaying && now - lastBeatSpawnRef.current > 1400) {
        lastBeatSpawnRef.current = now
        ripplesRef.current.push({
          x: width / 2 + (Math.sin(time) * 100),
          y: height / 2 + (Math.cos(time) * 80),
          radius: 10,
          maxRadius: Math.min(width, height) * 0.65,
          alpha: 0.7,
          speed: 3.2,
          width: 2.5,
        })
      }

      // Render shimmering water caustics lines
      ctx.save()
      ctx.strokeStyle = `${vibrantColors.primary}25`
      ctx.lineWidth = 1.2
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const offset = i * 160 + time * 30
        ctx.moveTo(0, (Math.sin(offset * 0.01 + time) * 80 + height * (i / 6)))
        for (let x = 0; x < width; x += 40) {
          const y = Math.sin(x * 0.008 + offset * 0.02 + time) * 35 + height * (i / 6)
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
      ctx.restore()

      // Render expanding water ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i]
        r.radius += r.speed
        r.alpha *= 0.965 // fade out

        if (r.alpha < 0.01 || r.radius >= r.maxRadius) {
          ripplesRef.current.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0, 242, 254, ${r.alpha.toFixed(3)})`
        ctx.lineWidth = r.width
        ctx.shadowColor = vibrantColors.glow
        ctx.shadowBlur = 12
        ctx.stroke()

        // Secondary subtle inner ring
        if (r.radius > 20) {
          ctx.beginPath()
          ctx.arc(r.x, r.y, r.radius * 0.82, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255, 255, 255, ${(r.alpha * 0.5).toFixed(3)})`
          ctx.lineWidth = Math.max(0.8, r.width * 0.6)
          ctx.stroke()
        }
        ctx.restore()
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointerdown', handlePointerDown)
      cancelAnimationFrame(animId)
    }
  }, [vibrantColors, isPlaying, mousePos])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block mix-blend-screen opacity-90"
      />
      {/* Soft ambient vignette */}
      <div className="absolute inset-0 bg-radial-vignette opacity-40 pointer-events-none" />
    </div>
  )
}
