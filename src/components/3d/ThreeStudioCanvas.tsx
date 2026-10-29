import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { VinylTurntableScene } from './VinylTurntableScene'
import { ParticleWavesScene } from './ParticleWavesScene'
import { CyberTunnelScene } from './CyberTunnelScene'
import type { VisualizerMode } from '@/types'

interface ThreeStudioCanvasProps {
  mode: VisualizerMode
  isPlaying: boolean
  quality: 'high' | 'balanced' | 'low'
  getAudioData: () => Uint8Array
}

export const ThreeStudioCanvas: React.FC<ThreeStudioCanvasProps> = ({
  mode,
  isPlaying,
  quality,
  getAudioData,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const isDraggingRef = useRef(false)
  const lastPointerXRef = useRef(0)
  const turntableSceneRef = useRef<VinylTurntableScene | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const width = container.clientWidth || 600
    const height = container.clientHeight || 400

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: quality === 'high',
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch {
      return
    }

    const pixelRatio = quality === 'high' ? Math.min(window.devicePixelRatio, 2) : 1
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(width, height)

    // Instantiate scenes
    const turntable = new VinylTurntableScene(width, height)
    const waves = new ParticleWavesScene(width, height)
    const tunnel = new CyberTunnelScene(width, height)
    turntableSceneRef.current = turntable

    let animId: number
    let lastTime = performance.now()
    let isPausedByVisibility = false

    const render = () => {
      if (isPausedByVisibility) return

      const now = performance.now()
      const deltaTime = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      const audioData = getAudioData()

      if (mode === 'turntable') {
        turntable.update(deltaTime, isPlaying, audioData)
        renderer.render(turntable.scene, turntable.camera)
      } else if (mode === 'waves') {
        waves.update(deltaTime, isPlaying, audioData)
        renderer.render(waves.scene, waves.camera)
      } else if (mode === 'tunnel') {
        tunnel.update(deltaTime, isPlaying, audioData)
        renderer.render(tunnel.scene, tunnel.camera)
      }

      animId = requestAnimationFrame(render)
    }

    // Page visibility optimization: halts rendering when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPausedByVisibility = true
        cancelAnimationFrame(animId)
      } else {
        isPausedByVisibility = false
        lastTime = performance.now()
        animId = requestAnimationFrame(render)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    animId = requestAnimationFrame(render)

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect
        if (newWidth > 0 && newHeight > 0) {
          renderer.setSize(newWidth, newHeight)
          turntable.resize(newWidth, newHeight)
          waves.resize(newWidth, newHeight)
          tunnel.resize(newWidth, newHeight)
        }
      }
    })

    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(animId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      resizeObserver.disconnect()
      turntable.dispose()
      waves.dispose()
      tunnel.dispose()
      turntableSceneRef.current = null
      renderer.dispose()
    }
  }, [mode, isPlaying, quality, getAudioData])

  // Pointer drag for Vinyl scratching / spinning
  const handlePointerDown = (e: React.PointerEvent) => {
    if (mode !== 'turntable') return
    isDraggingRef.current = true
    lastPointerXRef.current = e.clientX
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || mode !== 'turntable') return
    const deltaX = e.clientX - lastPointerXRef.current
    lastPointerXRef.current = e.clientX
    turntableSceneRef.current?.onDrag(deltaX)
  }

  const handlePointerUp = () => {
    isDraggingRef.current = false
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="relative w-full h-full min-h-[380px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden rounded-2xl"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}

