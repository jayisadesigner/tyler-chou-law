# Section Reveal Animation Analysis

## Expected Behavior
- Sections with `.section-reveal` class should:
  1. Start hidden (opacity: 0, y: 60px)
  2. Fade in and slide up (opacity: 1, y: 0) when scrolled into view
  3. Trigger when section top reaches 80% of viewport
  4. Work on both mobile and desktop

## Current Implementation Issues

### 1. CSS Conflict
- `.section-reveal { opacity: 1; }` in CSS overrides GSAP initial state
- Even with `immediateRender: true`, CSS might win the specificity battle

### 2. Scroller Property Issue
- Code uses: `scroller: lenis ? document.body : window`
- On mobile: `lenis` is `null`, so it uses `window` ✓ (correct)
- On desktop: Uses `document.body` which has Lenis proxy ✓ (correct)
- BUT: The scroller proxy is only set up if `lenis` exists, so on mobile it should just use default

### 3. Initial State Timing
- `gsap.set()` is called, but CSS might reapply after
- Viewport check happens immediately, might catch sections before they're properly hidden

### 4. ScrollTrigger Configuration
- Uses `gsap.to()` with `scrollTrigger` property
- Other working animations on mobile use `ScrollTrigger.create()` with `onEnter` callbacks
- Pattern difference might be causing issues

## Working Patterns in Codebase

### Pattern 1: Line Animations (works on mobile)
```javascript
anim = animateLineElements(lineElements, {
  scrollTrigger: {
    trigger: element,
    start: 'top 85%',
    toggleActions: 'play none none none',
    onEnter: () => {
      if (anim) anim.restart()
    }
  }
})
```

### Pattern 2: Philosophy Section (works on mobile)
```javascript
ScrollTrigger.create({
  trigger: philosophySection,
  start: 'top 60%',
  end: 'bottom 40%',
  onEnter: () => {
    gsap.to(queenText, {
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out'
    })
  }
})
```

## Recommended New Approach

### Option 1: Use ScrollTrigger.create() Pattern (Recommended)
- More reliable on mobile
- Matches working patterns in codebase
- Better control with explicit callbacks

### Option 2: Fix CSS Override
- Remove `opacity: 1` from CSS
- Or use `!important` in GSAP (but user prefers no !important)
- Or use inline styles initially

### Option 3: Use matchMedia for Mobile/Desktop Split
- Different approaches for mobile vs desktop
- Mobile: Simple ScrollTrigger.create with onEnter
- Desktop: Current approach with Lenis

## Recommended Solution

Use `ScrollTrigger.create()` with `onEnter` callback pattern, matching the working philosophy section approach. This is proven to work on mobile.

