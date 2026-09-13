// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';

// 公開URL。独自ドメインへ移す際はここだけ変える（SPEC 13.1）。
const SITE = process.env.SITE_URL ?? 'https://toolmap-frx.pages.dev';

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap(), pagefind()],
  build: {
    format: 'directory',
  },
  devToolbar: { enabled: false },
});
