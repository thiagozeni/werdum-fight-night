import Phaser from 'phaser'
import { sound } from '../systems/SoundManager'
import { getHighScore } from '../systems/HighScore'

const CHARACTERS = [
  { key: 'werdum', name: 'WERDUM', sv: 'werdum-sv' },
  { key: 'dida',   name: 'DIDA',   sv: 'dida-sv'   },
  { key: 'thor',   name: 'THOR',   sv: 'thor-sv'   },
]

export class SelectScene extends Phaser.Scene {
  private selectedIndex = 0
  private previewSprite!: Phaser.GameObjects.Image
  private previewName!: Phaser.GameObjects.Text
  private cursorArrow!: Phaser.GameObjects.Text
  private selectionBoxes: Phaser.GameObjects.Rectangle[] = []
  private isConfirming = false

  constructor() {
    super({ key: 'SelectScene' })
  }

  create() {
    this.isConfirming = false
    this.selectedIndex = 0
    this.selectionBoxes = []

    const { width, height } = this.scale

    // Fundo
    this.add.image(width / 2, height / 2, 'arena').setDisplaySize(width, height).setTint(0x223344)
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6)

    // Título
    this.add.text(width / 2, height * 0.09, 'SELECT PLAYER', {
      fontSize: '48px', color: '#ffcc00', fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5)

    // High score
    const hs = getHighScore(this.registry)
    if (hs > 0) {
      this.add.text(width / 2, height * 0.17, `BEST: ${hs.toLocaleString()}`, {
        fontSize: '14px', color: '#aaddff', fontFamily: '"Press Start 2P", monospace',
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5)
    }

    // Preview grande (esquerda)
    this.previewSprite = this.add.image(width * 0.195, height, 'werdum-sv')
      .setOrigin(0.5, 1)
      .setScale(1.5)

    // Nome do personagem selecionado
    this.previewName = this.add.text(width * 0.195, height * 0.78, 'WERDUM', {
      fontSize: '44px', color: '#ffffff', fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 8,
    }).setOrigin(0.5)

    // Grid de retratos
    const boxSize = 260
    const spacing = 310
    const gridStartX = Math.round(width * 0.46)
    const gridY = Math.round(height * 0.58)

    CHARACTERS.forEach((char, i) => {
      const cx = gridStartX + i * spacing

      // Fundo do box
      this.add.rectangle(cx, gridY, boxSize, boxSize, 0x111122)

      // Borda (será atualizada pelo selectChar)
      const box = this.add.rectangle(cx, gridY, boxSize, boxSize, 0x000000, 0)
        .setStrokeStyle(4, 0x555566)
        .setDepth(2)
      this.selectionBoxes.push(box)

      // Sprite do personagem com máscara
      const sprite = this.add.sprite(cx, gridY + 20, char.key).setScale(0.85).setDepth(1)
      const maskShape = this.make.graphics()
      maskShape.fillStyle(0xffffff)
      maskShape.fillRect(cx - boxSize / 2, gridY - boxSize / 2, boxSize, boxSize)
      sprite.setMask(maskShape.createGeometryMask())

      // Interativo
      const hitArea = this.add.rectangle(cx, gridY, boxSize, boxSize, 0x000000, 0)
        .setDepth(3)
        .setInteractive({ useHandCursor: true })
      hitArea.on('pointerdown', () => {
        if (this.selectedIndex === i) this.confirmSelection()
        else this.selectChar(i)
      })
      hitArea.on('pointerover', () => { if (this.selectedIndex !== i) sound.hover() })
    })

    // Wand — card KNOCKED OUT (4º box, não selecionável)
    const wandCx = gridStartX + 3 * spacing
    this.add.rectangle(wandCx, gridY, boxSize, boxSize, 0x111122)
    this.add.rectangle(wandCx, gridY, boxSize, boxSize, 0x000000, 0).setStrokeStyle(4, 0x333344).setDepth(2)
    const wandSprite = this.add.sprite(wandCx, gridY + 20, 'wand').setScale(0.85).setDepth(1)
    const wandMask = this.make.graphics()
    wandMask.fillStyle(0xffffff)
    wandMask.fillRect(wandCx - boxSize / 2, gridY - boxSize / 2, boxSize, boxSize)
    wandSprite.setMask(wandMask.createGeometryMask())
    wandSprite.setTint(0x555566)
    this.add.text(wandCx, gridY, 'KNOCKED\nOUT', {
      fontSize: '22px', color: '#999999', fontFamily: '"Press Start 2P", monospace',
      align: 'center', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setAngle(-30).setDepth(4)

    // Cursor "1P ▼"
    this.cursorArrow = this.add.text(gridStartX, gridY - boxSize / 2 - 30, '1P\n▼', {
      fontSize: '28px', color: '#ffcc00', fontFamily: '"Press Start 2P", monospace',
      align: 'center', stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5, 1).setDepth(4)

    // Controles
    this.input.keyboard!.on('keydown-LEFT',  () => this.selectChar((this.selectedIndex - 1 + CHARACTERS.length) % CHARACTERS.length))
    this.input.keyboard!.on('keydown-RIGHT', () => this.selectChar((this.selectedIndex + 1) % CHARACTERS.length))
    this.input.keyboard!.on('keydown-A',     () => this.selectChar((this.selectedIndex - 1 + CHARACTERS.length) % CHARACTERS.length))
    this.input.keyboard!.on('keydown-D',     () => this.selectChar((this.selectedIndex + 1) % CHARACTERS.length))
    this.input.keyboard!.on('keydown-SPACE', () => this.confirmSelection())
    this.input.keyboard!.on('keydown-ENTER', () => this.confirmSelection())

    this.selectChar(0)
  }

  private selectChar(index: number) {
    if (this.isConfirming) return
    sound.hover()
    this.selectedIndex = index

    const char = CHARACTERS[index]
    this.previewSprite.setTexture(char.sv)
    this.previewName.setText(char.name)

    this.selectionBoxes.forEach((box, i) => {
      box.setStrokeStyle(i === index ? 5 : 4, i === index ? 0xffdd00 : 0x555566)
      box.setDepth(i === index ? 3 : 2)
    })

    const gridStartX = Math.round(this.scale.width * 0.46)
    const spacing = 310
    this.cursorArrow.setX(gridStartX + index * spacing)
  }

  private confirmSelection() {
    if (this.isConfirming) return
    this.isConfirming = true
    sound.select()
    const char = CHARACTERS[this.selectedIndex]
    this.registry.set('selectedChar', char.key)
    this.cameras.main.fadeOut(400, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameScene'))
  }
}
