import type { Preview } from '@storybook/vue3-vite';
import { setup } from '@storybook/vue3-vite';
import configureVueApp from '../src/vue-app';
import '../src/styles/global.css';

// Reuses the exact PrimeVue + theme setup the real site's Vue islands get
// (src/vue-app.ts), so components look and behave the same in Storybook.
setup((app) => {
  configureVueApp(app);
});

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'brand',
      values: [{ name: 'brand', value: '#faf7f2' }],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
