# Launch Readiness Report

Generated against the Plan 1 §10 validator checklist after the Eleventy + Bookshop refactor. This is a snapshot of what's been verified locally and what still needs to run against the deployed staging environment before launch.

---

## Locally verified — passing

### Foundations

- [x] Build is reproducible: `npm run clean && npm run build` produces 32 files in <1s, 0 warnings
- [x] HTML structure: every page has exactly **1 H1**
- [x] Logical heading hierarchy: H1 → H2 → H3 used consistently (FAQ questions are H3 inside H2 sections)
- [x] Mobile-first responsive design (existing breakpoints at 768px, 1024px)
- [x] All asset paths resolve (no `/src/assets/` residue, no broken images)
- [x] Critical-path JS reduced from 171KB → 6KB (96% reduction) via esbuild code-splitting
- [x] GSAP / Lenis / ScrollTrigger lazy-loaded via dynamic `import()` after first paint
- [x] `font-display: swap` set on every `@font-face`

### Schema and entity signals

- [x] Person schema present on every page (graph format, includes `@id`, `sameAs`, `alumniOf`, `knowsAbout`)
- [x] Organization schema (CreatorArq M&A) present
- [x] LegalService schema (Tyler Chou Law For Creators) present, with address + areaServed
- [x] BreadcrumbList schema auto-generated on every interior page
- [x] FAQPage schema emitted by the FAQ component (verified on `/services/` and `/glossary/`)
- [x] Article / BlogPosting schema emitted on every Love Letter via `blog-post.liquid` layout

### Bio consistency

- [x] Canonical bio appears verbatim on `/`, `/about/`, `/press/`
- [x] Footer carries the short canonical bio
- [x] All surfaces sourced from `src/_data/site.json` `bio.canonical` and `bio.footer` — single edit propagates everywhere
- [x] Person schema `description` matches the canonical bio
- [x] llms.txt opens with the canonical bio

### Trademark and copy hygiene

- [x] Zero occurrences of singular "The Creator's Attorney" — all updated to plural "The Creators' Attorney"
- [x] CreatorArq metadata updated: title is "Creator Economy M&A Advisory", description describes M&A advisory, never "venture fund"
- [x] Duplicate paragraphs on `/creatorarq/` and `/about/` resolved (consolidated to a single paragraph element)
- [x] Hero "Where We've Shown Up" section renamed to "Speaking & Past Experience"
- [x] "As Featured In" section added to homepage (text-only placeholder until Tyler provides press logos)
- [x] Footer expanded: short bio + address + nav links + social icons + disclaimer + 2026 copyright
- [x] Image alt text upgraded site-wide; alt-text marked `required: true` in component schemas

### Crawlability

