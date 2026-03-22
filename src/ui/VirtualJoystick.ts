import Phaser from 'phaser'

export interface JoystickState {
  dx: number
  dy: number
  punch: boolean
  kick: boolean
  block: boolean
}

export class VirtualJoystick {
  private scene: Phaser.Scene
  private knob!: Phaser.GameObjects.Arc
  private joystickPointerId: number | null = null

  private readonly bX: number
  private readonly bY: number
  private readonly RADIUS = 135

  public dx = 0
  public dy = 0

  private btnState: Record<string, boolean> = {
    punch: false, kick: false, block: false,
  }

  readonly isTouch: boolean

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.isTouch = scene.sys.game.device.input.touch

    this.bX = 60
    this.bY = 737

    if (!this.isTouch) return

    scene.input.addPointer(3)
    this.buildJoystick()
    this.buildButtons()
  }

  private buildJoystick() {
    // Base
    this.scene.add.arc(this.bX, this.bY, this.RADIUS)
      .setFillStyle(0xffffff, 0.08)
      .setStrokeStyle(2, 0xffffff, 0.3)
      .setDepth(200).setScrollFactor(0)

    // Knob
    this.knob = this.scene.add.arc(this.bX, this.bY, 54)
      .setFillStyle(0xffffff, 0.35)
      .setStrokeStyle(2, 0xffffff, 0.6)
      .setDepth(201).setScrollFactor(0)

    this.scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.x < this.scene.scale.width * 0.5 && this.joystickPointerId === null) {
        this.joystickPointerId = p.id
      }
    })

    this.scene.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.id !== this.joystickPointerId) return
      const dx = p.x - this.bX
      const dy = p.y - this.bY
      const dist = Math.min(Math.sqrt(dx * dx + dy * dy), this.RADIUS)
      const angle = Math.atan2(dy, dx)
      this.dx = Math.cos(angle) * (dist / this.RADIUS)
      this.dy = Math.sin(angle) * (dist / this.RADIUS)
      this.knob.setPosition(
        this.bX + Math.cos(angle) * dist,
        this.bY + Math.sin(angle) * dist,
      )
    })

    this.scene.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (p.id === this.joystickPointerId) {
        this.joystickPointerId = null
        this.dx = 0
        this.dy = 0
        this.knob.setPosition(this.bX, this.bY)
      }
    })
  }

  private buildButtons() {
    const btns = [
      { name: 'punch', label: 'J', x: 1506, y: 875, color: 0xff5544 },
      { name: 'kick',  label: 'K', x: 1666, y: 835, color: 0x4488ff },
      { name: 'block', label: '🛡', x: 1826, y: 775, color: 0xffaa33 },
    ]

    btns.forEach(btn => {
      const arc = this.scene.add.arc(btn.x, btn.y, 72)
        .setFillStyle(btn.color, 0.45)
        .setStrokeStyle(2, 0xffffff, 0.5)
        .setDepth(200).setScrollFactor(0)
        .setInteractive()

      this.scene.add.text(btn.x, btn.y, btn.label, {
        fontSize: '40px', color: '#ffffff', fontFamily: 'monospace',
      }).setDepth(201).setScrollFactor(0).setOrigin(0.5)

      const setActive = (v: boolean) => {
        this.btnState[btn.name] = v
        arc.setFillStyle(btn.color, v ? 0.8 : 0.45)
      }

      arc.on('pointerdown',  () => setActive(true))
      arc.on('pointerup',    () => setActive(false))
      arc.on('pointerout',   () => setActive(false))
    })
  }

  getState(): JoystickState {
    return {
      dx: this.dx, dy: this.dy,
      punch: this.btnState.punch,
      kick:  this.btnState.kick,
      block: this.btnState.block,
    }
  }
}
