import Phaser from 'phaser'
import { RING } from '../scenes/GameScene'
import { sound } from '../systems/SoundManager'

export interface MoveInput {
  up: boolean; down: boolean; left: boolean; right: boolean
  block?: boolean
}

const STATS: Record<string, { speed: number; maxHp: number; sizeScale: number; scaleH: number; punchReach: number; kickReach: number }> = {
  werdum: { speed: 144, maxHp: 150, sizeScale: 0.75, scaleH: 0.72, punchReach: 158, kickReach: 190 },
  dida:   { speed: 203, maxHp: 120, sizeScale: 1.00, scaleH: 1.00, punchReach:  83, kickReach:  97 },
  thor:   { speed: 237, maxHp: 100, sizeScale: 1.00, scaleH: 1.00, punchReach: 158, kickReach: 190 },
}

// Personagens com spritesheets de animação prontos
const ANIMATED = new Set(['werdum', 'dida', 'thor'])

type PlayerState = 'normal' | 'knockdown' | 'recovering' | 'blocking'

export class Player extends Phaser.GameObjects.Sprite {
  public readonly charKey: string
  public readonly maxHp: number
  private speed: number
  private playerState: PlayerState = 'normal'

  // Knockdown
  private knockdownTimer = 0
  public isKnockedDown = false

  // Bloqueio
  public isBlocking = false

  // Escala horizontal por animação — normaliza corpo visual para mesma largura em todos os frames
  // Referência: idle@0.72 → corpo visual 114.5px. scaleH = 114.5 / body_width_median
  private static readonly ANIM_SCALE_H: Record<string, number> = {
    'werdum-idle':        0.72,
    'werdum-run':         0.72,
    'werdum-punch':       0.61,
    'werdum-punch-combo': 0.61,
    'werdum-kick':        0.65,
    'werdum-hit':         0.63,
    'werdum-block':       0.72,
    'werdum-knockdown':   0.72,
  }

  // Origem corrigida por animação (compensa conteúdo descentrado no frame)
  private static readonly ANIM_ORIGIN_X: Record<string, number> = {
    'werdum-run':         104 / 192,
    'werdum-punch':       174 / 320,
    'werdum-punch-combo': 174 / 320,
    'werdum-kick':        217 / 384,
  }

  // Animações
  private readonly hasAnims: boolean
  private animLocked = false
  private punchComboQueued = false
  private kickAnimLocked = false
  private prevX = 0
  private prevGroundY = 0

  // Posição lógica no ringue (sem offset de pulo)
  private _groundY = 0
  // Altura original do frame (antes de qualquer scale)
  private readonly frameH: number
  // Cache de perspectiva — evita recalcular quando Y e animação não mudaram
  private _lastScaleGroundY = -Infinity
  private _lastScaleAnimKey = ''

  constructor(scene: Phaser.Scene, x: number, y: number, key: string) {
    const textureKey = ANIMATED.has(key) ? `${key}-idle-sheet` : key
    super(scene, x, y, textureKey, 0)

    this.charKey   = key
    this._groundY  = y
    this.prevX     = x
    this.prevGroundY = y

    const stats = STATS[key] ?? STATS['werdum']
    this.speed = stats.speed
    this.maxHp = stats.maxHp

    // Capturar altura original do frame (scaleY=1 neste momento)
    this.frameH = this.height
    // Scale inicial será definido pelo primeiro applyPerspectiveScale()

    this.hasAnims = ANIMATED.has(key)
    scene.add.existing(this as unknown as Phaser.GameObjects.GameObject)
    this.setOrigin(0.5, 1.0)
    this.applyPerspectiveScale()
    this.setDepth(y)

    if (this.hasAnims) {
      this.createAnimations()
      this.play(`${key}-idle`)
      this.on('animationcomplete', (anim: Phaser.Animations.Animation) => {
        if (anim.key === `${key}-kick`) {
          this.kickAnimLocked = false
          this.animLocked = false
        }
        if (anim.key === `${key}-punch`) {
          if (this.punchComboQueued) {
            this.punchComboQueued = false
            this.scene.time.delayedCall(0, () => this.play(`${key}-punch-combo`))
          } else {
            this.animLocked = false
          }
        }
        if (anim.key === `${key}-punch-combo` || anim.key === `${key}-hit` || anim.key === `${key}-knockdown`) {
          this.animLocked = false
        }
      })
    }
  }

  /** Ajusta a origem horizontal para alinhar o centro visual do conteúdo com a posição lógica */
  private applyOriginForAnim(animKey: string) {
    const ox = Player.ANIM_ORIGIN_X[animKey] ?? 0.5
    this.setOrigin(ox, 1.0)
  }

