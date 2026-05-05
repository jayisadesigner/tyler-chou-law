# CloudCannon Editor Handoff — Tyler Chou Law For Creators

**Audience**: Tyler and her team. Anyone who needs to update the site without touching code.

**TL;DR**: CloudCannon is a visual editor connected to this repo. Every page on `tylerchoulaw.com` can be edited from your browser — no installs, no terminal, no developer required. Changes save to GitHub, Netlify auto-deploys, and the live site updates within ~2 minutes.

---

## Quick start

1. Accept your CloudCannon invite (sent to the email on file).
2. Sign in at [https://app.cloudcannon.com](https://app.cloudcannon.com).
3. Open the **Tyler Chou Law For Creators** site.
4. Click any page in the left sidebar to open the visual editor.
5. Click any text or image to edit it. Click **Save** when you're done.

That's the whole loop. The rest of this document explains *what* lives where and *how* to do specific tasks well.

---

## What's where

The CMS is organized by **collection** — each collection is a different type of content.

| Collection | What it is | URL pattern |
|---|---|---|
| **Pages** | Marketing pages — homepage, About, Services, CreatorArq, Press, etc. | `/about/`, `/services/`, etc. |
| **Love Letters (Blog)** | Tyler's newsletter / blog posts | `/love-letters/<slug>/` |
| **Roster** | Client / creator profiles | `/roster/<slug>/` |
| **Press Citations** | Articles, podcasts, interviews where Tyler appears | Surfaced on `/press/` |
| **Speaking Engagements** | Conference talks, keynotes, panels | Surfaced on `/speaking/` |
| **Site Data** | Brand info, canonical bio, contact, social, navigation | Affects every page |

You'll see all six in the CloudCannon left sidebar when you open the site.

---

## The two ways pages are built

### 1. Block-based pages (most pages)

Pages like the homepage, About, Services, CreatorArq, Press, Speaking, Roster, Contact, etc. are built from **blocks**. A block is a section type — a hero, a content split, a logo grid, an FAQ. You can:

- **Drag blocks** in the visual editor to reorder them
- **Click a block** to edit its text, images, and links
- **Add a new block** by clicking the `+` button between blocks and picking from the component picker
- **Delete a block** by selecting it and pressing the trash icon

This is the same interface Squarespace uses — but every block was custom-designed for Tyler's brand.

### 2. Long-form posts (Love Letters)

Blog posts are written in a **rich-text editor** (like Notion or Google Docs). Markdown, links, headings, blockquotes, images. Frontmatter fields (title, date, description) are filled in via form fields on the side.

---

## Writing headlines (the `<br>` rule)

Most headline fields on this site (Hero, Content section, Featured image, FAQ, etc.) animate in line by line as the section comes into view. **You control where the line breaks happen, not the browser.**

Use `<br>` to indicate a line break. Examples:

- `Where<br>Creator<br>Empires Are Built` → renders as **three lines**, animates each one in turn.
- `Architecting the Empire.` → renders as **one line**, animates as a single reveal.
- `The Creators&apos; Attorney` → use `&apos;` for the apostrophe inside YAML strings to keep the trademark consistent.

A few tips:

- Don't add spaces around the `<br>`. `Where <br> Creator` and `Where<br>Creator` render the same — the system trims spaces — but the cleaner version is easier to read in CloudCannon.
- A trailing `<br>` is harmless (gets dropped automatically).
- Inline emphasis like `<em>` and `<strong>` works inside a line, e.g. `The <em>Creators&apos;</em> Attorney<br>at Work`.
- If the headline gets long enough that one of your lines wraps anyway, **add another `<br>` to force the break where you want it**. The animation will adapt.

If you ever see a headline laying out wrong (double-spaced, wrong break, something cut off), the fix is almost always tweaking the `<br>` placement in the headline field. No developer needed.

---

## Recurring tasks

For each common task there's a step-by-step walkthrough in this folder. Open whichever you need:

- **[Add a press citation →](walkthrough-add-press-citation.md)** when Tyler is quoted, interviewed, or featured anywhere
- **[Publish a Love Letter →](walkthrough-publish-love-letter.md)** for newsletter / blog publication
- **[Add a creator to the roster →](walkthrough-add-roster-creator.md)** for new clients
- **[Add a speaking engagement →](walkthrough-add-speaking-engagement.md)** for conference / panel additions
- **[Edit a marketing page →](walkthrough-edit-marketing-page.md)** for any visual edit on About, Services, CreatorArq, etc.

---

## How saving + publishing works

Every save in CloudCannon = a commit to GitHub = a Netlify deploy. The chain is:

```
Edit in CloudCannon → Save → GitHub commit → Netlify build (~2 min) → Live on tylerchoulaw.com
```

You don't need to do anything beyond saving. CloudCannon shows the deploy status in the top bar.

If something looks wrong on the live site, the most common cause is **the build is still in progress**. Wait 2–3 minutes and refresh.

---

## Save vs. publish (the safety net)

CloudCannon has two modes for working:

- **Save** — your changes commit and deploy immediately to the live site.
- **Branch / pull request** (advanced) — your changes go on a branch and you can preview them before merging.

For the first month, **always Save** unless you specifically want to preview before going live. The site has been built defensively — the worst-case scenario from a bad save is a 2-minute fix and re-save.

---

## What you should NOT edit (call your developer)

The following live in code, not the CMS — they need a developer touch:

- **Visual design changes** (fonts, colors, spacing, animation, layout)
- **New section types** (a brand-new component that doesn't exist yet)
- **Site-wide structural changes** (rearranging the navigation menus)
- **Anything in `cloudcannon.config.yml`, `.eleventy.js`, `package.json`** — these are the editor's plumbing
- **`src/styles/`, `src/scripts/`, `component-library/`** — these are the engine

If you're not sure, ask. The "[what dev needs to touch →](dev-cheat-sheet.md)" cheat sheet lists every code area and who owns it.

---

## When something breaks

1. **Live site is broken**: log in to Netlify (you'll have invited access). Look at the latest deploy. If it failed, click "Retry" first. If retry fails, revert to the previous deploy from the Netlify UI (one click). Then call your developer.
2. **CloudCannon shows an error on save**: take a screenshot and paste it into the developer's email — most CMS errors are recoverable from CloudCannon's UI.
3. **You can't find a field that should be there**: the field may live in a different collection (e.g. you're trying to edit the bio from the homepage but it's actually in **Site Data → Site**). Check that collection.
4. **An image is broken**: the file probably wasn't uploaded. Open the image input in CloudCannon and pick / upload again.

---

## Roles

CloudCannon supports multiple editors. The setup includes:

- **Tyler** — full access
- **Tyler's team members** — full access (request invites from your developer)
- **Developer** — admin access for plumbing, design changes, deploy diagnostics

If a team member leaves, ask the developer to revoke their invite.

---

## Glossary

| Term | What it means |
|---|---|
| **Block** | A section of a page (hero, content split, FAQ, etc.). |
| **Component** | The technical name for a block type. ~20 exist in `component-library/`. |
| **Collection** | A type of content (pages, blog, roster, press, speaking, data). |
| **Frontmatter** | The YAML at the top of a content file — title, date, description, etc. CloudCannon shows it as form fields. |
| **Permalink** | The URL the page lives at. Set by `slug` (for blog/roster) or `permalink` (for pages). |
| **Slug** | The URL-friendly version of a name. `5-brand-deal-mistakes`, not `5 Brand Deal Mistakes!`. |
| **Schema / JSON-LD** | The invisible data that tells Google and ChatGPT what each page is about. Auto-generated — you never touch it directly. |
| **Canonical bio** | The one paragraph describing Tyler that appears identically on the homepage, About, Press, and footer. Edited in **Site Data → Site → bio**. |

---

## Getting more help

- **CloudCannon docs**: [https://cloudcannon.com/documentation/](https://cloudcannon.com/documentation/)
- **The walkthroughs in this folder** cover the 5 most frequent tasks
- **[dev-cheat-sheet.md](dev-cheat-sheet.md)** lists what still requires a developer
- **Your developer** — for anything else
