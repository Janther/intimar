// @ts-check
import { defineConfig, globalIgnores } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginVue from 'eslint-plugin-vue';
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default defineConfig(
  globalIgnores([
    'dist/**',
    '.astro/**',
    'node_modules/**',
    'storybook-static/**',
    'test-results/**',
    'playwright-report/**',
  ]),

  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintPluginAstro.configs.recommended,
  eslintPluginVue.configs['flat/recommended'],

  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // .vue SFCs need the TS parser inside <script> for typescript-eslint's
  // rules to apply there — eslint-plugin-vue's own preset only wires up
  // vue-eslint-parser as the top-level parser, not what parses the block
  // vue-eslint-parser hands off to.
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  // Astro components render server-side; their frontmatter script can
  // reference Node/Astro globals that don't exist in a browser file.
  {
    files: ['**/*.astro'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  {
    rules: {
      // Astro/Vue components commonly take props that shape a template
      // without every one being read in the script block itself.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Guards against collisions with native/future HTML elements in a
      // global component registry — doesn't apply here: every component
      // (Tag, Testimonials, ...) is a locally-imported SFC, not globally
      // registered, so there's nothing for a single-word name to collide
      // with.
      'vue/multi-word-component-names': 'off',
    },
  },

  // Must stay last: turns off core/typescript-eslint stylistic rules that
  // would otherwise fight Prettier's own formatting (this project's
  // `format`/`format:check` scripts, not ESLint, own code style).
  eslintConfigPrettier,
);