- [x] `robots.txt` at `/robots.txt` — generated from `src/_data/seo.yml` aiCrawlers list, allows GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-Web, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, CCBot, Applebot-Extended, Bytespider
- [x] `llms.txt` at `/llms.txt` — generated from `src/_data/nav.yml` `llms:` structure + `site.json` brand info
- [x] `sitemap.xml` at `/sitemap.xml` — auto-generated from `collections.all`, excludes noindex pages
- [x] All three regenerate on every build (data-driven Liquid templates, not static files)
- [x] Only intentionally private pages carry `noindex`: `/thank-you/`, `/case-studies/`, `/glossary/` (the latter two are reserved-slot stubs awaiting Tyler's content)

### Press page

- [x] Press page exists at `/press/`
- [x] Hero + canonical bio + filterable press grid (filters: All / Print / Podcast / Video / Speaking)
- [x] Press citations are data files (`src/content/press/*.md`); each renders with publication, title, date, summary, self-quote, link out, and Article schema via the `press-grid` component
- [x] "As Featured In" reference on homepage drives toward the Press page

### Content architecture

- [x] FAQ blocks templated and reusable; FAQ component auto-emits FAQPage schema
- [x] Internal linking sweep: footer + nav + canonical bio links across all key pages
- [x] Glossary slot reserved at `/glossary/` (stub; awaiting Tyler's term list)
- [x] Case Studies slot reserved at `/case-studies/` (stub; awaiting Tyler's anonymized stories)

### CMS handoff

- [x] CloudCannon visual editor configured for Bookshop components
- [x] Six collections set up: Pages, Blog (Love Letters), Roster, Press, Speaking, Site Data
- [x] CloudCannon schemas in `.cloudcannon/schemas/` provide default content for new items
- [x] Tyler-team handoff manual at `docs/cloudcannon-handoff.md`
- [x] Five task walkthroughs covering the most frequent operations
- [x] Dev cheat sheet at `docs/dev-cheat-sheet.md`

### Developer ergonomics

- [x] Cursor rules consolidated from 7 stale files to 4 focused files (architecture, components, content, style-and-quality)
- [x] 8 Cursor agent skills authored for recurring authoring tasks (add-page, add-service, add-press-citation, add-speaking-engagement, add-blog-post, add-roster-creator, add-bookshop-component, update-canonical-bio)

---

## Pending — needs deployed staging

These items can only be verified once the refactor branch is deployed to a Netlify staging URL or production. See `docs/launch-checklist.md` for the step-by-step.

- [ ] PageSpeed Insights mobile score ≥ 80 on every key page (homepage, about, services, creatorarq, press)
- [ ] Core Web Vitals all green (LCP < 2.5s, CLS < 0.1, INP < 200ms)
- [ ] Google Mobile-Friendly Test passes on every page
- [ ] HTML validates at `validator.w3.org` on every key page (no errors)
- [ ] Schema validates at `validator.schema.org` on every key page (no errors)
- [ ] Google Rich Results Test returns no errors on `/`, `/about/`, `/press/`, and a representative blog post
- [ ] Google Search Console — sitemap submitted, status "Success"
- [ ] No mixed-content warnings (browser console, every page)
- [ ] Lighthouse CI optional — set up post-launch for ongoing monitoring

---

## Pending — live AI baselines

To establish a starting point for tracking AI citation quality month-over-month:

- [ ] **ChatGPT**: "Who is The Creators' Attorney?" — answer quality + accuracy
- [ ] **ChatGPT**: "Who is the best lawyer for selling a YouTube channel?" — does Tyler get named?
- [ ] **Claude**: same two questions
- [ ] **Perplexity**: same two questions
- [ ] **Google AI Overviews**: same two questions
- [ ] Record results in a tracker (spreadsheet or Notion page) to monitor monthly

---

## Pending — Tyler-team onboarding

- [ ] Tyler accepts CloudCannon invite and completes a smoke test (edit one paragraph, save, verify deploy)
- [ ] Tyler's team members invited to CloudCannon
- [ ] Walkthrough docs reviewed by Tyler before sharing with team
- [ ] First press citation added by Tyler (not the developer) as live training
- [ ] First blog post published by Tyler in CloudCannon as live training
- [ ] Speaking-engagement photos uploaded once Tyler sends them this weekend (per audit response)
- [ ] Press logos uploaded once Tyler sends the curated list (Forbes, AdWeek, AdAge, Rolling Stone, Business Insider, Creator Science, Think Media, Publish Press)

---

## Material non-conformities — closed

Per ICSA Section 1.5, all audit Section 1 items have been resolved at no additional charge:

- [x] Trademark spelling sitewide ("The Creators' Attorney")
- [x] CreatorArq factual error (M&A advisory, not venture fund) — title, meta description, OG/Twitter, body copy
- [x] Duplicate paragraphs on `/creatorarq/` and `/about/`
- [x] Canonical bio applied verbatim across `/`, `/about/`, `/press/`, footer
- [x] "Where We've Shown Up" renamed to "Speaking & Past Experience"
- [x] "As Featured In" section added to homepage
- [x] Press page built at `/press/` with hero, canonical bio, filterable grid, schema
- [x] Image alt text upgraded site-wide
- [x] Footer expanded with bio, links, social, disclaimer, 2026 copyright
- [x] `robots.txt` confirmed and now includes every AI crawler
- [x] `sitemap.xml` confirmed (regenerates every build)
- [x] JSON-LD schema markup on every page (Person, Organization, LegalService, BreadcrumbList, FAQPage, Article)
- [x] CMS handoff (CloudCannon, with handoff docs)
- [x] Weekly check-ins resume per Section 1.4 (operational, not a code change)

---

## Branch + deploy plan

The refactor lives on `refactor/eleventy-bookshop-cloudcannon` (branched from `origin/main` at `a0a9052`). To merge:

1. Open a PR from `refactor/eleventy-bookshop-cloudcannon` → `main`
2. Netlify will auto-build a deploy preview at a random `*--tyler-chou-law.netlify.app` URL
3. Run the `docs/launch-checklist.md` against the deploy preview
4. Once green, merge → production deploy → run the live AI baselines
5. Monitor for 48 hours before considering the refactor stable
