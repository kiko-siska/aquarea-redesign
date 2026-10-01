/**
 * Every internal link and asset path goes through here, so the site keeps
 * working when GitHub Pages serves it from a sub-path (BASE_PATH).
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(path = '/'): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  const [pathname, hash = ''] = clean.split('#');
  const withSlash = /\.[a-z0-9]+$/i.test(pathname) || pathname.endsWith('/') ? pathname : `${pathname}/`;
  return `${BASE}${withSlash}${hash ? `#${hash}` : ''}`;
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
