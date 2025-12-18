# Additional Cursor Rules — Tyler Chou Project

## Brand-Specific Rules

### Color Token Usage

The color system is already defined. Use semantic tokens, not primitives directly:

```css
/* ✅ DO */
color: var(--color-text);
background: var(--color-background);
border-color: var(--color-primary);

/* ❌ DON'T */
color: var(--obsidian-900);
background: #FFFFF5;
```

**Accent color restraint:** Chuparosa, Lupine, Palo Verde, and Desert Gold are accent colors. Use them sparingly for strategic moments (CTAs, highlights, key interactions). Default to Bone/Obsidian for most UI.

### Typography Hierarchy

Follow the established type scale. Don't invent new sizes or weights:

```css
/* Use existing tokens */
font-family: var(--font-heading);  /* Gambetta */
font-family: var(--font-body);     /* General Sans */
font-size: var(--text-xl);
```

---

## Animation Rules (GSAP)

### Performance First

```javascript
/* ✅ DO — GPU-accelerated properties */
gsap.to(el, { 
  opacity: 0.5, 
  x: 100,           /* transforms are cheap */
  y: 50,
  scale: 1.1,
  rotation: 45
});

/* ❌ DON'T — triggers layout/paint */
gsap.to(el, { 
  width: '100px',   /* expensive */
  height: '200px',  
  top: '50px',
  left: '100px',
  marginTop: '20px'
});
```

### Accessibility — Respect Motion Preferences

Always check for reduced motion:

```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Skip or simplify animations
  gsap.set(el, { opacity: 1 }); // Just show it
} else {
  gsap.from(el, { opacity: 0, y: 30, duration: 0.8 });
}
```

Or use a global helper:

```javascript
// utils/motion.js
export const canAnimate = () => 
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Usage
if (canAnimate()) {
  gsap.from(el, { ... });
}
```

### ScrollTrigger Cleanup

Always kill ScrollTriggers when done to prevent memory leaks:

```javascript
// On page/component destroy
ScrollTrigger.getAll().forEach(trigger => trigger.kill());
```

### Animation Timing Feel

This is a cinematic, prestige site. Animations should feel:
- **Deliberate** — Not snappy/bouncy like a SaaS app
- **Smooth** — Ease curves like `power2.out`, `power3.inOut`
- **Unhurried** — Durations of 0.6s–1.2s for reveals, not 0.2s

```javascript
/* ✅ Cinematic feel */
gsap.from(el, {
  opacity: 0,
  y: 40,
  duration: 0.9,
  ease: 'power2.out'
});

/* ❌ Too snappy for this brand */
gsap.from(el, {
  opacity: 0,
  y: 10,
  duration: 0.15,
  ease: 'bounce'
});
```

---

## SEO Rules

### Every Page Needs

1. Unique `<title>` tag (50-60 chars)
2. Unique `<meta name="description">` (150-160 chars)
3. Open Graph tags (og:title, og:description, og:image, og:url)
4. Proper heading hierarchy (one H1, logical H2-H6 structure)
5. Schema.org JSON-LD (Attorney schema for legal pages)

### Schema Template

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Attorney",
  "name": "Tyler Chou Law for Creators",
  "description": "...",
  "url": "https://tylerchoulaw.com",
  "address": { ... },
  "areaServed": "United States",
  "priceRange": "$$$$"
}
</script>
```

---

## Image Rules

### Optimization Requirements

- Use WebP format with JPG/PNG fallback
- Include `width` and `height` attributes (prevents layout shift)
- Always include descriptive `alt` text
- Lazy load images below the fold

```html
<img 
  src="image.webp" 
  alt="Tyler Chou speaking at Creator Summit 2024"
  width="800" 
  height="600"
  loading="lazy"
>
```

### Hero/Above-Fold Images

Do NOT lazy load. Add `fetchpriority`:

```html
<img 
  src="hero.webp" 
  alt="..."
  width="1920" 
  height="1080"
  fetchpriority="high"
>
```

---

## Component Patterns

### Reusability Expectations

If a pattern appears 2+ times, extract it into a component:
- Reusable CSS class
- Reusable HTML partial (copy/paste is fine for static sites)
- Reusable JS module

### Section Pattern Consistency

All page sections should follow the established pattern:

```html
<section class="section section--[name]">
  <div class="container">
    <!-- content -->
  </div>
</section>
```

Don't break this pattern without explicit instruction.

---

## Forms (Netlify)

### Required Structure

```html
<form 
  name="[form-name]" 
  method="POST" 
  data-netlify="true" 
  netlify-honeypot="bot-field"
>
  <!-- Hidden honeypot -->
  <p class="sr-only">
    <label>Don't fill this out: <input name="bot-field"></label>
  </p>
  
  <!-- Form fields with proper labels -->
</form>
```

### Validation

- Use native HTML5 validation first (`required`, `type="email"`, etc.)
- Add JS validation only for complex cases
- Show clear error states with accessible messaging

---

## What NOT to Do

1. **Don't add features that weren't requested** — No "nice to have" additions
2. **Don't refactor working code** unless asked — If it works, leave it
3. **Don't change animation timings** without design approval
4. **Don't add new colors** outside the established palette
5. **Don't add new font sizes** outside the type scale
6. **Don't use CSS frameworks** (Tailwind, Bootstrap, etc.) — We're vanilla
7. **Don't add dependencies** without asking — Keep it lean
