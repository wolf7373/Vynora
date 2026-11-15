import React, { useRef, useEffect } from 'react'

export interface MousePosRef {
  pixelX: number
  pixelY: number
  dirX: number
  dirY: number
}

export interface BackgroundProps {
  vibrantColors: {
    primary: string
    secondary: string
    glow: string
    accent: string
    electric: string
  }
  isPlaying: boolean
  mouseRef: React.RefObject<MousePosRef>
}

export const AuroraBackground: React.FC<BackgroundProps> = ({
  vibrantColors,
  isPlaying,
  mouseRef,
}) => {
  const cursorFlareRef = useRef<HTMLDivElement>(null)
  const primaryWaveRef = useRef<HTMLDivElement>(null)
  const counterWaveRef = useRef<HTMLDivElement>(null)
  const centerPulseRef = useRef<HTMLDivElement>(null)
  const floatingOrbRef = useRef<HTMLDivElement>(null)
  const svgMeshRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const isTestEnv =
      import.meta.env?.MODE === 'test' ||
      (typeof globalThis !== 'undefined' &&
        (globalThis as any).process?.env?.NODE_ENV === 'test')
    if (isTestEnv) return

    let animId: number
    const initialPos = mouseRef.current || { pixelX: window.innerWidth / 2, pixelY: window.innerHeight / 2, dirX: 0, dirY: 0 }
    let curFlareX = initialPos.pixelX
    let curFlareY = initialPos.pixelY
    let curWaveX = 0
    let curWaveY = 0
    let curCounterX = 0
    let curCounterY = 0
    let curOrbX = 0
    let curOrbY = 0

    const render = () => {
      const m = mouseRef.current || initialPos

      // 1. Cursor Flare (smooth interpolation)
      curFlareX += (m.pixelX - curFlareX) * 0.15
      curFlareY += (m.pixelY - curFlareY) * 0.15
      if (cursorFlareRef.current) {
        cursorFlareRef.current.style.transform = `translate3d(${curFlareX.toFixed(1)}px, ${curFlareY.toFixed(1)}px, 0) translate(-50%, -50%)`
      }

      // 2. Primary Wave (±110px X, ±85px Y)
      curWaveX += (m.dirX * 110 - curWaveX) * 0.06
      curWaveY += (m.dirY * 85 - curWaveY) * 0.06
      if (primaryWaveRef.current) {
        primaryWaveRef.current.style.transform = `translate3d(${curWaveX.toFixed(1)}px, ${curWaveY.toFixed(1)}px, 0)`
      }

      // 3. Counter Wave (±140px X, ±100px Y)
      curCounterX += (m.dirX * -140 - curCounterX) * 0.05
      curCounterY += (m.dirY * -100 - curCounterY) * 0.05
      if (counterWaveRef.current) {
        counterWaveRef.current.style.transform = `translate3d(${curCounterX.toFixed(1)}px, ${curCounterY.toFixed(1)}px, 0)`
      }

      // 4. Center Ambient Pulse
      if (centerPulseRef.current) {
        const cx = curWaveX * 0.4
        const cy = curWaveY * 0.4
        centerPulseRef.current.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`
      }

      // 5. Floating Reactive Orb
      curOrbX += (m.dirX * 70 - curOrbX) * 0.08
      curOrbY += (m.dirY * -60 - curOrbY) * 0.08
      if (floatingOrbRef.current) {
        floatingOrbRef.current.style.transform = `translate3d(${curOrbX.toFixed(1)}px, ${curOrbY.toFixed(1)}px, 0)`
      }

      // 6. SVG Caustic Mesh
      if (svgMeshRef.current) {
        const rot = curWaveX * 0.06
        svgMeshRef.current.style.transform = `scale(1.1) rotate(${rot.toFixed(2)}deg)`
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animId)
  }, [vibrantColors, isPlaying])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 1. Cursor Flare */}
      <div
        ref={cursorFlareRef}
        className="absolute top-0 left-0 w-[550px] h-[550px] rounded-full pointer-events-none blur-[90px] opacity-70 will-change-transform mix-blend-screen"
        style={{
          background: `radial-gradient(circle at center, ${vibrantColors.primary} 0%, ${vibrantColors.electric} 40%, ${vibrantColors.accent} 70%, transparent 80%)`,
        }}
      />

      {/* 2. Primary Wave */}
      <div
        ref={primaryWaveRef}
        style={{
          background: `radial-gradient(ellipse at center, ${vibrantColors.primary} 0%, ${vibrantColors.accent} 45%, transparent 75%)`,
        }}
        className="absolute -top-32 -left-32 w-[80vw] h-[80vw] max-w-[950px] max-h-[950px] rounded-full blur-[100px] opacity-65 pointer-events-none will-change-transform"
      />

      {/* 3. Counter Wave */}
      <div
        ref={counterWaveRef}
        style={{
          background: `radial-gradient(circle at center, ${vibrantColors.electric} 0%, #00F2FE 40%, transparent 75%)`,
        }}
        className="absolute top-1/4 -right-32 w-[75vw] h-[75vw] max-w-[900px] max-h-[900px] rounded-full blur-[110px] opacity-60 pointer-events-none will-change-transform"
      />

      {/* 4. Center Ambient Pulse */}
      <div
        ref={centerPulseRef}
        style={{
          background: `radial-gradient(circle, ${vibrantColors.primary} 0%, ${vibrantColors.secondary} 45%, transparent 75%)`,
        }}
        className="absolute bottom-0 left-1/4 w-[65vw] h-[65vw] max-w-[800px] max-h-[800px] rounded-full blur-[120px] opacity-55 pointer-events-none will-change-transform animate-pulse-glow"
      />

      {/* 5. Floating Reactive Orb */}
      <div
        ref={floatingOrbRef}
        style={{
          background: `radial-gradient(circle at center, ${vibrantColors.glow} 0%, ${vibrantColors.accent}40 50%, transparent 80%)`,
        }}
        className="absolute top-1/2 left-1/3 w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full blur-[85px] opacity-60 pointer-events-none will-change-transform"
      />

      {/* 6. SVG Caustic Mesh Lines */}
      <svg
        ref={svgMeshRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none mix-blend-overlay will-change-transform"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <path
          d="M-100,200 C300,50 600,350 1000,150 C1300,-10 1500,280 1600,100"
          fill="none"
          stroke={vibrantColors.primary}
          strokeWidth="1.5"
          strokeDasharray="4 8"
        />
        <path
          d="M-50,600 C350,750 700,450 1100,680 C1350,820 1550,550 1600,700"
          fill="none"
          stroke={vibrantColors.electric}
          strokeWidth="1.5"
          strokeDasharray="6 10"
        />
        <path
          d="M100,-50 C250,400 850,200 1200,600 C1400,850 1550,400 1600,950"
          fill="none"
          stroke={vibrantColors.accent}
          strokeWidth="1"
          strokeDasharray="3 7"
        />
      </svg>
    </div>
  )
}
