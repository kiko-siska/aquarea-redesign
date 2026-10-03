/**
 * V7 diver rig driver. One gsap.ticker callback sets the rotation of each rig part to
 * `rest + amp·sin(phase)`: flutter kick 1.2 s per cycle (the legs layer ±13° around the hip, the torso ±2.2° in answer, whole-figure pitch ±3.2°), a slow bob. Sine = sine.inOut feel.
 * Because the values are computed (not tweened from a keyframe), starting eases the amplitude in from 0 and
 * stopping eases it back to the rest pose, which is the static, composed pose of the photo (see DiverPhoto.astro).
 * All transform-only; the pivot of every layer is the hip (CSS transform-origin).
 * Interaction: drift toward the pointer (≤ 40 px away from the panel, ≤ 20 px toward it) and tilt, kick speed rises with pointer movement and scrolling,
 * a tap/burst makes a stronger kick, scrolling the hero nudges the diver down ≤ 80 px.
 */
import type { gsap as GSAP } from 'gsap';

type Part = { el: Element; rest: number; amp: number; phase: number; freq: number; set: (v: number) => void };

export function rigDiver(rig: HTMLElement, wrap: HTMLElement | null, nudge: HTMLElement | null, gsap: typeof GSAP) {
  const q = (n: string) => rig.querySelector<HTMLElement>(`[data-d="${n}"]`)!;
  const T = 1.2; // seconds per kick cycle
  const cfg: [string, number, number, number][] = [
    // name, amplitude (deg), phase (rad), frequency multiplier
    ['legs', 13, 0, 1],        // legs + fins kick around the hip (the cut-out's second layer)
    ['upper', 2.2, 0.9, 1],   // the torso answers the kick
    ['body', 3.2, 1.9, 0.5],  // whole-figure pitch, twice as slow
  ];
  const parts: Part[] = cfg.map(([n, amp, phase, freq]) => {
    const el = q(n);
    return { el, rest: 0, amp, phase, freq, set: gsap.quickSetter(el, 'rotation', 'deg') as (v: number) => void };
  });
  const setBob = gsap.quickSetter(rig, 'y', 'px') as (v: number) => void;
  const driftX = wrap ? gsap.quickTo(wrap, 'x', { duration: 0.9, ease: 'power3' }) : null;
  const driftY = wrap ? gsap.quickTo(wrap, 'y', { duration: 0.9, ease: 'power3' }) : null;
  const tilt = wrap ? gsap.quickTo(wrap, 'rotation', { duration: 1.1, ease: 'power3' }) : null;
  const setNudge = nudge ? (gsap.quickSetter(nudge, 'y', 'px') as (v: number) => void) : null;

  let running = false, ampNow = 0, ampTarget = 0, speed = 1, phaseT = 0, bobT = 0;
  let pointerBoost = 0, scrollBoost = 0, burstBoost = 0, lastScroll = window.scrollY, nudgeY = 0, heroVisible = true;

  const apply = () => {
    for (const p of parts) p.set(p.rest + p.amp * ampNow * Math.sin(phaseT * p.freq * ((Math.PI * 2) / T) + p.phase));
    setBob(7 * ampNow * Math.sin(bobT * ((Math.PI * 2) / 3.2)));
  };
  const toRest = () => { for (const p of parts) p.set(p.rest); setBob(0); };

  const tick = (_t: number, deltaMs: number) => {
    const dt = Math.min(deltaMs / 1000, 0.05);
    ampNow += (ampTarget - ampNow) * Math.min(1, dt * (ampTarget ? 4 : 9)); // ease in slowly, settle to the static pose in ~0.5 s
    pointerBoost *= Math.pow(0.12, dt);
    burstBoost *= Math.pow(0.3, dt);
    const sy = window.scrollY;
    scrollBoost = scrollBoost * Math.pow(0.1, dt) + Math.min(Math.abs(sy - lastScroll) * 0.04, 1.2);
    lastScroll = sy;
    if (setNudge && heroVisible) {
      const target = Math.max(0, Math.min(80, sy * 0.2));
      if (Math.abs(target - nudgeY) > 0.4) { nudgeY += (target - nudgeY) * Math.min(1, dt * 8); setNudge(nudgeY); }
    }
    speed += (1 + pointerBoost + scrollBoost + burstBoost - speed) * Math.min(1, dt * 6);
    phaseT += dt * speed;
    bobT += dt;
    apply();
    if (!ampTarget && ampNow < 0.02) { gsap.ticker.remove(tick); running = false; ampNow = 0; toRest(); }
  };

  return {
    start() { ampTarget = 1; if (!running) { running = true; gsap.ticker.add(tick); } },
    /** ease back to the static pose, then stop the loop */
    stop() { ampTarget = 0; if (!running) toRest(); },
    /** run for ms, then settle (hover kick on the static diver) */
    pulse(ms: number) { this.start(); gsap.delayedCall(ms / 1000, () => this.stop()); },
    pointer(nx: number, ny: number, movePx: number) {
      driftX?.(nx > 0 ? nx * 20 : nx * 40); // less toward the panel, so the head never reaches its angled edge driftY?.(ny * 28); tilt?.(nx * 4);
      pointerBoost = Math.min(1.6, pointerBoost + movePx * 0.012);
    },
    leave() { driftX?.(0); driftY?.(0); tilt?.(0); },
    burst() { burstBoost = 1.6; },
    setHeroVisible(v: boolean) { heroVisible = v; },
    destroy() { gsap.ticker.remove(tick); running = false; ampNow = 0; ampTarget = 0; toRest(); if (wrap) gsap.set(wrap, { clearProps: 'transform' }); setNudge?.(0); },
    get running() { return running; },
  };
}

