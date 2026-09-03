import { DOCUMENT } from '@angular/common';
import { Component, HostListener, afterNextRender, effect, inject, signal, untracked } from '@angular/core';
import { Extras } from '../core/extras';

@Component({
  selector: 'app-site-cursor',
  template: `
    @if (visible() && !overField()) {
      <div class="site-cursor" aria-hidden="true">
        <span class="site-cursor-ring"></span>
        <span class="site-cursor-dot"></span>
      </div>
    }
  `,
  styles: `
    :host {
      pointer-events: none;
    }
    .site-cursor-dot,
    .site-cursor-ring {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 400;
      border-radius: 50%;
      pointer-events: none;
      will-change: transform;
    }
    .site-cursor-dot {
      width: 0.7rem;
      height: 0.7rem;
      margin: -0.35rem 0 0 -0.35rem;
      background: var(--main-color);
    }
    .site-cursor-ring {
      width: 3.2rem;
      height: 3.2rem;
      margin: -1.6rem 0 0 -1.6rem;
      border: 0.15rem solid color-mix(in srgb, var(--main-color) 80%, transparent);
    }
  `,
})
export class SiteCursor {
  private readonly document = inject(DOCUMENT);
  private readonly extras = inject(Extras);
  protected readonly visible = signal(false);
  protected readonly overField = signal(false);
  private hover = false;
  private x = 0;
  private y = 0;
  private ringX = 0;
  private ringY = 0;
  private hasPos = false;

  constructor() {
    effect(() => {
      const on = this.extras.cursorOn();
      untracked(() => {
        if (on && this.deviceAllowsCursor()) {
          this.show();
        } else {
          this.hide();
        }
      });
    });
    afterNextRender(() => this.loop());
  }

  @HostListener('document:pointermove', ['$event'])
  onMove(event: PointerEvent): void {
    this.x = event.clientX;
    this.y = event.clientY;
    if (!this.hasPos) {
      this.ringX = this.x;
      this.ringY = this.y;
      this.hasPos = true;
    }

    if (!this.extras.cursorOn() || !this.deviceAllowsCursor()) {
      return;
    }

    this.show();
    const target = event.target;
    const field =
      target instanceof HTMLElement &&
      !!(target.closest('input, textarea, select') || target.isContentEditable);
    this.overField.set(field);
    this.hover = !field && target instanceof Element && isInteractive(target);
    this.document.documentElement.classList.toggle('custom-cursor-text', field);
  }

  private deviceAllowsCursor(): boolean {
    const fine = this.document.defaultView?.matchMedia('(pointer: fine)').matches;
    const reduce = this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !!fine && !reduce;
  }

  private show(): void {
    if (!this.hasPos) {
      return;
    }
    this.visible.set(true);
    this.document.documentElement.classList.add('custom-cursor');
  }

  private hide(): void {
    this.visible.set(false);
    this.overField.set(false);
    this.document.documentElement.classList.remove('custom-cursor', 'custom-cursor-text');
  }

  private loop(): void {
    const tick = () => {
      if (this.visible() && !this.overField()) {
        this.ringX += (this.x - this.ringX) * 0.22;
        this.ringY += (this.y - this.ringY) * 0.22;
        const scale = this.hover ? 1.55 : 1;
        const fill = this.hover ? 'color-mix(in srgb, var(--main-color) 14%, transparent)' : 'transparent';
        const dot = this.document.querySelector('.site-cursor-dot') as HTMLElement | null;
        const ring = this.document.querySelector('.site-cursor-ring') as HTMLElement | null;
        dot?.style.setProperty('transform', `translate3d(${this.x}px, ${this.y}px, 0)`);
        ring?.style.setProperty(
          'transform',
          `translate3d(${this.ringX}px, ${this.ringY}px, 0) scale(${scale})`,
        );
        ring?.style.setProperty('background', fill);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

function isInteractive(node: Element): boolean {
  return !!node.closest(
    'a, button, label, summary, [role="button"], [role="option"], .tool-btn, .accent-swatch, .filter-btn',
  );
}
