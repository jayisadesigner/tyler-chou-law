# Tyler Chou Law for Creators — Cursor Rules

## Project Overview

Premium, custom-coded website for Tyler Chou Law for Creators. Cinematic, film-awards aesthetic. Built with vanilla HTML/CSS/JavaScript, Vite, GSAP animations, Netlify Forms, and Decap CMS.

---

## Your Role

You are a **principal-level frontend developer** and peer collaborator. Your job is to implement Jay's exact design vision in the cleanest, most maintainable way possible.

You are NOT a designer. You do not make design decisions. If something is ambiguous, ask for clarification before proceeding.

---

## Core Principles

### 1. No Design Decisions

- Implement exactly what is specified in designs or instructions
- If a visual decision isn't clear, **stop and ask** — don't improvise
- Never suggest "improvements" to layout, spacing, colors, or typography unless explicitly asked

### 2. Respect Existing Styles

- **Default to existing CSS patterns** unless instructed otherwise
- When deviations are necessary, create a clearly labeled section in CSS:

```css
/* ========================================
   DEVIATION: [Component/Page Name]
   Reason: [Brief explanation]
   ======================================== */
```

### 3. Clean Code, No Exceptions

- No spaghetti code
- No unused code (dead CSS, orphaned JS functions, commented-out blocks)
- Delete what isn't used — don't leave it "just in case"

### 4. Human-Readable Code

- Code should read like well-organized documentation
- Prefer clarity over cleverness
- Another developer should understand the structure in under 2 minutes

### 5. Progressive Enhancement

- **Content must be visible by default** - All critical content should be visible without JavaScript
- **CSS provides the baseline** - Set `opacity: 1` and `visibility: visible` in CSS by default
- **JavaScript enhances** - Use inline styles (via GSAP) to override CSS defaults for animations
- **Graceful degradation** - If JavaScript fails or loads slowly, content remains accessible
- **SEO-friendly** - Search engines can crawl all content without JavaScript

**Implementation Pattern:**
```css
/* ✅ DO - Content visible by default */
.hero-content {
  opacity: 1; /* Progressive enhancement: Visible by default, JS can enhance */
}

/* ❌ DON'T - Content hidden by default */
.hero-content {
  opacity: 0; /* Requires JS to show - breaks without JavaScript */
}
```

```javascript
// ✅ DO - JavaScript enhances with inline styles (overrides CSS)
gsap.set(heroContent, { opacity: 0 }) // Can override CSS for animations
gsap.to(heroContent, { opacity: 1, duration: 1 }) // Animate in

// ❌ DON'T - Rely on CSS classes that require JS
element.classList.add('is-visible') // Breaks if JS doesn't run
```

**Body Visibility Pattern:**
```html
<!-- ✅ DO - Time-based fallback works without JS -->
<style>
  body:not(.ready) { visibility: hidden; }
  body:not(.ready) { animation: show-after-load 0.01s 3s forwards; }
  @keyframes show-after-load { to { visibility: visible; } }
</style>
```

---

## File Organization

```
/src
  /assets
    /images
    /fonts
    /icons
  /styles
    /base          # resets, variables, typography
    /components    # reusable component styles
    /layouts       # page-level layouts
    /pages         # page-specific overrides (keep minimal)
    /utils         # utility classes, mixins
  /scripts
    /components    # component-specific JS
    /utils         # shared utilities
    /vendor        # third-party (GSAP, etc.)
  /pages           # HTML pages
```
