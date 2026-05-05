---
description: Architecture, build pipeline, and where things live in the Tyler Chou Law site
alwaysApply: true
---

# Architecture

Tyler Chou Law For Creators / The Creators' Attorney website. Premium law-firm marketing site built for editorial CMS handoff to Tyler's team.

## Stack

| Layer | Tool |
|---|---|
| Static-site generator | **Eleventy v3** (`@11ty/eleventy`) |
| Templating | **LiquidJS** (Eleventy + Bookshop both use Liquid) |
| Component library | **Bookshop** (`@bookshop/eleventy-bookshop`) |
| CMS | **CloudCannon** — visual editor reads `cloudcannon.config.yml` and `component-library/` |
| JS bundler | **esbuild** — invoked from Eleventy `eleventy.before` hook |
| Styling | Vanilla CSS, design-token system in `src/styles/variables.css` |
| Animation | **GSAP** + **ScrollTrigger** + **Lenis**, lazy-loaded via dynamic `import()` |
| Hosting | **Netlify** — `netlify.toml` runs `npm run build` |

There is **no** React, no Vite, no Webpack, no Decap CMS. Don't reintroduce them.

## Repository layout

```
.
├── .eleventy.js                 # Eleventy + esbuild + eleventy-img config
├── .eleventyignore              # paths Eleventy must skip
├── cloudcannon.config.yml       # CloudCannon collections + Bookshop visual-editor wiring
├── netlify.toml                 # build command + headers
├── package.json                 # `npm run dev` / `npm run build`
│
├── component-library/           # Bookshop components (the visual building blocks)
│   └── components/
│       └── <name>/
│           ├── <name>.bookshop.yml          # CloudCannon schema (editable fields)
│           └── <name>.eleventy.liquid       # rendered output
│
├── src/
│   ├── _data/                   # global data exposed to every template
│   │   ├── site.json            # brand, canonical bio, social, contact
│   │   ├── nav.yml              # primary + footer + llms.txt structure
│   │   ├── seo.yml              # AI crawler list, OG defaults
│   │   ├── clients.js            # builds the clients collection from YAML
│   │   ├── testimonials.js      # builds testimonials data
│   │   └── videos.js            # builds YouTube grid data from config/youtube-videos.json
│   │
│   ├── _includes/
│   │   ├── layouts/             # base.liquid, page.liquid, blog-post.liquid, client.liquid
│   │   └── partials/            # head, header, footer, disclaimer, schema-person, schema-breadcrumb
│   │
│   ├── content/                 # all editable content (this is what CloudCannon edits)
│   │   ├── pages/               # one .md per page; renders via `layout: page.liquid` + `blocks:`
│   │   ├── blog/                # love letters; auto-emits at /love-letters/<slug>/
│   │   ├── clients/             # creator YAMLs; auto-paginated to /clients/<slug>/
│   │   ├── press/               # press citations; surfaced via press-grid component
│   │   └── speaking/            # speaking engagements; surfaced via speaking-grid component
│   │
│   ├── styles/                  # CSS — passthrough copied to /styles/
│   ├── scripts/                 # JS source — bundled by esbuild to /scripts/
│   ├── assets/                  # images, fonts, videos — passthrough copied to /assets/
│   │
│   ├── robots.txt.liquid        # generated, lists every AI crawler
│   ├── llms.txt.liquid          # generated, builds AI-consumable site map
│   └── sitemap.xml.liquid       # generated from collections.all
│
├── scripts/
│   ├── build-youtube-videos.js  # refreshes YouTube data; runs before eleventy
│   └── generate-colors.js       # design-token generator (occasional use)
│
└── dist/                        # build output — gitignored
```

## Build pipeline

```
npm run build
  → npm run build:youtube       (refreshes config/youtube-videos.json)
  → eleventy
      → eleventy.before hook → esbuild bundles src/scripts/main.js
      → Liquid renders src/content/**/*.{md,liquid} via layouts + Bookshop components
      → Passthrough copies src/{assets,styles}/ + public/
      → Writes dist/
```

esbuild is configured with `splitting: true`. Animations are loaded via dynamic `import()` in `main.js` so GSAP/Lenis stay off the critical path (~6KB blocking JS, ~250KB lazy chunks).

## Hard rules

1. **Pages live in `src/content/pages/*.md`.** Not at the project root, not in `src/`. Never create `index.html` at the root.
2. **Reusable UI is a Bookshop component**, not raw HTML in a page. If you find yourself duplicating markup across pages, factor it into `component-library/components/<name>/`.
3. **Site-wide content (brand, bio, contact, nav)** is sourced from `src/_data/`. Never hardcode bio prose, social URLs, or address strings into templates.
4. **Schema.org JSON-LD** is generated from data, not hand-edited per page. The Person/Org/LegalService graph lives in `partials/schema-person.liquid`. BreadcrumbList is auto-generated. FAQPage is emitted by the `faq` component.
5. **All asset paths start with `/assets/`** (or `/styles/`, `/scripts/`, `/img/`). Never use `/src/assets/` — that was a Vite-era convention that no longer applies.
6. **Don't reintroduce deleted things.** No Vite. No Decap CMS. No `scripts/build-blog.js` / `build-roster.js` / `build-content.js` / `build-pages.js` / `build-rss.js` / `build-sitemap.js`. No `src/components/*.html` partials. No `loadComponent()` XHR shim.
7. **Before adding a dependency**, ask whether it can be done with the existing stack. The whole site runs on ~5 dev tools.
