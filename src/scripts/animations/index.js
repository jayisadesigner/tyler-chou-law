/**
 * Animation System Entry Point
 * Main initialization, Lenis setup, and orchestration
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

// Register GSAP plugins
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Check for reduced motion preference
export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Cache viewport dimensions (updated on resize)
export let viewportWidth = window.innerWidth
export let viewportHeight = window.innerHeight

// Breakpoints - match CSS variables for consistency
// Note: CSS variables can't be used in @media queries, so we maintain JS constants
const BREAKPOINTS = {
  tablet: 768,   // --breakpoint-md
  desktop: 1024, // --breakpoint-lg
}

// Initialize Lenis for smooth scrolling
let lenis = null

function initLenis() {
  // Skip Lenis on mobile — causes issues with ScrollTrigger pins on iOS Safari
  // The scroller proxy and smooth scroll conflict with position:fixed pinning
  if (window.innerWidth < BREAKPOINTS.tablet) {
    window.lenis = null
    return null
  }

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    smoothTouch: false, // Disable on touch devices to avoid conflicts
    touchMultiplier: 2,
  })

  // Animation frame loop
  function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }

  requestAnimationFrame(raf)

  // Make Lenis available globally if needed
  window.lenis = lenis

  // Integrate with GSAP ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true })
        }
        return lenis.scroll
      },
      getBoundingClientRect() {
        return { 
          top: 0, 
          left: 0, 
          width: viewportWidth, 
          height: viewportHeight 
        }
      },
      pinType: document.body.style.transform ? 'transform' : 'fixed'
    })

    // Update ScrollTrigger when Lenis scrolls
    lenis.on('scroll', ScrollTrigger.update)
  }

  return lenis
}

// Import animation modules
import { initNavColors, setBodyTheme, setNavColor, createThemeScrollTrigger } from './utils.js'
import { initPinnedSections, initLoveLettersScroll, initPhilosophyRedaction, initCredentialsShadow, initFormSections } from './scroll-sections.js'
import { initReveals, forceReveal } from './reveal.js'
import { initHeroParallax, animateFlowerRotation } from './parallax.js'
import { initMouseTrail } from './mouse-trail.js'
import { setupEarlyScrollDetection } from './intro.js'

/**
 * Initialize all animations
 */
