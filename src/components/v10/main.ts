/**
 * V10 · Mapa z výšky: effects layered on a page that is complete without JS (Phase 8).
 * Without JS: the aerial, the pins, the dock and the sticky "curtain" (pure CSS position: sticky) all work; nothing moves.
 * With JS (after `load`, so it never competes with the LCP photo):
 *  - drone drift (CSS keyframes on .v10-drift) runs only while [data-live]; paused by the button, off-screen,
 *    in hidden tabs, while the flight scrolls ([data-flying]) and once the curtain covers the hero ([data-covered]).
 *    A sticky hero that is covered still "intersects", so covered/flying come from ScrollTrigger geometry, not from IO.
 *  - scroll flight: .v10-scale 1 → 1.12 toward the beach while the white page rises (scrub, transform only).
 *  - zone stops: each photo pushes in 1 → 1.08 while it passes (scrub, transform only).
 * Reduced motion (live, gsap.matchMedia): no scroll scale, no push-in, the drift only after the visitor presses play.
 */
import { marquee } from '../../lib/motion/marquee';
import { withMotion } from '../../lib/motion/reduced';

const afterLoad = (cb: () => void) => (document.readyState === 'complete' ? cb() : window.addEventListener('load', cb, { once: true }));
const ICON_PAUSE = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>';
const ICON_PLAY = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>';

export async function initV10() {
  marquee(document.querySelector('[data-marquee]'), document.querySelector('[data-marquee-toggle]'));
  await new Promise<void>((r) => afterLoad(() => r()));

  const [{ gsap }, { ScrollTrigger }, { Flip }, { flipGallery }] = await Promise.all([
    import('gsap'), import('gsap/ScrollTrigger'), import('gsap/Flip'), import('../../lib/motion/flip-gallery'),
  ]);
  gsap.registerPlugin(ScrollTrigger, Flip);

  const hero = document.querySelector<HTMLElement>('[data-v10-hero]');
  const stage = document.querySelector<HTMLElement>('[data-v10-stage]');
  const scale = stage?.querySelector<HTMLElement>('[data-v10-scale]') ?? null;
  const curtain = document.querySelector<HTMLElement>('[data-v10-curtain]');
  const header = document.querySelector<HTMLElement>('.v10-header');
  const pauseBtn = stage?.querySelector<HTMLButtonElement>('[data-v10-pause]') ?? null;
  const set = (attr: string, on: boolean) => stage?.toggleAttribute(attr, on);

  // flight state (both motion modes): flying while the curtain rises, covered once it fills the hero
  if (stage && curtain) {
    ScrollTrigger.create({
      trigger: curtain,
      start: 0,
      end: () => `top ${header?.offsetHeight ?? 64}px`,
      onUpdate: (st) => { set('data-flying', st.progress > 0.002 && st.progress < 1); },
      onLeave: () => { set('data-flying', false); set('data-covered', true); },
      onEnterBack: () => set('data-covered', false),
    });
  }

  // drift + pause/play (WCAG 2.2.2). `autostart` false = reduced motion: still pose + a play button (opt-in).
  const drift = (autostart: boolean) => {
    if (!hero || !stage) return () => {};
    let paused = !autostart, visible = true;
    stage.setAttribute('data-live', '');
    stage.toggleAttribute('data-optin', !autostart);
    const sync = () => {
      stage.toggleAttribute('data-paused', paused);
      stage.toggleAttribute('data-offscreen', !visible || document.hidden);
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold: 0.02 });
    io.observe(hero);
    const onVis = () => sync();
    document.addEventListener('visibilitychange', onVis);
    if (pauseBtn) {
      pauseBtn.hidden = false;
      const label = (p: boolean) => {
        pauseBtn.setAttribute('aria-pressed', String(p));
        pauseBtn.setAttribute('aria-label', p ? 'Spustiť pomalý prelet nad areálom' : 'Zastaviť pomalý prelet nad areálom');
        pauseBtn.innerHTML = p ? ICON_PLAY : ICON_PAUSE;
      };
      label(paused);
      pauseBtn.onclick = () => { paused = !paused; label(paused); sync(); };
    }
    sync();
    (window as unknown as { __v10: object }).__v10 = {
      get drifting() { return stage.hasAttribute('data-live') && !paused && visible && !document.hidden && !stage.hasAttribute('data-flying') && !stage.hasAttribute('data-covered'); },
    };
    return () => {
      io.disconnect(); document.removeEventListener('visibilitychange', onVis);
      ['data-live', 'data-paused', 'data-offscreen', 'data-optin'].forEach((a) => stage.removeAttribute(a));
      if (pauseBtn) { pauseBtn.hidden = true; pauseBtn.onclick = null; }
    };
  };

  withMotion(gsap, () => {
    const undoDrift = drift(true);
    const tweens: gsap.core.Tween[] = [];
    // scroll flight: zoom toward the beach while the page rises over the map
    if (scale && curtain) {
      tweens.push(gsap.fromTo(scale, { scale: 1 }, {
        scale: 1.12, ease: 'none', force3D: true,
        scrollTrigger: { trigger: curtain, start: 0, end: () => `top ${header?.offsetHeight ?? 64}px`, scrub: 0.4 },
      }));
    }
    // zone stops: a slow push-in while each photo passes
    document.querySelectorAll<HTMLElement>('[data-v10-stop]').forEach((stop) => {
      const img = stop.querySelector('img');
      if (!img) return;
      tweens.push(gsap.fromTo(img, { scale: 1 }, {
        scale: 1.08, ease: 'none', force3D: true,
        scrollTrigger: { trigger: stop, start: 'top bottom', end: 'bottom top', scrub: 0.4 },
      }));
    });
    return () => { undoDrift(); tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); }); if (scale) gsap.set(scale, { clearProps: 'transform' }); };
  }, () => drift(false));

  const gallery = document.querySelector<HTMLElement>('[data-flip-gallery]');
  if (gallery) flipGallery(gallery, gsap, Flip);
}
