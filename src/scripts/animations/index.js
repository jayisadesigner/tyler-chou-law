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

// Initialize Lenis for smooth scrolling
let lenis = null

function initLenis() {
  // Skip Lenis on mobile — causes issues with ScrollTrigger pins on iOS Safari
  // The scroller proxy and smooth scroll conflict with position:fixed pinning
  if (window.innerWidth < 768) {
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
import { initPinnedSections, initLoveLettersScroll, initPhilosophyRedaction, initCredentialsShadow } from './scroll-sections.js'
import { initLineAnimations } from './line-animations.js'
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
    // Set hero content to visible
    const heroContent = document.querySelector('.hero-content')
    if (heroContent) {
      gsap.set(heroContent, { opacity: 1, y: 0 })
    }
    
    // Set all section reveals to visible
    document.querySelectorAll('.section-reveal').forEach((section) => {
      gsap.set(section, { opacity: 1, y: 0 })
    })
    
    // Set flowers to final rotation state
    animateFlowerRotation('.about-flower', '.section--featured-image--left', prefersReducedMotion)
    animateFlowerRotation('.palo-verde-flower', '.palo-verde, #creatorarq-investment', prefersReducedMotion)
    
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
    initLineAnimations(true, viewportHeight) // Pass true for reduced motion
    initHeroParallax(true) // Pass true for reduced motion
    initLoveLettersScroll(true, viewportHeight) // Pass true for reduced motion
    initMouseTrail(true) // Pass true for reduced motion
    
    return // Skip all animations
  }

  // Hero content reveal animation — skip if intro handled it
  const introRan = document.querySelector('.intro.is-complete')
  if (!introRan) {
    const heroSection = document.querySelector('.hero')
    if (heroSection) {
      const heroContent = heroSection.querySelector('.hero-content')
      
      if (heroContent) {
        gsap.from(heroContent, {
          opacity: 0,
          y: 50,
          duration: 1,
          ease: 'power3.out',
          delay: 0.3,
        })
      }
    }
  }

  // Scroll-triggered section reveals
  if (!ScrollTrigger) return

  // Section reveal animations
  // Use ScrollTrigger.create() pattern (proven to work on mobile) instead of gsap.to with scrollTrigger
  // This matches the working pattern used in philosophy section and love-notes
  document.querySelectorAll('.section-reveal').forEach((section) => {
    const sectionId = section.id || section.className.split(' ')[1] || 'section'
    
    // Set initial state - use inline style to override CSS opacity: 1
    // This ensures sections start hidden regardless of CSS
    section.style.opacity = '0'
    gsap.set(section, { 
      y: 60,
      immediateRender: true,
    })
    
    // Track if section has been animated (prevent re-animation on scroll back)
    let hasAnimated = false
    
    // Check if section is already in viewport on load
    const rect = section.getBoundingClientRect()
    const isInView = rect.top < viewportHeight * 0.8 && rect.bottom > 0
    
    if (isInView) {
      // Section already visible on load - animate immediately
      hasAnimated = true
      gsap.to(section, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
          // Clean up inline style after animation
          section.style.opacity = ''
        }
      })
    } else {
      // Use ScrollTrigger.create() pattern (works reliably on mobile)
      ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        id: `section-reveal-${sectionId}`,
        onEnter: () => {
          // Only animate if not already animated
          if (!hasAnimated) {
            hasAnimated = true
            gsap.to(section, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power2.out',
              onComplete: () => {
                // Clean up inline style after animation
                section.style.opacity = ''
              }
            })
          }
        },
        // Keep section visible when scrolling back up
        onLeaveBack: () => {
          // Section stays visible - no action needed
        }
      })
    }
  })

  // Flower rotation animations
  animateFlowerRotation('.about-flower', '.section--featured-image--left', prefersReducedMotion)
  animateFlowerRotation('.palo-verde-flower', '.palo-verde, #creatorarq-investment', prefersReducedMotion)
  
  // Section-based theme switching
  // Palo Verde section - green background
  // Changed end from 'bottom top' to 'bottom bottom' to ensure it stays active
  // until the section fully scrolls out, preventing philosophy section from overriding too early
  createThemeScrollTrigger('.palo-verde', 'top center', 'bottom bottom', 'bg-palo-verde')

  // Philosophy section - bone background
  // Theme switching is handled in initPhilosophyRedaction pinned ScrollTrigger (matches love-notes pattern)

  // Love Letters section - bone background
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
  // Use explicit reset to avoid conflicts with philosophy/love-notes sections
  const finalCTA = document.querySelector('.content-section--centered:last-of-type')
  if (finalCTA) {
    ScrollTrigger.create({
      trigger: finalCTA,
      start: 'top bottom', // Changed from 'top center' to fire later, after love-notes unpins
      end: 'bottom top',
      onEnter: () => {
        // Force reset: remove theme classes and set default nav color
        document.body.classList.remove('bg-palo-verde', 'bg-bone')
        // Set default nav color based on page class
        let defaultColor = 'var(--nav-text-on-chuparosa-600, var(--chuparosa-100))'
        if (document.body.classList.contains('page-services') || 
            document.body.classList.contains('page-about') || 
            document.body.classList.contains('page-roster')) {
          defaultColor = 'var(--bone)'
        } else if (document.body.classList.contains('page-love-letters')) {
          defaultColor = 'var(--obsidian)'
        }
        document.body.style.setProperty('--nav-text-color', defaultColor)
        document.body.style.setProperty('--nav-hamburger-color', defaultColor)
      },
      onEnterBack: () => {
        // Same reset logic when scrolling back up
        document.body.classList.remove('bg-palo-verde', 'bg-bone')
        let defaultColor = 'var(--nav-text-on-chuparosa-600, var(--chuparosa-100))'
        if (document.body.classList.contains('page-services') || 
            document.body.classList.contains('page-about') || 
            document.body.classList.contains('page-roster')) {
          defaultColor = 'var(--bone)'
        } else if (document.body.classList.contains('page-love-letters')) {
          defaultColor = 'var(--obsidian)'
        }
        document.body.style.setProperty('--nav-text-color', defaultColor)
        document.body.style.setProperty('--nav-hamburger-color', defaultColor)
      },
    })
  }

  // Philosophy section redaction animation
  initPhilosophyRedaction(false, viewportHeight)

  // Credentials section shadow animation
  initCredentialsShadow(false)

  // Line animations for headings
  initLineAnimations(false, viewportHeight)

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
  
  // Creator page: Pin media while content scrolls (GSAP ScrollTrigger works with Lenis)
  if (document.body.classList.contains('page-creator')) {
    const container = document.querySelector('.page-creator .content-section__container')
    const media = document.querySelector('.page-creator .content-section--media-bleed .content-section__media')
    
    if (container && media) {
      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        pin: media,
        pinSpacing: false
      })
    }
  }
  
  // Unified nav color ScrollTrigger: covers both philosophy and love-notes sections
  // Mobile/Tablet only - Desktop uses pinned ScrollTrigger callbacks
  // Philosophy sets bg-bone, love-notes maintains it, resets when love-notes leaves
  ScrollTrigger.matchMedia({
    "(max-width: 1279px)": function() {
      const philosophySection = document.querySelector('.philosophy')
      const loveNotesSection = document.querySelector('.love-notes--full-height')
      
      if (philosophySection) {
        // Philosophy section: set bg-bone when it enters
        ScrollTrigger.create({
          trigger: philosophySection,
          start: 'top bottom',
          end: 'bottom top',
          onEnter: () => setBodyTheme('bg-bone'),
          onEnterBack: () => setBodyTheme('bg-bone'),
          onLeaveBack: () => setBodyTheme(''), // Reset when scrolling back up past philosophy
        })
      }
      
      if (loveNotesSection) {
        // Love-notes section: maintain bg-bone, reset when it leaves (scrolling down)
        ScrollTrigger.create({
          trigger: loveNotesSection,
          start: 'top bottom',
          end: 'bottom top',
          onEnter: () => setBodyTheme('bg-bone'), // Ensure it's set when love-notes enters
          onEnterBack: () => setBodyTheme('bg-bone'), // Maintain when scrolling back into love-notes
          onLeave: () => setBodyTheme(''), // Reset when love-notes leaves (scrolling down)
        })
      }
    }
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
        initIntro(prefersReducedMotion, viewportWidth)
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
      initIntro(prefersReducedMotion, viewportWidth)
    })
  } else {
    import('./intro.js').then(({ initCurtain }) => {
      initCurtain(prefersReducedMotion)
    })
  }
  
  initAnimations()
}

