/**
 * Gera sons 8-bit em tempo real via Web Audio API.
 * Sem arquivos de áudio — tudo sintetizado.
 */
export class SoundManager {
  private ctx: AudioContext | null = null
  private muted = false

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return this.ctx
  }

  setMuted(v: boolean) { this.muted = v }
  toggleMute() { this.muted = !this.muted; return this.muted }

  private tone(freq: number, type: OscillatorType, dur: number, vol = 0.25, delay = 0) {
    if (this.muted) return
    try {
      const ctx = this.getCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
      gain.gain.setValueAtTime(0.001, ctx.currentTime + delay)
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur)
      osc.start(ctx.currentTime + delay)
      osc.stop(ctx.currentTime + delay + dur + 0.05)
    } catch (_) { /* autoplay bloqueado — sem crash */ }
  }

  private noise(dur: number, cutoff: number, vol = 0.3) {
    if (this.muted) return
    try {
      const ctx = this.getCtx()
      const sr = ctx.sampleRate
      const buf = ctx.createBuffer(1, Math.ceil(sr * dur), sr)
      const data = buf.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
      const src = ctx.createBufferSource()
      src.buffer = buf
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = cutoff
      filter.Q.value = 1.5
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(vol, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
      src.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      src.start()
    } catch (_) { /* sem crash */ }
  }

  // ── Sons do jogo ─────────────────────────────────────────

  punch()        { this.noise(0.07, 1400, 0.45) }
  kick()         { this.noise(0.10, 450, 0.55) }
  hitEnemy()     { this.noise(0.05, 1000, 0.35) }
  block()        { this.noise(0.08, 600, 0.3) }

  enemyDeath() {
    this.tone(280, 'square', 0.06, 0.3)
    this.tone(180, 'square', 0.1,  0.3, 0.07)
  }

  playerHit()    { this.noise(0.14, 320, 0.65) }
  playerKnockdown() {
    this.tone(250, 'sawtooth', 0.05, 0.3)
    this.tone(150, 'sawtooth', 0.12, 0.3, 0.06)
  }

  jump()         { this.tone(500, 'square', 0.06, 0.15); this.tone(650, 'square', 0.06, 0.15, 0.05) }
  land()         { this.noise(0.06, 300, 0.25) }

  waveStart(isBoss = false) {
    if (isBoss) {
      [200, 160, 120, 300].forEach((f, i) => this.tone(f, 'sawtooth', 0.18, 0.35, i * 0.12))
    } else {
      [400, 550, 700].forEach((f, i) => this.tone(f, 'square', 0.1, 0.2, i * 0.09))
    }
  }

  waveComplete() {
    [500, 600, 700, 600, 800].forEach((f, i) => this.tone(f, 'triangle', 0.1, 0.2, i * 0.08))
  }

  gameOver() {
    [500, 420, 340, 260, 200, 160].forEach((f, i) => this.tone(f, 'square', 0.18, 0.28, i * 0.16))
  }

  victory() {
    [300, 400, 500, 400, 600, 500, 700, 600, 900].forEach((f, i) =>
      this.tone(f, 'square', 0.12, 0.22, i * 0.09))
  }

  select()       { this.tone(500, 'square', 0.07, 0.2); this.tone(700, 'square', 0.07, 0.2, 0.08) }
  hover()        { this.tone(400, 'square', 0.04, 0.1) }
  pause()        { this.tone(300, 'triangle', 0.1, 0.2) }
  unpause()      { this.tone(400, 'triangle', 0.1, 0.2) }
}

// Instância global
export const sound = new SoundManager()
