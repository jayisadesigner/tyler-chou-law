# Walkthrough: Publish a Love Letter (blog post)

Use when Tyler has a new newsletter / blog post ready to publish.

**Time required**: ~5 minutes (assuming the prose is already drafted).

**Where it appears**: `/love-letters/<slug>/`, on the `/love-letters/` index, and in the homepage YouTube/blog section if pulled in.

---

## Step 1 — Open CloudCannon

Sign in at [https://app.cloudcannon.com](https://app.cloudcannon.com), open the Tyler Chou Law site.

## Step 2 — Open the Love Letters collection

Left sidebar → **Love Letters (Blog)**. You'll see all existing posts.

## Step 3 — Click "+ Add Love Letter"

CloudCannon creates a new post pre-filled with the template. The body opens in a rich-text editor; the right-side panel shows form fields for metadata.

## Step 4 — Fill in the metadata fields

| Field | What to enter |
|---|---|
| **Title** | The actual headline. Aim for 50–60 characters — front-load the keyword. |
| **Slug** | URL-friendly version. Lowercase, hyphenated, no special characters. e.g. `5-brand-deal-mistakes-creators-avoid`. |
| **Date** | Publish date. Drives sort order on the listings page. |
| **Description** | 1–2 sentence summary used in listings, social previews, and Google search results. Aim for 140–155 characters. |
| **Author** | Defaults to "Tyler Chou". Override only when a guest authors. |
| **Reading time** | Estimated minutes (word count ÷ 200). |
| **Featured image** | Hero image at the top of the post. Optional but recommended. |
| **Image alt** | **Required when image is provided.** Describe what's in the image — used by screen readers and SEO. |

## Step 5 — Write the body

The rich-text editor supports:

- **Bold**, *italic*, headings (H2 / H3), lists, blockquotes, links
- Inline images via paste or upload
- Code blocks if you ever quote contract language

Internal-link aggressively. The first time the post mentions "The Creators' Attorney", "CreatorArq", "Tier 1", "Exit Roadmap", or "Tenant vs Landlord", make it a link to the relevant page (`/about/`, `/creatorarq/`, `/glossary/`, etc.). This is what helps Google and AI tools build your knowledge graph.

## Step 6 — Save

Click **Save**. Netlify deploys in ~2 minutes.

## Step 7 — Verify

After the deploy:

- `https://tylerchoulaw.com/love-letters/<your-slug>/` — the post itself
- `https://tylerchoulaw.com/love-letters/` — the post should appear at the top of the listings (sorted by date)
- The author bio at the bottom auto-renders the canonical bio. Don't add an author paragraph manually.

---

## SEO checklist before publishing

- [ ] Title is 50–60 characters
- [ ] Description is 140–155 characters
- [ ] Slug is short, lowercase, hyphenated
- [ ] First mention of "The Creators' Attorney" is a link to `/about/`
- [ ] First mention of "CreatorArq" is a link to `/creatorarq/`
- [ ] At least one link to a services page (`/services/`)
- [ ] At least one link to another blog post
- [ ] Featured image has alt text
- [ ] Final paragraph drives toward a CTA (consultation, Exit Roadmap, etc.)

---

## What NOT to do

- ❌ Don't include "The Creator's Attorney" (singular) — the trademark is plural possessive: "The Creators' Attorney" (apostrophe **after** the s).
- ❌ Don't paste images from another site — upload them directly so they live on your domain.
- ❌ Don't add an "About the Author" section by hand — the layout adds the canonical bio automatically.
- ❌ Don't use ALL CAPS for emphasis. Use **bold**.

---

## After publishing

- Send the URL to the email list
- Drop the URL in any Forbes contributor article that references it
- Tweet / LinkedIn-post the URL
- Add the URL to YouTube video descriptions where relevant

This is what compounds — Google and AI tools see the post being linked from your owned platforms, which strengthens its ranking and citation likelihood.
