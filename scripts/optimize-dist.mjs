import { readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Keep the source artwork untouched; shrink oversized communication images in the build.
const directory = path.resolve('dist/Hakase');
let saved = 0;
for (const name of await readdir(directory)) {
  if (!name.endsWith('.png')) continue;
  const file = path.join(directory, name);
  const before = (await stat(file)).size;
  const output = await sharp(file).resize({ width: 1440, height: 1440, fit: 'inside', withoutEnlargement: true }).png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer();
  if (output.length < before) { await writeFile(file, output); saved += before - output.length; }
}
console.log(`Communication artwork: saved ${(saved / 1024 / 1024).toFixed(1)} MB; source images preserved.`);
