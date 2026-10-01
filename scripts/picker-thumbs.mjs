// First-screen screenshots of the three directions for the picker page (src/assets/picker/).
// Usage: node scripts/picker-thumbs.mjs http://localhost:4321
import { chromium } from 'playwright-core';
const base = process.argv[2] ?? 'http://localhost:4321';
const browser = await chromium.launch({ channel: 'chrome' });
for (const [w, h, tag] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: tag === 'mobile' ? 2 : 1, timezoneId: 'Europe/Bratislava', locale: 'sk-SK' });
  for (const v of [1, 2, 3]) {
    const page = await ctx.newPage();
    await page.goto(`${base}/variants/${v}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `src/assets/picker/v${v}-${tag}.png` });
    await page.close();
  }
  await ctx.close();
}
await browser.close();
console.log('picker thumbnails written');
