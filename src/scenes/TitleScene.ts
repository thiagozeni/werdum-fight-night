import Phaser from 'phaser'
import { sound } from '../systems/SoundManager'

export class TitleScene extends Phaser.Scene {
  private navigating = false

  constructor() {
    super({ key: 'TitleScene' })
  }

  create() {
    const { width, height } = this.scale

    // Vídeo de fundo
    try {
      const video = this.add.video(width / 2, height / 2, 'bg-intro')
      video.setDisplaySize(width, height).setDepth(0).setMute(true)
      video.play(true)
    } catch (_) {
      // Fallback se vídeo não carregar
      this.add.image(width / 2, height / 2, 'arena').setDisplaySize(width, height).setDepth(0)
    }

    // Overlay escuro
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5).setDepth(1)

    // Título principal
    this.add.text(width / 2, height * 0.28, 'WERDUM', {
      fontSize: '96px',
      color: '#ffdd00',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 10,
    }).setDepth(2).setOrigin(0.5)

    this.add.text(width / 2, height * 0.42, 'FIGHT', {
      fontSize: '80px',
      color: '#ffffff',
      fontFamily: 'monospace',
      stroke: '#cc2200',
      strokeThickness: 8,
    }).setDepth(2).setOrigin(0.5)

    // Subtítulo
    this.add.text(width / 2, height * 0.55, 'Defenda o Wanderlei!', {
      fontSize: '22px',
      color: '#aaccff',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    }).setDepth(2).setOrigin(0.5)

    // Press start (pisca)
    const pressStart = this.add.text(width / 2, height * 0.72, 'PRESSIONE ESPAÇO OU TOQUE', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 4,
    }).setDepth(2).setOrigin(0.5)

    this.tweens.add({
      targets: pressStart,
      alpha: 0.1,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // Link para tela de teste de animações
    const animTest = this.add.text(width - 20, height - 20, '[ANIM TEST]', {
      fontSize: '14px', color: '#444466', fontFamily: 'monospace',
    }).setDepth(2).setOrigin(1, 1).setInteractive({ useHandCursor: true })
    animTest.on('pointerover', () => animTest.setColor('#8888cc'))
    animTest.on('pointerout',  () => animTest.setColor('#444466'))
    animTest.on('pointerdown', () => {
      if (this.navigating) return
      this.navigating = true
      this.cameras.main.fadeOut(300, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('AnimTestScene'))
    })

    // Créditos
    this.add.text(width / 2, height - 20, 'SHATEN Arena  •  VULKANO + SPATEN', {
      fontSize: '13px',
      color: '#555555',
      fontFamily: 'monospace',
    }).setDepth(2).setOrigin(0.5)

    // Inputs
    this.input.keyboard!.on('keydown-SPACE', () => this.goToSelect())
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
