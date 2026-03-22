import Phaser from 'phaser'
import { sound } from '../systems/SoundManager'
import { getHighScore } from '../systems/HighScore'

export class GameOverContinueScene extends Phaser.Scene {
  private navigating = false

  constructor() {
    super({ key: 'GameOverContinueScene' })
  }

  create() {
    const { width, height } = this.scale
    const score       = this.registry.get('gameOverScore') as number ?? 0
    const wave        = this.registry.get('gameOverWave')  as number ?? 1
    const totalWaves  = this.registry.get('totalWaves')    as number ?? 12
    const best        = getHighScore(this.registry)

    this.cameras.main.fadeIn(400, 0, 0, 0)

    // Fundo
    this.add.image(width / 2, height / 2, 'arena')
      .setDisplaySize(width, height)
      .setTint(0x110000)
      .setDepth(0)
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.72).setDepth(1)

    const cx = width / 2
    const cy = height / 2

    // Título GAME OVER
    this.add.text(cx, cy - 210, 'GAME OVER', {
      fontSize: '96px',
      color: '#ff2222',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 10,
    }).setOrigin(0.5).setDepth(2)

    // Placar
    this.add.text(cx, cy - 100, `SCORE: ${score.toLocaleString()}`, {
      fontSize: '32px', color: '#ffdd00', fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(2)

    this.add.text(cx, cy - 57, `BEST: ${best.toLocaleString()}`, {
      fontSize: '20px', color: '#aaddff', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(2)

    this.add.text(cx, cy - 18, `WAVE ${wave} / ${totalWaves}`, {
      fontSize: '18px', color: '#888888', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(2)

    // Pergunta
    this.add.text(cx, cy + 40, 'CONTINUE?', {
      fontSize: '42px', color: '#ffffff', fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(2)

    // Separador de botões
    const btnY = cy + 120
    const btnSpacing = 220

    // Botão YES
    const yesBtn = this.add.text(cx - btnSpacing / 2, btnY, '[ YES ]', {
      fontSize: '36px', color: '#00ee44', fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(2)

    // Botão NO
    const noBtn = this.add.text(cx + btnSpacing / 2, btnY, '[ NO ]', {
      fontSize: '36px', color: '#ff3333', fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(2)

    // Efeito piscada no YES
    this.tweens.add({
      targets: yesBtn,
      alpha: 0.4,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // Hover
    yesBtn.on('pointerover', () => { yesBtn.setAlpha(1); yesBtn.setScale(1.1) })
    yesBtn.on('pointerout',  () => { yesBtn.setScale(1.0) })
    noBtn.on('pointerover',  () => noBtn.setScale(1.1))
    noBtn.on('pointerout',   () => noBtn.setScale(1.0))

    yesBtn.on('pointerdown', () => this.onYes())
    noBtn.on('pointerdown',  () => this.onNo())

    // Dica teclado
    this.add.text(cx, height - 32, 'Y = Continuar   N = Sair', {
      fontSize: '14px', color: '#555555', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(2)

    this.input.keyboard!.on('keydown-Y', () => this.onYes())
    this.input.keyboard!.on('keydown-N', () => this.onNo())
  }

  private onYes() {
    if (this.navigating) return
    this.navigating = true
    sound.select()
    // continueFromWave sinaliza ao GameScene para iniciar da wave salva
    this.registry.set('continueFromWave', this.registry.get('gameOverWave'))
    this.cameras.main.fadeOut(300, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameScene'))
  }

  private onNo() {
    if (this.navigating) return
    this.navigating = true
    sound.select()
    // Limpa estado de continuação
    this.registry.remove('continueFromWave')
    this.registry.remove('gameOverWave')
    this.registry.remove('gameOverScore')
    this.cameras.main.fadeOut(300, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('TitleScene'))
  }
}
