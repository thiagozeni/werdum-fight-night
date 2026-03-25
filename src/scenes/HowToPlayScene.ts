import Phaser from 'phaser'
import { sound } from '../systems/SoundManager'

export class HowToPlayScene extends Phaser.Scene {
  private navigating = false

  constructor() {
    super({ key: 'HowToPlayScene' })
  }

  create() {
    this.navigating = false
    const { width, height } = this.scale

    this.cameras.main.fadeIn(300, 0, 0, 0)

    this.add.image(width / 2, height / 2, 'sem-crowd').setDisplaySize(width, height).setDepth(0)
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.80).setDepth(1)

    // Título
    this.add.text(width / 2, 72, 'HOW TO PLAY', {
      fontSize: '72px', color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 8,
    }).setOrigin(0.5, 0).setDepth(2)

    // Controles
    const controls: [string, string][] = [
      ['MOVER',     'W A S D  /  ←↑↓→  /  JOYSTICK'],
      ['SOCO',      'J  /  BOTÃO J'],
      ['CHUTE',     'K  /  BOTÃO K'],
      ['BLOQUEAR',  'L  /  BOTÃO 🛡'],
      ['PAUSA',     'ESC'],
      ['MUTE',      'M'],
    ]

    const lStyle = {
      fontSize: '30px', color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 3,
    }
    const vStyle = { ...lStyle, color: '#ffffff' }

    const startY = 210
    controls.forEach(([label, value], i) => {
      const y = startY + i * 85
      this.add.text(430, y, label, lStyle).setOrigin(1, 0).setDepth(2)
      this.add.text(460, y, value, vStyle).setOrigin(0, 0).setDepth(2)
    })

    // Objetivo
    this.add.text(width / 2, 780, '⚡  PROTEJA O WAND DOS INIMIGOS!  ⚡', {
      fontSize: '36px', color: '#ff9944',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5, 0).setDepth(2)

    // Press start
    const skip = this.add.text(width / 2, 905, 'PRESS START', {
      fontSize: '50px', color: '#aaddff',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(2).setInteractive({ useHandCursor: true })

    this.tweens.add({ targets: skip, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 })
    skip.on('pointerdown', (_p: any, _lx: number, _ly: number, event: any) => {
      event.stopPropagation()
      this.go()
    })

    // Botão VOLTAR
    const back = this.add.text(60, 60, '← VOLTAR', {
      fontSize: '28px', color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0, 0.5).setAlpha(0.7).setDepth(2).setInteractive({ useHandCursor: true })
    back.on('pointerdown',  (_p: any, _lx: number, _ly: number, event: any) => {
      event.stopPropagation()
      this.goBack()
    })

    this.time.delayedCall(300, () => {
      this.input.keyboard!.on('keydown-SPACE',  () => this.go())
      this.input.keyboard!.on('keydown-ENTER',  () => this.go())
      this.input.keyboard!.on('keydown-ESCAPE', () => this.goBack())
      this.input.on('pointerdown', () => this.go())
    })
  }

  private go() {
    if (this.navigating) return
    this.navigating = true
    sound.select()
    this.cameras.main.fadeOut(300, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('SelectScene'))
  }

  private goBack() {
    if (this.navigating) return
    this.navigating = true
    sound.select()
    this.cameras.main.fadeOut(300, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('TitleScene'))
  }
}
