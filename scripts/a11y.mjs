// Runs axe-core (WCAG 2.x A/AA) against pages with the installed Chrome.
// Usage: node scripts/a11y.mjs http://localhost:4321 /variants/1/ /variants/2/
import { chromium } from 'playwright-core';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');
const [base, ...paths] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });
let total = 0;
for (const w of [375, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  for (const p of paths) {
    const page = await ctx.newPage();
    await page.goto(base + p, { waitUntil: 'networkidle' });
    await page.addScriptTag({ path: axePath });
    const res = await page.evaluate(async () => {
      // @ts-ignore
      const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } });
      return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, n: v.nodes.length, nodes: v.nodes.slice(0, 4).map((x) => x.target.join(' ') + (x.failureSummary ? ' :: ' + x.failureSummary.split('\n').slice(1, 2).join('') : '')) }));
    });
    total += res.length;
    console.log(`\n${p} @${w}: ${res.length} violation types`);
    for (const v of res) console.log(` - [${v.impact}] ${v.id} (${v.n}): ${v.help}\n     ${v.nodes.join('\n     ')}`);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
process.exitCode = total ? 1 : 0;
