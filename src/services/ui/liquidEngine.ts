import { useEffect, useRef } from 'react'
import { PlaybackAdapterManager } from '@/adapters'
import type { Track } from '@/types/track'

export interface LiquidGlassOptions {
  target?: string
  snapshot?: string
  refraction?: number
  aberration?: number
  bevelDepth?: number
  bevelWidth?: number
  frost?: number
  specular?: boolean
  shadow?: boolean
  tint?: string | null
  interaction?: 'fluid' | 'tilt' | 'none'
  interactionStrength?: number
  interactionRadius?: number
  interactionViscosity?: number
  audioReactive?: boolean
  resolution?: number
}

// Convert hex/color to rgba string for liquid-gl tinting
export function colorToRgba(hexOrRgb?: string | null, alpha = 0.22): string {
  if (!hexOrRgb) return `rgba(0, 242, 254, ${alpha})`
  const trimmed = hexOrRgb.trim()
  if (trimmed.startsWith('#')) {
    const hex = trimmed.replace('#', '')
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16)
      const g = parseInt(hex[1] + hex[1], 16)
      const b = parseInt(hex[2] + hex[2], 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
  }
  if (trimmed.startsWith('rgb')) {
    return trimmed
  }
  return `rgba(0, 242, 254, ${alpha})`
}

/**
 * React hook to attach a liquidGL lens to a selector
 */
export function useLiquidGlass(
  targetSelector: string,
  options: LiquidGlassOptions = {},
  currentTrack?: Track | null,
  isPlaying?: boolean
) {
  const lensRef = useRef<any>(null)
  const animFrameRef = useRef<number | null>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    if (typeof window === 'undefined') return

    let isSubscribed = true

    // Dynamic import to support SSR and jsdom environments safely
    import('liquid-gl')
      .then((mod) => {
        if (!isSubscribed) return
        const liquidGL = mod.default || (window as any).liquidGL

        if (typeof liquidGL !== 'function') return

        const el = document.querySelector(targetSelector)
        if (!el) return

        const trackTint = currentTrack?.color
          ? colorToRgba(currentTrack.color, 0.25)
          : options.tint || 'rgba(0, 242, 254, 0.22)'

        try {
          const lensInstance = liquidGL({
            target: targetSelector,
            snapshot: options.snapshot || 'body',
            engine: 'auto',
            resolution: options.resolution ?? 1.5,
            refraction: options.refraction ?? 0.015,
            aberration: options.aberration ?? 0.02,
            bevelDepth: options.bevelDepth ?? 0.08,
            bevelWidth: options.bevelWidth ?? 0.15,
            frost: options.frost ?? 2,
            specular: options.specular ?? true,
            shadow: options.shadow ?? true,
            interaction: options.interaction ?? 'fluid',
            interactionStrength: options.interactionStrength ?? 0.6,
            interactionRadius: options.interactionRadius ?? 0.35,
            interactionViscosity: options.interactionViscosity ?? 0.65,
            tint: trackTint,
          })

          const lens = Array.isArray(lensInstance) ? lensInstance[0] : lensInstance
          lensRef.current = lens
        } catch {
          // If WebGPU/WebGL cannot initialize, liquidGL falls back gracefully to CSS blur
        }
      })
      .catch(() => {
        // Module load error (e.g. test environment)
      })

    return () => {
      isSubscribed = false
      if (lensRef.current && typeof lensRef.current.destroy === 'function') {
        try {
          lensRef.current.destroy()
        } catch {}
        lensRef.current = null
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }
    }
  }, [targetSelector])

  // React to track color change: update tint dynamically
  useEffect(() => {
    if (lensRef.current && typeof lensRef.current.setTint === 'function') {
      const tint = currentTrack?.color
        ? colorToRgba(currentTrack.color, 0.28)
        : options.tint || 'rgba(0, 242, 254, 0.22)'
      try {
        lensRef.current.setTint(tint)
      } catch {}
    }
  }, [currentTrack?.color, options.tint])

  // Audio-reactive fluid pulse loop
  useEffect(() => {
    if (!options.audioReactive || !isPlaying) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }
      return
    }

    const adapterManager = PlaybackAdapterManager.getInstance()
    const baseRefraction = options.refraction ?? 0.015
    const baseStrength = options.interactionStrength ?? 0.6

    let lastUpdate = 0
    const pulseLoop = (time: number) => {
      if (time - lastUpdate >= 33) {
        // 30fps throttle for optimal performance
        lastUpdate = time
        if (lensRef.current && lensRef.current.options) {
          const audioData = adapterManager.getAudioData()
          // Measure sub-bass & bass energy (first 8 frequency bins)
          let sum = 0
          for (let i = 0; i < 8; i++) {
            sum += audioData[i] || 0
          }
          const energy = sum / (8 * 255) // 0.0 to 1.0

          if (energy > 0.05) {
            lensRef.current.options.refraction = baseRefraction + energy * 0.015
            lensRef.current.options.interactionStrength = baseStrength + energy * 0.3
          } else {
            lensRef.current.options.refraction = baseRefraction
            lensRef.current.options.interactionStrength = baseStrength
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(pulseLoop)
    }

    animFrameRef.current = requestAnimationFrame(pulseLoop)

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }
    }
  }, [options.audioReactive, isPlaying, options.refraction, options.interactionStrength])

  return lensRef
}
