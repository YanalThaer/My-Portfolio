import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { I18n } from './core/i18n';
import { isWideMonogram, monogramLetter } from './core/monogram';
import { PageTransition } from './core/page-transition';
import { Portfolio } from './core/portfolio';
import { Seo } from './core/seo';
import { ThemeService } from './core/theme';
import { UiIcon } from './shared/ui-icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UiIcon],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly transition = inject(PageTransition);
  protected readonly i18n = inject(I18n);
  protected readonly theme = inject(ThemeService);
  private readonly portfolio = inject(Portfolio);
  private readonly data = toSignal(this.portfolio.getData());
  protected readonly monogram = computed(() =>
    monogramLetter(this.data()?.logo, this.data()?.home?.name),
  );
  protected readonly monogramWide = computed(() => isWideMonogram(this.monogram()));
  protected readonly logoLabel = computed(
    () => this.data()?.logo?.trim() || this.data()?.home?.name || this.i18n.t().logoHome,
  );
  protected readonly nav = computed(() => {
    const labels = this.data()?.nav;
    const ui = this.i18n.t();
    return {
      home: labels?.home || ui.navHome,
      work: labels?.work || ui.navWork,
      resume: labels?.resume || ui.navResume,
      projects: labels?.projects || ui.navProjects,
      contact: labels?.contact || ui.navContact,
    };
  });
  protected readonly menuOpen = signal(false);
  protected readonly accentOpen = signal(false);

  constructor() {
    inject(Seo);
    effect(() => {
      const letter = this.monogram();
      if (letter) {
        this.theme.setMonogram(letter);
      }
    });
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
