// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages: the workflow sets SITE_URL and BASE_PATH (e.g. /aquarea-redesign).
// Locally the site runs at the root.
const site = process.env.SITE_URL ?? 'https://kiko-siska.github.io';
const base = process.env.BASE_PATH ?? '/';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  integrations: [react()],
  // Slovak first; /en/ and /hu/ get the same page tree later.
  i18n: {
    defaultLocale: 'sk',
    locales: ['sk', 'en', 'hu'],
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
