import { defineConfig } from 'astro/config';
import glsl from 'vite-plugin-glsl';

// https://astro.build/config
export default defineConfig({
  site: 'https://chriscancodethat.xyz',
  // Custom domain serves from the root, so no `base` is needed.
  output: 'static',
  vite: {
    plugins: [glsl()],
  },
});
