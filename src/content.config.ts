import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

// Data lives in flat JSON for now. To move to a database later, replace
// `file('src/data/events.json')` with a custom loader that implements the
// Astro Loader API and fetches from that database — the schema below and
// every getCollection()/getEntry() call in the pages stay unchanged.
const events = defineCollection({
  loader: file('src/data/events.json'),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      title: z.string(),
      summary: z.string(),
      description: z.string(),
      location: z.string(),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      earlyBirdPrice: z.number(),
      earlyBirdDeadline: z.coerce.date(),
      price: z.number(),
      currency: z.string().default('CLP'),
      // A path relative to this JSON file — see src/data/images/events/.
      // Swap in the real photo under the same filename to replace it.
      image: image(),
      tags: z.array(z.string()).default([]),
      hostIds: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
    }),
});

const team = defineCollection({
  loader: file('src/data/team.json'),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      name: z.string(),
      role: z.string(),
      bio: z.string(),
      // A path relative to this JSON file — see src/data/images/team/.
      // Swap in the real photo under the same filename to replace it.
      photo: image(),
      specialties: z.array(z.string()).default([]),
      social: z
        .object({
          instagram: z.string().url().optional(),
          website: z.string().url().optional(),
        })
        .default({}),
    }),
});

const testimonials = defineCollection({
  loader: file('src/data/testimonials.json'),
  schema: z.object({
    id: z.string(),
    quote: z.string(),
    name: z.string(),
    event: z.string(),
  }),
});

export const collections = { events, team, testimonials };
