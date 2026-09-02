import { ProjectItem } from './portfolio.model';

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function projectSlug(project: ProjectItem): string {
  return project.slug || slugify(project.title);
}

export function splitTech(tech: string): string[] {
  return tech
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function findProject(projects: ProjectItem[], slug: string): ProjectItem | undefined {
  return projects.find((project) => projectSlug(project) === slug);
}
