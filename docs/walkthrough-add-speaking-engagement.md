# Walkthrough: Add a speaking engagement

Use when Tyler is keynoting, on a panel, leading a workshop, or appearing at any conference / event.

**Time required**: ~3 minutes.

**Where it appears**: `/speaking/` page in the engagements grid.

---

## Step 1 — Get the photo ready

Use a real on-stage photo if available. If not, use the event's logo as a placeholder. Aspect ratio: square or landscape (1200×800 ideal). WebP, JPG, AVIF, or PNG.

## Step 2 — Open CloudCannon

Sign in at [https://app.cloudcannon.com](https://app.cloudcannon.com).

## Step 3 — Open the Speaking Engagements collection

Left sidebar → **Speaking Engagements**.

## Step 4 — Click "+ Add Speaking Engagement"

## Step 5 — Fill in the fields

| Field | What to enter |
|---|---|
| **Event** | Conference / event name. e.g. `SXSW`, `VidSummit`, `1 Billion Followers Summit`. |
| **Title** | The talk's actual title or session name. |
| **Date** | When the talk happens / happened. ISO format (CloudCannon's date picker handles this). |
| **Location** | "City, State/Country" format. e.g. `Austin, TX`, `Dubai, UAE`. |
| **Photo** | On-stage photo or event logo. Upload via the image input. |
| **Image alt** | **Required.** Pattern: "Tyler Chou speaking at \<event\> on \<topic\>" or "Tyler Chou speaking on stage at \<event\>, \<location\>". |
| **Summary** | 1–2 sentences. What was covered, who attended. |

## Step 6 — Save

Click **Save**. Netlify deploys in ~2 minutes.

## Step 7 — Verify

`https://tylerchoulaw.com/speaking/` — the new engagement should appear in the grid.

---

## When a future engagement gets confirmed

Add it as soon as it's confirmed — don't wait for the date. Future engagements still serve SEO and AI-visibility (especially when the event is high-prestige like SXSW or 1 Billion Followers Summit).

## After Tyler speaks

Take 2 minutes after the event to:

1. Update this entry with a real on-stage photo (replacing the logo if that's what you used).
2. Tighten the summary to reflect what actually happened.
3. If there's a recording / press piece from the event, also add it as a **Press Citation** with type "Speaking".

---

## What NOT to do

- ❌ Don't skip the alt text. The audit specifically called this out — every speaking image needs descriptive alt text.
- ❌ Don't use the event website URL as the photo. Upload an actual image.
- ❌ Don't combine multiple events into one entry, even if they're back-to-back. One event = one entry.
