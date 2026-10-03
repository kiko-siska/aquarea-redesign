// Manual-style accessibility audit for /variants/7/ (what axe can't see).
// Usage: node scripts/v7-a11y-audit.mjs <baseUrl>
// - keyboard: tab through the whole page, record order, flag focus without a visible indicator and
//   focus hidden under the sticky header / bottom bar (WCAG 2.4.7, 2.4.11)
// - target size: interactive elements smaller than 44×44 CSS px (brief) / 24×24 (WCAG 2.5.8)
// - reflow at 320 px and 200 % zoom (1.4.10), text spacing override (1.4.12)
// - heading outline, landmarks, images without alt
import { chromium } from 'playwright-core';
const base = process.argv[2] ?? 'http://localhost:4322';
const url = `${base}/variants/7/`;
const browser = await chromium.launch({ channel: 'chrome' });
const out = [];

for (const w of [375, 1440]) {
  const mobile = w < 768;
  const ctx = await browser.newContext({ viewport: { width: w, height: mobile ? 812 : 900 }, isMobile: mobile, hasTouch: mobile });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(1200);
  // ---- keyboard ----
  const stops = [];
  for (let i = 0; i < 140; i++) {
    await p.keyboard.press('Tab');
    await p.waitForTimeout(450); // smooth scroll into view settles
    const s = await p.evaluate(() => {
      const a = document.activeElement;
      if (!a || a === document.body) return null;
      const r = a.getBoundingClientRect();
      const cs = getComputedStyle(a);
      const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none';
      const header = document.querySelector('header')?.getBoundingClientRect();
      const bar = document.querySelector('nav[aria-label="Rýchle akcie"]');
      const barR = bar && getComputedStyle(bar).display !== 'none' ? bar.getBoundingClientRect() : null;
      const inHeader = !!a.closest('header'), inBar = !!a.closest('nav[aria-label="Rýchle akcie"]');
      const coveredTop = !inHeader && header ? r.bottom <= header.bottom + 1 : false;
      const coveredBottom = !inBar && barR ? r.top >= barR.top - 1 : false;
      return { tag: a.tagName, text: (a.getAttribute('aria-label') || a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40), ring, coveredTop, coveredBottom, offscreen: r.bottom < 0 || r.top > innerHeight, w: Math.round(r.width), h: Math.round(r.height) };
    });
    if (!s) continue;
    if (stops.length && stops[0].text === s.text && stops[0].tag === s.tag && stops.length > 5) break;
    stops.push(s);
  }
  const noRing = stops.filter((s) => !s.ring);
  const obscured = stops.filter((s) => s.coveredTop || s.coveredBottom || s.offscreen);
  out.push(`@${w} keyboard: ${stops.length} tab stops; without visible indicator: ${noRing.length}${noRing.length ? ' → ' + noRing.map((s) => `${s.tag} "${s.text}"`).join('; ') : ''}; obscured/off-screen: ${obscured.length}${obscured.length ? ' → ' + obscured.map((s) => `${s.tag} "${s.text}"`).join('; ') : ''}`);
  out.push(`@${w} first 12 stops: ${stops.slice(0, 12).map((s) => s.text || s.tag).join(' › ')}`);
  // ---- target size ----
  const small = await p.evaluate(() => [...document.querySelectorAll('a[href], button, summary, [tabindex="0"]')]
    .filter((e) => { const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && e.getClientRects().length; })
    .map((e) => { const r = e.getBoundingClientRect(); const inline = getComputedStyle(e).display === 'inline' && e.closest('p, li') && (e.closest('p, li').textContent.trim().length > e.textContent.trim().length + 3); return { t: (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 36), w: Math.round(r.width), h: Math.round(r.height), inline }; })
    .filter((x) => !x.inline && (x.w < 44 || x.h < 44)));
  out.push(`@${w} targets under 44 px (non-inline): ${small.length}${small.length ? ' → ' + small.map((s) => `"${s.t}" ${s.w}×${s.h}`).join('; ') : ''}`);
  await ctx.close();
}

// ---- reflow 320 px, 200 % zoom (1280 → 640 CSS px), text spacing ----
for (const [w, label] of [[320, 'reflow 320 px'], [640, '200 % zoom of 1280']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(800);
  const o = await p.evaluate((vw) => document.documentElement.scrollWidth - vw, w);
  await p.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }' });
  await p.waitForTimeout(300);
  const o2 = await p.evaluate((vw) => document.documentElement.scrollWidth - vw, w);
  const clipped = await p.evaluate(() => [...document.querySelectorAll('main h1, main h2, main h3, main p, main a, main dd, main dt, main button')]
    .filter((e) => e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX !== 'visible').map((e) => e.textContent.trim().slice(0, 30)).slice(0, 5));
  out.push(`${label}: horizontal overflow ${o}px; with WCAG text spacing ${o2}px; clipped text: ${clipped.length ? clipped.join(' | ') : 'none'}`);
  await ctx.close();
}

// ---- structure ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  const s = await p.evaluate(() => {
    const hs = [...document.querySelectorAll('h1, h2, h3, h4')].map((h) => `${h.tagName[1]}:${h.textContent.trim().slice(0, 28)}`);
    let skips = []; let prev = 0;
    for (const h of document.querySelectorAll('h1, h2, h3, h4')) { const l = +h.tagName[1]; if (prev && l > prev + 1) skips.push(h.textContent.trim().slice(0, 30)); prev = l; }
    return { h1: document.querySelectorAll('h1').length, headings: hs.length, skips, landmarks: ['header', 'main', 'footer', 'nav'].map((t) => `${t}:${document.querySelectorAll(t).length}`).join(' '), noAlt: document.querySelectorAll('img:not([alt])').length, lang: document.documentElement.lang, skip: !!document.querySelector('.skip-link') };
  });
  out.push(`structure: ${JSON.stringify(s)}`);
  await ctx.close();
}
await browser.close();
console.log(out.join('\n'));
