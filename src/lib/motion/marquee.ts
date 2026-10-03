/**
 * m-marquee: starts the CSS marquee only when JS can also offer a pause button (WCAG 2.2.2).
 * Clones the list once (aria-hidden) for a seamless loop, pauses on hover and keyboard focus (CSS),
 * and on the visible toggle button. Reduced motion: does nothing, the logos stay a static row.
 */
import { REDUCE } from './reduced';

export function marquee(el: HTMLElement | null, toggle: HTMLButtonElement | null, labels = { pause: 'Pozastaviť pohyb', play: 'Spustiť pohyb' }) {
  if (!el) return;
  const track = el.querySelector<HTMLElement>('.m-marquee-track');
  if (!track) return;
  const mq = matchMedia(REDUCE);
  [...track.children].forEach((li) => {
    const c = li.cloneNode(true) as HTMLElement;
    c.setAttribute('aria-hidden', 'true');
    c.dataset.clone = '';
    c.querySelectorAll('img').forEach((i) => i.setAttribute('alt', ''));
    track.append(c);
  });
  // runs only while motion is allowed; follows the OS setting live (clones are hidden by CSS under reduce)
  const apply = () => { el.toggleAttribute('data-running', !mq.matches); if (toggle) toggle.hidden = mq.matches; };
  apply();
  mq.addEventListener('change', apply);
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const paused = el.hasAttribute('data-paused');
    el.toggleAttribute('data-paused', !paused);
    toggle.setAttribute('aria-pressed', String(!paused));
    toggle.textContent = paused ? labels.pause : labels.play;
  });
}