  /** Scale proporcional à profundidade: fundo=204px, frente=420px */
  private applyPerspectiveScale() {
    const currentAnim = this.anims.currentAnim?.key ?? `${this.charKey}-idle`
    if (this._groundY === this._lastScaleGroundY && currentAnim === this._lastScaleAnimKey) return
    this._lastScaleGroundY = this._groundY
    this._lastScaleAnimKey = currentAnim
    const stats  = STATS[this.charKey] ?? STATS['werdum']
    const t      = Phaser.Math.Clamp(
      (this._groundY - RING.top) / (RING.bottom - RING.top), 0, 1,
    )
    const dispH  = Phaser.Math.Linear(204, 420, t) * stats.sizeScale
    const scaleY = dispH / this.frameH
    const scaleH = Player.ANIM_SCALE_H[currentAnim] ?? stats.scaleH
    this.setScale(scaleY * scaleH, scaleY)
  }

  private createAnimations() {
    const k  = this.charKey
    const ac = this.scene.anims
    if (ac.exists(`${k}-idle`)) return

    // Configurações por personagem (idle endFrame, walk/run endFrame)
    const ANIM_CFG: Record<string, { idleEnd: number; moveEnd: number; moveSheet: string }> = {
      werdum: { idleEnd: 7,  moveEnd: 35, moveSheet: 'werdum-walk-sheet'  },
      dida:   { idleEnd: 35, moveEnd: 24, moveSheet: 'dida-walk-sheet'   },
      thor:   { idleEnd: 35, moveEnd: 35, moveSheet: 'thor-walk-sheet'   },
    }
    const cfg = ANIM_CFG[k] ?? { idleEnd: 7, moveEnd: 35, moveSheet: `${k}-run-sheet` }

    ac.create({ key: `${k}-idle`, frames: ac.generateFrameNumbers(`${k}-idle-sheet`, { start: 0, end: cfg.idleEnd }), frameRate: 10, repeat: -1 })
    ac.create({ key: `${k}-run`,  frames: ac.generateFrameNumbers(cfg.moveSheet,     { start: 0, end: cfg.moveEnd }), frameRate: 14, repeat: -1 })

    // Animações de combate (só para personagens com sprites completos)
    const COMBAT_CFG: Record<string, { hitEnd: number; blockStart: number; blockEnd: number; punchFps: number; jabEnd: number; knockdownEnd: number }> = {
      werdum: { hitEnd: 24, blockStart: 8,  blockEnd: 18, punchFps: 26, jabEnd: 9, knockdownEnd: 35 },
      dida:   { hitEnd: 15, blockStart: 0,  blockEnd: 8,  punchFps: 21, jabEnd: 7, knockdownEnd: 35 },
      thor:   { hitEnd: 35, blockStart: 0,  blockEnd: 15, punchFps: 26, jabEnd: 8, knockdownEnd: 35 },
    }
    const cc = COMBAT_CFG[k] ?? COMBAT_CFG['werdum']

    if (this.scene.textures.exists(`${k}-punch-sheet`)) {
      ac.create({ key: `${k}-punch`,       frames: ac.generateFrameNumbers(`${k}-punch-sheet`, { start: 0, end: cc.jabEnd }), frameRate: cc.punchFps, repeat: 0 })
      ac.create({ key: `${k}-punch-combo`, frames: ac.generateFrameNumbers(`${k}-punch-sheet`, { start: 0, end: 24       }), frameRate: cc.punchFps, repeat: 0 })
    }
    if (this.scene.textures.exists(`${k}-kick-sheet`))
      ac.create({ key: `${k}-kick`,      frames: ac.generateFrameNumbers(`${k}-kick-sheet`,      { start: 0, end: 24          }), frameRate: 22, repeat: 0  })
    if (this.scene.textures.exists(`${k}-hit-sheet`))
      ac.create({ key: `${k}-hit`,       frames: ac.generateFrameNumbers(`${k}-hit-sheet`,       { start: 0, end: cc.hitEnd   }), frameRate: 22, repeat: 0  })
    if (this.scene.textures.exists(`${k}-block-sheet`))
      ac.create({ key: `${k}-block`,     frames: ac.generateFrameNumbers(`${k}-block-sheet`,     { start: cc.blockStart, end: cc.blockEnd }), frameRate: 28, repeat: -1 })
    if (this.scene.textures.exists(`${k}-knockdown-sheet`))
      ac.create({ key: `${k}-knockdown`, frames: ac.generateFrameNumbers(`${k}-knockdown-sheet`, { start: 0, end: cc.knockdownEnd }), frameRate: 14, repeat: 0  })
  }

