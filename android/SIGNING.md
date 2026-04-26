# Assinatura Android — setup

A keystore antiga foi **comprometida** (commitada com senha em claro). Use o procedimento abaixo para gerar e configurar uma nova.

## 1. Gerar nova keystore

Rode fora do repo (ex.: `~/.android-keystores/`):

```bash
mkdir -p ~/.android-keystores
cd ~/.android-keystores
keytool -genkeypair -v \
  -keystore 3contra-novo.keystore \
  -alias 3contra-todos \
  -keyalg RSA -keysize 2048 -validity 10000
```

Anote a senha em um gerenciador (1Password, Bitwarden). Se perder, **não há recuperação** — você só consegue publicar atualizações via "upload key replacement" da Google Play Console (~48h).

## 2. Configurar localmente

Crie `android/keystore.properties` (gitignored) baseado no `.example`:

```properties
storeFile=/Users/SEU_USER/.android-keystores/3contra-novo.keystore
storePassword=SUA_SENHA
keyAlias=3contra-todos
keyPassword=SUA_SENHA
```

Ou, em CI, use variáveis de ambiente:

- `ANDROID_KEYSTORE_PATH`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

## 3. Build assinado

```bash
cd android
./gradlew assembleRelease   # APK
./gradlew bundleRelease     # AAB (Play Store)
```

Se nem `keystore.properties` nem env vars estiverem presentes, o build release sai não-assinado (útil pra debug).

## 4. App já publicado na Play Store?

Se sim, abra ticket no Google Play Console: **Setup → App integrity → Upload key → Request upload key reset**. Anexe a nova keystore (gerada acima). Aprovação em ~48h.

## 5. NUNCA

- Commitar `*.keystore`, `*.jks`, `keystore.properties`, `gradle.properties` com senha
- Compartilhar senha em Slack/email/WhatsApp
- Colocar a keystore dentro do repo (mesmo gitignored — alguém esquece)
