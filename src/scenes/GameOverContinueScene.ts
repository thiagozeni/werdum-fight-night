import Phaser from 'phaser'
import { sound } from '../systems/SoundManager'

export class GameOverContinueScene extends Phaser.Scene {
  private navigating = false
  private selectedIndex = 0 // 0 = YES, 1 = NO
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

    // Fundo arena escurecido
    this.add.image(width / 2, height / 2, 'arena').setDisplaySize(width, height).setTint(0x112233).setDepth(0)
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.45).setDepth(1)

    // Título GAME OVER
    this.add.text(width / 2, height * 0.12, 'GAME OVER', {
      fontSize: '80px', color: '#ffcc00', fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 10,
    }).setOrigin(0.5).setDepth(2)

    // Arte dos personagens derrotados (direita)
    this.add.image(width * 0.65, height * 0.58, 'good-guys-loose')
      .setOrigin(0.5).setDepth(2)

    // CONTINUE? (esquerda)
    const menuX = width * 0.26
    const menuY = height * 0.60

    this.add.text(menuX, menuY, 'CONTINUE?', {
      fontSize: '44px', color: '#ffffff', fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(2)

    this.yesText = this.add.text(menuX - 60, menuY + 90, 'YES', {
      fontSize: '36px', color: '#ffcc00', fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(2).setInteractive({ useHandCursor: true })

    this.noText = this.add.text(menuX + 80, menuY + 90, 'NO', {
      fontSize: '36px', color: '#ffffff', fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(2).setInteractive({ useHandCursor: true })

    // Cursor ">"
    this.cursorArrow = this.add.text(menuX - 130, menuY + 90, '>', {
      fontSize: '36px', color: '#ffcc00', fontFamily: '"Press Start 2P", monospace',
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
      this.cursorArrow.setX(this.yesText.x - 70)
      this.yesText.setColor('#ffcc00')
      this.noText.setColor('#ffffff')
    } else {
      this.cursorArrow.setX(this.noText.x - 55)
      this.yesText.setColor('#ffffff')
      this.noText.setColor('#ffcc00')
    }
  }

  private confirmSelection() {
    if (this.navigating) return
    this.navigating = true
    sound.select()

    if (this.selectedIndex === 0) {
      // YES — continua da wave onde perdeu
      this.registry.set('continueFromWave', this.registry.get('gameOverWave'))
      this.cameras.main.fadeOut(300, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameScene'))
    } else {
      // NO — volta ao título
      this.registry.remove('continueFromWave')
      this.registry.remove('gameOverWave')
      this.registry.remove('gameOverScore')
      this.cameras.main.fadeOut(300, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('TitleScene'))
    }
  }
}
