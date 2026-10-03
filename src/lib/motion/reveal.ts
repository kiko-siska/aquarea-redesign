/**
 * Scroll reveal: transform + opacity only, once per element, 400 ms, 20 px travel, ≤ 50 ms stagger.
 * - Targets: `[data-reveal]` and the children of `[data-reveal-group]`.
 * - Never hides anything that is already on screen when the script runs (no reveal above the fold),
 *   and the hidden state is applied by this function itself, so content is visible without JS.
 * - Call it inside `withMotion(...)` full branch; the returned cleanup restores every element.
 */
import type { gsap as GSAP } from 'gsap';

export function reveal(gsap: typeof GSAP, root: ParentNode = document, opts: { y?: number; duration?: number; stagger?: number } = {}) {
  const { y = 20, duration = 0.4, stagger = 0.05 } = opts;
  if (!('IntersectionObserver' in window)) return () => {};
  const targets: HTMLElement[] = [
    ...root.querySelectorAll<HTMLElement>('[data-reveal]'),
    ...[...root.querySelectorAll<HTMLElement>('[data-reveal-group]')].flatMap((g) => [...g.children] as HTMLElement[]),
  ];
  const fold = window.innerHeight;
  const pending = targets.filter((el) => el.getBoundingClientRect().top > fold);
  if (!pending.length) return () => {};
  gsap.set(pending, { opacity: 0, y });

  const io = new IntersectionObserver((entries) => {
    const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
    if (!entering.length) return;
    entering.forEach((el) => io.unobserve(el));
    gsap.to(entering, { opacity: 1, y: 0, duration, ease: 'power2.out', stagger, overwrite: true, clearProps: 'opacity,transform' });
  }, { rootMargin: '0px 0px -6% 0px' });
  pending.forEach((el) => io.observe(el));

  return () => {
    io.disconnect();
    gsap.set(pending, { clearProps: 'opacity,transform' });
  };
}
