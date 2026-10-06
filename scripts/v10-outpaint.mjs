/**
 * V10 (AGENTS.md rule 5, fifth exception): AI-extended PLACEHOLDERS of the real hero aerial.
 * Deterministic steps only around one Gemini image edit per frame:
 *   1. `canvas <portrait|wide>`: put the real 2000×1333 photo into a larger frame (4:5 or 21:9), empty areas grey.
 *      → images/generated/v10-canvas-<kind>.png (this is the Gemini input; the model only fills the grey).
 *   2. Gemini image edit (MCP, logged in PROGRESS.md) → images/generated/v10-aerial-<kind>-ai.*
 *   3. `composite <kind> <ai-file>`: find the real scene inside the AI output (scale + offset search on
 *      downscaled greyscale), scale the AI image to the real photo's native resolution, colour-match the margins
 *      to the real photo at the seam, then paste the REAL pixels back over the middle with a feathered edge.
 *      So every building, roof, road and shoreline is the real photo; only the margins are AI.
 *      → src/assets/generated/v10-aerial-<kind>.jpg + prints the placement of the real photo inside it
 *        (used to map pin coordinates from the real photo).
 */
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const REAL = 'source-images/hero/hero-dji044748495051.jpg';
const RW = 2000, RH = 1333;
const KINDS = {
  portrait: { w: 2000, h: 2500, x: 0, y: 584 },          // 4:5, the real photo full width, centred
  wide: { w: 3110, h: 1333, x: 555, y: 0 },              // 21:9, the real photo centred
};
const [cmd, kind, aiFile] = process.argv.slice(2);
const k = KINDS[kind];
if (!k) { console.error('usage: canvas|composite portrait|wide [ai-file]'); process.exit(1); }

if (cmd === 'canvas') {
  await sharp({ create: { width: k.w, height: k.h, channels: 3, background: '#808080' } })
    .composite([{ input: REAL, left: k.x, top: k.y }])
    .resize(kind === "portrait" ? 1600 : 2400).jpeg({ quality: 88 }).toFile(`images/generated/v10-canvas-${kind}.jpg`);
  console.log(`images/generated/v10-canvas-${kind}.jpg (downscaled) ${k.w}×${k.h}, real at ${k.x},${k.y}`);
}

