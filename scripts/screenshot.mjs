// Full-page screenshots at 375 px and 1440 px with the installed Google Chrome.
// Usage: node scripts/screenshot.mjs <baseUrl> <outDir> <path> [<path> ...]
//   e.g. node scripts/screenshot.mjs http://localhost:4321 screenshots/phase2 /variants/1/ /variants/2/
// Env: REDUCED=1 emulates prefers-reduced-motion; WIDTHS=375,1440 overrides widths.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const [base, outDir, ...paths] = process.argv.slice(2);
if (!base || !outDir || paths.length === 0) {
  console.error('usage: node scripts/screenshot.mjs <baseUrl> <outDir> <path...>');
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });
const widths = (process.env.WIDTHS ?? '375,1440').split(',').map(Number);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
for (const w of widths) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: w < 768 ? 812 : 900 },
    deviceScaleFactor: 1, // 2× would exceed Chrome's 16 384 px capture limit on long mobile pages
    reducedMotion: process.env.REDUCED ? 'reduce' : 'no-preference',
    locale: 'sk-SK',
    timezoneId: 'Europe/Bratislava',
  });
  for (const p of paths) {
    const page = await ctx.newPage();
    // full-page capture: no smooth scrolling, no pinned (100svh) sections
    await page.addInitScript(() => {
      const mark = () => document.documentElement?.setAttribute('data-shot', '');
      if (document.documentElement) mark();
      else new MutationObserver((_, o) => { if (document.documentElement) { mark(); o.disconnect(); } }).observe(document, { childList: true });
    });
    page.on('pageerror', (e) => errors.push(`${p} @${w}: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`${p} @${w}: console ${m.text()}`); });
    await page.goto(base + p, { waitUntil: 'networkidle' });
    // scroll through so lazy images load and scroll-driven states settle
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight * 0.8) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 300));
    });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) errors.push(`${p} @${w}: horizontal overflow ${overflow}px`);
    const name = (p.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home') + `-${w}.jpg`;
    await page.screenshot({ path: `${outDir}/${name}`, fullPage: true, type: 'jpeg', quality: 78 });
    console.log('saved', `${outDir}/${name}`);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
if (errors.length) { console.log('\nISSUES:\n' + errors.join('\n')); }
