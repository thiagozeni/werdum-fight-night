import Phaser from 'phaser'
import { RING } from '../scenes/GameScene'
import { sound } from '../systems/SoundManager'

export type EnemyType = 'weak' | 'fat' | 'strong' | 'chair' | 'boss_son' | 'boss_coach' | 'boss_popo'

export const ENEMY_SCORE: Record<EnemyType, number> = {
  weak: 10, strong: 25, chair: 25, fat: 40,
  boss_son: 200, boss_coach: 300, boss_popo: 500,
}

interface EnemyStats {
  hp: number; speed: number
  damageToPlayer: number; damageToWand: number
  scale: number; isBoss?: boolean
}

const STATS: Record<EnemyType, EnemyStats> = {
  weak:       { hp: 40,  speed: 75,  damageToPlayer: 10, damageToWand: 12, scale: 1.00 },
  fat:        { hp: 130, speed: 45,  damageToPlayer: 18, damageToWand: 20, scale: 1.00 },
  strong:     { hp: 90,  speed: 60,  damageToPlayer: 15, damageToWand: 18, scale: 1.00 },
  chair:      { hp: 50,  speed: 65,  damageToPlayer: 28, damageToWand: 30, scale: 1.00 },
  boss_son:   { hp: 180, speed: 100, damageToPlayer: 18, damageToWand: 20, scale: 1.00, isBoss: true },
  boss_coach: { hp: 350, speed: 40,  damageToPlayer: 30, damageToWand: 35, scale: 1.00, isBoss: true },
  boss_popo:  { hp: 300, speed: 70,  damageToPlayer: 25, damageToWand: 30, scale: 1.00, isBoss: true },
}

// Personagens com spritesheets de animação completos
const ANIMATED_ENEMIES = new Set([
  'bad-guy1', 'bad-guy2', 'bad-guy3',
  'bad-guy-fat', 'bad-guy-strong', 'bad-guy-chair',
  'popo', 'popo-son', 'popo-coach',
])

interface AnimCfg {
  idleEnd: number; walkEnd: number
  punchEnd: number; kickEnd: number
  hitEnd: number; knockdownEnd: number; attackFps: number
}

const ANIM_CFG: Record<string, AnimCfg> = {
  'bad-guy1':      { idleEnd: 35, walkEnd: 35, punchEnd: 24, kickEnd: 35, hitEnd: 24, knockdownEnd: 35, attackFps: 22 },
  'bad-guy2':      { idleEnd: 24, walkEnd: 35, punchEnd: 24, kickEnd: 24, hitEnd: 24, knockdownEnd: 35, attackFps: 22 },
  'bad-guy3':      { idleEnd: 24, walkEnd: 35, punchEnd: 24, kickEnd: 24, hitEnd: 35, knockdownEnd: 35, attackFps: 22 },
  'bad-guy-fat':   { idleEnd: 24, walkEnd: 35, punchEnd: 24, kickEnd: 24, hitEnd: 24, knockdownEnd: 35, attackFps: 18 },
  'bad-guy-strong':{ idleEnd: 35, walkEnd: 35, punchEnd: 24, kickEnd: 24, hitEnd: 35, knockdownEnd: 35, attackFps: 22 },
  'bad-guy-chair': { idleEnd: 35, walkEnd: 35, punchEnd: 24, kickEnd: 24, hitEnd: 24, knockdownEnd: 24, attackFps: 18 },
  'popo':          { idleEnd: 35, walkEnd: 24, punchEnd: 24, kickEnd: 24, hitEnd: 35, knockdownEnd: 35, attackFps: 22 },
  'popo-son':      { idleEnd: 24, walkEnd: 35, punchEnd: 24, kickEnd: 35, hitEnd: 35, knockdownEnd: 35, attackFps: 22 },
  'popo-coach':    { idleEnd: 35, walkEnd: 35, punchEnd: 24, kickEnd: 24, hitEnd: 24, knockdownEnd: 35, attackFps: 22 },
}

const WEAK_KEYS = ['bad-guy1', 'bad-guy2', 'bad-guy3']
const BOSS_KEYS: Partial<Record<EnemyType, string>> = {
  boss_son: 'popo-son', boss_coach: 'popo-coach', boss_popo: 'popo',
}

type AIState = 'approach' | 'waitBeforeAttack' | 'chasePlayer' | 'knockdown' | 'recover' | 'dead'

