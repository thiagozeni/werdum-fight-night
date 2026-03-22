import Phaser from 'phaser'

const D = 100
const PLAYER_BAR_X = 250
const PLAYER_BAR_Y = 100
const PLAYER_BAR_MAX_W = 551
const PLAYER_BAR_H = 61

const WAND_BAR_X = 1119
const WAND_BAR_Y = 100
const WAND_BAR_MAX_W = 551
const WAND_BAR_H = 61
// Âncora da barra do wand na direita
const WAND_BAR_ANCHOR_X = 1670 // WAND_BAR_X + WAND_BAR_MAX_W

export class HUD {
  private scene: Phaser.Scene

  // Player
  private playerPortraitBg!: Phaser.GameObjects.Rectangle
  playerPortraitSprite!: Phaser.GameObjects.Sprite
  private playerNameText!: Phaser.GameObjects.Text
  private playerBarBg!: Phaser.GameObjects.Rectangle
  private playerBar!: Phaser.GameObjects.Rectangle
  private playerHPPct!: Phaser.GameObjects.Text

  // Wand
  private wandPortraitBg!: Phaser.GameObjects.Rectangle
  wandPortraitImg!: Phaser.GameObjects.Image
  private wandBarBg!: Phaser.GameObjects.Rectangle
  private wandBar!: Phaser.GameObjects.Rectangle
  private wandHPPct!: Phaser.GameObjects.Text
  private wandKO = false

  // Centro
  private waveText!: Phaser.GameObjects.Text
  private timerText!: Phaser.GameObjects.Text
  private scoreText!: Phaser.GameObjects.Text
  private enemyCountText!: Phaser.GameObjects.Text

