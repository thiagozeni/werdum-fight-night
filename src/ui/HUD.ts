import Phaser from 'phaser'

// Escala aplicada às imagens hud-left/hud-right (originais: 230×93 e 212×93)
const SCALE = 1.7

// Posições das barras de HP dentro da imagem hud-left (coords originais)
// Barra vermelha: y=27-41, x=23-224
const HL_BAR_X  = 23
const HL_BAR_Y  = (27 + 41) / 2   // centro vertical = 34
const HL_BAR_W  = 224 - 23         // largura máxima = 201
const HL_BAR_H  = 41 - 27          // altura = 14

// Posições da barra de HP dentro da imagem hud-right (coords originais)
// Barra vermelha: y=27-41, x=0-203
const HR_BAR_Y  = (27 + 41) / 2   // centro vertical = 34
const HR_BAR_W  = 203              // largura máxima (de x=0 até retrato)
const HR_BAR_H  = 41 - 27          // altura = 14

export class HUD {
  private scene: Phaser.Scene

  private playerBar!: Phaser.GameObjects.Rectangle
  private playerHPText!: Phaser.GameObjects.Text
  private playerLabel!: Phaser.GameObjects.Text

  private wandBar!: Phaser.GameObjects.Rectangle
  private wandPortrait!: Phaser.GameObjects.Image
  private wandKO = false

  private waveText!: Phaser.GameObjects.Text
  private enemyCountText!: Phaser.GameObjects.Text
  private scoreText!: Phaser.GameObjects.Text
  private comboText!: Phaser.GameObjects.Text
  private damageFlash!: Phaser.GameObjects.Rectangle

  private readonly D = 100

