// Splits the 338×127 logo into three assets (boxes measured from the alpha channel, see DECISIONS.md 2026-10-31):
//   logo-wordmark.png  AQUArea Čierna Voda + the "Areál športu a relaxu" bar   (the only part that stays "the logo" next to the name)
//   logo-diver.png     the AQUArea Dive Center badge                         (right side of the header)
//   logo-services.png  the six service tiles in one strip, upscaled 3× (Lanczos) so it stays smooth when shown ~40 px tall in the hero photo
// Usage: node scripts/split-logo.mjs
import sharp from 'sharp';
const src = 'source-images/brand/logo-new2.png';
const out = 'src/assets/brand';
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
// diver rows: alpha > 40 inside x 207..337
let y0 = info.height, y1 = 0;
for (let y = 0; y < info.height; y++) for (let x = 207; x <= 337; x++) if (data[(y * info.width + x) * 4 + 3] > 40) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
const box = (left, top, right, bottom) => ({ left, top, width: right - left + 1, height: bottom - top + 1 });
await sharp(src).extract(box(12, 4, 183, 91)).toFile(`${out}/logo-wordmark.png`);
await sharp(src).extract(box(207, y0, 337, y1)).toFile(`${out}/logo-diver.png`);
const strip = box(12, 94, 183, 119);
await sharp(src).extract(strip).resize({ width: strip.width * 3, kernel: 'lanczos3' }).sharpen({ sigma: 0.6 }).toFile(`${out}/logo-services.png`);
console.log('diver rows', y0, y1);
