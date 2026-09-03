import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { whatsappUrlFromDetails } from '../../core/contact-links';
import { PageTransition } from '../../core/page-transition';
import { I18n } from '../../core/i18n';
import { Portfolio } from '../../core/portfolio';
import { PageSkeleton } from '../../shared/page-skeleton';
import { UiIcon } from '../../shared/ui-icon';

const HOME_SKILL_COUNT = 7;

@Component({
  selector: 'app-home',
  imports: [RouterLink, UiIcon, PageSkeleton],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly data = toSignal(inject(Portfolio).getData());
  protected readonly i18n = inject(I18n);
  protected readonly transition = inject(PageTransition);
  protected readonly featuredSkills = computed(() =>
    (this.data()?.resume.skills ?? []).slice(0, HOME_SKILL_COUNT),
  );

  whatsappUrl(): string | null {
    return whatsappUrlFromDetails(this.data()?.contact.details);
  }
}
