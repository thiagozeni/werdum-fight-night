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

    // Fundo sem crowd
    this.add.image(width / 2, height / 2, 'sem-crowd').setDisplaySize(width, height).setDepth(0)
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.45).setDepth(1)

    // Títulos
    this.add.text(960, 157, 'CONGRATULATIONS', {
      fontSize: '90px', color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 10,
    }).setOrigin(0.5).setDepth(2)

    this.add.text(960, 253, 'YOU WIN!', {
      fontSize: '100px', color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 12,
    }).setOrigin(0.5).setDepth(2)

    // Arte celebração
    this.add.image(808, 299, 'good-guys-win').setOrigin(0, 0).setDepth(2)

    // PLAY AGAIN?
    this.add.text(129, 658, 'PLAY AGAIN?', {
      fontSize: '80px', color: '#e4e4e4',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0, 0).setDepth(2)

    // Cursor ">"
    this.add.text(215, 742, '>', {
      fontSize: '44px', color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(2)

    // PRESS START (pisca)
    const startText = this.add.text(502, 742, 'PRESS START', {
      fontSize: '55px', color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(2).setInteractive({ useHandCursor: true })

    this.tweens.add({
      targets: startText, alpha: 0.2, duration: 600,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })

    startText.on('pointerdown', () => this.goToSelect())

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
