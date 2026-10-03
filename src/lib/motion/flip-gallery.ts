/**
 * Gallery filter + lightbox, layered on markup that already works without JS
 * (every thumbnail is a link to the large image, all photos visible, filter buttons `hidden`).
 *
 * Markup: [data-flip-gallery] > [data-gallery-filters] (buttons[data-filter], aria-pressed),
 *         [data-gallery-status] (polite live region), [data-gallery-grid] > li[data-group] > a[data-lightbox][data-caption],
 *         dialog[data-lightbox-dialog] with [data-lightbox-img] [data-lightbox-caption] [data-lightbox-prev|next|close].
 * Motion: filter = GSAP Flip (items glide to their new cells, leavers fade); lightbox = native
 * View Transition from the thumbnail to the large image where supported. Reduced motion: instant.
 */
import type { gsap as GSAP } from 'gsap';
import type { Flip as FlipT } from 'gsap/Flip';
import { prefersReducedMotion } from './reduced';

export function flipGallery(root: HTMLElement, gsap: typeof GSAP, Flip: typeof FlipT) {
  const filters = root.querySelector<HTMLElement>('[data-gallery-filters]');
  const status = root.querySelector<HTMLElement>('[data-gallery-status]');
  const items = [...root.querySelectorAll<HTMLElement>('[data-gallery-grid] > li')];
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  if (filters) filters.hidden = false;

  chips.forEach((chip) => chip.addEventListener('click', () => {
    const f = chip.dataset.filter!;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    const state = Flip.getState(items);
    let shown = 0;
    items.forEach((li) => { const on = f === 'all' || li.dataset.group === f; li.hidden = !on; if (on) shown++; });
    if (status) status.textContent = `Zobrazené fotografie: ${shown}`;
    if (prefersReducedMotion()) return;
    Flip.from(state, {
      duration: 0.5, ease: 'power2.inOut', absolute: true, scale: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.35, delay: 0.1 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.94, duration: 0.25 }),
    });
  }));

  // ---- lightbox ----
  const dialog = root.querySelector<HTMLDialogElement>('[data-lightbox-dialog]');
  const img = dialog?.querySelector<HTMLImageElement>('[data-lightbox-img]');
  const cap = dialog?.querySelector<HTMLElement>('[data-lightbox-caption]');
  if (!dialog || !img || !cap || typeof dialog.showModal !== 'function') return;
  const links = () => items.filter((li) => !li.hidden).map((li) => li.querySelector<HTMLAnchorElement>('a[data-lightbox]')!);
  let current: HTMLAnchorElement | null = null;

  const show = (a: HTMLAnchorElement) => {
    current = a;
    img.src = a.href;
    img.alt = a.querySelector('img')?.alt ?? '';
    cap.textContent = a.dataset.caption ?? '';
  };
  const withTransition = (thumb: HTMLImageElement | null, change: () => void) => {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };
    if (!doc.startViewTransition || prefersReducedMotion() || !thumb) { change(); return; }
    thumb.style.viewTransitionName = 'v6-photo';
    const vt = doc.startViewTransition(() => { thumb.style.viewTransitionName = ''; img.style.viewTransitionName = 'v6-photo'; change(); });
    vt.finished.finally(() => { img.style.viewTransitionName = ''; });
  };

  root.querySelectorAll<HTMLAnchorElement>('a[data-lightbox]').forEach((a) => a.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    withTransition(a.querySelector('img'), () => { show(a); dialog.showModal(); });
  }));
  const step = (d: number) => {
    const list = links();
    if (!current) return;
    const i = list.indexOf(current);
    show(list[(i + d + list.length) % list.length]);
  };
  dialog.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => step(-1));
  dialog.querySelector('[data-lightbox-next]')?.addEventListener('click', () => step(1));
  dialog.querySelector('[data-lightbox-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  dialog.addEventListener('close', () => { current?.focus(); });
}
