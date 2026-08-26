import type { StorybookConfig } from '@storybook/vue3-vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

const config: StorybookConfig = {
  stories: ['../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
  ],
  framework: '@storybook/vue3-vite',
  async viteFinal(viteConfig) {
    // @storybook/vue3-vite doesn't bundle the actual .vue SFC compiler plugin —
    // it expects the project's own root vite.config to provide it. This project's
    // Vite config lives inside astro.config.mjs instead, so it's added here.
    viteConfig.plugins ??= [];
    viteConfig.plugins.push(vue(), tailwindcss());
    return viteConfig;
  },
};
export default config;
