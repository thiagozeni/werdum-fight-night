import Phaser from 'phaser'

export function spawnDamageNumber(scene: Phaser.Scene, x: number, y: number, amount: number) {
  const big    = amount >= 25
  const size   = big ? '32px' : amount >= 15 ? '24px' : '18px'
  const color  = big ? '#ff3300' : amount >= 15 ? '#ff8800' : '#ffdd00'
  const travel = big ? 110 : 80

  const text = scene.add.text(x, y, `-${amount}`, {
    fontSize: size,
    color,
    fontFamily: 'monospace',
    stroke: '#000000',
    strokeThickness: big ? 5 : 3,
  }).setOrigin(0.5).setDepth(150).setScale(big ? 1.4 : 1.1)

  scene.tweens.add({
    targets: text,
    y: y - travel,
    alpha: 0,
    scale: 1,
    duration: big ? 900 : 650,
    ease: 'Power2',
    onComplete: () => text.destroy(),
  })
}
