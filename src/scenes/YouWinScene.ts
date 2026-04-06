import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { sound } from '../systems/SoundManager'
import { saveScore } from '../lib/leaderboard'
import { nativeShare, haptics } from '../systems/NativeBridge'

interface YouWinSceneData {
  fromGameScene?: boolean
  selectedChar?: string
  finalWave?: number
  totalWaves?: number
}

type Revealable =
  | Phaser.GameObjects.Container
  | Phaser.GameObjects.Image
  | Phaser.GameObjects.Rectangle
  | Phaser.GameObjects.Sprite
  | Phaser.GameObjects.Text

type CreditLine = {
  text: string
  kind: 'title' | 'section' | 'line' | 'spacer'
}

const CHAR_LABELS: Record<string, string> = {
  werdum: 'FABRICIO WERDUM',
  dida: 'DIDA',
  thor: 'THOR',
}

const CREDIT_ROLL: CreditLine[] = [
  { text: 'CACHORRADAS ESTUDIOS', kind: 'title' },
  { text: 'WERDUM FIGHT NIGHT', kind: 'section' },
  { text: '', kind: 'spacer' },
  { text: 'CREATIVE DIRECTION', kind: 'section' },
  { text: 'CACHORRADAS ESTUDIOS', kind: 'line' },
  { text: 'PIXEL ART RETRO FIGHT CARD', kind: 'line' },
  { text: '', kind: 'spacer' },
  { text: 'PLAYABLE HEROES', kind: 'section' },
  { text: 'FABRICIO WERDUM', kind: 'line' },
  { text: 'DIDA', kind: 'line' },
  { text: 'THOR', kind: 'line' },
  { text: 'PROTECT WANDERLEI SILVA', kind: 'line' },
  { text: '', kind: 'spacer' },
  { text: 'TECH STACK', kind: 'section' },
  { text: 'PHASER 3', kind: 'line' },
  { text: 'TYPESCRIPT', kind: 'line' },
  { text: 'SUPABASE LEADERBOARD', kind: 'line' },
  { text: '', kind: 'spacer' },
  { text: 'AUDIO AND UI', kind: 'section' },
  { text: 'PRESS START 2P', kind: 'line' },
  { text: 'FREE-SFX OPEN GAME ART CC0', kind: 'line' },
  { text: 'SYNTH UI FEEDBACK', kind: 'line' },
  { text: '', kind: 'spacer' },
  { text: 'SPECIAL THANKS', kind: 'section' },
  { text: 'EVERYONE DEFENDING THE RING', kind: 'line' },
  { text: 'SEE YOU IN THE TOP 10', kind: 'line' },
]

export class YouWinScene extends Phaser.Scene {
  private navigating = false
  private uiReady = false
  private fromGameScene = false
  private nameInput: HTMLInputElement | null = null
  private statusText: Phaser.GameObjects.Text | null = null
  private startText: Phaser.GameObjects.Text | null = null
  private hero: Player | null = null
  private creditsContainer: Phaser.GameObjects.Container | null = null
  private creditsTween: Phaser.Tweens.Tween | null = null
  private selectedChar = 'werdum'
  private finalWave = 0
  private totalWaves = 0
  private inputLayout: { left: number; top: number; width: number; height: number } | null = null

  private readonly onScaleResize = () => {
    this.syncNameInputPosition()
  }

  constructor() {
    super({ key: 'YouWinScene' })
  }

  init(data: YouWinSceneData) {
    this.fromGameScene = data.fromGameScene ?? false
    this.selectedChar = this.resolveCharKey(
      data.selectedChar ?? ((this.registry.get('selectedChar') as string | undefined) ?? 'werdum'),
    )
    this.totalWaves = data.totalWaves ?? ((this.registry.get('totalWaves') as number | undefined) ?? 0)
    this.finalWave = data.finalWave ?? this.totalWaves
    if (this.finalWave <= 0) this.finalWave = this.totalWaves
    if (this.totalWaves <= 0) this.totalWaves = this.finalWave
  }

