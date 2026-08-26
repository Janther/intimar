// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [
    vue({
      appEntrypoint: '/src/vue-app.ts',
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      // Each Vue island imports its own handful of primevue/* subpaths;
      // without this, Vite discovers them one route at a time in dev
      // and keeps invalidating its dep cache mid-session.
      include: [
        'primevue/config',
        'primevue/button',
        'primevue/dialog',
        'primevue/inputtext',
        'primevue/multiselect',
        'primevue/tag',
        'primevue/carousel',
        'primevue/textarea',
        'primevue/message',
        '@primevue/themes/aura',
        '@primevue/themes',
      ],
    },
  },
});
