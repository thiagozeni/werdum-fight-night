import Phaser from 'phaser'
import { getHighScore } from '../systems/HighScore'

export class YouWinScene extends Phaser.Scene {
  private navigating = false

  constructor() {
    super({ key: 'YouWinScene' })
  }

  create() {
    const { width, height } = this.scale
    const score = this.registry.get('youWinScore') as number ?? 0
    const best  = getHighScore(this.registry)

    this.cameras.main.fadeIn(600, 0, 0, 0)

    // Fundo
    this.add.image(width / 2, height / 2, 'arena')
      .setDisplaySize(width, height)
      .setTint(0x001133)
      .setDepth(0)
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55).setDepth(1)

    const cx = width / 2
    const cy = height / 2

    // CONGRATULATIONS
    this.add.text(cx, cy - 200, 'CONGRATULATIONS!', {
      fontSize: '64px', color: '#ffdd00', fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 8,
    }).setOrigin(0.5).setDepth(2)

    // YOU WIN
    this.add.text(cx, cy - 120, 'YOU WIN', {
      fontSize: '96px', color: '#ffffff', fontFamily: 'monospace',
      stroke: '#cc2200', strokeThickness: 10,
    }).setOrigin(0.5).setDepth(2)

    // Mensagem
    this.add.text(cx, cy - 30, 'Wanderlei está a salvo!', {
      fontSize: '26px', color: '#aaccff', fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(2)

    // Score
    this.add.text(cx, cy + 25, `SCORE: ${score.toLocaleString()}`, {
      fontSize: '34px', color: '#ffdd00', fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(2)

    if (score >= best && score > 0) {
      this.add.text(cx, cy + 72, 'NEW BEST!', {
        fontSize: '20px', color: '#ff8800', fontFamily: 'monospace',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(2)
    }

    // Press start (pisca)
    const pressStart = this.add.text(cx, cy + 140, 'PRESS START', {
      fontSize: '32px', color: '#ffffff', fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(2)

    this.tweens.add({
      targets: pressStart,
      alpha: 0.15,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // Partículas de celebração simples
    this.spawnConfetti()

    // Qualquer input avança
    this.time.delayedCall(1000, () => {
      this.input.keyboard!.on('keydown', () => this.goToSelect())
      this.input.on('pointerdown', () => this.goToSelect())
    })
  }

  private spawnConfetti() {
    const { width, height } = this.scale
    const colors = [0xffdd00, 0xff2222, 0x22dd88, 0x4488ff, 0xff88aa]

    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, width)
      const rect = this.add.rectangle(x, -20, 8, 14, Phaser.Utils.Array.GetRandom(colors))
        .setDepth(3)
        .setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2))

      this.tweens.add({
        targets: rect,
        y: height + 30,
        x: x + Phaser.Math.Between(-80, 80),
        rotation: Phaser.Math.FloatBetween(1, 6),
        duration: Phaser.Math.Between(2500, 5000),
        delay: Phaser.Math.Between(0, 3000),
        ease: 'Linear',
        repeat: -1,
        onRepeat: (tween: Phaser.Tweens.Tween) => {
          const t = tween.targets[0] as Phaser.GameObjects.Rectangle
          t.x = Phaser.Math.Between(0, width)
          t.y = -20
        },
      })
    }
  }

  private goToSelect() {
    if (this.navigating) return
    this.navigating = true
    // Limpa estado
    this.registry.remove('youWinScore')
    this.registry.remove('continueFromWave')
    this.registry.remove('gameOverWave')
    this.registry.remove('gameOverScore')
    this.cameras.main.fadeOut(400, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('SelectScene'))
  }
}
