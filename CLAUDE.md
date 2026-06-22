# CLAUDE.md

Guidance for working in this repo. Read this before making changes.

## What this is

`chriscancodethat.xyz` — Chris Williams' personal site, built as an **interactive
WebGL globe résumé**. The home page renders a particle-sampled 3D Earth (via
react-three-fiber) with amber pins for the cities Chris has worked in. Hovering or
selecting a city opens a retro-terminal overlay listing that city's companies;
each company opens a CV popover. A boot-sequence intro and a full-résumé panel
complete the "developer terminal" aesthetic.

It is a **single static site** (no backend, no blog). Everything is driven from
one data file.

## Stack

- **[Astro](https://astro.build) v7** — `output: 'static'`, ships zero JS except
  the one hydrated island.
- **React 19** — only the globe is hydrated, via `client:only="react"` (it's
  pure WebGL, nothing to SSR).
- **[react-three-fiber](https://r3f.docs.pmnd.rs) + [drei](https://github.com/pmndrs/drei)
  + [postprocessing](https://github.com/pmndrs/postprocessing)** — the 3D scene,
  controls (`OrbitControls`), and bloom.
- **[three.js](https://threejs.org)** (`^0.184`) — underlying engine.
- **TypeScript**, **Sass** (`src/styles/global.scss`), **CSS Modules** for
  component-scoped styles.
- **Fonts** via `@fontsource`: JetBrains Mono (body/terminal) + Orbitron (display).

## Architecture

```
src/
  data/resume.ts          ← SINGLE SOURCE OF TRUTH (see below)
  pages/index.astro       home page: mounts <GlobeScene> + a static SEO fallback
  layouts/Base.astro      <html> shell, fonts, SEO/OG meta
  components/
    globe/
      GlobeScene.tsx      orchestrator: Canvas, state, all overlays. The entry point.
      Earth.tsx           particle-sampled landmass (samples earth-water.png mask)
      CityPin.tsx         a hover/selectable amber pin + billboard label
      Graticule.tsx       lat/lng grid lines ("developer grid" look)
      hooks/latLngToVec3.ts   geo→3D conversion + shared GLOBE_RADIUS
    ui/                   the terminal-styled DOM overlays (HTML, not in-canvas):
      BootSequence.tsx    typewriter intro, runs once
      TerminalOverlay.tsx shared CRT window chrome (title bar, BlinkingCursor)
      CompanyList.tsx     companies for the hovered/selected city
      CompanyPopover.tsx  one company's full CV detail
      FullResumePanel.tsx the "view full résumé" slide-out
      AwardsFooter.tsx    awards + contact/socials footer, résumé toggle
  styles/global.scss      global styles + CSS custom properties
public/
  CNAME                   custom domain (chriscancodethat.xyz) — do not delete
  textures/earth-water.png   land/water mask sampled by Earth.tsx
  images/og-image.jpg     Open Graph / Twitter card image
  fonts/, favicon.ico
```

### `src/data/resume.ts` is the single source of truth

`cities`, `skills`, `awards`, and `contact` drive **everything** — the 3D pins,
the terminal company lists, the CV popovers, the full-résumé panel, AND the static
SEO fallback in `index.astro`. To update résumé content, edit this file only;
don't hardcode résumé data in components. Cities are keyed by `id` (`mia`, `lon`,
`nyc`, `dc`). A company can be `remote` or a `placeholder` ("COMING SOON") stub.

### SEO fallback

`index.astro` renders a plain, crawlable HTML résumé (`.seo-fallback`) below the
canvas. The globe is `client:only`, so this fallback is what search engines and
no-WebGL clients see. Keep it in sync with `resume.ts` (it already maps over the
same data).

### Conventions worth matching

- The globe is the only hydrated island — keep new interactivity inside it or as
  another small island; don't ship JS site-wide.
- Respect `prefers-reduced-motion` (auto-rotation, pin pulse, and bloom all gate
  on it — see `usePrefersReducedMotion` in `GlobeScene.tsx`).
- Perf heuristics already exist: bloom is skipped on small/low-core devices, and
  `Earth.tsx` halves its particle sample count on mobile. Follow that pattern for
  anything expensive.
- Amber (`#ffb000`) is the accent throughout — the "terminal" theme color.

## Commands

```bash
npm install
npm run dev      # astro dev → http://localhost:4321
npm run build    # static output to dist/
npm run preview  # serve the production build
npm run check    # astro check — ⚠️ see warning below
```

> ⚠️ **`npm run check` (astro check) OOMs** — it crashes the Node heap on this
> machine. Use `npm run build` (or `tsc`) to type-check instead.

## Deploy

Pushing to **`main`** triggers `.github/workflows/deploy.yml`, which builds with
`withastro/action@v6` and publishes `dist/` to **GitHub Pages** (Actions-based
deploy, not branch-based). The custom domain is preserved via `public/CNAME`.

The repo's Pages source must be set to **"GitHub Actions"** (Settings → Pages).
If the site isn't updating despite green workflow runs, this is the first thing
to check.