if (cmd === 'composite') {
  // 1. where is the real scene inside the AI output? (the model may shift or rescale slightly)
  const ai = sharp(aiFile);
  const { width: aw, height: ah } = await ai.metadata();
  const S = 0.12; // search on a small greyscale copy
  const small = async (input, w, h) => (await sharp(input).resize(w, h, { fit: 'fill' }).greyscale().raw().toBuffer());
  const sw = Math.round(aw * S), sh = Math.round(ah * S);
  const aiSmall = await small(aiFile, sw, sh);
  // nominal scale: canvas → AI output
  const nom = aw / k.w;
  let best = { d: Infinity };
  for (let sc = nom * 0.96; sc <= nom * 1.04; sc += nom * 0.005) {
    const tw = Math.round(RW * sc * S), th = Math.round(RH * sc * S);
    const tpl = await small(REAL, tw, th);
    const cx = k.x * sc * S, cy = k.y * sc * S;
    for (let oy = Math.round(cy - 10); oy <= Math.round(cy + 10); oy++) {
      for (let ox = Math.round(cx - 10); ox <= Math.round(cx + 10); ox++) {
        if (ox < 0 || oy < 0 || ox + tw > sw || oy + th > sh) continue;
        let d = 0;
        for (let y = 0; y < th; y += 2) for (let x = 0; x < tw; x += 2) d += Math.abs(tpl[y * tw + x] - aiSmall[(oy + y) * sw + ox + x]);
        d /= (tw * th) / 4;
        if (d < best.d) best = { d, sc, ox: ox / S, oy: oy / S };
      }
    }
  }
  console.log('match', best);
  // 2. scale the AI frame so the real photo sits at native resolution
  const f = 1 / best.sc;
  const W = Math.round(aw * f), H = Math.round(ah * f);
  const X = Math.round(best.ox * f), Y = Math.round(best.oy * f);
  const big = await sharp(aiFile).resize(W, H, { kernel: 'lanczos3' }).removeAlpha().raw().toBuffer();
  const real = await sharp(REAL).removeAlpha().raw().toBuffer();
  // 3. colour-match: mean per-channel difference (real − AI) inside the photo area, applied to the margins
  const diff = [0, 0, 0]; let n = 0;
  for (let y = 0; y < RH; y += 3) for (let x = 0; x < RW; x += 3) {
    const gx = X + x, gy = Y + y; if (gx < 0 || gy < 0 || gx >= W || gy >= H) continue;
    for (let c = 0; c < 3; c++) diff[c] += real[(y * RW + x) * 3 + c] - big[(gy * W + gx) * 3 + c];
    n++;
  }
  diff.forEach((v, c) => (diff[c] = v / n));
  console.log('colour shift (real − AI)', diff.map((v) => v.toFixed(1)));
  // 4. paste the real pixels back with a feathered edge (60 px inside the photo's border)
  const FEATHER = 60;
  const out = Buffer.alloc(W * H * 3);
  for (let gy = 0; gy < H; gy++) for (let gx = 0; gx < W; gx++) {
    const i = (gy * W + gx) * 3;
    const x = gx - X, y = gy - Y;
    let a = 0;
    if (x >= 0 && y >= 0 && x < RW && y < RH) {
      // only feather the edges that border AI margins
      const dl = k.x > 0 ? x : Infinity, dr = k.x > 0 ? RW - 1 - x : Infinity;
      const dt = k.y > 0 ? y : Infinity, db = k.y > 0 ? RH - 1 - y : Infinity;
      a = Math.min(1, Math.min(dl, dr, dt, db) / FEATHER);
    }
    for (let c = 0; c < 3; c++) {
      const aiv = Math.max(0, Math.min(255, big[i + c] + diff[c]));
      const rv = a > 0 ? real[(y * RW + x) * 3 + c] : 0;
      out[i + c] = Math.round(aiv * (1 - a) + rv * a);
    }
  }
  const file = `src/assets/generated/v10-aerial-${kind}.jpg`;
  await sharp(out, { raw: { width: W, height: H, channels: 3 } }).jpeg({ quality: 88, mozjpeg: true }).toFile(file);
  const meta = { file, width: W, height: H, real: { x: X, y: Y, w: RW, h: RH }, matchScore: +best.d.toFixed(2) };
  writeFileSync(`images/generated/v10-aerial-${kind}.json`, JSON.stringify(meta, null, 2));
  console.log(meta);
}

/**
 * `patch <kind> x y w h dx dy`: deterministic clone patch INSIDE THE AI MARGIN ONLY (never on the real photo):
 * copies the area shifted by (dx, dy) over (x, y, w, h) with a feathered elliptical mask. Used to remove an
 * object the model invented (logged in PROGRESS.md / DECISIONS.md).
 */
if (cmd === 'patch') {
  const [x, y, w, h, dx, dy] = process.argv.slice(4).map(Number);
  const file = `src/assets/generated/v10-aerial-${kind}.jpg`;
  const meta = JSON.parse((await import('node:fs')).readFileSync(`images/generated/v10-aerial-${kind}.json`, 'utf8'));
  const r = meta.real;
  const overlaps = !(x + w <= r.x || x >= r.x + r.w || y + h <= r.y || y >= r.y + r.h);
  if (overlaps) { console.error('refusing: the patch would touch the real photo'); process.exit(1); }
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const out = Buffer.from(data);
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
    const nx = (xx - w / 2) / (w / 2), ny = (yy - h / 2) / (h / 2);
    const a = Math.max(0, Math.min(1, (1 - Math.hypot(nx, ny)) / 0.35));
    const ti = ((y + yy) * W + x + xx) * 3, si = ((y + yy + dy) * W + x + xx + dx) * 3;
    for (let c = 0; c < 3; c++) out[ti + c] = Math.round(data[ti + c] * (1 - a) + data[si + c] * a);
  }
  await sharp(out, { raw: { width: W, height: info.height, channels: 3 } }).jpeg({ quality: 88, mozjpeg: true }).toFile(file + '.tmp.jpg');
  (await import('node:fs')).renameSync(file + '.tmp.jpg', file);
  meta.patches = [...(meta.patches ?? []), { x, y, w, h, dx, dy, why: 'invented object removed' }];
  (await import('node:fs')).writeFileSync(`images/generated/v10-aerial-${kind}.json`, JSON.stringify(meta, null, 2));
  console.log('patched', { x, y, w, h, dx, dy });
}