  // Largura máxima das barras em pixels de tela
  private readonly playerBarMaxW: number
  private readonly wandBarMaxW: number

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.playerBarMaxW = Math.round(HL_BAR_W * SCALE)
    this.wandBarMaxW   = Math.round(HR_BAR_W * SCALE)
    this.build()
  }

  private build() {
    const { width, height } = this.scene.scale

    const hlW = Math.round(230 * SCALE)  // ~391
    const hlH = Math.round(93  * SCALE)  // ~158
    const hrW = Math.round(212 * SCALE)  // ~360
    // const hrH = Math.round(93  * SCALE)  // ~158

    // ── Faixa escura no topo ───────────────────────────────
    this.scene.add.rectangle(width / 2, hlH / 2, width, hlH, 0x000000, 0.55)
      .setDepth(this.D - 1).setScrollFactor(0)

    // ── Painel esquerdo (jogador) ──────────────────────────
    this.scene.add.image(0, 0, 'hud-left')
      .setOrigin(0, 0)
      .setDisplaySize(hlW, hlH)
      .setDepth(this.D)
      .setScrollFactor(0)

    // Máscara sobre texto "100%" estático (x≈180-224, y≈15-26 em orig)
    this.scene.add.rectangle(
      Math.round(178 * SCALE), Math.round(15 * SCALE),
      Math.round(48 * SCALE), Math.round(13 * SCALE),
      0x000000, 0.85,
    ).setOrigin(0, 0).setDepth(this.D + 2).setScrollFactor(0)

    // Máscara sobre texto "95%" do segundo bar estático esq. (x≈185-224, y≈52-66 em orig)
    this.scene.add.rectangle(
      Math.round(183 * SCALE), Math.round(52 * SCALE),
      Math.round(42 * SCALE), Math.round(16 * SCALE),
      0x000000, 0.85,
    ).setOrigin(0, 0).setDepth(this.D + 2).setScrollFactor(0)

    // Máscara sobre texto "RYU" da imagem (x≈5-38, y≈80-92 em orig)
    this.scene.add.rectangle(
      Math.round(5 * SCALE), Math.round(80 * SCALE),
      Math.round(36 * SCALE), Math.round(14 * SCALE),
      0x000000, 0.85,
    ).setOrigin(0, 0).setDepth(this.D + 2).setScrollFactor(0)

    // Barra de HP do player (cresce da esquerda para a direita)
    const pBarX = Math.round(HL_BAR_X * SCALE)
    const pBarY = Math.round(HL_BAR_Y * SCALE)
    const pBarH = Math.round(HL_BAR_H * SCALE)

    this.playerBar = this.scene.add.rectangle(pBarX, pBarY, this.playerBarMaxW, pBarH, 0x22cc44)
      .setOrigin(0, 0.5)
      .setDepth(this.D + 1)
      .setScrollFactor(0)

    // Nome do personagem — posicionado sobre o texto "RYU" da imagem (~x=5, y=82 em coords orig)
    // Cobre o texto original com o nome real do personagem
    const nameY = Math.round(84 * SCALE)
    this.playerLabel = this.scene.add.text(Math.round(5 * SCALE), nameY, 'WERDUM', {
      fontSize: `${Math.round(10 * SCALE)}px`, color: '#ffdd44',
      fontFamily: 'monospace', stroke: '#000000', strokeThickness: 4,
    }).setDepth(this.D + 3).setScrollFactor(0)

    // HP numérico — dentro da barra, alinhado à direita
    this.playerHPText = this.scene.add.text(pBarX + this.playerBarMaxW - 4, pBarY, '', {
      fontSize: `${Math.round(9 * SCALE)}px`, color: '#ffffff',
      fontFamily: 'monospace', stroke: '#000', strokeThickness: 3,
    }).setOrigin(1, 0.5).setDepth(this.D + 3).setScrollFactor(0)

    // ── Painel direito (Wanderlei) ─────────────────────────
    const hrLeft = width - hrW

    this.scene.add.image(width, 0, 'hud-right')
      .setOrigin(1, 0)
      .setDisplaySize(hrW, hlH)
      .setDepth(this.D)
      .setScrollFactor(0)

    // Máscara sobre texto "100%" estático direito (x≈0-50, y≈15-26 em orig)
    this.scene.add.rectangle(
      hrLeft, Math.round(15 * SCALE),
      Math.round(52 * SCALE), Math.round(13 * SCALE),
      0x000000, 0.85,
    ).setOrigin(0, 0).setDepth(this.D + 2).setScrollFactor(0)

    // Máscara sobre texto "KEN" da imagem (x≈163-208, y≈80-92 em orig, a partir da borda esq. da imagem)
    this.scene.add.rectangle(
      hrLeft + Math.round(162 * SCALE), Math.round(80 * SCALE),
      Math.round(48 * SCALE), Math.round(14 * SCALE),
      0x000000, 0.85,
    ).setOrigin(0, 0).setDepth(this.D + 2).setScrollFactor(0)

    // Máscara sobre texto "90%" do segundo bar estático (x≈15-60, y≈52-66 em orig)
    this.scene.add.rectangle(
      hrLeft + Math.round(14 * SCALE), Math.round(52 * SCALE),
      Math.round(50 * SCALE), Math.round(16 * SCALE),
      0x000000, 0.85,
    ).setOrigin(0, 0).setDepth(this.D + 2).setScrollFactor(0)

    // Barra de HP do Wand (âncora na DIREITA, cresce para a esquerda)
    // No hud-right a barra vai de x=0 até x=203 (retrato está à direita)
    // Na tela: borda esquerda da imagem = width - hrW; barra até x=203*SCALE daquela borda
    const wBarAnchorX = width - hrW + Math.round(HR_BAR_W * SCALE)
    const wBarY       = Math.round(HR_BAR_Y * SCALE)
    const wBarH       = Math.round(HR_BAR_H * SCALE)

    this.wandBar = this.scene.add.rectangle(wBarAnchorX, wBarY, this.wandBarMaxW, wBarH, 0xdd3311)
      .setOrigin(1, 0.5)
      .setDepth(this.D + 1)
      .setScrollFactor(0)

    // Retrato do Wanderlei no espaço do retrato (à direita do painel)
    const portraitCX = width - Math.round(24 * SCALE)  // centro do retrato
    const portraitCY = Math.round(46 * SCALE)
    const portraitW  = Math.round(44 * SCALE)
    const portraitH  = Math.round(56 * SCALE)
    this.wandPortrait = this.scene.add.image(portraitCX, portraitCY, 'wand')
      .setDisplaySize(portraitW, portraitH)
      .setOrigin(0.5, 0.5)
      .setDepth(this.D + 2)
      .setScrollFactor(0)

    // ── Texto "WANDERLEI" — cobre o texto "KEN" da imagem (~x=163, y=82 em coords orig)
    // Na tela: borda esquerda da imagem = width - hrW
    const wNameX = width - hrW + Math.round(162 * SCALE)
    this.scene.add.text(wNameX, Math.round(84 * SCALE), 'WANDERLEI', {
      fontSize: `${Math.round(10 * SCALE)}px`, color: '#ffdd44',
      fontFamily: 'monospace', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(1, 0).setDepth(this.D + 3).setScrollFactor(0)

    // ── Wave + inimigos (centro topo) ──────────────────────
    const centerY1 = Math.round(hlH * 0.22)
    const centerY2 = Math.round(hlH * 0.52)
    const centerY3 = Math.round(hlH * 0.74)

    this.waveText = this.scene.add.text(width / 2, centerY1, 'WAVE 1', {
      fontSize: '20px', color: '#ffdd00', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 4,
    }).setDepth(this.D).setOrigin(0.5, 0.5).setScrollFactor(0)

    this.enemyCountText = this.scene.add.text(width / 2, centerY2, '', {
      fontSize: '13px', color: '#ff9999', fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 2,
    }).setDepth(this.D).setOrigin(0.5, 0.5).setScrollFactor(0)

    this.scoreText = this.scene.add.text(width / 2, centerY3, 'SCORE: 0', {
      fontSize: '14px', color: '#ffffff', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 3,
    }).setDepth(this.D).setOrigin(0.5, 0.5).setScrollFactor(0)

    // ── Combo (centro da tela) ──────────────────────────────
    this.comboText = this.scene.add.text(width / 2, 200, '', {
      fontSize: '52px', color: '#ff8800', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 6,
    }).setDepth(this.D).setOrigin(0.5, 0.5).setScrollFactor(0).setAlpha(0)

    // ── Flash de dano ──────────────────────────────────────
    this.damageFlash = this.scene.add.rectangle(width / 2, height / 2,
      width, height, 0xff0000, 0)
      .setDepth(this.D - 1).setScrollFactor(0)
  }

  // ── Atualizações ──────────────────────────────────────────

  updatePlayerHP(current: number, max: number) {
    const r = Math.max(0, current / max)
    this.playerBar.setDisplaySize(this.playerBarMaxW * r, this.playerBar.height)
    this.playerBar.setFillStyle(r > 0.5 ? 0x22cc44 : r > 0.25 ? 0xddaa00 : 0xdd2222)
    this.playerHPText.setText(`${Math.ceil(current)}`)
  }

  updateWandHP(current: number, max: number) {
    const r = Math.max(0, current / max)
    this.wandBar.setDisplaySize(this.wandBarMaxW * r, this.wandBar.height)
    this.damageFlash.setAlpha(0.3)
    this.scene.tweens.add({ targets: this.damageFlash, alpha: 0, duration: 350 })
    if (current <= 0) this.setWandKO()
  }

  setWandKO() {
    if (this.wandKO) return
    this.wandKO = true
    this.wandPortrait.setTexture('wand-ko')
    this.scene.tweens.add({ targets: this.wandPortrait, alpha: 0.4, duration: 300, yoyo: true, repeat: 2 })
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

  setPlayerName(name: string) {
    this.playerLabel.setText(name.toUpperCase())
  }

  showCombo(count: number) {
    if (count < 2) { this.comboText.setAlpha(0); return }
    const colors = ['#ff8800', '#ff5500', '#ff2200', '#ff0000', '#ff00ff']
    const color  = colors[Math.min(count - 2, colors.length - 1)]
    const scale  = 1 + Math.min(count * 0.06, 0.5)
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
    const size  = isBoss ? '80px' : '72px'

    const txt = this.scene.add.text(width / 2, height / 2 - 40, label, {
      fontSize: size, color, fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 10,
    }).setDepth(150).setOrigin(0.5).setScrollFactor(0).setAlpha(0).setScale(0.6)

    this.scene.tweens.add({ targets: txt, alpha: 1, scale: 1, duration: 220, ease: 'Back.Out' })
    this.scene.tweens.add({
      targets: txt, alpha: 0, scale: 0.8,
      duration: 280, delay: isBoss ? 1100 : 700,
      ease: 'Power2',
      onComplete: () => txt.destroy(),
    })

    if (isBoss) this.scene.cameras.main.shake(300, 0.01)
  }

  showWaveComplete() {
    const { width, height } = this.scene.scale
    const txt = this.scene.add.text(width / 2, height / 2 - 40, '✓ WAVE COMPLETA!', {
      fontSize: '56px', color: '#44ff88', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 8,
    }).setDepth(150).setOrigin(0.5).setScrollFactor(0).setAlpha(0).setScale(0.7)

    this.scene.tweens.add({ targets: txt, alpha: 1, scale: 1, duration: 200, ease: 'Back.Out' })
    this.scene.tweens.add({
      targets: txt, alpha: 0, y: height / 2 - 80,
      duration: 300, delay: 900,
      onComplete: () => txt.destroy(),
    })
  }

  showMuteStatus(muted: boolean) {
    const { width } = this.scene.scale
    const txt = this.scene.add.text(width / 2, 200, muted ? '🔇 SOM DESLIGADO' : '🔊 SOM LIGADO', {
      fontSize: '20px', color: '#ffffff', fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 3,
    }).setDepth(160).setOrigin(0.5).setScrollFactor(0)

    this.scene.tweens.add({
      targets: txt, alpha: 0, duration: 400, delay: 900,
      onComplete: () => txt.destroy(),
    })
  }
}
