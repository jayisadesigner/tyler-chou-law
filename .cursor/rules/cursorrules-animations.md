---
description: Guidelines for working with animation modules
globs: src/scripts/animations/**/*.js
alwaysApply: true
---

# Animation Module Structure

This project uses a modular animation architecture. Follow these patterns when adding or modifying animations.

## File Organization
```
/src/scripts/animations/
  ├── index.js           # Main init, Lenis setup, exports only
  ├── intro.js           # Homepage intro sequence
  ├── scroll-sections.js # Pinned/scrubbed scroll animations
  ├── line-animations.js # Text splitting and reveal animations
  ├── parallax.js        # Background parallax effects
  ├── mouse-trail.js     # Cursor-following effects
  └── utils.js           # Shared helpers (theme, spacing, ScrollTrigger factories)
```

## Rules

### 1. No God Files
- Max ~300 lines per module
- If a module grows beyond this, split it further
- Each module should have a single responsibility

### 2. Shared Utilities Go in utils.js
- `setBodyTheme()`, `setNavColor()`, `getSpacingValue()`
- ScrollTrigger factory functions (`createPinnedScrollConfig`, etc.)
- Theme callback generators

### 3. Batch DOM Operations
```javascript
// ❌ Bad: read/write interleaved
elements.forEach(el => {
  const rect = el.getBoundingClientRect() // read
  el.style.width = rect.width + 'px'      // write
})

// ✅ Good: batch reads, then writes
const rects = Array.from(elements).map(el => el.getBoundingClientRect())
elements.forEach((el, i) => {
  el.style.width = rects[i].width + 'px'
})
```

### 4. Lazy Load Non-Critical Animations
```javascript
// Homepage-only code should be dynamically imported
if (isHomepage) {
  import('./intro.js').then(({ initIntro }) => initIntro())
}
```

### 5. No Debug Logs in Production
```javascript
// Use this pattern for debug logging
const DEBUG = false // Always false in committed code
if (DEBUG) console.log('...')
```

### 6. ScrollTrigger Patterns
- Use `ScrollTrigger.matchMedia()` for responsive animations
- Always set `invalidateOnRefresh: true` for animations affected by layout changes
- Use `pinSpacing: false` when pinning elements inside flex containers
- Lenis + CSS sticky = broken. Use GSAP `pin` instead.

### 7. Reduced Motion
Every animation init function must accept `reducedMotion` param:
```javascript
function initSomeAnimation(reducedMotion = false) {
  if (reducedMotion) {
    gsap.set(elements, { /* final state */ })
    return
  }
  // ... animation code
}
```

### 8. Naming Conventions
- Init functions: `initFeatureName()`
- Helpers: `verbNoun()` (e.g., `setBodyTheme`, `calculateScrollMultiplier`)
- Exported utilities: document with JSDoc

### 9. GSAP Imports
Always import from same source for tree-shaking:
```javascript
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
```

### 10. Cleanup
If an animation adds event listeners, provide cleanup:
```javascript
section._animationCleanup = () => {
  window.removeEventListener('resize', handler)
}
```

