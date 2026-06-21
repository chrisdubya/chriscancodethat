# chriscancodethat.xyz

Personal site for Chris Williams — an **interactive WebGL globe résumé**. The home
page is a particle-sampled 3D Earth (react-three-fiber + Three.js) with amber pins
for the cities Chris has worked in. Hover or click a city to open a retro-terminal
overlay of its companies; each company opens a CV detail. A boot-sequence intro
and a full-résumé panel round out the "developer terminal" aesthetic.

## Stack

- **[Astro](https://astro.build) v6** — static output, ships ~zero JS by default
- **React 19** — only the globe is hydrated, via `client:only="react"`
- **[react-three-fiber](https://r3f.docs.pmnd.rs)** + **[drei](https://github.com/pmndrs/drei)**
  + **[postprocessing](https://github.com/pmndrs/postprocessing)** — 3D scene, controls, bloom
- **[Three.js](https://threejs.org)** — underlying WebGL engine
- **TypeScript**, **Sass** + **CSS Modules**
- **Fonts** via `@fontsource`: JetBrains Mono + Orbitron

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output to dist/
npm run preview  # preview the production build
```

> `npm run check` (astro check) currently OOMs — use `npm run build` to type-check.

## Project layout

```
src/
  data/resume.ts      single source of truth — cities, companies, skills, awards, contact
  pages/              index.astro (globe + static SEO fallback)
  layouts/            Base.astro (shell, fonts, SEO/OG meta)
  components/
    globe/            GlobeScene + Earth, CityPin, Graticule (the 3D scene)
    ui/               terminal-styled overlays (boot, company list, popovers, footer)
  styles/             global.scss
public/               CNAME, textures/, images/, fonts/, favicon  (copied verbatim)
```

**Editing résumé content?** Edit `src/data/resume.ts` only — it drives the 3D
pins, the terminal overlays, *and* the static SEO fallback.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with
`withastro/action` and publishes to GitHub Pages (Actions-based deploy). The custom
domain is preserved via `public/CNAME`. The Pages source must be set to **"GitHub
Actions"** in repo settings (Settings → Pages).

See [CLAUDE.md](./CLAUDE.md) for fuller architecture notes.
