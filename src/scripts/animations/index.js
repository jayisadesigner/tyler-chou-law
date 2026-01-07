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
import { initPinnedSections, initLoveLettersScroll, initPhilosophyRedaction, initCredentialsShadow, initFormSections } from './scroll-sections.js'
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
    
    // Set flowers to final rotation state (only if elements exist)
    const aboutFlower = document.querySelector('.about-flower')
    const aboutSection = document.querySelector('.section--featured-image--left')
    if (aboutFlower && aboutSection) {
    animateFlowerRotation('.about-flower', '.section--featured-image--left', prefersReducedMotion)
    }
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
    const paloVerdeTrigger = document.querySelector('.palo-verde, #creatorarq-investment')
    if (paloVerdeFlower && paloVerdeTrigger) {
  animateFlowerRotation('.palo-verde-flower', '.palo-verde, #creatorarq-investment', prefersReducedMotion)
    }
  }
  
  // Section-based theme switching
  // Palo Verde section - green background (on about page)
  // Only create ScrollTrigger on about page
  // Matches original home page implementation: stays green until section fully scrolls out
  // Resets when scrolling back up past the section
  if (document.body.classList.contains('page-about')) {
    const paloVerdeSection = document.querySelector('.palo-verde')
    if (paloVerdeSection) {
      // Use IntersectionObserver for direct visibility-based triggering (independent of pinned sections)
      // This directly checks if the section is visible in the viewport
      let hasBeenVisible = false
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.1 // At least 10% visible
          const rect = entry.boundingClientRect
          const scrolledPast = rect.top < 0 && rect.bottom < window.innerHeight
          
          if (isVisible) {
            // Section is visible - set green background
            hasBeenVisible = true
            setBodyTheme('bg-palo-verde')
          } else if (scrolledPast && hasBeenVisible) {
            // Scrolled past section - keep green until end of page
            // Don't reset - keep green background
          } else if (!scrolledPast && hasBeenVisible) {
            // Scrolled back up before section - reset to default
            hasBeenVisible = false
            setBodyTheme('')
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
    } else {
    }
  }

  // Philosophy section - bone background (on about page)
  // Theme switching is handled in initPhilosophyRedaction pinned ScrollTrigger (matches love-notes pattern)

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
  // Use explicit reset to avoid conflicts with philosophy/love-notes sections
  // Exception: On about page, keep palo-verde green background until end of page
  const finalCTA = document.querySelector('.content-section--centered:last-of-type')
  if (finalCTA) {
    ScrollTrigger.create({
      trigger: finalCTA,
      start: 'top bottom', // Changed from 'top center' to fire later, after love-notes unpins
      end: 'bottom top',
      onEnter: () => {
        // On about page, keep palo-verde green background (don't reset)
        // On other pages, reset to default
        if (!document.body.classList.contains('page-about')) {
          setBodyTheme('') // This handles both theme class removal and nav color reset
        }
      },
      onEnterBack: () => {
        // Same logic when scrolling back up
        if (!document.body.classList.contains('page-about')) {
          setBodyTheme('') // This handles both theme class removal and nav color reset
        }
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
  
  // Form sections: Pin content while form scrolls (GSAP ScrollTrigger works with Lenis)
  // Only on tablet+ where we have side-by-side layout
  ScrollTrigger.matchMedia({
    "(min-width: 768px)": function() {
      const formSections = document.querySelectorAll('.content-section--form')
      
      formSections.forEach(section => {
        const container = section.querySelector('.content-section__container')
        const content = section.querySelector('.content-section__content')
        
        if (container && content) {
          ScrollTrigger.create({
            trigger: container,
            start: "top top",
            end: "bottom bottom",
            pin: content,
            pinSpacing: false,
            invalidateOnRefresh: true
          })
        }
      })
    }
  })
  
  // Unified nav color ScrollTrigger: handles love-notes section on home page
  // Mobile/Tablet only - Desktop uses pinned ScrollTrigger callbacks
  // Philosophy is now on about page, so love-notes sets bg-bone when it enters and resets when it leaves
  ScrollTrigger.matchMedia({
    "(max-width: 1279px)": function() {
      // Philosophy section is on about page, handled separately
      // Only handle love-notes on home page
      if (document.body.classList.contains('page-index')) {
      const loveNotesSection = document.querySelector('.love-notes--full-height')
      
      if (loveNotesSection) {
          // Love-notes section: set bg-bone when it enters, reset when it leaves
        ScrollTrigger.create({
          trigger: loveNotesSection,
          start: 'top bottom',
          end: 'bottom top',
            onEnter: () => setBodyTheme('bg-bone'), // Set when love-notes enters
          onEnterBack: () => setBodyTheme('bg-bone'), // Maintain when scrolling back into love-notes
          onLeave: () => setBodyTheme(''), // Reset when love-notes leaves (scrolling down)
            onLeaveBack: () => setBodyTheme(''), // Reset when scrolling back up past love-notes
        })
        }
      }
      
      // Philosophy section on about page
      // No background color change needed - about page already has bone background by default
      // Removed ScrollTrigger for background color changes
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

