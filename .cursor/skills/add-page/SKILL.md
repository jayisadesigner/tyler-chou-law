---
name: add-page
description: Adds a new marketing page to the Tyler Chou Law site using Eleventy + Bookshop blocks. Use when the user wants to create a new page, landing page, or marketing surface (e.g. "add a new page about X", "create a new landing page", "I need a new /something/ URL").
---

# Add a new page

Pages live in `src/content/pages/<slug>.md` and are built by composing Bookshop component blocks. There is no HTML — content authors describe the page in YAML frontmatter and the layout renders it.

## Workflow

1. **Pick a slug.** Lowercase, hyphenated, no spaces, no underscores. Becomes the URL.
2. **Choose blocks.** Reach for existing components first — `hero`, `content-section`, `content-split`, `featured-image`, `capabilities`, `services-grid`, `cta`, `mouse-trail-cta`, `faq`, `logo-grid`, `contact-form`. Compose, don't invent.
3. **Write `src/content/pages/<slug>.md`** using the template below.
4. **If the page is private** (e.g. internal tool, post-form thank-you), set `robots: "noindex, follow"` so the sitemap and search engines skip it.
5. **Add to navigation** in `src/_data/nav.yml` if the page should appear in the header or footer menus.
6. **Verify** in `npm run dev` at `http://localhost:8080/<slug>/`.

## Template

```markdown
---
layout: page.liquid
permalink: /<slug>/
pageClass: <slug>
title: "<50–60 char Google-search-result heading>"
description: "<140–155 char meta description>"
ogImage: /assets/images/<page>/<og-image>.jpg
robots: ""               # set to "noindex, follow" for private pages
blocks:
  - _bookshop_name: hero
    variant: inner
    headline: "<Page headline>"
    subheadline: "<Optional one-liner>"
    background:
      type: none

  - _bookshop_name: content-section
    variant: centered
    headline: "<Section headline>"
    body:
      - text: "<Paragraph 1>"
      - text: "<Paragraph 2>"
    cta:
      label: "<Button label>"
      url: "/<destination>/"

  - _bookshop_name: mouse-trail-cta
    headline: "<Closing CTA headline>"
    cta:
      label: "Schedule a Consultation"
      url: "https://calendly.com/tyler-thecreatorsattorney"
      external: true
---
```

## Hard rules

- `title` and `description` are required.
- Trademark spelling is **The Creators' Attorney** — apostrophe **after** the s.
- Asset paths start with `/assets/`, never `/src/assets/`.
- If the page should be linked from primary nav or footer, add it to `src/_data/nav.yml`.
- Don't create new components inline — use existing ones from `component-library/components/`.

## Reference

For new component creation see `add-bookshop-component`. For service-specific pages see `add-service`.
