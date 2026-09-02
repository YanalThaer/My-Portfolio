import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { I18n } from './core/i18n';
import { PageTransition } from './core/page-transition';
import { Seo } from './core/seo';
import { ThemeService } from './core/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly transition = inject(PageTransition);
  protected readonly i18n = inject(I18n);
  protected readonly theme = inject(ThemeService);
  protected readonly menuOpen = signal(false);
  protected readonly accentOpen = signal(false);

  constructor() {
    inject(Seo);
    const insights = injectSpeedInsights({ framework: 'angular' });
    inject(Router).events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.menuOpen.set(false);
        this.accentOpen.set(false);
      }
      if (event instanceof NavigationEnd) {
        insights?.setRoute(event.urlAfterRedirects);
      }
    });
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
    this.accentOpen.set(false);
  }

  toggleAccentPanel(event: Event): void {
    event.stopPropagation();
    this.accentOpen.update((open) => !open);
    this.menuOpen.set(false);
  }

  onCustomAccent(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.theme.setAccent(value);
  }

  onCustomBackground(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.theme.setBackground(value);
  }

  isPresetAccent(): boolean {
    const current = this.theme.accent();
    return this.theme.presets.some((preset) => preset.hex === current);
  }

  isCustomBackground(): boolean {
    const current = this.theme.background();
    return !!current && !this.theme.backgrounds.some((preset) => preset.hex === current);
  }

  @HostListener('document:click')
  closePopovers(): void {
    this.accentOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  closeMenu(): void {
    this.menuOpen.set(false);
    this.accentOpen.set(false);
  }
}
