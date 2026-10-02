/**
 * V4 · Čierna voda: page choreography (loaded only by /variants/4/, everything heavy via dynamic import).
 *
 * - The torch: follows a fine pointer; on touch you drag to aim it, otherwise it wanders on a
 *   Lissajous path so a phone never looks dead. Clicks/taps drop ripples into the water.
 * - Each section switches the photo in the beam with a hard "light off / light on" click.
 * - The beam warms text (per letter on the H1, per word on headings) but never hides it.
 * - One loop: gsap.ticker drives Lenis, the torch, the DOM light and the WebGL render. The render
 *   stops when the tab is hidden or the water zone is scrolled away (window.__v4.frames proves it).
 */
import type { Water, WaterPhoto } from './water';

type Data = { hero: string; photos: (WaterPhoto & { alt: string })[] };
type Heat = { el: HTMLElement; cx: number; cy: number; last: number };
type Lamp = { el: HTMLElement; x: number; y: number; w: number; h: number; lx: number; ly: number; lo: number };

function webgl2Available() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

export async function initV4() {
  const root = document.documentElement;
  const data = JSON.parse(document.getElementById('v4-data')?.textContent ?? '{}') as Data;
  const canvas = document.querySelector<HTMLCanvasElement>('.v4-water')!;
  root.dataset.gl = 'pending';

  const [{ gsap }, { ScrollTrigger }, { SplitText }, { default: Lenis }] = await Promise.all([
    import('gsap'), import('gsap/ScrollTrigger'), import('gsap/SplitText'), import('lenis'),
  ]);
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // ---------- smooth scroll, one ticker ----------
  const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -72 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  (window as unknown as { lenis: typeof lenis }).lenis = lenis;
  const header = document.querySelector<HTMLElement>('[data-v4-header]');
  lenis.on('scroll', ({ scroll }: { scroll: number }) => header?.toggleAttribute('data-scrolled', scroll > 40));

  // ---------- torch state ----------
  const fine = matchMedia('(pointer: fine)').matches;
  let W = window.innerWidth, H = window.innerHeight;
  const radius = () => Math.min(440, Math.max(190, Math.min(W, H) * 0.42));
  const torch = { x: W * 0.62, y: H * 0.42, tx: W * 0.62, ty: H * 0.42, on: 0, mode: 'idle' as 'idle' | 'pointer' | 'touch', touchEnd: 0 };
  let touching = false;
  const idleAt = (t: number) => [W * (0.5 + 0.3 * Math.sin(t * 0.37)), H * (0.46 + 0.26 * Math.sin(t * 0.53 + 1.3))];

  // ---------- WebGL water (poster stays underneath until the first frame) ----------
  let water: Water | null = null;
  let glOn = false;
  const startWater = async () => {
    if (!webgl2Available()) { root.dataset.gl = 'off'; return; }
    try {
      const { createWater } = await import('./water');
      water = createWater(canvas, data.photos, { mobile: !fine && W < 900, maxPr: 1.5 });
      await water.cut(data.hero);
      water.render(gsap.ticker.time, 0.016);
      glOn = true;
      root.dataset.gl = 'on';
      water.preload(data.photos.map((p) => p.id).filter((id) => id !== data.hero));
      canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); glOn = false; root.dataset.gl = 'off'; });
    } catch {
      glOn = false;
      root.dataset.gl = 'off';
    }
  };
  const waterReady = startWater();

  // caption: what the beam is showing right now (real photo alt text)
  const captionEl = document.querySelector<HTMLElement>('[data-v4-caption]');
  const captionBox = document.querySelector<HTMLElement>('.v4-caption');
  const altOf = (id: string) => data.photos.find((p) => p.id === id)?.alt ?? '';
  const caption = (id: string) => { if (captionEl) captionEl.textContent = altOf(id); };

  // ---------- light off / light on ----------
  let sceneId = data.hero;
  const cursor = fine ? document.createElement('div') : null;
  const flashCursor = () => { if (!cursor) return; cursor.setAttribute('data-flash', ''); setTimeout(() => cursor.removeAttribute('data-flash'), 120); };
  const lightCut = (id: string, force = false) => {
    if (id === sceneId && !force) return;
    sceneId = id;
    gsap.killTweensOf(torch, 'on');
    gsap.timeline()
      .set(torch, { on: 0 })
      .call(() => { void water?.cut(id); caption(id); flashCursor(); }, [], 0.08)
      .to(torch, { on: 0.7, duration: 0.03 }, 0.17)
      .to(torch, { on: 0.12, duration: 0.03 }, 0.21)
      .to(torch, { on: 1, duration: 0.09 }, 0.27)
      .call(() => water?.ripple(torch.x, torch.y, 0.45), [], 0.27);
  };

  // ---------- hero: letters surface from the water ----------
  const sceneTriggers: { id: string; active: () => boolean }[] = [];
  const activeScene = () => sceneTriggers.find((s) => s.active())?.id ?? data.hero;
  await Promise.all([
    document.fonts.load('800 100px "Syne Variable"', 'Aquarea Čierna Voda'),
    document.fonts.load('400 16px "Geist Variable"', 'Areál'),
  ]).catch(() => undefined);
  await document.fonts.ready;
  const lines = document.querySelectorAll<HTMLElement>('.v4-h1 [data-v4-line]');
  const h1 = SplitText.create(lines, { type: 'words,chars', wordsClass: 'v4-word', charsClass: 'v4-char v4-heat' });
  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .from(h1.chars, { yPercent: 75, opacity: 0, scaleY: 1.6, filter: 'blur(18px)', transformOrigin: '50% 100%', duration: 1.6, stagger: { each: 0.05, from: 'random' } }, 0.1)
    .from('[data-v4-hero-rest] > *', { y: 26, opacity: 0, filter: 'blur(6px)', duration: 1, stagger: 0.09, ease: 'power3.out' }, 0.75)
    .call(() => lightCut(activeScene(), true), [], 1.05)
    .call(() => { gsap.set(h1.chars, { clearProps: 'filter' }); measure(); }, [], 2.4);

  // headings: words rise out of the dark
  SplitText.create('.v4-h2', { type: 'words', wordsClass: 'v4-heat' });
  document.querySelectorAll<HTMLElement>('.v4-h2').forEach((h) => {
    gsap.from(h.querySelectorAll('.v4-heat'), {
      yPercent: 55, opacity: 0, filter: 'blur(10px)', duration: 1.1, ease: 'expo.out', stagger: 0.07,
      scrollTrigger: { trigger: h, start: 'top 86%', toggleActions: 'play none none reverse' },
    });
  });
  document.querySelectorAll<HTMLElement>('[data-v4-reveal]').forEach((block) => {
    gsap.from(block.children, {
      y: 34, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07,
      scrollTrigger: { trigger: block, start: 'top 84%', toggleActions: 'play none none none' },
    });
  });

  // season strip: the beam sweeps across the months once
  const months = document.querySelectorAll<HTMLElement>('.v4-season li');
  if (months.length) {
    gsap.from(months, {
      boxShadow: 'inset 0 0 0 999px rgba(255,241,214,0.28)', duration: 0.7, stagger: 0.08, ease: 'power2.out',
      scrollTrigger: { trigger: '.v4-season', start: 'top 78%', toggleActions: 'play none none reverse' },
    });
  }

  // GPS read-out tunes in to the real coordinates
  document.querySelectorAll<HTMLElement>('[data-v4-gps]').forEach((el) => {
    const target = Number(el.dataset.v4Gps);
    const proxy = { v: Math.floor(target) };
    gsap.to(proxy, {
      v: target, duration: 1.8, ease: 'power4.out', onUpdate: () => { el.textContent = proxy.v.toFixed(6); },
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
    });
  });

  // ---------- scenes ----------
  document.querySelectorAll<HTMLElement>('[data-v4-scene]').forEach((el) => {
    const st = ScrollTrigger.create({
      trigger: el, start: 'top 55%', end: 'bottom 55%',
      onToggle: (self) => { if (self.isActive && intro.progress() > 0.45) lightCut(el.dataset.v4Scene!); },
    });
    sceneTriggers.push({ id: el.dataset.v4Scene!, active: () => st.isActive });
  });

  // zones: aiming at a zone puts its photo in the beam
  const zones = [...document.querySelectorAll<HTMLElement>('[data-v4-zone]')];
  zones.forEach((row) => {
    const act = () => {
      if (row.hasAttribute('data-active')) return;
      zones.forEach((r) => r.removeAttribute('data-active'));
      row.setAttribute('data-active', '');
      void water?.fade(row.dataset.v4Zone!);
      caption(row.dataset.v4Zone!);
      water?.ripple(torch.x, torch.y, 0.55);
    };
    row.addEventListener('pointerenter', act);
    row.addEventListener('focusin', act);
    row.addEventListener('click', act);
  });

  // ---------- the light on text and photos (measured once, read every frame) ----------
  let heat: Heat[] = [];
  let lamps: Lamp[] = [];
  function measure() {
    const sy = window.scrollY;
    heat = [...document.querySelectorAll<HTMLElement>('.v4-heat')].map((el) => {
      const r = el.getBoundingClientRect();
      return { el, cx: r.left + r.width / 2, cy: r.top + r.height / 2 + sy, last: -1 };
    });
    lamps = [...document.querySelectorAll<HTMLElement>('.v4-lamp')].map((el) => {
      const r = el.getBoundingClientRect();
      return { el, x: r.left, y: r.top + sy, w: r.width, h: r.height, lx: -1, ly: -1, lo: -1 };
    });
  }
  measure();
  ScrollTrigger.addEventListener('refresh', measure);

  function shine() {
    const sy = window.scrollY;
    const R = radius();
    for (const h of heat) {
      const cy = h.cy - sy;
      let v = 0;
      if (cy > -250 && cy < H + 250) {
        const d = Math.hypot(h.cx - torch.x, cy - torch.y) / (R * 1.05);
        v = Math.max(0, 1 - d);
        v = v * v * (3 - 2 * v) * torch.on;
      }
      if (Math.abs(v - h.last) > 0.015 || (v === 0 && h.last !== 0)) { h.el.style.setProperty('--heat', v.toFixed(3)); h.last = v; }
    }
    for (const l of lamps) {
      const top = l.y - sy;
      if (top > H || top + l.h < 0) continue;
      const mx = torch.x - l.x, my = torch.y - top;
      if (Math.abs(mx - l.lx) > 0.5 || Math.abs(my - l.ly) > 0.5 || Math.abs(torch.on - l.lo) > 0.02) {
        l.el.style.setProperty('--mx', `${mx.toFixed(1)}px`);
        l.el.style.setProperty('--my', `${my.toFixed(1)}px`);
        l.el.style.setProperty('--r', `${(R * 1.1).toFixed(0)}px`);
        l.el.style.setProperty('--lamp', torch.on.toFixed(2));
        l.lx = mx; l.ly = my; l.lo = torch.on;
      }
    }
  }

  // ---------- input ----------
  let lastRipple = 0, lastX = 0, lastY = 0, lastT = 0;
  if (fine && cursor) {
    cursor.className = 'v4-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.append(cursor);
    document.addEventListener('pointerover', (e) => cursor.toggleAttribute('data-hover', !!(e.target as HTMLElement).closest('a, button, [data-v4-zone]')));
  }
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    torch.mode = 'pointer';
    torch.tx = e.clientX; torch.ty = e.clientY;
    if (cursor) {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (!root.classList.contains('v4-has-cursor')) root.classList.add('v4-has-cursor');
    }
    const now = performance.now();
    const speed = Math.hypot(e.clientX - lastX, e.clientY - lastY) / Math.max(1, now - lastT);
    if (speed > 1.6 && now - lastRipple > 180) { water?.ripple(e.clientX, e.clientY, 0.3); lastRipple = now; }
    lastX = e.clientX; lastY = e.clientY; lastT = now;
  }, { passive: true });
  window.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch') water?.ripple(e.clientX, e.clientY, 1); }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { torch.mode = 'idle'; });
  window.addEventListener('touchstart', (e) => {
    const t = e.touches[0]; if (!t) return;
    touching = true; torch.mode = 'touch'; torch.tx = t.clientX; torch.ty = t.clientY;
    water?.ripple(t.clientX, t.clientY, 1);
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    const t = e.touches[0]; if (!t) return;
    torch.tx = t.clientX; torch.ty = t.clientY;
    const now = performance.now();
    if (now - lastRipple > 240) { water?.ripple(t.clientX, t.clientY, 0.35); lastRipple = now; }
  }, { passive: true });
  window.addEventListener('touchend', () => { touching = false; torch.touchEnd = performance.now(); }, { passive: true });

  // magnetic CTAs (fine pointers)
  if (fine) {
    const mags = [...document.querySelectorAll<HTMLElement>('[data-magnetic]')].map((el) => ({
      el,
      x: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.45)' }),
      y: gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.45)' }),
    }));
    window.addEventListener('pointermove', (e) => {
      for (const m of mags) {
        const r = m.el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > H + 100) continue;
        const cx = r.left + r.width / 2 - Number(gsap.getProperty(m.el, 'x'));
        const cy = r.top + r.height / 2 - Number(gsap.getProperty(m.el, 'y'));
        const dx = e.clientX - cx, dy = e.clientY - cy;
        const near = Math.abs(dx) < r.width / 2 + 56 && Math.abs(dy) < r.height / 2 + 44;
        m.x(near ? dx * 0.32 : 0);
        m.y(near ? dy * 0.4 : 0);
      }
    }, { passive: true });
  }

  // ---------- pause when hidden or when the water is scrolled away ----------
  let zoneVisible = true;
  const zone = document.getElementById('v4-water-zone');
  if (zone) new IntersectionObserver(([en]) => { zoneVisible = en.isIntersecting; }).observe(zone);
  const debug = { frames: 0, running: false, gl: () => root.dataset.gl };
  (window as unknown as { __v4: typeof debug }).__v4 = debug;

  window.addEventListener('resize', () => {
    W = window.innerWidth; H = window.innerHeight;
    water?.resize();
  });

  gsap.ticker.add((t, deltaMs) => {
    const dt = Math.min(deltaMs / 1000, 0.05);
    if (torch.mode === 'touch' && !touching && performance.now() - torch.touchEnd > 2200) torch.mode = 'idle';
    if (torch.mode === 'idle') [torch.tx, torch.ty] = idleAt(t);
    const k = 1 - Math.exp(-dt / (torch.mode === 'idle' ? 0.8 : 0.075));
    torch.x += (torch.tx - torch.x) * k;
    torch.y += (torch.ty - torch.y) * k;
    shine();
    const run = glOn && water !== null && zoneVisible && !document.hidden;
    debug.running = run;
    if (captionBox) captionBox.toggleAttribute('data-off', !zoneVisible);
    if (run && water) {
      const u = water.uniforms;
      u.uTorch.value.set(torch.x, torch.y);
      u.uTorchOn.value = torch.on;
      u.uRadius.value = radius();
      u.uScroll.value = window.scrollY / H;
      water.render(t, dt);
      debug.frames = water.frames;
    }
  });

  await waterReady;
  ScrollTrigger.refresh();
}
