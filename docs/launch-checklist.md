# Pre-Launch Checklist

Run every item below against the Netlify deploy preview (or staging URL) before merging the refactor branch to production. Each item has a free verification tool linked.

Substitute `STAGING_URL` for whatever Netlify assigns the deploy preview — typically `https://<sha>--tyler-chou-law.netlify.app`.

---

## Core Web Vitals

Run [PageSpeed Insights](https://pagespeed.web.dev/) on each URL. Mobile score must be ≥ 80.

- [ ] `STAGING_URL/` — Mobile ___ / Desktop ___
- [ ] `STAGING_URL/about/` — Mobile ___ / Desktop ___
- [ ] `STAGING_URL/services/` — Mobile ___ / Desktop ___
- [ ] `STAGING_URL/creatorarq/` — Mobile ___ / Desktop ___
- [ ] `STAGING_URL/press/` — Mobile ___ / Desktop ___
- [ ] `STAGING_URL/speaking/` — Mobile ___ / Desktop ___
- [ ] `STAGING_URL/roster/` — Mobile ___ / Desktop ___
- [ ] `STAGING_URL/love-letters/` — Mobile ___ / Desktop ___
- [ ] One representative blog post — Mobile ___ / Desktop ___

Targets: LCP < 2.5s, CLS < 0.1, INP < 200ms.

---

## Mobile usability

- [ ] [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly) — homepage passes
- [ ] [Bing Mobile Test](https://www.mobile-friendly-test.com) — homepage passes
- [ ] iPhone Safari — visual sweep of `/`, `/about/`, `/services/`, `/creatorarq/`, `/press/`
- [ ] Android Chrome — visual sweep of same pages
- [ ] Browser dev tools — no console errors at any breakpoint

---

## HTML validity

[validator.w3.org](https://validator.w3.org/)

- [ ] `STAGING_URL/` validates with no errors
- [ ] `STAGING_URL/about/` validates with no errors
- [ ] `STAGING_URL/press/` validates with no errors
- [ ] One representative blog post validates with no errors

---

## Schema validity

[validator.schema.org](https://validator.schema.org/) and [Google Rich Results Test](https://search.google.com/test/rich-results)

- [ ] Person schema on `/` — no errors
- [ ] LegalService schema on `/` — no errors
- [ ] Organization (CreatorArq) schema on `/creatorarq/` — no errors
- [ ] BreadcrumbList schema on every interior page — no errors
- [ ] FAQPage schema on `/services/` — no errors
- [ ] BlogPosting schema on a representative `/love-letters/<slug>/` — no errors
- [ ] Google Rich Results Test returns "page is eligible for rich results" on `/`, `/about/`, `/press/`

---

## Crawlability

- [ ] `STAGING_URL/robots.txt` — loads, includes every AI crawler (GPTBot, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, CCBot, Applebot-Extended, Bytespider, etc.)
- [ ] `STAGING_URL/llms.txt` — loads, opens with the canonical bio
- [ ] `STAGING_URL/sitemap.xml` — loads, lists every public page, omits noindex pages
- [ ] No mixed-content warnings in browser console on any page
- [ ] No `noindex` tag on any public-facing page (only `/thank-you/`, `/glossary/`, `/case-studies/` should carry it; the latter two are reserved-slot stubs)

---

## Google Search Console

(Production deploy only — submit after merge to main.)

- [ ] Site verified under Tyler's account
- [ ] `sitemap.xml` submitted, status shows "Success"
- [ ] Coverage report shows no critical errors after first crawl

---

## Internal linking

- [ ] Every services page links to at least 2 sibling services
- [ ] Every blog post links to at least 1 services page and 1 other blog post
- [ ] Footer links to: About, Services, CreatorArq, Press, Speaking, Love Letters, Contact
- [ ] First mention of "The Creators' Attorney", "CreatorArq", "Tier 1", "Exit Roadmap" on each page is a hyperlink

---

## Live AI tests (baseline)

These establish a starting point. Re-run monthly to track movement.

For each tool, run:

1. "Who is The Creators' Attorney?"
2. "Who is the best lawyer for selling a YouTube channel?"
3. "What law firm does YouTuber [a roster creator] work with?"

Tools:

- [ ] **ChatGPT** — record verbatim answer + whether Tyler is named + how she's described
- [ ] **Claude** — same
- [ ] **Perplexity** — same (also note which sources are cited)
- [ ] **Google AI Overviews** (search the questions on Google) — same
- [ ] **Bing Copilot** — same

Track results in a single Google Sheet or Notion page so month-over-month change is obvious.

---

## CloudCannon smoke test (with Tyler)

- [ ] Tyler signs in to CloudCannon
- [ ] Tyler edits one paragraph on the About page, saves, watches the deploy complete (~2 min)
- [ ] Tyler refreshes the live site and sees the change
- [ ] Tyler adds a press citation following `docs/walkthrough-add-press-citation.md`
- [ ] Tyler creates a draft Love Letter following `docs/walkthrough-publish-love-letter.md`
- [ ] Tyler invites a team member to CloudCannon

---

## Final pre-merge sign-off

- [ ] Every Core Web Vitals row above has Mobile ≥ 80
- [ ] No HTML or schema validation errors on any page
- [ ] All AI baselines recorded
- [ ] Tyler has completed the smoke test
- [ ] No regressions vs. the current production site (visual diff of every page)
- [ ] On-call ownership clarified — who responds if a deploy breaks

---

## Post-launch — first 48 hours

- [ ] Monitor Netlify deploy log for any build failures
- [ ] Monitor Google Search Console for crawl errors
- [ ] Monitor Sentry / browser console reports (if configured)
- [ ] Re-run PageSpeed on `/` and `/services/` daily to catch regressions
- [ ] Confirm `robots.txt`, `llms.txt`, `sitemap.xml` are still serving correctly

---

## Post-launch — first week

- [ ] Re-run the AI baseline questions and compare to pre-launch
- [ ] Submit the `sitemap.xml` for re-crawl in Google Search Console
- [ ] Verify Google has indexed the new pages (`site:tylerchoulaw.com` search)
- [ ] Add Lighthouse CI to GitHub Actions if regressions warrant ongoing monitoring
