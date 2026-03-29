import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://Takayuki-Y5991.github.io',
  base: '/blogs',
  output: 'static',
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
  },
  markdown: {
    shikiConfig: {
      theme: 'dracula',
    },
  },
});
