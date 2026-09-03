import { Component, computed, input } from '@angular/core';
import { isDevicon, resolveIconName } from '../core/icons';

@Component({
  selector: 'app-icon',
  template: `
    @if (devicon()) {
      <i [class]="devicon()" aria-hidden="true"></i>
    } @else {
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        @switch (glyph()) {
          @case ('phone') {
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.5 2.8.7a2 2 0 0 1 1.7 2Z" />
          }
          @case ('mail') {
            <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
            <path d="m4.2 7.2 7.8 5.6 7.8-5.6" />
          }
          @case ('map') {
            <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
            <circle cx="12" cy="10" r="2.2" />
          }
          @case ('whatsapp') {
            <path d="M20 12a8 8 0 0 1-11.6 7.1L4.2 20.2l1.2-4.1A8 8 0 1 1 20 12Z" />
            <path d="M9.3 9.4c.2-.55.32-.55.58-.55h.48c.2 0 .32.08.38.38l.62 1.62c.08.22 0 .38-.16.5l-.36.32c-.16.16-.16.38 0 .58.38.55.9 1.08 1.48 1.48.2.16.42.16.58 0l.32-.36c.16-.16.38-.22.5-.16l1.62.62c.28.1.38.18.38.38v.48c0 .26 0 .4-.55.58A5.1 5.1 0 0 1 9.3 9.4Z" />
          }
          @case ('sun') {
            <circle cx="12" cy="12" r="3.6" />
            <path d="M12 3.2v2.1M12 18.7v2.1M5.3 12H3.2M20.8 12h-2.1M6.4 6.4l1.5 1.5M16.1 16.1l1.5 1.5M6.4 17.6l1.5-1.5M16.1 7.9l1.5-1.5" />
          }
          @case ('moon') {
            <path d="M20 14.4A8 8 0 1 1 9.6 4 6.6 6.6 0 0 0 20 14.4Z" />
          }
          @case ('palette') {
            <path d="M12 3.2a8.8 8.8 0 0 0 0 17.6h1.1a2.1 2.1 0 0 0 1.9-3 2.1 2.1 0 0 1 1.9-3.3h.7a2.9 2.9 0 0 0 2.9-3.2A8.8 8.8 0 0 0 12 3.2Z" />
            <circle cx="7.6" cy="10" r="1" />
            <circle cx="10.1" cy="7.4" r="1" />
            <circle cx="13.9" cy="7.4" r="1" />
            <circle cx="16.4" cy="10" r="1" />
          }
          @case ('menu') {
            <path d="M4 7h16M4 12h16M4 17h16" />
          }
          @case ('close') {
            <path d="m6 6 12 12M18 6 6 18" />
          }
          @case ('back') {
            <path d="M15 5 8 12l7 7" />
          }
          @case ('external') {
            <path d="M14 5h5v5M19 5l-9 9M11 6H6v12h12v-5" />
          }
          @case ('book') {
            <path d="M5 4.6h6.4A2.4 2.4 0 0 1 13.8 7v12.4H7A2 2 0 0 1 5 17.4Z" />
            <path d="M19 4.6h-6.4A2.4 2.4 0 0 0 10.2 7v12.4h6.8A2 2 0 0 0 19 17.4Z" />
          }
          @case ('server') {
            <rect x="4" y="4" width="16" height="6" rx="1.2" />
            <rect x="4" y="14" width="16" height="6" rx="1.2" />
            <path d="M8 7h.01M8 17h.01" />
          }
          @case ('code') {
            <path d="m8 8-4 4 4 4M16 8l4 4-4 4" />
          }
          @case ('database') {
            <ellipse cx="12" cy="6" rx="7" ry="2.4" />
            <path d="M5 6v12c0 1.3 3.1 2.4 7 2.4s7-1.1 7-2.4V6" />
            <path d="M5 12c0 1.3 3.1 2.4 7 2.4s7-1.1 7-2.4" />
          }
          @case ('sitemap') {
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <rect x="3" y="17" width="6" height="4" rx="1" />
            <rect x="15" y="17" width="6" height="4" rx="1" />
            <path d="M12 7v4M6 17v-6h12v6" />
          }
          @case ('copy') {
            <rect x="8" y="8" width="12" height="12" rx="2" />
            <path d="M16 8V6.2A2.2 2.2 0 0 0 13.8 4H6.2A2.2 2.2 0 0 0 4 6.2v7.6A2.2 2.2 0 0 0 6.2 16H8" />
          }
          @case ('check') {
            <path d="m5 12 5 5 9-9" />
          }
          @case ('search') {
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-3.8-3.8" />
          }
          @case ('arrow') {
            <path d="M7 17 17 7M8 7h9v9" />
          }
          @case ('up') {
            <path d="m6 14 6-6 6 6" />
          }
          @default {
            <path d="M10 13a3.5 3.5 0 0 1 5.6-.4l1.5 1.5a3.5 3.5 0 0 1-5 5l-.8-.8" />
            <path d="M14 11a3.5 3.5 0 0 1-5.6.4L6.9 9.9a3.5 3.5 0 0 1 5-5l.8.8" />
          }
        }
      </svg>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
      color: inherit;
      flex-shrink: 0;
    }
    svg {
      width: 1em;
      height: 1em;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    i {
      font-size: 1em;
      line-height: 1;
    }
  `,
})
export class UiIcon {
  readonly name = input('');
  private readonly resolved = computed(() => resolveIconName(this.name()));
  readonly devicon = computed(() => (isDevicon(this.resolved()) ? this.resolved() : ''));
  readonly glyph = computed(() => (this.devicon() ? '' : this.resolved()));
}
