import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { withBase } from './site';
import {
  formatDateRange,
  formatShortDate,
  isEarlyBirdActive,
  type EventSummary,
} from './format';

export * from './format';

type EventEntry = CollectionEntry<'events'>;
export type TeamEntry = CollectionEntry<'team'>;
type TestimonialEntry = CollectionEntry<'testimonials'>;
export type BlogEntry = CollectionEntry<'blog'>;

// Every page reads events through here, so filtering unpublished ones out
// at this single point hides them everywhere — including their detail
// page, which getStaticPaths then never builds.
export async function getAllEvents(): Promise<EventEntry[]> {
  const events = await getCollection('events', (event) => event.data.published);
  return events.sort(
    (a, b) => a.data.startDate.getTime() - b.data.startDate.getTime(),
  );
}

async function getUpcomingEvents(): Promise<EventEntry[]> {
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

export async function getAllTeamMembers(): Promise<TeamEntry[]> {
  return getCollection('team');
}

async function getTeamMember(id: string): Promise<TeamEntry | undefined> {
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

export async function getAllBlogPosts(): Promise<BlogEntry[]> {
  const posts = await getCollection('blog', (post) => post.data.published);
  return posts.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
}

// "Previous" is the post published before this one (older), "next" is the
// post published after (newer) — the same convention WordPress's
// previous_post_link()/next_post_link() use, independent of getAllBlogPosts'
// own newest-first sort order.
export async function getAdjacentBlogPosts(
  post: BlogEntry,
): Promise<{ previous?: BlogEntry; next?: BlogEntry }> {
  const posts = await getAllBlogPosts();
  const index = posts.findIndex((p) => p.id === post.id);
  return { previous: posts[index + 1], next: posts[index - 1] };
}

// The plain shape pages actually render for a post's byline — resolves the
// author union (a `reference('team')` or an inline guest object) to one
// consistent shape so BlogCard/the post page don't each re-implement the
// "which kind of author is this" check.
export interface BlogAuthor {
  name: string;
  bio?: string;
  photo?: ImageMetadata;
  href?: string;
}

export async function resolveBlogAuthor(post: BlogEntry): Promise<BlogAuthor> {
  const author = post.data.author;
  if ('collection' in author) {
    const member = await getEntry(author);
    if (!member) {
      throw new Error(
        `Blog post "${post.id}" references missing team member "${author.id}"`,
      );
    }
    return {
      name: member.data.name,
      bio: member.body,
      photo: member.data.photo,
      href: withBase(`/team#${member.id}`),
    };
  }
  return { name: author.name, bio: author.bio, photo: author.photo };
}

export async function toEventSummary(event: EventEntry): Promise<EventSummary> {
  // EventCard.vue can't use Astro's <Image> component (it's Vue, not
  // Astro), so this calls the same underlying optimization by hand —
  // getImage() is the programmatic API <Image> itself is built on. Without
  // it, the card would fall back to the original unoptimized upload
  // (2-3x the bytes) with no width/height, risking layout shift.
  //
  // width/height are pinned to EventCard.vue's `aspect-4/3` thumbnail box
  // (800x600 is exactly 4:3, ~2x the box's largest real rendered width so
  // it stays sharp on retina) — without them getImage() defaults to the
  // source's native size (1600px wide, up to ~2200px tall for portrait
  // uploads), shipping a multi-hundred-KB image for a few-hundred-px card.
  const optimizedImage = await getImage({
    src: event.data.image,
    format: 'webp',
    width: 800,
    height: 600,
  });
  return {
    id: event.id,
    title: event.data.title,
    summary: event.data.summary,
    location: event.data.location,
    startDateLabel: formatDateRange(event.data.startDate, event.data.endDate),
    earlyBirdPrice: event.data.earlyBirdPrice ?? event.data.price,
    earlyBirdActive:
      event.data.earlyBirdPrice !== undefined &&
      isEarlyBirdActive(event.data.earlyBirdDeadline),
    earlyBirdDeadlineLabel: event.data.earlyBirdDeadline
      ? formatShortDate(event.data.earlyBirdDeadline)
      : '',
    price: event.data.price,
    currency: event.data.currency,
    image: optimizedImage.src,
    imageWidth: optimizedImage.attributes.width,
    imageHeight: optimizedImage.attributes.height,
    tags: event.data.tags,
  };
}
