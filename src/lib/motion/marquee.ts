/**
 * m-marquee: starts the CSS marquee only when JS can also offer a pause button (WCAG 2.2.2).
 * Clones the list once (aria-hidden) for a seamless loop, pauses on hover and keyboard focus (CSS),
 * and on the visible toggle button. Reduced motion: does nothing, the logos stay a static row.
 */
import { prefersReducedMotion } from './reduced';

export function marquee(el: HTMLElement | null, toggle: HTMLButtonElement | null, labels = { pause: 'Pozastaviť pohyb', play: 'Spustiť pohyb' }) {
  if (!el || prefersReducedMotion()) return;
  const track = el.querySelector<HTMLElement>('.m-marquee-track');
  if (!track) return;
  [...track.children].forEach((li) => {
    const c = li.cloneNode(true) as HTMLElement;
    c.setAttribute('aria-hidden', 'true');
    c.dataset.clone = '';
    c.querySelectorAll('img').forEach((i) => i.setAttribute('alt', ''));
    track.append(c);
  });
  el.dataset.running = '';
  if (!toggle) return;
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const paused = el.hasAttribute('data-paused');
    el.toggleAttribute('data-paused', !paused);
    toggle.setAttribute('aria-pressed', String(!paused));
    toggle.textContent = paused ? labels.pause : labels.play;
  });
}
