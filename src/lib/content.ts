/**
 * Single entry point for all real content (src/content/*.json).
 * Every block carries a `source` URL on aquarea.sk; the schemas below fail the
 * build if a source goes missing, so "facts only" stays checkable.
 */
import { z } from 'astro/zod';
import siteJson from '../content/site.json';
import hoursJson from '../content/hours.json';
import pricesJson from '../content/prices.json';
import zonesJson from '../content/zones.json';
import divingJson from '../content/diving.json';
import eventsJson from '../content/events.json';
import newsJson from '../content/news.json';
import photosJson from '../content/photos.json';

const source = z.string().url().refine((u) => u.startsWith('https://www.aquarea.sk/'), 'source must be an aquarea.sk URL');

const priceRow = z.object({
  label: z.string(),
  detail: z.string().optional(),
  amount: z.number().optional(),
  pair: z.tuple([z.number(), z.number()]).optional(),
  range: z.tuple([z.number(), z.number()]).optional(),
  free: z.boolean().optional(),
});

const schemas = {
  site: z.object({ name: z.string(), address: z.object({ source }).passthrough(), contacts: z.record(z.string(), z.object({ source }).passthrough()) }).passthrough(),
  hours: z.object({ source, periods: z.array(z.object({ id: z.string() }).passthrough()) }).passthrough(),
  prices: z.object({
    source,
    validFrom: z.string(),
    sections: z.array(z.object({ id: z.string(), title: z.string(), source, groups: z.array(z.object({ title: z.string(), rows: z.array(priceRow) }).passthrough()) }).passthrough()),
  }).passthrough(),
  zones: z.object({ beach: z.object({ source }).passthrough(), premium: z.object({ source }).passthrough() }),
  diving: z.object({ source, attractionsSource: source }).passthrough(),
  events: z.object({ fotofilmfest: z.object({ source }).passthrough() }),
  news: z.object({ source, items: z.array(z.object({ date: z.string(), title: z.string(), source }).passthrough()) }).passthrough(),
  photos: z.object({ photos: z.array(z.object({ id: z.string(), album: z.string(), alt: z.string().min(5), source })) }).passthrough(),
};

for (const [name, data] of Object.entries({ site: siteJson, hours: hoursJson, prices: pricesJson, zones: zonesJson, diving: divingJson, events: eventsJson, news: newsJson, photos: photosJson })) {
  const result = schemas[name as keyof typeof schemas].safeParse(data);
  if (!result.success) throw new Error(`src/content/${name}.json is invalid: ${result.error.message}`);
}

export const site = siteJson;
export const hours = hoursJson as typeof hoursJson & import('./hours').HoursData;
export const prices = pricesJson;
export const zones = zonesJson;
export const diving = divingJson;
export const fff = eventsJson.fotofilmfest;
export const news = newsJson;
export const photos = photosJson;

export type PriceSection = (typeof pricesJson.sections)[number];
export const priceSection = (id: string) => pricesJson.sections.find((s) => s.id === id)!;
export const highlight = (id: string) => pricesJson.highlights.find((h) => h.id === id)!;
