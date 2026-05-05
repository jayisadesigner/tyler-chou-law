# Walkthrough: Add a client (creator) to the Clients page

Use when a new client agrees to be listed on Tyler's Clients page.

**Time required**: ~5 minutes.

**Where it appears**: a card on `/clients/` AND a standalone page at `/clients/<handle>/`.

---

## Step 1 — Get the photo ready

Square format, minimum 800×800px. WebP, JPG, or AVIF. Save to a place you can upload from in step 4.

## Step 2 — Open CloudCannon

Sign in at [https://app.cloudcannon.com](https://app.cloudcannon.com).

## Step 3 — Open the Clients collection

Left sidebar → **Clients**. You'll see existing clients as cards.

## Step 4 — Click "+ Add Client"

CloudCannon creates a new client entry. The right-side panel shows form fields.

## Step 5 — Fill in the fields

| Field | What to enter |
|---|---|
| **Handle** | The creator's social handle, with the `@`. e.g. `@jennyhoyos`. |
| **Slug** | URL-friendly version, **without** the `@`. e.g. `jennyhoyos`. Lowercase, hyphens. Drives `/clients/<slug>/`. |
| **Photo** | Upload the square photo from step 1. Drag-and-drop or click to browse. |
| **Display order** | Lower numbers appear first in the grid. Featured clients get 1–10. Mid-tier 20–50. Use round numbers (10, 20, 30) so it's easy to reorder later. |
| **External URL** | Leave blank in most cases. If set, the client card links to this URL instead of the creator's per-client page. |
| **YouTube channel URL** | Linked from the per-client page CTA. |
| **SEO description** | 140–160 characters. Used as the per-client page meta description and in social previews. |
| **Stats** | Up to 4 stats (subscribers, total views, core demo, top region). Each stat has a value + label. |
| **Bio** | One array entry per paragraph. Tyler's framing of who the creator is, what they make, and what's at stake legally / in their business. |
| **Featured video IDs** | YouTube video IDs (the part after `watch?v=`). Embedded on the standalone client page. |

## Step 6 — Save

Click **Save**. Netlify deploys in ~2 minutes.

## Step 7 — Verify

- `https://tylerchoulaw.com/clients/` — new card appears in the grid in the right order
- `https://tylerchoulaw.com/clients/<your-slug>/` — standalone page renders with the photo, stats, bio, and back-to-clients link

---

## What NOT to do

- ❌ Don't put the `@` in the slug. Slug is `jennyhoyos`, handle is `@jennyhoyos`.
- ❌ Don't skip the SEO description — it's the per-client page's meta description and matters for both Google and AI tools.
- ❌ Don't use a non-square photo. The grid expects square; non-square photos crop badly.
- ❌ Don't repeat the same `order` number across clients — they'll display in unpredictable order.

---

## When a client is no longer represented

Don't delete the entry — just set its `order` to a high number (`999`) and move on. If they ask to be fully removed, delete the YAML file from CloudCannon's UI. Their page (`/clients/<slug>/`) will return a 404 after the next deploy — set up a redirect via Netlify if any external links pointed at it.

---

## Note on the old `/roster/` URL

Prior to May 2026, this page was named "Roster". The URL `/roster/` (and per-creator `/roster/<slug>/` URLs) now serve a 301 permanent redirect to the new `/clients/` URLs. Any old bookmarks, press citations, email signatures, or external links continue to work — visitors land on the right page automatically.
