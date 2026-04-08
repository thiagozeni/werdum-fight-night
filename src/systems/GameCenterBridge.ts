/**
 * GameCenterBridge — wrapper para o plugin nativo GameCenter (iOS apenas).
 * Em qualquer outra plataforma, todos os métodos viram no-op.
 */
import { Capacitor, registerPlugin } from '@capacitor/core'

interface GameCenterPlugin {
  signIn(): Promise<{ authenticated: boolean; displayName?: string; alias?: string }>
  isAuthenticated(): Promise<{ authenticated: boolean; displayName?: string }>
  submitScore(opts: { leaderboardId: string; score: number }): Promise<{ success: boolean }>
  showLeaderboard(opts: { leaderboardId?: string }): Promise<void>
  unlockAchievement(opts: { achievementId: string; percentComplete?: number }): Promise<{ success: boolean }>
  showAchievements(): Promise<void>
}

const GameCenter = registerPlugin<GameCenterPlugin>('GameCenter')

const isIOSNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios'

// IDs configurados no App Store Connect
export const GC_LEADERBOARD_GLOBAL = 'contratodos.leaderboard.global'

export const GC_ACHIEVEMENTS = {
  firstVictory:  'contratodos.achievement.first_victory',
  noContinues:   'contratodos.achievement.no_continues',
  speedRun:      'contratodos.achievement.speed_run',
  allChars:      'contratodos.achievement.all_chars',
  bossCoach:     'contratodos.achievement.boss_coach',
  bossSmoKing:   'contratodos.achievement.boss_smo_king',
  bossCoco:      'contratodos.achievement.boss_coco',
  combo10:       'contratodos.achievement.combo_10',
  combo20:       'contratodos.achievement.combo_20',
  flawlessWave:  'contratodos.achievement.flawless_wave',
} as const

export const gameCenter = {
  isAvailable(): boolean {
    return isIOSNative
  },

  async signIn(): Promise<boolean> {
    if (!isIOSNative) return false
    try {
      const r = await GameCenter.signIn()
      return r.authenticated
    } catch (e) {
      console.warn('[GameCenter] signIn falhou:', e)
      return false
    }
  },

  async isAuthenticated(): Promise<boolean> {
    if (!isIOSNative) return false
    try {
      const r = await GameCenter.isAuthenticated()
      return r.authenticated
    } catch {
      return false
    }
  },

  async submitScore(score: number): Promise<void> {
    if (!isIOSNative) return
    try {
      await GameCenter.submitScore({ leaderboardId: GC_LEADERBOARD_GLOBAL, score })
    } catch (e) {
      console.warn('[GameCenter] submitScore falhou:', e)
    }
  },

  async showLeaderboard(): Promise<void> {
    if (!isIOSNative) throw new Error('Game Center disponível apenas em iOS')
    // Garante autenticação antes de tentar abrir a UI nativa
    const authed = await this.isAuthenticated()
    if (!authed) {
      const ok = await this.signIn()
      if (!ok) throw new Error('Não foi possível autenticar no Game Center')
    }
    await GameCenter.showLeaderboard({ leaderboardId: GC_LEADERBOARD_GLOBAL })
  },

  async unlock(achievementId: string): Promise<void> {
    if (!isIOSNative) return
    try {
      await GameCenter.unlockAchievement({ achievementId, percentComplete: 100 })
    } catch (e) {
      console.warn('[GameCenter] unlock falhou:', achievementId, e)
    }
  },

  async showAchievements(): Promise<void> {
    if (!isIOSNative) return
    try {
      await GameCenter.showAchievements()
    } catch (e) {
      console.warn('[GameCenter] showAchievements falhou:', e)
    }
  },
}

// ─── Helpers de progresso local (localStorage) ─────────────────────────

const LS_KEY_CHARS_WON = 'werdum.charsWon'

export const localProgress = {
  recordVictory(character: string): string[] {
    const current = this.getCharsWon()
    if (!current.includes(character)) current.push(character)
    try { localStorage.setItem(LS_KEY_CHARS_WON, JSON.stringify(current)) } catch { /* noop */ }
    return current
  },

  getCharsWon(): string[] {
    try {
      const raw = localStorage.getItem(LS_KEY_CHARS_WON)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  },

  hasAllChars(): boolean {
    const chars = this.getCharsWon()
    return ['werdum', 'dida', 'thor'].every(c => chars.includes(c))
  },
}
