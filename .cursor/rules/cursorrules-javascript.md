# JavaScript Rules

## General Principles

- Vanilla JS first — no frameworks unless specified
- ES6+ syntax (const/let, arrow functions, destructuring, modules)
- Modular architecture with clear separation of concerns

---

## File Structure

```
/scripts
  main.js              # Entry point, imports and initializes
  /components
    navigation.js      # Nav-specific logic
    animations.js      # GSAP animation sequences
    forms.js           # Netlify Forms handling
  /utils
    dom.js             # DOM helper utilities
    helpers.js         # General utilities
  /vendor
    # Third-party scripts if not via npm
```

---

## Module Pattern

Each component should be a self-contained module:

```javascript
// components/navigation.js

const Navigation = {
  // Private state
  state: {
    isOpen: false,
    activeItem: null,
  },

  // DOM references (cached on init)
  elements: {},

  // Initialize
  init() {
    this.cacheElements();
    this.bindEvents();
  },

  cacheElements() {
    this.elements.nav = document.querySelector('.nav');
    this.elements.toggle = document.querySelector('.nav__toggle');
    this.elements.menu = document.querySelector('.nav__menu');
  },

  bindEvents() {
    this.elements.toggle?.addEventListener('click', () => this.toggle());
  },

  // Public methods
  toggle() {
    this.state.isOpen = !this.state.isOpen;
    this.elements.nav.classList.toggle('nav--open', this.state.isOpen);
  },

  open() {
    this.state.isOpen = true;
    this.elements.nav.classList.add('nav--open');
  },

  close() {
    this.state.isOpen = false;
    this.elements.nav.classList.remove('nav--open');
  },
};

export default Navigation;
```

---

## Main Entry Point

```javascript
// main.js

import Navigation from './components/navigation.js';
import Animations from './components/animations.js';
import Forms from './components/forms.js';

const App = {
  init() {
    Navigation.init();
    Animations.init();
    Forms.init();
  },
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
```

---

## GSAP Animations

Keep animation definitions organized and reusable:

```javascript
// components/animations.js

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Animations = {
  init() {
    this.fadeInElements();
    this.heroSequence();
  },

  // Reusable animation presets
  presets: {
    fadeUp: {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power2.out',
    },
  },

  fadeInElements() {
    gsap.utils.toArray('[data-animate="fade-up"]').forEach((el) => {
      gsap.from(el, {
        ...this.presets.fadeUp,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
        },
      });
    });
  },

  heroSequence() {
    const tl = gsap.timeline();
    // Timeline definition
  },
};

export default Animations;
```

---

## DOM Utilities

```javascript
// utils/dom.js

export const $ = (selector, context = document) => 
  context.querySelector(selector);

export const $$ = (selector, context = document) => 
  [...context.querySelectorAll(selector)];

export const on = (element, event, handler, options = {}) => {
  element?.addEventListener(event, handler, options);
};

export const off = (element, event, handler) => {
  element?.removeEventListener(event, handler);
};
```

---

## Forbidden Patterns

- ❌ `var` — use `const` or `let`
- ❌ jQuery (unless absolutely necessary for a plugin)
- ❌ Global variables — use modules
- ❌ Inline event handlers in HTML (`onclick=""`)
- ❌ `document.write()`
- ❌ Unused functions or variables — delete them
- ❌ Console logs in production code
- ❌ Callback hell — use async/await or Promises

---

## Error Handling

```javascript
// Wrap risky operations
try {
  const data = JSON.parse(response);
} catch (error) {
  console.error('Failed to parse response:', error);
  // Handle gracefully
}

// Check elements exist before using
const element = document.querySelector('.selector');
if (element) {
  // Safe to use
}

// Or use optional chaining
document.querySelector('.selector')?.classList.add('active');
```
