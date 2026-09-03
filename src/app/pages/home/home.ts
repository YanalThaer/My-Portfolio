import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { whatsappUrlFromDetails } from '../../core/contact-links';
import { PageTransition } from '../../core/page-transition';
import { I18n } from '../../core/i18n';
import { Portfolio } from '../../core/portfolio';
import { UiIcon } from '../../shared/ui-icon';

@Component({
  selector: 'app-home',
  imports: [RouterLink, UiIcon],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly data = toSignal(inject(Portfolio).getData());
  protected readonly i18n = inject(I18n);
  protected readonly transition = inject(PageTransition);

  whatsappUrl(): string | null {
    return whatsappUrlFromDetails(this.data()?.contact.details);
  }
}
