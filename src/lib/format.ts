const eur = new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
const eurShort = new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 });

/** 9 → "9,00 €" (price tables) */
export const price = (n: number) => eur.format(n).replace(/ /g, ' ');
/** 9 → "9 €", 7.5 → "7,5 €" (teasers, big numerals) */
export const priceShort = (n: number) => eurShort.format(n).replace(/ /g, ' ');

export type PriceRow = {
  label: string;
  detail?: string;
  amount?: number;
  pair?: [number, number];
  range?: [number, number];
  free?: boolean;
};

export function rowPrice(row: PriceRow, pairLabels: [string, string] = ['Dospelý', 'Dieťa']): string {
  if (row.free) return 'zdarma';
  if (row.amount !== undefined) return price(row.amount);
  if (row.range) return `${price(row.range[0])} – ${price(row.range[1])}`;
  if (row.pair) return `${pairLabels[0]} ${price(row.pair[0])} / ${pairLabels[1].toLowerCase()} ${price(row.pair[1])}`;
  return '';
}

const MONTHS = ['januára', 'februára', 'marca', 'apríla', 'mája', 'júna', 'júla', 'augusta', 'septembra', 'októbra', 'novembra', 'decembra'];
const WEEKDAYS = ['nedeľa', 'pondelok', 'utorok', 'streda', 'štvrtok', 'piatok', 'sobota'];
const WEEKDAYS_SHORT = ['ne', 'po', 'ut', 'st', 'št', 'pi', 'so'];

const parse = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

/** "2026-09-04" → "4. 9. 2026" */
export const dateShort = (iso: string, withYear = true) => {
  const d = parse(iso);
  return `${d.getUTCDate()}. ${d.getUTCMonth() + 1}.${withYear ? ` ${d.getUTCFullYear()}` : ''}`;
};
/** "2027-05-15" → "15. mája 2027" */
export const dateLong = (iso: string) => {
  const d = parse(iso);
  return `${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
export const weekday = (iso: string) => WEEKDAYS[parse(iso).getUTCDay()];
export const weekdayShort = (iso: string) => WEEKDAYS_SHORT[parse(iso).getUTCDay()];

/** "4. 9." or "5. – 6. 9." for a from/to pair */
export const dateRange = (from: string, to: string) => {
  if (from === to) return dateShort(from, false);
  const a = parse(from), b = parse(to);
  if (a.getUTCMonth() === b.getUTCMonth()) return `${a.getUTCDate()}. – ${b.getUTCDate()}. ${b.getUTCMonth() + 1}.`;
  return `${dateShort(from, false)} – ${dateShort(to, false)}`;
};

/** "09:00" → "9:00" */
export const time = (hhmm: string) => hhmm.replace(/^0(\d)/, '$1');
