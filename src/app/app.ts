import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, HostListener, afterNextRender, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { I18n } from './core/i18n';
import { isWideMonogram, monogramLetter } from './core/monogram';
import { PageTransition } from './core/page-transition';
import { Portfolio } from './core/portfolio';
import { Seo } from './core/seo';
import { PAGE_SHORTCUTS, currentPath, isHelpKey, isTypingTarget } from './core/shortcuts';
import { Extras } from './core/extras';
import { ThemeService } from './core/theme';
import { CommandPalette } from './shared/command-palette';
import { SiteCursor } from './shared/site-cursor';
import { UiIcon } from './shared/ui-icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UiIcon, CommandPalette, SiteCursor],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly transition = inject(PageTransition);
  protected readonly i18n = inject(I18n);
  protected readonly theme = inject(ThemeService);
  protected readonly extras = inject(Extras);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
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
  protected readonly pageShortcuts = computed(() => {
    const labels = this.nav();
    return PAGE_SHORTCUTS.map((item) => ({
      key: item.key,
      path: item.path,
      label: labels[item.nav],
    }));
  });
  protected readonly menuOpen = signal(false);
  protected readonly accentOpen = signal(false);
  protected readonly helpOpen = signal(false);
  protected readonly showToTop = signal(false);
  private ignoreAccentClick = false;

  constructor() {
    inject(Seo);
    effect(() => {
      const letter = this.monogram();
      if (letter) {
        this.theme.setMonogram(letter);
      }
    });
    effect(() => {
      this.document.documentElement.classList.toggle('nav-open', this.menuOpen());
    });
    const insights = injectSpeedInsights({ framework: 'angular' });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.menuOpen.set(false);
        this.accentOpen.set(false);
        this.helpOpen.set(false);
        this.extras.closePalette();
      }
      if (event instanceof NavigationEnd) {
        this.showToTop.set(false);
        insights?.setRoute(event.urlAfterRedirects);
      }
    });
    afterNextRender(() => {
      const onScroll = (event: Event) => {
        const target = event.target;
        if (
          !(target instanceof HTMLElement) ||
          target.tagName !== 'SECTION' ||
          !target.classList.contains('active')
        ) {
          return;
        }
        this.showToTop.set(target.scrollTop > 240);
      };
      this.document.addEventListener('scroll', onScroll, true);
      this.destroyRef.onDestroy(() => {
        this.document.removeEventListener('scroll', onScroll, true);
      });
    });
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
    this.accentOpen.set(false);
    this.helpOpen.set(false);
    this.extras.closePalette();
  }

  toggleHelp(event?: Event): void {
    event?.stopPropagation();
    this.helpOpen.update((open) => !open);
    this.menuOpen.set(false);
    this.accentOpen.set(false);
    this.extras.closePalette();
  }

  togglePalette(event?: Event): void {
    event?.stopPropagation();
    this.menuOpen.set(false);
    this.accentOpen.set(false);
    this.helpOpen.set(false);
    this.extras.togglePalette();
  }

  closeHelp(): void {
    this.helpOpen.set(false);
  }

  scrollToTop(): void {
    this.document.querySelector('section.active')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openColorsFromHelp(event: Event): void {
    event.stopPropagation();
    this.openColorsFromPalette();
  }

  openColorsFromPalette(): void {
    this.ignoreAccentClick = true;
    this.accentOpen.set(true);
    this.menuOpen.set(false);
    this.helpOpen.set(false);
    setTimeout(() => {
      this.ignoreAccentClick = false;
    }, 0);
  }

  openHelpFromPalette(): void {
    this.helpOpen.set(true);
    this.accentOpen.set(false);
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
    if (this.ignoreAccentClick) {
      return;
    }
    this.accentOpen.set(false);
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.code === 'KeyK') {
      event.preventDefault();
      this.menuOpen.set(false);
      this.accentOpen.set(false);
      this.helpOpen.set(false);
      this.extras.togglePalette();
      return;
    }

    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (event.key === 'Escape') {
      if (this.extras.paletteOpen()) {
        this.extras.closePalette();
        return;
      }
      this.menuOpen.set(false);
      this.accentOpen.set(false);
      this.helpOpen.set(false);
      return;
    }

    if (isTypingTarget(event.target) || this.extras.paletteOpen()) {
      return;
    }

    if (isHelpKey(event)) {
      event.preventDefault();
      this.toggleHelp();
      return;
    }

    if (event.code === 'KeyL') {
      event.preventDefault();
      this.helpOpen.set(false);
      this.i18n.toggle();
      return;
    }

    if (event.code === 'KeyT' && !this.theme.isCustomized()) {
      event.preventDefault();
      this.helpOpen.set(false);
      this.theme.toggle();
      return;
    }

    if (event.code === 'KeyA') {
      event.preventDefault();
      this.helpOpen.set(false);
      this.menuOpen.set(false);
      this.accentOpen.update((open) => !open);
      return;
    }

    if (event.code === 'KeyM') {
      event.preventDefault();
      this.extras.toggleCursor();
      return;
    }

    const shortcut = PAGE_SHORTCUTS.find((item) => item.code === event.code);
    if (!shortcut) {
      return;
    }

    event.preventDefault();
    this.helpOpen.set(false);
    const path = currentPath(this.router.url);
    if (path === shortcut.path) {
      return;
    }
    void this.router.navigateByUrl(shortcut.path);
  }
}
