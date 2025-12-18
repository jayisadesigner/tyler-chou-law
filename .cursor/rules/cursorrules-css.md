# CSS Rules

## Architecture

Use a layered approach with clear separation of concerns.

### Import Order (main.css)

```css
/* Base */
@import 'base/reset.css';
@import 'base/variables.css';
@import 'base/typography.css';

/* Layouts */
@import 'layouts/grid.css';
@import 'layouts/header.css';
@import 'layouts/footer.css';

/* Components */
@import 'components/buttons.css';
@import 'components/cards.css';
/* ... */

/* Pages (only when absolutely necessary) */
@import 'pages/home.css';

/* Utilities (last, for override capability) */
@import 'utils/utilities.css';
```

---

## Naming Conventions

Use **BEM methodology** for component classes:

```css
/* Block */
.card { }

/* Element */
.card__title { }
.card__image { }
.card__body { }

/* Modifier */
.card--featured { }
.card--dark { }
```

### Naming Rules

- All lowercase
- Hyphens for multi-word blocks: `.creator-card`
- Double underscore for elements: `.creator-card__title`
- Double hyphen for modifiers: `.creator-card--highlighted`

---

## CSS Custom Properties (Variables)

### Two-Layer Token System

**Primitive tokens** (raw values):

```css
:root {
  /* Colors - Primitives */
  --color-chuparosa-500: #C41E3A;
  --color-palo-verde-500: #4A7C59;
  --color-desert-gold-500: #CFB53B;
  --color-lupine-500: #7851A9;
  --color-bone-100: #F5F5DC;
  --color-obsidian-900: #1A0A0A;
  
  /* Spacing - Primitives */
  --space-4: 0.25rem;
  --space-8: 0.5rem;
  --space-16: 1rem;
  --space-24: 1.5rem;
  --space-32: 2rem;
  --space-48: 3rem;
  --space-64: 4rem;
}
```

**Semantic tokens** (contextual usage):

```css
:root {
  /* Colors - Semantic */
  --color-primary: var(--color-chuparosa-500);
  --color-secondary: var(--color-palo-verde-500);
  --color-accent: var(--color-desert-gold-500);
  --color-background: var(--color-bone-100);
  --color-text: var(--color-obsidian-900);
  
  /* Spacing - Semantic */
  --space-section: var(--space-64);
  --space-component: var(--space-32);
  --space-element: var(--space-16);
}
```

---

## Style Deviations

When you must deviate from existing patterns, document it:

```css
/* ========================================
   DEVIATION: Hero Section
   Reason: Requires full-bleed layout that 
   breaks standard grid for cinematic effect
   ======================================== */

.hero--fullbleed {
  /* deviation styles */
}
```

---

## Responsive Approach

Mobile-first with these breakpoints:

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Usage */
@media (min-width: 768px) { }
@media (min-width: 1024px) { }
```

---

## Forbidden Patterns

- ❌ Inline styles (unless dynamically required by JS)
- ❌ `!important` (unless overriding third-party)
- ❌ Magic numbers without comments
- ❌ Deeply nested selectors (max 3 levels)
- ❌ ID selectors for styling (use classes)
- ❌ Unused selectors — delete them
