import { Component, ElementRef, computed, effect, inject, output, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Extras } from '../core/extras';
import { I18n } from '../core/i18n';
import { Portfolio } from '../core/portfolio';
import { PAGE_SHORTCUTS } from '../core/shortcuts';
import { projectSlug } from '../core/projects';
import { ThemeService } from '../core/theme';
import { UiIcon } from './ui-icon';

interface PaletteItem {
  id: string;
  label: string;
  hint: string;
  keywords: string;
  run: () => void;
}

@Component({
  selector: 'app-command-palette',
  imports: [UiIcon],
  template: `
    @if (extras.paletteOpen()) {
      <div class="palette-overlay" (click)="extras.closePalette()">
        <div
          class="palette"
          role="dialog"
          [attr.aria-label]="i18n.t().paletteTitle"
          (click)="$event.stopPropagation()"
        >
          <label class="palette-search">
            <app-icon name="search" />
            <input
              #query
              type="search"
              [value]="filter()"
              [placeholder]="i18n.t().palettePlaceholder"
              autocomplete="off"
              (input)="onInput($event)"
              (keydown)="onKey($event)"
            />
          </label>
          @if (visible().length) {
            <ul role="listbox">
              @for (item of visible(); track item.id; let idx = $index) {
                <li
                  role="option"
                  [class.active]="idx === active()"
                  [attr.aria-selected]="idx === active()"
                  (mouseenter)="active.set(idx)"
                  (click)="run(item)"
                >
                  <span>{{ item.label }}</span>
                  <em>{{ item.hint }}</em>
                </li>
              }
            </ul>
          } @else {
            <p class="palette-empty">{{ i18n.t().paletteEmpty }}</p>
          }
        </div>
      </div>
    }
  `,
  styles: `
    .palette-overlay {
      position: fixed;
      inset: 0;
      z-index: 220;
      display: flex;
      justify-content: center;
      padding: min(18vh, 12rem) 1.6rem 2rem;
      background: color-mix(in srgb, var(--bg-color) 72%, transparent);
      backdrop-filter: blur(0.8rem);
    }
    .palette {
      width: min(52rem, 100%);
      overflow: hidden;
      border-radius: 1.2rem;
      background: var(--second-bg-color);
      border: 0.15rem solid var(--card-border);
      box-shadow: var(--card-shadow), 0 1.6rem 3.2rem #00000050;
    }
    .palette-search {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding-inline: 1.4rem 0.6rem;
      border-bottom: 0.1rem solid var(--divider);
      color: var(--muted);
    }
    .palette-search app-icon {
      font-size: 1.8rem;
      pointer-events: none;
    }
    input {
      flex: 1;
      width: 100%;
      padding-block: 1.5rem;
      padding-inline: 0 1.2rem;
      border: 0;
      background: transparent;
      color: var(--text-color);
      font: inherit;
      font-size: 1.6rem;
      outline: none;
    }
    input::-webkit-search-decoration,
    input::-webkit-search-cancel-button {
      appearance: none;
    }
    ul {
      margin: 0;
      padding: 0.6rem;
      max-height: 32rem;
      overflow: auto;
      list-style: none;
    }
    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.2rem;
      padding: 1rem 1.2rem;
      border-radius: 0.8rem;
      cursor: pointer;
    }
    li.active {
      background: var(--main-soft);
      color: var(--main-color);
    }
    em {
      font-style: normal;
      font-size: 1.25rem;
      color: var(--muted);
      white-space: nowrap;
    }
    li.active em {
      color: inherit;
      opacity: 0.8;
    }
    .palette-empty {
      margin: 0;
      padding: 1.8rem;
      color: var(--muted);
      font-size: 1.45rem;
    }
  `,
})
export class CommandPalette {
  private readonly queryRef = viewChild<ElementRef<HTMLInputElement>>('query');
  private readonly router = inject(Router);
  private readonly portfolio = inject(Portfolio);
  private readonly data = toSignal(this.portfolio.getData());
  protected readonly extras = inject(Extras);
  protected readonly i18n = inject(I18n);
  private readonly theme = inject(ThemeService);
  protected readonly filter = signal('');
  protected readonly active = signal(0);
  readonly openColors = output<void>();
  readonly openHelp = output<void>();

  private readonly items = computed((): PaletteItem[] => {
    const ui = this.i18n.t();
    const labels = this.data()?.nav;
    const nav = {
      home: labels?.home || ui.navHome,
      work: labels?.work || ui.navWork,
      resume: labels?.resume || ui.navResume,
      projects: labels?.projects || ui.navProjects,
      contact: labels?.contact || ui.navContact,
    };
    const pages: PaletteItem[] = PAGE_SHORTCUTS.map((item) => ({
      id: `page-${item.nav}`,
      label: nav[item.nav],
      hint: item.key,
      keywords: `${item.nav} ${item.key} ${item.path}`,
      run: () => void this.router.navigateByUrl(item.path),
    }));
    const projects: PaletteItem[] = (this.data()?.projects ?? []).map((project) => ({
      id: `project-${projectSlug(project)}`,
      label: project.title,
      hint: ui.navProjects,
      keywords: `${project.title} ${project.tech} project`,
      run: () => void this.router.navigateByUrl(`/projects/${projectSlug(project)}`),
    }));
    const actions: PaletteItem[] = [
      {
        id: 'lang',
        label: ui.shortcutLang,
        hint: 'L',
        keywords: 'language arabic english lang',
        run: () => this.i18n.toggle(),
      },
      {
        id: 'theme',
        label: ui.shortcutTheme,
        hint: 'T',
        keywords: 'theme dark light',
        run: () => {
          if (!this.theme.isCustomized()) {
            this.theme.toggle();
          }
        },
      },
      {
        id: 'colors',
        label: ui.shortcutAccent,
        hint: 'A',
        keywords: 'color accent palette',
        run: () => this.openColors.emit(),
      },
      {
        id: 'cursor',
        label: this.extras.cursorOn() ? ui.cursorOff : ui.cursorOn,
        hint: 'M',
        keywords: 'cursor pointer mouse',
        run: () => this.extras.toggleCursor(),
      },
      {
        id: 'help',
        label: ui.shortcutsTitle,
        hint: '?',
        keywords: 'shortcuts help keys',
        run: () => this.openHelp.emit(),
      },
    ];
    return [...pages, ...projects, ...actions];
  });

  protected readonly visible = computed(() => {
    const query = this.filter().trim().toLowerCase();
    const tokens = query.split(/\s+/).filter(Boolean);
    const list = this.items();
    if (!tokens.length) {
      return list;
    }
    return list.filter((item) => {
      const haystack = `${item.label} ${item.keywords} ${item.hint}`.toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  });

  constructor() {
    effect(() => {
      if (this.extras.paletteOpen()) {
        this.filter.set('');
        this.active.set(0);
        queueMicrotask(() => this.queryRef()?.nativeElement.focus());
      }
    });
  }

  onInput(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
    this.active.set(0);
  }

  onKey(event: KeyboardEvent): void {
    const count = this.visible().length;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.active.update((index) => (count ? (index + 1) % count : 0));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.active.update((index) => (count ? (index - 1 + count) % count : 0));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const item = this.visible()[this.active()];
      if (item) {
        this.run(item);
      }
    }
  }

  run(item: PaletteItem): void {
    item.run();
    this.extras.closePalette();
  }
}
