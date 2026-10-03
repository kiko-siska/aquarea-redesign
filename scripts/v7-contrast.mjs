// WCAG contrast of every V7 colour pair that carries text or a UI boundary (src/styles/v7.css tokens).
// Logo colours are sampled from source-images/brand/logo-new2.png; the deep blue and the pale tint are
// derived from the logo blue at the same hue (198°): #006B99 = lightness 30 %, #F0FAFF = lightness 97 %.
// Usage: node scripts/v7-contrast.mjs   (exits 1 if a required pair fails)
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const L = (h) => { const n = parseInt(h.slice(1), 16); return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
const cr = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const t = { modra: '#00a8f0', hlbka: '#006b99', hladina: '#f0faff', cervena: '#d80018', cervenaTm: '#b30014', cierna: '#181818', biela: '#ffffff', seda: '#454545', svetla: '#d6dde0', todoText: '#4a3200', todoBg: '#fff1c2' };
const pairs = [
  ['ink text on white', t.cierna, t.biela, 4.5], ['ink text on pale tint', t.cierna, t.hladina, 4.5],
  ['ink #181818 text on logo blue (bands, stickers; pure #000 would be 8.0)', t.cierna, t.modra, 4.5], ['WHITE text on logo blue (must NOT be used)', t.biela, t.modra, 4.5, 'expect-fail'],
  ['secondary text on white', t.seda, t.biela, 4.5], ['secondary text on pale tint', t.seda, t.hladina, 4.5],
  ['white text on ink', t.biela, t.cierna, 4.5], ['light-grey text on ink', t.svetla, t.cierna, 4.5],
  ['white text on deep blue', t.biela, t.hlbka, 4.5], ['light-grey text on deep blue (NOT used there; white instead)', t.svetla, t.hlbka, 4.5, 'expect-fail'], ['deep blue text on white', t.hlbka, t.biela, 4.5],
  ['white label on logo red (CTA)', t.biela, t.cervena, 4.5], ['white label on dark red (CTA hover)', t.biela, t.cervenaTm, 4.5], ['red text on white', t.cervena, t.biela, 4.5],
  ['logo blue text on ink (date, dot)', t.modra, t.cierna, 4.5],
  ['focus ring ink on white', t.cierna, t.biela, 3], ['focus ring ink on logo blue', t.cierna, t.modra, 3], ['focus ring white on ink', t.biela, t.cierna, 3], ['focus ring white on deep blue', t.biela, t.hlbka, 3],
  ['CTA shadow/outline ink vs white page', t.cierna, t.biela, 3], ['CTA white shadow vs ink', t.biela, t.cierna, 3],
  ['pause button (white icon on ink)', t.biela, t.cierna, 3], ['status dot (open, logo blue) on ink', t.modra, t.cierna, 3],
  ['TODO note', t.todoText, t.todoBg, 4.5],
];
let fail = 0;
for (const [name, fg, bg, need, mode] of pairs) {
  const r = cr(fg, bg);
  const ok = r >= need;
  const bad = mode === 'expect-fail' ? ok : !ok;
  if (bad) fail++;
  console.log(`${bad ? 'FAIL' : mode === 'expect-fail' ? 'ok  ' : 'pass'}  ${r.toFixed(2).padStart(5)}:1  (needs ${need}:1)  ${name}${mode === 'expect-fail' ? '  [documented failure, never used]' : ''}`);
}
console.log(fail ? `\n${fail} unexpected result(s)` : '\nall pairs behave as documented');
process.exitCode = fail ? 1 : 0;
