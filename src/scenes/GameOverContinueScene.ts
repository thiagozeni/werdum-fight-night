import Phaser from 'phaser'
import { sound } from '../systems/SoundManager'

export class GameOverContinueScene extends Phaser.Scene {
  private navigating = false
  private selectedIndex = 0 // 0=YES 1=NO
  private cursorArrow!: Phaser.GameObjects.Text
  private yesText!: Phaser.GameObjects.Text
  private noText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'GameOverContinueScene' })
  }

  create() {
    this.navigating = false
    this.selectedIndex = 0
    const { width, height } = this.scale

    this.cameras.main.fadeIn(400, 0, 0, 0)

    // Fundo
    this.add.image(width / 2, height / 2, 'select-player-bg').setDisplaySize(width, height).setDepth(0)
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55).setDepth(1)

    // GAME OVER
    this.add.text(960, 167, 'GAME OVER', {
      fontSize: '110px', color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 12,
    }).setOrigin(0.5).setDepth(2)

    // Arte personagens derrotados
    this.add.image(831, 146, 'good-guys-loose').setOrigin(0, 0).setDepth(2)

    // CONTINUE?
    this.add.text(159, 628, 'CONTINUE?', {
      fontSize: '60px', color: '#e4e4e4',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 10,
    }).setOrigin(0, 0).setDepth(2)

    // YES
    this.yesText = this.add.text(324, 742, 'YES', {
      fontSize: '40px', color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 10,
    }).setOrigin(0.5).setDepth(2).setInteractive({ useHandCursor: true })

    // NO
    this.noText = this.add.text(542, 742, 'NO', {
      fontSize: '40px', color: '#e4e4e4',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 10,
    }).setOrigin(0.5).setDepth(2).setInteractive({ useHandCursor: true })

    // Cursor ">"
    this.cursorArrow = this.add.text(210, 742, '>', {
      fontSize: '44px', color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(2)

    // Inputs
    this.input.keyboard!.on('keydown-LEFT',  () => this.moveCursor(0))
    this.input.keyboard!.on('keydown-RIGHT', () => this.moveCursor(1))
    this.input.keyboard!.on('keydown-A',     () => this.moveCursor(0))
    this.input.keyboard!.on('keydown-D',     () => this.moveCursor(1))
    this.input.keyboard!.on('keydown-Y',     () => { this.moveCursor(0); this.confirmSelection() })
    this.input.keyboard!.on('keydown-N',     () => { this.moveCursor(1); this.confirmSelection() })
    this.input.keyboard!.on('keydown-SPACE', () => this.confirmSelection())
    this.input.keyboard!.on('keydown-ENTER', () => this.confirmSelection())

    this.yesText.on('pointerdown', () => { this.moveCursor(0); this.confirmSelection() })
    this.noText.on('pointerdown',  () => { this.moveCursor(1); this.confirmSelection() })

    this.updateCursor()
  }

  private moveCursor(index: number) {
    if (this.navigating) return
    if (this.selectedIndex !== index) sound.hover()
    this.selectedIndex = index
    this.updateCursor()
  }

  private updateCursor() {
    if (this.selectedIndex === 0) {
      this.cursorArrow.setX(210)
      this.yesText.setColor('#f3c204')
      this.noText.setColor('#e4e4e4')
    } else {
      this.cursorArrow.setX(428)
      this.yesText.setColor('#e4e4e4')
      this.noText.setColor('#f3c204')
    }
  }

  private confirmSelection() {
    if (this.navigating) return
    this.navigating = true
    sound.select()
    if (this.selectedIndex === 0) {
      this.registry.set('continueFromWave', this.registry.get('gameOverWave'))
      this.cameras.main.fadeOut(300, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameScene'))
    } else {
      this.registry.remove('continueFromWave')
      this.registry.remove('gameOverWave')
      this.registry.remove('gameOverScore')
      this.cameras.main.fadeOut(300, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('TitleScene'))
    }
  }
}
