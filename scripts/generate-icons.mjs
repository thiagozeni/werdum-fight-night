import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOURCE = join(ROOT, 'store-assets/_source-icon-master.png');

// Source master já vem 1024×1024 com fundo preto e logo enquadrado — só faz resize
async function iconWithBg(size) {
  return sharp(SOURCE)
    .resize(size, size, { fit: 'cover' })
    .flatten({ background: { r: 0, g: 0, b: 0 } })
    .png();
}

// Splash landscape: 2732×2048 (cobre todos os iPads e iPhones em landscape)
async function splashWithBg(width, height) {
  const logoSize = Math.round(Math.min(width, height) * 0.5);
  return sharp({
    create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
  })
    .composite([
      {
        input: await sharp(SOURCE)
          .resize(logoSize, Math.round(logoSize * 0.6), { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toBuffer(),
        gravity: 'centre',
      },
    ])
    .png();
}

function mkdir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

// ──────────────────────────────────────────────
// iOS Icons (AppIcon.appiconset)
// ──────────────────────────────────────────────
const IOS_ICON_DIR = join(ROOT, 'ios/App/App/Assets.xcassets/AppIcon.appiconset');
mkdir(IOS_ICON_DIR);

const iosIcons = [
  { name: 'Icon-20@2x.png',   size: 40  },
  { name: 'Icon-20@3x.png',   size: 60  },
  { name: 'Icon-29.png',      size: 29  },
  { name: 'Icon-29@2x.png',   size: 58  },
  { name: 'Icon-29@3x.png',   size: 87  },
  { name: 'Icon-40.png',      size: 40  },
  { name: 'Icon-40@2x.png',   size: 80  },
  { name: 'Icon-40@3x.png',   size: 120 },
  { name: 'Icon-60@2x.png',   size: 120 },
  { name: 'Icon-60@3x.png',   size: 180 },
  { name: 'Icon-76.png',      size: 76  },
  { name: 'Icon-76@2x.png',   size: 152 },
  { name: 'Icon-83.5@2x.png', size: 167 },
  { name: 'Icon-1024.png',    size: 1024 },
];

console.log('Gerando ícones iOS...');
for (const { name, size } of iosIcons) {
  await (await iconWithBg(size)).toFile(join(IOS_ICON_DIR, name));
  console.log(`  ✓ ${name} (${size}×${size})`);
}

// Contents.json para o AppIcon
import { writeFileSync } from 'fs';
const iosContents = {
  images: [
    { idiom: 'iphone', scale: '2x', size: '20x20',  filename: 'Icon-20@2x.png'   },
    { idiom: 'iphone', scale: '3x', size: '20x20',  filename: 'Icon-20@3x.png'   },
    { idiom: 'iphone', scale: '2x', size: '29x29',  filename: 'Icon-29@2x.png'   },
    { idiom: 'iphone', scale: '3x', size: '29x29',  filename: 'Icon-29@3x.png'   },
    { idiom: 'iphone', scale: '2x', size: '40x40',  filename: 'Icon-40@2x.png'   },
    { idiom: 'iphone', scale: '3x', size: '40x40',  filename: 'Icon-40@3x.png'   },
    { idiom: 'iphone', scale: '2x', size: '60x60',  filename: 'Icon-60@2x.png'   },
    { idiom: 'iphone', scale: '3x', size: '60x60',  filename: 'Icon-60@3x.png'   },
    { idiom: 'ipad',   scale: '1x', size: '20x20',  filename: 'Icon-20@2x.png'   },
    { idiom: 'ipad',   scale: '2x', size: '20x20',  filename: 'Icon-40@2x.png'   },
    { idiom: 'ipad',   scale: '1x', size: '29x29',  filename: 'Icon-29.png'      },
    { idiom: 'ipad',   scale: '2x', size: '29x29',  filename: 'Icon-29@2x.png'   },
    { idiom: 'ipad',   scale: '1x', size: '40x40',  filename: 'Icon-40.png'      },
    { idiom: 'ipad',   scale: '2x', size: '40x40',  filename: 'Icon-40@2x.png'   },
    { idiom: 'ipad',   scale: '1x', size: '76x76',  filename: 'Icon-76.png'      },
    { idiom: 'ipad',   scale: '2x', size: '76x76',  filename: 'Icon-76@2x.png'   },
    { idiom: 'ipad',   scale: '2x', size: '83.5x83.5', filename: 'Icon-83.5@2x.png' },
    { idiom: 'ios-marketing', scale: '1x', size: '1024x1024', filename: 'Icon-1024.png' },
  ],
  info: { author: 'xcode', version: 1 },
};
writeFileSync(join(IOS_ICON_DIR, 'Contents.json'), JSON.stringify(iosContents, null, 2));
console.log('  ✓ Contents.json');

// ──────────────────────────────────────────────
// iOS Splash (LaunchImage)
// ──────────────────────────────────────────────
const IOS_SPLASH_DIR = join(ROOT, 'ios/App/App/Assets.xcassets/Splash.imageset');
mkdir(IOS_SPLASH_DIR);

const iosSplashes = [
  { name: 'splash.png',    w: 2732, h: 2048 },
  { name: 'splash@2x.png', w: 2732, h: 2048 },
  { name: 'splash@3x.png', w: 2732, h: 2048 },
];

console.log('\nGerando splashes iOS...');
for (const { name, w, h } of iosSplashes) {
  await (await splashWithBg(w, h)).toFile(join(IOS_SPLASH_DIR, name));
  console.log(`  ✓ ${name} (${w}×${h})`);
}

const splashContents = {
  images: [
    { idiom: 'universal', scale: '1x', filename: 'splash.png'    },
    { idiom: 'universal', scale: '2x', filename: 'splash@2x.png' },
    { idiom: 'universal', scale: '3x', filename: 'splash@3x.png' },
  ],
  info: { author: 'xcode', version: 1 },
};
writeFileSync(join(IOS_SPLASH_DIR, 'Contents.json'), JSON.stringify(splashContents, null, 2));
console.log('  ✓ Contents.json');

// ──────────────────────────────────────────────
// Android Icons (mipmap)
// ──────────────────────────────────────────────
const androidDensities = [
  { dir: 'mipmap-mdpi',    size: 48  },
  { dir: 'mipmap-hdpi',    size: 72  },
  { dir: 'mipmap-xhdpi',   size: 96  },
  { dir: 'mipmap-xxhdpi',  size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

console.log('\nGerando ícones Android...');
for (const { dir, size } of androidDensities) {
  const outDir = join(ROOT, `android/app/src/main/res/${dir}`);
  mkdir(outDir);
  await (await iconWithBg(size)).toFile(join(outDir, 'ic_launcher.png'));
  await (await iconWithBg(size)).toFile(join(outDir, 'ic_launcher_round.png'));
  console.log(`  ✓ ${dir}/ic_launcher.png (${size}×${size})`);
}

// Play Store icon 512×512
const PLAY_STORE_DIR = join(ROOT, 'store-assets');
mkdir(PLAY_STORE_DIR);
await (await iconWithBg(512)).toFile(join(PLAY_STORE_DIR, 'play-store-icon.png'));
console.log('  ✓ store-assets/play-store-icon.png (512×512)');

// App Store icon 1024×1024
await (await iconWithBg(1024)).toFile(join(PLAY_STORE_DIR, 'app-store-icon.png'));
console.log('  ✓ store-assets/app-store-icon.png (1024×1024)');

// ──────────────────────────────────────────────
// Android Splash
// ──────────────────────────────────────────────
const androidSplashDensities = [
  { dir: 'drawable',      w: 480,  h: 320  },
  { dir: 'drawable-land-hdpi',  w: 800,  h: 480  },
  { dir: 'drawable-land-xhdpi', w: 1280, h: 720  },
  { dir: 'drawable-land-xxhdpi',w: 1600, h: 960  },
  { dir: 'drawable-land-xxxhdpi',w:1920, h: 1280 },
];

console.log('\nGerando splashes Android...');
for (const { dir, w, h } of androidSplashDensities) {
  const outDir = join(ROOT, `android/app/src/main/res/${dir}`);
  mkdir(outDir);
  await (await splashWithBg(w, h)).toFile(join(outDir, 'splash.png'));
  console.log(`  ✓ ${dir}/splash.png (${w}×${h})`);
}

// ──────────────────────────────────────────────
// Web favicon + apple-touch-icon
// ──────────────────────────────────────────────
console.log('\nGerando favicon e apple-touch-icon...');
await (await iconWithBg(64)).toFile(join(ROOT, 'public/imgs/elementos/favicon.png'));
console.log('  ✓ public/imgs/elementos/favicon.png (64×64)');
await (await iconWithBg(180)).toFile(join(ROOT, 'public/imgs/apple-touch-icon.png'));
console.log('  ✓ public/imgs/apple-touch-icon.png (180×180)');

console.log('\n✅ Todos os ícones e splashes gerados com sucesso!');
