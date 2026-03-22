import Phaser from 'phaser'
import { sound } from '../systems/SoundManager'

export class YouWinScene extends Phaser.Scene {
  private navigating = false

  constructor() {
    super({ key: 'YouWinScene' })
  }

  create() {
    this.navigating = false
    const { width, height } = this.scale

    this.cameras.main.fadeIn(600, 0, 0, 0)

    // Fundo
    this.add.image(width / 2, height / 2, 'arena').setDisplaySize(width, height).setTint(0x112244).setDepth(0)
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.4).setDepth(1)

    // Título
    this.add.text(width / 2, height * 0.12, 'CONGRATULATIONS\nYOU WIN!', {
      fontSize: '60px', color: '#ffcc00', fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 8, align: 'center', lineSpacing: 16,
    }).setOrigin(0.5).setDepth(2)

    // Arte da celebração (direita)
    this.add.image(width * 0.65, height * 0.60, 'good-guys-win')
      .setOrigin(0.5).setDepth(2)

    // PLAY AGAIN? (esquerda)
    const menuX = width * 0.26
    const menuY = height * 0.65

    this.add.text(menuX, menuY, 'PLAY AGAIN?', {
      fontSize: '40px', color: '#ffffff', fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(2)

    // Cursor ">"
    this.add.text(menuX - 130, menuY + 80, '>', {
      fontSize: '32px', color: '#ffcc00', fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(2)

    // PRESS START (pisca)
    const startText = this.add.text(menuX, menuY + 80, 'PRESS START', {
      fontSize: '32px', color: '#ffcc00', fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(2).setInteractive({ useHandCursor: true })

    this.tweens.add({
      targets: startText,
      alpha: 0.2,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    startText.on('pointerdown', () => this.goToSelect())

    // Inputs (delay pra evitar skip acidental)
    this.time.delayedCall(1000, () => {
      this.input.keyboard!.on('keydown-SPACE', () => this.goToSelect())
      this.input.keyboard!.on('keydown-ENTER', () => this.goToSelect())
    })
  }

  private goToSelect() {
    if (this.navigating) return
    this.navigating = true
    sound.select()
    this.registry.remove('youWinScore')
    this.registry.remove('continueFromWave')
    this.registry.remove('gameOverWave')
    this.registry.remove('gameOverScore')
    this.cameras.main.fadeOut(400, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('TitleScene'))
  }
}
