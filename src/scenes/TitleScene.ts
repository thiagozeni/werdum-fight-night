import Phaser from 'phaser'
import { sound } from '../systems/SoundManager'

export class TitleScene extends Phaser.Scene {
  private navigating = false

  constructor() {
    super({ key: 'TitleScene' })
  }

  create() {
    const { width, height } = this.scale
    this.navigating = false

    // Fundo — arena SHATEN com crowd
    this.add.image(width / 2, height / 2, 'arena').setDisplaySize(width, height).setDepth(0)

    // bad-guys (esquerda, overflows)
    this.add.image(-176, -109, 'bad-guys').setOrigin(0, 0).setDepth(1)

    // good-guys (direita)
    this.add.image(1019, 223, 'good-guys').setOrigin(0, 0).setDepth(1)

    // Overlay sutil
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.1).setDepth(2)

    // Logo pixel art
    this.add.image(960, 157, 'logo').setOrigin(0.5).setDepth(3)

    // Subtítulo
    this.add.text(958, 630, 'AJUDE A SALVAR O WAND!', {
      fontSize: '40px', color: '#f8f7f7',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(3)

    // PRESS START (pisca)
    const pressStart = this.add.text(960, 682, 'PRESS START', {
      fontSize: '50px', color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 8,
    }).setOrigin(0.5).setDepth(3)

    this.tweens.add({
      targets: pressStart, alpha: 0.1, duration: 600,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })

    // Créditos
    this.add.text(960, 979, 'CACHORRADAS ESTUDIOS', {
      fontSize: '30px', color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(3)

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
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('SelectScene'))
  }
}
