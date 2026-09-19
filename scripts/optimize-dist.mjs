import { readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Optimize build artifacts only. Original artwork and save keys remain unchanged.
const directory = path.resolve('dist/Hakase');
let saved = 0;
for (const name of await readdir(directory)) {
  if (!name.endsWith('.png')) continue;
  const file = path.join(directory, name);
  const before = (await stat(file)).size;
  const output = await sharp(file).resize({ width: 1440, height: 1440, fit: 'inside', withoutEnlargement: true }).png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer();
  if (output.length < before) { await writeFile(file, output); saved += before - output.length; }
}
await sharp('public/image/title_key_visual.png').resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 85 }).toFile('dist/og-preview.jpg');
await writeFile('dist/build-info.json', JSON.stringify({ commit: process.env.WORKERS_CI_COMMIT_SHA || process.env.CF_PAGES_COMMIT_SHA || process.env.GITHUB_SHA || 'local', builtAt: new Date().toISOString(), feature: 'field-observation-v1' }, null, 2));
let count = 0, largest = { path: '', bytes: 0 };
async function checkAssets(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const filename = path.join(dir, item.name);
    if (item.isDirectory()) { await checkAssets(filename); continue; }
    count++;
    const bytes = (await stat(filename)).size;
    if (bytes > largest.bytes) largest = { path: filename, bytes };
    if (bytes > 25 * 1024 * 1024) throw new Error(`Cloudflare static asset exceeds 25 MiB: ${filename}`);
  }
}
await checkAssets('dist');
if (count > 20000) throw new Error(`Too many static assets for the free plan: ${count}`);
console.log(`Artwork: saved ${(saved / 1024 / 1024).toFixed(1)} MiB; source images preserved.`);
console.log(`Cloudflare asset preflight: ${count} files; largest ${(largest.bytes / 1024 / 1024).toFixed(2)} MiB (${largest.path}).`);
