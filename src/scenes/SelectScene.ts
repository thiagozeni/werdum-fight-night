import Phaser from 'phaser'
import { sound } from '../systems/SoundManager'
import { getHighScore } from '../systems/HighScore'

const CHARACTERS = [
  { key: 'werdum', name: 'WERDUM', hp: 150, speed: 85,  desc: 'Golpes pesados\nAgarrão exclusivo\n+HP e resistência' },
  { key: 'dida',   name: 'DIDA',   hp: 120, speed: 120, desc: 'Técnico e rápido\nCombo de 5 socos\n+Velocidade' },
  { key: 'thor',   name: 'THOR',   hp: 100, speed: 140, desc: 'Alta mobilidade\nChute aéreo potente\n+Velocidade máxima' },
]

export class SelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SelectScene' })
  }

  create() {
    const { width, height } = this.scale

    // Fundo
    const bg = this.add.image(width / 2, height / 2, 'arena')
    bg.setDisplaySize(width, height).setTint(0x223344)
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55)

    // Título
    this.add.text(width / 2, 52, 'ESCOLHA SEU LUTADOR', {
      fontSize: '30px', color: '#ffdd00', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5)

    // High score
    const hs = getHighScore(this.registry)
    if (hs > 0) {
      this.add.text(width / 2, 88, `BEST SCORE: ${hs.toLocaleString()}`, {
        fontSize: '16px', color: '#aaddff', fontFamily: 'monospace',
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5)
    }

    const cardW = 270
    const cardH = 330
    const spacing = 330
    const startX = width / 2 - spacing

    CHARACTERS.forEach((char, i) => {
      const cx = startX + i * spacing
      const cy = height / 2 + 30

      // Card
      const card = this.add.rectangle(cx, cy, cardW, cardH, 0x0a0a1a, 0.88)
        .setStrokeStyle(2, 0x334466)
        .setInteractive({ useHandCursor: true })

      // Sprite
      const sprite = this.add.image(cx, cy - 70, char.key)
      const ratio = 130 / sprite.height
      sprite.setScale(ratio * 0.55, ratio)

      // Nome
      this.add.text(cx, cy + 65, char.name, {
        fontSize: '22px', color: '#ffffff', fontFamily: 'monospace',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5)

      // Stats visuais
      this.drawStatBar(cx - 60, cy + 92, 'HP',  char.hp,  150)
      this.drawStatBar(cx - 60, cy + 112, 'VEL', char.speed, 140)

      // Descrição
      this.add.text(cx, cy + 145, char.desc, {
        fontSize: '12px', color: '#99aacc', fontFamily: 'monospace', align: 'center',
      }).setOrigin(0.5)

      // Botão
      const btn = this.add.text(cx, cy + 195, '[ SELECIONAR ]', {
        fontSize: '16px', color: '#ffdd00', fontFamily: 'monospace',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })

      card.on('pointerover', () => {
        card.setStrokeStyle(3, 0xffdd00)
        sprite.setTint(0xffffcc)
        sound.hover()
      })
      card.on('pointerout', () => {
        card.setStrokeStyle(2, 0x334466)
        sprite.clearTint()
      })

      const select = () => {
        sound.select()
        this.registry.set('selectedChar', char.key)
        this.cameras.main.fadeOut(300, 0, 0, 0)
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameScene'))
      }
      card.on('pointerdown', select)
      btn.on('pointerdown', select)
    })

    // Controles
    this.add.text(width / 2, height - 32, 'J = Soco   K = Chute   Espaço = Pular   L = Bloquear   ESC = Pausa   M = Mute', {
      fontSize: '13px', color: '#667788', fontFamily: 'monospace',
    }).setOrigin(0.5)
  }

  private drawStatBar(x: number, y: number, label: string, value: number, max: number) {
    const BAR_W = 120
    const BAR_H = 8
    this.add.text(x, y, label, { fontSize: '11px', color: '#aaaaaa', fontFamily: 'monospace' }).setOrigin(0, 0.5)
    this.add.rectangle(x + 30 + BAR_W / 2, y, BAR_W, BAR_H, 0x333333).setOrigin(0.5)
    this.add.rectangle(x + 30, y, BAR_W * (value / max), BAR_H, 0x22aaff).setOrigin(0, 0.5)
  }

}
