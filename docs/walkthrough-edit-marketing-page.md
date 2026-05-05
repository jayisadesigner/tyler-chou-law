# Walkthrough: Edit a marketing page

Use to update copy, images, CTAs, or section ordering on any page (Home, About, Services, CreatorArq, Press, Speaking, Roster, Contact, etc.).

**Time required**: 1–10 minutes depending on scope.

---

## Step 1 — Open CloudCannon

Sign in at [https://app.cloudcannon.com](https://app.cloudcannon.com), open the Tyler Chou Law site.

## Step 2 — Open the Pages collection

Left sidebar → **Pages**. You'll see all marketing pages.

## Step 3 — Click the page you want to edit

CloudCannon opens the **visual editor** — a live preview of the page on the left, form fields on the right.

## Step 4 — Edit text and images directly

- **Click any headline or paragraph** in the preview to edit it inline.
- **Click any image** to swap it (upload new or pick from existing uploads).
- **Click any CTA button** to update its label or URL.

This is the same gesture as Squarespace, just attached to your custom design.

## Step 5 — Add, remove, or reorder sections

Each page is a stack of **blocks** (sections). To change them:

- **Add a block**: click the `+` button between two existing blocks. CloudCannon shows a picker with all available block types (hero, content split, FAQ, logo grid, CTA, etc.). Pick one and CloudCannon inserts it.
- **Remove a block**: select the block, click the trash icon.
- **Reorder a block**: drag it up or down.
- **Edit a block's settings**: click it, then use the form fields on the right (variants, layout, links, etc.).

## Step 6 — Edit page metadata

The right-side panel has a **Page Settings** section with:

- **Title** — the browser tab title and Google search heading. 50–60 characters.
- **Description** — meta description for search engines and social. 140–155 characters.
- **OG Image** — social-share preview image.
- **Robots** — leave blank for normal indexing. Set to `noindex, follow` to hide the page from search engines.

## Step 7 — Save

Click **Save**. Netlify deploys in ~2 minutes.

## Step 8 — Verify

Open the page on `https://tylerchoulaw.com` after the deploy. Spot-check the change.

---

## Block types — quick reference

The block picker shows ~20 component types. Here's what each does at a glance:

| Block | Use when… |
|---|---|
| **Hero** | Top of any page — big headline, optional video / image background. |
| **Content Section** | Single column of headline + paragraphs + optional CTA. |
| **Content Split** | Two columns: copy on one side, image / video on the other. |
| **Featured Image** | Editorial-style section with a dominant image and rich body copy. |
| **Capabilities Grid** | Grid of (title + description) cells — what's included in a service. |
| **Services Grid** | Grid of service cards (3-up). |
| **Roster Grid** | Grid of creator cards. Pulls from the Roster collection automatically. |
| **Roster Lists** | Grouped lists of clients with a media image. |
| **Logo Grid** | Brand / publication / partner logos in a grid. |
| **Testimonials** | Two-row carousel of love-note cards. |
| **YouTube Grid** | Grid of YouTube thumbnails. |
| **Press Grid** | Filterable grid of press citations. Pulls from the Press collection. |
| **Speaking Grid** | Grid of speaking engagements. Pulls from the Speaking collection. |
| **Blog Listing** | Grid of love-letter cards. Pulls from the Blog collection. |
| **FAQ** | Accordion of question / answer pairs. Auto-generates FAQPage schema. |
| **Mouse Trail CTA** | Closing CTA with a fun mouse-trail effect. |
| **CTA** | Standalone styled button. |
| **Contact Form** | Lead form with social links. |
| **Thank You Panel** | Post-form thank-you message. |
| **Philosophy** | Three-line manifesto with optional redaction effect. |
| **Intro** | Homepage video splash with the name and subtitle. |

If you want a section that doesn't exist yet, that's a developer task — see [dev-cheat-sheet.md](dev-cheat-sheet.md).

---

## Editing the canonical bio

The canonical bio (the paragraph describing Tyler that appears on `/`, `/about/`, `/press/`, and the footer) is **not edited per page**. Edit it once in:

**Site Data → Site → bio → canonical** (full paragraph)
**Site Data → Site → bio → footer** (one-sentence short version)

Saving propagates the change everywhere.

---

## Editing brand info, contact, social links

All of this lives in **Site Data → Site**. Edit once, propagates to:
- Footer
- JSON-LD schema (for Google + AI tools)
- llms.txt (for AI tools)
- Author bios on every blog post

---

## Editing navigation menus

**Site Data → Nav** lets you edit:

- **Primary** — the top header menu (split into left + right groups)
- **Footer** — the footer link list
- **LLMs** — the structured site map sent to AI tools (llms.txt)

Adding a new page to the nav is two steps: create the page (or use an existing one), then add an entry to the relevant menu list.

---

## What NOT to do

- ❌ Don't paste prose with the wrong trademark spelling. It's "The Creators' Attorney" (apostrophe **after** the s), never "The Creator's Attorney".
- ❌ Don't describe CreatorArq as a "venture fund" or "investment" — it's M&A advisory.
- ❌ Don't paste images from Google Images. Upload owned or licensed images.
- ❌ Don't manually paste the canonical bio into a page body — pull it from data so it stays in sync everywhere.
