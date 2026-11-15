import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages project site: served from /experience_app_prototype_1/
export default defineConfig({
  site: 'https://faiz-aaan.github.io',
  base: '/experience_app_prototype_1',
  trailingSlash: 'always',
  integrations: [sitemap()],
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  build: { inlineStylesheets: 'auto' },
});
