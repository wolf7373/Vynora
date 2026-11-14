import React, { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useUIStore } from '@/stores/useUIStore'

export const AmbientBackground: React.FC = () => {
  const { currentTrack, isPlaying } = usePlayerStore()
  const { ambientColor } = useUIStore()

  // Dynamic track primary and secondary color palette
  const primaryColor = currentTrack?.color || ambientColor || '#00F2FE'

  // Refs for smooth 60fps lerp parallax physics
  const orb1Ref = useRef<HTMLDivElement>(null)
  const orb2Ref = useRef<HTMLDivElement>(null)
  const orb3Ref = useRef<HTMLDivElement>(null)
  const causticsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let animId: number
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const handlePointerMove = (e: MouseEvent | PointerEvent) => {
      // Normalize to -1 to +1 coordinates from center of window
      const width = window.innerWidth || 1
      const height = window.innerHeight || 1
      targetX = (e.clientX / width - 0.5) * 2
      targetY = (e.clientY / height - 0.5) * 2

      // Expose CSS variables for other liquid glass elements across the DOM
      const pctX = ((e.clientX / width) * 100).toFixed(1)
      const pctY = ((e.clientY / height) * 100).toFixed(1)
      document.documentElement.style.setProperty('--mouse-x', `${pctX}%`)
      document.documentElement.style.setProperty('--mouse-y', `${pctY}%`)
      document.documentElement.style.setProperty('--mouse-dir-x', targetX.toFixed(3))
      document.documentElement.style.setProperty('--mouse-dir-y', targetY.toFixed(3))
    }

    const render = () => {
      // Smooth lerp (linear interpolation with 0.05 factor for fluid drag feel)
      currentX += (targetX - currentX) * 0.05
      currentY += (targetY - currentY) * 0.05

      // Layer 1: Orb 1 (Warmer front flare shifts with cursor)
      if (orb1Ref.current) {
        const x1 = currentX * 45
        const y1 = currentY * 35
        orb1Ref.current.style.transform = `translate3d(${x1.toFixed(1)}px, ${y1.toFixed(1)}px, 0)`
      }

      // Layer 2: Orb 2 (Deeper counter-orb moves in opposite direction for 3D parallax depth)
      if (orb2Ref.current) {
        const x2 = currentX * -60
        const y2 = currentY * -45
        orb2Ref.current.style.transform = `translate3d(${x2.toFixed(1)}px, ${y2.toFixed(1)}px, 0)`
      }

      // Layer 3: Center Pulse Orb (Subtle parallax)
      if (orb3Ref.current) {
        const x3 = currentX * 25
        const y3 = currentY * 20
        orb3Ref.current.style.transform = `translate3d(${x3.toFixed(1)}px, ${y3.toFixed(1)}px, 0)`
      }

      // Layer 4: Caustics Shimmer Mesh (Reacts to cursor coordinates)
      if (causticsRef.current) {
        const x4 = currentX * -20
        const y4 = currentY * -20
        causticsRef.current.style.transform = `translate3d(${x4.toFixed(1)}px, ${y4.toFixed(1)}px, 0)`
      }

      animId = requestAnimationFrame(render)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('mousemove', handlePointerMove, { passive: true })
    animId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('mousemove', handlePointerMove)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none overscroll-none"
    >
      {/* Dynamic Aurora Orb 1: Warm Amber / Track Primary Color Liquid Mesh Flare */}
      <div
        ref={orb1Ref}
        className="absolute -top-[15%] left-[10%] w-[68vw] h-[52vw] max-w-[900px] max-h-[640px] rounded-full blur-[130px] opacity-45 will-change-transform transition-colors duration-1000"
        style={{
          background: `radial-gradient(ellipse at center, ${primaryColor} 0%, #FF5E3A 35%, rgba(255, 42, 109, 0.25) 60%, transparent 75%)`,
        }}
      />

      {/* Dynamic Aurora Orb 2: Deep Indigo / Cyan Counter-Orb with 3D Parallax */}
      <div
        ref={orb2Ref}
        className="absolute top-[28%] -right-[12%] w-[65vw] h-[65vw] max-w-[800px] max-h-[800px] rounded-full blur-[150px] opacity-35 will-change-transform transition-colors duration-1000"
        style={{
          background:
            'radial-gradient(circle, rgba(0, 242, 254, 0.5) 0%, rgba(127, 0, 255, 0.4) 45%, rgba(79, 172, 254, 0.2) 65%, transparent 80%)',
        }}
      />

      {/* Center Dynamic Fluid Pulse Glow */}
      <div
        ref={orb3Ref}
        className={`absolute top-[20%] left-[25%] w-[58vw] h-[58vw] max-w-[650px] max-h-[650px] rounded-full blur-[140px] will-change-transform transition-all duration-700 ${
          isPlaying ? 'opacity-40 animate-pulse-glow' : 'opacity-20'
        }`}
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, rgba(255, 94, 58, 0.3) 40%, transparent 70%)`,
        }}
      />

      {/* Liquid Caustics & Shimmer Mesh Layer */}
      <div
        ref={causticsRef}
        className="absolute inset-0 opacity-25 mix-blend-screen pointer-events-none will-change-transform"
        style={{
          background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${primaryColor}33 0%, rgba(0, 242, 254, 0.1) 30%, transparent 60%)`,
        }}
      />

      {/* Subtle Noise / Grain Texture for tactile physical glass feel */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent pointer-events-none" />

      {/* Vignette Overlay to maintain 100% text readability & high contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-vyn-canvas/60 via-transparent to-vyn-canvas/90" />
    </div>
  )
}
