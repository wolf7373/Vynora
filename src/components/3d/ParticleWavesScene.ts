import * as THREE from 'three'

export class ParticleWavesScene {
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera
  private particles: THREE.Points
  private geometry: THREE.BufferGeometry
  private positions: Float32Array
  private colors: Float32Array
  private count = 54 // 54x54 mesh per blueprint
  private totalParticles = 54 * 54
  private time = 0

  constructor(width: number, height: number) {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
    this.camera.position.set(0, 7, 9)
    this.camera.lookAt(0, 0, 0)

    // Build 54x54 Particle Grid
    this.geometry = new THREE.BufferGeometry()
    this.positions = new Float32Array(this.totalParticles * 3)
    this.colors = new Float32Array(this.totalParticles * 3)

    const spacing = 0.28
    const offset = ((this.count - 1) * spacing) / 2

    let idx = 0
    for (let x = 0; x < this.count; x++) {
      for (let z = 0; z < this.count; z++) {
        const posX = x * spacing - offset
        const posZ = z * spacing - offset

        this.positions[idx * 3] = posX
        this.positions[idx * 3 + 1] = 0 // Y height
        this.positions[idx * 3 + 2] = posZ

        // Normalized distance for color gradient (Cyan #00F2FE to Violet #7F00FF)
        const t = Math.sqrt(posX * posX + posZ * posZ) / (offset * 1.4)
        const clampedT = Math.min(Math.max(t, 0), 1)

        // Interpolate between Cyan (0.0, 0.95, 1.0) and Violet (0.5, 0.0, 1.0)
        this.colors[idx * 3] = THREE.MathUtils.lerp(0.0, 0.5, clampedT)
        this.colors[idx * 3 + 1] = THREE.MathUtils.lerp(0.95, 0.0, clampedT)
        this.colors[idx * 3 + 2] = 1.0

        idx++
      }
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    })

    this.particles = new THREE.Points(this.geometry, material)
    this.scene.add(this.particles)
  }

  public update(deltaTime: number, isPlaying: boolean, audioData: Uint8Array) {
    this.time += deltaTime * (isPlaying ? 2.5 : 0.8)

    let idx = 0
    const binCount = Math.min(64, audioData.length || 64)

    for (let x = 0; x < this.count; x++) {
      for (let z = 0; z < this.count; z++) {
        // Map grid coordinate to frequency bin
        const binIndex = Math.floor((x / this.count) * binCount)
        const freqVal = audioData[binIndex] || 0
        const audioAmplitude = (freqVal / 255) * 1.5

        // Sine wave ripple combined with audio data
        const distance = Math.sqrt((x - 27) * (x - 27) + (z - 27) * (z - 27))
        const wave = Math.sin(distance * 0.35 - this.time * 2) * (isPlaying ? 0.3 : 0.15)

        const y = wave + (isPlaying ? audioAmplitude * Math.sin(this.time + x * 0.2) : 0)

        this.positions[idx * 3 + 1] = y
        idx++
      }
    }

    this.geometry.attributes.position.needsUpdate = true
    this.particles.rotation.y = this.time * 0.05
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  public dispose() {
    this.geometry.dispose()
    this.scene.clear()
  }
}

