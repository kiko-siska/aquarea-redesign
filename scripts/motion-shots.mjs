// Phase 4 verification for the motion variants (V4, V5): viewport screenshots at 0/25/50/75/100 % scroll,
// hover/touch states, console errors, horizontal overflow, WebGL state and render-loop pausing.
// Full-page capture doesn't work for these pages (fixed canvas, pins, Lenis), so every shot is a viewport.
//
// Usage: node scripts/motion-shots.mjs <baseUrl> <outDir> <path> [<path> ...]
//   e.g. node scripts/motion-shots.mjs http://localhost:4321 screenshots/phase4 /variants/4/ /variants/5/
// Env: WIDTHS=375,1440 (default); HEADED=1 runs a visible window (real GPU) instead of headless SwiftShader.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const [base, outDir, ...paths] = process.argv.slice(2);
if (!base || !outDir || paths.length === 0) {
  console.error('usage: node scripts/motion-shots.mjs <baseUrl> <outDir> <path...>');
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });
const widths = (process.env.WIDTHS ?? '375,1440').split(',').map(Number);
const browser = await chromium.launch({
  channel: 'chrome',
  headless: !process.env.HEADED,
  args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'],
});
const issues = [];
const notes = [];
const wait = (page, ms) => page.waitForTimeout(ms);

// jump to a scroll fraction through Lenis (if present) so ScrollTrigger and Lenis stay in sync
async function scrollToFraction(page, f) {
  await page.evaluate(async (frac) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const y = Math.round(max * frac);
    const lenis = window.lenis;
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo({ top: y, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
  }, f);
}

for (const w of widths) {
  const mobile = w < 768;
  const ctx = await browser.newContext({
    viewport: { width: w, height: mobile ? 812 : 900 },
    deviceScaleFactor: mobile ? 2 : 1,
    isMobile: mobile,
    hasTouch: mobile,
    locale: 'sk-SK',
    timezoneId: 'Europe/Bratislava',
  });
  for (const p of paths) {
    const tag = p.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home';
    const page = await ctx.newPage();
    page.on('pageerror', (e) => issues.push(`${p} @${w}: pageerror ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error') issues.push(`${p} @${w}: console.error ${m.text()}`); });
    page.on('requestfailed', (r) => issues.push(`${p} @${w}: request failed ${r.url()} ${r.failure()?.errorText}`));
    await page.goto(base + p, { waitUntil: 'networkidle' });
    // `astro preview` injects its dev toolbar; it isn't part of the build
    await page.addStyleTag({ content: 'astro-dev-toolbar{display:none!important}' });
    // V5 plays a film leader first; any key skips it (as a visitor would by scrolling)
    await page.keyboard.press('Space').catch(() => {});
    await wait(page, 3000);

    const gl = await page.evaluate(() => document.documentElement.dataset.gl ?? 'n/a');
    notes.push(`${p} @${w}: data-gl=${gl}`);

    for (const f of [0, 0.25, 0.5, 0.75, 1]) {
      await scrollToFraction(page, f);
      await wait(page, 1600);
      const pct = String(Math.round(f * 100)).padStart(3, '0');
      await page.screenshot({ path: `${outDir}/${tag}-${w}-scroll${pct}.jpg`, type: 'jpeg', quality: 80 });
    }
    // compare with the configured width: on isMobile the layout viewport grows to fit overflowing content
    const overflow = await page.evaluate((vw) => document.documentElement.scrollWidth - vw, w);
    if (overflow > 1) issues.push(`${p} @${w}: horizontal overflow ${overflow}px`);

    // interaction states
    const hoverSel = await page.evaluate(() => document.querySelector('[data-shot-hover]')?.getAttribute('data-shot-hover') ?? null);
    if (hoverSel) {
      const el = page.locator(hoverSel).first();
      await el.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.lenis?.resize?.());
      await wait(page, 900);
      const box = await el.boundingBox();
      if (box) {
        const x = box.x + box.width * 0.3, y = box.y + box.height * 0.5;
        if (mobile) {
          // touch: tap, then drag the torch across (CDP touch events)
          const cdp = await ctx.newCDPSession(page);
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
          for (let i = 1; i <= 8; i++) {
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + i * 12, y: y - i * 4 }] });
            await wait(page, 40);
          }
          await wait(page, 500);
          await page.screenshot({ path: `${outDir}/${tag}-${w}-touch.jpg`, type: 'jpeg', quality: 80 });
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        } else {
          await page.mouse.move(x - 200, y - 60);
          await page.mouse.move(x, y, { steps: 12 });
          await wait(page, 700);
          await page.mouse.down(); await page.mouse.up();
          await wait(page, 450);
          await page.screenshot({ path: `${outDir}/${tag}-${w}-hover.jpg`, type: 'jpeg', quality: 80 });
        }
      }
    }

    // render loop: running in the water zone, paused at the bottom and when the tab is hidden
    const loop = await page.evaluate(async () => {
      const dbg = window.__v4;
      if (!dbg) return null;
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const lenis = window.lenis;
      lenis.scrollTo(0, { immediate: true, force: true });
      await sleep(700);
      const a = dbg.frames; await sleep(700); const runningTop = dbg.frames - a;
      lenis.scrollTo(document.documentElement.scrollHeight, { immediate: true, force: true });
      await sleep(900);
      const b = dbg.frames; await sleep(700); const runningBottom = dbg.frames - b;
      lenis.scrollTo(0, { immediate: true, force: true });
      await sleep(500);
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      await sleep(300);
      const c = dbg.frames; await sleep(700); const runningHidden = dbg.frames - c;
      delete document.hidden;
      return { runningTop, runningBottom, runningHidden };
    });
    if (loop) {
      notes.push(`${p} @${w}: frames in 0.7 s: top ${loop.runningTop}, bottom ${loop.runningBottom}, hidden ${loop.runningHidden}`);
      if (gl === 'on' && loop.runningTop === 0) issues.push(`${p} @${w}: render loop not running at top`);
      if (loop.runningBottom > 0) issues.push(`${p} @${w}: render loop still running off-screen (${loop.runningBottom})`);
      if (loop.runningHidden > 0) issues.push(`${p} @${w}: render loop still running while hidden (${loop.runningHidden})`);
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
console.log(notes.join('\n'));
console.log(issues.length ? `\nISSUES:\n${issues.join('\n')}` : '\nno issues');
