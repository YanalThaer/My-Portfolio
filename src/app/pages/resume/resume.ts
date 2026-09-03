import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PageTransition } from '../../core/page-transition';
import { I18n } from '../../core/i18n';
import { Portfolio } from '../../core/portfolio';
import { PageSkeleton } from '../../shared/page-skeleton';
import { UiIcon } from '../../shared/ui-icon';

@Component({
  selector: 'app-resume',
  imports: [UiIcon, PageSkeleton],
  templateUrl: './resume.html',
  styleUrl: './resume.scss',
})
export class Resume {
  protected readonly data = toSignal(inject(Portfolio).getData());
  protected readonly i18n = inject(I18n);
  protected readonly transition = inject(PageTransition);
  protected readonly activeTab = signal(0);

  selectTab(index: number): void {
    const last = (this.data()?.resume.tabs.length ?? 1) - 1;
    this.activeTab.set(Math.max(0, Math.min(index, last)));
    document.querySelector('section.resume')?.scrollTo({ top: 0 });
  }

  onTabKey(event: KeyboardEvent, index: number): void {
    const count = this.data()?.resume.tabs.length ?? 0;
    if (!count) {
      return;
    }
    const last = count - 1;
    let next = index;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      next = index === last ? 0 : index + 1;
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      next = index === 0 ? last : index - 1;
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = last;
    } else {
      return;
    }
    event.preventDefault();
    this.selectTab(next);
    queueMicrotask(() => document.getElementById(`resume-tab-${next}`)?.focus());
  }
}
