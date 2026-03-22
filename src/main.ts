import Phaser from 'phaser'
import { BootScene }                from './scenes/BootScene'
import { TitleScene }               from './scenes/TitleScene'
import { SelectScene }              from './scenes/SelectScene'
import { GameScene }                from './scenes/GameScene'
import { GameOverContinueScene }    from './scenes/GameOverContinueScene'
import { YouWinScene }              from './scenes/YouWinScene'
import { AnimTestScene }            from './scenes/AnimTestScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-wrap',
  width: 1920,
  height: 1080,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, TitleScene, SelectScene, GameScene, GameOverContinueScene, YouWinScene, AnimTestScene],
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
}

new Phaser.Game(config)