  /** Dispara animação de soco/chute (chamado pelo GameScene) */
  playPunchAnim() {
    if (!this.hasAnims) return
    if (this.animLocked) {
      // Se estiver no jab simples, enfileirar o combo
      if (this.anims.currentAnim?.key === `${this.charKey}-punch`) {
        this.punchComboQueued = true
      }
      return
    }
    this.animLocked = true
    this.punchComboQueued = false
    this.play(`${this.charKey}-punch`)
    this.applyOriginForAnim(`${this.charKey}-punch`)
  }

  /** Dispara animação de chute (chamado pelo GameScene) */
  playKickAnim() {
    if (!this.hasAnims || this.kickAnimLocked || this.animLocked) return
    this.kickAnimLocked = true
    this.animLocked = true
    this.play(`${this.charKey}-kick`)
    this.applyOriginForAnim(`${this.charKey}-kick`)
  }

  /** Dispara animação de dano (chamado pelo GameScene) */
  playHitAnim() {
    if (!this.hasAnims) return
    this.kickAnimLocked = false
    this.punchComboQueued = false
    this.animLocked = true
    this.play(`${this.charKey}-hit`)
    this.applyOriginForAnim(`${this.charKey}-hit`)
  }

  /** Posição lógica Y (sem offset de pulo) — usar para depth e hit detection */
  get groundY(): number { return this._groundY }

  move(input: MoveInput, delta: number) {
    const wantBlock = !!(input.block && (this.playerState === 'normal' || this.playerState === 'blocking'))
    this.isBlocking = wantBlock
    if (wantBlock) {
      this.playerState = 'blocking'
      return
    }
    if (this.playerState === 'blocking') this.playerState = 'normal'

    if (this.playerState === 'knockdown' || this.playerState === 'recovering') return

    const dt = delta / 1000
    let dx = 0, dy = 0

    if (this.playerState === 'normal') {
      if (input.left)  dx -= this.speed
      if (input.right) dx += this.speed
      if (input.up)    dy -= this.speed * 0.6
      if (input.down)  dy += this.speed * 0.6
    }

    if (dx < 0) this.setFlipX(true)
    if (dx > 0) this.setFlipX(false)

    const newX    = Phaser.Math.Clamp(this.x + dx * dt, RING.left, RING.right)
    this._groundY = Phaser.Math.Clamp(this._groundY + dy * dt, RING.top, RING.bottom)
    this.setPosition(newX, this._groundY)
  }

  update(delta: number) {
    this.setY(this._groundY)

    // Knockdown timer
    if (this.playerState === 'knockdown') {
      this.knockdownTimer -= delta
      if (this.knockdownTimer <= 0) {
        this.playerState = 'recovering'
        this.scene.time.delayedCall(500, () => {
          if (this.playerState === 'recovering') {
            this.playerState = 'normal'
            this.isKnockedDown = false
            this.animLocked = false
            this.clearTint()
            this.setAngle(0)
          }
        })
      }
    }

    // Controle de animação (idle / run / block)
    if (this.hasAnims && !this.animLocked) {
      const moving = (this.x !== this.prevX || this._groundY !== this.prevGroundY)
      let target: string
      if (this.playerState === 'blocking') {
        target = `${this.charKey}-block`
      } else if (moving) {
        target = `${this.charKey}-run`
      } else {
        target = `${this.charKey}-idle`
      }
      if (this.anims.currentAnim?.key !== target) {
        this.play(target)
        this.applyOriginForAnim(target)
      }
    }

    this.applyPerspectiveScale()
    this.prevX       = this.x
    this.prevGroundY = this._groundY
  }

  get visualY(): number { return this._groundY }

  /** Move o personagem para uma posição corrigida (colisão com wand) */
  nudgeTo(x: number, groundY: number) {
    this.x        = x
    this._groundY = groundY
  }

  /** X aproximado da ponta do punho (hit detection do soco) */
  get punchHitX(): number {
    const dir = this.flipX ? -1 : 1
    const reach = (STATS[this.charKey] ?? STATS['werdum']).punchReach
    return this.x + dir * reach * this.scaleX
  }

  /** X aproximado da ponta do pé (hit detection do chute) */
  get kickHitX(): number {
    const dir = this.flipX ? -1 : 1
    const reach = (STATS[this.charKey] ?? STATS['werdum']).kickReach
    return this.x + dir * reach * this.scaleX
  }

  canAttack(): boolean {
    return this.playerState === 'normal'
  }

  knockdown() {
    if (this.playerState !== 'normal' && this.playerState !== 'blocking') return
    this.playerState    = 'knockdown'
    this.isKnockedDown  = true
    this.knockdownTimer = 2000
    this.clearTint()
    this.setAngle(0)
    this.animLocked = true
    this.kickAnimLocked = false
    this.punchComboQueued = false
    if (this.hasAnims) {
      this.play(`${this.charKey}-knockdown`)
      this.applyOriginForAnim(`${this.charKey}-knockdown`)
    }
    sound.playerKnockdown()
  }
}
