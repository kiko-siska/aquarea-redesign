// Phase 8 checks for /variants/10/ (Mapa z výšky). NOT waived: every check below must pass.
// Usage: node scripts/v10-checks.mjs [baseUrl=http://localhost:4322] [outDir=screenshots/phase8]
//  - five-second test at 375×667 and 375×812: what it is, H1, a real "od … €", today's status, Rezervovať + Zavolať,
//    all on the first screen above the sticky bar, with the aerial visibly large (stage height reported)
//  - hero geometry at 320…2560: pins inside the photo, not under the dock, ≥ 44 px tall; the right image per screen;
//    the AI TODO chip visible exactly when the AI 4:5 image is shown; no horizontal overflow
//  - motion: drift runs and moves; pause button freezes it; off-screen / covered / flying states pause it; the scroll
//    flight scales 1 → 1.12; stop photos push in; hovering a pin pauses the drift; reduced motion = static + play opt-in
//  - axe-core (WCAG 2.0/2.1/2.2 A+AA + best practice) after a scroll-through, normal and reduced motion, 375 + 1440
//  - JS off: hero, pins, dock and every CTA present, sticky curtain works, nothing at opacity 0
//  - CLS, console errors, keyboard order (dock CTAs before pins), evidence screenshots
import { chromium } from 'playwright-core';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');
const [base = 'http://localhost:4322', out = 'screenshots/phase8'] = process.argv.slice(2);
const URL_ = `${base}/variants/10/`;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const issues = [], notes = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const step = (m) => console.error(`[${new Date().toISOString().slice(11, 19)}] ${m}`);
const ctxFor = (w, h, opts = {}) => browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 768, hasTouch: w < 768, deviceScaleFactor: w < 768 ? 2 : 1, locale: 'sk-SK', timezoneId: 'Europe/Bratislava', ...opts });
async function open(ctx, tag) {
  const p = await ctx.newPage();
  p.setDefaultTimeout(20000);
  p.on('pageerror', (e) => issues.push(`${tag}: pageerror ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error') issues.push(`${tag}: console.error ${m.text()}`); });
  await p.addInitScript(() => { window.__cls = 0; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch {} });
  await p.goto(URL_, { waitUntil: 'networkidle' });
  return p;
}
const shot = (p, name, opts = {}) => p.screenshot({ path: `${out}/${name}.jpg`, type: 'jpeg', quality: 80, timeout: 20000, ...opts }).catch((e) => issues.push(`shot ${name}: ${e.message.split('\n')[0]}`));
// click like a person (Playwright's own scroll-into-view mis-scrolls for elements inside a sticky container)
const press = async (p, sel) => { const b = await p.locator(sel).boundingBox(); await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); };
const live = (p) => p.waitForFunction(() => document.querySelector('[data-v10-stage]')?.hasAttribute('data-live'), null, { timeout: 15000 }).catch(() => issues.push('drift never went live'));
async function axe(p, tag) {
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.7) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } scrollTo(0, 0); await new Promise((r) => setTimeout(r, 400)); });
  await p.addScriptTag({ path: axePath });
  const res = await p.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } })).violations.map((v) => `${v.impact} ${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`));
  notes.push(`axe ${tag}: ${res.length} violations`);
  res.forEach((r) => issues.push(`axe ${tag}: ${r}`));
}
const geometry = () => {
  const R = (e) => e?.getBoundingClientRect();
  const stage = R(document.querySelector('.v10-stage')), dock = R(document.querySelector('.v10-dock'));
  const img = document.querySelector('.v10-map img').currentSrc.split('/').pop();
  const chip = document.querySelector('.v10-chip-todo');
  const overlapsDock = (b) => getComputedStyle(document.querySelector('.v10-dock')).position === 'absolute' && !(b.right < dock.left || b.left > dock.right || b.bottom < dock.top || b.top > dock.bottom);
  const pins = [...document.querySelectorAll('.v10-pin')].map((li) => {
    const dot = R(li.querySelector('.v10-pin-dot')), a = R(li.querySelector('.v10-pin-plate'));
    const inside = (b) => b.left >= stage.left - 1 && b.right <= stage.right + 1 && b.top >= stage.top - 1 && b.bottom <= stage.bottom + 1;
    return { id: li.dataset.pin, h: Math.round(a.height), w: Math.round(a.width), dotIn: inside(dot), plateIn: inside(a), underDock: overlapsDock(a) || overlapsDock(dot) };
  });
  const plates = [...document.querySelectorAll('.v10-pin-plate')].map(R);
  let collide = false;
  for (let i = 0; i < plates.length; i++) for (let j = i + 1; j < plates.length; j++) { const a = plates[i], b = plates[j]; if (!(a.right < b.left || b.right < a.left || a.bottom < b.top || b.bottom < a.top)) collide = true; }
  // pins must not hide under the TODO chip or the pause button either
  for (const o of [chip && getComputedStyle(chip).display !== 'none' ? R(chip.querySelector('.todo-note')) : null, R(document.querySelector('.v10-pause:not([hidden])'))].filter(Boolean)) {
    for (const a of plates) if (!(a.right < o.left || o.right < a.left || a.bottom < o.top || o.bottom < a.top)) collide = true;
  }
  return { stageH: Math.round(stage.height), vh: innerHeight, ai: /v10-aerial-portrait/.test(img), chip: !!chip && getComputedStyle(chip).display !== 'none', pins, collide, overflow: document.documentElement.scrollWidth - innerWidth };
};

// ---------- five-second test ----------
for (const [w, h] of [[375, 667], [375, 812]]) {
  step(`five-second ${w}x${h}`);
  const ctx = await ctxFor(w, h);
  const p = await open(ctx, `${w}x${h}`);
  await live(p); await sleep(800);
  const five = await p.evaluate(() => {
    const bar = document.querySelector('nav[aria-label="Rýchle akcie"]').getBoundingClientRect().top;
    const vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= bar + 0.5 && r.width > 0 && getComputedStyle(el).opacity !== '0'; };
    const dock = document.querySelector('.v10-dock');
    const links = [...dock.querySelectorAll('a')];
    return {
      h1: vis(document.querySelector('h1')) && document.querySelector('h1').textContent.trim(),
      what: vis(document.querySelector('[data-v10-what]')) && document.querySelector('[data-v10-what]').textContent.trim().slice(0, 40),
      price: vis(document.querySelector('[data-v10-price]')) && document.querySelector('[data-v10-price]').textContent.trim(),
      status: vis(document.querySelector('.v10-dock [data-status-text]')) && document.querySelector('.v10-dock [data-status-text]').textContent.trim(),
      rezervovat: vis(links.find((a) => a.textContent.trim().startsWith('Rezervovať'))),
      zavolat: vis(links.find((a) => a.textContent.trim().startsWith('Zavolať'))),
      photoPx: Math.round(document.querySelector('.v10-stage').getBoundingClientRect().height),
      photoSvh: Math.round(document.querySelector('.v10-stage').getBoundingClientRect().height / innerHeight * 100),
    };
  });
  notes.push(`five-second ${w}x${h}: ${JSON.stringify(five)}`);
  for (const [k, v] of Object.entries(five)) if (v === false) issues.push(`five-second ${w}x${h}: ${k} not on the first screen`);
  if (!/^od\s?\d/.test(five.price || '')) issues.push(`five-second ${w}x${h}: price is not "od … €"`);
  await shot(p, `v10-${w}x${h}-five-second-test`);
  await ctx.close();
}

// ---------- geometry across sizes + evidence screenshots ----------
for (const [w, h] of [[320, 640], [375, 812], [390, 844], [768, 1024], [1024, 768], [1024, 1366], [1280, 720], [1440, 900], [1920, 1080], [2560, 1440], [2560, 1080], [3440, 1440]]) {
  const ctx = await ctxFor(w, h);
  const p = await open(ctx, `${w}x${h}`);
  await live(p); await sleep(600);
  await p.evaluate(() => { for (const a of document.getAnimations()) if (a.animationName === 'v10-drift') { a.pause(); a.currentTime = 23000; } });
  const g = await p.evaluate(geometry);
  notes.push(`geometry ${w}x${h}: stage ${g.stageH}px, ${g.ai ? 'AI 4:5' : 'real 3:2'}, chip ${g.chip}, pins ${g.pins.map((x) => `${x.id} ${x.w}×${x.h}${x.dotIn && x.plateIn ? '' : ' OUT'}${x.underDock ? ' UNDER-DOCK' : ''}`).join(', ')}${g.collide ? ', OVERLAP' : ''}, overflow ${g.overflow}`);
  if (g.ai !== g.chip) issues.push(`${w}x${h}: AI image ${g.ai} but TODO chip ${g.chip}`);
  for (const x of g.pins) {
    if (!x.dotIn || !x.plateIn) issues.push(`${w}x${h}: pin ${x.id} outside the photo`);
    if (x.underDock) issues.push(`${w}x${h}: pin ${x.id} under the dock`);
    if (x.h < 44) issues.push(`${w}x${h}: pin ${x.id} target ${x.h}px < 44`);
  }
  if (g.collide) issues.push(`${w}x${h}: a pin plate overlaps another plate, the TODO chip or the pause button`);
  if (g.overflow > 1) issues.push(`${w}x${h}: horizontal overflow ${g.overflow}px`);
  if ([375, 768, 1440, 2560].includes(w)) await shot(p, `v10-${w}x${h}-hero`);
  if (w === 2560 && h === 1080) await shot(p, `v10-${w}x${h}-hero-ultrawide`);
  // full page once per main width, scrolled-through so lazy images are in
  if ([375, 1440].includes(w) && h !== 1080) {
    await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.7) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); } scrollTo(0, 0); });
    await sleep(600);
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (ov > 1) issues.push(`${w}x${h}: overflow after scroll-through ${ov}px`);
    for (const f of [0.25, 0.5, 0.75, 1]) { await p.evaluate((fr) => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * fr), f); await sleep(700); await shot(p, `v10-${w}-scroll${String(f * 100).padStart(3, '0')}`); }
    notes.push(`CLS ${w}x${h} (load + scroll): ${(await p.evaluate(() => window.__cls)).toFixed(4)}`);
  }
  await ctx.close();
}

// ---------- motion behaviour (desktop + phone) ----------
for (const [w, h] of [[1440, 900], [375, 812]]) {
  step(`motion ${w}`);
  const ctx = await ctxFor(w, h);
  const p = await open(ctx, `motion ${w}`);
  await live(p); await sleep(1500);
  const tf = () => p.evaluate(() => getComputedStyle(document.querySelector('.v10-drift')).transform);
  const st = () => p.evaluate(() => ({ play: getComputedStyle(document.querySelector('.v10-drift')).animationPlayState, attrs: ['data-paused', 'data-offscreen', 'data-flying', 'data-covered'].filter((a) => document.querySelector('[data-v10-stage]').hasAttribute(a)).join(','), scale: getComputedStyle(document.querySelector('[data-v10-scale]')).transform }));
  const a = await tf(); await sleep(1500); const b = await tf();
  notes.push(`motion ${w}: drift running ${(await st()).play}, moved over 1.5 s ${a !== b}`);
  if (a === b) issues.push(`motion ${w}: drift does not move`);
  await shot(p, `v10-${w}-drift-a`); await sleep(6000); await shot(p, `v10-${w}-drift-b`);
  // hover a pin (desktop): drift pauses so the label does not move while read
  if (w >= 1024) {
    // the pin drifts, so move the mouse onto it like a person would (Playwright's hover waits for a still element)
    { const b = await p.locator('.v10-pin-plate').first().boundingBox(); await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 }); await sleep(300); }
    const hv = await st(); notes.push(`motion ${w}: pin hover → ${hv.play}`);
    if (hv.play !== 'paused') issues.push('pin hover does not pause the drift');
    await p.mouse.move(5, 300);
  }
  // pause button
  await press(p, '[data-v10-pause]'); await sleep(400);
  const p1 = await tf(); await sleep(900); const p2 = await tf();
  notes.push(`motion ${w}: pause → ${(await st()).play}, frozen ${p1 === p2}, aria-pressed ${await p.locator('[data-v10-pause]').getAttribute('aria-pressed')}, label "${await p.locator('[data-v10-pause]').getAttribute('aria-label')}"`);
  if (p1 !== p2) issues.push(`motion ${w}: pause does not freeze the drift`);
  await press(p, '[data-v10-pause]'); await sleep(300);
  // scroll flight: flying pauses the drift, the photo scales toward the beach, covered at the end
  const heroH = await p.evaluate(() => document.querySelector('.v10-hero').offsetHeight);
  await p.mouse.move(w / 2, h / 2);
  for (const f of [0.5, 1.05]) {
    await p.mouse.wheel(0, Math.round(heroH * f) - (await p.evaluate(() => scrollY))); await sleep(900);
    notes.push(`motion ${w}: flight ${f * 100}% (real wheel) → ${JSON.stringify(await st())}`);
  }
  const end = await st();
  if (!end.attrs.includes('data-covered')) issues.push(`motion ${w}: hero not marked covered after the flight`);
  if (!/matrix\(1\.1[12]/.test(end.scale)) issues.push(`motion ${w}: flight scale did not reach 1.12 (${end.scale})`);
  await shot(p, `v10-${w}-flight-end`);
  // stop push-in
  const stopScale = async () => p.evaluate(() => getComputedStyle(document.querySelector('#pobyt [data-v10-stop] img')).transform);
  await p.evaluate(() => { const s = document.querySelector('#pobyt [data-v10-stop]'); scrollTo(0, s.getBoundingClientRect().top + scrollY - innerHeight * 0.8); }); await sleep(800);
  const s1 = await stopScale();
  await p.mouse.wheel(0, Math.round(h * 0.5)); await sleep(900);
  const s2 = await stopScale();
  notes.push(`motion ${w}: stop push-in ${s1} → ${s2}`);
  if (s1 === s2) issues.push(`motion ${w}: stop photo does not push in`);
  await shot(p, `v10-${w}-stop-pobyt`);
  // far away: off-screen
  await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await sleep(800);
  notes.push(`motion ${w}: page end → ${JSON.stringify(await st())}`);
  if (!(await st()).attrs.includes('data-offscreen')) issues.push(`motion ${w}: hero not off-screen at the page end`);
  // back to the top: drift resumes
  await p.evaluate(() => scrollTo(0, 0)); await sleep(1200);
  const back = await st(); notes.push(`motion ${w}: back at top → ${JSON.stringify(back)}`);
  if (back.play !== 'running') issues.push(`motion ${w}: drift does not resume at the top`);
  // keyboard: the dock's actions come before the pins
  // fresh load: an earlier click (pause button) moves the sequential-focus starting point
  await p.goto(URL_, { waitUntil: 'networkidle' }); await sleep(500);
  const order = [];
  for (let i = 0; i < (w < 768 ? 9 : 14); i++) { await p.keyboard.press('Tab'); order.push(await p.evaluate(() => { const a = document.activeElement; return (a.closest('.v10-dock') ? 'dock:' : a.closest('.v10-pins') ? 'pin:' : a.closest('header') ? 'hdr:' : '') + (a.textContent || a.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 18); })); }
  notes.push(`keyboard ${w}: ${order.join(' › ')}`);
  const iDock = order.findIndex((o) => o.startsWith('dock:Rezervovať')), iPin = order.findIndex((o) => o.startsWith('pin:'));
  if (iDock < 0 || iPin < 0 || iDock > iPin) issues.push(`keyboard ${w}: dock actions should come before the pins`);
  await p.locator('.v10-pin-plate').first().focus(); await sleep(200);
  await shot(p, `v10-${w}-focus-pin`);
  await ctx.close();
}

// ---------- reduced motion ----------
for (const [w, h] of [[1440, 900], [375, 812]]) {
  step(`reduced ${w}`);
  const ctx = await ctxFor(w, h, { reducedMotion: 'reduce' });
  const p = await open(ctx, `reduced ${w}`);
  await live(p); await sleep(1200);
  const r0 = await p.evaluate(() => ({ anim: getComputedStyle(document.querySelector('.v10-drift')).animationName, btn: !document.querySelector('[data-v10-pause]').hidden, pressed: document.querySelector('[data-v10-pause]').getAttribute('aria-pressed'), label: document.querySelector('[data-v10-pause]').getAttribute('aria-label') }));
  const heroH = await p.evaluate(() => document.querySelector('.v10-hero').offsetHeight);
  await p.mouse.move(w / 2, h / 2); await p.mouse.wheel(0, Math.round(heroH * 0.6)); await sleep(900);
  const rs = await p.evaluate(() => getComputedStyle(document.querySelector('[data-v10-scale]')).transform);
  await p.evaluate(() => { const s = document.querySelector('#pobyt [data-v10-stop]'); scrollTo(0, s.getBoundingClientRect().top + scrollY - innerHeight * 0.5); }); await sleep(700);
  const rstop = await p.evaluate(() => getComputedStyle(document.querySelector('#pobyt [data-v10-stop] img')).transform);
  notes.push(`reduced ${w}: ${JSON.stringify(r0)}; flight scale ${rs}; stop img ${rstop}`);
  if (r0.anim !== 'none' || !r0.btn || r0.pressed !== 'true') issues.push(`reduced ${w}: not static with a play button`);
  if (rs !== 'none' || rstop !== 'none') issues.push(`reduced ${w}: scroll effects run under reduced motion`);
  await p.evaluate(() => scrollTo(0, 0)); await sleep(600);
  await shot(p, `v10-${w}-reduced-top`);
  await press(p, '[data-v10-pause]'); await sleep(1200);
  const r1 = await p.evaluate(() => ({ anim: getComputedStyle(document.querySelector('.v10-drift')).animationName, dur: getComputedStyle(document.querySelector('.v10-drift')).animationDuration, play: getComputedStyle(document.querySelector('.v10-drift')).animationPlayState }));
  notes.push(`reduced ${w}: after play → ${JSON.stringify(r1)}`);
  if (r1.anim !== 'v10-drift' || r1.dur !== '46s' || r1.play !== 'running') issues.push(`reduced ${w}: play button does not start the drift`);
  await axe(p, `reduced @${w}`);
  await ctx.close();
}

// ---------- axe (normal) ----------
for (const [w, h] of [[375, 812], [1440, 900]]) {
  const ctx = await ctxFor(w, h);
  const p = await open(ctx, `axe ${w}`);
  await live(p);
  await axe(p, `@${w}`);
  await ctx.close();
}

// ---------- JS off ----------
for (const [w, h] of [[375, 812], [1440, 900]]) {
  step(`no-js ${w}`);
  const ctx = await ctxFor(w, h, { javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto(URL_, { waitUntil: 'networkidle' });
  const nojs = await p.evaluate(() => ({
    hidden0: [...document.querySelectorAll('main *')].filter((e) => getComputedStyle(e).opacity === '0' && e.getBoundingClientRect().width > 0).length,
    ctas: ['Rezervovať', 'Zavolať', 'Navigovať'].map((t) => [...document.querySelectorAll('a')].some((a) => a.textContent.trim().startsWith(t) && a.getBoundingClientRect().width > 0)),
    pins: [...document.querySelectorAll('.v10-pin-plate')].filter((a) => a.getBoundingClientRect().width > 0).length,
    sticky: getComputedStyle(document.querySelector('.v10-hero')).position,
    drift: getComputedStyle(document.querySelector('.v10-drift')).animationName,
  }));
  await p.evaluate(() => scrollTo(0, document.querySelector('.v10-hero').offsetHeight * 0.5)); await sleep(300);
  const midFlight = await p.evaluate(() => Math.round(document.querySelector('.v10-hero').getBoundingClientRect().top));
  notes.push(`JS off ${w}: ${JSON.stringify(nojs)}; hero top while the page rises: ${midFlight}px (sticky = stays under the header)`);
  if (nojs.hidden0 || nojs.ctas.includes(false) || nojs.pins !== 3 || nojs.sticky !== 'sticky' || nojs.drift !== 'none') issues.push(`JS off ${w}: ${JSON.stringify(nojs)}`);
  await shot(p, `v10-${w}-nojs-midflight`);
  await p.evaluate(() => scrollTo(0, 0)); await sleep(200);
  await shot(p, `v10-${w}-nojs-top`);
  await ctx.close();
}

await browser.close();
console.log(notes.join('\n'));
console.log(issues.length ? `\nISSUES (${issues.length}):\n${issues.join('\n')}` : '\nno issues');
process.exitCode = issues.length ? 1 : 0;
