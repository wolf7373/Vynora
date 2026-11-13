import { useEffect, useRef } from 'react'
import { PlaybackAdapterManager } from '@/adapters'
import type { Track } from '@/types/track'

export interface LiquidGlassOptions {
  target?: string
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

// Convert hex/color to rgba string for tinting
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
 * Safe, High-Fidelity Fluid Liquid Glass Lens Hook.
 * Provides organic fluid tilt, chromatic specular reflections, dynamic tinting,
 * and audio-reactive beat pulses WITHOUT attaching any destructive fullscreen canvases to document.body.
 */
export function useLiquidGlass(
  targetSelector: string,
  options: LiquidGlassOptions = {},
  currentTrack?: Track | null,
  isPlaying?: boolean
) {
  const animFrameRef = useRef<number | null>(null)
  const elRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Clean up any rogue canvas that may have been injected by liquidGL
    try {
      const rogueCanvases = document.querySelectorAll('body > canvas[data-liquid-ignore]')
      rogueCanvases.forEach((c) => c.remove())
    } catch {}

    const el = document.querySelector<HTMLElement>(targetSelector)
    if (!el) return
    elRef.current = el

    // Apply baseline liquid glass styles
    const trackTint = currentTrack?.color
      ? colorToRgba(currentTrack.color, 0.18)
      : options.tint || 'rgba(0, 242, 254, 0.18)'

    el.style.backdropFilter = `blur(${Math.max(16, (options.frost ?? 2) * 12)}px) saturate(180%)`
    ;(el.style as any).webkitBackdropFilter = `blur(${Math.max(16, (options.frost ?? 2) * 12)}px) saturate(180%)`
    el.style.backgroundColor = trackTint

    // Mouse / Touch Fluid Tilt Interaction
    if (options.interaction === 'fluid' || options.interaction === 'tilt') {
      const handlePointerMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        const strength = options.interactionStrength ?? 0.6
        const tiltX = -y * 12 * strength
        const tiltY = x * 12 * strength

        el.style.transform = `perspective(800px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(0)`
      }

      const handlePointerLeave = () => {
        el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)'
      }

      el.addEventListener('pointermove', handlePointerMove)
      el.addEventListener('pointerleave', handlePointerLeave)

      return () => {
        el.removeEventListener('pointermove', handlePointerMove)
        el.removeEventListener('pointerleave', handlePointerLeave)
        el.style.transform = ''
      }
    }
  }, [targetSelector, options.interaction, options.interactionStrength, options.frost, options.tint])

  // React to track color change: update tint dynamically
  useEffect(() => {
    if (!elRef.current) {
      elRef.current = document.querySelector<HTMLElement>(targetSelector)
    }
    if (elRef.current) {
      const tint = currentTrack?.color
        ? colorToRgba(currentTrack.color, 0.22)
        : options.tint || 'rgba(0, 242, 254, 0.18)'
      elRef.current.style.backgroundColor = tint
    }
  }, [currentTrack?.color, options.tint, targetSelector])

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
    let lastUpdate = 0

    const pulseLoop = (time: number) => {
      if (time - lastUpdate >= 33) {
        lastUpdate = time
        const target = elRef.current || document.querySelector<HTMLElement>(targetSelector)
        if (target) {
          const audioData = adapterManager.getAudioData()
          let sum = 0
          for (let i = 0; i < 8; i++) {
            sum += audioData[i] || 0
          }
          const energy = sum / (8 * 255) // 0.0 to 1.0

          if (energy > 0.08) {
            const glowPx = Math.round(15 + energy * 35)
            const color = currentTrack?.color || '#00F2FE'
            target.style.boxShadow = `0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 0 ${glowPx}px -4px ${color}55, inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)`
          } else {
            target.style.boxShadow = ''
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
      if (elRef.current) {
        elRef.current.style.boxShadow = ''
      }
    }
  }, [options.audioReactive, isPlaying, currentTrack?.color, targetSelector])

  return elRef
}
