// V10 photo contrast proof (Phase 8 brief §2). Measures REAL pixels, it does not assume.
// Usage: node scripts/v10-photo-contrast.mjs [baseUrl=http://localhost:4322] [outDir=screenshots/phase8/contrast]
//
// For every viewport (the 4:5 AI image on phones/tablets, the real 3:2 photo on desktop and ultra-wide) and every state
// (hero drift at 0 / 50 / 100 %, the scroll flight at 0 / 30 / 60 / 90 %, each zone stop entering / centred / leaving):
//  1. TEXT (WCAG 1.4.3): every visible text line inside the hero and the photo stops is made transparent, the page
//     is screenshotted, and the pixels under each line box are read back. Contrast of the computed text colour against
//     each background pixel; the 2nd-percentile (worst 2 %) must be ≥ 4.5:1, or ≥ 3:1 for large text (≥ 24 px, or
//     ≥ 18.66 px bold). Text covered by something else (the rising page, the header) is skipped.
//  2. UI ON THE PHOTO (WCAG 1.4.11): for each pin plate, pin dot, stop plate, TODO chip and the pause button, a ring of
//     photo pixels 3–7 px outside the element is read from a normal screenshot; the better of (fill, ink edge) against
//     each pixel, 5th percentile, must be ≥ 3:1.
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const [base = 'http://localhost:4322', out = 'screenshots/phase8/contrast'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const URL_ = `${base}/variants/10/`;
const VIEWPORTS = [
  { w: 375, h: 812, dpr: 2, mobile: true, tag: '375x812 (AI 4:5)' },
  { w: 375, h: 667, dpr: 2, mobile: true, tag: '375x667 (AI 4:5)' },
  { w: 768, h: 1024, dpr: 1, mobile: false, tag: '768x1024 (AI 4:5)' },
  { w: 1440, h: 900, dpr: 1, mobile: false, tag: '1440x900 (real 3:2)' },
  { w: 2560, h: 1080, dpr: 1, mobile: false, tag: '2560x1080 (real 3:2, ultra-wide)' },
];
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => { const [h, l] = a > b ? [a, b] : [b, a]; return (h + 0.05) / (l + 0.05); };
const pct = (arr, p) => { const s = [...arr].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor((s.length - 1) * p))]; };
const parseRgb = (s) => s.match(/[\d.]+/g).slice(0, 3).map(Number);

const browser = await chromium.launch({ channel: 'chrome' });
const fails = [];
const rows = [];

async function pixels(page, dpr) {
  const buf = await page.screenshot({ type: 'png', timeout: 20000 });
  const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, W: info.width, H: info.height, dpr, at(x, y) { const i = (Math.round(y) * this.W + Math.round(x)) * 3; return [data[i], data[i + 1], data[i + 2]]; } };
}

