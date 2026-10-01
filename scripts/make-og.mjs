// Builds public/og.jpg (1200×630) from the real hero drone photo + logo, and the favicon.
// Run: node scripts/make-og.mjs
import sharp from 'sharp';

const W = 1200, H = 630;
const hero = await sharp('src/assets/photos/dron-areal.jpg').resize(W, H, { fit: 'cover', position: 'centre' }).toBuffer();
const logo = await sharp('src/assets/brand/logo.png').resize({ width: 300 }).toBuffer();
const logoMeta = await sharp(logo).metadata();
const plateW = logoMeta.width + 48, plateH = logoMeta.height + 36;
const shade = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0.45" stop-color="#06232e" stop-opacity="0"/>
    <stop offset="1" stop-color="#06232e" stop-opacity="0.78"/>
  </linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="48" y="${H - plateH - 48}" width="${plateW}" height="${plateH}" rx="18" fill="#ffffff"/>
  <text x="${48 + plateW + 32}" y="${H - 48 - plateH / 2 + 10}" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="700" fill="#ffffff">Areál športu a relaxu pri jazere</text>
</svg>`);
await sharp(hero)
  .composite([{ input: shade }, { input: logo, left: 48 + 24, top: H - plateH - 48 + 18 }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile('public/og.jpg');
await sharp('public/apple-touch-icon.png').resize(32, 32).png().toFile('public/favicon-32.png');
console.log('public/og.jpg, public/favicon-32.png written');
