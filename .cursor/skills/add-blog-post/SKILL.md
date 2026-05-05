---
name: add-blog-post
description: Publishes a new "Love Letter" blog post on the Tyler Chou Law site. Use when the user wants to publish a blog post, love letter, newsletter, article, essay, or long-form content (e.g. "publish this love letter", "add a new blog post about X", "draft a Forbes-style article", "I have a new newsletter to publish").
---

# Add a blog post (Love Letter)

Blog posts live in `src/content/blog/<slug>.md` and auto-render at `/love-letters/<slug>/` via the `blog-post.liquid` layout, which generates `BlogPosting` JSON-LD and a canonical-bio author block.

## Workflow

1. **Pick a slug.** Lowercase, hyphenated, descriptive. Becomes the URL.
2. **Gather metadata** — title, date, description, optional featured image.
3. **Write `src/content/blog/<slug>.md`** with frontmatter + Markdown body.
4. **Drop the featured image** at `src/assets/images/blog/<slug>-hero.jpg` if there is one.
5. **Internal-link** from the post body to at least 1 services page and 1 other blog post (per audit Section 7.2).
6. **Verify** at `http://localhost:8080/love-letters/<slug>/`. The post should also appear on `/love-letters/` index, sorted by date.

## Template

```markdown
---
title: "<Headline-style title>"
slug: "<url-slug>"
date: 2026-04-15
description: "<1–2 sentence summary used in listings, social previews, and search results.>"
author: Tyler Chou
reading_time: 6
featured_image: /assets/images/blog/<slug>-hero.jpg
image_alt: "<Description of the hero image>"
---

Opening paragraph. Hook the reader with the one specific creator-business problem this post solves.

## Section heading

Body in Markdown. Use `**bold**` for emphasis on terms. Use `*italics*` sparingly.

> Pull quotes or callouts use blockquotes.

Internal links read like prose: when you mention a [Tier 1 Asset](/glossary/#tier-1-asset) for the first time, link it. When you mention [Brand Deals](/services/brand-deals/), link it. When you reference an earlier post, link it.

## Closing

Drive to the call-to-action — usually a consultation, an Exit Roadmap, or another long-form piece.
```

## Field guidance

| Field | Notes |
|---|---|
| `title` | 50–60 chars. Front-load the keyword. |
| `slug` | Used as the URL segment. |
| `date` | ISO format. Drives sort order. |
| `description` | 140–155 chars. Used as meta description and on the listings page. |
| `author` | Defaults to "Tyler Chou". Override only when a guest authors. |
| `reading_time` | Estimated minutes — divide word count by 200. |
| `featured_image` | Hero image. Optional. Use AVIF/WebP/JPEG, ~1600px wide. |
| `image_alt` | Required when `featured_image` is set. Describe what's shown. |

## Hard rules

- **Trademark spelling**: `The Creators' Attorney`.
- **First mention** of "The Creators' Attorney", "CreatorArq", "Tier 1", "Exit Roadmap", "Tenant vs Landlord" should be a link.
- **Slug** matches the file name (without `.md`) and feeds the permalink.
- **Asset paths** start with `/assets/`, never `/src/assets/`.
- The layout auto-injects the canonical bio at the end of the post and emits BlogPosting JSON-LD. Don't add an author bio paragraph by hand.
