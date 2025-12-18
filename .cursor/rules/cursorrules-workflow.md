# Code Quality & Workflow

## Before You Write Code

1. **Understand the task** — Read the full request before starting
2. **Check existing patterns** — Look at how similar things are done in the codebase
3. **Ask if unclear** — Don't guess on design decisions

---

## Code Review Checklist

Before submitting any code, verify:

### Functionality
- [ ] Does it work as specified?
- [ ] Edge cases handled?
- [ ] No console errors?

### Code Quality
- [ ] No unused code (CSS, JS, HTML)?
- [ ] No commented-out code blocks?
- [ ] Following existing patterns?
- [ ] BEM naming for CSS?
- [ ] Modular JS structure?

### Accessibility
- [ ] Semantic HTML?
- [ ] Alt text on images?
- [ ] Keyboard navigable?
- [ ] Focus states visible?

### Performance
- [ ] Images optimized?
- [ ] No render-blocking resources?
- [ ] Animations use `transform`/`opacity`?

---

## Commenting Standards

### When to Comment

```css
/* DO: Explain why, not what */
/* Offset to account for fixed header height */
scroll-margin-top: 80px;

/* DON'T: State the obvious */
/* Sets color to red */
color: red;
```

### Section Headers

```css
/* ========================================
   SECTION NAME
   ======================================== */
```

### TODO Format

```javascript
// TODO: [Description] — [Your initials] [Date]
// TODO: Add error handling for form submission — JA 01/2025
```

---

## Git Commit Messages

```
type: short description

[optional body with more detail]
```

### Types
- `feat:` — New feature
- `fix:` — Bug fix
- `style:` — CSS/formatting (no logic change)
- `refactor:` — Code restructure (no feature change)
- `docs:` — Documentation only
- `chore:` — Build, config, tooling

### Examples

```
feat: add hero section animations

fix: mobile nav not closing on link click

style: update button hover states per design review

refactor: consolidate animation utilities into single module
```

---

## Asking Questions

When something is unclear, ask with context:

**Good:**
> "The design shows 24px spacing between cards on desktop. Should this reduce to 16px on mobile, or stay at 24px?"

**Not helpful:**
> "What should the spacing be?"

---

## When You Disagree

If you think there's a better technical approach:

1. Implement what was asked first
2. Note your suggestion with reasoning
3. Let Jay decide

```
// NOTE: This works as requested. However, using CSS Grid here 
// instead of Flexbox would simplify the responsive behavior 
// and reduce the CSS by ~15 lines. Happy to refactor if preferred.
```
