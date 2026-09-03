import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { PageTransition } from '../../core/page-transition';
import { I18n } from '../../core/i18n';
import { Portfolio } from '../../core/portfolio';
import { PageSkeleton } from '../../shared/page-skeleton';
import { UiIcon } from '../../shared/ui-icon';

@Component({
  selector: 'app-services',
  imports: [RouterLink, UiIcon, PageSkeleton],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services {
  protected readonly data = toSignal(inject(Portfolio).getData());
  protected readonly i18n = inject(I18n);
  protected readonly transition = inject(PageTransition);
}
