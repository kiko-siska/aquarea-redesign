// Phase 7: hero behaviour checks for V8 (aerial only) and V9 (diver + torch in dark water).
// Usage: node scripts/v89-interactions.mjs <baseUrl> [outDir=screenshots/phase7]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [base = 'http://localhost:4322', out = 'screenshots/phase7'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const notes = [], issues = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const watch = (p, tag) => { p.on('pageerror', (e) => issues.push(`${tag}: ${e.message}`)); p.on('console', (m) => { if (m.type() === 'error') issues.push(`${tag}: console ${m.text()}`); }); };

// ---------- V8 ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage(); watch(p, 'v8');
  await p.goto(`${base}/variants/8/`, { waitUntil: 'load' }); await sleep(2500);
  const st = () => p.evaluate(() => ({ anim: getComputedStyle(document.querySelector('.v8-photo img')).animationName, state: getComputedStyle(document.querySelector('.v8-photo img')).animationPlayState, tf: getComputedStyle(document.querySelector('.v8-photo img')).transform, img: document.querySelector('.v8-photo img').currentSrc.split('/').pop().slice(0, 28), todo: !!document.querySelector('.v7-chip-todo [data-todo]'), diver: document.querySelectorAll('.v7-diver').length }));
  const a = await st(); await sleep(1500); const b = await st();
  notes.push(`V8 drift: ${a.anim}/${a.state}; transform changes over 1.5 s: ${a.tf !== b.tf}; desktop image ${a.img}; TODO chip ${a.todo}; diver elements ${a.diver}`);
  if (a.anim !== 'v8-drift' || a.tf === b.tf || !a.todo || a.diver) issues.push('V8: drift/TODO/diver check failed');
  await p.locator('[data-v7-stage]').screenshot({ path: `${out}/v8-1440-drift-a.jpg`, type: 'jpeg', quality: 82 }); await sleep(5000);
  await p.locator('[data-v7-stage]').screenshot({ path: `${out}/v8-1440-drift-b.jpg`, type: 'jpeg', quality: 82 });
  await p.locator('[data-v7-pause]').focus(); await p.keyboard.press('Enter'); await sleep(600);
  const paused = await st(); await sleep(800); const paused2 = await st();
  notes.push(`V8 pause: ${paused.state}, frozen ${paused.tf === paused2.tf}, aria-pressed ${await p.locator('[data-v7-pause]').getAttribute('aria-pressed')}`);
  if (paused.state !== 'paused' || paused.tf !== paused2.tf) issues.push('V8: pause failed');
  await p.locator('[data-v7-pause]').click();
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await sleep(900);
  notes.push(`V8 off-screen: ${(await st()).state}, stage data-offscreen ${await p.evaluate(() => document.querySelector('[data-v7-stage]').hasAttribute('data-offscreen'))}`);
  await ctx.close();
  const m = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const pm = await m.newPage(); await pm.goto(`${base}/variants/8/`, { waitUntil: 'load' }); await sleep(1500);
  notes.push(`V8 phone image: ${await pm.evaluate(() => document.querySelector('.v8-photo img').currentSrc.split('/').pop().slice(0, 30))} (real photo, not the AI one)`);
  await m.close();
  const r = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const pr = await r.newPage(); watch(pr, 'v8 reduced'); await pr.goto(`${base}/variants/8/`, { waitUntil: 'load' }); await sleep(2000);
  const rs = await pr.evaluate(() => ({ anim: getComputedStyle(document.querySelector('.v8-photo img')).animationName, pressed: document.querySelector('[data-v7-pause]').getAttribute('aria-pressed'), shown: !document.querySelector('[data-v7-pause]').hidden }));
  await pr.locator('[data-v7-pause]').click(); await sleep(1200);
  const rp = await pr.evaluate(() => ({ anim: getComputedStyle(document.querySelector('.v8-photo img')).animationName, dur: getComputedStyle(document.querySelector('.v8-photo img')).animationDuration }));
  notes.push(`V8 reduced: ${JSON.stringify(rs)} → after play ${JSON.stringify(rp)}`);
  if (rs.anim !== 'none' || !rs.shown || rp.dur !== '46s') issues.push('V8: reduced motion / play button failed');
  await r.close();
}