  create() {
    this.handleShutdown()
    this.navigating = false
    this.uiReady = false
    this.statusText = null
    this.startText = null

    this.scale.off('resize', this.onScaleResize)
    this.scale.on('resize', this.onScaleResize)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this)
    this.events.once(Phaser.Scenes.Events.DESTROY, this.handleShutdown, this)

    const headlineObjects = this.createBackdropAndHeadline()
    const stageObjects = this.createVictoryStage()
    const statsObjects = this.createStatsPanel()
    const creditsObjects = this.createCreditsPanel()
    const actionObjects = this.createActionPanel()

    this.cameras.main.fadeIn(this.fromGameScene ? 320 : 600, 0, 0, 0)

    this.revealObjects(headlineObjects, 60, 0, 18)
    this.revealObjects(stageObjects, this.fromGameScene ? 900 : 120, 0, 18)

    const panelDelay = this.fromGameScene ? 1080 : 220
    this.revealObjects(statsObjects, panelDelay, -18, 0)
    this.revealObjects(creditsObjects, panelDelay + 80, 18, 0)
    this.revealObjects(actionObjects, panelDelay + 140, 0, 18)

    this.time.delayedCall(this.fromGameScene ? 120 : 0, () => this.startVictorySequence())
    this.time.delayedCall(panelDelay + 160, () => this.enableActions())
  }

  update(_time: number, delta: number) {
    this.hero?.update(delta)
  }

  private resolveCharKey(key: string) {
    return CHAR_LABELS[key] ? key : 'werdum'
  }

  private createBackdropAndHeadline(): Revealable[] {
    const { width, height } = this.scale

    this.add.image(width / 2, height / 2, 'game-bg-ringue')
      .setDisplaySize(width, height)
      .setDepth(0)
    this.add.image(width / 2, height / 2 - 18, 'good-guys-win')
      .setDepth(2)
      .setAlpha(0.18)
      .setScale(0.94)
    this.add.rectangle(width / 2, height / 2, width, height, 0x05070a, 0.46).setDepth(3)

    this.add.rectangle(485, 360, 260, 920, 0xf3c204, 0.07)
      .setAngle(-13)
      .setDepth(4)
    this.add.rectangle(930, 330, 300, 920, 0xffffff, 0.06)
      .setAngle(12)
      .setDepth(4)

    this.add.image(width / 2, 525, 'game-cordas')
      .setDisplaySize(width, height)
      .setDepth(28)
      .setAlpha(0.85)

    const mission = this.add.text(960, 96, 'MISSION COMPLETE', {
      fontSize: '52px',
      color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(42)

    const youWin = this.add.text(960, 168, 'YOU WIN', {
      fontSize: '94px',
      color: '#fff3bf',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 12,
    }).setOrigin(0.5).setDepth(42)

    const subline = this.add.text(960, 228, 'WAND IS SAFE. THE CROWD IS YOURS.', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(42)

    return [mission, youWin, subline]
  }

  private createVictoryStage(): Revealable[] {
    const heroX = 760
    const heroY = 980
    const heroLabel = CHAR_LABELS[this.selectedChar] ?? this.selectedChar.toUpperCase()

    this.hero = new Player(this, 210, heroY, this.selectedChar)
    this.hero.setDepth(18)
    this.hero.setAlpha(0)
    this.hero.setFlipX(false)

    const nameText = this.add.text(heroX, 658, heroLabel, {
      fontSize: '26px',
      color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(42)

    const badgeText = this.add.text(heroX, 710, 'RING SAVED', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(42)

    return [nameText, badgeText]
  }

  private startVictorySequence() {
    if (!this.hero) return

    this.hero.setAlpha(1)
    this.hero.play(`${this.selectedChar}-run`)

    this.tweens.add({
      targets: this.hero,
      x: 760,
      duration: 620,
      ease: 'Quad.easeOut',
      onComplete: () => {
        if (!this.hero) return

        if (this.selectedChar === 'dida') {
          this.hero.playKickAnim()
        } else {
          this.hero.playPunchAnim()
        }

        const burstX = this.selectedChar === 'dida' ? this.hero.x + 150 : this.hero.x + 130
        this.spawnVictoryBurst(burstX, this.hero.y - 170)
        this.cameras.main.shake(140, 0.0025)

        this.time.delayedCall(this.selectedChar === 'dida' ? 760 : 860, () => {
          if (!this.hero) return
          this.hero.play(`${this.selectedChar}-idle`)
          this.hero.setFlipX(false)
        })
      },
    })
  }

  private spawnVictoryBurst(x: number, y: number) {
    const emitter = this.add.particles(x, y, 'spark', {
      speedX: { min: -180, max: 180 },
      speedY: { min: -260, max: -90 },
      gravityY: 320,
      lifespan: 1100,
      scale: { start: 1.4, end: 0 },
      quantity: 28,
      tint: [0xf3c204, 0xfff2a8, 0xffffff, 0xff8c42],
      blendMode: 'ADD',
    })
    emitter.setDepth(30)
    this.time.delayedCall(1200, () => emitter.destroy())
  }

  private createStatsPanel(): Revealable[] {
    const score = (this.registry.get('youWinScore') as number | undefined) ?? 0
    const kills = (this.registry.get('youWinKills') as number | undefined) ?? 0
    const timeMs = (this.registry.get('youWinTime') as number | undefined) ?? 0
    const continues = (this.registry.get('continueCount') as number | undefined) ?? 0
    const mm = String(Math.floor(timeMs / 60000)).padStart(2, '0')
    const ss = String(Math.floor((timeMs % 60000) / 1000)).padStart(2, '0')

    const panelLeft = 70
    const panelTop = 286
    const panelWidth = 560
    const panelHeight = 356

    const panel = this.add.rectangle(
      panelLeft + panelWidth / 2,
      panelTop + panelHeight / 2,
      panelWidth,
      panelHeight,
      0x08131f,
      0.82,
    ).setStrokeStyle(4, 0xf3c204, 0.62).setDepth(40)

    const title = this.add.text(panelLeft + 30, panelTop + 24, 'RUN STATS', {
      fontSize: '24px',
      color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 5,
    }).setDepth(42)

    const subtitle = this.add.text(panelLeft + 30, panelTop + 66, CHAR_LABELS[this.selectedChar], {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 4,
    }).setDepth(42)

    const objects: Revealable[] = [panel, title, subtitle]

    if (this.textures.exists(`hud-${this.selectedChar}`)) {
      const portrait = this.add.image(panelLeft + panelWidth - 82, panelTop + 72, `hud-${this.selectedChar}`)
        .setDepth(42)
        .setScale(0.86)
      objects.push(portrait)
    }

    const rowLabelStyle = {
      fontSize: '18px',
      color: '#9fd7ff',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 4,
    }
    const rowValueStyle = {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 4,
    }

    const entries: Array<[string, string]> = [
      ['SCORE', score.toLocaleString()],
      ['ENEMIES', String(kills)],
      ['TIME', `${mm}:${ss}`],
      ['WAVES', `${this.finalWave} / ${this.totalWaves}`],
      ['CONTINUES', String(continues)],
    ]

    entries.forEach(([label, value], index) => {
      const y = panelTop + 126 + index * 44
      objects.push(
        this.add.text(panelLeft + 30, y, label, rowLabelStyle).setDepth(42),
        this.add.text(panelLeft + panelWidth - 28, y, value, rowValueStyle)
          .setOrigin(1, 0)
          .setDepth(42),
      )
    })

    return objects
  }

  private createCreditsPanel(): Revealable[] {
    const panelLeft = 1306
    const panelTop = 210
    const panelWidth = 500
    const panelHeight = 672
    const viewportTop = panelTop + 82
    const viewportHeight = panelHeight - 116

    const panel = this.add.rectangle(
      panelLeft + panelWidth / 2,
      panelTop + panelHeight / 2,
      panelWidth,
      panelHeight,
      0x08131f,
      0.82,
    ).setStrokeStyle(4, 0xf3c204, 0.62).setDepth(40)

    const title = this.add.text(panelLeft + panelWidth / 2, panelTop + 28, 'CREDITS', {
      fontSize: '24px',
      color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5, 0).setDepth(42)

    const maskShape = this.add.graphics()
    maskShape.fillRect(panelLeft + 26, viewportTop, panelWidth - 52, viewportHeight)
    maskShape.setVisible(false)

    this.creditsContainer = this.add.container(panelLeft + panelWidth / 2, viewportTop + viewportHeight + 28)
    this.creditsContainer.setDepth(44)
    this.creditsContainer.setAlpha(0)
    this.creditsContainer.setMask(maskShape.createGeometryMask())

    let cursorY = 0
    for (const line of CREDIT_ROLL) {
      if (line.kind === 'spacer') {
        cursorY += 24
        continue
      }

      const style = line.kind === 'title'
        ? {
            fontSize: '22px',
            color: '#fff3bf',
            fontFamily: '"Press Start 2P", monospace',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center' as const,
          }
        : line.kind === 'section'
          ? {
              fontSize: '16px',
              color: '#f3c204',
              fontFamily: '"Press Start 2P", monospace',
              stroke: '#000000',
              strokeThickness: 4,
              align: 'center' as const,
            }
          : {
              fontSize: '14px',
              color: '#ffffff',
              fontFamily: '"Press Start 2P", monospace',
              stroke: '#000000',
              strokeThickness: 3,
              align: 'center' as const,
            }

      const text = this.add.text(0, cursorY, line.text, style).setOrigin(0.5, 0)
      this.creditsContainer.add(text)
      cursorY += text.height + (line.kind === 'title' ? 18 : 12)
    }

    const fullHeight = cursorY
    const startY = viewportTop + viewportHeight + 28
    const endY = viewportTop - fullHeight - 20
    const scrollDuration = Math.max(18000, fullHeight * 30)

    const shadeTop = this.add.rectangle(
      panelLeft + panelWidth / 2,
      viewportTop + 8,
      panelWidth - 42,
      26,
      0x08131f,
      0.96,
    ).setDepth(46)

    const shadeBottom = this.add.rectangle(
      panelLeft + panelWidth / 2,
      viewportTop + viewportHeight - 8,
      panelWidth - 42,
      26,
      0x08131f,
      0.96,
    ).setDepth(46)

    this.time.delayedCall(this.fromGameScene ? 1180 : 240, () => {
      if (!this.creditsContainer) return
      this.creditsContainer.setY(startY)
      this.tweens.add({
        targets: this.creditsContainer,
        alpha: 1,
        duration: 420,
        ease: 'Quad.easeOut',
      })
      this.startCreditsRoll(startY, endY, scrollDuration)
    })

    return [panel, title, shadeTop, shadeBottom]
  }

  private startCreditsRoll(startY: number, endY: number, duration: number) {
    if (!this.creditsContainer) return

    this.creditsTween?.remove()
    this.creditsContainer.setY(startY)
    this.creditsTween = this.tweens.add({
      targets: this.creditsContainer,
      y: endY,
      duration,
      ease: 'Linear',
      onComplete: () => {
        if (!this.creditsContainer) return
        this.time.delayedCall(520, () => {
          if (!this.creditsContainer) return
          this.startCreditsRoll(startY, endY, duration)
        })
      },
    })
  }

  private createActionPanel(): Revealable[] {
    const panelLeft = 70
    const panelTop = 770
    const panelWidth = 1110
    const panelHeight = 232

    this.inputLayout = {
      left: panelLeft + 34,
      top: panelTop + 86,
      width: 430,
      height: 58,
    }

    const panel = this.add.rectangle(
      panelLeft + panelWidth / 2,
      panelTop + panelHeight / 2,
      panelWidth,
      panelHeight,
      0x08131f,
      0.84,
    ).setStrokeStyle(4, 0xf3c204, 0.62).setDepth(40)

    const title = this.add.text(panelLeft + 30, panelTop + 24, 'ENTER YOUR NAME', {
      fontSize: '24px',
      color: '#f3c204',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 5,
    }).setDepth(42)

    const helper = this.add.text(panelLeft + 30, panelTop + 58, 'SAVE YOUR SCORE BEFORE ENTERING TOP 10', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 3,
    }).setDepth(42)

    const maxChars = this.add.text(panelLeft + 30, panelTop + 156, 'MAX 12 CHARS', {
      fontSize: '12px',
      color: '#9fd7ff',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 3,
    }).setDepth(42)

    const buttonBg = this.add.rectangle(964, 930, 330, 76, 0xf3c204, 1)
      .setDepth(42)
      .setStrokeStyle(4, 0x000000, 0.7)
      .setInteractive({ useHandCursor: true })

    this.startText = this.add.text(964, 930, 'PRESS START', {
      fontSize: '22px',
      color: '#000000',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#f3c204',
      strokeThickness: 1,
    }).setOrigin(0.5).setDepth(43)

    buttonBg.on('pointerdown', () => this.submit())
    this.startText.on('pointerdown', () => this.submit())

    this.statusText = this.add.text(panelLeft + 30, panelTop + 184, '', {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 3,
    }).setDepth(43).setAlpha(0)

    return [panel, title, helper, maxChars, buttonBg, this.startText]
  }

  private revealObjects(targets: Revealable[], delay: number, offsetX: number, offsetY: number) {
    targets.forEach((target) => {
      target.setAlpha(0)
      target.setPosition(target.x + offsetX, target.y + offsetY)
    })

    this.tweens.add({
      targets,
      alpha: 1,
      x: offsetX === 0 ? undefined : `-=${offsetX}`,
      y: offsetY === 0 ? undefined : `-=${offsetY}`,
      duration: 420,
      delay,
      ease: 'Quad.easeOut',
    })
  }

  private enableActions() {
    if (this.uiReady) return
    this.uiReady = true

    this.createNameInput()
    this.syncNameInputPosition()

    this.input.keyboard?.off('keydown-ENTER')
    this.input.keyboard?.off('keydown-SPACE')
    this.input.keyboard?.on('keydown-ENTER', () => this.submit())
    this.input.keyboard?.on('keydown-SPACE', () => this.submit())

    if (this.startText) {
      this.tweens.add({
        targets: this.startText,
        alpha: 0.25,
        duration: 620,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }
  }

  private createNameInput() {
    this.removeNameInput()
    if (!this.inputLayout) return

    const input = document.createElement('input')
    input.type = 'text'
    input.maxLength = 12
    input.placeholder = 'AAA'
    input.style.position = 'fixed'
    input.style.fontFamily = '"Press Start 2P", monospace'
    input.style.background = 'rgba(4, 10, 18, 0.92)'
    input.style.color = '#f3c204'
    input.style.border = '2px solid #f3c204'
    input.style.outline = 'none'
    input.style.padding = '6px 10px'
    input.style.textTransform = 'uppercase'
    input.style.zIndex = '100'
    input.style.letterSpacing = '2px'
    input.style.borderRadius = '0'
    document.body.appendChild(input)
    this.nameInput = input

    this.syncNameInputPosition()

    input.addEventListener('focus', () => {
      this.input.keyboard?.disableGlobalCapture()
    })
    input.addEventListener('blur', () => {
      this.input.keyboard?.enableGlobalCapture()
    })
    input.addEventListener('input', () => {
      const pos = input.selectionStart ?? input.value.length
      input.value = input.value.toUpperCase()
      input.setSelectionRange(pos, pos)
    })
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        this.submit()
      }
    })

    input.focus()
  }

  private syncNameInputPosition() {
    if (!this.nameInput || !this.inputLayout) return

    const canvas = this.game.canvas
    const bounds = canvas.getBoundingClientRect()
    const scaleX = bounds.width / 1920
    const scaleY = bounds.height / 1080

    this.nameInput.style.left = `${bounds.left + this.inputLayout.left * scaleX}px`
    this.nameInput.style.top = `${bounds.top + this.inputLayout.top * scaleY}px`
    this.nameInput.style.width = `${this.inputLayout.width * scaleX}px`
    this.nameInput.style.height = `${this.inputLayout.height * scaleY}px`
    this.nameInput.style.fontSize = `${24 * scaleY}px`
  }

  private removeNameInput() {
    if (this.nameInput) {
      this.nameInput.remove()
      this.nameInput = null
    }
    this.input.keyboard?.enableGlobalCapture()
  }

  private async submit() {
    if (this.navigating || !this.uiReady) return
    this.navigating = true

    const name = (this.nameInput?.value.trim() || 'AAA').toUpperCase().slice(0, 12)
    const score = (this.registry.get('youWinScore') as number | undefined) ?? 0
    const timeMs = (this.registry.get('youWinTime') as number | undefined) ?? 0
    const continues = (this.registry.get('continueCount') as number | undefined) ?? 0
    const character = this.selectedChar

    this.removeNameInput()
    sound.select()

    if (this.statusText) {
      this.statusText
        .setAlpha(1)
        .setColor('#aaaaaa')
        .setText('SAVING...')
    }

    let saveOk = false
    try {
      await saveScore({
        player_name: name,
        character,
        continues: Math.floor(continues),
        time_ms: Math.floor(timeMs / 1000) * 1000,
        score: Math.floor(score),
      })
      saveOk = true
    } catch (error) {
      console.error('[Leaderboard] Erro ao salvar:', error)
      this.statusText?.setText('ERROR SAVING SCORE').setColor('#ff6666')
      await new Promise((resolve) => this.time.delayedCall(3000, resolve))
    }

    if (saveOk) {
      this.statusText?.setText('SAVED').setColor('#44ff88')
      await new Promise((resolve) => this.time.delayedCall(420, resolve))
    }

    this.registry.set('lastEntryName', name)
    this.registry.set('lastEntryContinues', continues)
    this.registry.set('lastEntryTime', timeMs)
    this.registry.set('lastEntryScore', score)

    await this.showSharePrompt(name, score)

    this.registry.remove('youWinScore')
    this.registry.remove('youWinKills')
    this.registry.remove('youWinTime')
    this.registry.remove('continueFromWave')
    this.registry.remove('gameOverWave')
    this.registry.remove('gameOverScore')
    this.registry.remove('gameOverTime')
    this.registry.remove('continueCount')
    this.registry.remove('totalWaves')
    this.registry.remove('selectedChar')

    this.cameras.main.fadeOut(360, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('TopTenScene'))
  }

  private showSharePrompt(playerName: string, score: number): Promise<void> {
    return new Promise((resolve) => {
      const shareBtn = this.add.text(760, 930, 'SHARE', {
        fontSize: '18px',
        color: '#000000',
        fontFamily: '"Press Start 2P", monospace',
        backgroundColor: '#f3c204',
        padding: { x: 20, y: 10 },
      }).setOrigin(0.5).setDepth(60).setInteractive({ useHandCursor: true })

      const skipBtn = this.add.text(1010, 930, 'SKIP', {
        fontSize: '16px',
        color: '#e4e4e4',
        fontFamily: '"Press Start 2P", monospace',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(60).setInteractive({ useHandCursor: true })

      this.statusText?.setText('SHARE YOUR VICTORY?').setColor('#f3c204').setAlpha(1)

      const cleanup = () => {
        shareBtn.destroy()
        skipBtn.destroy()
      }

      shareBtn.on('pointerdown', async () => {
        haptics.light()
        cleanup()
        try {
          await nativeShare.shareVictory(playerName, score)
        } catch {
          // usuario pode fechar o dialogo nativo sem compartilhar
        }
        resolve()
      })

      skipBtn.on('pointerdown', () => {
        haptics.selection()
        cleanup()
        resolve()
      })

      this.time.delayedCall(8000, () => {
        if (shareBtn.active) {
          cleanup()
          resolve()
        }
      })
    })
  }

  private handleShutdown() {
    this.scale.off('resize', this.onScaleResize)
    this.input.keyboard?.off('keydown-ENTER')
    this.input.keyboard?.off('keydown-SPACE')
    this.removeNameInput()
    this.creditsTween?.remove()
    this.creditsTween = null
    if (this.hero) {
      this.hero.destroy()
      this.hero = null
    }
    this.creditsContainer = null
  }
}
