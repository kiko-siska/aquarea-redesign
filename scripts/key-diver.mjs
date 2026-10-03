// Keys the green-screen Gemini diver (images/generated/v7-diver-photo-1.jpg) into a transparent, mirrored cut-out
// (src/assets/generated/v7-diver.webp) and prints the leg-split polygon as fractions of the cut-out.
// Usage: node scripts/key-diver.mjs
import sharp from 'sharp';
const SRC = 'images/generated/v7-diver-photo-1.jpg';
const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
let minX = W, minY = H, maxX = 0, maxY = 0;
for (let i = 0; i < W * H; i++) {
  const o = i * 4, r = data[o], g = data[o + 1], b = data[o + 2];
  const gd = g - Math.max(r, b);                    // how green the pixel is
  const a = Math.max(0, Math.min(1, 1 - (gd - 28) / 70));
  if (gd > 28) data[o + 1] = Math.min(g, Math.max(r, b) + 8); // despill the green fringe
  data[o + 3] = Math.round(a * 255);
  if (a > 0.5) { const x = i % W, y = (i / W) | 0; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
}
const pad = 6;
minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad); maxX = Math.min(W - 1, maxX + pad); maxY = Math.min(H - 1, maxY + pad);
const cw = maxX - minX + 1, ch = maxY - minY + 1;
const out = sharp(data, { raw: { width: W, height: H, channels: 4 } }).extract({ left: minX, top: minY, width: cw, height: ch }).flop().resize({ width: 1500 }).webp({ quality: 88, alphaQuality: 90, effort: 6 });
await out.toFile('src/assets/generated/v7-diver.webp');
const m = await sharp('src/assets/generated/v7-diver.webp').metadata();
// leg-split polygon in the 2000-px preview coordinates of the original (scale 1.376), → cut-out fractions after the flip
const S = W / 2000;
const poly = [[945, 500], [1076, 500], [1076, 300], [2000, 300], [2000, 800], [1040, 800], [1040, 640], [945, 640]];
const frac = poly.map(([x, y]) => [+(1 - (x * S - minX) / cw).toFixed(4), +((y * S - minY) / ch).toFixed(4)]);
console.log(JSON.stringify({ cutout: [m.width, m.height], bboxOriginal: [minX, minY, cw, ch], hipPivot: [+(1 - (1005 * S - minX) / cw).toFixed(4), +((575 * S - minY) / ch).toFixed(4)], poly: frac }));
