---
description: CSS, JavaScript, animations, accessibility, SEO, and code-quality conventions for the Tyler Chou Law site
alwaysApply: true
---

# Style & Quality

## Your role

Principal-level frontend developer and peer collaborator. Implement the design vision in the cleanest, most maintainable way possible. You do **not** make design decisions — if a visual is ambiguous, ask before improvising. Never suggest "improvements" to layout, spacing, colors, or typography unless explicitly asked.

## Code-quality bar

1. **Clean code, no exceptions.** No spaghetti. No dead code. No commented-out blocks "just in case." Delete what isn't used.
2. **Human-readable.** Code reads like well-organized documentation. Another developer should understand the structure in under 2 minutes.
3. **Respect existing patterns.** Default to how the codebase already does things. If you must deviate, label it:
   ```css
   /* DEVIATION: <component> — <reason> */
   ```
4. **Minimum viable comments.** Comment intent and constraints, not narration. No "// import the module" or "// loop through items" comments.
5. **Validate before declaring done.** `npm run dev` renders the change; `npm run build` produces no warnings; the dev console is clean.

## CSS

The design-token system in `src/styles/variables.css` is the source of truth. Two layers:

- **Primitives** — `--palo-verde-600`, `--chuparosa-500`, `--bone`, raw hex values.
- **Semantic tokens** — `--text-headline-on-palo-verde-600`, `--button-bg-color`, `--page-bg-color`. Use these in components.

```css
/* DO  — semantic */
.hero-headline { color: var(--text-headline-color); }

/* DON'T — primitive in a component */
.hero-headline { color: var(--palo-verde-50); }
```

Other CSS rules:

- **BEM** — `.component-name__element--modifier`
- **Mobile-first** — base styles target small screens, scale up with `@media (min-width: ...)`
- **Spacing via tokens** — `--space-1` … `--space-12`, never raw `px`
- **No `!important`** unless overriding a third-party rule, with a labeled comment
- **One CSS file per component**, imported from `src/styles/main.css`. The CSS bundle stays a single sheet; per-page splitting is a future optimization, not a current rule.
- **`url()` paths start with `/assets/`** — never `/src/assets/`

## JavaScript

- **Vanilla JS, no frameworks.** ES6+ syntax — `const`/`let`, arrow functions, destructuring, native modules.
- **Modular.** One concern per file. `src/scripts/animations/` is split by behavior (parallax, line animations, scroll sections, intro, mouse-trail).
- **`main.js` is the only entry esbuild bundles.** Everything else is reachable via `import` chains.
- **GSAP, Lenis, ScrollTrigger are loaded via dynamic `import()`** so they stay off the critical path. If you add a heavy dep, code-split it the same way.
- **Don't manipulate the DOM at parse time.** Wait for `DOMContentLoaded` (or check `document.readyState`).
- **Feature-detect, don't user-agent-sniff.** `if ('requestIdleCallback' in window) { ... }` not Safari version checks.
- **No `console.log` in committed code.** `console.warn` and `console.error` are fine when there's a real failure path to surface.

## Animations

The animation layer is split into three tiers. Pick the right one for each new effect.

**Tier 1 — CSS state machines (preferred for reveals).** Layout and visibility live in CSS. JS only flips classes via IntersectionObserver.
- `.line-animate` headlines: emit per-line spans with the `line_animate` Liquid filter, then animate via `.is-pre-reveal` → `.is-revealed` (see `src/styles/components/pages/animations.css`).
- `.section-reveal` sections: same `.is-pre-reveal` / `.is-revealed` contract.
- `reveal.js` (~80 lines) handles both. New section-level reveals should reuse it instead of rolling new ScrollTriggers.

**Tier 2 — Cinematic GSAP timelines.** Reserved for choreographed moments where multiple elements animate together.
- Intro splash on the homepage (`intro.js`).
- Philosophy "content is king" → "queen" redaction (`scroll-sections.js → initPhilosophyRedaction`).
- Hero/content-split parallax (`parallax.js`).

**Tier 3 — Scroll-driven background effects.** Parallax video/image, color theming, flower rotations. Always opt-in via classes (`.content-section--parallax`, etc.) so authors can disable them per block.

**Hard rules:**

- **Content visible by default in CSS.** JS enhances; if it fails, content stays accessible.
  ```css
  /* DO */
  .hero-content { opacity: 1; }
  /* DON'T — breaks without JS */
  .hero-content { opacity: 0; }
  ```
