/**
 * V7 · Rýchla voda: effects layered on a page that is complete without JS (Phase 6).
 * Signature (hero only): procedural water (CSS, switched on here) + the rigged diver (diver.ts).
 * Everything else comes from the V6 motion kit in src/lib/motion. One thing animates per viewport:
 * the hero loops only while the hero is on screen; below it only short, one-off reveals and the
 * hover kick of the static diver. Reduced motion (live, via gsap.matchMedia): no loops, static pose.
 */
import { ripple } from '../../lib/motion/ripple';
import { marquee } from '../../lib/motion/marquee';
import { withMotion } from '../../lib/motion/reduced';

const afterLoad = (cb: () => void) => (document.readyState === 'complete' ? cb() : window.addEventListener('load', cb, { once: true }));
const ICON_PAUSE = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>';
const ICON_PLAY = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>';

export async function initV7() {
  ripple(document);
  marquee(document.querySelector('[data-marquee]'), document.querySelector('[data-marquee-toggle]'));
  await new Promise<void>((r) => afterLoad(() => r()));

  const [{ gsap }, { SplitText }, { Flip }, { reveal }, { countUp }, { focusIn }, { flipGallery }, { rigDiver, bubbleField }] = await Promise.all([
    import('gsap'), import('gsap/SplitText'), import('gsap/Flip'),
    import('../../lib/motion/reveal'), import('../../lib/motion/count-up'), import('../../lib/motion/focus-in'), import('../../lib/motion/flip-gallery'),
    import('./diver'),
  ]);
  gsap.registerPlugin(SplitText, Flip);

  const hero = document.querySelector<HTMLElement>('[data-v7-hero]');
  const stage = document.querySelector<HTMLElement>('[data-v7-stage]');
  const svg = stage?.querySelector<SVGElement>('.v7-diver');
  const wrap = stage?.querySelector<HTMLElement>('.v7-diver-wrap') ?? null;
  const nudge = stage?.querySelector<HTMLElement>('.v7-diver-nudge') ?? null;
  const pauseBtn = stage?.querySelector<HTMLButtonElement>('[data-v7-pause]') ?? null;
  const bubbleEls = [...(stage?.querySelectorAll<HTMLElement>('.v7-bubble') ?? [])];

  // Hero: water + diver. Full branch = loops; reduced branch = nothing (the markup is the static pose).
  withMotion(gsap, () => {
    const cleanups: (() => void)[] = [];
    if (hero && stage && svg) {
      const rig = rigDiver(svg, wrap, nudge, gsap);
      const bubbles = bubbleField(stage, bubbleEls, svg.querySelector('[data-d="reg"]'), gsap);
      let paused = false, visible = true;
      stage.setAttribute('data-live', '');
      const sync = () => {
        const run = !paused && visible && !document.hidden;
        stage.toggleAttribute('data-offscreen', !visible);
        rig.setHeroVisible(visible);
        if (run) { rig.start(); bubbles.start(); } else { rig.stop(); bubbles.stop(); }
      };
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold: 0.05 });
      io.observe(hero);
      const onVis = () => sync();
      document.addEventListener('visibilitychange', onVis);

      // pause control (WCAG 2.2.2): everything returns to the static pose
      if (pauseBtn) {
        pauseBtn.hidden = false;
        const label = (p: boolean) => {
          pauseBtn.setAttribute('aria-pressed', String(p));
          pauseBtn.setAttribute('aria-label', p ? 'Spustiť animáciu vody a potápača' : 'Zastaviť animáciu vody a potápača');
          pauseBtn.innerHTML = p ? ICON_PLAY : ICON_PAUSE;
        };
        label(false);
        pauseBtn.onclick = () => { paused = !paused; stage.toggleAttribute('data-paused', paused); label(paused); sync(); };
      }

      // pointer: drift toward it, kick faster while it moves; tap/click: ripple ring + bubble burst + stronger kick
      let lx = 0, ly = 0;
      const onMove = (e: PointerEvent) => {
        if (paused || e.pointerType === 'touch') return;
        const r = hero.getBoundingClientRect();
        const nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
        const ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
        rig.pointer(nx, ny, Math.hypot(e.clientX - lx, e.clientY - ly));
        lx = e.clientX; ly = e.clientY;
      };
      const onLeave = () => rig.leave();
      const onDown = (e: PointerEvent) => {
        if (paused || (e.target as HTMLElement).closest('a, button, .v7-panel')) return;
        const r = stage.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        stage.querySelectorAll('.v7-ripple-ring').forEach((n, i, all) => { if (all.length > 2) n.remove(); });
        const ring = document.createElement('span');
        ring.className = 'v7-ripple-ring';
        ring.style.left = `${x}px`; ring.style.top = `${y}px`;
        ring.addEventListener('animationend', () => ring.remove());
        stage.append(ring);
        bubbles.burst(x, y);
        rig.burst();
      };
      hero.addEventListener('pointermove', onMove, { passive: true });
      hero.addEventListener('pointerleave', onLeave);
      hero.addEventListener('pointerdown', onDown, { passive: true });
      sync();
      (window as unknown as { __v7: object }).__v7 = { get running() { return rig.running; } };

      cleanups.push(() => {
        io.disconnect(); document.removeEventListener('visibilitychange', onVis);
        hero.removeEventListener('pointermove', onMove); hero.removeEventListener('pointerleave', onLeave); hero.removeEventListener('pointerdown', onDown);
        bubbles.stop(); rig.destroy();
        stage.removeAttribute('data-live'); stage.removeAttribute('data-paused'); stage.removeAttribute('data-offscreen');
        stage.querySelectorAll('.v7-ripple-ring').forEach((n) => n.remove());
        if (pauseBtn) pauseBtn.hidden = true;
      });
    }
    // below the hero (V6 motion kit): H1 focus-in, reveals, count-up
    focusIn(gsap, SplitText, document.querySelector('[data-v7-h1]'));
    const undoReveal = reveal(gsap, document);
    const undoCount = countUp(gsap, document.querySelectorAll<HTMLElement>('[data-count]'));
    cleanups.push(undoReveal, undoCount);
    return () => cleanups.forEach((c) => c());
  });

  // Dive Center: the same rig again, static, with a short kick on hover/focus (motion allowed only)
  const diveFig = document.querySelector<HTMLElement>('[data-v7-diver-static]');
  const diveSvg = diveFig?.querySelector<SVGElement>('.v7-diver');
  if (diveFig && diveSvg) {
    let rig: ReturnType<typeof rigDiver> | null = null;
    const kick = () => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      rig ??= rigDiver(diveSvg, null, null, gsap);
      if (!rig.running) rig.pulse(1300);
    };
    diveFig.addEventListener('pointerenter', kick);
    diveFig.addEventListener('pointerdown', kick);
  }

  const gallery = document.querySelector<HTMLElement>('[data-flip-gallery]');
  if (gallery) flipGallery(gallery, gsap, Flip);
}
