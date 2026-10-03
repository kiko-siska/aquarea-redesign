// Phase 5: behaviour checks + screenshots of V6's interactive pieces.
// Usage: node scripts/v6-interactions.mjs <baseUrl> [outDir=screenshots/phase5]
// - water light: frames run, pause off-screen and in a hidden tab, one still frame under reduced motion,
//   no canvas (photo stays) without WebGL
// - gallery filter (Flip) + lightbox (dialog, focus return), marquee pause button, accordion,
//   live status dot on a SIMULATED July date (clock override, labelled in the file name)
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const [base = 'http://localhost:4322', out = 'screenshots/phase5'] = process.argv.slice(2);
const url = `${base}/variants/6/`;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const notes = [], issues = [];
const shot = (p, n) => p.screenshot({ path: `${out}/${n}.jpg`, type: 'jpeg', quality: 80, timeout: 15000 }).catch((e) => issues.push(`shot ${n}: ${e.message.split('\n')[0]}`));
const watch = (p, tag) => {
  p.on('pageerror', (e) => issues.push(`${tag}: ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error') issues.push(`${tag}: console ${m.text()}`); });
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- water light ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage(); watch(p, 'water');
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__v6?.frames > 0, null, { timeout: 15000 }).catch(() => issues.push('water: never drew a frame'));
  const r = await p.evaluate(async () => {
    const s = (ms) => new Promise((r) => setTimeout(r, ms));
    const f = () => window.__v6.frames;
    const a = f(); await s(800); const top = f() - a;
    const canvas = !!document.querySelector('[data-water-light] canvas');
    window.scrollTo(0, document.documentElement.scrollHeight); await s(700);
    const b = f(); await s(800); const away = f() - b;
    window.scrollTo(0, 0); await s(600);
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange')); await s(300);
    const c = f(); await s(800); const hidden = f() - c;
    delete document.hidden; document.dispatchEvent(new Event('visibilitychange'));
    return { canvas, top, away, hidden, dpr: (() => { const cv = document.querySelector('[data-water-light] canvas'); return cv ? +(cv.width / cv.clientWidth).toFixed(2) : null; })() };
  });
  notes.push(`water light: ${JSON.stringify(r)} (frames per 0.8 s)`);
  if (!r.canvas || r.top === 0) issues.push('water: not running at the top');
  if (r.away > 0) issues.push('water: still running off-screen');
  if (r.hidden > 0) issues.push('water: still running in a hidden tab');
  if (r.dpr > 1.5) issues.push(`water: DPR ${r.dpr} > 1.5`);
  // ripple: click into the photo
  const box = await p.locator('[data-water-light]').boundingBox();
  await p.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.4);
  await p.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.5, { steps: 10 });
  await p.mouse.down(); await p.mouse.up();
  await sleep(450);
  await p.locator('[data-water-light]').screenshot({ path: `${out}/v6-1440-water-ripple.jpg`, type: 'jpeg', quality: 85 });
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage(); watch(p, 'water reduced');
  await p.goto(url, { waitUntil: 'load' }); await sleep(2500);
  const r = await p.evaluate(async () => { const a = window.__v6?.frames ?? 0; await new Promise((r) => setTimeout(r, 800)); return { frames: a, after: (window.__v6?.frames ?? 0) - a, canvas: !!document.querySelector('[data-water-light] canvas') }; });
  notes.push(`water light reduced: ${JSON.stringify(r)} (expect 1 frame, 0 after)`);
  if (r.after > 0) issues.push('water reduced: loop runs');
  await p.locator('[data-water-light]').screenshot({ path: `${out}/v6-1440-water-reduced.jpg`, type: 'jpeg', quality: 85 });
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage(); watch(p, 'no-webgl');
  await p.addInitScript(() => { const o = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : o.call(this, t, ...a); }; });
  await p.goto(url, { waitUntil: 'load' }); await sleep(2500);
  const r = await p.evaluate(() => ({ canvas: !!document.querySelector('[data-water-light] canvas'), img: document.querySelector('[data-water-light] img')?.complete }));
  notes.push(`no WebGL: ${JSON.stringify(r)} (expect no canvas, photo shown)`);
  if (r.canvas) issues.push('no-webgl: canvas mounted');
  await ctx.close();
}

// ---- gallery, lightbox, marquee, accordion ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage(); watch(p, 'ui');
  await p.goto(url, { waitUntil: 'load' }); await sleep(1500);
  await p.locator('#galeria').scrollIntoViewIfNeeded(); await sleep(800);
  await p.locator('[data-filter="voda"]').click(); await sleep(150);
  await shot(p, 'v6-1440-gallery-flip-mid');
  await sleep(700);
  await shot(p, 'v6-1440-gallery-filtered');
  const g = await p.evaluate(() => ({ shown: [...document.querySelectorAll('[data-gallery-grid] > li')].filter((l) => !l.hidden).length, status: document.querySelector('[data-gallery-status]')?.textContent, pressed: document.querySelector('[data-filter="voda"]')?.getAttribute('aria-pressed') }));
  notes.push(`gallery filter: ${JSON.stringify(g)}`);
  await p.locator('[data-filter="all"]').click(); await sleep(800);
  const thumb = p.locator('a[data-lightbox]').nth(1);
  await thumb.focus(); await p.keyboard.press('Enter'); await sleep(700);
  await shot(p, 'v6-1440-lightbox');
  const lb = await p.evaluate(() => ({ open: document.querySelector('[data-lightbox-dialog]')?.open, caption: document.querySelector('[data-lightbox-caption]')?.textContent }));
  await p.keyboard.press('ArrowRight'); await sleep(300);
  const next = await p.evaluate(() => document.querySelector('[data-lightbox-caption]')?.textContent);
  await p.keyboard.press('Escape'); await sleep(400);
  const back = await p.evaluate(() => document.activeElement?.matches('a[data-lightbox]') ? 'focus back on thumbnail' : `focus on ${document.activeElement?.tagName}`);
  notes.push(`lightbox: ${JSON.stringify(lb)} → next "${next}" → ${back}`);
  if (!lb.open) issues.push('lightbox did not open');
  // marquee
  const toggle = p.locator('[data-marquee-toggle]');
  await toggle.scrollIntoViewIfNeeded(); await sleep(400);
  const before = await p.evaluate(() => getComputedStyle(document.querySelector('.m-marquee-track')).transform);
  await toggle.click(); await sleep(600);
  const m = await p.evaluate(() => ({ pressed: document.querySelector('[data-marquee-toggle]')?.getAttribute('aria-pressed'), label: document.querySelector('[data-marquee-toggle]')?.textContent, state: getComputedStyle(document.querySelector('.m-marquee-track')).animationPlayState }));
  notes.push(`marquee: moving (${before !== 'none'}) → after pause ${JSON.stringify(m)}`);
  await shot(p, 'v6-1440-marquee-paused');
  // accordion
  await p.locator('#hodiny details').nth(2).locator('summary').click(); await sleep(450);
  await p.locator('#hodiny').scrollIntoViewIfNeeded(); await sleep(300);
  await shot(p, 'v6-1440-accordion-open');
  await ctx.close();
}

// ---- live status dot on a simulated July day (clock override) ----
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, timezoneId: 'Europe/Bratislava' });
  const p = await ctx.newPage();
  // setFixedTime only fixes Date (timers and rAF keep running, unlike clock.install)
  await p.clock.setFixedTime(new Date('2026-07-15T12:30:00+02:00'));
  await p.goto(url, { waitUntil: 'load' });
  await sleep(2000);
  const s = await p.evaluate(() => ({ state: document.querySelector('[data-status]')?.dataset.state, text: document.querySelector('[data-status-text]')?.textContent }));
  notes.push(`SIMULATED 15. 7. 2026 12:30: ${JSON.stringify(s)}`);
  await p.screenshot({ path: `${out}/v6-375-SIMULATED-july-status.jpg`, type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 375, height: 640 }, timeout: 15000 }).catch((e) => issues.push('july shot ' + e.message));
  await ctx.close();
}
await browser.close();
console.log(notes.join('\n'));
console.log(issues.length ? `\nISSUES:\n${issues.join('\n')}` : '\nno issues');
