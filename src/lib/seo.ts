/**
 * JSON-LD from real aquarea.sk data only (no aggregateRating, no invented fields).
 * The concept is noindex, but the structured data is ready for launch.
 */
import { site, hours, diving, zones } from './content';

const address = {
  '@type': 'PostalAddress',
  postalCode: site.address.postalCode,
  addressLocality: site.address.locality,
  addressCountry: 'SK',
};
const geo = { '@type': 'GeoCoordinates', latitude: site.address.lat, longitude: site.address.lng };

const main = hours.periods.find((p) => p.id === 'hlavna')!;
const dayMap: Record<number, string> = { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };
const openingHoursSpecification = main.weekly!.map((w) => ({
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: w.weekdays.map((d) => `https://schema.org/${dayMap[d]}`),
  opens: w.open,
  closes: w.close,
  validFrom: main.range!.from,
  validThrough: main.range!.to,
}));

export const ORG_ID = 'https://www.aquarea.sk/#areal';

export function orgJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['TouristAttraction', 'LocalBusiness'],
    '@id': ORG_ID,
    name: site.name,
    alternateName: site.fullName,
    description: site.intro,
    url: 'https://www.aquarea.sk/',
    telephone: site.contacts.info.phone,
    email: site.contacts.info.email,
    address,
    geo,
    openingHoursSpecification,
    sameAs: site.social.map((s) => s.href),
    containsPlace: [
      { '@type': 'Beach', name: zones.beach.name },
      { '@type': 'Campground', name: 'Kemping v Prémium zóne' },
      { '@type': 'SportsActivityLocation', name: diving.longName },
    ],
  };
}

export function placeJsonLd(type: string | string[], name: string, description: string, extra: Record<string, unknown> = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    description,
    address,
    geo,
    containedInPlace: { '@id': ORG_ID, name: site.name },
    ...extra,
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}
