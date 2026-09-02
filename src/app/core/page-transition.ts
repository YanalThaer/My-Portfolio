import { Injectable, inject, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PageTransition {
  readonly headerActive = signal(true);
  readonly barsActive = signal(true);
  readonly contentActive = signal(true);

  private isFirstNavigation = true;

  constructor() {
    inject(Router).events.subscribe((event) => {
      if (!(event instanceof NavigationStart)) {
        return;
      }

      if (this.isFirstNavigation) {
        this.isFirstNavigation = false;
        return;
      }

      this.barsActive.set(false);
      this.contentActive.set(false);

      setTimeout(() => {
        this.headerActive.set(true);
        this.barsActive.set(true);
        this.contentActive.set(true);
      }, 380);
    });
  }
}
