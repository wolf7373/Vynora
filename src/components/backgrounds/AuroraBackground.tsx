import React, { useRef, useEffect } from 'react'

export interface BackgroundProps {
  vibrantColors: {
    primary: string
    secondary: string
    glow: string
    accent: string
    electric: string
  }
  isPlaying: boolean
  mousePos: {
    pixelX: number
    pixelY: number
    dirX: number
    dirY: number
  }
}

export const AuroraBackground: React.FC<BackgroundProps> = ({
  vibrantColors,
  isPlaying,
  mousePos,
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
    let curFlareX = mousePos.pixelX
    let curFlareY = mousePos.pixelY
    let curWaveX = 0
    let curWaveY = 0
    let curCounterX = 0
    let curCounterY = 0
    let curOrbX = 0
    let curOrbY = 0

    const render = () => {
      // 1. Cursor Flare
      curFlareX += (mousePos.pixelX - curFlareX) * 0.12
      curFlareY += (mousePos.pixelY - curFlareY) * 0.12
      if (cursorFlareRef.current) {
        cursorFlareRef.current.style.transform = `translate3d(${curFlareX.toFixed(1)}px, ${curFlareY.toFixed(1)}px, 0) translate(-50%, -50%)`
      }

      // 2. Primary Wave (±110px X, ±85px Y)
      curWaveX += (mousePos.dirX * 110 - curWaveX) * 0.05
      curWaveY += (mousePos.dirY * 85 - curWaveY) * 0.05
      if (primaryWaveRef.current) {
        primaryWaveRef.current.style.transform = `translate3d(${curWaveX.toFixed(1)}px, ${curWaveY.toFixed(1)}px, 0)`
      }

      // 3. Counter Wave (±140px X, ±100px Y)
      curCounterX += (mousePos.dirX * -140 - curCounterX) * 0.04
      curCounterY += (mousePos.dirY * -100 - curCounterY) * 0.04
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
      curOrbX += (mousePos.dirX * 70 - curOrbX) * 0.08
      curOrbY += (mousePos.dirY * -60 - curOrbY) * 0.08
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
  }, [mousePos])

  return (
    <>
      {/* 1. Cursor Flare */}
      <div
        ref={cursorFlareRef}
        className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none blur-[90px] opacity-70 will-change-transform mix-blend-screen transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, ${vibrantColors.primary} 0%, ${vibrantColors.electric} 35%, ${vibrantColors.accent} 65%, transparent 75%)`,
        }}
      />

      {/* 2. Primary Wave */}
      <div
        ref={primaryWaveRef}
        className="absolute -top-[10%] -left-[10%] w-[75vw] h-[65vw] max-w-[1000px] max-h-[850px] rounded-full blur-[100px] opacity-65 will-change-transform transition-colors duration-1000"
        style={{
          background: `radial-gradient(ellipse at 40% 40%, ${vibrantColors.primary} 0%, ${vibrantColors.accent} 40%, ${vibrantColors.electric} 70%, transparent 85%)`,
        }}
      />

      {/* 3. Deep Counter-Parallax Wave */}
      <div
        ref={counterWaveRef}
        className="absolute top-[35%] -right-[15%] w-[75vw] h-[75vw] max-w-[950px] max-h-[950px] rounded-full blur-[110px] opacity-60 will-change-transform transition-colors duration-1000"
        style={{
          background: `radial-gradient(circle at 60% 60%, ${vibrantColors.electric} 0%, #00F2FE 40%, #FF2A6D 70%, transparent 85%)`,
        }}
      />

      {/* 4. Floating Reactive Orb */}
      <div
        ref={floatingOrbRef}
        className="absolute top-[55%] left-[20%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full blur-[90px] opacity-55 will-change-transform"
        style={{
          background: `radial-gradient(circle at center, ${vibrantColors.accent} 0%, ${vibrantColors.primary} 50%, transparent 75%)`,
        }}
      />

      {/* 5. Center Pulse */}
      <div
        ref={centerPulseRef}
        className={`absolute top-[25%] left-[30%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full blur-[120px] will-change-transform transition-all duration-700 ${
          isPlaying ? 'opacity-60 scale-105 animate-pulse-glow' : 'opacity-30 scale-100'
        }`}
        style={{
          background: `radial-gradient(circle, ${vibrantColors.primary} 0%, ${vibrantColors.electric} 45%, transparent 75%)`,
        }}
      />

      {/* 6. SVG Mesh Ribbons */}
      <svg
        ref={svgMeshRef}
        className="absolute inset-0 w-full h-full opacity-35 mix-blend-screen pointer-events-none will-change-transform"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="liquidGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={vibrantColors.primary} stopOpacity="0.8" />
            <stop offset="50%" stopColor={vibrantColors.electric} stopOpacity="0.6" />
            <stop offset="100%" stopColor={vibrantColors.accent} stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="liquidGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#EC4899" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#7F00FF" stopOpacity="0.2" />
          </linearGradient>
          <filter id="liquidBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="40" />
          </filter>
        </defs>

        <path
          d="M-100,200 C300,100 500,450 900,300 C1200,180 1400,350 1600,250 L1600,900 L-100,900 Z"
          fill="url(#liquidGrad1)"
          filter="url(#liquidBlur)"
        />
        <path
          d="M-50,600 C350,450 650,750 1050,550 C1300,420 1500,600 1650,500 L1650,900 L-50,900 Z"
          fill="url(#liquidGrad2)"
          filter="url(#liquidBlur)"
        />
      </svg>
    </>
  )
}