  // Extras
  private comboText!: Phaser.GameObjects.Text
  private damageFlash!: Phaser.GameObjects.Rectangle

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.build()
  }

  private build() {
    const { width, height } = this.scene.scale

    // ── Overlay escuro no topo ────────────────────────────────────────────
    this.scene.add.rectangle(960, 0, 1920, 200, 0x000000)
      .setAlpha(0.55)
      .setDepth(D - 1)
      .setOrigin(0.5, 0)
      .setScrollFactor(0)

    // ════════════════════════════════════════════════════════════════════
    // LADO ESQUERDO — Player
    // ════════════════════════════════════════════════════════════════════

    // Portrait background
    this.playerPortraitBg = this.scene.add.rectangle(43, 42, 185, 185, 0x1e276e)
      .setOrigin(0, 0)
      .setDepth(D + 1)
      .setScrollFactor(0)
    this.playerPortraitBg.setStrokeStyle(12, 0xf3c204)

    // Portrait sprite mascarado
    const playerMaskShape = this.scene.make.graphics()
    playerMaskShape.fillStyle(0xffffff)
    playerMaskShape.fillRect(43, 42, 185, 185)
    const playerMask = playerMaskShape.createGeometryMask()

    this.playerPortraitSprite = this.scene.add.sprite(135, 134, 'werdum-sv')
      .setDisplaySize(185, 185)
      .setOrigin(0.5, 0.5)
      .setDepth(D + 1)
      .setScrollFactor(0)
      .setMask(playerMask)

    // Nome do player
    this.playerNameText = this.scene.add.text(250, 47, 'WERDUM', {
      fontSize: '54px',
      color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0, 0).setDepth(D + 2).setScrollFactor(0)

    // HP bar bg
    this.playerBarBg = this.scene.add.rectangle(PLAYER_BAR_X, PLAYER_BAR_Y, PLAYER_BAR_MAX_W, PLAYER_BAR_H, 0xd5d5d5)
      .setOrigin(0, 0)
      .setDepth(D + 1)
      .setScrollFactor(0)
    this.playerBarBg.setStrokeStyle(5, 0x848484)

    // HP bar fill
    this.playerBar = this.scene.add.rectangle(PLAYER_BAR_X, PLAYER_BAR_Y, PLAYER_BAR_MAX_W, PLAYER_BAR_H, 0x22cc44)
      .setOrigin(0, 0)
      .setDepth(D + 2)
      .setScrollFactor(0)

    // "HP" label
    this.scene.add.text(262, 102, 'HP', {
      fontSize: '45px',
      color: '#d1d1d1',
      fontFamily: 'monospace',
    }).setOrigin(0, 0).setDepth(D + 3).setScrollFactor(0)

    // HP% texto right-aligned
    this.playerHPPct = this.scene.add.text(797, 130, '100%', {
      fontSize: '40px',
      color: '#333333',
      fontFamily: '"Pixelify Sans", monospace',
    }).setOrigin(1, 0.5).setDepth(D + 3).setScrollFactor(0)

    // ════════════════════════════════════════════════════════════════════
    // CENTRO — Wave + Timer
    // ════════════════════════════════════════════════════════════════════

    // Wave text
    this.waveText = this.scene.add.text(960, 51, 'WAVE 1 / 1', {
      fontSize: '46px',
      color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(D).setScrollFactor(0)

    // Timer box bg
    this.scene.add.rectangle(842, 88, 236, 86, 0xdfdfdf)
      .setOrigin(0, 0)
      .setDepth(D)
      .setScrollFactor(0)
      .setStrokeStyle(8, 0x848484)

    // Timer text
    this.timerText = this.scene.add.text(960, 131, '00:00', {
      fontSize: '80px',
      color: '#f3c204',
      fontFamily: '"Pixelify Sans", monospace',
    }).setOrigin(0.5).setDepth(D + 1).setScrollFactor(0)

    // Score (abaixo do wave)
    this.scoreText = this.scene.add.text(960, 180, 'SCORE: 0', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(D).setScrollFactor(0)

    // Enemy count
    this.enemyCountText = this.scene.add.text(960, 163, '', {
      fontSize: '22px',
      color: '#ff9999',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(D).setScrollFactor(0)

    // ════════════════════════════════════════════════════════════════════
    // LADO DIREITO — Wand
    // ════════════════════════════════════════════════════════════════════

    // Portrait background
    this.wandPortraitBg = this.scene.add.rectangle(1692, 42, 185, 185, 0x722a2a)
      .setOrigin(0, 0)
      .setDepth(D + 1)
      .setScrollFactor(0)
    this.wandPortraitBg.setStrokeStyle(12, 0xf3c204)

    // Wand image mascarada
    const wandMaskShape = this.scene.make.graphics()
    wandMaskShape.fillStyle(0xffffff)
    wandMaskShape.fillRect(1692, 42, 185, 185)
    const wandMask = wandMaskShape.createGeometryMask()

    this.wandPortraitImg = this.scene.add.image(1784, 134, 'wand')
      .setDisplaySize(185, 185)
      .setOrigin(0.5, 0.5)
      .setDepth(D + 1)
      .setScrollFactor(0)
      .setMask(wandMask)

    // Wand nome (right-aligned)
    this.scene.add.text(1670, 47, 'WANDERLEI', {
      fontSize: '54px',
      color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(1, 0).setDepth(D + 2).setScrollFactor(0)

    // Wand HP bar bg
    this.wandBarBg = this.scene.add.rectangle(WAND_BAR_X, WAND_BAR_Y, WAND_BAR_MAX_W, WAND_BAR_H, 0xd5d5d5)
      .setOrigin(0, 0)
      .setDepth(D + 1)
      .setScrollFactor(0)
    this.wandBarBg.setStrokeStyle(5, 0x848484)

    // Wand HP bar fill — âncora na direita
    this.wandBar = this.scene.add.rectangle(WAND_BAR_ANCHOR_X, WAND_BAR_Y, WAND_BAR_MAX_W, WAND_BAR_H, 0xdd3311)
      .setOrigin(1, 0)
      .setDepth(D + 2)
      .setScrollFactor(0)

    // "HP" label right-aligned
    this.scene.add.text(1658, 102, 'HP', {
      fontSize: '45px',
      color: '#d1d1d1',
      fontFamily: 'monospace',
    }).setOrigin(1, 0).setDepth(D + 3).setScrollFactor(0)

    // Wand HP% texto
    this.wandHPPct = this.scene.add.text(1123, 130, '100%', {
      fontSize: '40px',
      color: '#333333',
      fontFamily: '"Pixelify Sans", monospace',
    }).setOrigin(0, 0.5).setDepth(D + 3).setScrollFactor(0)

    // ════════════════════════════════════════════════════════════════════
    // EXTRAS
    // ════════════════════════════════════════════════════════════════════

    // Combo (centro da tela)
    this.comboText = this.scene.add.text(width / 2, 200, '', {
      fontSize: '52px',
      color: '#ff8800',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 6,
    }).setDepth(D).setOrigin(0.5, 0.5).setScrollFactor(0).setAlpha(0)

    // Flash de dano (tela inteira)
    this.damageFlash = this.scene.add.rectangle(width / 2, height / 2, width, height, 0xff0000, 0)
      .setDepth(D - 1)
      .setScrollFactor(0)
  }

  // ── API pública ──────────────────────────────────────────────────────

  updatePlayerHP(current: number, max: number) {
    const r = Math.max(0, current / max)
    const w = Math.round(PLAYER_BAR_MAX_W * r)
    this.playerBar.setSize(w, PLAYER_BAR_H)
    const color = r > 0.5 ? 0x22cc44 : r > 0.25 ? 0xddaa00 : 0xdd2222
    this.playerBar.setFillStyle(color)
    this.playerHPPct.setText(`${Math.ceil(r * 100)}%`)
  }

  updateWandHP(current: number, max: number) {
    const r = Math.max(0, current / max)
    const w = Math.round(WAND_BAR_MAX_W * r)
    this.wandBar.setSize(w, WAND_BAR_H)
    this.wandHPPct.setText(`${Math.ceil(r * 100)}%`)
    this.damageFlash.setAlpha(0.3)
    this.scene.tweens.add({ targets: this.damageFlash, alpha: 0, duration: 350 })
    if (current <= 0) this.setWandKO()
  }

  setWandKO() {
    if (this.wandKO) return
    this.wandKO = true
    this.scene.tweens.add({
      targets: this.wandPortraitImg,
      alpha: 0.4,
      duration: 300,
      yoyo: true,
      repeat: 2,
    })
  }

  updateWave(wave: number, total: number) {
    this.waveText.setText(`WAVE ${wave} / ${total}`)
  }

  updateScore(score: number) {
    this.scoreText.setText(`SCORE: ${score.toLocaleString()}`)
  }

  updateEnemyCount(count: number) {
    this.enemyCountText.setText(count > 0 ? `▼ ${count} inimigos` : '')
  }

  updateTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    const mm = String(m).padStart(2, '0')
    const ss = String(s).padStart(2, '0')
    this.timerText.setText(`${mm}:${ss}`)
  }

  setPlayerName(name: string) {
    this.playerNameText.setText(name.toUpperCase())
    const textureKey = `${name}-sv`
    if (this.scene.textures.exists(textureKey)) {
      this.playerPortraitSprite.setTexture(textureKey)
    } else {
      this.playerPortraitSprite.setTexture('wand')
    }
  }

  showCombo(count: number) {
    if (count < 2) {
      this.comboText.setAlpha(0)
      return
    }
    const colors = ['#ff8800', '#ff5500', '#ff2200', '#ff0000', '#ff00ff']
    const color = colors[Math.min(count - 2, colors.length - 1)]
    const scale = 1 + Math.min(count * 0.06, 0.5)
    this.comboText.setText(`x${count} COMBO!`).setColor(color)
    this.scene.tweens.killTweensOf(this.comboText)
    this.comboText.setAlpha(1).setScale(scale * 1.3)
    this.scene.tweens.add({ targets: this.comboText, scale, duration: 100 })
    this.scene.tweens.add({ targets: this.comboText, alpha: 0, duration: 400, delay: 1400 })
  }

  showWaveAnnouncement(wave: number, isBoss = false) {
    const { width, height } = this.scene.scale
    const label = isBoss ? '⚠  BOSS WAVE!' : `— WAVE ${wave} —`
    const color = isBoss ? '#ff3300' : '#ffdd00'
    const size = isBoss ? '80px' : '72px'

    const txt = this.scene.add.text(width / 2, height / 2 - 40, label, {
      fontSize: size,
      color,
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 10,
    }).setDepth(150).setOrigin(0.5).setScrollFactor(0).setAlpha(0).setScale(0.6)

    this.scene.tweens.add({ targets: txt, alpha: 1, scale: 1, duration: 220, ease: 'Back.Out' })
    this.scene.tweens.add({
      targets: txt,
      alpha: 0,
      scale: 0.8,
      duration: 280,
      delay: isBoss ? 1100 : 700,
      ease: 'Power2',
      onComplete: () => txt.destroy(),
    })

    if (isBoss) this.scene.cameras.main.shake(300, 0.01)
  }

  showWaveComplete() {
    const { width, height } = this.scene.scale
    const txt = this.scene.add.text(width / 2, height / 2 - 40, '✓ WAVE COMPLETA!', {
      fontSize: '56px',
      color: '#44ff88',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 8,
    }).setDepth(150).setOrigin(0.5).setScrollFactor(0).setAlpha(0).setScale(0.7)

    this.scene.tweens.add({ targets: txt, alpha: 1, scale: 1, duration: 200, ease: 'Back.Out' })
    this.scene.tweens.add({
      targets: txt,
      alpha: 0,
      y: height / 2 - 80,
      duration: 300,
      delay: 900,
      onComplete: () => txt.destroy(),
    })
  }

  showMuteStatus(muted: boolean) {
    const { width } = this.scene.scale
    const txt = this.scene.add.text(width / 2, 200, muted ? '🔇 SOM DESLIGADO' : '🔊 SOM LIGADO', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace',
      stroke: '#000',
      strokeThickness: 3,
    }).setDepth(160).setOrigin(0.5).setScrollFactor(0)

    this.scene.tweens.add({
      targets: txt,
      alpha: 0,
      duration: 400,
      delay: 900,
      onComplete: () => txt.destroy(),
    })
  }
}
