// npm run generate-favicon
// Reads the first letter of home.name in portfolio.json and writes public favicon files.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { backupCurrent } from './backup.mjs';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');
const publicDir = path.join(root, 'public');
const dataPath = path.join(root, 'public', 'data', 'portfolio.json');

const BG = '#1f242d';
const GREEN = '#7cf03d';

export function monogramFromName(name, logo = '') {
  const source = String(name || logo || '').trim();
  const match = source.match(/\p{L}/u);
  return match ? match[0].toLocaleUpperCase('en-US') : 'Y';
}

function xmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function iconSvg(size, letter, { fullBleed = false } = {}) {
  const safe = xmlEscape(letter || 'Y');
  const wide = /[MWم]/i.test(letter);
  const fontSize = size * (wide ? 0.46 : 0.54);
  const radius = fullBleed ? 0 : size * 0.25;
  const pad = fullBleed ? 0 : size * (1 / 32);
  const inner = size - pad * 2;
  const stroke = Math.max(1, size * (2 / 32));
  const fontFamily = "Poppins, Cairo, 'Segoe UI', Arial, sans-serif";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" rx="${radius}" fill="${BG}"/>
  <rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" rx="${radius}" fill="none" stroke="${GREEN}" stroke-width="${stroke}"/>
  <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="central" font-family="${fontFamily}" font-size="${fontSize}" font-weight="800" fill="${GREEN}">${safe}</text>
</svg>`;
}

function pngToIco(images) {
  const count = images.length;
  let offset = 6 + 16 * count;
  const entries = images.map((image) => {
    const entry = { image, offset };
    offset += image.data.length;
    return entry;
  });

  const buf = Buffer.alloc(offset);
  buf.writeUInt16LE(0, 0);
  buf.writeUInt16LE(1, 2);
  buf.writeUInt16LE(count, 4);

  entries.forEach((entry, index) => {
    const pos = 6 + index * 16;
    const size = entry.image.size;
    buf.writeUInt8(size >= 256 ? 0 : size, pos);
    buf.writeUInt8(size >= 256 ? 0 : size, pos + 1);
    buf.writeUInt8(0, pos + 2);
    buf.writeUInt8(0, pos + 3);
    buf.writeUInt16LE(1, pos + 4);
    buf.writeUInt16LE(32, pos + 6);
    buf.writeUInt32LE(entry.image.data.length, pos + 8);
    buf.writeUInt32LE(entry.offset, pos + 12);
    entry.image.data.copy(buf, entry.offset);
  });

  return buf;
}

async function raster(size, letter, options = {}) {
  return sharp(Buffer.from(iconSvg(size, letter, options)))
    .png()
    .toBuffer();
}

export async function generateFaviconAssets(name) {
  let letterSource = name;
  if (!letterSource && existsSync(dataPath)) {
    const portfolio = JSON.parse(readFileSync(dataPath, 'utf8'));
    letterSource = portfolio.logo || portfolio.home?.name;
  }
  const letter = monogramFromName(letterSource);
  const png16 = await raster(16, letter);
  const png32 = await raster(32, letter);
  const png48 = await raster(48, letter);
  const apple = await raster(180, letter, { fullBleed: true });

  writeFileSync(path.join(publicDir, 'favicon.svg'), iconSvg(32, letter));
  writeFileSync(path.join(publicDir, 'favicon-32.png'), png32);
  writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), apple);
  writeFileSync(
    path.join(publicDir, 'favicon.ico'),
    pngToIco([
      { size: 16, data: png16 },
      { size: 32, data: png32 },
      { size: 48, data: png48 },
    ]),
  );

  return letter;
}

function isDirectRun() {
  const invoked = process.argv[1] ? path.resolve(process.argv[1]) : '';
  return path.normalize(invoked) === path.normalize(__filename);
}

if (isDirectRun()) {
  try {
    const snapshot = backupCurrent('favicon');
    const letter = await generateFaviconAssets();
    console.log(`Wrote favicon assets for "${letter}" to public/`);
    console.log(`Backup saved to ${path.relative(root, snapshot.folder)}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