export function initAnimations() {
  // Initialize nav colors from CSS (promotes CSS values to inline styles so JS can override)
  initNavColors()
  
  // If user prefers reduced motion, set all elements to final state and skip animations
  if (prefersReducedMotion) {
    // Hero content and section reveals are visible by default in CSS. The
    // .is-pre-reveal / .is-revealed state machine is JS-only, so reduced-motion
    // users naturally see the static layout without any opacity-zero flash.
    
    // Set flowers to final rotation state (only if elements exist)
    const aboutFlower = document.querySelector('.about-flower')
    const aboutSection = document.querySelector('.section--featured-image--left')
    if (aboutFlower && aboutSection) {
    animateFlowerRotation('.about-flower', '.section--featured-image--left', prefersReducedMotion)
    }
    animateFlowerRotation('.palo-verde-flower', '.palo-verde, #creatorarq-investment, #creatorarq-creators', prefersReducedMotion)
    
    // Set background colors
    const defaultColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--chuparosa-600').trim()
    gsap.set(document.body, { backgroundColor: defaultColor })
    
    // Set background images to final state (no parallax)
    document.querySelectorAll('.background-image__img').forEach((img) => {
      gsap.set(img, { scale: 1, yPercent: 0 })
    })
    
    // Initialize static versions of complex animations
    initPhilosophyRedaction(true, viewportHeight) // Pass true for reduced motion
    initCredentialsShadow(true) // Pass true for reduced motion
    initReveals(true) // Reduced motion: leave visible (no animation)
    initHeroParallax(true) // Pass true for reduced motion
    initLoveLettersScroll(true, viewportHeight) // Pass true for reduced motion
    initMouseTrail(true) // Pass true for reduced motion
    
    return // Skip all animations
  }

  // Initialize line + section reveals (CSS-driven, IntersectionObserver-based).
  // Runs before the GSAP-heavy work so that sections are pre-hidden as soon as
  // possible after the lazy-loaded animations chunk arrives.
  initReveals(false)

  // Hero handoff
  // ─────────────────────────────────────────────────────────────────────────
  // Two paths:
  //   1. Homepage with intro splash — intro.js owns the entire hero-content
  //      fade-in and calls forceReveal() on the hero headline when the splash
  //      completes. Skip this block; intro.js handles it.
  //   2. Inner pages (no intro) — fade hero-content up, then force-reveal the
  //      hero headline so the per-line slide-up plays AFTER hero-content is
  //      visible. Without this chain, IntersectionObserver would fire on
  //      initial paint and play the headline reveal inside an opacity:0
  //      hero-content (lost to the user).
  const hasIntro = !!document.querySelector('.intro')
  if (!hasIntro) {
    const heroSection = document.querySelector('.hero')
    const heroContent = heroSection?.querySelector('.hero-content')
    if (heroContent) {
      // Chain the hero entrance off the curtain reveal (inner pages only —
      // the homepage intro owns its own hero handoff).
      //
      // Curtain timing (curtain.css): panels finish sliding at ~2.7–2.8s,
      // curtain hides at 2.8s.
      //
      // Sequence (matches nav fade-in at 2.9s in nav.css):
      //   2.9s   hero-content fades up (1s) AND headline lines slide in
      //          via the .line-animate state machine (~1s incl stagger).
      //   3.8s   subheadline fades in (0.5s) — strictly AFTER the headline
      //          reveal starts, so it never appears alone.
      const heroDelay = prefersReducedMotion ? 0 : 2.9
      const subheadline = heroSection.querySelector(
        '.hero-subheadline, .hero-subheadline--inner-page, .hero-subheadline--nested, .hero-subheadline--desktop'
      )

      // Pre-hide the subheadline immediately so it can't flash in before the
      // headline. CSS already pre-hides it via `html.js-enhance` (see
      // animations.css), but set the y-offset explicitly so the upward fade
      // reads cleanly.
      if (subheadline) {
        gsap.set(subheadline, { opacity: 0, y: 16 })
      }

      // fromTo (not from) so the end state — opacity:1, y:0 — is explicit and
      // wins over CSS `html.js-enhance .hero .hero-content { opacity: 0 }`.
      // gsap.from() reads the current computed style as the "to" target; with
      // CSS already at opacity:0 that produces a 0→0 tween (no animation).
      gsap.fromTo(
        heroContent,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          delay: heroDelay,
          onStart: () => {
            // Reveal headline lines concurrently with the hero-content fade
            // so the headline is the first thing the eye lands on, not the
            // subheadline.
            heroSection
              .querySelectorAll('.line-animate')
              .forEach((el) => forceReveal(el))
          }
        }
      )

      if (subheadline) {
        gsap.to(subheadline, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          delay: heroDelay + 0.9 // ~end of headline line stagger
        })
      }
    }
  }

  // Section + line reveals are handled by initReveals (CSS + IntersectionObserver)
  // further down. The section-reveal animation block that lived here was rebuilt
  // around .is-pre-reveal / .is-revealed CSS classes — see reveal.js + animations.css.

  if (!ScrollTrigger) return

  // Services capabilities grid: animate when section/cells enter view; reset on leave so it replays each time.
  const gridSections = document.querySelectorAll('.services-capabilities')
  if (gridSections.length && ScrollTrigger) {
    const gridTween = { opacity: 1, x: 0, duration: 1.4, ease: 'power2.out' }
    const gridReset = { opacity: 0, x: -24 }
    ScrollTrigger.matchMedia({
      '(max-width: 767px)': function () {
        gridSections.forEach((section) => {
          const cells = section.querySelectorAll('.services-capabilities__cell')
          if (!cells.length) return
          if (prefersReducedMotion) {
            gsap.set(cells, { opacity: 1, x: 0 })
            return
          }
          gsap.set(cells, gridReset)
          cells.forEach((cell) => {
            ScrollTrigger.create({
              trigger: cell,
              start: 'top 88%',
              end: 'bottom 12%',
              onEnter: () => gsap.to(cell, { ...gridTween }),
              onEnterBack: () => gsap.to(cell, { ...gridTween }),
              onLeave: () => gsap.set(cell, gridReset),
              onLeaveBack: () => gsap.set(cell, gridReset)
            })
          })
        })
      },
      '(min-width: 768px)': function () {
        gridSections.forEach((section) => {
          const cells = section.querySelectorAll('.services-capabilities__cell')
          if (!cells.length) return
          if (prefersReducedMotion) {
            gsap.set(cells, { opacity: 1, x: 0 })
            return
          }
          gsap.set(cells, gridReset)
          const runAnimation = () => gsap.to(cells, { ...gridTween, stagger: 0.25 })
          const rect = section.getBoundingClientRect()
          if (rect.top < viewportHeight * 0.8 && rect.bottom > 0) runAnimation()
          ScrollTrigger.create({
            trigger: section,
            start: 'top 80%',
            end: 'bottom 20%',
            onEnter: runAnimation,
            onEnterBack: runAnimation,
            onLeave: () => gsap.set(cells, gridReset),
            onLeaveBack: () => gsap.set(cells, gridReset)
          })
        })
      }
    })
  }

  // Flower rotation animations
  // Only animate about-flower if it exists (home page only)
  const aboutFlower = document.querySelector('.about-flower')
  const aboutSection = document.querySelector('.section--featured-image--left')
  if (aboutFlower && aboutSection) {
  animateFlowerRotation('.about-flower', '.section--featured-image--left', prefersReducedMotion)
  }
  
  // Palo verde flower animation - handle both about page and creatorarq page
  if (document.body.classList.contains('page-about')) {
    // On about page, flower animation will be set up in the background color observer section below
    // to ensure they trigger at the same time
  } else {
    // On other pages (like creatorarq), only animate if elements exist
    const paloVerdeFlower = document.querySelector('.palo-verde-flower')
    const paloVerdeTrigger = document.querySelector('.palo-verde, #creatorarq-investment, #creatorarq-creators')
    if (paloVerdeFlower && paloVerdeTrigger) {
  animateFlowerRotation('.palo-verde-flower', '.palo-verde, #creatorarq-investment, #creatorarq-creators', prefersReducedMotion)
    }
  }
  
  // Section-based theme switching
  // Palo Verde section - green background (on about page)
  // Nav color is handled by CSS only
  if (document.body.classList.contains('page-about')) {
    const paloVerdeSection = document.querySelector('.palo-verde')
    if (paloVerdeSection) {
      // Use IntersectionObserver for background color change (no nav color change)
      let hasBeenVisible = false
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.1 // At least 10% visible
          const rect = entry.boundingClientRect
          const scrolledPast = rect.top < 0 && rect.bottom < window.innerHeight
          
          if (isVisible) {
            // Section is visible - set green background (but not nav color)
            hasBeenVisible = true
            setBodyTheme('bg-palo-verde')
            // Immediately clear nav color inline styles - CSS will handle it
            document.body.style.removeProperty('--nav-text-color')
            document.body.style.removeProperty('--nav-hamburger-color')
          } else if (scrolledPast && hasBeenVisible) {
            // Scrolled past section - keep green until end of page
            // Don't reset - keep green background
          } else if (!scrolledPast && hasBeenVisible) {
            // Scrolled back up before section - reset to default
            hasBeenVisible = false
            setBodyTheme('')
            // Immediately clear nav color inline styles - CSS will handle it
            document.body.style.removeProperty('--nav-text-color')
            document.body.style.removeProperty('--nav-hamburger-color')
          }
        })
      }, {
        threshold: [0, 0.1, 0.5, 1.0], // Multiple thresholds for better detection
        rootMargin: '0px' // No margin - exact viewport detection
      })
      
      observer.observe(paloVerdeSection)
      
      // Set up flower animation to trigger at the same time using IntersectionObserver
      // This ensures both background and flower trigger together when section becomes visible
      const paloVerdeFlower = document.querySelector('.palo-verde-flower')
      if (paloVerdeFlower) {
        // Create a separate observer for the flower to trigger animation start
        let flowerAnimationStarted = false
        const flowerObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.1
            
            if (isVisible && !flowerAnimationStarted) {
              // Section is visible - start the flower animation
              flowerAnimationStarted = true
              // Use 'top top' to ensure it starts when section is fully in view
              animateFlowerRotation('.palo-verde-flower', paloVerdeSection, prefersReducedMotion, 'top top')
            } else if (!isVisible && flowerAnimationStarted) {
              // Reset when scrolled back up
              flowerAnimationStarted = false
            }
          })
        }, {
          threshold: [0, 0.1], // Match the background observer threshold
          rootMargin: '0px'
        })
        
        flowerObserver.observe(paloVerdeSection)
      }
    }
  }

  // Love Letters section - bone background (on home page)
  // Note: Theme switching for love-notes is handled in initLoveLettersScroll
  // because the section is pinned on desktop and needs to coordinate with the pin animation

  // Blog listing section on love-letters page - nav turns dark chuparosa
  if (document.body.classList.contains('page-love-letters')) {
    const blogListing = document.querySelector('.blog-listing')
    if (blogListing) {
      ScrollTrigger.create({
        trigger: blogListing,
        start: 'top center',
        end: 'bottom top',
        onEnter: () => setNavColor('var(--chuparosa-950)'),
        onLeave: () => setNavColor(''),
        onEnterBack: () => setNavColor('var(--chuparosa-950)'),
        onLeaveBack: () => setNavColor(''),
      })
    }
  }

  // Blog post content section - nav turns obsidian
  if (document.body.classList.contains('page-blog-post')) {
    const blogPostContent = document.querySelector('.blog-post-content')
    if (blogPostContent) {
      ScrollTrigger.create({
        trigger: blogPostContent,
        start: 'top center',
        end: 'bottom top',
        onEnter: () => setNavColor('var(--obsidian)'),
        onLeave: () => setNavColor(''),
        onEnterBack: () => setNavColor('var(--obsidian)'),
        onLeaveBack: () => setNavColor(''),
      })
    }
  }

  // Final CTA section - return to default (chuparosa/red)
  // Always reset to page default - this is the final section
  // Nav color is handled by CSS only on about page
  const finalCTA = document.querySelector('.content-section--centered:last-of-type')
  if (finalCTA && !document.body.classList.contains('page-about')) {
    ScrollTrigger.create({
      trigger: finalCTA,
      start: 'top bottom', // Changed from 'top center' to fire later, after love-notes unpins
      end: 'bottom top',
      onEnter: () => {
          setBodyTheme('') // This handles both theme class removal and nav color reset
      },
      onEnterBack: () => {
          setBodyTheme('') // This handles both theme class removal and nav color reset
      },
    })
  }

  // Philosophy section redaction animation
  initPhilosophyRedaction(false, viewportHeight)

  // Credentials section shadow animation
  initCredentialsShadow(false)

  // Hero background parallax effect
  initHeroParallax(false)

  // Pin full-height centered sections
  initPinnedSections()
  
  // Love Letters section scroll animations
  initLoveLettersScroll(false, viewportHeight)
  
  // Refresh ScrollTrigger after pinned sections are set up to ensure subsequent triggers calculate correctly
  if (ScrollTrigger) {
    ScrollTrigger.refresh()
  }
  
  // Mouse trail effect
  initMouseTrail(prefersReducedMotion)
  
  // Creator page: Pin media while content scrolls (GSAP ScrollTrigger + Lenis).
  // pinSpacing: true + anticipatePin keep unpin from jumping vs pinSpacing: false.
  ScrollTrigger.matchMedia({
    [`(min-width: ${BREAKPOINTS.tablet}px)`]: function () {
      if (!document.body.classList.contains('page-creator')) return () => {}

      const container = document.querySelector('.page-creator .content-section__container')
      const media = document.querySelector(
        '.page-creator .content-section--media-bleed .content-section__media'
      )

      if (!container || !media) return () => {}

      const st = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        pin: media,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      })

      return () => st.kill()
    },
  })

  // Form sections: pin copy column while form scrolls — see scroll-sections.js
  ScrollTrigger.matchMedia({
    [`(min-width: ${BREAKPOINTS.tablet}px)`]: function () {
      return initFormSections()
    },
  })

  // Pins above were registered after the earlier refresh; measure again + sync Lenis.
  requestAnimationFrame(() => {
    ScrollTrigger.refresh()
    window.lenis?.resize()
  })
  
  // Consolidated resize handler (debounced with RAF for performance)
  let resizeTimeout
  let resizeRAF = null
  window.addEventListener('resize', () => {
    // Update cached viewport dimensions immediately
    viewportWidth = window.innerWidth
    viewportHeight = window.innerHeight
    
    // Skip ScrollTrigger refresh on mobile to avoid issues with iOS Safari
    // Mobile animations are simple and don't need refresh
    if (viewportWidth < 768) return
    
    // Debounce ScrollTrigger refresh
    clearTimeout(resizeTimeout)
    if (resizeRAF) {
      cancelAnimationFrame(resizeRAF)
    }
    
    resizeTimeout = setTimeout(() => {
      resizeRAF = requestAnimationFrame(() => {
        ScrollTrigger.refresh()
        resizeRAF = null
      })
    }, 150)
  })
}