interface Positionable { x: number; y: number }

export class Enemy extends Phaser.GameObjects.Sprite {
  public hp: number
  public readonly maxHp: number
  public readonly damageToPlayer: number
  public readonly damageToWand: number
  public readonly enemyType: EnemyType
  public readonly isBoss: boolean
  public isDead = false

  private readonly charKey: string
  private readonly hasAnims: boolean
  private animLocked = false
  private attackCount = 0  // alterna punch/kick

  private baseSpeed: number
  private currentSpeed: number
  private aiState: AIState = 'approach'
  private target: 'wand' | Positionable = 'wand'
  private noHitTimer = 0
  private waitTimer = 0
  private attackCooldown = 0
  private knockdownTimer = 0
  private inPhase2 = false

  public wandRef!: Positionable
  public playerRef!: Positionable

  // UI
  private hpBarBg!: Phaser.GameObjects.Rectangle
  private hpBar!: Phaser.GameObjects.Rectangle
  private aggroIcon!: Phaser.GameObjects.Text
  private BAR_W = 40
  private readonly BAR_H = 5
  // Perspectiva
  private readonly frameH: number
  private dispH = 170
  private _lastScaleY = -Infinity

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType) {
    const charKey = BOSS_KEYS[type]
      ?? (type === 'weak'   ? WEAK_KEYS[Phaser.Math.Between(0, 2)]
        : type === 'strong' ? 'bad-guy-strong'
        : type === 'fat'    ? 'bad-guy-fat'
        : 'bad-guy-chair')

    const hasAnims = ANIMATED_ENEMIES.has(charKey)
    const textureKey = hasAnims ? `${charKey}-idle-sheet` : charKey

    super(scene, x, y, textureKey, 0)

    this.charKey = charKey
    this.hasAnims = hasAnims

    const stats = STATS[type]
    this.hp = stats.hp
    this.maxHp = stats.hp
    this.baseSpeed = stats.speed
    this.currentSpeed = stats.speed
    this.damageToPlayer = stats.damageToPlayer
    this.damageToWand = stats.damageToWand
    this.enemyType = type
    this.isBoss = !!stats.isBoss
    this.frameH = this.height  // captura antes de qualquer setScale

    if (stats.isBoss) {
      this.setTint(0xffd700)
      this.BAR_W = 80
    }

    this.applyPerspectiveScale()
    scene.add.existing(this as unknown as Phaser.GameObjects.GameObject)
    this.setOrigin(0.5, 1.0)

    if (hasAnims) {
      this.createAnimations()
      this.play(`${charKey}-idle`)
      this.on('animationcomplete', (anim: Phaser.Animations.Animation) => {
        if (
          anim.key === `${charKey}-punch` ||
          anim.key === `${charKey}-kick`  ||
          anim.key === `${charKey}-hit`
        ) {
          this.animLocked = false
        }
      })
    }

    // HP bar
    this.hpBarBg = scene.add.rectangle(x, y - this.dispH - 8, this.BAR_W + 2, this.BAR_H + 2, 0x000000).setDepth(99)
    this.hpBar = scene.add.rectangle(x - this.BAR_W / 2, y - this.dispH - 8, this.BAR_W, this.BAR_H,
      stats.isBoss ? 0xff8800 : 0xdd2222).setOrigin(0, 0.5).setDepth(99)

    this.aggroIcon = scene.add.text(x, y - this.dispH - 22, '', {
      fontSize: '14px', color: '#ff0000', fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(100)
  }

  private createAnimations() {
    const k  = this.charKey
    const ac = this.scene.anims
    if (ac.exists(`${k}-idle`)) return

    const cfg = ANIM_CFG[k]
    if (!cfg) return

    ac.create({ key: `${k}-idle`, frames: ac.generateFrameNumbers(`${k}-idle-sheet`, { start: 0, end: cfg.idleEnd }),   frameRate: 10, repeat: -1 })
    ac.create({ key: `${k}-walk`, frames: ac.generateFrameNumbers(`${k}-walk-sheet`, { start: 0, end: cfg.walkEnd }),   frameRate: 14, repeat: -1 })

    if (this.scene.textures.exists(`${k}-punch-sheet`))
      ac.create({ key: `${k}-punch`, frames: ac.generateFrameNumbers(`${k}-punch-sheet`, { start: 0, end: cfg.punchEnd }), frameRate: cfg.attackFps, repeat: 0 })
    if (this.scene.textures.exists(`${k}-kick-sheet`))
      ac.create({ key: `${k}-kick`,  frames: ac.generateFrameNumbers(`${k}-kick-sheet`,  { start: 0, end: cfg.kickEnd  }), frameRate: cfg.attackFps, repeat: 0 })
    if (this.scene.textures.exists(`${k}-hit-sheet`))
      ac.create({ key: `${k}-hit`,      frames: ac.generateFrameNumbers(`${k}-hit-sheet`,      { start: 0, end: cfg.hitEnd      }), frameRate: 22, repeat: 0 })
    if (this.scene.textures.exists(`${k}-knockdown-sheet`))
      ac.create({ key: `${k}-knockdown`, frames: ac.generateFrameNumbers(`${k}-knockdown-sheet`, { start: 0, end: cfg.knockdownEnd }), frameRate: 14, repeat: 0 })

  }

  private applyPerspectiveScale() {
    if (this.y === this._lastScaleY) return
    this._lastScaleY = this.y
    const stats = STATS[this.enemyType]
    const t = Phaser.Math.Clamp((this.y - RING.top) / (RING.bottom - RING.top), 0, 1)
    this.dispH = Phaser.Math.Linear(204, 420, t)
    const scaleY = this.dispH / this.frameH
    this.setScale(scaleY * stats.scale, scaleY)
  }

  takeDamage(amount: number): void {
    if (this.isDead || this.aiState === 'knockdown') return
    this.hp = Math.max(0, this.hp - amount)
    this.target = this.playerRef
    this.noHitTimer = 0

    // Fase 2 do boss_popo: HP < 100 → velocidade +40%
    if (this.enemyType === 'boss_popo' && !this.inPhase2 && this.hp < 100) {
      this.inPhase2 = true
      this.currentSpeed = this.baseSpeed * 1.4
      this.setTint(0xff6600)
      this.scene.cameras.main.shake(200, 0.008)
    }

    if (this.hp <= 0) { this.die(); return }

    const kdThreshold = this.enemyType === 'fat' ? 9999
      : this.enemyType === 'strong' || this.isBoss ? 30 : 18
    if (amount >= kdThreshold) {
      this.enterKnockdown()
    } else {
      this.playHitAnim()
    }
  }

  /** Chamado pelo GameScene para separar inimigos sobrepostos */
  applySeparationForce(others: Enemy[]) {
    for (const other of others) {
      if (other === this || other.isDead) continue
      const dx = this.x - other.x
      const dy = this.y - other.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const minDist = 48
      if (dist < minDist && dist > 0) {
        const force = (minDist - dist) / minDist * 1.5
        this.x = Phaser.Math.Clamp(this.x + (dx / dist) * force, RING.left, RING.right)
        this.y = Phaser.Math.Clamp(this.y + (dy / dist) * force * 0.6, RING.top, RING.bottom)
      }
    }
  }

  private playHitAnim() {
    if (!this.hasAnims || this.animLocked) return
    if (this.scene.anims.exists(`${this.charKey}-hit`)) {
      this.animLocked = true
      this.play(`${this.charKey}-hit`)
    }
  }

  private enterKnockdown() {
    this.aiState = 'knockdown'
    this.knockdownTimer = this.isBoss ? 800 : 1500
    this.animLocked = true
    this.setAlpha(0.6)
    if (this.hasAnims && this.scene.anims.exists(`${this.charKey}-knockdown`)) {
      this.play(`${this.charKey}-knockdown`)
    } else if (this.hasAnims && this.scene.anims.exists(`${this.charKey}-hit`)) {
      this.play(`${this.charKey}-hit`)
    }
  }

  private die() {
    this.isDead = true
    this.aiState = 'dead'
    this.hpBarBg.destroy()
    this.hpBar.destroy()
    this.aggroIcon.destroy()
    sound.enemyDeath()
    this.scene.tweens.add({
      targets: this,
      alpha: 0, y: this.y + 20,
      duration: 400,
      onComplete: () => this.destroy(),
    })
  }

  private playAttackAnim() {
    if (!this.hasAnims || this.animLocked) return
    this.attackCount++
    const useKick = (this.attackCount % 3 === 0) && this.scene.textures.exists(`${this.charKey}-kick-sheet`)
    const animKey = useKick ? `${this.charKey}-kick` : `${this.charKey}-punch`
    if (this.scene.anims.exists(animKey)) {
      this.animLocked = true
      this.play(animKey)
    }
  }

  update(delta: number) {
    if (this.isDead) return

    this.attackCooldown = Math.max(0, this.attackCooldown - delta)
    this.noHitTimer += delta

    if (this.noHitTimer > 3000 && this.target !== 'wand') {
      this.target = 'wand'
    }

    // Ícone de aggro
    this.aggroIcon.setText(this.target !== 'wand' ? '!' : '')

    const prevX = this.x
    const prevY = this.y

    switch (this.aiState) {
      case 'approach':    this.updateApproach(delta); break
      case 'waitBeforeAttack': this.updateWait(delta); break
      case 'chasePlayer': this.updateChasePlayer(delta); break
      case 'knockdown':   this.updateKnockdown(delta); break
      case 'recover':
        this.setAlpha(1)
        this.animLocked = false
        this.aiState = 'approach'
        break
    }

    // Controle de animação (idle / walk)
    if (this.hasAnims && !this.animLocked) {
      const moving = (this.x !== prevX || this.y !== prevY)
      const isWaiting = (this.aiState === 'waitBeforeAttack')
      const target = (!moving || isWaiting) ? `${this.charKey}-idle` : `${this.charKey}-walk`
      if (this.anims.currentAnim?.key !== target) {
        this.play(target)
      }
    }

    // Perspectiva e UI
    this.applyPerspectiveScale()
    this.setDepth(this.y)
    const barY = this.y - this.dispH - 8
    this.hpBarBg.setPosition(this.x, barY).setDepth(this.y + 1)
    this.hpBar.setPosition(this.x - this.BAR_W / 2, barY).setDepth(this.y + 1)
    this.hpBar.setDisplaySize(this.BAR_W * (this.hp / this.maxHp), this.BAR_H)
    this.aggroIcon.setPosition(this.x, barY - 14).setDepth(this.y + 2)
  }

  private updateApproach(delta: number) {
    const tgt = this.target === 'wand' ? this.wandRef : this.playerRef
    if (!tgt) return

    const dx = tgt.x - this.x
    const dy = tgt.y - this.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const arrivalDist = this.target === 'wand' ? 60 : 120

    if (dist < arrivalDist) {
      if (this.target === 'wand') {
        this.aiState = 'waitBeforeAttack'
        this.waitTimer = 1000
      } else {
        this.aiState = 'chasePlayer'
      }
      return
    }

    const dt = delta / 1000
    const nx = dx / dist; const ny = dy / dist
    this.x = Phaser.Math.Clamp(this.x + nx * this.currentSpeed * dt,       RING.left, RING.right)
    this.y = Phaser.Math.Clamp(this.y + ny * this.currentSpeed * 0.7 * dt, RING.top,  RING.bottom)
    this.setFlipX(dx < 0)
  }

  private updateChasePlayer(delta: number) {
    if (this.target === 'wand') { this.aiState = 'approach'; return }

    const dx = this.playerRef.x - this.x
    const dy = this.playerRef.y - this.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < 120 && this.attackCooldown <= 0) { this.attackPlayer(); return }
    if (dist >= 120) { this.aiState = 'approach'; return }

    const dt = delta / 1000
    this.x = Phaser.Math.Clamp(this.x + (dx / dist) * this.currentSpeed * dt,       RING.left, RING.right)
    this.y = Phaser.Math.Clamp(this.y + (dy / dist) * this.currentSpeed * 0.7 * dt, RING.top,  RING.bottom)
    this.setFlipX(dx < 0)
  }

  private updateWait(delta: number) {
    this.waitTimer -= delta
    if (this.waitTimer <= 0) {
      this.playAttackAnim()
      this.scene.events.emit('enemyAttackWand', this)
      this.attackCooldown = this.isBoss ? 1000 : 1500
      this.aiState = 'approach'
    }
  }

  private updateKnockdown(delta: number) {
    this.knockdownTimer -= delta
    if (this.knockdownTimer <= 0) this.aiState = 'recover'
  }

  private attackPlayer() {
    if (this.isDead) return
    this.playAttackAnim()
    this.scene.events.emit('enemyAttackPlayer', this)
    this.attackCooldown = this.isBoss ? 900 : 1200
  }
}
