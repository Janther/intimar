// @ts-check
// Build-config and e2e code run outside Astro's content layer, so they
// can't call getAllBlogPosts(). This reads the post files' frontmatter
// directly to answer the one question they need: is any post published?
// It mirrors the schema's `published` default (true) — only an explicit
// `published: false` hides a post.
import { readdirSync, readFileSync } from 'node:fs';

const BLOG_DIR = new URL('../content/blog/', import.meta.url);

export function hasPublishedBlogPosts() {
  return readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith('.md'))
    .some((file) => {
      const source = readFileSync(new URL(file, BLOG_DIR), 'utf8');
      const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
      return !/^published:\s*false\s*$/m.test(frontmatter);
    });
}
