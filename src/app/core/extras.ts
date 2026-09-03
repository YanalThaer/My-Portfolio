import { Injectable, signal } from '@angular/core';

const CURSOR_KEY = 'portfolio-cursor';

@Injectable({
  providedIn: 'root',
})
export class Extras {
  readonly paletteOpen = signal(false);
  readonly cursorOn = signal(readCursorPref());

  togglePalette(): void {
    this.paletteOpen.update((open) => !open);
  }

  closePalette(): void {
    this.paletteOpen.set(false);
  }

  toggleCursor(): void {
    const next = !this.cursorOn();
    this.cursorOn.set(next);
    try {
      localStorage.setItem(CURSOR_KEY, next ? 'on' : 'off');
    } catch {
      /* ignore */
    }
  }
}

function readCursorPref(): boolean {
  try {
    const stored = localStorage.getItem(CURSOR_KEY);
    if (stored === 'off') {
      return false;
    }
    if (stored === 'on') {
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}
