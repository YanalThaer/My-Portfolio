import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { whatsappUrlFromDetails } from '../../core/contact-links';
import { PageTransition } from '../../core/page-transition';
import { Portfolio } from '../../core/portfolio';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly data = toSignal(inject(Portfolio).getData());
  protected readonly transition = inject(PageTransition);

  whatsappUrl(): string | null {
    return whatsappUrlFromDetails(this.data()?.contact.details);
  }
}
