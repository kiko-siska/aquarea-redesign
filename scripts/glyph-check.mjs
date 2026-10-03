// Checks that a built page's fonts contain the Slovak glyphs (plus € and –) by measuring each glyph
// with two different fallbacks: if the width differs, the browser fell back, so the glyph is missing.
// Usage: node scripts/glyph-check.mjs <url> "<css font shorthand>" ["<css font shorthand>" ...]
//   e.g. node scripts/glyph-check.mjs http://localhost:4322/variants/6/ '800 64px "Bricolage Grotesque Variable"' '400 64px "Atkinson Hyperlegible Next Variable"'
import { chromium } from 'playwright-core';
const [url, ...faces] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
const res = await page.evaluate(async (faces) => {
  const chars = [...'ľĺŕôäďťňČŠŽĽĹŔÔÄĎŤŇáéíóúýžščť€–'];
  const out = {};
  for (const f of faces) {
    await document.fonts.load(f, chars.join(''));
    const c = document.createElement('canvas').getContext('2d');
    const missing = chars.filter((ch) => { c.font = `${f}, monospace`; const a = c.measureText(ch).width; c.font = `${f}, serif`; return Math.abs(a - c.measureText(ch).width) > 0.01; });
    out[f] = missing.length ? `MISSING ${missing.join('')}` : `all ${chars.length} glyphs present`;
  }
  return out;
}, faces);
for (const [f, r] of Object.entries(res)) console.log(`${f}: ${r}`);
await browser.close();
process.exitCode = Object.values(res).some((r) => r.startsWith('MISSING')) ? 1 : 0;