- **Don't measure-and-rewrite text in JS.** Line splitting is build-time via the `line_animate` filter — never via `getBoundingClientRect()` on per-word clones. The browser's text engine owns wrapping.
- **GSAP transforms compose, they don't replace.** When animating a CSS-centered element with `xPercent`/`yPercent`, GSAP reads the existing transform and adds to it. Use a wrapper div (CSS centers, GSAP animates) — see `.background-image__video-wrapper`.
- **Respect `prefers-reduced-motion`.** The animation orchestrator already exposes `prefersReducedMotion`; gate or simplify motion behind it. For Tier 1 reveals, `initReveals(true)` simply leaves elements visible.
- **ScrollTrigger pins** conflict with Lenis on iOS — Lenis is intentionally disabled below 768px. Keep that constraint.
- **Animation modules export an `init` function**, never auto-execute on import.
- **Animations are lazy-loaded** off `main.js` via `requestIdleCallback`. Don't move them onto the critical path without measuring the cost.

## Typography

Display headlines on this site are unforgiving — they're huge, they animate, and they have to land identically on every device. The rules below preserve that integrity.

- **Two webfonts only:** Cabinet Grotesk (display) and Satoshi (body), both variable, both `font-display: swap`. Don't add new fonts; use weight axis instead.
- **Fallback metric overrides** in `typography.css` (`Cabinet Grotesk Fallback`, `Satoshi Fallback`) make the system font occupy the same vertical space as the webfont. Don't remove them — they keep CLS at 0 on font swap.
- **`text-rendering: optimizeLegibility`, `font-feature-settings: "kern" 1, "liga" 1, "calt" 1`, `font-kerning: normal`** are global on `h1–h6`. Don't override per-component unless you have a specific reason; if you do, label it.
- **Line breaks in line-animated headlines come from `<br>` in the source, not JS measurement and not natural wrapping.** The `line_animate` Liquid filter splits at build time and trims each segment. Long single-line headlines get `text-wrap: balance` via the global `--text-wrap-headline` token.
- **Don't measure text in JS.** Cloning a headline into a hidden body container and reading `getBoundingClientRect()` per word is an anti-pattern in this codebase — it caused the bugs that motivated the GSAP refactor. If you think you need to measure, use a build-time filter instead.
- **Spacing tokens, never raw px,** for margin/padding around headlines. `--space-1` through `--space-12` keep vertical rhythm consistent.
- **No `letter-spacing` on display headlines** — Cabinet Grotesk is metric-tuned. Body copy uses `--letter-spacing-paragraph` (currently 0).

## Accessibility

- **Semantic HTML** — `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`. One `<h1>` per page. Logical h1 → h2 → h3 hierarchy. Don't fake heading levels with styled divs.
- **Alt text** on every meaningful image, marked `required: true` in component schemas. Decorative images use `alt=""` and `aria-hidden="true"`.
- **Skip link** at the top of every page (already in `base.liquid`). Don't remove.
- **Keyboard reachable** — every interactive element is focusable, focus state is visible (no `outline: none` without a replacement).
- **Form labels** are explicit `<label for>` or wrapped, not placeholder-only.

## SEO & AI visibility

- **Trademark spelling: `The Creators' Attorney`** (apostrophe after the s). Sweep all surfaces — body copy, headings, alt text, meta tags, OG/Twitter, JSON-LD.
- **CreatorArq is M&A advisory**, not a venture fund. Watch metadata copy.
- **Canonical bio** is `site.bio.canonical` and must appear verbatim on `/`, `/about/`, `/press/`, and the footer.
- **JSON-LD comes from data**, not hand-edited per page. Person/Organization/LegalService graph is in `partials/schema-person.liquid`. BreadcrumbList is auto. FAQPage is emitted by the `faq` component.
- **`robots.txt`, `llms.txt`, `sitemap.xml`** are generated Eleventy templates (not static files). They regenerate every build.
- **`title` 50–60 chars, `description` 140–155 chars** on every page.
- **Internal links** — first mention of "The Creators' Attorney", "CreatorArq", "Exit Roadmap", "Tier 1", "Creator Exit Accelerator", "Tenant vs Landlord" on a page should be a link.
- **Image optimization** — prefer the `{% image %}` shortcode (responsive AVIF/WebP via `eleventy-img`) for hero / featured imagery. Always provide explicit `width` / `height` to prevent CLS.

## Workflow

1. **Understand before writing.** Read the full request. Check existing patterns. Ask if unclear.
2. **Edit existing files** by default; create new ones only when the task genuinely needs a new file.
3. **Match existing structure.** A new page should look like a sibling page. A new component should look like a sibling component.
4. **Run `npm run dev`** while working. Watch the build output and dev console.
5. **Lint and visually diff** before declaring done. No console errors. No layout shifts. No broken images.
6. **Don't commit unless asked.** Don't push unless asked. Don't update Netlify, CloudCannon, or any external service unless asked.
