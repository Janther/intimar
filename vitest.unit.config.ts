import { getViteConfig } from 'astro/config';

// Separate from vitest.config.ts (which runs Storybook's browser-mode
// component tests): plain unit tests need Astro's own Vite config merged
// in via getViteConfig so imports of the astro:content virtual module
// (pulled in by src/lib/data.ts) resolve outside of the Astro dev/build
// pipeline.
export default getViteConfig({
  test: {
    name: 'unit',
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
