import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { I18n } from '../../core/i18n';
import { PageTransition } from '../../core/page-transition';
import { Portfolio } from '../../core/portfolio';
import { findProject, projectSlug, splitTech } from '../../core/projects';

@Component({
  selector: 'app-project-detail',
  imports: [RouterLink],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
})
export class ProjectDetail {
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18n);
  protected readonly transition = inject(PageTransition);
  protected readonly data = toSignal(inject(Portfolio).getData());
  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('slug') ?? '' },
  );

  protected readonly project = computed(() => {
    const slug = this.slug();
    const projects = this.data()?.projects ?? [];
    return slug ? findProject(projects, slug) ?? null : null;
  });

  protected readonly others = computed(() => {
    const current = this.project();
    return (this.data()?.projects ?? []).filter((item) => item !== current).slice(0, 3);
  });

  protected readonly techs = computed(() => {
    const tech = this.project()?.tech;
    return tech ? splitTech(tech) : [];
  });

  protected readonly initial = computed(() => {
    const title = this.project()?.title?.trim();
    return title ? title.charAt(0).toUpperCase() : '';
  });

  slugOf = projectSlug;
}
