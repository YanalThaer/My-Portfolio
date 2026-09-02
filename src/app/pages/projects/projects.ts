import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { PageTransition } from '../../core/page-transition';
import { I18n } from '../../core/i18n';
import { Portfolio } from '../../core/portfolio';
import { ProjectItem } from '../../core/portfolio.model';
import { projectSlug, splitTech } from '../../core/projects';

const GENERIC_TECH = new Set([
  'html',
  'html5',
  'css',
  'css3',
  'ajax',
  'bootstrap',
  'local storage',
  'maven',
]);

@Component({
  selector: 'app-projects',
  imports: [RouterLink],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {
  protected readonly data = toSignal(inject(Portfolio).getData());
  protected readonly i18n = inject(I18n);
  protected readonly transition = inject(PageTransition);
  protected readonly selectedTech = signal('All');

  protected readonly techFilters = computed(() => {
    const tags = new Map<string, string>();
    for (const project of this.data()?.projects ?? []) {
      for (const tech of this.splitTech(project.tech)) {
        const key = tech.toLowerCase();
        if (GENERIC_TECH.has(key) || tags.has(key)) {
          continue;
        }
        tags.set(key, tech);
      }
    }
    return ['All', ...[...tags.values()].sort((a, b) => a.localeCompare(b))];
  });

  protected readonly filteredProjects = computed(() => {
    const projects = this.data()?.projects ?? [];
    const selected = this.selectedTech();
    if (selected === 'All') {
      return projects;
    }
    return projects.filter((project) =>
      this.splitTech(project.tech).some((tech) => tech.toLowerCase() === selected.toLowerCase()),
    );
  });

  selectTech(tech: string): void {
    this.selectedTech.set(tech);
  }

  splitTech = splitTech;
  slugOf = projectSlug;

  projectTrack(project: ProjectItem): string {
    return projectSlug(project);
  }
}
