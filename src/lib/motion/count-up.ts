/**
 * Count-up for key facts. The final value stays in the HTML (and is what screen readers get);
 * only an aria-hidden copy counts, in a box fixed to the final width so nothing shifts.
 * Usage: `<dd data-count>1000+ m</dd>` → counts 0 → 1000, keeps "+ m". Runs once when it enters view.
 * Reduced motion: don't call it (the HTML already shows the final value).
 */
import type { gsap as GSAP } from 'gsap';

export function countUp(gsap: typeof GSAP, els: Iterable<HTMLElement>, opts: { duration?: number } = {}) {
  const { duration = 0.9 } = opts;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      run(e.target as HTMLElement);
    }
  }, { rootMargin: '0px 0px -10% 0px' });

  const runs: (() => void)[] = [];
  function run(el: HTMLElement) {
    const final = el.textContent?.trim() ?? '';
    const m = final.match(/^(\D*?)(\d[\d\s ]*)(.*)$/);
    if (!m) return;
    const [, pre, digits, post] = m;
    const target = Number(digits.replace(/[\s ]/g, ''));
    const width = el.getBoundingClientRect().width;
    const live = document.createElement('span');
    live.setAttribute('aria-hidden', 'true');
    live.style.cssText = `display:inline-block;min-width:${Math.ceil(width)}px;font-variant-numeric:tabular-nums`;
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = final;
    el.replaceChildren(sr, live);
    const o = { v: 0 };
    live.textContent = `${pre}0${post}`;
    gsap.to(o, {
      v: target, duration, ease: 'power2.out',
      onUpdate: () => { live.textContent = `${pre}${Math.round(o.v)}${post}`; },
      onComplete: () => { el.textContent = final; },
    });
    runs.push(() => { el.textContent = final; });
  }
  for (const el of els) io.observe(el);
  return () => { io.disconnect(); runs.forEach((r) => r()); };
}
