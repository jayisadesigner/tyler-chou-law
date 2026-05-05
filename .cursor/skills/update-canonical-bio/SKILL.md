---
name: update-canonical-bio
description: Updates Tyler Chou's canonical bio paragraph site-wide on the Tyler Chou Law site. Use when the user wants to change Tyler's bio, update the bio paragraph, refresh the canonical bio, or rephrase how Tyler describes herself (e.g. "update Tyler's bio", "change the bio paragraph", "Tyler wants new bio language").
---

# Update the canonical bio

The canonical bio is one paragraph that must appear verbatim on the homepage, the About page, the Press page, and (in shortened form) the footer. Bio consistency across surfaces is the primary signal that teaches LLMs that **"Tyler Chou"** and **"The Creators' Attorney"** are the same entity.

The bio is centralized in `src/_data/site.json` so a single edit propagates everywhere — JSON-LD Person schema, page bodies that pull from `site.bio.canonical`, footer, llms.txt, and blog post author bios.

## Workflow

1. **Edit `src/_data/site.json`** — update `bio.canonical` (full paragraph) and `bio.footer` (one-sentence short version).
2. **Sweep prose copies** that hardcoded the old bio. Search for distinctive phrases from the old bio (e.g. "two decades at Disney") and replace each with the same paragraph from the new bio. Most pages already pull from `site.bio.canonical` via Liquid — those need no change.
3. **Verify the canonical bio appears** on `/`, `/about/`, `/press/`, and in the footer.
4. **Verify the JSON-LD Person `description`** matches the new bio.
5. **Verify llms.txt** at `/llms.txt` reflects the new bio.

## Where the bio surfaces (don't forget any)

| Surface | Source | Notes |
|---|---|---|
| Homepage About teaser | `src/content/pages/index.md` | `featured-image` block body — may be hardcoded; sweep manually if so |
| About page hero/intro | `src/content/pages/about.md` | Sweep manually if hardcoded |
| Press page hero | `src/content/pages/press.md` | Currently uses a `content-section` block with the bio — update text or convert to pull from data |
| Footer | `src/_includes/partials/footer.liquid` | Pulls from `site.bio.footer` automatically |
| Person JSON-LD `description` | `src/_includes/partials/schema-person.liquid` | Pulls from `site.bio.canonical` automatically |
| llms.txt | `src/llms.txt.liquid` | Pulls from `site.bio.canonical` automatically |
| Blog post author block | `src/_includes/layouts/blog-post.liquid` | Pulls from `site.bio.canonical` automatically |

## Hard rules

- **The full canonical bio appears verbatim on `/`, `/about/`, `/press/`.** No paraphrasing. No rewording. Same words, same order.
- **Trademark spelling**: `The Creators' Attorney` (apostrophe after the s). Verify after every update.
- **Don't fragment the bio.** It's one paragraph. Splitting it across blocks weakens the entity-recognition signal.
- **Update both `bio.canonical` AND `bio.footer`** — the footer uses the short version.
- **Run `npm run dev`** after the edit and confirm the four surfaces above all show the new prose.

## Current canonical bio

```
Tyler Chou, known as The Creators' Attorney, is the founder and CEO of
Tyler Chou Law For Creators and CreatorArq M&A. A former entertainment
attorney with two decades at Disney, Skydance, Loeb & Loeb, and BuzzFeed,
she specializes in helping creators mature and exit their businesses.
```

## Current canonical footer bio (short)

```
Tyler Chou, known as The Creators' Attorney, founder of Tyler Chou Law
For Creators and CreatorArq M&A.
```
