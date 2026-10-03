/**
 * Reduced-motion helpers. JS effects go through `withMotion` (gsap.matchMedia), so turning on
 * "reduce motion" in the OS reverts running effects and re-runs the static version immediately.
 * CSS effects in motion.css use the same media query; the two paths are equivalent.
 */
import type { gsap as GSAP } from 'gsap';

export const REDUCE = '(prefers-reduced-motion: reduce)';
export const MOTION_OK = '(prefers-reduced-motion: no-preference)';

export const prefersReducedMotion = () => typeof matchMedia === 'function' && matchMedia(REDUCE).matches;

/**
 * Run `full` when motion is allowed, `reduced` when the visitor asked for less motion.
 * Both may return a cleanup function. Returns the gsap.matchMedia instance (call .revert() to undo).
 */
export function withMotion(gsap: typeof GSAP, full: () => void | (() => void), reduced?: () => void | (() => void)) {
  const mm = gsap.matchMedia();
  mm.add({ ok: MOTION_OK, reduce: REDUCE }, (ctx) => {
    const { ok } = ctx.conditions as { ok: boolean; reduce: boolean };
    return ok ? full() : reduced?.();
  });
  return mm;
}
