import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = path.resolve(__dirname, '../../icon.png');
const resDir = path.resolve(__dirname, '../android/app/src/main/res');

const sizes = {
  'mipmap-mdpi':    { launcher: 48,  round: 48,  fg: 108  },
  'mipmap-hdpi':    { launcher: 72,  round: 72,  fg: 162  },
  'mipmap-xhdpi':   { launcher: 96,  round: 96,  fg: 216  },
  'mipmap-xxhdpi':  { launcher: 144, round: 144, fg: 324  },
  'mipmap-xxxhdpi': { launcher: 192, round: 192, fg: 432  },
};

async function resize(size, destPath) {
  await sharp(src).resize(size, size).toFile(destPath);
  console.log(`  ✓ ${path.basename(destPath)} (${size}x${size}) → ${path.relative(resDir, destPath)}`);
}

async function main() {
  console.log(`\nSource: ${src}\n`);
  for (const [folder, s] of Object.entries(sizes)) {
    const dir = path.join(resDir, folder);
    console.log(`[${folder}]`);
    await resize(s.launcher, path.join(dir, 'ic_launcher.png'));
    await resize(s.round,    path.join(dir, 'ic_launcher_round.png'));
    await resize(s.fg,       path.join(dir, 'ic_launcher_foreground.png'));
  }
  console.log('\n✅ Todos os ícones gerados com sucesso!');
}

main().catch(err => { console.error('Erro:', err); process.exit(1); });
