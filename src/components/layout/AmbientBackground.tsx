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
      {/* Dynamic Aurora Orb 1: Floating Primary Gradient */}
      <div
        className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full blur-[130px] opacity-35 animate-aurora-1 transition-colors duration-1000"
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, rgba(0, 242, 254, 0.25) 50%, transparent 75%)`,
        }}
      />

      {/* Dynamic Aurora Orb 2: Deep Indigo / Violet Counter-Orb */}
      <div
        className="absolute top-[35%] -right-[15%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full blur-[150px] opacity-25 animate-aurora-2 transition-colors duration-1000"
        style={{
          background:
            'radial-gradient(circle, rgba(127, 0, 255, 0.4) 0%, rgba(79, 172, 254, 0.2) 50%, transparent 75%)',
        }}
      />

      {/* Center Subtle Audio Pulse Glow */}
      <div
        className={`absolute top-[20%] left-[25%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full blur-[140px] transition-all duration-700 ${
          isPlaying ? 'opacity-25 animate-pulse-glow' : 'opacity-10'
        }`}
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
        }}
      />

      {/* Vignette Overlay to maintain 100% text readability & high contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-vyn-canvas/60 via-transparent to-vyn-canvas/90" />
    </div>
  )
}

