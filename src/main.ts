import Phaser from 'phaser'
import { BootScene }                from './scenes/BootScene'
import { TitleScene }               from './scenes/TitleScene'
import { HowToPlayScene }           from './scenes/HowToPlayScene'
import { SelectScene }              from './scenes/SelectScene'
import { GameScene }                from './scenes/GameScene'
import { GameOverContinueScene }    from './scenes/GameOverContinueScene'
import { YouWinScene }              from './scenes/YouWinScene'
import { TopTenScene }              from './scenes/TopTenScene'
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
  scene: [BootScene, TitleScene, HowToPlayScene, SelectScene, GameScene, GameOverContinueScene, YouWinScene, TopTenScene, AnimTestScene],
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
}

document.fonts.ready.then(() => new Phaser.Game(config))
