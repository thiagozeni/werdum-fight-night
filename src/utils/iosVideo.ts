/**
 * iosVideo — utilitário para garantir que vídeos tocam em iOS WKWebView (Capacitor).
 *
 * iOS é rígido com autoplay: mesmo com `noAudio: true` no Phaser loader, o
 * elemento <video> precisa ter os atributos `playsinline`, `webkit-playsinline`
 * e `muted` setados ANTES do `.play()`. Caso contrário, na primeira execução
 * do app o vídeo não inicia até que o usuário interaja com a tela.
 *
 * Uso:
 *   const bg = this.add.video(x, y, 'key')
 *   prepareIOSVideo(bg)
 *   bg.play(true)
 */
import Phaser from 'phaser'

function applyAttrs(el: HTMLVideoElement) {
  try {
    el.muted = true
    el.defaultMuted = true
    el.playsInline = true
    el.setAttribute('playsinline', 'true')
    el.setAttribute('webkit-playsinline', 'true')
    el.setAttribute('muted', 'true')
    el.autoplay = true
  } catch { /* noop */ }
}

/**
 * Garante que o elemento <video> interno tenha os atributos corretos para iOS.
 * Pode ser chamado antes ou depois do `play()` — também escuta o evento `created`
 * que dispara quando o Phaser cria o elemento de fato.
 */
export function prepareIOSVideo(video: Phaser.GameObjects.Video) {
  const tryApply = () => {
    const el = (video as unknown as { video: HTMLVideoElement | undefined }).video
    if (el) applyAttrs(el)
  }

  tryApply()
  video.on('created', tryApply)
  video.on('play', tryApply)

  // Fallback: se o vídeo não estiver tocando depois de 500ms (porque o WebView
  // ainda não recebeu user gesture), engata um listener no primeiro pointerdown
  // global da scene que força um novo play().
  video.scene.time.delayedCall(500, () => {
    const el = (video as unknown as { video: HTMLVideoElement | undefined }).video
    if (!el || el.paused) {
      const forcePlay = () => {
        applyAttrs(el ?? (video as unknown as { video: HTMLVideoElement }).video)
        try { video.play(true) } catch { /* noop */ }
      }
      video.scene.input.once('pointerdown', forcePlay)
    }
  })
}
