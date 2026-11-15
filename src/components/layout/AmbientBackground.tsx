import React, { useEffect, useState, useMemo, useRef } from 'react'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useUIStore } from '@/stores/useUIStore'
import { createPaletteFromHex, extractColorFromImage, type ExtractedPalette } from '@/utils/colorExtractor'
import { AuroraBackground, type MousePosRef } from '@/components/backgrounds/AuroraBackground'
import { RipplesBackground } from '@/components/backgrounds/RipplesBackground'
import { ParticlesBackground } from '@/components/backgrounds/ParticlesBackground'
import { RibbonsBackground } from '@/components/backgrounds/RibbonsBackground'
import { PlasmaBackground } from '@/components/backgrounds/PlasmaBackground'
import { GridBackground } from '@/components/backgrounds/GridBackground'

interface AmbientBackgroundProps {
  className?: string
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ className }) => {
  const { currentTrack, isPlaying } = usePlayerStore()
  const { ambientColor, backgroundStyle } = useUIStore()

  // Dynamic extracted palette from song album art
  const [palette, setPalette] = useState<ExtractedPalette>(() =>
    createPaletteFromHex(currentTrack?.color || ambientColor || '#00F2FE')
  )

  useEffect(() => {
    let isCancelled = false
    const fallback = currentTrack?.color || ambientColor || '#00F2FE'
    if (currentTrack?.coverUrl) {
      extractColorFromImage(currentTrack.coverUrl, fallback)
        .then((newPalette) => {
          if (!isCancelled) setPalette(newPalette)
        })
        .catch(() => {
          if (!isCancelled) setPalette(createPaletteFromHex(fallback))
        })
    } else {
      setPalette(createPaletteFromHex(fallback))
    }
    return () => {
      isCancelled = true
    }
  }, [currentTrack?.id, currentTrack?.coverUrl, currentTrack?.color, ambientColor])

  // Ensure colors are rich and vibrant even if album cover is predominantly dark
  const vibrantColors = useMemo(() => {
    const primary = palette.primary || '#00F2FE'
    return {
      primary: primary.length === 7 ? primary : '#00F2FE',
      secondary: palette.secondary || '#7F00FF',
      glow: palette.glowColor || 'rgba(0, 242, 254, 0.6)',
      accent: '#FF5E3A',
      electric: '#8B5CF6',
    }
  }, [palette])

  // High-performance mutable mouse tracking ref (ZERO React re-renders on mouse motion!)
  const mouseRef = useRef<MousePosRef>({
    pixelX: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    pixelY: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
    dirX: 0,
    dirY: 0,
  })

  useEffect(() => {
    const isTestEnv =
      import.meta.env?.MODE === 'test' ||
      (typeof globalThis !== 'undefined' &&
        (globalThis as any).process?.env?.NODE_ENV === 'test')
    if (isTestEnv) return

    let rafScheduled = false

    const handlePointerMove = (e: PointerEvent) => {
      const width = window.innerWidth || 1
      const height = window.innerHeight || 1
      mouseRef.current.pixelX = e.clientX
      mouseRef.current.pixelY = e.clientY
      mouseRef.current.dirX = (e.clientX / width - 0.5) * 2
      mouseRef.current.dirY = (e.clientY / height - 0.5) * 2

      if (!rafScheduled) {
        rafScheduled = true
        requestAnimationFrame(() => {
          rafScheduled = false
          // Expose CSS variables for all liquid glass cards and specular rim highlights
          const pctX = ((mouseRef.current.pixelX / width) * 100).toFixed(1)
          const pctY = ((mouseRef.current.pixelY / height) * 100).toFixed(1)
          document.documentElement.style.setProperty('--mouse-x', `${pctX}%`)
          document.documentElement.style.setProperty('--mouse-y', `${pctY}%`)
          document.documentElement.style.setProperty('--cursor-px-x', `${mouseRef.current.pixelX}px`)
          document.documentElement.style.setProperty('--cursor-px-y', `${mouseRef.current.pixelY}px`)
          document.documentElement.style.setProperty('--mouse-dir-x', mouseRef.current.dirX.toFixed(3))
          document.documentElement.style.setProperty('--mouse-dir-y', mouseRef.current.dirY.toFixed(3))
        })
      }
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className={
        className ||
        'fixed inset-0 pointer-events-none overflow-hidden z-0 select-none overscroll-none bg-[#07080B]'
      }
    >
      {/* Dynamic Active Background Style Switcher */}
      {backgroundStyle === 'ripples' && (
        <RipplesBackground
          vibrantColors={vibrantColors}
          isPlaying={isPlaying}
          mouseRef={mouseRef}
        />
      )}

      {backgroundStyle === 'particles' && (
        <ParticlesBackground
          vibrantColors={vibrantColors}
          isPlaying={isPlaying}
          mouseRef={mouseRef}
        />
      )}

      {backgroundStyle === 'ribbons' && (
        <RibbonsBackground
          vibrantColors={vibrantColors}
          isPlaying={isPlaying}
          mouseRef={mouseRef}
        />
      )}

      {backgroundStyle === 'plasma' && (
        <PlasmaBackground
          vibrantColors={vibrantColors}
          isPlaying={isPlaying}
          mouseRef={mouseRef}
        />
      )}

      {backgroundStyle === 'grid' && (
        <GridBackground
          vibrantColors={vibrantColors}
          isPlaying={isPlaying}
          mouseRef={mouseRef}
        />
      )}

      {/* Default: 'aurora' (Fluid Liquid Aurora) */}
      {(backgroundStyle === 'aurora' || !backgroundStyle) && (
        <AuroraBackground
          vibrantColors={vibrantColors}
          isPlaying={isPlaying}
          mouseRef={mouseRef}
        />
      )}

      {/* Subtle Refined Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07080B]/15 via-transparent to-[#07080B]/40 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-vignette opacity-25 pointer-events-none" />
    </div>
  )
}
