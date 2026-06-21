import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://chriscancodethat.xyz',
  // Custom domain serves from the root, so no `base` is needed.
  output: 'static',
  integrations: [react(), sitemap()],
  vite: {
    // Force Vite to pre-bundle React so the dev server exposes the
    // `createRoot` named export from the CJS `react-dom/client`. The
    // @react-three deps otherwise leave it un-optimized and hydration fails.
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
    },
    resolve: { dedupe: ['react', 'react-dom'] },
  },
});
