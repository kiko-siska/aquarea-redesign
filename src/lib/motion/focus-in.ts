/**
 * Headline "comes into focus" like a view through settling water: words go from a 6 px blur and a
 * 0.12 em offset to sharp, ≤ 600 ms in total. No opacity change, so the text is readable and selectable
 * the whole time (and LCP is unaffected). Runs once, only if it can start early (before `maxDelay` ms
 * after navigation) and the heading is on screen; the split is reverted afterwards.
 * Reduced motion: don't call it.
 */
import type { gsap as GSAP } from 'gsap';
import type { SplitText as SplitTextT } from 'gsap/SplitText';

export function focusIn(gsap: typeof GSAP, SplitText: typeof SplitTextT, el: HTMLElement | null, opts: { maxDelay?: number } = {}) {
  const { maxDelay = 1800 } = opts;
  if (!el || performance.now() > maxDelay || window.scrollY > 40) return;
  const r = el.getBoundingClientRect();
  if (r.bottom < 0 || r.top > window.innerHeight) return;
  const split = SplitText.create(el, { type: 'words', wordsClass: 'm-word' });
  gsap.fromTo(split.words,
    { filter: 'blur(6px)', y: '0.12em' },
    { filter: 'blur(0px)', y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.04, onComplete: () => split.revert() });
}
