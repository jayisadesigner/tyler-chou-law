# Walkthrough: Add a press citation

Use when Tyler is quoted, interviewed, or featured in any publication, podcast, video, or speaking event.

**Time required**: ~3 minutes.

**Where it appears**: `/press/` page, in the appropriate filter tab (Print / Podcast / Video / Speaking).

---

## Step 1 — Open CloudCannon

Sign in at [https://app.cloudcannon.com](https://app.cloudcannon.com), open the Tyler Chou Law site.

## Step 2 — Open the Press collection

In the left sidebar, click **Press Citations**. You'll see all existing citations as a list.

## Step 3 — Click "+ Add Press Citation"

CloudCannon will create a new citation pre-filled with placeholder text from the schema template. The right-side panel shows form fields.

## Step 4 — Fill in the fields

| Field | What to enter |
|---|---|
| **Publication** | Spelled exactly as the masthead spells it. "Forbes", not "FORBES". |
| **Title** | The article's actual title (drives Google ranking). |
| **URL** | Direct permanent link to the original. Not a tracking URL. |
| **Date** | The original publish date, ISO format (CloudCannon's date picker handles this). |
| **Type** | **Print** for articles, **Podcast** for audio, **Video** for video, **Speaking** for conference talks. Drives the filter tabs on `/press/`. |
| **Logo** | Upload the publication's logo (~200×80px, transparent PNG ideal). If you've already uploaded it for another citation, just pick from existing uploads. |
| **Summary** | **2–3 sentences in Tyler's words.** What's the piece about and why does it matter? **Don't paraphrase the article body** — that's copyright infringement. Describe Tyler's framing instead. |
| **Self-quote** | One sentence Tyler said in the piece. If she wasn't quoted, leave blank. |

## Step 5 — Save

Click **Save** in the top right. CloudCannon commits the change. Netlify deploys in ~2 minutes.

## Step 6 — Verify

Visit `https://tylerchoulaw.com/press/` after the deploy completes. The new citation should appear:

- In the **All** tab
- In the tab matching its **Type** (Print / Podcast / Video / Speaking)
- Sorted by date, newest first

---

## Why this format?

Each press citation auto-generates **Article schema** — invisible structured data that tells Google, ChatGPT, Claude, and Perplexity that this is a citation. The summary you write is what AI tools see when they index the page. **The summary is the most valuable text you'll write here** — it's how AI tools learn what each piece is about without paywalling the original.

---

## What NOT to do

- ❌ Don't paste the article's full text. Copyright belongs to the publication.
- ❌ Don't skip the summary. Without it the citation is much weaker for AI search.
- ❌ Don't use "FORBES" or all-caps publication names.
- ❌ Don't link to a paywalled tracker URL — use the canonical article URL.

---

## Examples of strong summaries

**Forbes — "Why creators are looking for exits in 2026"**
> Tyler walks through the new wave of creator-business exits — what's driving them, what makes a creator-led business actually salable, and where most owners get tripped up by IP cleanup. Key piece for any creator wondering whether they've built something a buyer would actually want.

**AdWeek — "On Background newsletter Q&A with Tyler Chou"**
> Mark Stenberg's interview with Tyler on the legal frontier of brand deals. Covers the contractual landmines creators routinely sign without seeing — exclusivity, IP assignment, indemnification — and how to negotiate them.

Each is 2 sentences, in Tyler's voice, and contains keywords AI tools index against ("creator-business exits", "IP cleanup", "brand deals", "exclusivity", "IP assignment").
