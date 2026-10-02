// Phase 4: one viewport screenshot per scene of /variants/5/ (and per section of /variants/4/), because
// the 0/25/50/75/100 % shots skip scenes on long pinned pages.
// Usage: node scripts/scene-shots.mjs <baseUrl> <outDir> <path> <sectionSelector> [offsetVh=0.35]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [base, outDir, path, sel, off = '0.35'] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const tag = path.replace(/^\/|\/$/g, '').replace(/\//g, '-');
const errors = [];
for (const w of [375, 1440]) {
  const mobile = w < 768;
  const ctx = await browser.newContext({ viewport: { width: w, height: mobile ? 812 : 900 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1, locale: 'sk-SK', timezoneId: 'Europe/Bratislava' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${w}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${w}: ${m.text()}`); });
  await page.goto(`${base}${path}?leader=0`, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: 'astro-dev-toolbar{display:none!important}' });
  await page.waitForTimeout(2500);
  const count = await page.locator(sel).count();
  for (let i = 0; i < count; i++) {
    await page.evaluate(({ sel, i, off }) => {
      const s = document.querySelectorAll(sel)[i];
      const top = s.getBoundingClientRect().top + window.scrollY;
      // pinned scenes: go half-way through the pin
      const spacer = s.querySelector('.pin-spacer');
      const extra = spacer ? Math.max(0, spacer.offsetHeight - window.innerHeight) / 2 : window.innerHeight * Number(off);
      window.lenis.scrollTo(top + extra, { immediate: true, force: true });
    }, { sel, i, off });
    await page.waitForTimeout(1700);
    const state = await page.evaluate(() => `${Math.round(window.scrollY)} scene=${document.documentElement.dataset.v5Scene ?? '-'}`);
    console.log(w, i + 1, state);
    await page.screenshot({ path: `${outDir}/${tag}-${w}-scene${String(i + 1).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 80 });
  }
  await ctx.close();
}
await browser.close();
console.log(errors.length ? errors.join('\n') : 'scene shots ok, no console errors');
