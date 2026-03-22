import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    // Barra de progresso simples
    const { width, height } = this.scale
    const bar = this.add.rectangle(width / 2, height / 2, 4, 20, 0xffffff)
    this.load.on('progress', (v: number) => bar.setDisplaySize(v * 400, 20))

    // Cenários
    this.load.image('arena',          'imgs/cenario/real.png')
    this.load.image('sem-crowd',      'imgs/cenario/sem-crowd.png')
    this.load.image('bg-cachorradas', 'imgs/cenario/cachorradas.png')

    // Assets da tela de título
    this.load.image('logo',            'imgs/elementos/logo.png')
    this.load.image('good-guys',       'imgs/elementos/good-guys.png')
    this.load.image('bad-guys',        'imgs/elementos/bad-guys.png')
    this.load.image('good-guys-loose', 'imgs/elementos/good-guys-loose.png')
    this.load.image('good-guys-win',   'imgs/elementos/good-guys-win.png')

    // Personagens jogáveis (imagens estáticas — usadas na tela de seleção)
    this.load.image('werdum',    'imgs/personagens/werdum.png')
    this.load.image('dida',      'imgs/personagens/dida.png')
    this.load.image('thor',      'imgs/personagens/thor.png')

    // Side-views para a tela de seleção
    this.load.image('werdum-sv', 'imgs/personagens/werdum_sideview.png')
    this.load.image('dida-sv',   'imgs/personagens/dida-sideview.png')
    this.load.image('thor-sv',   'imgs/personagens/thor-sideview.png')

    // Spritesheets animados do Werdum
    this.load.spritesheet('werdum-idle-sheet',      'sprites/werdum/werdum-idle-sheet.png',      { frameWidth: 160, frameHeight: 240, endFrame: 7  })
    this.load.spritesheet('werdum-walk-sheet',       'sprites/werdum/werdum-walk-sheet.png',       { frameWidth: 192, frameHeight: 260, endFrame: 35 })
    this.load.spritesheet('werdum-punch-sheet',     'sprites/werdum/werdum-punch-sheet.png',     { frameWidth: 320, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('werdum-kick-sheet',      'sprites/werdum/werdum-kick-sheet.png',      { frameWidth: 384, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('werdum-hit-sheet',       'sprites/werdum/werdum-hit-sheet.png',       { frameWidth: 224, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('werdum-block-sheet',     'sprites/werdum/werdum-block-sheet.png',     { frameWidth: 160, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('werdum-knockdown-sheet', 'sprites/werdum/werdum-knockdown-sheet.png', { frameWidth: 160, frameHeight: 240, endFrame: 35 })

    // Spritesheets animados do Dida
    this.load.spritesheet('dida-idle-sheet',      'sprites/dida/dida-idle-sheet.png',      { frameWidth: 128, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('dida-walk-sheet',      'sprites/dida/dida-walk-sheet.png',      { frameWidth: 160, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('dida-punch-sheet',     'sprites/dida/dida-punch-sheet.png',     { frameWidth: 160, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('dida-kick-sheet',      'sprites/dida/dida-kick-sheet.png',      { frameWidth: 192, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('dida-hit-sheet',       'sprites/dida/dida-hit-sheet.png',       { frameWidth: 224, frameHeight: 240, endFrame: 15 })
    this.load.spritesheet('dida-block-sheet',     'sprites/dida/dida-block-sheet.png',     { frameWidth: 96,  frameHeight: 240, endFrame: 8  })
    this.load.spritesheet('dida-knockdown-sheet', 'sprites/dida/dida-knockdown-sheet.png', { frameWidth: 160, frameHeight: 240, endFrame: 35 })

    // Personagem protegido
    this.load.image('wand',    'imgs/personagens/wand.png')
    this.load.image('wand-ko', 'imgs/personagens/wand-knockedout.png')

    // Spritesheets animados — bad-guy1
    this.load.spritesheet('bad-guy1-idle-sheet',    'sprites/enemies/bad-guy1-idle-sheet.png',    { frameWidth: 160, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('bad-guy1-walk-sheet',    'sprites/enemies/bad-guy1-walk-sheet.png',    { frameWidth: 160, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('bad-guy1-punch-sheet',   'sprites/enemies/bad-guy1-punch-sheet.png',   { frameWidth: 192, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('bad-guy1-kick-sheet',    'sprites/enemies/bad-guy1-kick-sheet.png',    { frameWidth: 224, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('bad-guy1-hit-sheet',       'sprites/enemies/bad-guy1-hit-sheet.png',       { frameWidth: 160, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('bad-guy1-knockdown-sheet', 'sprites/enemies/bad-guy1-knockdown-sheet.png', { frameWidth: 160, frameHeight: 240, endFrame: 35 })

    // Spritesheets animados — bad-guy2
    this.load.spritesheet('bad-guy2-idle-sheet',    'sprites/enemies/bad-guy2-idle-sheet.png',    { frameWidth: 160, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('bad-guy2-walk-sheet',    'sprites/enemies/bad-guy2-walk-sheet.png',    { frameWidth: 160, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('bad-guy2-punch-sheet',   'sprites/enemies/bad-guy2-punch-sheet.png',   { frameWidth: 192, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('bad-guy2-kick-sheet',    'sprites/enemies/bad-guy2-kick-sheet.png',    { frameWidth: 224, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('bad-guy2-hit-sheet',       'sprites/enemies/bad-guy2-hit-sheet.png',       { frameWidth: 160, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('bad-guy2-knockdown-sheet', 'sprites/enemies/bad-guy2-knockdown-sheet.png', { frameWidth: 160, frameHeight: 240, endFrame: 35 })

    // Spritesheets animados — bad-guy3
    this.load.spritesheet('bad-guy3-idle-sheet',      'sprites/enemies/bad-guy3-idle-sheet.png',      { frameWidth: 160, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('bad-guy3-walk-sheet',      'sprites/enemies/bad-guy3-walk-sheet.png',      { frameWidth: 160, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('bad-guy3-punch-sheet',     'sprites/enemies/bad-guy3-punch-sheet.png',     { frameWidth: 192, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('bad-guy3-kick-sheet',      'sprites/enemies/bad-guy3-kick-sheet.png',      { frameWidth: 224, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('bad-guy3-hit-sheet',       'sprites/enemies/bad-guy3-hit-sheet.png',       { frameWidth: 160, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('bad-guy3-knockdown-sheet', 'sprites/enemies/bad-guy3-knockdown-sheet.png', { frameWidth: 160, frameHeight: 240, endFrame: 35 })

    // Spritesheets animados — bad-guy-fat
    this.load.spritesheet('bad-guy-fat-idle-sheet',      'sprites/enemies/bad-guy-fat-idle-sheet.png',      { frameWidth: 160, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('bad-guy-fat-walk-sheet',      'sprites/enemies/bad-guy-fat-walk-sheet.png',      { frameWidth: 160, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('bad-guy-fat-punch-sheet',     'sprites/enemies/bad-guy-fat-punch-sheet.png',     { frameWidth: 192, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('bad-guy-fat-kick-sheet',      'sprites/enemies/bad-guy-fat-kick-sheet.png',      { frameWidth: 224, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('bad-guy-fat-hit-sheet',       'sprites/enemies/bad-guy-fat-hit-sheet.png',       { frameWidth: 160, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('bad-guy-fat-knockdown-sheet', 'sprites/enemies/bad-guy-fat-knockdown-sheet.png', { frameWidth: 160, frameHeight: 240, endFrame: 35 })

    // Spritesheets animados — bad-guy-strong
    this.load.spritesheet('bad-guy-strong-idle-sheet',      'sprites/enemies/bad-guy-strong-idle-sheet.png',      { frameWidth: 160, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('bad-guy-strong-walk-sheet',      'sprites/enemies/bad-guy-strong-walk-sheet.png',      { frameWidth: 160, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('bad-guy-strong-punch-sheet',     'sprites/enemies/bad-guy-strong-punch-sheet.png',     { frameWidth: 192, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('bad-guy-strong-kick-sheet',      'sprites/enemies/bad-guy-strong-kick-sheet.png',      { frameWidth: 224, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('bad-guy-strong-hit-sheet',       'sprites/enemies/bad-guy-strong-hit-sheet.png',       { frameWidth: 160, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('bad-guy-strong-knockdown-sheet', 'sprites/enemies/bad-guy-strong-knockdown-sheet.png', { frameWidth: 160, frameHeight: 240, endFrame: 35 })

    // Spritesheets animados — bad-guy-chair
    this.load.spritesheet('bad-guy-chair-idle-sheet',      'sprites/enemies/bad-guy-chair-idle-sheet.png',      { frameWidth: 160, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('bad-guy-chair-walk-sheet',      'sprites/enemies/bad-guy-chair-walk-sheet.png',      { frameWidth: 160, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('bad-guy-chair-punch-sheet',     'sprites/enemies/bad-guy-chair-punch-sheet.png',     { frameWidth: 320, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('bad-guy-chair-kick-sheet',      'sprites/enemies/bad-guy-chair-kick-sheet.png',      { frameWidth: 256, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('bad-guy-chair-knockdown-sheet', 'sprites/enemies/bad-guy-chair-knockdown-sheet.png', { frameWidth: 224, frameHeight: 240, endFrame: 24 })

    // Spritesheets animados — popo
    this.load.spritesheet('popo-idle-sheet',  'sprites/bosses/popo-idle-sheet.png',  { frameWidth: 160, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('popo-walk-sheet',  'sprites/bosses/popo-walk-sheet.png',  { frameWidth: 160, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('popo-punch-sheet', 'sprites/bosses/popo-punch-sheet.png', { frameWidth: 192, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('popo-kick-sheet',  'sprites/bosses/popo-kick-sheet.png',  { frameWidth: 224, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('popo-hit-sheet',       'sprites/bosses/popo-hit-sheet.png',       { frameWidth: 160, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('popo-knockdown-sheet', 'sprites/bosses/popo-knockdown-sheet.png', { frameWidth: 160, frameHeight: 240, endFrame: 35 })

    // Spritesheets animados — popo-son
    this.load.spritesheet('popo-son-idle-sheet',  'sprites/bosses/popo-son-idle-sheet.png',  { frameWidth: 160, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('popo-son-walk-sheet',  'sprites/bosses/popo-son-walk-sheet.png',  { frameWidth: 160, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('popo-son-punch-sheet', 'sprites/bosses/popo-son-punch-sheet.png', { frameWidth: 192, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('popo-son-kick-sheet',  'sprites/bosses/popo-son-kick-sheet.png',  { frameWidth: 224, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('popo-son-hit-sheet',       'sprites/bosses/popo-son-hit-sheet.png',       { frameWidth: 160, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('popo-son-knockdown-sheet', 'sprites/bosses/popo-son-knockdown-sheet.png', { frameWidth: 160, frameHeight: 240, endFrame: 35 })

    // Spritesheets animados — popo-coach
    this.load.spritesheet('popo-coach-idle-sheet',  'sprites/bosses/popo-coach-idle-sheet.png',  { frameWidth: 160, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('popo-coach-walk-sheet',  'sprites/bosses/popo-coach-walk-sheet.png',  { frameWidth: 160, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('popo-coach-punch-sheet', 'sprites/bosses/popo-coach-punch-sheet.png', { frameWidth: 192, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('popo-coach-kick-sheet',  'sprites/bosses/popo-coach-kick-sheet.png',  { frameWidth: 224, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('popo-coach-hit-sheet',       'sprites/bosses/popo-coach-hit-sheet.png',       { frameWidth: 160, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('popo-coach-knockdown-sheet', 'sprites/bosses/popo-coach-knockdown-sheet.png', { frameWidth: 160, frameHeight: 240, endFrame: 35 })

    // Spritesheets animados — Thor
    this.load.spritesheet('thor-idle-sheet',      'sprites/thor/thor-idle-sheet.png',      { frameWidth: 128, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('thor-walk-sheet',      'sprites/thor/thor-walk-sheet.png',      { frameWidth: 160, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('thor-punch-sheet',     'sprites/thor/thor-punch-sheet.png',     { frameWidth: 192, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('thor-kick-sheet',      'sprites/thor/thor-kick-sheet.png',      { frameWidth: 224, frameHeight: 240, endFrame: 24 })
    this.load.spritesheet('thor-hit-sheet',       'sprites/thor/thor-hit-sheet.png',       { frameWidth: 224, frameHeight: 240, endFrame: 35 })
    this.load.spritesheet('thor-block-sheet',     'sprites/thor/thor-block-sheet.png',     { frameWidth: 160, frameHeight: 240, endFrame: 15 })
    this.load.spritesheet('thor-knockdown-sheet', 'sprites/thor/thor-knockdown-sheet.png', { frameWidth: 160, frameHeight: 240, endFrame: 35 })

    // HUD elements
    this.load.image('hud-left',  'imgs/elementos/hud/hud-left.png')
    this.load.image('hud-right', 'imgs/elementos/hud/hud-right.png')

    // Vídeo de intro
    this.load.video('bg-intro', 'videos/Back-intro-1080.mp4', true)
  }

  create() {
    // Gerar textura de partícula em tempo de execução
    const gfx = this.add.graphics()
    gfx.fillStyle(0xffffff, 1)
    gfx.fillCircle(4, 4, 4)
    gfx.generateTexture('spark', 8, 8)
    gfx.destroy()

    this.cameras.main.fadeIn(300, 0, 0, 0)
    this.cameras.main.once('camerafadeincomplete', () => {
      this.scene.start('TitleScene')
    })
  }
}
