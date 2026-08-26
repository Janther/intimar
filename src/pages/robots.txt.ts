import type { APIRoute } from 'astro';

// The GitHub Pages staging deploy (DEPLOY_TARGET=gh-pages, see
// .github/workflows/deploy.yml and astro.config.mjs) shouldn't be crawled —
// it's a duplicate of the real intimar.life content at a throwaway URL, and
// letting search engines index it would create duplicate-content noise
// around the production site.
const isGhPagesStaging = process.env.DEPLOY_TARGET === 'gh-pages';

export const GET: APIRoute = () => {
  const body = isGhPagesStaging
    ? 'User-agent: *\nDisallow: /\n'
    : 'User-agent: *\nAllow: /\n\nSitemap: https://intimar.life/sitemap-index.xml\n';

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
