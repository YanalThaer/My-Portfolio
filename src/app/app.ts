import { Component, HostListener, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { I18n } from './core/i18n';
import { PageTransition } from './core/page-transition';
import { Portfolio } from './core/portfolio';
import { Seo } from './core/seo';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly transition = inject(PageTransition);
  protected readonly i18n = inject(I18n);
  protected readonly data = toSignal(inject(Portfolio).getData());
  protected readonly menuOpen = signal(false);

  constructor() {
    inject(Seo);
    const insights = injectSpeedInsights({ framework: 'angular' });
    inject(Router).events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.menuOpen.set(false);
      }
      if (event instanceof NavigationEnd) {
        insights?.setRoute(event.urlAfterRedirects);
      }
    });
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  @HostListener('document:keydown.escape')
  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
