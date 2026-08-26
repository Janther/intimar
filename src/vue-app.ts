import type { App } from 'vue';
import PrimeVue from 'primevue/config';
import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';

// Aura's default "primary" is emerald green, which clashes with the site's
// warm terracotta palette (visible on Carousel dots, focus rings, selected
// MultiSelect chips). Swapping in a terracotta ramp keeps PrimeVue's own
// interactive chrome consistent with the buttons we style by hand.
const TantraPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fdf6ef',
      100: '#f8e8d6',
      200: '#f0cca3',
      300: '#e3a86e',
      400: '#d0824a',
      500: '#c2703d',
      600: '#a85a30',
      700: '#8a4726',
      800: '#6b371f',
      900: '#4a2717',
      950: '#2e180e',
    },
  },
});

// Runs once per Vue island Astro hydrates. Registers PrimeVue on
// every component tree so imported components (Dialog, Carousel, etc.)
// work without repeating this setup in each island.
export default (app: App) => {
  app.use(PrimeVue, {
    theme: {
      preset: TantraPreset,
      options: {
        darkModeSelector: '.app-dark',
      },
    },
  });
};