// ---------- V9 ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage(); watch(p, 'v9');
  await p.goto(`${base}/variants/9/`, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__v9?.running && window.__v7?.running, null, { timeout: 15000 }).catch(() => issues.push('V9: torch/diver never started'));
  const t0 = await p.evaluate(() => window.__v9.torch); await sleep(2500); const t1 = await p.evaluate(() => window.__v9.torch);
  notes.push(`V9 idle torch wanders: (${t0.x.toFixed(2)},${t0.y.toFixed(2)}) → (${t1.x.toFixed(2)},${t1.y.toFixed(2)}) mode ${t1.mode}`);
  if (Math.hypot(t1.x - t0.x, t1.y - t0.y) < 0.03) issues.push('V9: idle torch does not move');
  await p.locator('[data-v7-stage]').screenshot({ path: `${out}/v9-1440-torch-idle.jpg`, type: 'jpeg', quality: 82 });
  const box = await p.locator('.v9-snow').boundingBox();
  await p.mouse.move(box.x + 50, box.y + 50); await p.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5, { steps: 12 }); await sleep(900);
  const tp = await p.evaluate(() => window.__v9.torch);
  notes.push(`V9 pointer aims the torch: mode ${tp.mode}, torch (${tp.x.toFixed(2)},${tp.y.toFixed(2)}) vs target 0.30/0.50`);
  if (tp.mode !== 'pointer' || Math.abs(tp.x - 0.3) > 0.06) issues.push('V9: pointer does not aim the torch');
  await p.locator('[data-v7-stage]').screenshot({ path: `${out}/v9-1440-torch-on-diver.jpg`, type: 'jpeg', quality: 82 });
  await p.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.8, { steps: 12 }); await sleep(900);
  await p.locator('[data-v7-stage]').screenshot({ path: `${out}/v9-1440-torch-away.jpg`, type: 'jpeg', quality: 82 });
  const pose = () => p.evaluate(() => { const t = getComputedStyle(document.querySelector('[data-v7-stage] [data-d="legs"]')).transform; const m = t.match(/matrix\(([^)]+)\)/); const [a, b] = m ? m[1].split(',').map(Number) : [1, 0]; return Math.round(Math.atan2(b, a) * 1800 / Math.PI) / 10; });
  const poses = []; for (let i = 0; i < 4; i++) { poses.push(await pose()); await sleep(300); }
  notes.push(`V9 diver legs° ${poses.join(' → ')}`);
  if (Math.max(...poses) - Math.min(...poses) < 8) issues.push('V9: diver legs barely move');
  await p.locator('[data-v7-pause]').focus(); await p.keyboard.press('Enter'); await sleep(1500);
  const a = await p.evaluate(() => window.__v9.torch); await sleep(800); const b = await p.evaluate(() => window.__v9.torch);
  notes.push(`V9 pause: torch running ${await p.evaluate(() => window.__v9.running)}, diver running ${await p.evaluate(() => window.__v7.running)}, torch still ${a.x === b.x && a.y === b.y}`);
  if (await p.evaluate(() => window.__v9.running || window.__v7.running)) issues.push('V9: pause did not stop torch/diver');
  await p.locator('[data-v7-pause]').click(); await sleep(500);
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await sleep(1200);
  notes.push(`V9 off-screen: torch running ${await p.evaluate(() => window.__v9.running)}`);
  if (await p.evaluate(() => window.__v9.running)) issues.push('V9: torch runs off-screen');
  await ctx.close();
  const t = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const pt = await t.newPage(); watch(pt, 'v9 touch'); await pt.goto(`${base}/variants/9/`, { waitUntil: 'load' });
  await pt.waitForFunction(() => window.__v9?.running, null, { timeout: 15000 }).catch(() => issues.push('V9 touch: not running'));
  const sb = await pt.locator('.v9-snow').boundingBox();
  await pt.touchscreen.tap(sb.x + sb.width * 0.2, sb.y + sb.height * 0.7); await sleep(700);
  const tt = await pt.evaluate(() => window.__v9.torch);
  notes.push(`V9 touch aims the torch: mode ${tt.mode}, (${tt.x.toFixed(2)},${tt.y.toFixed(2)})`);
  if (tt.mode !== 'touch') issues.push('V9: touch does not aim the torch');
  await pt.locator('[data-v7-stage]').screenshot({ path: `${out}/v9-375-touch-torch.jpg`, type: 'jpeg', quality: 82 });
  await t.close();
  const r = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const pr = await r.newPage(); watch(pr, 'v9 reduced'); await pr.goto(`${base}/variants/9/`, { waitUntil: 'load' }); await sleep(2500);
  const rs = await pr.evaluate(() => ({ torchRunning: window.__v9.running, diverRunning: window.__v7?.running, pressed: document.querySelector('[data-v7-pause]').getAttribute('aria-pressed') }));
  await pr.locator('[data-v7-stage]').screenshot({ path: `${out}/v9-1440-reduced-still.jpg`, type: 'jpeg', quality: 82 });
  await pr.locator('[data-v7-pause]').click(); await sleep(1500);
  const rp = await pr.evaluate(() => ({ torchRunning: window.__v9.running, diverRunning: window.__v7.running }));
  notes.push(`V9 reduced: ${JSON.stringify(rs)} → after play ${JSON.stringify(rp)}`);
  if (rs.torchRunning || rs.diverRunning || !rp.torchRunning || !rp.diverRunning) issues.push('V9: reduced motion / play button failed');
  await r.close();
}
await browser.close();
console.log(notes.join('\n'));
console.log(issues.length ? `\nISSUES:\n${issues.join('\n')}` : '\nno issues');
