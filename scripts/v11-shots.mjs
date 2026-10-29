// Viewport shots (hero, zones, hours/dive) of the light experiments next to V8.
// Usage: node scripts/v11-shots.mjs <baseUrl> <outDir> <variant...>
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [base, outDir, ...variants] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const [w, h] of [[1440, 900], [375, 812]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: 'sk-SK', timezoneId: 'Europe/Bratislava', reducedMotion: 'reduce' });
  for (const v of variants) {
    const page = await ctx.newPage();
    await page.goto(`${base}/variants/${v}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${outDir}/v${v}-${w}-hero.jpg`, type: 'jpeg', quality: 85 });
    for (const [id, name] of [['zony', 'zones'], ['ceny', 'prices']]) {
      await page.evaluate((i) => document.getElementById(i)?.scrollIntoView({ block: 'start' }), id);
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${outDir}/v${v}-${w}-${name}.jpg`, type: 'jpeg', quality: 85 });
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
