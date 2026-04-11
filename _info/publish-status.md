# 3 Contra Todos — Status de Publicação

> Última atualização: 2026-04-10

## Visão Geral

**3 Contra Todos** é um beat'em up arcade inspirado nos clássicos dos fliperamas, desenvolvido com **Phaser 3.87** + **Capacitor 8.3** (híbrido web → nativo). O jogo também roda como PWA na web.

- **Bundle ID**: `com.werdumfight.app`
- **Versão atual (código-fonte)**: `package.json` → 0.1.0

---

## Apple App Store (iOS)

| Campo | Valor |
|---|---|
| **App Store ID** | 6761487568 |
| **Status** | 1.0.1 — Aguardando revisão da Apple |
| **Versão publicada** | 1.0 (Pronto para distribuição) |
| **Versão em revisão** | 1.0.1 (build 5) |
| **MARKETING_VERSION** | 1.0.1 |
| **CFBundleVersion (build)** | 5 |
| **contentInset** | `never` |
| **Data do envio para revisão** | 2026-04-10 |

### Histórico de versões iOS

- **1.0 (build 4)** — Primeira versão publicada na App Store.
- **1.0.1 (build 5)** — Correções pós-lançamento, enviada para revisão em 10/04/2026.

### Correções na versão 1.0.1

1. **Banner PWA removido no app nativo** — O banner "Adicionar à tela de início" aparecia dentro do app iOS. Adicionada detecção via `Capacitor.isNativePlatform()` no `index.html` para nunca mostrar o banner no contexto nativo.
2. **Fullscreen API desativada no app nativo** — O alerta "capacitor://localhost is in full screen" aparecia por conta de chamadas à Fullscreen API do browser dentro do WKWebView. Adicionada verificação Capacitor em `index.html` e `TitleScene.ts` para pular essas chamadas no app nativo.
3. **Vídeo do loader re-codificado** — O vídeo `.m4v` original (1.2 MB, com trilha de áudio) não rodava no WKWebView. Convertido para `.mp4` (330 KB) com H.264 baseline profile, sem áudio, e flag `faststart` via ffmpeg. Adicionado fallback em caso de erro de reprodução.
4. **Barras brancas nas bordas corrigidas** — O app não ocupava a tela cheia por conta do `contentInset: 'always'` no `capacitor.config.ts`. Alterado para `'never'`.
5. **Setas de voltar corrigidas** — O caractere Unicode `←` (U+2190) renderizava como emoji no iOS. Substituído por `<` (ASCII) em `HowToPlayScene.ts`, `SelectScene.ts`, `TopTenScene.ts` e `AnimTestScene.ts`.

### Arquivos modificados (1.0.1)

- `index.html` — Detecção Capacitor para banner PWA, fullscreen e vídeo loader
- `src/scenes/TitleScene.ts` — Verificação Capacitor em `tryFullscreen()`
- `src/scenes/HowToPlayScene.ts` — `← VOLTAR` → `< VOLTAR`
- `src/scenes/SelectScene.ts` — `← VOLTAR` → `< VOLTAR`
- `src/scenes/TopTenScene.ts` — `← VOLTAR` → `< VOLTAR`
- `src/scenes/AnimTestScene.ts` — `← VOLTAR` → `< VOLTAR`
- `capacitor.config.ts` — `contentInset: 'never'`
- `public/videos/loader.mp4` — Novo arquivo de vídeo otimizado
- `ios/App/App/Info.plist` — Build 4 → 5
- `ios/App/App.xcodeproj/project.pbxproj` — MARKETING_VERSION 1.0 → 1.0.1

### Nota importante sobre as alterações

As correções foram feitas no código-fonte web compartilhado (não em arquivos específicos do iOS). Todas usam detecção em runtime via `Capacitor.isNativePlatform()`, o que significa que a versão web/PWA e a versão Android não são afetadas negativamente — os comportamentos web (banner PWA, Fullscreen API) continuam funcionando normalmente fora do contexto nativo.

---

## Google Play Store (Android)

| Campo | Valor |
|---|---|
| **Status** | Ainda não publicado |
| **versionCode** | 1 |
| **versionName** | 1.0 |
| **Keystore** | Configurada (`android/app/keystore/3contra.keystore`, alias `3contra-todos`) |
| **google-services.json** | Ausente (notificações push não funcionarão sem ele) |
| **Orientação** | Landscape + Modo imersivo |

### Preparação para publicação Android

- Build de release com signing está configurado no Gradle.
- Assets para a loja já existem em `/store-assets/`:
  - `play-store-icon.png`
  - `feature-graphic.png`
  - `app-store-icon.png`
- Não há evidência de submissão ao Google Play Console até o momento.

### Próximos passos para Google Play

1. Adicionar `google-services.json` se quiser notificações push.
2. Gerar o AAB de release (`./gradlew bundleRelease`).
3. Criar a listagem no Google Play Console (descrição, screenshots, classificação etária).
4. Fazer upload do AAB e submeter para revisão.

---

## Links úteis

- App Store Connect: `https://appstoreconnect.apple.com/apps/6761487568`
- Política de privacidade: rota `/privacy` no app web

---

#3ContraTodos #gamedev #capacitor #phaser #ios #android
