import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { Ally } from '../entities/Ally'
import { ProtectedChar } from '../entities/ProtectedChar'
import { Enemy, EnemyType, ENEMY_SCORE } from '../entities/Enemy'
import { HUD } from '../ui/HUD'
import { VirtualJoystick } from '../ui/VirtualJoystick'
import { spawnDamageNumber } from '../ui/DamageNumber'
import { sound } from '../systems/SoundManager'
import { saveHighScore } from '../systems/HighScore'

export const RING = { left: 296, right: 1685, top: 535, bottom: 992 }

interface WaveEnemy  { type: EnemyType; count: number }
interface WaveConfig { id: number; enemies: WaveEnemy[]; spawnInterval: number; isBoss?: boolean }

const WAVES: WaveConfig[] = [
  { id: 1,  enemies: [{ type: 'weak',       count: 3 }],                                           spawnInterval: 1800 },
  { id: 2,  enemies: [{ type: 'weak',       count: 5 }],                                           spawnInterval: 1500 },
  { id: 3,  enemies: [{ type: 'weak',       count: 5 }, { type: 'strong', count: 1 }],             spawnInterval: 1400 },
  { id: 4,  enemies: [{ type: 'weak',       count: 6 }, { type: 'fat',    count: 1 }],             spawnInterval: 1200 },
  { id: 5,  enemies: [{ type: 'weak',       count: 4 }, { type: 'chair',  count: 1 }],             spawnInterval: 1200 },
  { id: 6,  enemies: [{ type: 'weak',       count: 6 }, { type: 'strong', count: 2 }],             spawnInterval: 1100 },
  { id: 7,  enemies: [{ type: 'weak',       count: 5 }, { type: 'fat',    count: 1 }, { type: 'strong', count: 1 }], spawnInterval: 1000 },
  { id: 8,  enemies: [{ type: 'weak',       count: 4 }, { type: 'chair',  count: 2 }, { type: 'fat',    count: 1 }], spawnInterval: 900  },
  { id: 9,  enemies: [{ type: 'boss_son',   count: 1 }, { type: 'weak',   count: 3 }],             spawnInterval: 1500, isBoss: true },
  { id: 10, enemies: [{ type: 'weak',       count: 6 }, { type: 'strong', count: 2 }, { type: 'fat', count: 1 }],   spawnInterval: 900  },
  { id: 11, enemies: [{ type: 'boss_coach', count: 1 }, { type: 'weak',   count: 2 }],             spawnInterval: 2000, isBoss: true },
  { id: 12, enemies: [{ type: 'boss_popo',  count: 1 }],                                           spawnInterval: 0,    isBoss: true },
]

const ALL_CHARS = ['werdum', 'dida', 'thor']

export class GameScene extends Phaser.Scene {
  private player!: Player
  private allies: Ally[] = []
  private wand!: ProtectedChar
  private enemies: Enemy[] = []
  private hud!: HUD
  private joystick!: VirtualJoystick

  // Controles teclado
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private keys!: Record<string, Phaser.Input.Keyboard.Key>

  // Estado do player
  private playerHP = 150
  private playerMaxHP = 150
  private attackCooldown = 0
  private isGameOver = false
  private isPaused = false

  // Combo & score
  private score = 0
  private comboCount = 0
  private comboTimer = 0
  private readonly COMBO_WINDOW = 2500

  // Waves
  private currentWave = 0
  private spawnQueue: EnemyType[] = []
  private spawnTimer = 0
  private spawnInterval = 1500
  private waveActive = false
  private waveEndTimer = 0

  // (bgVideo removido — usando imagem estática como cenário)

  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    this.isGameOver = false
    this.isPaused   = false
    this.enemies    = []
    this.allies     = []
    this.score      = 0
    this.comboCount = 0
    this.comboTimer = 0

    const selectedChar: string = this.registry.get('selectedChar') ?? 'werdum'

    // Fundo estático — cenário do jogo
    this.add.image(960, 540, 'arena').setDisplaySize(1920, 1080).setDepth(0)

    // Wand (fundo direito do ringue)
    this.wand = new ProtectedChar(this, 1150, 710)

    // Player (centro, levemente à frente)
    this.player = new Player(this, 960, 840, selectedChar)
    this.playerMaxHP = this.player.maxHp
    this.playerHP    = this.playerMaxHP

    // Aliados
    const allyChars = ALL_CHARS.filter(c => c !== selectedChar)
    const allyPos = [{ x: 760, y: 800 }, { x: 1160, y: 810 }]
    allyChars.forEach((key, i) => {
      const ally = new Ally(this, allyPos[i].x, allyPos[i].y, key)
      ally.setEnemiesRef(() => this.enemies)
      this.allies.push(ally)
    })

