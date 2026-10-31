/**
 * The navbar's Zavolať / Rezervovať buttons stay tucked away while the hero shows its own pair; once the hero buttons have
 * scrolled up under the header, the navbar pair eases in (owner request 2026-10-31). Reverses when scrolling back up.
 * Without JS, `cta-dock.css` (via <noscript>) shows the navbar buttons all the time, so nothing is ever missing.
 */
export function initCtaDock(header: HTMLElement | null) {
  if (!header) return;
  const target = document.querySelector<HTMLElement>('[data-hero-cta]');
  // no hero buttons on this page (or no IntersectionObserver): the navbar keeps its buttons
  if (!target || !('IntersectionObserver' in window)) { header.setAttribute('data-cta-docked', ''); return; }
  const h = Math.round(header.getBoundingClientRect().height);
  const io = new IntersectionObserver(([e]) => {
    // "past" = out of view above the header; out of view below it (not scrolled there yet) is not docked
    header.toggleAttribute('data-cta-docked', !e.isIntersecting && e.boundingClientRect.bottom <= h + 1);
  }, { rootMargin: `-${h}px 0px 0px 0px`, threshold: 0 });
  io.observe(target);
}
