// Phase 6: behaviour checks + screenshots of V7's hero (water + rigged diver) and interactive pieces.
// Usage: node scripts/v7-interactions.mjs <baseUrl> [outDir=screenshots/phase6]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const [base = 'http://localhost:4322', out = 'screenshots/phase6'] = process.argv.slice(2);
const url = `${base}/variants/7/`;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const notes = [], issues = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const watch = (p, tag) => {
  p.on('pageerror', (e) => issues.push(`${tag}: ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error') issues.push(`${tag}: console ${m.text()}`); });
};
const pose = (p) => p.evaluate(() => Object.fromEntries(['legNear', 'shinNear', 'finNear', 'legFar', 'armNearU', 'upper'].map((n) => {
  const t = document.querySelector(`[data-v7-stage] [data-d="${n}"]`).getAttribute('transform') || '';
  const m = t.match(/matrix\(([^)]+)\)/); const [a, b] = m ? m[1].split(',').map(Number) : [1, 0];
  return [n, Math.round(Math.atan2(b, a) * 180 / Math.PI * 10) / 10];
})));

// ---- desktop hero: kick cycle, pointer drift, pause, off-screen, hidden tab ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage(); watch(p, 'hero');
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__v7?.running, null, { timeout: 15000 }).catch(() => issues.push('diver never started'));
  await sleep(900);
  const stage = p.locator('[data-v7-stage]');
  const poses = [];
  for (let i = 0; i < 4; i++) {
    poses.push(await pose(p));
    await stage.screenshot({ path: `${out}/v7-1440-diver-kick-${i + 1}.jpg`, type: 'jpeg', quality: 82 });
    await sleep(300);
  }
  notes.push(`kick cycle (4 frames, 0.3 s apart) legNear° ${poses.map((q) => q.legNear).join(' → ')}; shinNear° ${poses.map((q) => q.shinNear).join(' → ')}; finNear° ${poses.map((q) => q.finNear).join(' → ')}`);
  const rng = (k) => Math.max(...poses.map((q) => q[k])) - Math.min(...poses.map((q) => q[k]));
  if (rng('legNear') < 8) issues.push('diver: thigh barely moves');
  const el = await p.evaluate(() => ({ bubbles: document.querySelectorAll('.v7-bubble').length, animatedWaves: [...document.querySelectorAll('[data-v7-stage] .v7-wave')].map((w) => getComputedStyle(w).animationName).join(',') }));
  notes.push(`bubbles in DOM: ${el.bubbles} (≤ 12); wave animation: ${el.animatedWaves}`);
  if (el.bubbles > 12) issues.push('too many bubbles');

  // pointer drift (±40 px) and kick speed
  const xy = () => p.evaluate(() => { const m = (getComputedStyle(document.querySelector('.v7-diver-wrap')).transform.match(/matrix\(([^)]+)\)/) || [])[1]; return m ? m.split(',').map(Number).slice(4, 6).map((v) => Math.round(v)) : [0, 0]; });
  await p.mouse.move(300, 300); await p.mouse.move(1300, 700, { steps: 25 }); await sleep(1300);
  const right = await xy();
  await p.mouse.move(100, 120, { steps: 25 }); await sleep(1300);
  const left = await xy();
  notes.push(`pointer drift (px) toward bottom-right ${right}, toward top-left ${left}`);
  if (Math.abs(right[0]) > 41 || Math.abs(left[0]) > 41) issues.push('drift exceeds 40 px');
  if (right[0] - left[0] < 20) issues.push('diver does not follow the pointer');
  await p.locator('[data-v7-stage]').screenshot({ path: `${out}/v7-1440-pointer-drift.jpg`, type: 'jpeg', quality: 82 });

  // scroll nudge (≤ 80 px)
  await p.mouse.move(700, 450);
  await p.evaluate(() => window.scrollTo(0, 300)); await sleep(900);
  const nudge = await p.evaluate(() => { const m = (getComputedStyle(document.querySelector('.v7-diver-nudge')).transform.match(/matrix\(([^)]+)\)/) || [])[1]; return m ? Math.round(+m.split(',')[5]) : 0; });
  notes.push(`scroll nudge at 300 px scroll: ${nudge} px (≤ 80)`);
  if (nudge > 80) issues.push('nudge > 80 px');
  await p.evaluate(() => window.scrollTo(0, 0)); await sleep(700);

  // pause button: static pose, waves paused, button state
  const btn = p.locator('[data-v7-pause]');
  await btn.focus(); await p.keyboard.press('Enter'); await sleep(1500);
  const paused = await p.evaluate(() => ({ pressed: document.querySelector('[data-v7-pause]').getAttribute('aria-pressed'), label: document.querySelector('[data-v7-pause]').getAttribute('aria-label'), running: window.__v7.running, state: getComputedStyle(document.querySelector('[data-v7-stage] .v7-wave')).animationPlayState }));
  const before = await pose(p); await sleep(500); const after = await pose(p);
  notes.push(`pause button: ${JSON.stringify(paused)}; pose stable while paused: ${JSON.stringify(before) === JSON.stringify(after)}`);
  if (paused.running || paused.state !== 'paused' || JSON.stringify(before) !== JSON.stringify(after)) issues.push('pause did not freeze everything');
  await stage.screenshot({ path: `${out}/v7-1440-paused-pose.jpg`, type: 'jpeg', quality: 82 });
  await p.screenshot({ path: `${out}/v7-1440-focus-pause-button.jpg`, type: 'jpeg', quality: 80, clip: { x: 0, y: 70, width: 700, height: 200 } });
  await btn.click(); await sleep(700);
  notes.push(`after resume: running ${await p.evaluate(() => window.__v7.running)}`);

  // off-screen + hidden tab
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await sleep(1500);
  const away = await p.evaluate(() => ({ running: window.__v7.running, offscreen: document.querySelector('[data-v7-stage]').hasAttribute('data-offscreen') }));
  await p.evaluate(() => window.scrollTo(0, 0)); await sleep(800);
  await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  await sleep(1500);
  const hid = await p.evaluate(() => window.__v7.running);
  await p.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
  notes.push(`off-screen: ${JSON.stringify(away)}; hidden tab running: ${hid}`);
  if (away.running || hid) issues.push('loop keeps running off-screen / hidden');
  await ctx.close();
}

// ---- touch (iPhone-sized): tap = ripple + bubble burst + stronger kick ----
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage(); watch(p, 'touch');
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__v7?.running, null, { timeout: 15000 }).catch(() => issues.push('touch: diver never started'));
  await sleep(800);
  const box = await p.locator('[data-v7-stage]').boundingBox();
  await p.touchscreen.tap(box.x + box.width * 0.55, box.y + box.height * 0.6);
  await sleep(350);
  const t = await p.evaluate(() => ({ rings: document.querySelectorAll('.v7-ripple-ring').length, visibleBubbles: [...document.querySelectorAll('.v7-bubble')].filter((b) => +getComputedStyle(b).opacity > 0.05).length }));
  notes.push(`tap on the water: ${JSON.stringify(t)}`);
  if (!t.rings || t.visibleBubbles < 3) issues.push('tap burst missing');
  await p.locator('[data-v7-stage]').screenshot({ path: `${out}/v7-375-tap-burst.jpg`, type: 'jpeg', quality: 82 });
  await ctx.close();
}

// ---- reduced motion: static pose, nothing loops, button hidden; live switch ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage(); watch(p, 'reduced');
  await p.goto(url, { waitUntil: 'load' }); await sleep(2500);
  const r = await p.evaluate(() => ({ live: document.querySelector('[data-v7-stage]').hasAttribute('data-live'), running: window.__v7?.running ?? false, wave: getComputedStyle(document.querySelector('[data-v7-stage] .v7-wave')).animationName, pauseHidden: getComputedStyle(document.querySelector('[data-v7-pause]')).display === 'none' || document.querySelector('[data-v7-pause]').hidden }));
  notes.push(`reduced motion: ${JSON.stringify(r)}`);
  if (r.live || r.running || r.wave !== 'none' || !r.pauseHidden) issues.push('reduced motion not static');
  await p.locator('[data-v7-stage]').screenshot({ path: `${out}/v7-1440-reduced-static-pose.jpg`, type: 'jpeg', quality: 82 });
  await p.emulateMedia({ reducedMotion: 'no-preference' }); await sleep(1500);
  const on = await p.evaluate(() => ({ live: document.querySelector('[data-v7-stage]').hasAttribute('data-live'), running: window.__v7?.running }));
  await p.emulateMedia({ reducedMotion: 'reduce' }); await sleep(1500);
  const off = await p.evaluate(() => ({ live: document.querySelector('[data-v7-stage]').hasAttribute('data-live'), running: window.__v7?.running }));
  notes.push(`live switch: allow → ${JSON.stringify(on)}; reduce → ${JSON.stringify(off)}`);
  if (!on.live || !on.running || off.live || off.running) issues.push('live reduced-motion switch broken');
  await ctx.close();
}

// ---- Dive Center diver: static, short kick on hover; gallery, lightbox, marquee, accordion ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage(); watch(p, 'ui');
  await p.goto(url, { waitUntil: 'load' }); await sleep(1800);
  const fig = p.locator('[data-v7-diver-static]');
  await fig.scrollIntoViewIfNeeded(); await sleep(500);
  const rest = await p.evaluate(() => document.querySelector('[data-v7-diver-static] [data-d="legNear"]').getAttribute('transform'));
  const bx = await fig.boundingBox();
  await p.mouse.move(bx.x + 40, bx.y + 40); await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2, { steps: 6 }); await sleep(450);
  const mid = await p.evaluate(() => document.querySelector('[data-v7-diver-static] [data-d="legNear"]').getAttribute('transform'));
  await fig.screenshot({ path: `${out}/v7-1440-dive-diver-hover-kick.jpg`, type: 'jpeg', quality: 82 });
  await sleep(2400);
  const back = await p.evaluate(() => document.querySelector('[data-v7-diver-static] [data-d="legNear"]').getAttribute('transform'));
  notes.push(`dive diver hover: kicks (${rest !== mid}) and returns to the static pose (${back === rest || back === mid ? 'check' : 'settled'})`);
  if (rest === mid) issues.push('dive diver did not kick on hover');
  await p.locator('#galeria').scrollIntoViewIfNeeded(); await sleep(800);
  await p.locator('[data-filter="voda"]').click(); await sleep(900);
  const g = await p.evaluate(() => ({ shown: [...document.querySelectorAll('[data-gallery-grid] > li')].filter((l) => !l.hidden).length, status: document.querySelector('[data-gallery-status]')?.textContent }));
  notes.push(`gallery filter: ${JSON.stringify(g)}`);
  await p.locator('[data-filter="all"]').click(); await sleep(800);
  await p.locator('a[data-lightbox]').nth(1).focus(); await p.keyboard.press('Enter'); await sleep(700);
  await p.screenshot({ path: `${out}/v7-1440-lightbox.jpg`, type: 'jpeg', quality: 80 });
  const lb = await p.evaluate(() => document.querySelector('[data-lightbox-dialog]').open);
  await p.keyboard.press('Escape'); await sleep(400);
  const back2 = await p.evaluate(() => document.activeElement?.matches('a[data-lightbox]'));
  notes.push(`lightbox open ${lb}, focus back on thumbnail ${back2}`);
  if (!lb || !back2) issues.push('lightbox issue');
  const toggle = p.locator('[data-marquee-toggle]'); await toggle.scrollIntoViewIfNeeded(); await toggle.click(); await sleep(500);
  notes.push(`marquee paused: ${await p.evaluate(() => getComputedStyle(document.querySelector('.m-marquee-track')).animationPlayState)}`);
  await p.locator('#hodiny details').nth(2).locator('summary').click(); await sleep(450);
  await p.locator('#hodiny').scrollIntoViewIfNeeded(); await sleep(300);
  await p.screenshot({ path: `${out}/v7-1440-accordion-open.jpg`, type: 'jpeg', quality: 80 });
  await ctx.close();
}

// ---- live status dot on a SIMULATED July day ----
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, timezoneId: 'Europe/Bratislava' });
  const p = await ctx.newPage();
  await p.clock.setFixedTime(new Date('2026-07-15T12:30:00+02:00'));
  await p.goto(url, { waitUntil: 'load' }); await sleep(2000);
  const s = await p.evaluate(() => ({ state: document.querySelector('[data-status]')?.dataset.state, text: document.querySelector('[data-status-text]')?.textContent }));
  notes.push(`SIMULATED 15. 7. 2026 12:30: ${JSON.stringify(s)}`);
  await p.screenshot({ path: `${out}/v7-375-SIMULATED-july-status.jpg`, type: 'jpeg', quality: 80, timeout: 15000 }).catch((e) => issues.push('july shot ' + e.message));
  await ctx.close();
}
await browser.close();
console.log(notes.join('\n'));
console.log(issues.length ? `\nISSUES:\n${issues.join('\n')}` : '\nno issues');
