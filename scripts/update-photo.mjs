import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = path.join(root, 'public', 'data', 'portfolio.json');
const photoPath = process.argv[2] ? path.resolve(process.argv[2]) : '';

const allowed = new Set(['.jpg', '.jpeg', '.png', '.webp']);

if (!photoPath || !existsSync(photoPath)) {
  console.error('Photo file not found.');
  console.error('Example:');
  console.error('  npm run update-photo -- "C:\\Users\\AS\\Desktop\\me.jpg"');
  process.exit(1);
}

const ext = path.extname(photoPath).toLowerCase();
if (!allowed.has(ext)) {
  console.error(`Unsupported image type: ${ext}`);
  console.error('Use .jpg, .jpeg, .png, or .webp');
  process.exit(1);
}

if (!existsSync(dataPath)) {
  console.error(`portfolio.json not found: ${dataPath}`);
  process.exit(1);
}

const savedExt = ext === '.jpeg' ? '.jpg' : ext;
const relative = `images/home${savedExt}`;
const dest = path.join(root, 'public', relative);

mkdirSync(path.dirname(dest), { recursive: true });
copyFileSync(photoPath, dest);

const portfolio = JSON.parse(readFileSync(dataPath, 'utf8'));
portfolio.home.image = relative;
writeFileSync(dataPath, JSON.stringify(portfolio, null, 2) + '\n', 'utf8');

console.log(`Photo updated: public/${relative}`);
console.log('Refresh the site with Ctrl + F5 to see it.');
