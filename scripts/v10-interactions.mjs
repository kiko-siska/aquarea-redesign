// V10 scroll-flight feel: real touch swipes (CDP synthesizeScrollGesture) and real wheel input, frame timing, live
// reduced-motion switch. Usage: node scripts/v10-interactions.mjs [baseUrl=http://localhost:4322] [outDir=screenshots/phase8]
// Jank = frames > 50 ms while the flight and the stops animate (headless Chrome, no GPU throttling: a sanity check,
// not a device benchmark). Also proves the flight is native scroll: scrollY follows the input 1:1 (no hijack).
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [base = 'http://localhost:4322', out = 'screenshots/phase8'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const notes = [], issues = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const frameProbe = () => { window.__frames = []; let last = performance.now(); const tick = (t) => { window.__frames.push(t - last); last = t; if (window.__frames.length < 100000) requestAnimationFrame(tick); }; requestAnimationFrame(tick); };
const stats = (p) => p.evaluate(() => { const f = window.__frames.slice(2); const s = [...f].sort((a, b) => a - b); return { frames: f.length, p95: +s[Math.floor(s.length * 0.95)].toFixed(1), worst: +s[s.length - 1].toFixed(1), over50: f.filter((x) => x > 50).length }; });
const state = (p) => p.evaluate(() => ({ y: Math.round(scrollY), scale: (getComputedStyle(document.querySelector('[data-v10-scale]')).transform.match(/[\d.]+/) ?? ['1'])[0], attrs: ['data-flying', 'data-covered', 'data-offscreen'].filter((a) => document.querySelector('[data-v10-stage]').hasAttribute(a)).join(',') }));

// ---- touch (phone) ----
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => issues.push(`touch: ${e.message}`));
  await p.goto(`${base}/variants/10/`, { waitUntil: 'networkidle' });
  await p.waitForFunction(() => document.querySelector('[data-v10-stage]')?.hasAttribute('data-live'));
  await p.evaluate(frameProbe);
  const cdp = await ctx.newCDPSession(p);
  const swipe = (dy) => cdp.send('Input.synthesizeScrollGesture', { x: 187, y: 600, yDistance: -dy, speed: 1200, gestureSourceType: 'touch', repeatCount: 1 });
  const seq = [];
  for (const dy of [180, 180, 180, 240, 400, 600, 600]) { await swipe(dy); await sleep(350); seq.push(await state(p)); }
  await p.screenshot({ path: `${out}/v10-375-touch-after-swipes.jpg`, type: 'jpeg', quality: 78 });
  const st = await stats(p);
  notes.push(`touch swipes @375: ${seq.map((s) => `y${s.y} s${s.scale}${s.attrs ? ' ' + s.attrs : ''}`).join(' → ')}`);
  notes.push(`touch frames @375: ${JSON.stringify(st)}`);
  if (!seq.some((s) => s.attrs.includes('data-covered'))) issues.push('touch: flight never completed');
  if (!seq.slice(0, 3).some((s) => +s.scale > 1.01 && +s.scale < 1.12)) issues.push('touch: no intermediate flight scale (not scroll-linked?)');
  if (st.over50 > 3) issues.push(`touch: ${st.over50} frames > 50 ms`);
  await ctx.close();
}

// ---- wheel (desktop): scrollY follows the wheel 1:1, no pin longer than the hero ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => issues.push(`wheel: ${e.message}`));
  await p.goto(`${base}/variants/10/`, { waitUntil: 'networkidle' });
  await p.waitForFunction(() => document.querySelector('[data-v10-stage]')?.hasAttribute('data-live'));
  await p.evaluate(frameProbe);
  await p.mouse.move(720, 450);
  const ys = [];
  for (let i = 0; i < 24; i++) { await p.mouse.wheel(0, 120); await sleep(70); ys.push((await state(p)).y); }
  await sleep(500);
  const st = await stats(p);
  const deltas = ys.map((y, i) => y - (ys[i - 1] ?? 0)).slice(1);
  notes.push(`wheel @1440: 24 × 120 px → scrollY ${ys[0]}…${ys.at(-1)} (steps ${[...new Set(deltas)].join('/')} px: native, not hijacked)`);
  notes.push(`wheel frames @1440: ${JSON.stringify(st)}`);
  if (Math.abs(ys.at(-1) - 24 * 120) > 130) issues.push(`wheel: scroll does not follow the wheel (${ys.at(-1)} vs ${24 * 120})`);
  if (st.over50 > 3) issues.push(`wheel: ${st.over50} frames > 50 ms`);
  // how long is the hero held? it is stuck only while the first panel rises (≈ one hero height), then covered
  const held = await p.evaluate(() => { const h = document.querySelector('.v10-hero'); return { heroH: h.offsetHeight, flight: document.querySelector('.v10-flight').offsetHeight }; });
  notes.push(`pin length: hero ${held.heroH}px, visible while the page rises over it for ${held.heroH}px of scroll (= one screen), then covered and hidden`);
  // live reduced-motion switch: the flight scale and the drift drop out at once
  await p.evaluate(() => scrollTo(0, 400)); await sleep(500);
  const before = await state(p);
  await p.emulateMedia({ reducedMotion: 'reduce' }); await sleep(600);
  const after = await p.evaluate(() => ({ scale: getComputedStyle(document.querySelector('[data-v10-scale]')).transform, drift: getComputedStyle(document.querySelector('.v10-drift')).animationName, btn: document.querySelector('[data-v10-pause]').getAttribute('aria-pressed') }));
  notes.push(`live reduce switch: scale ${before.scale} → ${after.scale}, drift ${after.drift}, button pressed=${after.btn} (play offered)`);
  if (after.scale !== 'none' || after.drift !== 'none') issues.push('live reduced-motion switch did not stop the effects');
  await ctx.close();
}
await browser.close();
console.log(notes.join('\n'));
console.log(issues.length ? `\nISSUES:\n${issues.join('\n')}` : '\nno issues');
process.exitCode = issues.length ? 1 : 0;
