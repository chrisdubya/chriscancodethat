// Builds schema.org JSON-LD for the home page from the résumé single source of
// truth (`src/data/resume.ts`). Keeping the generation here means the structured
// data stays in sync with the visible/crawlable content automatically.

import { cities, skills, awards, contact, type City, type Company } from '../data/resume';

/** City id → human-readable address parts for `worksFor`/`alumniOf` location. */
const CITY_ADDRESS: Record<string, { locality: string; region?: string; country: string }> = {
  mia: { locality: 'Miami', region: 'FL', country: 'US' },
  lon: { locality: 'London', country: 'GB' },
  nyc: { locality: 'New York', region: 'NY', country: 'US' },
  dc: { locality: 'Washington', region: 'DC', country: 'US' },
};

/** Heuristic: is this résumé entry an education record (→ alumniOf) vs. a job? */
function isEducation(company: Company): boolean {
  return (
    company.dates.toLowerCase() === 'education' ||
    /\buniversity\b|\bcollege\b|general assembly/i.test(company.name)
  );
}

/** Parse a "2023–Present" / "2021–2023" range into ISO-ish start/end years. */
function parseDates(dates: string): { start?: string; end?: string } {
  const match = dates.match(/(\d{4})\s*[–-]\s*(present|\d{4})/i);
  if (!match) return {};
  const [, start, rawEnd] = match;
  const end = /present/i.test(rawEnd) ? undefined : rawEnd;
  return { start, end };
}

function postalAddress(cityId: string) {
  const addr = CITY_ADDRESS[cityId];
  if (!addr) return undefined;
  return {
    '@type': 'PostalAddress',
    addressLocality: addr.locality,
    ...(addr.region ? { addressRegion: addr.region } : {}),
    addressCountry: addr.country,
  };
}

/** An Organization node for a job, with optional location + homepage. */
function organization(company: Company, city: City) {
  const address = postalAddress(city.id);
  return {
    '@type': 'Organization',
    name: company.name,
    ...(company.url ? { url: company.url } : {}),
    ...(address ? { address } : {}),
  };
}

/** EducationalOrganization node for alumniOf entries. */
function educationalOrganization(company: Company, city: City) {
  const address = postalAddress(city.id);
  return {
    '@type': 'EducationalOrganization',
    name: company.name,
    ...(address ? { address } : {}),
  };
}

interface FlatRole {
  company: Company;
  city: City;
  start?: string;
  end?: string;
  isCurrent: boolean;
}

function buildPerson() {
  const jobs: FlatRole[] = [];
  const education: { company: Company; city: City }[] = [];

  for (const city of cities) {
    for (const company of city.companies) {
      if (company.placeholder) continue;
      if (isEducation(company)) {
        education.push({ company, city });
        continue;
      }
      const { start, end } = parseDates(company.dates);
      jobs.push({
        company,
        city,
        start,
        end,
        isCurrent: /present/i.test(company.dates),
      });
    }
  }

  // Current role drives `worksFor`; everything else (incl. past) becomes a
  // `hasOccupation` entry so the full work history is machine-readable.
  const current = jobs.find((j) => j.isCurrent);

  const hasOccupation = jobs.map((j) => ({
    '@type': 'Occupation' as const,
    name: j.company.title,
    ...(j.company.summary ? { description: j.company.summary } : {}),
    occupationLocation: postalAddress(j.city.id) ?? undefined,
    estimatedSalary: undefined, // omitted; schema allows optional
    skills: j.company.tech.length ? j.company.tech.join(', ') : undefined,
  }));

  const knowsAbout = Array.from(
    new Set(skills.flatMap((group) => group.items)),
  );

  const sameAs = contact.socials.map((s) => s.href);

  const person = {
    '@type': 'Person',
    '@id': 'https://chriscancodethat.xyz/#person',
    name: contact.name,
    jobTitle: current ? current.company.title : contact.role,
    email: `mailto:${contact.email}`,
    telephone: contact.phone,
    url: 'https://chriscancodethat.xyz/',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Miami',
      addressRegion: 'FL',
      addressCountry: 'US',
    },
    sameAs,
    knowsAbout,
    ...(current
      ? { worksFor: organization(current.company, current.city) }
      : {}),
    hasOccupation: stripUndefined(hasOccupation),
    alumniOf: education.map((e) => educationalOrganization(e.company, e.city)),
    award: awards.map((a) => a.title),
  };

  return stripUndefined(person);
}

/** Recursively drop `undefined` values / empty objects so JSON-LD stays clean. */
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(stripUndefined) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      out[k] = stripUndefined(v);
    }
    return out as T;
  }
  return value;
}

/** Full ProfilePage graph wrapping the Person, for the home page <head>. */
export function buildProfilePageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': 'https://chriscancodethat.xyz/#profilepage',
    url: 'https://chriscancodethat.xyz/',
    name: `${contact.name} — ${contact.role}`,
    dateModified: new Date().toISOString().slice(0, 10),
    mainEntity: buildPerson(),
  };
}
