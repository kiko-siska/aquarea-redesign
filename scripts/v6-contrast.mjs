// WCAG contrast of every V6 colour pair that carries text or a UI boundary (src/styles/v6.css tokens).
// Usage: node scripts/v6-contrast.mjs   (exits 1 if a required pair fails)
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const L = (h) => { const n = parseInt(h.slice(1), 16); return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
const cr = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const t = { svetlo: '#f5fafa', plytcina: '#e3f1f0', biela: '#ffffff', hlbka: '#0d2830', tlmena: '#43606a', tyrkys: '#159c97', tyrkysTmava: '#09706b', stolicka: '#c8352a', deepText: '#e7f1f1', deepMuted: '#b9cfd2', todoText: '#4a3200', todoBg: '#fff1c2' };
const pairs = [
  ['body text on page', t.hlbka, t.svetlo, 4.5], ['body text on shallows', t.hlbka, t.plytcina, 4.5], ['body text on card', t.hlbka, t.biela, 4.5],
  ['secondary text on page', t.tlmena, t.svetlo, 4.5], ['secondary text on shallows', t.tlmena, t.plytcina, 4.5], ['secondary text on card', t.tlmena, t.biela, 4.5],
  ['accent text on page', t.tyrkysTmava, t.svetlo, 4.5], ['accent text on shallows', t.tyrkysTmava, t.plytcina, 4.5],
  ['CTA label (white) on CTA', '#ffffff', t.stolicka, 4.5], ['CTA fill vs page (boundary)', t.stolicka, t.svetlo, 3],
  ['pressed chip label', t.svetlo, t.hlbka, 4.5], ['focus ring (ink) vs page', t.hlbka, t.svetlo, 3], ['focus ring (white) vs deep band', '#ffffff', t.hlbka, 3],
  ['text on deep band / footer', t.deepText, t.hlbka, 4.5], ['muted text on deep band / footer', t.deepMuted, t.hlbka, 4.5],
  ['CTA ring (white) vs deep band', '#ffffff', t.hlbka, 3],
  ['status dot (closed) vs card', t.tlmena, t.biela, 3], ['status dot (open) vs card', t.tyrkys, t.biela, 3],
  ['TODO note', t.todoText, t.todoBg, 4.5],
];
let fail = 0;
for (const [name, fg, bg, need] of pairs) {
  const r = cr(fg, bg);
  const ok = r >= need;
  if (!ok) fail++;
  console.log(`${ok ? 'pass' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (needs ${need}:1)  ${name}  ${fg} on ${bg}`);
}
console.log(fail ? `\n${fail} failing pair(s)` : '\nall pairs pass');
process.exitCode = fail ? 1 : 0;
