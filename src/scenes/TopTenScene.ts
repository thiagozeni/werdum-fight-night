import Phaser from 'phaser'
import { sound } from '../systems/SoundManager'
import { getTopTen, ScoreEntry } from '../lib/leaderboard'

export class TopTenScene extends Phaser.Scene {
  private navigating = false

  constructor() {
    super({ key: 'TopTenScene' })
  }

  async create() {
    this.navigating = false
    const { width, height } = this.scale

    this.cameras.main.fadeIn(600, 0, 0, 0)

    // Fundo
    this.add.image(width / 2, height / 2, 'select-player-bg').setDisplaySize(width, height).setDepth(0)
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55).setDepth(1)

    // Título
    this.add.text(960, 70, 'TOP 10', {
      fontSize: '90px', color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 14,
    }).setOrigin(0.5).setDepth(2)

    // Cabeçalho colunas
    const headerStyle = {
      fontSize: '22px', color: '#aaaaaa',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 3,
    }
    this.add.text(100,  195, '#',         headerStyle).setDepth(2)
    this.add.text(180,  195, 'NOME',      headerStyle).setDepth(2)
    this.add.text(640,  195, 'PERSONAGEM', headerStyle).setDepth(2)
    this.add.text(1040, 195, 'CONT.',     headerStyle).setDepth(2)
    this.add.text(1240, 195, 'TEMPO',     headerStyle).setDepth(2)
    this.add.text(1530, 195, 'SCORE',     headerStyle).setDepth(2)

    // Linha divisória
    this.add.rectangle(960, 230, 1720, 2, 0xf3c204, 0.5).setDepth(2)

    // Entrada recém salva (para destacar)
    const lastName      = this.registry.get('lastEntryName')      as string | undefined
    const lastContinues = this.registry.get('lastEntryContinues') as number | undefined
    const lastTime      = this.registry.get('lastEntryTime')      as number | undefined
    const lastScore     = this.registry.get('lastEntryScore')     as number | undefined

    // Carrega dados
    let rows: ScoreEntry[] = []
    try {
      rows = await getTopTen()
    } catch {
      this.add.text(960, 540, 'ERRO AO CARREGAR\nRANKING', {
        fontSize: '32px', color: '#ff4444', align: 'center',
        fontFamily: '"Press Start 2P", monospace',
        stroke: '#000000', strokeThickness: 5,
      }).setOrigin(0.5).setDepth(2)
    }

    const rowStyle = {
      fontSize: '26px', color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 4,
    }
    const highlightStyle = { ...rowStyle, color: '#f3c204' }

    rows.forEach((entry, i) => {
      const y = 270 + i * 72

      // Destaca se for a entrada recém inserida
      const isNew = lastName !== undefined
        && entry.player_name === lastName
        && entry.continues   === lastContinues
        && entry.time_ms     === lastTime
        && entry.score       === lastScore

      const style  = isNew ? highlightStyle : rowStyle
      const medal  = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`

      const mm = String(Math.floor(entry.time_ms / 60000)).padStart(2, '0')
      const ss = String(Math.floor((entry.time_ms % 60000) / 1000)).padStart(2, '0')

      if (isNew) {
        this.add.rectangle(960, y + 18, 1720, 58, 0xf3c204, 0.12).setDepth(2)
      }

      const charName = (entry.character ?? 'werdum').toUpperCase()
      this.add.text(100,  y, medal,                           style).setDepth(2)
      this.add.text(180,  y, entry.player_name,               style).setDepth(2)
      this.add.text(640,  y, charName,                        style).setDepth(2)
      this.add.text(1040, y, String(entry.continues),         style).setDepth(2)
      this.add.text(1240, y, `${mm}:${ss}`,                   style).setDepth(2)
      this.add.text(1530, y, entry.score.toLocaleString(),    style).setDepth(2)
    })

    if (rows.length === 0) {
      this.add.text(960, 540, 'NENHUMA PONTUAÇÃO\nAINDA', {
        fontSize: '32px', color: '#888888', align: 'center',
        fontFamily: '"Press Start 2P", monospace',
        stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(2)
    }

    // Linha inferior
    this.add.rectangle(960, 1010, 1720, 2, 0xf3c204, 0.5).setDepth(2)

    // PRESS START (pisca)
    const startText = this.add.text(960, 1048, 'PRESS START', {
      fontSize: '36px', color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(2).setInteractive({ useHandCursor: true })

    this.tweens.add({
      targets: startText, alpha: 0.2, duration: 600,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })

    startText.on('pointerdown', () => this.goToTitle())

    this.time.delayedCall(800, () => {
      this.input.keyboard!.off('keydown-SPACE')
      this.input.keyboard!.off('keydown-ENTER')
      this.input.keyboard!.on('keydown-SPACE', () => this.goToTitle())
      this.input.keyboard!.on('keydown-ENTER', () => this.goToTitle())
    })
  }

  private goToTitle() {
    if (this.navigating) return
    this.navigating = true
    sound.select()
    this.registry.remove('lastEntryName')
    this.registry.remove('lastEntryContinues')
    this.registry.remove('lastEntryTime')
    this.registry.remove('lastEntryScore')
    this.cameras.main.fadeOut(400, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('TitleScene'))
  }
}
