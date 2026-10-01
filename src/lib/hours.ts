import { dateShort, time, weekdayShort } from './format';

export type Audience = 'all' | 'divers';
type Row = { from: string; to: string; days?: string; open: string; close: string; audience: Audience; note?: string };
type Weekly = { label: string; weekdays: number[]; open: string; close: string; audience: Audience };
type Period = {
  id: string;
  title: string;
  subtitle?: string;
  rows?: Row[];
  range?: { from: string; to: string };
  weekly?: Weekly[];
  closed?: boolean;
  text?: string;
};
export type HoursData = { periods: Period[] };

export type DaySlot = { date: string; open: string; close: string; audience: Audience; note?: string };

const addDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
};
const dow = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

/** Opening slot for a given ISO date, or null when closed that day. */
export function slotFor(data: HoursData, iso: string): DaySlot | null {
  for (const p of data.periods) {
    if (p.closed) continue;
    for (const r of p.rows ?? []) {
      if (iso >= r.from && iso <= r.to) return { date: iso, open: r.open, close: r.close, audience: r.audience, note: r.note };
    }
    if (p.range && p.weekly && iso >= p.range.from && iso <= p.range.to) {
      const w = p.weekly.find((x) => x.weekdays.includes(dow(iso)));
      if (w) return { date: iso, open: w.open, close: w.close, audience: w.audience };
    }
  }
  return null;
}

export function seasonBounds(data: HoursData) {
  const dates: string[] = [];
  for (const p of data.periods) {
    if (p.closed) continue;
    for (const r of p.rows ?? []) dates.push(r.from, r.to);
    if (p.range) dates.push(p.range.from, p.range.to);
  }
  dates.sort();
  return { first: dates[0], last: dates[dates.length - 1] };
}

export function nextSlot(data: HoursData, fromIso: string): DaySlot | null {
  const { last } = seasonBounds(data);
  let d = fromIso;
  for (let i = 0; i < 400 && d <= last; i++, d = addDays(d, 1)) {
    const s = slotFor(data, d);
    if (s) return s;
  }
  return null;
}

/** Local date/time at the lake (Europe/Bratislava), independent of the visitor's time zone. */
export function nowAtLake(now = new Date()) {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Bratislava',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(now);
  const [date, hm] = parts.split(' ');
  return { date, hm };
}

export type Status = { state: 'open' | 'later' | 'closed'; text: string; detail: string };

const audienceText = (a: Audience) => (a === 'divers' ? ' (len pre potápačov)' : '');
const slotText = (s: DaySlot) => `${weekdayShort(s.date)} ${dateShort(s.date, false)}, ${time(s.open)} – ${time(s.close)}${audienceText(s.audience)}`;
const minus1h = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h - 1}:${String(m).padStart(2, '0')}`;
};

export function statusFor(data: HoursData, now = new Date()): Status {
  const { date, hm } = nowAtLake(now);
  const { first, last } = seasonBounds(data);
  const october = data.periods.find((p) => p.closed && p.range && date >= p.range.from && date <= p.range.to);

  if (october) {
    return { state: 'closed', text: 'Areál je zatvorený', detail: `Sezóna 2026 skončila. ${october.text?.replace(/^Zatvorené\.\s*/, '') ?? ''}`.trim() };
  }
  if (date > last) {
    return { state: 'closed', text: 'Mimo sezóny', detail: 'Otváracie hodiny na sezónu 2027 zatiaľ nie sú zverejnené.' };
  }
  if (date < first) {
    const n = nextSlot(data, first);
    return { state: 'closed', text: 'Sezóna ešte nezačala', detail: n ? `Prvý deň: ${slotText(n)}` : '' };
  }
  const today = slotFor(data, date);
  if (today) {
    if (hm < today.open) return { state: 'later', text: `Dnes otvorené ${time(today.open)} – ${time(today.close)}`, detail: `Posledný vstup ${minus1h(today.close)}${audienceText(today.audience)}` };
    if (hm < today.close) return { state: 'open', text: `Teraz otvorené do ${time(today.close)}`, detail: `Posledný vstup ${minus1h(today.close)}${audienceText(today.audience)}` };
  }
  const n = nextSlot(data, addDays(date, 1));
  if (!n) return { state: 'closed', text: today ? 'Dnes už zatvorené' : 'Dnes zatvorené', detail: 'Sezóna 2026 sa končí.' };
  return { state: 'closed', text: today ? 'Dnes už zatvorené' : 'Dnes zatvorené', detail: `Najbližšie: ${slotText(n)}` };
}
