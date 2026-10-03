// Phase 5 checks for /variants/6/ (the non-waived direction).
// Usage: node scripts/v6-checks.mjs <baseUrl> [outDir=screenshots/phase5]
// - five-second test at 375×812: H1, a real "od … €" price, today's status, Rezervovať + Zavolať are on the
//   first screen and not covered by the sticky bar
// - axe-core (WCAG 2.0/2.1/2.2 A+AA + best practice) after a full scroll-through, normal and reduced motion
// - JS disabled: every CTA present, nothing left at opacity 0
// - CLS (layout-shift entries during load + scroll), console errors, horizontal overflow
// - screenshots: 0/25/50/75/100 % scroll, hover, keyboard focus, reduced motion, JS off
import { chromium } from 'playwright-core';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');
const [base = 'http://localhost:4322', out = 'screenshots/phase5'] = process.argv.slice(2);
const path = '/variants/6/';
mkdirSync(out, { recursive: true });
// SwiftShader only when asked (WEBGL=1): with the display asleep it can stall headless screenshots
const browser = await chromium.launch({ channel: 'chrome', args: process.env.WEBGL ? ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] : [] });
const issues = [];
const notes = [];
const wait = (p, ms) => p.waitForTimeout(ms);
const step = (msg) => console.error(`[${new Date().toISOString().slice(11, 19)}] ${msg}`);
const shot = (p, name, full = false) => p.screenshot({ path: `${out}/${name}.jpg`, type: 'jpeg', quality: 80, fullPage: full, timeout: 15000 })
  .catch((e) => issues.push(`screenshot ${name} failed: ${e.message.split('\n')[0]}`));

