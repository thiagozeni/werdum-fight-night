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

    // Fundo
    this.add.image(width / 2, height / 2, 'select-player-bg').setDisplaySize(width, height).setDepth(0)
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.45).setDepth(1)

    // Títulos
    this.add.text(960, 157, 'CONGRATULATIONS', {
      fontSize: '72px', color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 10,
    }).setOrigin(0.5).setDepth(2)

    this.add.text(960, 253, 'YOU WIN!', {
      fontSize: '80px', color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 12,
    }).setOrigin(0.5).setDepth(2)

    // Arte celebração
    this.add.image(878, 299, 'good-guys-win').setOrigin(0, 0).setDepth(2)

    // Stats da partida
    const score  = this.registry.get('youWinScore')  as number ?? 0
    const kills  = this.registry.get('youWinKills')  as number ?? 0
    const timeMs = this.registry.get('youWinTime')   as number ?? 0
    const mm = String(Math.floor(timeMs / 60000)).padStart(2, '0')
    const ss = String(Math.floor((timeMs % 60000) / 1000)).padStart(2, '0')

    const statStyle = {
      fontSize: '27px', color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 4,
    }
    const labelStyle = { ...statStyle, color: '#f3c204' }

    const stats: [string, string][] = [
      ['SCORE',   score.toLocaleString()],
      ['INIMIGOS', String(kills)],
      ['TEMPO',   `${mm}:${ss}`],
    ]
    stats.forEach(([label, value], i) => {
      const y = 340 + i * 90
      this.add.text(130, y, label, labelStyle).setOrigin(0, 0).setDepth(2)
      this.add.text(690, y, value, statStyle).setOrigin(1, 0).setDepth(2)
    })

    // PLAY AGAIN?
    this.add.text(129, 628, 'PLAY AGAIN?', {
      fontSize: '64px', color: '#e4e4e4',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0, 0).setDepth(2)

    // Cursor ">"
    this.add.text(215, 742, '>', {
      fontSize: '35px', color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(2)

    // PRESS START (pisca)
    const startText = this.add.text(502, 742, 'PRESS START', {
      fontSize: '44px', color: '#f3c204',
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
    this.registry.remove('youWinKills')
    this.registry.remove('youWinTime')
    this.registry.remove('continueFromWave')
    this.registry.remove('gameOverWave')
    this.registry.remove('gameOverScore')
    this.cameras.main.fadeOut(400, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('TitleScene'))
  }
}
