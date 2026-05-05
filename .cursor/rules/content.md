---
description: How to author content (pages, blog posts, roster, press, speaking) in the Tyler Chou Law site
globs: src/content/**/*
alwaysApply: false
---

# Content Authoring

Content is the only thing Tyler's team should ever need to touch. The whole architecture exists so that adding a press citation, publishing a love letter, or onboarding a new creator never requires a developer.

## Where each content type lives

| Type | Path | URL pattern | Authored as |
|---|---|---|---|
| Marketing pages | `src/content/pages/<slug>.md` | `/<slug>/` | Markdown frontmatter + Bookshop blocks |
| Blog posts ("Love Letters") | `src/content/blog/<slug>.md` | `/love-letters/<slug>/` | Markdown body + frontmatter |
| Creator roster | `src/content/roster/<handle>.yml` | `/roster/<handle>/` | YAML only |
| Press citations | `src/content/press/<slug>.md` | data-only — surfaced by `press-grid` | Frontmatter only |
| Speaking engagements | `src/content/speaking/<slug>.md` | data-only — surfaced by `speaking-grid` | Frontmatter only |

## Pages — Bookshop blocks model

Every page in `src/content/pages/*.md` follows this shape:

```yaml
---
layout: page.liquid
permalink: /press/
pageClass: press
title: "Press & Citations | Tyler Chou — The Creators' Attorney"
description: "140-155 character search-snippet description."
ogImage: /assets/images/about/hero-about-tyler-chou-on-stage.jpg
robots: ""    # set to "noindex, follow" on private pages (thank-you, glossary)
blocks:
  - _bookshop_name: hero
    variant: inner
    headline: "Press &<br>Citations."
    subheadline: "..."
    background:
      type: none

  - _bookshop_name: press-grid
    intro: "..."
    show_filters: true
---
```

The page layout iterates `blocks:` and renders each component in order. To add a section, insert another block; to remove one, delete it; to reorder, move the block. CloudCannon's visual editor does this without text editing.

## Hard rules

1. **`title` and `description` are required on every page.** Title 50–60 chars, description 140–155.
2. **The trademark is `The Creators' Attorney`** — apostrophe **after** the s. Never "The Creator's Attorney" (singular). Sweep before committing.
3. **The canonical bio paragraph from `site.bio.canonical`** must appear on the homepage, About page, Press page, and footer. Don't paraphrase. If you need to surface it, pull from data — never copy-paste prose.
4. **CreatorArq is M&A advisory**, not a venture fund. The metadata says "M&A advisory"; body copy says "advisory" / "M&A"; nothing on the site says "venture fund" or "investing in creator-led businesses".
5. **Asset paths start with `/assets/`** — never `/src/assets/`. That was a Vite-era rewrite that no longer happens.
6. **Image alt text is required** at the schema level. If a Bookshop component takes an image, fill in the alt text. Hero headshots: "Tyler Chou, known as The Creators' Attorney, founder of Tyler Chou Law For Creators."
7. **Dates use ISO format (`YYYY-MM-DD`)**, no slashes, no localized variants.
8. **Slugs are lowercase, hyphenated, no spaces, no underscores, no special characters.** `5-brand-deal-mistakes` not `5_Brand_Deal_Mistakes`.
9. **Press / Speaking entries don't render as their own pages** — they exist only as collection data and appear on `/press/` and `/speaking/` via the `press-grid` and `speaking-grid` components. Don't add `permalink:` to them.
10. **Roster entries DO render as their own pages** at `/roster/<slug>/` via `src/content/pages/roster-detail.liquid` pagination. Set `slug:` to control the URL.

## Blog post (Love Letter) frontmatter

```yaml
---
title: "Headline-style title"
slug: "url-slug-here"
date: 2026-04-15
description: "1–2 sentence summary used in listings, social previews, and the search snippet."
author: Tyler Chou
reading_time: 6
featured_image: /assets/images/blog/post-hero.jpg
image_alt: "Description of the hero image."
---

Markdown body here. Use `**bold**`, `*italic*`, `## H2`, lists, blockquotes, links normally.
```

The `blog-post.liquid` layout auto-generates `BlogPosting` JSON-LD schema and the canonical-bio author block.

## Press citation frontmatter

```yaml
---
publication: "Forbes"
title: "Article or episode title"
url: "https://forbes.com/..."
date: 2026-02-01
type: "Print"            # one of Print | Podcast | Video | Speaking — drives the press-grid filter
logo: /assets/images/press/forbes-logo.png
summary: "2–3 sentence summary in Tyler's words. Do not republish the article body — copyright belongs to the publication."
self_quote: "One sentence Tyler said in the piece."
---
```

Each citation auto-emits `Article` JSON-LD via the press-grid component.

## Roster entry (YAML only)

```yaml
handle: "@jennyhoyos"
slug: jennyhoyos
order: 10                # lower = sooner in the grid
photo: /assets/images/roster/jennyhoyos.jpg
external_url: ""         # if set, card links here instead of /roster/jennyhoyos/
youtube_url: https://youtube.com/@JennyHoyos
seo_description: "Used in the per-creator page meta description."
stats:
  - { value: "9.85M", label: "subscribers" }
bio:
  - "First paragraph."
  - "Second paragraph."
featured_videos: []
```

## Site-wide content (rare, but central)

Edits to brand, canonical bio, contact info, social URLs, and disclaimer all happen in `src/_data/site.json`. Edits propagate everywhere — schema, footer, llms.txt, page-level meta tags. Changing the canonical bio is a one-file edit.

Navigation is in `src/_data/nav.yml`. Adding a footer link or reordering primary nav happens there.
