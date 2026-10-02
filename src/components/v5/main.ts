/**
 * V5 · Titulky: page choreography (loaded only by /variants/5/, gsap + lenis via dynamic import).
 *
 * Scroll is the film. A 3-2-1 leader (any input skips it), then eight scenes. At every scene
 * boundary a fixed overlay cuts (iris, venetian blinds or a hard cut with a flash frame) and the
 * whole colour grade switches in one frame (html[data-v5-scene]). Kinetic type scrubs Anybody's
 * width axis (--w). The HUD timecode is bound to scroll position.
 */
type Scene = { n: number; name: string; bg: string; fg: string };

export async function initV5() {
  const root = document.documentElement;
  const q = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s)!;
  const qa = <T extends Element = HTMLElement>(s: string) => [...document.querySelectorAll<T>(s)];
  const scenes = JSON.parse(q('#v5-scenes').textContent ?? '[]') as Scene[];
  const pad = (n: number, l = 2) => String(n).padStart(l, '0');

  const [{ gsap }, { ScrollTrigger }, { SplitText }, { Flip }, { DrawSVGPlugin }, { default: Lenis }] = await Promise.all([
    import('gsap'), import('gsap/ScrollTrigger'), import('gsap/SplitText'), import('gsap/Flip'), import('gsap/DrawSVGPlugin'), import('lenis'),
  ]);
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, DrawSVGPlugin);

  // ---------- one ticker: Lenis inside gsap ----------
  const lenis = new Lenis({ lerp: 0.09, anchors: { offset: -70 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  (window as unknown as { lenis: typeof lenis }).lenis = lenis;

  // ---------- leader 3-2-1 (skippable) ----------
  const leader = document.querySelector<HTMLElement>('.v5-leader');
  const num = leader?.querySelector<HTMLElement>('[data-v5-leader-num]');
  const dial = leader?.querySelector<HTMLElement>('.v5-leader-dial');
  const skipEvents = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
  let leaderDone = false;
  const leaderTl = gsap.timeline({ paused: true, onComplete: () => endLeader() });
  ['3', '2', '1'].forEach((n, i) => {
    leaderTl.call(() => { if (num) num.textContent = n; }, [], i * 0.52);
    leaderTl.fromTo(dial ?? {}, { '--sweep': '0deg' }, { '--sweep': '360deg', duration: 0.52, ease: 'none' }, i * 0.52);
  });
  leaderTl.to(leader ?? {}, { backgroundColor: '#f4f4f2', duration: 0.04 }, 1.56).to(leader ?? {}, { opacity: 0, duration: 0.06 }, 1.62);
  const onSkip = (e: Event) => {
    if (leaderDone) return;
    if (e.type === 'keydown') e.preventDefault();
    leaderTl.progress(1);
  };
  function endLeader() {
    if (leaderDone) return;
    leaderDone = true;
    skipEvents.forEach((ev) => window.removeEventListener(ev, onSkip));
    leader?.remove();
    lenis.start();
    intro.play();
  }

  // ---------- fit kinetic words to their column at their resting width ----------
  // load the exact faces first: fonts.ready can resolve before Anybody has even been requested
  await Promise.all([
    document.fonts.load('900 100px "Anybody Variable"', 'AQUAREA ČIERNA VODA ŽÁ'),
    document.fonts.load('italic 900 100px "Anybody Variable"', 'ČIERNA VODA'),
    document.fonts.load('400 16px "Hanken Grotesk Variable"', 'Areál'),
  ]).catch(() => undefined);
  await document.fonts.ready;
  // measure an offscreen clone: the live word may be split into letters that are mid-animation
  const probe = document.createElement('span');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font-size:100px;display:inline-block;transform:none';
  function fit() {
    document.body.append(probe);
    qa('[data-fit]').forEach((el) => {
      const box = (el.closest('.v5-wrap') as HTMLElement) ?? el.parentElement!;
      const cs = getComputedStyle(box);
      const avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const w = Number(el.dataset.fitW ?? 100), r = Number(el.dataset.fitR ?? 1), maxVh = Number(el.dataset.fitMax ?? 0);
      probe.className = el.className;
      probe.style.setProperty('--w', String(w));
      probe.textContent = el.textContent;
      const width = probe.getBoundingClientRect().width;
      let fs = ((avail * r) / width) * 100;
      if (maxVh) fs = Math.min(fs, window.innerHeight * maxVh);
      el.style.fontSize = `${fs.toFixed(2)}px`;
      if (!el.style.getPropertyValue('--w')) el.style.setProperty('--w', String(w));
    });
    probe.remove();
  }
  fit();

  // ---------- the cut ----------
  const cutEl = q('.v5-cut');
  const fill = q('.v5-cut-fill');
  const slats = qa('.v5-cut-slats > i');
  const card = q('.v5-cut-card');
  const cardN = q('[data-v5-cut-n]'), cardT = q('[data-v5-cut-t]');
  const slateN = document.querySelector('[data-v5-slate-n]'), slateT = document.querySelector('[data-v5-slate-t]'), slateS = document.querySelector('[data-v5-slate-short]');
  const kinds: Record<number, 'iris' | 'blinds' | 'cut'> = { 2: 'iris', 3: 'blinds', 4: 'cut', 5: 'iris', 6: 'blinds', 7: 'cut', 8: 'blinds' };
  let current = 1, target = 1;
  let cutTl: gsap.core.Timeline | null = null;
  const setScene = (n: number) => {
    current = n;
    root.dataset.v5Scene = String(n);
    if (slateN) slateN.textContent = `Scéna ${pad(n)}`;
    if (slateT) slateT.textContent = scenes[n - 1]?.name ?? '';
    if (slateS) slateS.textContent = `S${pad(n)} `;
  };
  const resetCut = () => {
    gsap.set(cutEl, { visibility: 'hidden' });
    gsap.set(fill, { display: 'none', clipPath: 'circle(0% at 50% 50%)' });
    gsap.set(slats, { clipPath: 'inset(0% 0% 100% 0%)' });
    gsap.set(card, { opacity: 0 });
  };
  resetCut();
  function cutTo(n: number, dir: 1 | -1) {
    if (n === target) return;
    const boundary = dir > 0 ? n : target;
    target = n;
    cutTl?.kill();
    resetCut();
    const s = scenes[n - 1];
    const kind = kinds[boundary] ?? 'cut';
    cutEl.style.setProperty('--cut-bg', kind === 'cut' ? 'var(--paper)' : s.bg);
    cutEl.style.setProperty('--cut-fg', s.fg);
    cardN.textContent = `Scéna ${pad(n)}`;
    cardT.textContent = s.name;
    const tl = gsap.timeline({ onComplete: resetCut });
    tl.set(cutEl, { visibility: 'visible' });
    if (kind === 'iris') {
      tl.set(fill, { display: 'block' })
        .fromTo(fill, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 0.42, ease: 'power3.in' })
        .call(() => setScene(n))
        .set(card, { opacity: 1 })
        .set(card, { opacity: 0 }, '+=0.3');
    } else if (kind === 'blinds') {
      tl.to(slats, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.26, stagger: 0.022, ease: 'power2.in' })
        .call(() => setScene(n))
        .set(card, { opacity: 1 })
        .set(card, { opacity: 0 }, '+=0.26')
        .to(slats, { clipPath: 'inset(100% 0% 0% 0%)', duration: 0.26, stagger: 0.022, ease: 'power2.out' });
    } else {
      tl.set(fill, { display: 'block', clipPath: 'none' })
        .call(() => setScene(n))
        .set(fill, { display: 'none' }, '+=0.07');
    }
    cutTl = tl;
  }

  // ---------- SCÉNA 01 · title card ----------
  const title = SplitText.create('[data-k="aquarea"]', { type: 'chars', charsClass: 'v5-ch' });
  const intro = gsap.timeline({ paused: true });
  intro
    .fromTo(title.chars, { yPercent: 115, '--w': 50 }, { yPercent: 0, '--w': 150, duration: 1.1, ease: 'expo.out', stagger: 0.045 }, 0)
    .fromTo('[data-k="cierna"]', { xPercent: 70, '--w': 150 }, { xPercent: 0, '--w': 68, duration: 1.25, ease: 'elastic.out(1, 0.55)' }, 0.25)
    .from('[data-k="frame"]', { clipPath: 'inset(0% 100% 0% 0%)', duration: 0.75, ease: 'power4.inOut' }, 0.35)
    .from('[data-v5-hero-rest] > *', { y: 30, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 0.55)
    .call(() => { gsap.set(title.chars, { clearProps: 'all' }); });

  // explicit start values: the paused intro has already put these words at their entry offsets
  gsap.timeline({ scrollTrigger: { trigger: '#s1', start: 'top top', end: 'bottom top', scrub: 0.6 } })
    .fromTo('[data-k="aquarea"]', { '--w': 150, scale: 1 }, { '--w': 62, scale: 1.08, transformOrigin: '0% 100%', ease: 'none', immediateRender: false }, 0)
    .fromTo('[data-k="cierna"]', { '--w': 68, xPercent: 0 }, { '--w': 150, xPercent: -8, ease: 'none', immediateRender: false }, 0)
    .fromTo('[data-k="frame"]', { yPercent: 0 }, { yPercent: -16, rotate: -7, ease: 'none', immediateRender: false }, 0);

  // ---------- scenes, created top to bottom (pins included) ----------
  const sceneTrigger = (sec: HTMLElement) => {
    const n = Number(sec.dataset.v5Scene);
    if (n > 1) ScrollTrigger.create({ trigger: sec, start: 'top 50%', onEnter: () => cutTo(n, 1), onLeaveBack: () => cutTo(n - 1, -1) });
  };
  const sec = (n: number) => q(`section[data-v5-scene="${n}"]`);

  // 02 · two words collide, zone words slide in from both sides on the width axis
  sceneTrigger(sec(2));
  gsap.timeline({ scrollTrigger: { trigger: '#s2 h2', start: 'top bottom', end: 'top 20%', scrub: 0.5 }, defaults: { ease: 'none' } })
    .fromTo('[data-k="tri"]', { xPercent: -160, '--w': 50 }, { xPercent: 45, '--w': 150, duration: 0.6 }, 0)
    .to('[data-k="tri"]', { xPercent: 0, '--w': 140, duration: 0.4 }, 0.6)
    .fromTo('[data-k="zony"]', { xPercent: 160, '--w': 150 }, { xPercent: -45, '--w': 50, duration: 0.6 }, 0)
    .to('[data-k="zony"]', { xPercent: 0, '--w': 70, duration: 0.4 }, 0.6);
  qa('[data-k="zone"]').forEach((el) => {
    const dir = Number(el.dataset.from ?? -1);
    gsap.fromTo(el, { xPercent: 55 * dir, '--w': 50 }, { xPercent: 0, '--w': Number(el.dataset.fitW), ease: 'none', scrollTrigger: { trigger: el, start: 'top 98%', end: 'top 45%', scrub: 0.5 } });
  });
  qa('[data-k="zframe"]').forEach((el) => {
    gsap.fromTo(el, { clipPath: 'inset(50% 0% 50% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 55%', scrub: 0.4 } });
  });

  // 03 · film clock
  sceneTrigger(sec(3));
  gsap.fromTo('[data-k="kedy"]', { '--w': 50, scaleY: 1.35 }, { '--w': 150, scaleY: 1, transformOrigin: '50% 100%', ease: 'none', scrollTrigger: { trigger: '[data-k="kedy"]', start: 'top bottom', end: 'top 30%', scrub: 0.5 } });
  gsap.fromTo('[data-v5-hand]', { rotation: 0 }, { rotation: 360, svgOrigin: '0 0', ease: 'none', scrollTrigger: { trigger: '.v5-clock', start: 'top 85%', end: 'bottom 15%', scrub: 0.4 } });
  gsap.fromTo('[data-v5-arc]', { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', stagger: 0.15, scrollTrigger: { trigger: '.v5-clock', start: 'top 80%', end: 'center 50%', scrub: 0.4 } });

  // 04 · end credits roll (pinned)
  sceneTrigger(sec(4));
  const stage = q('.v5-credits-stage');
  const credits = q('[data-v5-credits]');
  const travel = () => credits.offsetHeight + stage.offsetHeight * 0.1;
  gsap.fromTo(credits, { y: () => stage.offsetHeight * 0.9 }, {
    y: () => -(credits.offsetHeight - stage.offsetHeight * 0.85), ease: 'none',
    scrollTrigger: { trigger: stage, start: 'top top', end: () => `+=${travel()}`, pin: true, scrub: true, invalidateOnRefresh: true },
  });

  // 05 · clapperboard
  sceneTrigger(sec(5));
  gsap.fromTo('[data-k="fff"]', { '--w': 150 }, { '--w': 70, ease: 'none', scrollTrigger: { trigger: '[data-k="fff"]', start: 'top 85%', end: 'top 10%', scrub: 0.5 } });
  const stick = q('[data-v5-stick]'), clap = q('[data-v5-clap]'), flash = q('.v5-flash');
  gsap.set(stick, { rotation: -24, transformOrigin: '0% 100%' });
  ScrollTrigger.create({
    trigger: clap, start: 'top 62%',
    onEnter: () => gsap.timeline()
      .to(stick, { rotation: 0, duration: 0.16, ease: 'power4.in' })
      .set(flash, { opacity: 0.85 })
      .to(flash, { opacity: 0, duration: 0.2 })
      .fromTo(clap, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' }, '<'),
    onLeaveBack: () => gsap.to(stick, { rotation: -24, duration: 0.45, ease: 'power2.out' }),
  });

  // 06 · reel: pinned horizontal pan, Flip projects a frame in real colour
  sceneTrigger(sec(6));
  const reel = q('.v5-reel'), track = q('[data-v5-track]');
  const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 24);
  gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: reel, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true } });
  gsap.fromTo('[data-k="gal"]', { '--w': 140, xPercent: 0 }, { '--w': 60, xPercent: 30, ease: 'none', scrollTrigger: { trigger: reel, start: 'top top', end: () => `+=${dist()}`, scrub: 0.6, invalidateOnRefresh: true } });

  const proj = q('[data-v5-projector]');
  const projImg = proj.querySelector('img')!;
  const projCap = q('[data-v5-projector-caption]');
  let projected: HTMLImageElement | null = null;
  const project = (frame: HTMLElement) => {
    const img = frame.querySelector('img');
    if (!img || projected) return;
    img.dataset.flipId = 'projected';
    const state = Flip.getState(img);
    projImg.src = img.currentSrc || img.src;
    projCap.textContent = frame.dataset.alt ?? '';
    proj.hidden = false;
    lenis.stop();
    projected = img;
    Flip.from(state, { targets: projImg, duration: 0.75, ease: 'expo.inOut', absolute: true });
    gsap.from(proj, { backgroundColor: 'rgba(18,16,16,0)', duration: 0.45 });
  };
  const unproject = () => {
    if (!projected) return;
    const img = projected;
    const state = Flip.getState(projImg);
    proj.hidden = true;
    lenis.start();
    projected = null;
    Flip.from(state, { targets: img, duration: 0.6, ease: 'expo.inOut', absolute: true, onComplete: () => { delete img.dataset.flipId; gsap.set(img, { clearProps: 'all' }); } });
  };
  qa('[data-v5-frame]').forEach((f) => {
    f.addEventListener('click', () => project(f));
    f.addEventListener('keydown', (e) => { if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') { e.preventDefault(); project(f); } });
  });
  proj.addEventListener('click', unproject);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') unproject(); });

  // 07 · route drawn to the real GPS point, coordinates tune in
  sceneTrigger(sec(7));
  gsap.fromTo('[data-k="cesta"]', { '--w': 50, xPercent: 20 }, { '--w': 140, xPercent: 0, ease: 'none', scrollTrigger: { trigger: '[data-k="cesta"]', start: 'top bottom', end: 'top 30%', scrub: 0.5 } });
  gsap.fromTo('[data-v5-route]', { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', scrollTrigger: { trigger: '.v5-route', start: 'top 78%', end: 'bottom 60%', scrub: 0.5 } });
  gsap.from('[data-v5-pin]', { scale: 0, transformOrigin: '50% 50%', duration: 0.55, ease: 'back.out(3)', scrollTrigger: { trigger: '.v5-route', start: 'bottom 60%', toggleActions: 'play none none reverse' } });
  const coords = qa('[data-v5-coord]');
  ScrollTrigger.create({
    trigger: '.v5-route', start: 'top 78%', end: 'bottom 60%',
    onUpdate: (self) => coords.forEach((el) => {
      const v = Number(el.dataset.v5Coord), from = Math.floor(v);
      const k = 1 - Math.pow(1 - self.progress, 3);
      el.textContent = (from + (v - from) * k).toFixed(6);
    }),
    onLeave: () => coords.forEach((el) => { el.textContent = el.dataset.v5Coord ?? ''; }),
  });

  // 08 · booking
  sceneTrigger(sec(8));
  gsap.fromTo('[data-k="rez"]', { '--w': 50, xPercent: -15 }, { '--w': 130, xPercent: 0, ease: 'none', scrollTrigger: { trigger: '[data-k="rez"]', start: 'top bottom', end: 'top 35%', scrub: 0.5 } });

  // ---------- HUD timecode bound to scroll (24 fps, 1 frame per 4 px) ----------
  const tcEl = document.querySelector('[data-v5-tc]'), frEl = document.querySelector('[data-v5-fcount]');
  const timecode = (y: number) => {
    const f = Math.max(0, Math.round(y / 4));
    const s = Math.floor(f / 24);
    if (tcEl) tcEl.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f % 24)}`;
    if (frEl) frEl.textContent = pad(f, 4);
  };
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => timecode(self.scroll()) });

  window.addEventListener('resize', () => { fit(); ScrollTrigger.refresh(); });
  document.fonts.addEventListener('loadingdone', () => { fit(); ScrollTrigger.refresh(); });
  ScrollTrigger.refresh();
  timecode(window.scrollY);

  // start in whichever scene is on screen (e.g. after a reload mid-page)
  const onScreen = qa('section[data-v5-scene]').filter((s) => s.getBoundingClientRect().top <= window.innerHeight * 0.5).pop();
  const start = Number(onScreen?.dataset.v5Scene ?? 1);
  target = start;
  setScene(start);
  (window as unknown as { __v5: object }).__v5 = { scene: () => current, leaderDone: () => leaderDone };

  // roll the leader (or skip it) and then the title card
  const noLeader = new URLSearchParams(location.search).get('leader') === '0' || window.scrollY > 10 || !leader;
  if (noLeader) {
    leaderTl.progress(1);
  } else {
    lenis.stop();
    skipEvents.forEach((ev) => window.addEventListener(ev, onSkip, { passive: false }));
    leader.style.animation = 'none';
    leaderTl.play();
  }
}
