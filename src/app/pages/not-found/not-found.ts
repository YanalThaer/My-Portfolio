import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageTransition } from '../../core/page-transition';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  protected readonly transition = inject(PageTransition);
}
