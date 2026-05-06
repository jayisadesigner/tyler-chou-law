/**
 * Reveal — IntersectionObserver-driven reveals for line animations and section reveals.
 *
 * Design intent (from the GSAP refactor):
 *   - Layout is owned by CSS. Content is visible by default.
 *   - JS only ENHANCES: it temporarily hides elements, then reveals them as
 *     they enter the viewport. If JS fails, content stays visible.
 *   - No GSAP, no DOM mutation, no measurement.
 *
 * Targets:
 *   - .line-animate         → headline reveals (built by the `line_animate` Liquid filter)
 *   - .section-reveal       → section fade/slide-up reveals
 *
 * Class state machine (CSS owns the visual states; this file only flips classes):
 *     default    → fully visible
 *     .is-pre-reveal → hidden (set immediately by JS on init)
 *     .is-revealed   → animating in (set when element enters viewport)
 */

const REVEAL_THRESHOLD = 0.15
/** Tall sections (e.g. blog listing) can stay below a single 0.15 ratio until the user scrolls most of the page. Pair with 0 so the first real intersection is reported. */
const REVEAL_THRESHOLDS = [0, REVEAL_THRESHOLD]

let observer = null

function getObserver() {
  if (observer) return observer
  if (typeof IntersectionObserver === 'undefined') return null

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target
        // Once revealed, stop observing — animations only play once.
        observer.unobserve(el)
        // Use rAF to ensure the .is-pre-reveal -> .is-revealed transition is
        // observed by the browser (otherwise it can collapse into one frame).
        requestAnimationFrame(() => {
          el.classList.remove('is-pre-reveal')
          el.classList.add('is-revealed')
        })
      }
    },
    { threshold: REVEAL_THRESHOLDS, rootMargin: '0px 0px -10% 0px' }
  )
  return observer
}

/**
 * Initialize reveals for a set of selectors. Idempotent — safe to call
 * multiple times. Elements already revealed are not re-hidden.
 *
 * Hero handoff:
 *   `.line-animate` elements inside a `.hero` are NOT observed automatically.
 *   They're pre-hidden, then `forceReveal()` is called by:
 *     • intro.js when the homepage intro splash completes, or
 *     • initAnimations() in index.js after the inner-page hero-content fade-in.
 *   This keeps the cinematic sequence (hero-content fade → headline slide-up)
 *   intact, instead of the IntersectionObserver firing immediately and
 *   revealing the headline inside an opacity:0 hero-content.
 *
 * @param {boolean} reducedMotion - If true, skip animation and leave elements in their default (visible) state.
 */
export function initReveals(reducedMotion = false) {
  const elements = document.querySelectorAll('.line-animate, .section-reveal')
  if (elements.length === 0) return

  if (reducedMotion) {
    // Reduced motion: leave elements in default visible state. Nothing to do.
    return
  }

  const obs = getObserver()
  // Without IntersectionObserver: leave elements visible (graceful degradation).
  if (!obs) return

  for (const el of elements) {
    // Skip if already animated.
    if (el.classList.contains('is-revealed')) continue

    // Hero headlines are force-revealed by the intro/hero-fade sequence — see
    // the docblock above. Pre-hide them but don't observe; otherwise the IO
    // fires on initial paint and the reveal plays inside an invisible
    // hero-content, ruining the choreography.
    if (el.classList.contains('line-animate') && el.closest('.hero')) {
      el.classList.add('is-pre-reveal')
      continue
    }

    // Skip if already pre-hidden (idempotent).
    if (el.classList.contains('is-pre-reveal')) {
      obs.observe(el)
      continue
    }
    // Hide, then observe. If the element is already in the viewport, the
    // observer fires immediately and reveal happens on the next frame.
    el.classList.add('is-pre-reveal')
    obs.observe(el)
  }
}

/**
 * Force-reveal an element immediately (skip the pre-hide step).
 * Used by intro / hero handoff to play the hero headline as soon as the
 * intro completes, regardless of viewport position.
 */
export function forceReveal(el) {
  if (!el) return
  el.classList.remove('is-pre-reveal')
  el.classList.add('is-revealed')
  if (observer) observer.unobserve(el)
}