// text line boxes (viewport px) of visible, unoccluded text inside the photo areas
const collectText = () => {
  const roots = [...document.querySelectorAll('.v10-hero, .v10-stop')];
  const out = [];
  for (const root of roots) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.textContent.trim() ? 1 : 3) });
    let n;
    while ((n = walker.nextNode())) {
      const el = n.parentElement;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || el.closest('[hidden]') || el.closest('.sr-only')) continue;
      const r = document.createRange(); r.selectNodeContents(n);
      for (const b of r.getClientRects()) {
        if (b.width < 2 || b.height < 2 || b.bottom < 0 || b.top > innerHeight || b.right < 0 || b.left > innerWidth) continue;
        // visibility mask: only 3 px cells whose centre really shows this element (not the rising page, header or bar)
        const cells = [];
        let total = 0;
        for (let y = b.top + 1.5; y < b.bottom - 1; y += 3) for (let x = b.left + 1.5; x < b.right - 1; x += 3) {
          total++;
          if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
          const hit = document.elementFromPoint(x, y);
          if (hit && (hit === el || el.contains(hit) || hit.contains(el))) cells.push([x, y]);
        }
        if (!cells.length || cells.length < total * 0.6) continue; // mostly covered: not readable as a line, not a contrast case
        const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight, 10);
        out.push({ text: n.textContent.trim().slice(0, 28), color: cs.color, large: size >= 24 || (size >= 18.66 && weight >= 700), cells, where: el.closest('.v10-pin, .v10-stop-plate, .v10-dock, .v10-chip-todo, .v10-pause')?.className.split(' ')[0] ?? el.tagName });
      }
    }
  }
  return out;
};
// UI elements drawn on the photo (fill + ink edge vs the photo around them)
const collectUi = () => [...document.querySelectorAll('.v10-pin-plate, .v10-pin-dot, .v10-stop-plate, .v10-chip-todo .todo-note, .v10-pause:not([hidden])')].map((el) => {
  const b = el.getBoundingClientRect();
  if (b.width < 2 || b.bottom < 0 || b.top > innerHeight) return null;
  const cs = getComputedStyle(el);
  const hit = document.elementFromPoint(Math.min(innerWidth - 1, b.left + b.width / 2), Math.min(innerHeight - 1, Math.max(0, b.top + b.height / 2)));
  if (!hit || !(hit === el || el.contains(hit))) return null;
  return { name: el.className.split(' ')[0] || el.tagName, fill: cs.backgroundColor, x: b.left, y: b.top, w: b.width, h: b.height };
}).filter(Boolean);

