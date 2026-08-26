import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type EventEntry = CollectionEntry<'events'>;
export type TeamEntry = CollectionEntry<'team'>;
export type TestimonialEntry = CollectionEntry<'testimonials'>;

export async function getAllEvents(): Promise<EventEntry[]> {
  const events = await getCollection('events');
  return events.sort(
    (a, b) => a.data.startDate.getTime() - b.data.startDate.getTime(),
  );
}

export async function getUpcomingEvents(): Promise<EventEntry[]> {
  const now = new Date();
  const events = await getAllEvents();
  return events.filter(
    (event) => event.data.endDate.getTime() >= now.getTime(),
  );
}

export async function getFeaturedEvents(): Promise<EventEntry[]> {
  const events = await getUpcomingEvents();
  return events.filter((event) => event.data.featured);
}

export async function getEvent(id: string): Promise<EventEntry | undefined> {
  return getEntry('events', id);
}

export async function getAllTeamMembers(): Promise<TeamEntry[]> {
  return getCollection('team');
}

export async function getTeamMember(
  id: string,
): Promise<TeamEntry | undefined> {
  return getEntry('team', id);
}

export async function getEventHosts(event: EventEntry): Promise<TeamEntry[]> {
  const hosts = await Promise.all(
    event.data.hostIds.map((id) => getTeamMember(id)),
  );
  return hosts.filter((host): host is TeamEntry => Boolean(host));
}

export async function getAllTestimonials(): Promise<TestimonialEntry[]> {
  return getCollection('testimonials');
}

export async function getEventsHostedBy(
  memberId: string,
): Promise<EventEntry[]> {
  const events = await getAllEvents();
  return events.filter((event) => event.data.hostIds.includes(memberId));
}

export function formatDateRange(start: Date, end: Date): string {
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  // Intl.DateTimeFormat refuses to format day+year without month (it falls
  // back to a disambiguated string), so the same-month case is built by
  // hand instead of asking it for just the end day and year.
  if (sameMonth) {
    const month = new Intl.DateTimeFormat('es-CL', { month: 'long' }).format(
      start,
    );
    return `${start.getDate()}–${end.getDate()} de ${month} de ${end.getFullYear()}`;
  }

  const startFmt = new Intl.DateTimeFormat('es-CL', {
    month: 'long',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  }).format(start);
  const endFmt = new Intl.DateTimeFormat('es-CL', {
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
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Early bird pricing stops being valid — and stops being advertised — once
// its deadline passes, so every early-bird display checks this first rather
// than trusting the price fields alone.
export function isEarlyBirdActive(deadline: Date): boolean {
  return deadline.getTime() >= Date.now();
}
