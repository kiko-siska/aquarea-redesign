// V10 viewport screenshots + hero geometry (stage, dock, pin plates). Usage: node scripts/v10-shots.mjs <outDir> WxH[xDPR[xScrollY]] ...
import { chromium } from 'playwright-core';
const [out, ...sizes] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });
for (const s of sizes) {
  const [w, h, dpr = '1', scroll = '0'] = s.split('x');
  const mobile = +w < 768;
  const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: +dpr, isMobile: mobile, hasTouch: mobile, locale: 'sk-SK', timezoneId: 'Europe/Bratislava' });
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') console.log('console.error', m.text()); });
  p.on('pageerror', (e) => console.log('pageerror', e.message));
  await p.goto('http://localhost:4322/variants/10/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  if (+scroll) { await p.evaluate((y) => window.scrollTo(0, y), +scroll); await p.waitForTimeout(900); }
  await p.screenshot({ path: `${out}/${w}x${h}${+scroll ? '-s' + scroll : ''}.jpg`, type: 'jpeg', quality: 78 });
  const info = await p.evaluate(() => {
    const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
    return { stage: r('.v10-stage'), dock: r('.v10-dock'), pins: [...document.querySelectorAll('.v10-pin-plate')].map((a) => { const b = a.getBoundingClientRect(); return [a.textContent.trim().slice(0, 12), Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; }), img: document.querySelector('.v10-map img').currentSrc.split('/').pop().slice(0, 40), sw: document.documentElement.scrollWidth };
  });
  console.log(s, JSON.stringify(info));
  await ctx.close();
}
await browser.close();