async function measure(page, vp, state) {
  const ui = await page.evaluate(collectUi);
  const normal = await pixels(page, vp.dpr);
  const text = await page.evaluate(collectText);
  await page.evaluate(() => document.documentElement.classList.add('__ct'));
  await page.waitForTimeout(60);
  const blank = await pixels(page, vp.dpr);
  await page.evaluate(() => document.documentElement.classList.remove('__ct'));
  for (const t of text) {
    const fg = lum(...parseRgb(t.color));
    const vals = [];
    for (const [cx, cy] of t.cells) for (let dy = -1.5; dy < 1.5; dy += 1 / vp.dpr) for (let dx = -1.5; dx < 1.5; dx += 1 / vp.dpr) {
      const px = (cx + dx) * vp.dpr, py = (cy + dy) * vp.dpr;
      if (px < 0 || py < 0 || px >= blank.W || py >= blank.H) continue;
      vals.push(ratio(fg, lum(...blank.at(px, py))));
    }
    if (!vals.length) continue;
    const worst = pct(vals, 0.02), need = t.large ? 3 : 4.5;
    rows.push({ vp: vp.tag, state, kind: 'text', what: `${t.where}: "${t.text}"`, value: +worst.toFixed(2), need });
    if (worst < need) fails.push(`${vp.tag} · ${state} · ${t.where} "${t.text}": ${worst.toFixed(2)} < ${need}`);
  }
  const INK = lum(24, 24, 24);
  for (const u of ui) {
    const fill = parseRgb(u.fill);
    const fillL = lum(...fill);
    const vals = [];
    for (let d = 3; d <= 7; d += 2) {
      for (let x = u.x - d; x <= u.x + u.w + d; x += 2) for (const y of [u.y - d, u.y + u.h + d]) vals.push([x, y]);
      for (let y = u.y - d; y <= u.y + u.h + d; y += 2) for (const x of [u.x - d, u.x + u.w + d]) vals.push([x, y]);
    }
    const rs = vals.filter(([x, y]) => x >= 0 && y >= 0 && x * vp.dpr < normal.W && y * vp.dpr < normal.H)
      .map(([x, y]) => { const L = lum(...normal.at(x * vp.dpr, y * vp.dpr)); return Math.max(ratio(fillL, L), ratio(INK, L)); });
    if (!rs.length) continue;
    const worst = pct(rs, 0.05);
    rows.push({ vp: vp.tag, state, kind: 'ui', what: u.name, value: +worst.toFixed(2), need: 3 });
    if (worst < 3) fails.push(`${vp.tag} · ${state} · UI ${u.name}: ${worst.toFixed(2)} < 3`);
  }
  return normal;
}

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: vp.dpr, isMobile: vp.mobile, hasTouch: vp.mobile, locale: 'sk-SK', timezoneId: 'Europe/Bratislava' });
  const page = await ctx.newPage();
  await page.goto(URL_, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: 'html.__ct :is(.v10-hero, .v10-stop) *, html.__ct :is(.v10-hero, .v10-stop) *::before, html.__ct :is(.v10-hero, .v10-stop) *::after { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; text-decoration-color: transparent !important; } html.__ct :is(.v10-hero, .v10-stop) svg { opacity: 0 !important; } .v10-wave { pointer-events: auto !important; }' }); // the wave is decorative (pointer-events: none) but it does cover text, so occlusion tests must see it
  await page.waitForFunction(() => document.querySelector('[data-v10-stage]')?.hasAttribute('data-live'), null, { timeout: 15000 });
  const setDrift = (f) => page.evaluate((frac) => {
    for (const a of document.getAnimations()) if (a.animationName === 'v10-drift') { a.pause(); a.currentTime = 46000 * frac; }
  }, f);
  const flight = await page.evaluate(() => document.querySelector('.v10-hero').getBoundingClientRect().height);
  // hero: drift states at the top, then flight states
  for (const f of [0, 0.5, 1]) {
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(500);
    await setDrift(f); await page.waitForTimeout(150);
    const shot = await measure(page, vp, `hero drift ${f * 100}%`);
    if (f === 0.5) await sharp(shot.data, { raw: { width: shot.W, height: shot.H, channels: 3 } }).jpeg({ quality: 70 }).toFile(`${out}/${vp.w}x${vp.h}-hero.jpg`);
  }
  await setDrift(1);
  for (const f of [0.3, 0.6, 0.9]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(flight * f)); await page.waitForTimeout(800);
    await measure(page, vp, `flight ${f * 100}% (scale ${await page.evaluate(() => getComputedStyle(document.querySelector('[data-v10-scale]')).transform.match(/[\d.]+/)?.[0] ?? '1')})`);
  }
  // zone stops: entering, centred, leaving (the scrubbed push-in changes the photo under the plate)
  const stops = await page.evaluate(() => [...document.querySelectorAll('[data-v10-stop]')].map((s) => ({ id: s.closest('section').id, top: s.getBoundingClientRect().top + scrollY, h: s.offsetHeight })));
  for (const s of stops) {
    for (const [label, pos] of [['entering', 0.8], ['centred', 0.5], ['leaving', 0.15]]) {
      const y = Math.max(0, Math.round(s.top + s.h / 2 - vp.h * pos));
      await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(700);
      const shot = await measure(page, vp, `stop #${s.id} ${label}`);
      if (label === 'centred' && vp.w !== 768) await sharp(shot.data, { raw: { width: shot.W, height: shot.H, channels: 3 } }).jpeg({ quality: 70 }).toFile(`${out}/${vp.w}x${vp.h}-stop-${s.id}.jpg`);
    }
  }
  await ctx.close();
}
await browser.close();

const summary = {};
for (const r of rows) {
  const k = `${r.vp} · ${r.kind}`;
  summary[k] = summary[k] ? { n: summary[k].n + 1, min: Math.min(summary[k].min, r.value), minWhat: summary[k].min <= r.value ? summary[k].minWhat : `${r.state} · ${r.what}` } : { n: 1, min: r.value, minWhat: `${r.state} · ${r.what}` };
}
writeFileSync(`${out}/report.json`, JSON.stringify({ rows, fails }, null, 1));
for (const [k, v] of Object.entries(summary)) console.log(`${k}: ${v.n} samples, worst ${v.min.toFixed(2)} (${v.minWhat})`);
console.log(fails.length ? `\nFAIL (${fails.length}):\n${fails.slice(0, 40).join('\n')}` : `\nPASS: ${rows.length} measurements, all ≥ WCAG AA`);
process.exitCode = fails.length ? 1 : 0;
