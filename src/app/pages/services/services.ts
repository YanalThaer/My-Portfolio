import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { PageTransition } from '../../core/page-transition';
import { Portfolio } from '../../core/portfolio';

@Component({
  selector: 'app-services',
  imports: [RouterLink],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services {
  protected readonly data = toSignal(inject(Portfolio).getData());
  protected readonly transition = inject(PageTransition);
}
