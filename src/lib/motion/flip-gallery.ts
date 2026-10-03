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
  const grid = root.querySelector<HTMLElement>('[data-gallery-grid]');
  if (filters) filters.hidden = false;

  chips.forEach((chip) => chip.addEventListener('click', () => {
    const f = chip.dataset.filter!;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    const state = Flip.getState(items);
    const h0 = grid?.offsetHeight ?? 0;
    let shown = 0;
    items.forEach((li) => { const on = f === 'all' || li.dataset.group === f; li.hidden = !on; if (on) shown++; });
    if (status) status.textContent = `Zobrazené fotografie: ${shown}`;
    if (prefersReducedMotion() || !grid) return;
    // hold the old height while cards glide, then ease to the new one (no jump of the section below)
    grid.style.minHeight = `${h0}px`;
    Flip.from(state, {
      onComplete: () => {
        grid.style.minHeight = '';
        const h1 = grid.offsetHeight;
        if (h1 < h0) gsap.fromTo(grid, { minHeight: h0 }, { minHeight: h1, duration: 0.3, ease: 'power2.inOut', clearProps: 'minHeight' });
      },
      duration: 0.5, ease: 'power2.inOut', absolute: true, scale: true, zIndex: 1,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.35, delay: 0.12 }),
      // leavers fade out fast and stay behind the cards that remain
      onLeave: (els) => { gsap.set(els, { zIndex: 0 }); return gsap.to(els, { opacity: 0, scale: 0.96, duration: 0.15, ease: 'power1.out' }); },
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
