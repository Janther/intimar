import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllBlogPosts, resolveBlogAuthor } from '../lib/data';
import { withBase } from '../lib/site';

export async function GET(context: APIContext) {
  const posts = await getAllBlogPosts();
  const items = await Promise.all(
    posts.map(async (post) => {
      const author = await resolveBlogAuthor(post);
      return {
        title: post.data.title,
        description: post.data.summary,
        pubDate: post.data.pubDate,
        author: author.name,
        categories: post.data.tags,
        link: withBase(`/blog/${post.id}`),
      };
    }),
  );

  return rss({
    title: 'Intimar — Blog',
    description:
      'Reflexiones sobre tantra, respiración y contacto consciente desde el equipo de Intimar.',
    site: context.site!,
    items,
  });
}
