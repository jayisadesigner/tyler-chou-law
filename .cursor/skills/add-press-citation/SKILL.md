---
name: add-press-citation
description: Adds a new press citation (article, podcast appearance, or interview) to the /press/ page on the Tyler Chou Law site. Use when the user wants to add a press item, citation, media coverage, podcast appearance, or interview reference (e.g. "Tyler was on Creator Science", "add the new Forbes piece", "she was quoted in Rolling Stone").
---

# Add a press citation

Press citations live in `src/content/press/<slug>.md` as data-only files. They don't render their own pages — they appear on `/press/` via the `press-grid` Bookshop component, which automatically emits `Article` JSON-LD per citation.

This is the highest-leverage SEO + AI-visibility surface on the site. Each citation strengthens entity recognition and gives AI tools a clean, schema-marked summary of the original piece.

## Workflow

1. **Get the source URL** from Tyler.
2. **Pick a slug** based on publication + topic. Lowercase, hyphenated. Examples: `forbes-creator-economy-exits`, `creator-science-podcast-2026`, `adweek-ip-q-and-a`.
3. **Gather the required fields** (see template). The summary and self-quote are **Tyler's own words** — paraphrase the article's premise in 2–3 sentences and pull one sentence Tyler said in the piece.
4. **Write `src/content/press/<slug>.md`** using the template.
5. **Drop the publication logo** into `src/assets/images/press/<publication>-logo.png` if it doesn't already exist.
6. **Verify** at `http://localhost:8080/press/` — the new citation should appear in the grid and the relevant tab filter (Print / Podcast / Video / Speaking).

## Template

```markdown
---
publication: "<Publication Name>"
title: "<Article or Episode Title>"
url: "<Direct link to the original piece>"
date: 2026-04-15
type: "Print"        # one of: Print | Podcast | Video | Speaking
logo: /assets/images/press/<publication>-logo.png
summary: "<2–3 sentences in Tyler's words. Do not republish the article body — copyright belongs to the publication.>"
self_quote: "<One sentence Tyler said in the piece.>"
---
```

## Field guidance

| Field | Notes |
|---|---|
| `publication` | Spelled exactly as the masthead spells it. "Forbes", not "FORBES". |
| `title` | The article's actual title — a top-level Google ranking factor. |
| `url` | Permanent link, not a tracker URL. |
| `date` | ISO format `YYYY-MM-DD`. Drives sort order and Article schema. |
| `type` | Drives the press-grid filter tab. |
| `logo` | Use the existing `/assets/logos/<publication>-logo.png` if it exists; otherwise add a new one ~200×80px transparent PNG. |
| `summary` | Tyler's framing of why the piece matters. 2–3 sentences. **Don't paraphrase the article body — that's copyright infringement.** |
| `self_quote` | One sentence Tyler said in the piece. If she wasn't quoted, omit. |

## Hard rules

- **Trademark spelling**: `The Creators' Attorney` (apostrophe after the s).
- **Don't reproduce article body copy** — only Tyler's framing in `summary` and her actual quote in `self_quote`.
- **Press citations are data, not pages.** Don't add `permalink:` or `layout:` frontmatter.
- The press-grid component auto-emits Article JSON-LD. Don't hand-author schema markup.