    // HUD
    this.hud = new HUD(this)
    this.hud.setPlayerName(selectedChar)
    this.hud.updatePlayerHP(this.playerHP, this.playerMaxHP)
    this.hud.updateWandHP(this.wand.hp, this.wand.maxHp)
    this.hud.updateScore(0)
    this.hud.updateEnemyCount(0)

    // Virtual joystick (mobile)
    this.joystick = new VirtualJoystick(this)

    // Controles teclado
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.keys = {
      W:   this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A:   this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S:   this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D:   this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      J:   this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      K:   this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.K),
      SPC: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      L:   this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.L),
      ESC: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
      M:   this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.M),
    }

    // Eventos
    this.events.on('enemyAttackWand',   this.onEnemyAttackWand,   this)
    this.events.on('enemyAttackPlayer', this.onEnemyAttackPlayer, this)

    this.input.keyboard!.on('keydown-ESC', () => this.togglePause())
    this.input.keyboard!.on('keydown-M',   () => {
      const muted = sound.toggleMute()
      this.hud.showMuteStatus(muted)
    })

    // Suporte a "continue" — retoma da wave em que o jogador perdeu
    const continueWave = this.registry.get('continueFromWave') as number | undefined
    if (continueWave && continueWave > 1) {
      this.currentWave = continueWave - 1
      this.registry.remove('continueFromWave')
    }

    this.cameras.main.fadeIn(500, 0, 0, 0)
    this.time.delayedCall(1200, () => this.startNextWave())
  }

  update(_time: number, delta: number) {
    if (this.isGameOver || this.isPaused) return

    const joy = this.joystick.getState()

    // Input combinado teclado + joystick
    const moveInput = {
      up:    this.cursors.up.isDown    || this.keys.W.isDown   || joy.dy < -0.3,
      down:  this.cursors.down.isDown  || this.keys.S.isDown   || joy.dy >  0.3,
      left:  this.cursors.left.isDown  || this.keys.A.isDown   || joy.dx < -0.3,
      right: this.cursors.right.isDown || this.keys.D.isDown   || joy.dx >  0.3,
      block: this.keys.L.isDown   || joy.block,
    }

    this.player.move(moveInput, delta)
    this.player.update(delta)

    // Ataques
    this.attackCooldown = Math.max(0, this.attackCooldown - delta)
    if ((this.keys.J.isDown || joy.punch) && this.attackCooldown <= 0 && this.player.canAttack()) {
      this.doAttack('punch')
    }
    if ((this.keys.K.isDown || joy.kick) && this.attackCooldown <= 0 && this.player.canAttack()) {
      this.doAttack('kick')
    }

    // Combo timer
    if (this.comboCount > 0) {
      this.comboTimer -= delta
      if (this.comboTimer <= 0) { this.comboCount = 0; this.hud.showCombo(0) }
    }

    // Inimigos
    if (this.enemies.some(e => e.isDead)) {
      this.enemies = this.enemies.filter(e => !e.isDead)
    }
    for (const e of this.enemies) {
      e.applySeparationForce(this.enemies)
      e.update(delta)
    }
    this.hud.updateEnemyCount(this.enemies.length + this.spawnQueue.length)

    // Aliados
    for (const a of this.allies) a.update(delta)

    // Wand
    this.wand.update(delta)

    // Spawn
    if (this.spawnQueue.length > 0) {
      this.spawnTimer -= delta
      if (this.spawnTimer <= 0) { this.spawnNextEnemy(); this.spawnTimer = this.spawnInterval }
    }

    // Fim de wave
    if (this.waveActive && this.spawnQueue.length === 0 && this.enemies.length === 0) {
      this.waveActive = false
      this.waveEndTimer = 3000
      if (this.currentWave < WAVES.length) {
        sound.waveComplete()
        this.hud.showWaveComplete()
      }
    }
    if (!this.waveActive && this.waveEndTimer > 0) {
      this.waveEndTimer -= delta
      if (this.waveEndTimer <= 0) this.startNextWave()
    }

    // Colisão com o wand — impede personagens de atravessá-lo
    this.enforceWandCollision()

    // Depth sorting pela posição lógica no ringue (não inclui offset do pulo)
    this.player.setDepth(this.player.groundY)
    this.wand.setDepth(this.wand.y)
    for (const a of this.allies) a.setDepth(a.y)
  }

  // ── Combate ─────────────────────────────────────────────

  private doAttack(type: 'punch' | 'kick') {
    const damage = type === 'punch' ? 10 : 16
    const rangeH = type === 'punch' ? 80 : 100
    const rangeY = 40
    this.attackCooldown = type === 'punch' ? 150 : 500

    if (type === 'punch') this.player.playPunchAnim()
    else this.player.playKickAnim()
    type === 'punch' ? sound.punch() : sound.kick()

    const hitOriginX = type === 'punch' ? this.player.punchHitX : this.player.kickHitX
    let hitAny = false
    for (const enemy of this.enemies) {
      if (enemy.isDead) continue
      const dx = Math.abs(enemy.x - hitOriginX)
      const dy = Math.abs(enemy.y - this.player.groundY)
      if (dx < rangeH && dy < rangeY) {
        const airBonus = 1
        const comboMult = this.comboCount >= 5 ? 2 : this.comboCount >= 3 ? 1.5 : 1
        const finalDmg = Math.round(damage * airBonus * comboMult)

        const wasAlive = !enemy.isDead
        enemy.takeDamage(finalDmg)
        sound.hitEnemy()
        const faceY = enemy.y - enemy.displayHeight * 0.8
        spawnDamageNumber(this, enemy.x, faceY, finalDmg)
        this.spawnHitParticles(hitOriginX, faceY)
        this.tweens.add({ targets: enemy, alpha: 0.3, duration: 70, yoyo: true })

        if (wasAlive && enemy.isDead) this.addScore(ENEMY_SCORE[enemy.enemyType])
        hitAny = true
      }
    }

    if (hitAny) {
      this.comboCount++
      this.comboTimer = this.COMBO_WINDOW
      this.hud.showCombo(this.comboCount)
      this.cameras.main.shake(80, 0.003)
    }
  }

  private addScore(points: number) {
    const mult = Math.max(1, Math.floor(this.comboCount / 2))
    this.score += points * mult
    this.hud.updateScore(this.score)
  }

  private spawnHitParticles(x: number, y: number) {
    try {
      const emitter = this.add.particles(x, y, 'spark', {
        speed: { min: 60, max: 160 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.8, end: 0 },
        lifespan: 280,
        quantity: 7,
        tint: [0xff8800, 0xffdd00, 0xffffff],
      })
      this.time.delayedCall(300, () => emitter.destroy())
    } catch (_) { /* partículas são opcionais */ }
  }

  private enforceWandCollision() {
    // Dimensões do conteúdo real do wand-ko (928×250 em canvas 1280×768)
    // Centro do conteúdo: x=635, y=391 (offset do centro da imagem: -5, +7)
    const RX = (928 / 2) * this.wand.scaleX
    const RY = (250 / 2) * this.wand.scaleY
    const wx = this.wand.x + (635 - 640) * this.wand.scaleX
    const wy = this.wand.y + (391 - 384) * this.wand.scaleY

    // Retorna posição corrigida se dentro da elipse
    const resolveEllipse = (cx: number, cy: number): { x: number; y: number } | null => {
      const dx = cx - wx
      const dy = cy - wy
      if ((dx / RX) ** 2 + (dy / RY) ** 2 >= 1) return null
      // Ângulo no espaço normalizado → projeta na borda da elipse
      const angle = Math.atan2(dy / RY, dx / RX)
      return {
        x: Phaser.Math.Clamp(wx + RX * Math.cos(angle), RING.left, RING.right),
        y: Phaser.Math.Clamp(wy + RY * Math.sin(angle), RING.top,  RING.bottom),
      }
    }

    // Player
    const pr = resolveEllipse(this.player.x, this.player.groundY)
    if (pr) this.player.nudgeTo(pr.x, pr.y)

    // Enemies
    for (const enemy of this.enemies) {
      if (enemy.isDead) continue
      const er = resolveEllipse(enemy.x, enemy.y)
      if (er) { enemy.x = er.x; enemy.y = er.y }
    }

    // Allies
    for (const ally of this.allies) {
      const ar = resolveEllipse(ally.x, ally.y)
      if (ar) { ally.x = ar.x; ally.y = ar.y }
    }
  }

  private onEnemyAttackWand(enemy: Enemy) {
    const isDead = this.wand.takeDamage(enemy.damageToWand)
    this.hud.updateWandHP(this.wand.hp, this.wand.maxHp)
    if (isDead) this.gameOver()
  }

  private onEnemyAttackPlayer(enemy: Enemy) {
    if (this.player.isKnockedDown) return

    // Bloqueio reduz dano ao mínimo (1 ponto)
    const dmg = this.player.isBlocking
      ? 1
      : enemy.damageToPlayer

    if (this.player.isBlocking) { sound.block() }
    else { sound.playerHit(); this.player.playHitAnim() }

    this.playerHP = Math.max(0, this.playerHP - dmg)
    this.hud.updatePlayerHP(this.playerHP, this.playerMaxHP)

    if (!this.player.isBlocking && (enemy.damageToPlayer >= 25 || this.playerHP <= 0)) {
      this.player.knockdown()
      this.comboCount = 0
      this.hud.showCombo(0)
    }
    if (this.playerHP <= 0) this.gameOver()
  }

  // ── Waves ────────────────────────────────────────────────

  private startNextWave() {
    this.currentWave++
    if (this.currentWave > WAVES.length) { this.showVictory(); return }

    const config = WAVES[this.currentWave - 1]
    this.hud.updateWave(this.currentWave, WAVES.length)
    this.hud.showWaveAnnouncement(this.currentWave, config.isBoss)
    sound.waveStart(config.isBoss)
    this.spawnInterval = config.spawnInterval

    this.spawnQueue = []
    for (const g of config.enemies) {
      for (let i = 0; i < g.count; i++) this.spawnQueue.push(g.type)
    }
    if (!config.isBoss) Phaser.Utils.Array.Shuffle(this.spawnQueue)

    this.spawnTimer  = 800
    this.waveActive  = true

    if (this.currentWave > 1) {
      this.playerHP = Math.min(this.playerMaxHP, this.playerHP + this.playerMaxHP * 0.15)
      this.hud.updatePlayerHP(this.playerHP, this.playerMaxHP)
    }
  }

  private spawnNextEnemy() {
    const type = this.spawnQueue.shift()!
    const side = Phaser.Math.Between(0, 1) === 0
    const x = side ? RING.left + 20 : RING.right - 20
    const y = Phaser.Math.Between(RING.top + 30, RING.bottom - 30)
    const enemy = new Enemy(this, x, y, type)
    enemy.wandRef   = this.wand
    enemy.playerRef = this.player
    this.enemies.push(enemy)
  }

  // ── Pause ────────────────────────────────────────────────

  private pauseOverlay?: Phaser.GameObjects.Container

  private togglePause() {
    this.isPaused = !this.isPaused
    if (this.isPaused) {
      sound.pause()
      // bgVideo removed
      this.pauseOverlay = this.buildPauseMenu()
    } else {
      sound.unpause()
      // bgVideo removed
      this.pauseOverlay?.destroy()
      this.pauseOverlay = undefined
    }
  }

  private buildPauseMenu(): Phaser.GameObjects.Container {
    const { width, height } = this.scale
    const container = this.add.container(0, 0)

    const bg = this.add.rectangle(width / 2, height / 2, 420, 280, 0x000000, 0.85)
      .setStrokeStyle(2, 0x4488ff)
    const title = this.add.text(width / 2, height / 2 - 80, 'PAUSA', {
      fontSize: '42px', color: '#ffffff', fontFamily: 'monospace', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5)

    const makeBtn = (label: string, y: number, cb: () => void) => {
      const txt = this.add.text(width / 2, y, label, {
        fontSize: '22px', color: '#ffdd00', fontFamily: 'monospace', stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      txt.on('pointerdown', cb)
      txt.on('pointerover', () => txt.setColor('#ffffff'))
      txt.on('pointerout',  () => txt.setColor('#ffdd00'))
      return txt
    }

    const resumeBtn = makeBtn('[ CONTINUAR ]', height / 2 - 10, () => this.togglePause())
    const muteBtn   = makeBtn('[ MUTE (M) ]',  height / 2 + 45, () => {
      const m = sound.toggleMute(); this.hud.showMuteStatus(m)
    })
    const quitBtn   = makeBtn('[ SAIR ]',       height / 2 + 95, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('SelectScene'))
    })

    container.add([bg, title, resumeBtn, muteBtn, quitBtn])
    container.setDepth(300)
    return container
  }

  // ── Game Over / Vitória ──────────────────────────────────

  private gameOver() {
    if (this.isGameOver) return
    this.isGameOver = true
    sound.gameOver()
    this.saveHighScore()

    this.registry.set('gameOverScore', this.score)
    this.registry.set('gameOverWave',  this.currentWave)
    this.registry.set('totalWaves',    WAVES.length)

    this.cameras.main.fadeOut(400, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () =>
      this.scene.start('GameOverContinueScene'),
    )
  }

  private showVictory() {
    this.isGameOver = true
    sound.victory()
    this.saveHighScore()

    this.registry.set('youWinScore', this.score)

    this.cameras.main.fadeOut(400, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () =>
      this.scene.start('YouWinScene'),
    )
  }

  // ── High Score (localStorage) ────────────────────────────

  private saveHighScore() {
    saveHighScore(this.score, this.registry)
  }
}
