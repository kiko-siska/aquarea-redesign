// Checks that header tabs, mobile-menu links and footer links on every variant stay on the same page and scroll to a real section.
// Usage: node scripts/nav-check.mjs <baseUrl> [variants...]
import { chromium } from 'playwright-core';
const [base = 'http://localhost:4322', ...vs] = process.argv.slice(2);
const variants = vs.length ? vs.map(Number) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const browser = await chromium.launch({ channel: 'chrome' });
const problems = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const v of variants) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${base}/variants/${v}/${v === 5 ? '?leader=0' : ''}`, { waitUntil: 'load' }); await sleep(2500);
  const links = await p.evaluate(() => [...document.querySelectorAll('header a[href], #v4-menu a[href], #v5-menu a[href], #v6-menu a[href], #v7-menu a[href], #v10-menu a[href], footer a[href]')]
    .map((a) => ({ text: a.textContent.trim().replace(/\s+/g, ' ').slice(0, 26), href: a.getAttribute('href'), inFooter: !!a.closest('footer') }))
    .filter((l) => !/^(tel:|mailto:|https?:)/.test(l.href)));
  const bad = [];
  for (const l of links) {
    if (l.href.startsWith('#')) {
      const ok = await p.evaluate((h) => h.length > 1 && !!document.getElementById(h.slice(1)), l.href);
      if (!ok) bad.push(`${l.text} → ${l.href} (no such id)`);
    } else if (!(l.href.endsWith(`/variants/${v}/`) || l.href === './') && !l.href.endsWith('/o-nas/')) {
      bad.push(`${l.text} → ${l.href} (leaves the variant)`);
    }
  }
  // click the desktop "Pláž" and "Cenník" tabs: URL must stay on the variant and the page must scroll
  const nav = p.locator('header nav[aria-label="Hlavná navigácia"] a');
  const names = await nav.allTextContents();
  const res = [];
  for (const label of ['Pláž', 'Potápanie', 'Cenník', 'Kontakt']) {
    const i = names.findIndex((t) => t.trim() === label);
    if (i < 0) { bad.push(`no "${label}" tab`); continue; }
    await p.evaluate(() => (window.lenis ? window.lenis.scrollTo(0, { immediate: true, force: true }) : window.scrollTo(0, 0))); await sleep(300);
    await nav.nth(i).click(); await sleep(1800);
    const st = await p.evaluate(() => ({ y: Math.round(window.scrollY), path: location.pathname }));
    res.push(`${label}→${st.y}`);
    if (!st.path.includes(`/variants/${v}/`)) bad.push(`"${label}" tab left the page (${st.path})`);
    if (st.y < 300) bad.push(`"${label}" tab did not scroll (${st.y})`);
  }
  console.log(`V${v}: ${links.length} internal links; tabs: ${res.join('  ')}${bad.length ? '\n   PROBLEMS: ' + bad.join('; ') : ''}`);
  if (bad.length) problems.push(...bad.map((b) => `V${v}: ${b}`));
  await ctx.close();
}
await browser.close();
console.log(problems.length ? `\n${problems.length} problem(s)` : '\nall tabs and links stay on the page');
process.exitCode = problems.length ? 1 : 0;
