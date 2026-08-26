export const CONTACT_EMAIL = 'hello@intimar.example';

// Prefixes a root-relative internal path with the site's configured base
// path (astro.config.mjs's `base`, exposed as import.meta.env.BASE_URL).
// Astro rewrites its own generated URLs automatically (asset imports,
// getStaticPaths routes, the canonical/sitemap links built from Astro.url),
// but a plain string literal like href="/events" is not — production
// (intimar.life) serves from the domain root so base is '/', while the
// GitHub Pages staging build serves from /intimar, so every hand-written
// internal href needs to go through this.
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
}
