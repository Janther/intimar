// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

import compress from '@playform/compress';

// The GitHub Pages staging deploy (see .github/workflows/deploy.yml) builds
// with DEPLOY_TARGET=gh-pages so it gets a site/base matching where GitHub
// actually serves a repo not named <user>.github.io — janther.github.io/intimar.
// Local dev and the real intimar.life production build are untouched.
const isGhPagesStaging = process.env.DEPLOY_TARGET === 'gh-pages';

// https://astro.build/config
export default defineConfig({
  site: isGhPagesStaging ? 'https://janther.github.io' : 'https://intimar.life',
  base: isGhPagesStaging ? '/intimar' : '/',

  integrations: [
    vue({
      appEntrypoint: '/src/vue-app.ts',
    }),
    sitemap(),
    // Must stay last — it compresses the fully-rendered build output,
    // including inline <script>/<style> content that Astro's own
    // compressHTML leaves untouched.
    //
    // removeComments and collapseWhitespace must stay off: Vue's SSR output
    // relies on both HTML comments (<!--[-->/<!--]--> fragment markers,
    // <!--v-if--> placeholders for a false branch) AND exact whitespace as
    // anchors for client-side hydration on every `client:*` island. The
    // default minifier settings strip/collapse both as "insignificant",
    // which silently breaks hydration matching — every page with a
    // hydrated PrimeVue component (EventsExplorer, ContactForm,
    // InterestDialog) logged "Hydration completed but contains mismatches"
    // in production only, never in dev (unminified). Bisected one
    // sub-processor at a time — CSS/Image/SVG/JSON/JavaScript minification
    // are not implicated and stay at their defaults.
    compress({
      HTML: {
        'html-minifier-terser': {
          removeComments: false,
          collapseWhitespace: false,
        },
      },
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
        'primevue/iconfield',
        'primevue/inputicon',
        'primevue/carousel',
        'primevue/textarea',
        'primevue/message',
        '@primevue/themes/aura',
        '@primevue/themes',
      ],
    },
  },
});
