import angular from '@analogjs/astro-angular';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

const siteRoot = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = fileURLToPath(new URL('..', import.meta.url));

/** Public URL of the site. Netlify sets `URL` during its builds; the fallback covers local builds. */
const SITE_URL = process.env.URL ?? 'https://ngx-cookie-service.netlify.app';

/** Only these paths go through the Angular compiler; everything else (Starlight, Astro) is plain TS. */
const ANGULAR_PATHS = ['/website/src/angular/', '/website/src/examples/', '/projects/ngx-cookie-service/src/'];

export default defineConfig({
  site: SITE_URL,
  outDir: '../dist/docs',
  trailingSlash: 'ignore',
  integrations: [
    angular({
      vite: {
        tsconfig: `${siteRoot}tsconfig.app.json`,
        transformFilter: (_code, id) => ANGULAR_PATHS.some((p) => id.includes(p)),
      },
    }),
    starlight({
      title: 'ngx-cookie-service',
      description: 'Angular service to read, set and delete browser cookies, with SSR support.',
      logo: { src: './src/assets/logo.svg', replacesTitle: false },
      favicon: '/favicon.svg',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/stevermeister/ngx-cookie-service' },
        { icon: 'npm', label: 'npm', href: 'https://www.npmjs.com/package/ngx-cookie-service' },
        { icon: 'discord', label: 'Discord', href: 'https://discord.gg/N3xc4Jfb' },
      ],
      // Starlight appends the entry's path relative to the Astro root (`src/content/docs/…`).
      editLink: { baseUrl: 'https://github.com/stevermeister/ngx-cookie-service/edit/master/website/' },
      lastUpdated: true,
      sidebar: [
        { label: 'Getting started', items: [{ autogenerate: { directory: 'getting-started' } }] },
        { label: 'Examples', items: [{ autogenerate: { directory: 'examples' } }] },
        { label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] },
      ],
      customCss: ['./src/styles/custom.css', './src/styles/demo.css'],
    }),
  ],
  vite: {
    resolve: {
      alias: {
        // Docs always demo the library source in this repo, never the published package.
        'ngx-cookie-service': `${repoRoot}projects/ngx-cookie-service/src/public-api.ts`,
        '@examples': `${siteRoot}src/examples`,
        '@components': `${siteRoot}src/components`,
      },
    },
    server: { fs: { allow: [repoRoot] } },
  },
});
