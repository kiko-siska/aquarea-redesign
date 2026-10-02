// First-screen screenshots of the homepage directions for the picker page (src/assets/picker/).
// Usage: node scripts/picker-thumbs.mjs <baseUrl> [variant ...]
//   e.g. node scripts/picker-thumbs.mjs http://localhost:4321 4 5   (only rewrites v4/v5 thumbnails)
// Defaults to 1 2 3. V5 skips its film leader (?leader=0); V4 waits for the WebGL water and the torch.
import { chromium } from 'playwright-core';
const [base = 'http://localhost:4321', ...rest] = process.argv.slice(2);
const variants = rest.length ? rest.map(Number) : [1, 2, 3];
const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
for (const [w, h, tag] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
  const mobile = tag === 'mobile';
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile, timezoneId: 'Europe/Bratislava', locale: 'sk-SK' });
  for (const v of variants) {
    const page = await ctx.newPage();
    await page.goto(`${base}/variants/${v}/${v === 5 ? '?leader=0' : ''}`, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'astro-dev-toolbar{display:none!important}' });
    await page.waitForTimeout(v >= 4 ? 3500 : 400);
    await page.screenshot({ path: `src/assets/picker/v${v}-${tag}.png` });
    await page.close();
  }
  await ctx.close();
}
await browser.close();
console.log(`picker thumbnails written: ${variants.join(', ')}`);
