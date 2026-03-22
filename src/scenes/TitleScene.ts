import Phaser from 'phaser'
import { sound } from '../systems/SoundManager'

export class TitleScene extends Phaser.Scene {
  private navigating = false

  constructor() {
    super({ key: 'TitleScene' })
  }

  create() {
    const { width, height } = this.scale

    // Fundo com multidão
    this.add.image(width / 2, height / 2, 'bg-cachorradas').setDisplaySize(width, height).setDepth(0)

    // Grupos de personagens
    this.add.image(width * 0.25, height * 0.58, 'good-guys').setDepth(1).setOrigin(0.5, 0.5)
    this.add.image(width * 0.78, height * 0.58, 'bad-guys').setDepth(1).setOrigin(0.5, 0.5)

    // Overlay sutil
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.15).setDepth(1)

    // Logo pixel art
    this.add.image(width / 2, height * 0.22, 'logo').setDepth(2).setOrigin(0.5)

    // Subtítulo
    this.add.text(width / 2, height * 0.58, 'AJUDE A SALVAR O WAND!', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 6,
    }).setDepth(3).setOrigin(0.5)

    // Press start (pisca)
    const pressStart = this.add.text(width / 2, height * 0.65, 'PRESS START', {
      fontSize: '38px',
      color: '#ffcc00',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 8,
    }).setDepth(3).setOrigin(0.5)

    this.tweens.add({
      targets: pressStart,
      alpha: 0.1,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // Créditos
    this.add.text(width / 2, height * 0.92, 'CACHORRADAS ESTUDIOS', {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 3,
    }).setDepth(3).setOrigin(0.5)

    // Link anim test
    const animTest = this.add.text(width - 20, height - 20, '[ANIM TEST]', {
      fontSize: '12px', color: '#333355', fontFamily: '"Press Start 2P", monospace',
    }).setDepth(3).setOrigin(1, 1).setInteractive({ useHandCursor: true })
    animTest.on('pointerover', () => animTest.setColor('#6666aa'))
    animTest.on('pointerout',  () => animTest.setColor('#333355'))
    animTest.on('pointerdown', () => {
      if (this.navigating) return
      this.navigating = true
      this.cameras.main.fadeOut(300, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('AnimTestScene'))
    })

    // Inputs
    this.input.keyboard!.on('keydown-SPACE', () => this.goToSelect())
    this.input.keyboard!.on('keydown-ENTER', () => this.goToSelect())
    this.input.on('pointerdown', () => this.goToSelect())
  }

  private goToSelect() {
    if (this.navigating) return
    this.navigating = true
    sound.select()
    this.cameras.main.fadeOut(400, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('SelectScene')
    })
  }
}
