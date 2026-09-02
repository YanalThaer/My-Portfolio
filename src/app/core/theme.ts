import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

export interface ColorPreset {
  hex: string;
  en: string;
  ar: string;
}

export const ACCENT_PRESETS: ColorPreset[] = [
  { hex: '#7cf03d', en: 'Green', ar: 'أخضر' },
  { hex: '#22d3ee', en: 'Cyan', ar: 'سماوي' },
  { hex: '#60a5fa', en: 'Blue', ar: 'أزرق' },
  { hex: '#a78bfa', en: 'Violet', ar: 'بنفسجي' },
  { hex: '#f472b6', en: 'Pink', ar: 'وردي' },
  { hex: '#fb923c', en: 'Orange', ar: 'برتقالي' },
  { hex: '#facc15', en: 'Gold', ar: 'ذهبي' },
  { hex: '#f87171', en: 'Red', ar: 'أحمر' },
];

export const BACKGROUND_PRESETS: ColorPreset[] = [
  { hex: '#1f242d', en: 'Charcoal', ar: 'فحمي' },
  { hex: '#0f172a', en: 'Navy', ar: 'كحلي' },
  { hex: '#111827', en: 'Graphite', ar: 'رمادي غامق' },
  { hex: '#1e1b4b', en: 'Indigo', ar: 'نيلي' },
  { hex: '#052e16', en: 'Forest', ar: 'أخضر غامق' },
  { hex: '#eef1f5', en: 'Cloud', ar: 'فاتح' },
  { hex: '#f8fafc', en: 'Snow', ar: 'ثلجي' },
  { hex: '#f5f0e8', en: 'Cream', ar: 'كريمي' },
];

export const DEFAULT_ACCENT = ACCENT_PRESETS[0].hex;
export const DEFAULT_BG_DARK = '#1f242d';
export const DEFAULT_BG_LIGHT = '#eef1f5';

const THEME_KEY = 'portfolio-theme';
const ACCENT_KEY = 'portfolio-accent';
const BG_KEY = 'portfolio-bg';

const SURFACE_VARS = [
  '--bg-color',
  '--second-bg-color',
  '--text-color',
  '--disabled-color',
  '--card-shadow',
] as const;

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly mode = signal<ThemeMode>(this.readMode());
  readonly accent = signal<string>(this.readAccent());
  readonly background = signal<string | null>(this.readBackground());
  readonly presets = ACCENT_PRESETS;
  readonly backgrounds = BACKGROUND_PRESETS;
  readonly currentBackground = computed(
    () => this.background() ?? (this.mode() === 'light' ? DEFAULT_BG_LIGHT : DEFAULT_BG_DARK),
  );
  readonly isCustomized = computed(
    () => this.accent() !== DEFAULT_ACCENT || this.background() !== null,
  );

  constructor() {
    effect(() => {
      const theme = this.mode();
      const accent = this.accent();
      const background = this.background();
      this.apply(theme, accent, background);
      try {
        localStorage.setItem(THEME_KEY, theme);
        localStorage.setItem(ACCENT_KEY, accent);
        if (background) {
          localStorage.setItem(BG_KEY, background);
        } else {
          localStorage.removeItem(BG_KEY);
        }
      } catch {
        /* ignore private-mode failures */
      }
    });
  }

  toggle(): void {
    if (this.isCustomized()) {
      return;
    }
    this.mode.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
  }

  setAccent(value: string): void {
    const hex = normalizeHex(value);
    if (hex) {
      this.accent.set(hex);
    }
  }

  setBackground(value: string | null): void {
    if (value == null) {
      this.background.set(null);
      return;
    }

    const hex = normalizeHex(value);
    if (hex) {
      this.background.set(hex);
      this.mode.set(luminance(hex) > 0.45 ? 'light' : 'dark');
    }
  }

  reset(): void {
    this.mode.set('dark');
    this.accent.set(DEFAULT_ACCENT);
    this.background.set(null);
  }

  private readMode(): ThemeMode {
    const attr = this.document.documentElement.getAttribute('data-theme');
    if (attr === 'light' || attr === 'dark') {
      return attr;
    }

    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      /* ignore */
    }

    return 'dark';
  }

  private readAccent(): string {
    const inline = normalizeHex(
      this.document.documentElement.style.getPropertyValue('--accent'),
    );
    if (inline) {
      return inline;
    }

    try {
      const stored = normalizeHex(localStorage.getItem(ACCENT_KEY) || '');
      if (stored) {
        return stored;
      }
    } catch {
      /* ignore */
    }

    return DEFAULT_ACCENT;
  }

  private readBackground(): string | null {
    try {
      return normalizeHex(localStorage.getItem(BG_KEY) || '');
    } catch {
      return null;
    }
  }

  private apply(theme: ThemeMode, accent: string, background: string | null): void {
    const root = this.document.documentElement;
    root.dataset['theme'] = theme;
    root.style.setProperty('--accent', accent);

    if (background) {
      const light = luminance(background) > 0.45;
      root.style.colorScheme = light ? 'light' : 'dark';
      root.style.setProperty('--bg-color', background);
      root.style.setProperty(
        '--second-bg-color',
        mixHex(background, '#ffffff', light ? 0.72 : 0.14),
      );
      root.style.setProperty('--text-color', light ? '#1c232d' : '#ffffff');
      root.style.setProperty('--disabled-color', light ? '#1c232d66' : '#ffffff33');
      root.style.setProperty(
        '--card-shadow',
        light ? '0 0.8rem 2.4rem #1c232d14' : 'none',
      );
    } else {
      root.style.colorScheme = theme;
      for (const name of SURFACE_VARS) {
        root.style.removeProperty(name);
      }
    }

    const pageBg = background ?? (theme === 'light' ? DEFAULT_BG_LIGHT : DEFAULT_BG_DARK);
    const meta = this.document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', pageBg);
    }
    this.updateFavicon(accent, pageBg);
  }

  private updateFavicon(accent: string, background: string): void {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="1" y="1" width="30" height="30" rx="8" fill="${background}"/><rect x="1" y="1" width="30" height="30" rx="8" fill="none" stroke="${accent}" stroke-width="2"/><path d="M9.6 8.4 L16 17.8 L22.4 8.4 M16 16.6 V23.8" fill="none" stroke="${accent}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    const image = new Image();
    image.onload = () => {
      const canvas = this.document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        this.setFavicon(svgUrl, 'image/svg+xml', 'any');
        return;
      }
      ctx.drawImage(image, 0, 0, 64, 64);
      this.setFavicon(canvas.toDataURL('image/png'), 'image/png', '64x64');
    };
    image.onerror = () => this.setFavicon(svgUrl, 'image/svg+xml', 'any');
    image.src = svgUrl;
  }

  private setFavicon(href: string, type: string, sizes: string): void {
    this.document
      .querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
      .forEach((node) => node.remove());

    const link = this.document.createElement('link');
    link.id = 'site-favicon';
    link.rel = 'icon';
    link.type = type;
    link.sizes = sizes;
    link.href = href;
    this.document.head.appendChild(link);
  }
}

function normalizeHex(value: string): string | null {
  const hex = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return hex.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    const [, r, g, b] = hex;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return null;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function mixHex(from: string, to: string, amount: number): string {
  const [fr, fg, fb] = hexToRgb(from);
  const [tr, tg, tb] = hexToRgb(to);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * amount);
  return `#${[mix(fr, tr), mix(fg, tg), mix(fb, tb)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`;
}
