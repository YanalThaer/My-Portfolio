import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PageTransition } from '../../core/page-transition';
import { I18n } from '../../core/i18n';
import { Portfolio } from '../../core/portfolio';
import { UiIcon } from '../../shared/ui-icon';

@Component({
  selector: 'app-resume',
  imports: [UiIcon],
  templateUrl: './resume.html',
  styleUrl: './resume.scss',
})
export class Resume {
  protected readonly data = toSignal(inject(Portfolio).getData());
  protected readonly i18n = inject(I18n);
  protected readonly transition = inject(PageTransition);
  protected readonly activeTab = signal(0);

  selectTab(index: number): void {
    this.activeTab.set(index);
  }
}
