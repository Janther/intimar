// Pure formatting helpers and the EventSummary shape, kept free of
// `astro:content` imports so browser code (the /admin panel's live preview,
// Vue components) can use them too. data.ts re-exports everything here.

// Content dates are bare "YYYY-MM-DD" strings, which JavaScript parses as
// UTC midnight. Formatting them in the machine's local zone shifted every
// date a day early on any build west of UTC (e.g. Chile, UTC−3) — so all
// date formatting reads them back in UTC, where they were created.
const UTC = { timeZone: 'UTC' } as const;

export function formatDateRange(start: Date, end: Date): string {
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();

  // One-day events (workshops) would otherwise read "17–17 de octubre".
  if (sameMonth && start.getUTCDate() === end.getUTCDate()) {
    return formatBlogDate(start);
  }

  // Intl.DateTimeFormat refuses to format day+year without month (it falls
  // back to a disambiguated string), so the same-month case is built by
  // hand instead of asking it for just the end day and year.
  if (sameMonth) {
    const month = new Intl.DateTimeFormat('es-CL', {
      ...UTC,
      month: 'long',
    }).format(start);
    return `${start.getUTCDate()}–${end.getUTCDate()} de ${month} de ${end.getUTCFullYear()}`;
  }

  const startFmt = new Intl.DateTimeFormat('es-CL', {
    ...UTC,
    month: 'long',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  }).format(start);
  const endFmt = new Intl.DateTimeFormat('es-CL', {
    ...UTC,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(end);
  return `${startFmt} – ${endFmt}`;
}

export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    ...UTC,
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Blog post dates carry the year (unlike formatShortDate's event-deadline
// use, which is always near-term) since a post's publish date stays
// meaningful — and visible — long after the year it was written in.
export function formatBlogDate(date: Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    ...UTC,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

// Early bird pricing stops being valid — and stops being advertised — once
// its deadline passes, so every early-bird display checks this first rather
// than trusting the price fields alone.
export function isEarlyBirdActive(deadline: Date | undefined): boolean {
  return deadline !== undefined && deadline.getTime() >= Date.now();
}

// The plain, pre-formatted shape EventCard.vue actually renders. Vue
// components can't take the raw EventEntry (its image is Astro-specific
// ImageMetadata, and re-formatting dates/currency per render isn't worth
// duplicating in every framework) — pages map to this shape once, here,
// rather than each repeating the same six fields inline.
export interface EventSummary {
  id: string;
  title: string;
  summary: string;
  location: string;
  startDateLabel: string;
  earlyBirdPrice: number;
  earlyBirdActive: boolean;
  earlyBirdDeadlineLabel: string;
  price: number;
  currency: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  tags: string[];
}

// Like getAllEvents(), the single read path for posts — unpublished ones
// are filtered here, so their pages, the RSS feed and adjacent-post links
// all drop them at once.
