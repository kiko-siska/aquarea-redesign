/**
 * V6 · Čistá voda: effects layered on a page that is complete without JS (Phase 5).
 * Motion budget: one signature (water light, hero photo only), H1 focus-in, below-the-fold reveals,
 * count-up on two facts, card ripple, gallery Flip + lightbox, marquee with pause. Everything else is
 * CSS in lib/motion/motion.css. Each effect has a reduced-motion version (withMotion / CSS media query).
 */
import { ripple } from '../../lib/motion/ripple';
import { marquee } from '../../lib/motion/marquee';
import { withMotion } from '../../lib/motion/reduced';

const idle = (cb: () => void, timeout = 2000) =>
  'requestIdleCallback' in window ? (window as Window & { requestIdleCallback: (f: () => void, o?: object) => void }).requestIdleCallback(cb, { timeout }) : setTimeout(cb, 200);
const afterLoad = (cb: () => void) => (document.readyState === 'complete' ? cb() : window.addEventListener('load', cb, { once: true }));

export async function initV6() {
  // no-dependency pieces first
  ripple(document);
  marquee(document.querySelector('[data-marquee]'), document.querySelector('[data-marquee-toggle]'));

  // hero signature: after LCP, when the browser is idle
  afterLoad(() => idle(async () => {
    const frame = document.querySelector<HTMLElement>('[data-water-light]');
    const img = frame?.querySelector('img');
    if (!frame || !img) return;
    if (!img.complete) await img.decode().catch(() => undefined);
    const { waterLight } = await import('../../lib/motion/water-light');
    const wl = waterLight(frame, img);
    (window as unknown as { __v6: object }).__v6 = { water: wl, get frames() { return wl?.frames ?? 0; }, get running() { return wl?.running ?? false; } };
  }));

  // gsap and the reveal/gallery code load after `load`, so they never compete with the LCP photo
  await new Promise<void>((r) => afterLoad(() => r()));
  const [{ gsap }, { SplitText }, { Flip }, { reveal }, { countUp }, { focusIn }, { flipGallery }] = await Promise.all([
    import('gsap'), import('gsap/SplitText'), import('gsap/Flip'),
    import('../../lib/motion/reveal'), import('../../lib/motion/count-up'), import('../../lib/motion/focus-in'), import('../../lib/motion/flip-gallery'),
  ]);
  gsap.registerPlugin(SplitText, Flip);

  withMotion(gsap, () => {
    focusIn(gsap, SplitText, document.querySelector('[data-v6-h1]'));
    const undoReveal = reveal(gsap, document);
    const undoCount = countUp(gsap, document.querySelectorAll<HTMLElement>('[data-count]'));
    return () => { undoReveal(); undoCount(); };
  });

  const gallery = document.querySelector<HTMLElement>('[data-flip-gallery]');
  if (gallery) flipGallery(gallery, gsap, Flip);
}
