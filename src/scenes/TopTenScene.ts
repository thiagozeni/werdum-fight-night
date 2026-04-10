import Phaser from 'phaser'
import { sound } from '../systems/SoundManager'
import { getTopTen, ScoreEntry } from '../lib/leaderboard'
import { gameCenter } from '../systems/GameCenterBridge'
import { padInteractive } from '../utils/iosVideo'

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

    // Botão VOLTAR
    const back = this.add.text(60, 60, '< VOLTAR', {
      fontSize: '28px', color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0, 0.5).setAlpha(0.7).setDepth(2)
    padInteractive(back)
    back.on('pointerdown', (_p: any, _lx: number, _ly: number, event: any) => {
      event.stopPropagation()
      this.goToTitle()
    })

    // Toggle Multiplataforma / Game Center (canto superior direito)
    // Em iOS mostra os dois botões, em Android/web só o ativo
    const toggleBtnStyle = {
      fontSize: '20px',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 4,
      padding: { x: 14, y: 8 },
    }
    const activeColors  = { color: '#000000', backgroundColor: '#f3c204' }
    const inactiveColors = { color: '#aaaaaa', backgroundColor: '#1a1a1a' }

    const multiBtn = this.add.text(
      1860,
      60,
      'MULTIPLATAFORMA',
      { ...toggleBtnStyle, ...activeColors },
    ).setOrigin(1, 0.5).setDepth(3)
    padInteractive(multiBtn)

    if (gameCenter.isAvailable()) {
      multiBtn.setStyle({ ...toggleBtnStyle, ...activeColors })

      const gcBtn = this.add.text(
        multiBtn.x - multiBtn.width - 12,
        60,
        'GAME CENTER',
        { ...toggleBtnStyle, ...inactiveColors },
      ).setOrigin(1, 0.5).setDepth(3)

      // Hit area expandida — touch em iPad sofre com áreas apertadas
      const gcPad = 24
      gcBtn.setInteractive(
        new Phaser.Geom.Rectangle(-gcPad, -gcPad, gcBtn.width + gcPad * 2, gcBtn.height + gcPad * 2),
        Phaser.Geom.Rectangle.Contains,
      )
      gcBtn.input!.cursor = 'pointer'

      gcBtn.on('pointerdown', async () => {
        sound.select()
        try {
          let authed = await gameCenter.isAuthenticated()
          if (!authed) {
            authed = await gameCenter.signIn()
          }
          if (!authed) {
            this.showGcToast('FAÇA LOGIN NO GAME CENTER\nEM AJUSTES → GAME CENTER')
            return
          }
          await gameCenter.showLeaderboard()
        } catch (e: any) {
          console.warn('[GameCenter] tap falhou:', e)
          this.showGcToast(`GAME CENTER INDISPONÍVEL\n${e?.message ?? ''}`.trim())
        }
      })
    }

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
    }).setOrigin(0.5).setDepth(2)
    padInteractive(startText)

    this.tweens.add({
      targets: startText, alpha: 0.2, duration: 600,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })

    startText.on('pointerdown', () => this.goToTitle())

    this.time.delayedCall(800, () => {
      this.input.keyboard!.off('keydown-SPACE')
      this.input.keyboard!.off('keydown-ENTER')
      this.input.keyboard!.off('keydown-ESCAPE')
      this.input.keyboard!.on('keydown-SPACE',  () => this.goToTitle())
      this.input.keyboard!.on('keydown-ENTER',  () => this.goToTitle())
      this.input.keyboard!.on('keydown-ESCAPE', () => this.goToTitle())
    })
  }

  private showGcToast(message: string) {
    const toast = this.add.text(960, 990, message, {
      fontSize: '22px',
      color: '#ffffff',
      align: 'center',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 5,
      backgroundColor: '#aa0000',
      padding: { x: 18, y: 12 },
    }).setOrigin(0.5).setDepth(10).setAlpha(0)

    this.tweens.add({
      targets: toast,
      alpha: 1,
      duration: 200,
      yoyo: false,
      hold: 3000,
      onComplete: () => {
        this.tweens.add({
          targets: toast,
          alpha: 0,
          duration: 400,
          delay: 3000,
          onComplete: () => toast.destroy(),
        })
      },
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
