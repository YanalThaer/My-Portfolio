import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PageTransition } from '../../core/page-transition';
import { Portfolio } from '../../core/portfolio';

@Component({
  selector: 'app-resume',
  imports: [],
  templateUrl: './resume.html',
  styleUrl: './resume.scss',
})
export class Resume {
  protected readonly data = toSignal(inject(Portfolio).getData());
  protected readonly transition = inject(PageTransition);
  protected readonly activeTab = signal(0);

  selectTab(index: number): void {
    this.activeTab.set(index);
  }
}
