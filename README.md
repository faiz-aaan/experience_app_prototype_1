# The Cousin: product requirements

A website that explains what The Cousin is, how it works, and why: an app that knows you and knows Chennai, plans an outing from one sentence, and checks every fact before it shows you.

**Live site:** https://faiz-aaan.github.io/experience_app_prototype_1/

## What's here

| Path | What it is |
|---|---|
| `site/` | The PRD website (Astro, static). Content lives in `site/src/data/site.ts` and the pages in `site/src/pages/` |
| `site/src/films/` | The animated explainers, drawn on canvas |
| `site/src/data/sim/` | Results from the simulation runs, read directly by the pages |
| `site/DESIGN.md` | Design direction: the kolam concept, palette, type and motion |
| `design-preview/directions.html` | The three design directions that were considered |

## Run it locally

```bash
cd site
npm install
npm run dev
```

Then open the address it prints, usually http://localhost:4321/experience_app_prototype_1/

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages through `.github/workflows/deploy.yml`. In the repository settings, Pages must be set to deploy from **GitHub Actions**.

## Status

The first slice is built: the product, goals, how it works, and fences and magnets. The remaining sections are listed in the menu as "next".

Places, prices and people in examples are invented. Simulation results use synthetic people and rank ideas against each other; they don't predict real users.
