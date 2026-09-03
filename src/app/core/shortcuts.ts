export const PAGE_SHORTCUTS = [
  { code: 'KeyH', key: 'H', path: '/', nav: 'home' },
  { code: 'KeyW', key: 'W', path: '/work', nav: 'work' },
  { code: 'KeyR', key: 'R', path: '/resume', nav: 'resume' },
  { code: 'KeyP', key: 'P', path: '/projects', nav: 'projects' },
  { code: 'KeyC', key: 'C', path: '/contact', nav: 'contact' },
] as const;

export type NavKey = (typeof PAGE_SHORTCUTS)[number]['nav'];

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    return true;
  }
  return target.isContentEditable;
}

export function isHelpKey(event: KeyboardEvent): boolean {
  return event.key === '?' || (event.code === 'Slash' && event.shiftKey);
}

export function currentPath(url: string): string {
  const path = url.split('?')[0].split('#')[0];
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path || '/';
}
