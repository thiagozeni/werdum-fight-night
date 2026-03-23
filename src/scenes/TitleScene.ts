import Phaser from 'phaser'
import { sound } from '../systems/SoundManager'

export class TitleScene extends Phaser.Scene {
  private navigating = false
  private bgVideo: Phaser.GameObjects.Video | null = null

  constructor() {
    super({ key: 'TitleScene' })
  }

  create() {
    const { width, height } = this.scale
    this.navigating = false
    sound.startIntroMusic()

    // Vídeo de fundo em loop
    this.bgVideo = this.add.video(width / 2, height / 2, undefined as unknown as string)
    this.bgVideo.loadURL('videos/intro.mp4', true)
    this.bgVideo.setDisplaySize(width, height).setDepth(0)
    this.bgVideo.on('created', () => { this.bgVideo?.play(true) })

    // PRESS START (pisca)
    const pressStart = this.add.text(960, 630, 'PRESS START', {
      fontSize: '42px', color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 14,
    }).setOrigin(0.5).setDepth(3)

    this.tweens.add({
      targets: pressStart, alpha: 0.1, duration: 600,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })

    // Subtítulo
    this.add.text(958, 702, 'AJUDE A SALVAR O WAND!', {
      fontSize: '28px', color: '#f8f7f7',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(3)

    // Créditos
    this.add.text(960, 979, 'CACHORRADAS ESTUDIOS', {
      fontSize: '24px', color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(3)

    // Anim test — acessível apenas via Shift+F12 (uso interno)
    this.input.keyboard!.on('keydown-F12', (event: KeyboardEvent) => {
      if (!event.shiftKey || this.navigating) return
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
    this.bgVideo?.stop()
    this.cameras.main.fadeOut(400, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('HowToPlayScene'))
  }
}
