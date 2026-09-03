const DEVICON_PATTERN = /^devicon-[a-z0-9-]+$/;
const UI_GLYPHS = new Set([
  'phone',
  'mail',
  'map',
  'whatsapp',
  'sun',
  'moon',
  'palette',
  'menu',
  'close',
  'back',
  'external',
  'book',
  'server',
  'code',
  'database',
  'sitemap',
  'link',
  'copy',
  'check',
  'search',
  'arrow',
  'up',
]);

const ALIAS: Record<string, string> = {
  'bxs-phone': 'phone',
  phone: 'phone',
  'bxs-envelope': 'mail',
  email: 'mail',
  mail: 'mail',
  'bxs-map': 'map',
  address: 'map',
  map: 'map',
  'bxl-whatsapp': 'whatsapp',
  whatsapp: 'whatsapp',
  'bxl-github': 'devicon-github-original',
  github: 'devicon-github-original',
  'bxl-linkedin': 'devicon-linkedin-plain',
  linkedin: 'devicon-linkedin-plain',
  'bx-server': 'server',
  server: 'server',
  'bx-code-alt': 'code',
  code: 'code',
  'bx-data': 'database',
  database: 'database',
  'bx-sitemap': 'sitemap',
  sitemap: 'sitemap',
  'bx-link': 'link',
  link: 'link',
  copy: 'copy',
  check: 'check',
  search: 'search',
  arrow: 'arrow',
  up: 'up',
  'bx-arrow-back': 'back',
  back: 'back',
  'bx-link-external': 'external',
  external: 'external',
  'bx-book-open': 'book',
  book: 'book',
  'bx-sun': 'sun',
  sun: 'sun',
  'bx-moon': 'moon',
  moon: 'moon',
  'bx-palette': 'palette',
  palette: 'palette',
  'bx-menu': 'menu',
  menu: 'menu',
  'bx-x': 'close',
  close: 'close',
  'bx-mobile-alt': 'server',
  'bx-info-circle': 'link',
};

export function resolveIconName(value: string | undefined, fallback = 'code'): string {
  const raw = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^bx\s+/, '');
  const tokens = raw.split(/\s+/).filter(Boolean);
  if (tokens.some((token) => DEVICON_PATTERN.test(token))) {
    return tokens.filter((token) => DEVICON_PATTERN.test(token) || token === 'colored').join(' ');
  }
  if (ALIAS[raw]) {
    return ALIAS[raw];
  }
  if (UI_GLYPHS.has(raw)) {
    return raw;
  }
  return fallback;
}

export function isDevicon(name: string): boolean {
  return name.split(/\s+/).some((token) => DEVICON_PATTERN.test(token));
}
