import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { photos } from './content';

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/photos/*.{jpg,png}', { eager: true });

export function getPhoto(id: string) {
  const entry = photos.photos.find((p) => p.id === id);
  const file = files[`/src/assets/photos/${id}.jpg`] ?? files[`/src/assets/photos/${id}.png`];
  if (!entry || !file) throw new Error(`Photo "${id}" is missing from photos.json or src/assets/photos/`);
  return { ...entry, img: file.default };
}

/** Pre-built responsive sources for React islands (they can't use <Picture>). */
export async function islandPhoto(id: string, caption?: string, widths = [480, 720, 960]) {
  const p = getPhoto(id);
  const w = widths.filter((x) => x <= p.img.width);
  const small = await getImage({ src: p.img, widths: w.length ? w : [p.img.width], format: 'webp' });
  const large = await getImage({ src: p.img, width: Math.min(1600, p.img.width), format: 'webp' });
  return {
    src: small.src,
    srcSet: small.srcSet.attribute,
    large: large.src,
    width: p.img.width,
    height: p.img.height,
    alt: p.alt,
    caption: caption ?? p.alt,
  };
}
export type IslandPhoto = Awaited<ReturnType<typeof islandPhoto>>;