async function context(w, opts = {}) {
  const mobile = w < 768;
  return browser.newContext({
    viewport: { width: w, height: mobile ? 812 : 900 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1,
    locale: 'sk-SK', timezoneId: 'Europe/Bratislava', ...opts,
  });
}
async function open(ctx, tag, js = true) {
  const page = await ctx.newPage();
  page.setDefaultTimeout(20000);
  step(`open ${tag}`);
  page.on('pageerror', (e) => issues.push(`${tag}: pageerror ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') issues.push(`${tag}: console.error ${m.text()}`); });
  await page.addInitScript(() => {
    window.__cls = 0;
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch {}
  });
  await page.goto(base + path, { waitUntil: 'networkidle' });
  // (addStyleTag waits for a style onload that never fires with JS disabled)
  if (js) await page.addStyleTag({ content: 'astro-dev-toolbar{display:none!important}' });
  return page;
}
async function scrollThrough(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * 0.6) {
      window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 140));
    }
    window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 400));
  });
}
async function axe(page, tag) {
  step(`axe ${tag}`);
  await page.addScriptTag({ path: axePath });
  const res = await page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
    return r.violations.map((v) => `${v.impact} ${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  });
  notes.push(`axe ${tag}: ${res.length} violations`);
  res.forEach((r) => issues.push(`axe ${tag}: ${r}`));
}

for (const w of [375, 1440]) {
  const mobile = w < 768;
  // ---- normal pass ----
  let ctx = await context(w);
  let page = await open(ctx, `@${w}`);
  await wait(page, 1500);
  if (mobile) {
    // five-second test: first screen, no scroll
    const five = await page.evaluate(() => {
      const vh = window.innerHeight;
      const bar = document.querySelector('nav[aria-label="Rýchle akcie"]')?.getBoundingClientRect().top ?? vh;
      const visible = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= bar && r.width > 0 && getComputedStyle(el).opacity !== '0'; };
      const main = document.querySelector('main');
      const h1 = document.querySelector('h1');
      const od = [...main.querySelectorAll('dd, span, p')].find((e) => /^od\s?\d/.test(e.textContent.trim()) && /€/.test(e.textContent));
      const status = main.querySelector('[data-status] [data-status-text]');
      const links = [...main.querySelectorAll('a')];
      const rez = links.find((a) => a.textContent.trim().startsWith('Rezervovať'));
      const zav = links.find((a) => a.textContent.trim().startsWith('Zavolať'));
      return { h1: visible(h1), price: visible(od) ? od.textContent.trim() : false, status: visible(status) ? status.textContent.trim() : false, rezervovat: visible(rez), zavolat: visible(zav), barTop: Math.round(bar) };
    });
    notes.push(`five-second test @375: ${JSON.stringify(five)}`);
    for (const [k, v] of Object.entries(five)) if (v === false) issues.push(`five-second test: ${k} not on the first screen`);
    await shot(page, 'v6-375-five-second-test');
  }
  for (const f of [0, 0.25, 0.5, 0.75, 1]) {
    await page.evaluate((frac) => window.scrollTo(0, Math.round((document.documentElement.scrollHeight - window.innerHeight) * frac)), f);
    await wait(page, 900);
    await shot(page, `v6-${w}-scroll${String(Math.round(f * 100)).padStart(3, '0')}`);
  }
  await scrollThrough(page);
  const overflow = await page.evaluate((vw) => document.documentElement.scrollWidth - vw, w);
  if (overflow > 1) issues.push(`@${w}: horizontal overflow ${overflow}px`);
  const cls = await page.evaluate(() => window.__cls);
  notes.push(`CLS @${w} (load + full scroll): ${cls.toFixed(4)}`);
  if (cls > 0.1) issues.push(`@${w}: CLS ${cls.toFixed(3)}`);
  await axe(page, `@${w}`);

  // hover states (desktop) / focus states (both)
  if (!mobile) {
    const card = page.locator('.v6-zone').first();
    await card.scrollIntoViewIfNeeded(); await wait(page, 400);
    const b = await card.boundingBox();
    await page.mouse.move(b.x + 40, b.y + 40); await page.mouse.move(b.x + b.width * 0.4, b.y + b.height * 0.5, { steps: 8 });
    await wait(page, 700);
    await shot(page, `v6-${w}-hover-zone`);
    const cta = page.locator('main .v6-cta').first();
    await cta.scrollIntoViewIfNeeded(); await cta.hover(); await wait(page, 300);
    await shot(page, `v6-${w}-hover-cta`);
  }
  await page.evaluate(() => window.scrollTo(0, 0)); await wait(page, 300);
  step(`focus pass @${w}`);
  await page.evaluate(() => document.activeElement?.blur?.());
  for (let i = 0; i < (mobile ? 6 : 9); i++) await page.keyboard.press('Tab');
  await wait(page, 300);
  const focused = await page.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); return `${a.tagName} "${(a.textContent || '').trim().slice(0, 30)}" top=${Math.round(r.top)} bottom=${Math.round(r.bottom)}`; });
  notes.push(`focus after tabbing @${w}: ${focused}`);
  await shot(page, `v6-${w}-focus`);
  await ctx.close();

  // ---- reduced motion pass ----
  ctx = await context(w, { reducedMotion: 'reduce' });
  page = await open(ctx, `@${w} reduced`);
  await wait(page, 1200);
  await shot(page, `v6-${w}-reduced-top`);
  await page.evaluate(() => window.scrollTo(0, document.querySelector('#galeria')?.offsetTop ?? 0)); await wait(page, 700);
  await shot(page, `v6-${w}-reduced-gallery`);
  await scrollThrough(page);
  await axe(page, `@${w} reduced`);
  await ctx.close();

  // ---- JS off ----
  ctx = await context(w, { javaScriptEnabled: false });
  page = await open(ctx, `@${w} no-js`, false);
  const nojs = await page.evaluate(() => {
    const hidden = [...document.querySelectorAll('main *')].filter((e) => getComputedStyle(e).opacity === '0' && e.getBoundingClientRect().width > 0).map((e) => e.tagName + '.' + e.className).slice(0, 5);
    const ctas = ['Rezervovať', 'Zavolať', 'Navigovať'].map((t) => [...document.querySelectorAll('a')].some((a) => a.textContent.trim().startsWith(t) && a.getBoundingClientRect().width > 0));
    const lightboxLinks = document.querySelectorAll('a[data-lightbox]').length;
    return { hiddenAtOpacity0: hidden, ctas, lightboxLinks };
  });
  notes.push(`JS off @${w}: ${JSON.stringify(nojs)}`);
  if (nojs.hiddenAtOpacity0.length) issues.push(`JS off @${w}: elements at opacity 0: ${nojs.hiddenAtOpacity0.join(', ')}`);
  if (nojs.ctas.includes(false)) issues.push(`JS off @${w}: a CTA is missing`);
  await shot(page, `v6-${w}-nojs-top`);
  await ctx.close();
}
await browser.close();
console.log(notes.join('\n'));
console.log(issues.length ? `\nISSUES:\n${issues.join('\n')}` : '\nno issues');