/** ≤ 12 pooled bubbles (transform/opacity only): 3 breath bubbles from the regulator, the rest ambient or burst. */
export function bubbleField(stage: HTMLElement, els: HTMLElement[], reg: Element | null, gsap: typeof GSAP) {
  const tweens = new Map<HTMLElement, gsap.core.Timeline>();
  let on = false;
  const launch = (el: HTMLElement, mode: 'breath' | 'ambient' | 'burst', px = 0, py = 0) => {
    tweens.get(el)?.kill();
    const r = stage.getBoundingClientRect();
    let x: number, y: number, rise: number, size: number, dur: number;
    if (mode === 'breath' && reg) {
      const rr = reg.getBoundingClientRect();
      x = rr.left + rr.width / 2 - r.left; y = rr.top + rr.height / 2 - r.top;
      rise = r.height * 0.32 + Math.random() * 40; size = 7 + Math.random() * 7; dur = 2.2 + Math.random();
    } else if (mode === 'burst') {
      x = px; y = py; rise = 90 + Math.random() * 120; size = 8 + Math.random() * 12; dur = 1.2 + Math.random() * 0.6;
    } else {
      x = Math.random() * r.width; y = r.height * (0.55 + Math.random() * 0.4);
      rise = r.height * (0.25 + Math.random() * 0.3); size = 5 + Math.random() * 9; dur = 5 + Math.random() * 4;
    }
    el.style.setProperty('--s', `${size}px`);
    const fade = Math.min(0.8, dur / 2);
    const t = gsap.timeline({ onComplete: () => { if (on) launch(el, el.dataset.role === 'breath' ? 'breath' : 'ambient'); } });
    t.fromTo(el, { x, y, opacity: 0, scale: 0.6 }, { opacity: 0.85, scale: 1, duration: 0.3 }, 0)
      .to(el, { y: y - rise, x: x + (Math.random() - 0.5) * 30, duration: dur, ease: 'sine.out' }, 0)
      .to(el, { opacity: 0, duration: fade }, dur - fade);
    tweens.set(el, t);
  };
  els.forEach((el, i) => { el.dataset.role = i < 3 ? 'breath' : 'ambient'; });
  return {
    start() { if (on) return; on = true; els.forEach((el, i) => gsap.delayedCall(i * 0.4, () => { if (on) launch(el, i < 3 ? 'breath' : 'ambient'); })); },
    stop() { on = false; tweens.forEach((t) => t.kill()); tweens.clear(); gsap.killTweensOf(els); gsap.set(els, { opacity: 0 }); },
    burst(px: number, py: number) { if (!on) return; els.slice(3).forEach((el) => launch(el, 'burst', px + (Math.random() - 0.5) * 60, py + (Math.random() - 0.5) * 30)); },
  };
}
