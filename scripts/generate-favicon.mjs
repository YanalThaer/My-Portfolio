import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const BG = { r: 0x1f, g: 0x24, b: 0x2d, a: 255 };
const GREEN = { r: 0x7c, g: 0xf0, b: 0x3d, a: 255 };
const CLEAR = { r: 0, g: 0, b: 0, a: 0 };

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');

function mix(a, b, t) {
  const k = Math.max(0, Math.min(1, t));
  return {
    r: a.r + (b.r - a.r) * k,
    g: a.g + (b.g - a.g) * k,
    b: a.b + (b.b - a.b) * k,
    a: a.a + (b.a - a.a) * k,
  };
}

function cover(distance) {
  return Math.max(0, Math.min(1, 0.55 - distance));
}

function sdRoundRect(px, py, cx, cy, halfW, halfH, radius) {
  const dx = Math.abs(px - cx) - (halfW - radius);
  const dy = Math.abs(py - cy) - (halfH - radius);
  const ox = Math.max(dx, 0);
  const oy = Math.max(dy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(dx, dy), 0) - radius;
}

function sdSegment(px, py, ax, ay, bx, by, radius) {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const denom = bax * bax + bay * bay;
  const h = denom === 0 ? 0 : Math.max(0, Math.min(1, (pax * bax + pay * bay) / denom));
  return Math.hypot(pax - bax * h, pay - bay * h) - radius;
}

function sdY(px, py, size) {
  const x = px / size;
  const y = py / size;
  const stroke = 0.056;
  const left = sdSegment(x, y, 0.3, 0.262, 0.5, 0.556, stroke);
  const right = sdSegment(x, y, 0.7, 0.262, 0.5, 0.556, stroke);
  const stem = sdSegment(x, y, 0.5, 0.519, 0.5, 0.744, stroke);
  return Math.min(left, right, stem) * size;
}

function colorAt(px, py, size, { opaque = false, fullBleed = false } = {}) {
  const yMark = sdY(px, py, size);

  if (fullBleed) {
    return mix(BG, GREEN, cover(yMark));
  }

  const cx = size / 2;
  const pad = size * (1 / 32);
  const half = size / 2 - pad;
  const radius = size * 0.25;
  const border = size * (2 / 32);
  const rect = sdRoundRect(px, py, cx, cx, half, half, radius);
  const inner = rect + border;

  let color = opaque ? BG : CLEAR;
  color = mix(color, BG, cover(rect));
  color = mix(color, GREEN, Math.min(cover(rect), 1 - cover(inner)));
  color = mix(color, GREEN, cover(yMark));
  return color;
}

function renderPng(size, options = {}) {
  const png = new PNG({ width: size, height: size });
  const samples = size <= 32 ? 4 : 3;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const px = x + (sx + 0.5) / samples;
          const py = y + (sy + 0.5) / samples;
          const color = colorAt(px, py, size, options);
          r += color.r;
          g += color.g;
          b += color.b;
          a += color.a;
        }
      }
      const n = samples * samples;
      const i = (size * y + x) << 2;
      png.data[i] = Math.round(r / n);
      png.data[i + 1] = Math.round(g / n);
      png.data[i + 2] = Math.round(b / n);
      png.data[i + 3] = Math.round(a / n);
    }
  }

  return PNG.sync.write(png);
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

const png16 = renderPng(16);
const png32 = renderPng(32);
const png48 = renderPng(48);
const apple = renderPng(180, { fullBleed: true });

writeFileSync(join(publicDir, 'favicon-32.png'), png32);
writeFileSync(join(publicDir, 'apple-touch-icon.png'), apple);
writeFileSync(
  join(publicDir, 'favicon.ico'),
  pngToIco([
    { size: 16, data: png16 },
    { size: 32, data: png32 },
    { size: 48, data: png48 },
  ]),
);

console.log('Wrote favicon.svg assets to public/');
