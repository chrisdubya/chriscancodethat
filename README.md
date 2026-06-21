# chriscancodethat.xyz

Personal site for Chris Williams. The home page is an interactive WebGL particle
effect (Three.js + custom GLSL shaders); the rest is a content site (about, blog).

## Stack

- **[Astro](https://astro.build)** — content-first, ships ~zero JS by default
- **TypeScript**
- **[Three.js](https://threejs.org)** — the particle system runs as a vanilla-TS
  island in `src/scripts/webgl/`
- **GSAP 3** — intro/outro tweens
- **GLSL** shaders in `src/shaders/` (loaded via `vite-plugin-glsl`)
- **Sass** for global styles

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output to dist/
npm run preview  # preview the production build
```

## Project layout

```
public/        static assets (CNAME, favicon, images/) copied verbatim
src/
  pages/       index.astro (particle canvas), about.astro, blog/
  layouts/     Base.astro
  components/  Nav.astro
  content/     blog/*.md  (+ src/content.config.ts schema)
  scripts/     App.ts + webgl/  (Three.js particle system)
  shaders/     particle.vert / .frag + lib/
  styles/      global.scss
```

## Deploy

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds with
`withastro/action` and publishes to GitHub Pages. The custom domain is preserved
via `public/CNAME`. Pages source must be set to **"GitHub Actions"** in the repo
settings (Settings → Pages).
