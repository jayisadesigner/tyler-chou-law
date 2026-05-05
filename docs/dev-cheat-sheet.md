# Dev Cheat Sheet — What still requires a developer

This page lists everything in the Tyler Chou Law For Creators codebase that **cannot** be safely edited from CloudCannon. If you (Tyler / team) need any of these, ping your developer.

---

## Editor + content (you can do this)

| Task | Where | Skill required |
|---|---|---|
| Add / edit / delete a marketing page | CloudCannon → Pages | None |
| Reorder blocks on a page | CloudCannon → Pages → visual editor | None |
| Publish a Love Letter | CloudCannon → Love Letters (Blog) | None |
| Add a press citation | CloudCannon → Press Citations | None |
| Add a speaking engagement | CloudCannon → Speaking Engagements | None |
| Add / remove a creator from the roster | CloudCannon → Roster | None |
| Edit canonical bio, social URLs, brand info | CloudCannon → Site Data → Site | None |
| Edit primary / footer navigation | CloudCannon → Site Data → Nav | None |
| Add an entry to the AI-crawler-facing site map | CloudCannon → Site Data → Nav → llms | None |

---

## Code (you call your developer)

| Task | Why it's a code change | Owner |
|---|---|---|
| **Visual design changes** (fonts, colors, spacing, animation) | Lives in `src/styles/` | Developer |
| **New block / section type** that doesn't exist yet | Build a new Bookshop component in `component-library/components/` | Developer |
| **Layout changes** to an existing block (rearranging its internal structure) | Lives in `<component>.eleventy.liquid` + `src/styles/components/<component>.css` | Developer |
| **New page section structures** that don't fit existing blocks | New Bookshop component | Developer |
| **Adding a new field** to an existing block | Lives in `<component>.bookshop.yml` | Developer |
| **Site-wide template changes** (e.g. moving the disclaimer, changing the header layout) | Lives in `src/_includes/partials/` and `src/_includes/layouts/` | Developer |
| **JavaScript / animations** | Lives in `src/scripts/` | Developer |
| **Build pipeline** (`.eleventy.js`, `package.json`) | Eleventy / esbuild config | Developer |
| **CMS plumbing** (`cloudcannon.config.yml`) | The schema CloudCannon uses to render the editor | Developer |
| **Hosting config** (`netlify.toml`) | Build command + cache headers + redirects | Developer |
| **Schema markup changes** (Person, Organization, FAQ) | `src/_includes/partials/schema-*.liquid` and `component-library/.../faq/` | Developer |
| **`robots.txt` / `llms.txt` / `sitemap.xml` structure** | `src/robots.txt.liquid`, `src/llms.txt.liquid`, `src/sitemap.xml.liquid` | Developer |
| **Adding a new dependency** (npm package) | `package.json` + integration code | Developer |
| **Migrating to a new CMS / editor** | Architectural change | Developer |

---

## Quick code-area map

```
src/
├── _data/          ← brand, bio, contact, social, nav (these surface in CloudCannon)
├── _includes/      ← page layouts + partials (header, footer, schema)
├── content/        ← editable content (pages, blog, roster, press, speaking)
├── styles/         ← all CSS — visual design lives here
├── scripts/        ← all JavaScript — animations, forms, navigation
└── assets/         ← images, fonts, videos

component-library/  ← Bookshop components (the building blocks)
.eleventy.js        ← Eleventy + esbuild + image optimization config
cloudcannon.config.yml  ← what CloudCannon shows in the editor
netlify.toml        ← Netlify build + cache config
```

---

## When to ask vs. try yourself

**Try yourself in CloudCannon if:**
- It's text or image content
- It's a list of items (press citations, blog posts, roster, speaking)
- It's reordering existing blocks on a page
- It's editing brand info, social URLs, contact info, or the bio

**Ask your developer if:**
- You're not sure where something lives
- The CloudCannon editor doesn't expose the field you need
- You're about to edit any file ending in `.yml`, `.json`, `.liquid`, `.js`, `.css`, or `.toml`
- The live site is broken
- You want to change visual design

---

## Emergency contacts

| Issue | Where to look first |
|---|---|
| Site is down | Netlify dashboard → latest deploy |
| Build is failing | Netlify dashboard → deploy log |
| CloudCannon is throwing an error on save | Screenshot + email developer |
| AI search results are stale | Check `/llms.txt` exists and is up-to-date; ChatGPT etc. recrawl on their own schedule |
| Google search results show old content | Submit `/sitemap.xml` re-crawl in Google Search Console |
