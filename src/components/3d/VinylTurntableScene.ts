import * as THREE from 'three'

export class VinylTurntableScene {
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera
  private discGroup: THREE.Group
  private tonearmGroup: THREE.Group
  private platter: THREE.Mesh
  private spinVelocity = 0
  private targetVelocity = (33.33 / 60) * Math.PI * 2 // 33.3 RPM
  private dragDelta = 0

  constructor(width: number, height: number) {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    this.camera.position.set(0, 4.5, 6.5)
    this.camera.lookAt(0, 0, 0)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    this.scene.add(ambientLight)

    const cyanLight = new THREE.PointLight(0x00f2fe, 3, 20)
    cyanLight.position.set(-3, 4, 3)
    this.scene.add(cyanLight)

    const purpleLight = new THREE.PointLight(0x7f00ff, 3, 20)
    purpleLight.position.set(3, 4, -2)
    this.scene.add(purpleLight)

    // Base Platter Deck
    const deckGeo = new THREE.BoxGeometry(7, 0.4, 5.5)
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x111318,
      roughness: 0.4,
      metalness: 0.8,
    })
    const deck = new THREE.Mesh(deckGeo, deckMat)
    deck.position.y = -0.3
    this.scene.add(deck)

    // Disc Group (Platter + Vinyl Disc + Center Spindle)
    this.discGroup = new THREE.Group()
    this.discGroup.position.set(-0.8, 0, 0)

    // Vinyl Record (Black acrylic cylinder)
    const vinylGeo = new THREE.CylinderGeometry(2.1, 2.1, 0.08, 64)
    const vinylMat = new THREE.MeshStandardMaterial({
      color: 0x08090c,
      roughness: 0.2,
      metalness: 0.6,
    })
    this.platter = new THREE.Mesh(vinylGeo, vinylMat)
    this.discGroup.add(this.platter)

    // Groove Rings
    for (let r = 0.9; r < 2.0; r += 0.15) {
      const ringGeo = new THREE.RingGeometry(r, r + 0.04, 64)
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x181b22,
        side: THREE.DoubleSide,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = -Math.PI / 2
      ring.position.y = 0.045
      this.discGroup.add(ring)
    }

    // Center Vinyl Label (Gradient Cyan / Violet)
    const labelGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.085, 32)
    const labelMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      roughness: 0.5,
      metalness: 0.3,
    })
    const label = new THREE.Mesh(labelGeo, labelMat)
    this.discGroup.add(label)

    // Spindle Pin
    const spindleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.3, 16)
    const spindleMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.1,
    })
    const spindle = new THREE.Mesh(spindleGeo, spindleMat)
    spindle.position.y = 0.15
    this.discGroup.add(spindle)

    this.scene.add(this.discGroup)

    // Tonearm Group
    this.tonearmGroup = new THREE.Group()
    this.tonearmGroup.position.set(2.2, 0.1, 1.2)

    // Tonearm Base Pivot
    const pivotGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.4, 24)
    const pivotMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
    const pivot = new THREE.Mesh(pivotGeo, pivotMat)
    this.tonearmGroup.add(pivot)

    // Tonearm Rod
    const armGeo = new THREE.CylinderGeometry(0.03, 0.03, 3.2, 16)
    const armMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9 })
    const arm = new THREE.Mesh(armGeo, armMat)
    arm.rotation.z = Math.PI / 2 - 0.1
    arm.rotation.y = -0.6
    arm.position.set(-1.2, 0.2, -1.0)
    this.tonearmGroup.add(arm)

    // Cartridge Needle Head
    const headGeo = new THREE.BoxGeometry(0.25, 0.12, 0.15)
    const headMat = new THREE.MeshStandardMaterial({ color: 0x00f2fe, metalness: 0.7 })
    const head = new THREE.Mesh(headGeo, headMat)
    head.position.set(-2.5, 0.15, -2.1)
    this.tonearmGroup.add(head)

    this.scene.add(this.tonearmGroup)
  }

  public onDrag(deltaX: number) {
    this.dragDelta += deltaX * 0.05
  }

  public update(deltaTime: number, isPlaying: boolean, audioData: Uint8Array) {
    // Calculate average bass frequency (bins 0-8)
    let bassSum = 0
    for (let i = 0; i < 8; i++) {
      bassSum += audioData[i] || 0
    }
    const bassAvg = bassSum / 8 / 255 // 0.0 to 1.0

    // Spin inertia
    const target = isPlaying ? this.targetVelocity : 0
    this.spinVelocity += (target - this.spinVelocity) * Math.min(deltaTime * 2.5, 1)

    // Apply drag inertia
    this.spinVelocity += this.dragDelta
    this.dragDelta *= 0.85 // decay

    this.discGroup.rotation.y += this.spinVelocity * deltaTime

    // Subtle bass reactive pulsing on vinyl platter
    const pulseScale = 1.0 + bassAvg * 0.03
    this.platter.scale.set(pulseScale, 1, pulseScale)

    // Tonearm resting vs playing angle
    const targetArmAngle = isPlaying ? -0.25 : 0.2
    this.tonearmGroup.rotation.y +=
      (targetArmAngle - this.tonearmGroup.rotation.y) * Math.min(deltaTime * 3, 1)
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  public dispose() {
    this.scene.clear()
  }
}

