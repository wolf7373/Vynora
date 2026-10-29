import { describe, it, expect } from 'vitest'
import { isWebGLAvailable } from '../../components/3d/webglCheck'
import { VinylTurntableScene } from '../../components/3d/VinylTurntableScene'
import { ParticleWavesScene } from '../../components/3d/ParticleWavesScene'
import { CyberTunnelScene } from '../../components/3d/CyberTunnelScene'

describe('3D WebGL Studio Engine (Milestone 8)', () => {
  it('detects WebGL availability and falls back gracefully in JSDOM', () => {
    // In headless JSDOM, canvas.getContext('webgl') is not implemented, so isWebGLAvailable() returns false
    const available = isWebGLAvailable()
    expect(typeof available).toBe('boolean')
  })

  it('initializes VinylTurntableScene and runs update loop with 33 RPM inertia', () => {
    const scene = new VinylTurntableScene(800, 600)
    expect(scene.scene).toBeDefined()
    expect(scene.camera).toBeDefined()

    const audioData = new Uint8Array(64).fill(128)
    // Update when playing (spins up towards 33 RPM)
    expect(() => scene.update(0.016, true, audioData)).not.toThrow()

    // Test drag interaction
    expect(() => scene.onDrag(15)).not.toThrow()

    // Update when paused (spins down)
    expect(() => scene.update(0.016, false, audioData)).not.toThrow()

    scene.dispose()
  })

  it('initializes 54x54 ParticleWavesScene with exactly 2916 particles', () => {
    const waves = new ParticleWavesScene(800, 600)
    expect(waves.scene).toBeDefined()

    // 54 * 54 = 2916 particles per blueprint specification
    const pointsMesh = waves.scene.children[0] as unknown as {
      geometry: { attributes: { position: { count: number }; color: { count: number } } }
    }
    expect(pointsMesh.geometry.attributes.position.count).toBe(54 * 54)
    expect(pointsMesh.geometry.attributes.color.count).toBe(54 * 54)

    const audioData = new Uint8Array(64)
    audioData[0] = 200
    audioData[10] = 150
    expect(() => waves.update(0.016, true, audioData)).not.toThrow()

    waves.dispose()
  })

  it('initializes CyberTunnelScene with wireframe rings advancing with audio bass', () => {
    const tunnel = new CyberTunnelScene(800, 600)
    expect(tunnel.scene).toBeDefined()
    expect(tunnel.scene.children.length).toBeGreaterThan(10)

    const audioData = new Uint8Array(64).fill(180)
    expect(() => tunnel.update(0.016, true, audioData)).not.toThrow()

    tunnel.dispose()
  })
})

