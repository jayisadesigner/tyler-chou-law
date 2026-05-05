# Walkthrough: Add a creator to the roster

Use when a new client agrees to be listed on Tyler's roster.

**Time required**: ~5 minutes.

**Where it appears**: a card on `/roster/` AND a standalone page at `/roster/<handle>/`.

---

## Step 1 — Get the photo ready

Square format, minimum 800×800px. WebP, JPG, or AVIF. Save to a place you can upload from in step 4.

## Step 2 — Open CloudCannon

Sign in at [https://app.cloudcannon.com](https://app.cloudcannon.com).

## Step 3 — Open the Roster collection

Left sidebar → **Roster**. You'll see existing creators as cards.

## Step 4 — Click "+ Add Creator"

CloudCannon creates a new creator entry. The right-side panel shows form fields.

## Step 5 — Fill in the fields

| Field | What to enter |
|---|---|
| **Handle** | The creator's social handle, with the `@`. e.g. `@jennyhoyos`. |
| **Slug** | URL-friendly version, **without** the `@`. e.g. `jennyhoyos`. Lowercase, hyphens. Drives `/roster/<slug>/`. |
| **Photo** | Upload the square photo from step 1. Drag-and-drop or click to browse. |
| **Display order** | Lower numbers appear first in the grid. Featured creators get 1–10. Mid-tier 20–50. Use round numbers (10, 20, 30) so it's easy to reorder later. |
| **External URL** | Leave blank in most cases. If set, the roster card links to this URL instead of the creator's per-creator page. |
| **YouTube channel URL** | Linked from the per-creator page CTA. |
| **SEO description** | 140–160 characters. Used as the per-creator page meta description and in social previews. |
| **Stats** | Up to 4 stats (subscribers, total views, core demo, top region). Each stat has a value + label. |
| **Bio** | One array entry per paragraph. Tyler's framing of who the creator is, what they make, and what's at stake legally / in their business. |
| **Featured video IDs** | YouTube video IDs (the part after `watch?v=`). Embedded on the standalone creator page. |

## Step 6 — Save

Click **Save**. Netlify deploys in ~2 minutes.

## Step 7 — Verify

- `https://tylerchoulaw.com/roster/` — new card appears in the grid in the right order
- `https://tylerchoulaw.com/roster/<your-slug>/` — standalone page renders with the photo, stats, bio, and back-to-roster link

---

## What NOT to do

- ❌ Don't put the `@` in the slug. Slug is `jennyhoyos`, handle is `@jennyhoyos`.
- ❌ Don't skip the SEO description — it's the per-creator page's meta description and matters for both Google and AI tools.
- ❌ Don't use a non-square photo. The grid expects square; non-square photos crop badly.
- ❌ Don't repeat the same `order` number across creators — they'll display in unpredictable order.

---

## When a creator leaves the roster

Don't delete the entry — just set its `order` to a high number (`999`) and move on. If they ask to be fully removed, delete the YAML file from CloudCannon's UI. Their page (`/roster/<slug>/`) will return a 404 after the next deploy — set up a redirect via Netlify if any external links pointed at it.
