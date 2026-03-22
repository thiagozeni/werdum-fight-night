import Phaser from 'phaser'

const KEY = 'werdumFightHS'

export function getHighScore(registry: Phaser.Data.DataManager): number {
  try {
    const stored = parseInt(localStorage.getItem(KEY) ?? '0') || 0
    return Math.max(stored, registry.get('highScore') ?? 0)
  } catch (_) { return 0 }
}

export function saveHighScore(score: number, registry: Phaser.Data.DataManager): void {
  const best = getHighScore(registry)
  if (score > best) {
    try { localStorage.setItem(KEY, String(score)) } catch (_) {}
    registry.set('highScore', score)
  }
}
