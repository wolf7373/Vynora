import * as THREE from 'three'

export class CyberTunnelScene {
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera
  private rings: THREE.LineLoop[] = []
  private ringCount = 28
  private spacing = 1.4
  private tunnelSpeed = 4.0

  constructor(width: number, height: number) {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)
    this.camera.position.set(0, 0, 3)

    // Build Tunnel Rings
    for (let i = 0; i < this.ringCount; i++) {
      // Hexagonal ring geometry
      const segments = 6
      const radius = 2.2
      const points: THREE.Vector3[] = []

      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2
        points.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0))
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const isCyan = i % 2 === 0
      const material = new THREE.LineBasicMaterial({
        color: isCyan ? 0x00f2fe : 0x7f00ff,
        transparent: true,
        opacity: 0.7,
      })

      const ring = new THREE.LineLoop(geometry, material)
      ring.position.z = -i * this.spacing
      this.rings.push(ring)
      this.scene.add(ring)
    }
  }

  public update(deltaTime: number, isPlaying: boolean, audioData: Uint8Array) {
    // Average bass from first 8 bins
    let bass = 0
    for (let i = 0; i < 8; i++) {
      bass += audioData[i] || 0
    }
    const bassNormalized = bass / 8 / 255 // 0.0 to 1.0

    const currentSpeed = isPlaying
      ? this.tunnelSpeed + bassNormalized * 6
      : this.tunnelSpeed * 0.4

    for (let i = 0; i < this.rings.length; i++) {
      const ring = this.rings[i]
      ring.position.z += currentSpeed * deltaTime

      // Rotate slightly as it moves
      ring.rotation.z += (i % 2 === 0 ? 0.2 : -0.2) * deltaTime

      // Reactive bass pulse on size
      const scale = 1.0 + bassNormalized * 0.3 * Math.sin(i * 0.5)
      ring.scale.set(scale, scale, 1)

      // Loop back when passing camera
      if (ring.position.z > 3.0) {
        ring.position.z -= this.ringCount * this.spacing
      }
    }
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  public dispose() {
    for (const ring of this.rings) {
      ring.geometry.dispose()
    }
    this.scene.clear()
  }
}

