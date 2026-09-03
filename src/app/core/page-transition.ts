import { Injectable, inject, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

const REVEAL_MS = 260;

@Injectable({
  providedIn: 'root',
})
export class PageTransition {
  readonly headerActive = signal(true);
  readonly contentActive = signal(true);

  private isFirstNavigation = true;
  private revealTimer = 0;

  constructor() {
    inject(Router).events.subscribe((event) => {
      if (!(event instanceof NavigationStart)) {
        return;
      }

      if (this.isFirstNavigation) {
        this.isFirstNavigation = false;
        return;
      }

      if (prefersReducedMotion()) {
        this.contentActive.set(true);
        return;
      }

      this.contentActive.set(false);
      window.clearTimeout(this.revealTimer);
      this.revealTimer = window.setTimeout(() => {
        this.contentActive.set(true);
      }, REVEAL_MS);
    });
  }

  ready(data: unknown): boolean {
    return !!data && this.contentActive();
  }
}

function prefersReducedMotion(): boolean {
  return !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
