import React from 'react'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useUIStore } from '@/stores/useUIStore'

export const AmbientBackground: React.FC = () => {
  const { currentTrack, isPlaying } = usePlayerStore()
  const { ambientColor } = useUIStore()

  // Track dynamic color with fallback to ambientColor or cyan
  const primaryColor = currentTrack?.color || ambientColor || '#00F2FE'

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none overscroll-none"
    >
      {/* Dynamic Aurora Orb 1: Warm Amber / Coral Liquid Mesh Flare */}
      <div
        className="absolute -top-[15%] left-[10%] w-[65vw] h-[50vw] max-w-[850px] max-h-[600px] rounded-full blur-[130px] opacity-45 animate-aurora-1 transition-colors duration-1000"
        style={{
          background: `radial-gradient(ellipse at center, ${primaryColor} 0%, #FF5E3A 35%, rgba(255, 42, 109, 0.25) 60%, transparent 75%)`,
        }}
      />

      {/* Dynamic Aurora Orb 2: Deep Indigo / Cyan Counter-Orb */}
      <div
        className="absolute top-[30%] -right-[10%] w-[60vw] h-[60vw] max-w-[750px] max-h-[750px] rounded-full blur-[150px] opacity-35 animate-aurora-2 transition-colors duration-1000"
        style={{
          background:
            'radial-gradient(circle, rgba(0, 242, 254, 0.45) 0%, rgba(127, 0, 255, 0.35) 45%, rgba(79, 172, 254, 0.15) 65%, transparent 80%)',
        }}
      />

      {/* Center Dynamic Fluid Pulse Glow */}
      <div
        className={`absolute top-[20%] left-[25%] w-[55vw] h-[55vw] max-w-[600px] max-h-[600px] rounded-full blur-[140px] transition-all duration-700 ${
          isPlaying ? 'opacity-40 animate-pulse-glow' : 'opacity-20'
        }`}
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, rgba(255, 94, 58, 0.3) 40%, transparent 70%)`,
        }}
      />

      {/* Vignette Overlay to maintain 100% text readability & high contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-vyn-canvas/60 via-transparent to-vyn-canvas/90" />
    </div>
  )
}