// Setup early scroll detection immediately (before DOMContentLoaded)
setupEarlyScrollDetection()

// Initialize Lenis first, then curtain/intro, then animations
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initLenis()
    
    // Lazy load intro only on homepage
    const pathname = window.location.pathname
    const isHomepage = pathname === '/' || pathname === '/index.html' || pathname.endsWith('/index.html')
    
    if (isHomepage) {
      import('./intro.js').then(({ initIntro, initCurtain }) => {
        initCurtain(prefersReducedMotion)
        initIntro(prefersReducedMotion, viewportWidth).catch(error => {
          console.error('Intro animation failed:', error)
        })
      })
    } else {
      import('./intro.js').then(({ initCurtain }) => {
        initCurtain(prefersReducedMotion)
      })
    }
    
    initAnimations()
  })
} else {
  initLenis()
  
  // Lazy load intro only on homepage
  const pathname = window.location.pathname
  const isHomepage = pathname === '/' || pathname === '/index.html' || pathname.endsWith('/index.html')
  
  if (isHomepage) {
    import('./intro.js').then(({ initIntro, initCurtain }) => {
      initCurtain(prefersReducedMotion)
      initIntro(prefersReducedMotion, viewportWidth).catch(error => {
        console.error('Intro animation failed:', error)
      })
    })
  } else {
    import('./intro.js').then(({ initCurtain }) => {
      initCurtain(prefersReducedMotion)
    })
  }
  
  initAnimations()
}

