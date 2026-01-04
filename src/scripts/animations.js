/**
 * GSAP Animations
 * Handles all page animations including hero reveals and scroll triggers
 * 
 * Required HTML elements for animations:
 * - .hero-content (hero section fade-in)
 * - .section-reveal (scroll-triggered section reveals)
 * - .background-image__img (parallax background images)
 * - .philosophy (with nested: .philosophy-redaction--first, .philosophy-redaction--second, 
 *   .philosophy-text--content, .philosophy-text--king, .philosophy-text--queen)
 * - .credentials (with nested: .credentials-card, .credentials-list, 
 *   .credentials-header-section, .credentials-badge)
 * - [js-line-animation] (text line animations)
 * - .content-section--pinned (pinned scroll sections)
 * - .love-notes--full-height (Love Letters section with carousel parallax on mobile, 
 *   pinned section with cards scrolling through on desktop - responsive on resize)
 * 
 * Optional (page-specific):
 * - .about-flower (about page - flower rotation)
 * - .palo-verde-flower (palo verde section - flower rotation)
 * - .about (about section - trigger for flower)
 * - .palo-verde (palo verde section - trigger for flower and background color)
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

// Register GSAP plugins
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

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

  // Lenis scroll integrated with ScrollTrigger below

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

    // Resize handling consolidated below
  }

  return lenis
}

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Cache viewport dimensions (updated on resize)
let viewportWidth = window.innerWidth
let viewportHeight = window.innerHeight

/**
 * Get spacing value from CSS variable (converts rem to pixels)
 * @param {string} variableName - CSS variable name (e.g., '--space-lg')
 * @returns {number} Spacing value in pixels
 */
function getSpacingValue(variableName) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName).trim()
  return Math.ceil(parseFloat(value) * 16) // Convert rem to pixels
}

/**
 * Helper function to manage body theme classes efficiently
 * Removes all theme classes and adds the specified one
 * @param {string} themeClass - Theme class to apply (e.g., 'bg-palo-verde', 'bg-bone', or '' for default)
 */
function setBodyTheme(themeClass) {
  const allThemes = ['bg-palo-verde', 'bg-bone']
  // Remove all themes in one operation
  document.body.classList.remove(...allThemes)
  // Add new theme if provided
  if (themeClass) {
    document.body.classList.add(themeClass)
    
    // Set nav colors based on theme via inline styles (reliable during pinned scrolls)
    let navColor = ''
    if (themeClass === 'bg-bone') {
      navColor = 'var(--nav-text-on-bone, var(--obsidian))'
    } else if (themeClass === 'bg-palo-verde') {
      navColor = 'var(--nav-text-on-palo-verde-600, var(--palo-verde-50))'
    }
    
    if (navColor) {
      document.body.style.setProperty('--nav-text-color', navColor)
      document.body.style.setProperty('--nav-hamburger-color', navColor)
    }
  } else {
    // Reset to default: check page class and set appropriate default immediately
    // This matches the CSS logic and avoids timing issues with requestAnimationFrame
    let defaultColor = 'var(--nav-text-on-chuparosa-600, var(--chuparosa-100))' // Default for home/contact/creator/blog-post
    
    if (document.body.classList.contains('page-services') || 
        document.body.classList.contains('page-about') || 
        document.body.classList.contains('page-roster')) {
      defaultColor = 'var(--bone)'
    } else if (document.body.classList.contains('page-love-letters')) {
      defaultColor = 'var(--obsidian)'
    }
    
    document.body.style.setProperty('--nav-text-color', defaultColor)
    document.body.style.setProperty('--nav-hamburger-color', defaultColor)
  }
}

/**
 * Initialize nav colors from CSS - promotes CSS values to inline styles so JS can override
 * Called early in initAnimations() to ensure CSS values are available for JavaScript to override
 */
function initNavColors() {
  const computed = getComputedStyle(document.body)
  const textColor = computed.getPropertyValue('--nav-text-color').trim()
  const hamburgerColor = computed.getPropertyValue('--nav-hamburger-color').trim()
  
  if (textColor) {
    document.body.style.setProperty('--nav-text-color', textColor)
    document.body.style.setProperty('--nav-hamburger-color', hamburgerColor || textColor)
  }
}

/**
 * Helper function to manage nav colors via CSS custom properties
 * Always sets on body for consistency - inline styles override CSS reliably during pinned scrolls
 * @param {string} textColor - CSS variable or color value for nav text (e.g., 'var(--obsidian)' or 'var(--chuparosa-950)')
 * @param {string} hamburgerColor - CSS variable or color value for hamburger icon (optional, defaults to textColor)
 */
function setNavColor(textColor, hamburgerColor = null) {
  if (textColor) {
    document.body.style.setProperty('--nav-text-color', textColor)
    document.body.style.setProperty('--nav-hamburger-color', hamburgerColor || textColor)
  } else {
    // Reset to default: check page class and set appropriate default immediately
    // This matches setBodyTheme logic and avoids timing issues
    let defaultColor = 'var(--nav-text-on-chuparosa-600, var(--chuparosa-100))' // Default for home/contact/creator/blog-post
    
    if (document.body.classList.contains('page-services') || 
        document.body.classList.contains('page-about') || 
        document.body.classList.contains('page-roster')) {
      defaultColor = 'var(--bone)'
    } else if (document.body.classList.contains('page-love-letters')) {
      defaultColor = 'var(--obsidian)'
    }
    
    document.body.style.setProperty('--nav-text-color', defaultColor)
    document.body.style.setProperty('--nav-hamburger-color', defaultColor)
  }
}

/**
 * Returns ScrollTrigger callbacks for theme switching
 * Reusable helper to avoid repeating theme switching code
 * @param {string} themeClass - Theme class to apply when entering section
 * @returns {Object} ScrollTrigger callback object with onEnter, onLeave, onEnterBack, onLeaveBack
 */
function getThemeCallbacks(themeClass) {
  return {
    onEnter: () => setBodyTheme(themeClass),
    onLeave: () => setBodyTheme(''),
    onEnterBack: () => setBodyTheme(themeClass),
    onLeaveBack: () => setBodyTheme(''),
  }
}

/**
 * Calculate scroll multiplier based on viewport height
 * Used for responsive pinned section durations
 * @param {number} min - Minimum multiplier
 * @param {number} max - Maximum multiplier
 * @param {number} divisor - Divisor for viewport height calculation
 * @returns {number} Calculated scroll multiplier
 */
function calculateScrollMultiplier(min, max, divisor) {
  return Math.max(min, Math.min(max, viewportHeight / divisor))
}

/**
 * Create a reusable pinned ScrollTrigger configuration
 * @param {Object} options - Configuration options
 * @param {Element|string} options.trigger - Trigger element or selector
 * @param {string} options.start - Start position (e.g., 'top top')
 * @param {string} options.end - End position (e.g., '+=200%')
 * @param {number} options.scrub - Scrub value (default: 1)
 * @param {Object} options.callbacks - Additional callbacks (onEnter, onLeave, etc.)
 * @returns {Object} ScrollTrigger configuration object
 */
function createPinnedScrollConfig({ trigger, start, end, scrub = 1, callbacks = {} }) {
  return {
    trigger,
    start,
    end,
    scrub,
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    ...callbacks,
  }
}

/**
 * Create a simple theme switching ScrollTrigger
 * @param {Element|string} trigger - Trigger element or selector
 * @param {string} start - Start position (default: 'top center')
 * @param {string} end - End position (default: 'bottom top')
 * @param {string} themeClass - Theme class to apply (or '' for default)
 */
function createThemeScrollTrigger(trigger, start = 'top center', end = 'bottom top', themeClass = '') {
  if (typeof trigger === 'string') {
    trigger = document.querySelector(trigger)
  }
  if (!trigger) return

  ScrollTrigger.create({
    trigger,
    start,
    end,
    ...(themeClass ? getThemeCallbacks(themeClass) : {
      onEnter: () => setBodyTheme(''),
      onEnterBack: () => setBodyTheme(''),
    }),
  })
}

/**
 * Pin centered sections during scroll
 * Creates a sticky effect for sections with .content-section--pinned
 * Note: Use --pinned modifier separately from --full-height for more control
 */
function initPinnedSections() {
  const pinnedSections = document.querySelectorAll('.content-section--pinned')
  
  if (!pinnedSections.length || !ScrollTrigger) return
  
  pinnedSections.forEach(section => {
    ScrollTrigger.create(
      createPinnedScrollConfig({
        trigger: section,
        start: 'top top',
        end: '+=200%', // Pin for 2 viewport heights of scroll
      })
    )
  })
}

/**
 * Love Letters section scroll animations
 * Mobile: Horizontal parallax effect on carousel cards (scale: 1)
 * Desktop: Pinned section with cards scrolling through viewport, parallax by depth (scale from CSS --scale)
 * Uses matchMedia for responsive behavior - animations update automatically on resize
 * GSAP handles all transforms to avoid CSS/JS conflicts
 * @param {boolean} reducedMotion - If true, skip animations
 */
function initLoveLettersScroll(reducedMotion = false) {
  const loveNotesSection = document.querySelector('.love-notes--full-height')
  if (!loveNotesSection || !ScrollTrigger) return
  
  const cards = loveNotesSection.querySelectorAll('.roster-card--testimonial')
  const headline = loveNotesSection.querySelector('.love-notes__headline')
  
  if (reducedMotion) {
    // Set all cards to final visible state
    gsap.set(cards, { x: 0, y: 0, opacity: 1 })
    return
  }
  
  // Use matchMedia for responsive animations that update on resize
  ScrollTrigger.matchMedia({
    // Mobile: Horizontal parallax (subtle opposite direction scrolling)
    // Top row moves right, bottom row moves left on scroll
    "(max-width: 767px)": function() {
      const topCards = loveNotesSection.querySelectorAll('.love-notes__carousel--top .roster-card--testimonial')
      const bottomCards = loveNotesSection.querySelectorAll('.love-notes__carousel--bottom .roster-card--testimonial')
      
      // Reset cards to base state
      gsap.set(cards, { x: 0, y: 0, scale: 1, opacity: 1 })
      
      // Create timeline with scrub for smooth scroll-linked animation
      const mobileTl = gsap.timeline({
        scrollTrigger: {
          trigger: loveNotesSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          id: 'love-notes-mobile',
          invalidateOnRefresh: true,
        },
      })
      
      // Top carousel - moves right on scroll
      topCards.forEach((card, index) => {
        const speed = 0.6 + (index * 0.15)
        mobileTl.to(card, {
          x: 60 * speed,
          ease: 'none',
        }, 0)
      })
      
      // Bottom carousel - moves left on scroll
      bottomCards.forEach((card, index) => {
        const speed = 0.6 + (index * 0.15)
        mobileTl.to(card, {
          x: -60 * speed,
          ease: 'none',
        }, 0)
      })
    },
    
    // Tablet: Horizontal parallax (safe scrub without pin)
    "(min-width: 768px) and (max-width: 1279px)": function() {
      const topCards = loveNotesSection.querySelectorAll('.love-notes__carousel--top .roster-card--testimonial')
      const bottomCards = loveNotesSection.querySelectorAll('.love-notes__carousel--bottom .roster-card--testimonial')
      
      // Reset cards to base state for tablet (no scale)
      gsap.set(cards, { x: 0, y: 0, scale: 1 })
      
      const tabletTl = gsap.timeline({
        scrollTrigger: {
          trigger: loveNotesSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          id: 'love-notes-tablet',
          invalidateOnRefresh: true,
        },
      })
      
      // Top carousel - moves right
      topCards.forEach((card, index) => {
        const speed = 0.6 + (index * 0.15)
        tabletTl.to(card, {
          x: 60 * speed,
          ease: 'none',
        }, 0)
      })
      
      // Bottom carousel - moves left
      bottomCards.forEach((card, index) => {
        const speed = 0.6 + (index * 0.15)
        tabletTl.to(card, {
          x: -60 * speed,
          ease: 'none',
        }, 0)
      })
    },
    
    // Desktop: Pin section and scroll cards through viewport with parallax
    "(min-width: 1280px)": function() {
      if (!cards.length) return
      
      // Set initial scale from CSS custom property for each card (batch DOM reads)
      const cardStyles = Array.from(cards).map(card => ({
        card,
        scale: parseFloat(getComputedStyle(card).getPropertyValue('--scale').trim() || '1')
      }))
      cardStyles.forEach(({ card, scale }) => {
        gsap.set(card, { x: 0, y: 0, scale })
      })
      
      // Headline is centered in section via CSS, ensure it's visible
      if (headline) {
        gsap.set(headline, { opacity: 1 })
      }
      
      // Create a pinned scroll-through effect
      const desktopTl = gsap.timeline({
        scrollTrigger: createPinnedScrollConfig({
          trigger: loveNotesSection,
          start: 'top top',
          end: '+=1200%', // Pin for 12x viewport height - ensures all cards fully scroll through
          scrub: 1,
          callbacks: {
            id: 'love-notes-desktop',
            invalidateOnRefresh: true,
            // Set nav color when love-notes enters (ensures it's set even if philosophy already left)
            onEnter: () => setBodyTheme('bg-bone'),
            onEnterBack: () => setBodyTheme('bg-bone'),
            // Reset nav color when love-notes unpins (scrolling down past the section)
            onLeave: () => setBodyTheme(''),
          },
        }),
      })
      
      // Cards move through viewport based on depth (batch DOM reads)
      const cardDepths = Array.from(cards).map(card => ({
        card,
        depth: parseInt(getComputedStyle(card).getPropertyValue('--depth').trim() || '2')
      }))
      
      cardDepths.forEach(({ card, depth }) => {
        
        // Movement distance based on depth - all cards scroll through and off screen
        // depth 1 (back) = slower movement (less distance)
        // depth 2 (mid) = normal movement
        // depth 3 (front) = faster movement (more distance)
        // Increased multipliers to ensure all cards fully scroll through viewport
        const depthMultipliers = { 1: 1.5, 2: 2.0, 3: 2.5 }
        const yMovement = -viewportHeight * (depthMultipliers[depth] || 2.0)
        
        desktopTl.to(card, {
          y: yMovement,
          ease: 'none',
        }, 0) // All animations start at the same time for parallax effect
      })
    }
  })
}

/**
 * Animate flower rotation on scroll (reusable)
 * @param {string} flowerSelector - CSS selector for flower element
 * @param {string} triggerSelector - CSS selector for trigger section
 */
function animateFlowerRotation(flowerSelector, triggerSelector) {
  const flower = document.querySelector(flowerSelector)
  const trigger = document.querySelector(triggerSelector)
  
  if (!flower || !trigger) return
  
  if (prefersReducedMotion) {
    gsap.set(flower, { rotation: 30 })
    return
  }
  
  gsap.to(flower, {
    rotation: 30,
    ease: 'none',
    scrollTrigger: {
      trigger: trigger,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    },
  })
}

/**
 * Reusable line animation effect
 * Used for text line animations across the site (headlines, nav items, etc.)
 * @param {NodeList|Array} elements - Elements to animate (usually .line-inner elements)
 * @param {Object} options - Animation options to override defaults
 * @returns {gsap.core.Tween} GSAP animation instance
 */
export function animateLineElements(elements, options = {}) {
  const defaults = {
    y: '0%',
    opacity: 1,
    duration: 0.9,
    stagger: 0.1,
    ease: 'power2.out',
    delay: 0
  }
  
  const config = { ...defaults, ...options }
  
  return gsap.to(elements, config)
}

/**
 * Animate Character Elements (reusable utility)
 * Similar to animateLineElements but for character-level animations
 * @param {NodeList|Array} elements - Character elements to animate
 * @param {Object} options - GSAP animation options
 * @returns {gsap.core.Tween} GSAP animation instance
 */
export function animateCharElements(elements, options = {}) {
  const defaults = {
    x: '0%',
    opacity: 1,
    duration: 0.8,
    stagger: 0.03,
    ease: 'power3.out',
    delay: 0
  }
  
  const config = { ...defaults, ...options }
  
  return gsap.to(elements, config)
}

/**
 * Split text into characters and prepare for animation
 * @param {HTMLElement} element - Element containing text to split
 * @returns {NodeList} Character inner elements ready for animation
 */
export function splitTextIntoChars(element) {
  if (!element) return []
  
  const originalText = element.textContent.trim()
  const chars = originalText.split('')
  
  // Clear and rebuild with character structure
  element.innerHTML = ''
  element.style.overflow = 'hidden'
  
  chars.forEach((char) => {
    const charSpan = document.createElement('span')
    charSpan.className = 'char'
    charSpan.style.display = 'inline-block'
    charSpan.style.overflow = 'hidden'
    
    const charInner = document.createElement('span')
    charInner.className = 'char-inner'
    charInner.style.display = 'inline-block'
    charInner.textContent = char === ' ' ? '\u00A0' : char // Non-breaking space
    
    charSpan.appendChild(charInner)
    element.appendChild(charSpan)
  })
  
  return element.querySelectorAll('.char-inner')
}

// Initialize animations when DOM is ready
function initAnimations() {
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
    animateFlowerRotation('.about-flower', '.section--featured-image--left')
    animateFlowerRotation('.palo-verde-flower', '.palo-verde, #creatorarq-investment')
    
    // Set background colors
    const defaultColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--chuparosa-600').trim()
    gsap.set(document.body, { backgroundColor: defaultColor })
    
    // Set background images to final state (no parallax)
    document.querySelectorAll('.background-image__img').forEach((img) => {
      gsap.set(img, { scale: 1, yPercent: 0 })
    })
    
    // Initialize static versions of complex animations
    initPhilosophyRedaction(true) // Pass true for reduced motion
    initCredentialsShadow(true) // Pass true for reduced motion
    initLineAnimations(true) // Pass true for reduced motion
    initHeroParallax(true) // Pass true for reduced motion
    initLoveLettersScroll(true) // Pass true for reduced motion
    
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
  animateFlowerRotation('.about-flower', '.section--featured-image--left')
  animateFlowerRotation('.palo-verde-flower', '.palo-verde, #creatorarq-investment')
  
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
  initPhilosophyRedaction(false)

  // Credentials section shadow animation
  initCredentialsShadow(false)

  // Line animations for headings
  initLineAnimations(false)

  // Hero background parallax effect
  initHeroParallax(false)

  // Pin full-height centered sections
  initPinnedSections()
  
  // Love Letters section scroll animations
  initLoveLettersScroll(false)
  
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

/**
 * Hero background parallax scroll effect
 * Moves background image slower than scroll for subtle depth effect
 * Also supports content sections with --parallax modifier
 * @param {boolean} reducedMotion - If true, skip animation and show final state
 */
function initHeroParallax(reducedMotion = false) {
  const backgroundImages = document.querySelectorAll('.background-image__img')
  const backgroundVideos = document.querySelectorAll('.background-image__video')
  
  if ((!backgroundImages.length && !backgroundVideos.length) || !ScrollTrigger) return
  
  // Handle images
  backgroundImages.forEach(img => {
    if (reducedMotion) {
      // Skip animation, show final state
      gsap.set(img, { scale: 1, yPercent: 0 })
      return
    }
    
    // Find parent section for trigger (hero or content-section with parallax)
    const heroSection = img.closest('.hero--inner-page') || img.closest('.hero')
    const contentSection = img.closest('.content-section--parallax')
    const triggerSection = heroSection || contentSection
    
    if (!triggerSection) return
    
    // Moderate parallax: scale + y movement for reliable coverage
    // Image is already taller in CSS (120%) and offset (-10%) for initial coverage
    gsap.to(img, {
      scale: 1.15, // Zoom in 15% (covers more area, prevents gaps)
      yPercent: 10, // Move down 10% (image is already taller, so this is safe)
      ease: 'none', // Linear movement for smooth parallax
      scrollTrigger: {
        trigger: triggerSection,
        start: 'top bottom', // Start when section top hits viewport bottom
        end: 'bottom top', // End when section bottom hits viewport top
        scrub: 1, // Smooth scrubbing (1 = 1 second lag for smoothness)
        invalidateOnRefresh: true // Recalculate on resize
      }
    })
  })
  
  // Handle videos (iframes)
  backgroundVideos.forEach(video => {
    if (reducedMotion) {
      // Skip animation, show final state
      gsap.set(video, { scale: 1, xPercent: -50, yPercent: -50 })
      return
    }
    
    // Find parent section for trigger (hero or content-section with parallax)
    const heroSection = video.closest('.hero--inner-page') || video.closest('.hero')
    const contentSection = video.closest('.content-section--parallax')
    const triggerSection = heroSection || contentSection
    
    if (!triggerSection) return
    
    // For videos, use scale and yPercent movement for parallax effect
    // Video is centered with translate(-50%, -50%), so use xPercent/yPercent to maintain centering
    // Set initial centered position using GSAP (replaces CSS translate(-50%, -50%))
    gsap.set(video, { xPercent: -50, yPercent: -50 })
    
    // Scale and yPercent movement for parallax effect
    gsap.to(video, {
      scale: 1.15, // Zoom in 15% (covers more area, prevents gaps)
      yPercent: -40, // Move from -50% (centered) to -40% (down 10%) for parallax
      ease: 'none', // Linear movement for smooth parallax
      scrollTrigger: {
        trigger: triggerSection,
        start: 'top bottom', // Start when section top hits viewport bottom
        end: 'bottom top', // End when section bottom hits viewport top
        scrub: 1, // Smooth scrubbing (1 = 1 second lag for smoothness)
        invalidateOnRefresh: true // Recalculate on resize
      }
    })
  })
}

/**
 * Philosophy section redaction animation
 * Mobile-first: Same redaction animation on all screen sizes
 * Redacts "Content" and "is king" text and fades in "ip is Queen" based on scroll progress
 * Fully responsive - calculates widths/heights dynamically based on actual text dimensions
 * @param {boolean} reducedMotion - If true, skip animation and show final state
 */
function initPhilosophyRedaction(reducedMotion = false) {
  const philosophySection = document.querySelector('.philosophy')
  if (!philosophySection) return

  const redactionFirst = philosophySection.querySelector('.philosophy-redaction--first')
  const redactionSecond = philosophySection.querySelector('.philosophy-redaction--second')
  const queenText = philosophySection.querySelector('.philosophy-text--queen')
  const contentText = philosophySection.querySelector('.philosophy-text--content')
  const kingText = philosophySection.querySelector('.philosophy-text--king')

  if (!redactionFirst || !redactionSecond || !queenText || !contentText || !kingText) return

  // Use shared getSpacingValue utility (defined at top of file)

  // Helper: Calculate redaction box dimensions and positions
  const calculateRedactionDimensions = (contentTextEl, kingTextEl) => {
    void contentTextEl.offsetHeight
    void kingTextEl.offsetHeight
    
    const contentRect = contentTextEl.getBoundingClientRect()
    const kingRect = kingTextEl.getBoundingClientRect()
    const firstItem = contentTextEl.closest('.philosophy-item')
    const secondItem = kingTextEl.closest('.philosophy-item')
    const firstItemRect = firstItem.getBoundingClientRect()
    const secondItemRect = secondItem.getBoundingClientRect()
    
    // Use font size for realistic overhang (0.15em is typographic standard)
    // Use first text's font size for consistency
    const fontSize = parseFloat(getComputedStyle(contentTextEl).fontSize)
    const overhang = fontSize * 0.15
    
    const strikethroughHeight = getSpacingValue('--space-lg')
    
    const firstLeft = (contentRect.left - firstItemRect.left) - overhang
    const secondLeft = (kingRect.left - secondItemRect.left) - overhang
    const firstWidth = contentRect.width + (overhang * 2)
    const secondWidth = kingRect.width + (overhang * 2)
    
    return {
      firstWidth: Math.round(firstWidth),
      firstHeight: strikethroughHeight,
      firstLeft: Math.round(firstLeft),
      secondWidth: Math.round(secondWidth),
      secondHeight: strikethroughHeight,
      secondLeft: Math.round(secondLeft),
    }
  }

  // Helper: Set CSS variables for animated layout
  const setPhilosophyLayoutVariables = () => {
    philosophySection.style.setProperty('--philosophy-justify', 'start')
    philosophySection.style.setProperty('--philosophy-item-justify', 'start')
    philosophySection.style.setProperty('--philosophy-text-align', 'left')
    philosophySection.style.setProperty('--philosophy-first-col', '1 / 4')
    philosophySection.style.setProperty('--philosophy-second-col', '2 / 6')
    philosophySection.style.setProperty('--philosophy-third-col', '2 / 6')
    philosophySection.style.setProperty('--philosophy-first-justify', 'start')
    philosophySection.style.setProperty('--philosophy-second-justify', 'start')
    philosophySection.style.setProperty('--philosophy-third-justify', 'start')
    philosophySection.style.setProperty('--philosophy-queen-opacity', '0')
  }

  // Helper: Initialize redaction boxes
  const initializeRedactionBoxes = (dimensions) => {
    // Ensure boxes are visible and positioned correctly
    // Override CSS display: none on mobile using GSAP (sets inline styles)
    gsap.set(redactionFirst, { 
      width: dimensions.firstWidth, 
      scaleX: 0, 
      transformOrigin: 'left center',
      height: dimensions.firstHeight,
      left: dimensions.firstLeft,
      opacity: 1,
      visibility: 'visible',
      display: 'block' // Override CSS display: none - GSAP sets this as inline style
    })
    gsap.set(redactionSecond, { 
      width: dimensions.secondWidth, 
      scaleX: 0, 
      transformOrigin: 'left center',
      height: dimensions.secondHeight,
      left: dimensions.secondLeft,
      opacity: 1,
      visibility: 'visible',
      display: 'block' // Override CSS display: none - GSAP sets this as inline style
    })
    gsap.set(queenText, { opacity: 0 })
  }

  // If reduced motion, show final state immediately
  if (reducedMotion) {
    gsap.set([contentText, kingText], { opacity: 1 })
    gsap.set(queenText, { opacity: 1 })
    const dimensions = calculateRedactionDimensions(contentText, kingText)
    gsap.set(redactionFirst, { 
      width: dimensions.firstWidth, 
      scaleX: 1, 
      transformOrigin: 'left center' 
    })
    gsap.set(redactionSecond, { 
      width: dimensions.secondWidth, 
      scaleX: 1, 
      transformOrigin: 'left center' 
    })
    return
  }

  // Set layout variables
  setPhilosophyLayoutVariables()

  // Calculate initial dimensions
  let dimensions = calculateRedactionDimensions(contentText, kingText)
  
  // Helper: Update dimensions on resize
  const updateDimensions = () => {
    dimensions = calculateRedactionDimensions(contentText, kingText)
    gsap.set(redactionFirst, { 
      height: dimensions.firstHeight,
      left: dimensions.firstLeft,
      width: dimensions.firstWidth
    })
    gsap.set(redactionSecond, { 
      height: dimensions.secondHeight,
      left: dimensions.secondLeft,
      width: dimensions.secondWidth
    })
  }

  // Initialize redaction boxes for desktop animation
  initializeRedactionBoxes(dimensions)

  // Helper: Create redaction animation timeline (desktop - full animation)
  const createRedactionTimeline = (scrollTriggerConfig) => {
    const timeline = gsap.timeline({ scrollTrigger: scrollTriggerConfig })

    // First redaction box - starts after delay to give time to read
    timeline.to(redactionFirst, {
      scaleX: 1,
      ease: 'power2.inOut',
      duration: 1,
    }, 0.2)

    // Second redaction box - starts slightly after first (staggered)
    timeline.to(redactionSecond, {
      scaleX: 1,
      ease: 'power2.inOut',
      duration: 1,
    }, 0.35)

    // Fade in "ip is Queen" after both redactions are completely done
    timeline.to(queenText, {
      opacity: 1,
      ease: 'power2.out',
      duration: 0.6,
    }, 1.4)

    // Add a pause/hold at the end to keep "ip is queen" visible longer
    timeline.to({}, { duration: 1.2 })

    return timeline
  }

  // Helper: Create mobile timeline (only fade in queen text, redaction lines stay hidden)
  const createMobileTimeline = (scrollTriggerConfig) => {
    // Hide redaction boxes on mobile - batch set calls
    gsap.set([redactionFirst, redactionSecond], { opacity: 0, visibility: 'hidden' })
    
    const timeline = gsap.timeline({ scrollTrigger: scrollTriggerConfig })

    // Fade in "ip is Queen"
    timeline.to(queenText, {
      opacity: 1,
      ease: 'power2.out',
      duration: 0.6,
    }, 0.3)

    // Add a pause/hold at the end
    timeline.to({}, { duration: 1.2 })

    return timeline
  }

  // Helper: Handle resize and maintain progress (desktop only)
  const handleResize = () => {
    updateDimensions()
  }

  // Mobile-first: Use matchMedia for responsive animations
  ScrollTrigger.matchMedia({
    // Mobile: Show strikethroughs and fade in queen text — NO PIN
    "(max-width: 767px)": function() {
      // Initialize redaction boxes for mobile (show them, don't hide)
      // GSAP will set display: block as inline style to override CSS
      initializeRedactionBoxes(dimensions)
      
      // Simple scroll-triggered animation — NO PIN
      ScrollTrigger.create({
        trigger: philosophySection,
        start: 'top bottom',
        end: 'bottom top',
        onRefresh: () => updateDimensions(),
        invalidateOnRefresh: true,
        onEnter: () => {
          // Create timeline for redaction animation
          const mobileTl = gsap.timeline()
          
          // First redaction box - strikethrough "Content"
          mobileTl.to(redactionFirst, {
            scaleX: 1,
            ease: 'power2.inOut',
            duration: 1,
          }, 0.2)
          
          // Second redaction box - strikethrough "is king"
          mobileTl.to(redactionSecond, {
            scaleX: 1,
            ease: 'power2.inOut',
            duration: 1,
          }, 0.35)
          
          // Fade in "ip is Queen" after both redactions
          mobileTl.to(queenText, {
            opacity: 1,
            ease: 'power2.out',
            duration: 0.6,
          }, 1.4)
        },
        onEnterBack: () => {
          // Re-trigger animation when scrolling back into view
          const mobileTl = gsap.timeline()
          mobileTl.to(redactionFirst, {
            scaleX: 1,
            ease: 'power2.inOut',
            duration: 1,
          }, 0.2)
          mobileTl.to(redactionSecond, {
            scaleX: 1,
            ease: 'power2.inOut',
            duration: 1,
          }, 0.35)
          mobileTl.to(queenText, {
            opacity: 1,
            ease: 'power2.out',
            duration: 0.6,
          }, 1.4)
        },
        onLeaveBack: () => {
          // Reset when scrolling back up (but keep display: block)
          gsap.set([redactionFirst, redactionSecond], { 
            scaleX: 0,
            display: 'block' // Maintain visibility - GSAP sets as inline style
          })
          gsap.to(queenText, { opacity: 0, duration: 0.3 })
        }
      })
    },
    
    // Tablet: Horizontal parallax (safe scrub without pin) - matches love-notes timing
    "(min-width: 768px) and (max-width: 1279px)": function() {
      // Initialize redaction boxes for tablet (show them, don't hide)
      initializeRedactionBoxes(dimensions)
      
      // Create timeline with strikethroughs (non-pinned, matches love-notes timing)
      const tabletTl = gsap.timeline({
        scrollTrigger: {
          trigger: philosophySection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          onRefresh: () => updateDimensions(),
          invalidateOnRefresh: true,
        }
      })
      
      // First redaction box - strikethrough "Content"
      tabletTl.to(redactionFirst, {
        scaleX: 1,
        ease: 'power2.inOut',
        duration: 1,
      }, 0.2)
      
      // Second redaction box - strikethrough "is king"
      tabletTl.to(redactionSecond, {
        scaleX: 1,
        ease: 'power2.inOut',
        duration: 1,
      }, 0.35)
      
      // Fade in "ip is Queen" after both redactions
      tabletTl.to(queenText, {
        opacity: 1,
        ease: 'power2.out',
        duration: 0.6,
      }, 1.4)
      
      // Add a pause/hold at the end
      tabletTl.to({}, { duration: 1.2 })
    },
    
    // Desktop: Full redaction animation
    "(min-width: 1280px)": function() {
      const desktopScrollMultiplier = calculateScrollMultiplier(2.5, 5, 250)
      
      // Single ScrollTrigger that spans entire section - continuously maintains nav color
      // Starts when section enters, ends when section fully unpins
      ScrollTrigger.create({
        trigger: philosophySection,
        start: 'top bottom',
        end: `+=${desktopScrollMultiplier * 100}%`, // Match pinned ScrollTrigger end
        onEnter: () => {
          setBodyTheme('bg-bone')
        },
        onEnterBack: () => {
          setBodyTheme('bg-bone')
        },
        onUpdate: (self) => {
          // Continuously ensure nav color is set throughout the scroll
          if (self.isActive) {
            setBodyTheme('bg-bone')
          }
        },
        // Don't reset on leave - let love-notes handle the reset
      })
      
      createRedactionTimeline(
        createPinnedScrollConfig({
          trigger: philosophySection,
          start: 'top top',
          end: `+=${desktopScrollMultiplier * 100}%`,
          scrub: 1,
          callbacks: {
            onRefresh: handleResize,
            invalidateOnRefresh: true,
            // Don't set nav color here - the ScrollTrigger above handles it
          },
        })
      )
    }
  })
}

/**
 * Credentials section scroll animation
 * Pins the section and scrolls credentials content, with shadow on header
 * @param {boolean} reducedMotion - If true, skip animation and show final state
 */
function initCredentialsShadow(reducedMotion = false) {
  const credentialsSection = document.querySelector('.credentials')
  if (!credentialsSection) return

  const credentialsCard = credentialsSection.querySelector('.credentials-card')
  const credentialsList = credentialsSection.querySelector('.credentials-list')
  const credentialsHeaderSection = credentialsSection.querySelector('.credentials-header-section')
  const credentialsBadge = credentialsSection.querySelector('.credentials-badge')
  
  if (!credentialsCard || !credentialsList || !credentialsHeaderSection) return

  // Define the shadow that will appear on the header section (matching Figma)
  // Using darkest chuparosa (#420d0f = rgba(66, 13, 15))
  const headerShadow = 
    '0 751px 210px 0 rgba(66, 13, 15, 0.00), ' +
    '0 481px 192px 0 rgba(66, 13, 15, 0.01), ' +
    '0 271px 162px 0 rgba(66, 13, 15, 0.05), ' +
    '0 120px 120px 0 rgba(66, 13, 15, 0.09), ' +
    '0 30px 66px 0 rgba(66, 13, 15, 0.10)'

  // If reduced motion, show final state immediately
  if (reducedMotion) {
    gsap.set(credentialsHeaderSection, { boxShadow: headerShadow })
    if (credentialsBadge) {
      gsap.set(credentialsBadge, { rotation: 30 })
    }
    return
  }

  // Set initial state - header shadow hidden, list at starting position, badge at initial rotation
  gsap.set(credentialsHeaderSection, { boxShadow: 'none' })
  gsap.set(credentialsList, { y: 0, clearProps: 'transform' })
  if (credentialsBadge) {
    // Clear CSS transform and set rotation to 0
    gsap.set(credentialsBadge, { clearProps: 'transform', rotation: 0 })
  }

  // NOTE: Removed ScrollTrigger.refresh() here - it was causing issues with other 
  // section animations. The calculateScroll function handles layout timing internally.

  // Calculate scroll distance after a brief delay to ensure layout is ready
  const calculateScroll = () => {
    const listHeight = credentialsList.scrollHeight
    const cardHeight = credentialsCard.offsetHeight // Use actual card height (max 854px or viewport)
    const headerSectionHeight = credentialsHeaderSection.offsetHeight
    const cardInnerPadding = 128 // Total vertical padding (2xl top + 2xl bottom)
    const listPadding = 192 // 3xl padding top and bottom
    
    // Calculate available space for the list (card height minus header and padding)
    const availableHeight = cardHeight - headerSectionHeight - cardInnerPadding - listPadding
    const scrollAmount = Math.max(0, listHeight - availableHeight + 100) // Extra space for smooth scroll end

    // Create timeline that pins the section while content scrolls
    const tl = gsap.timeline({
      scrollTrigger: createPinnedScrollConfig({
        trigger: credentialsSection,
        start: 'top calc(100vh - var(--space-4xl))', // Pin when top is 4xl (128px) from top of viewport
        end: '+=250%', // Pin for 250% of viewport height
        scrub: 2,
      }),
    })

    // Animate the credentials list scrolling up
    if (scrollAmount > 0) {
      tl.to(credentialsList, {
        y: -scrollAmount,
        ease: 'power2.inOut',
        duration: 1,
      }, 0.1) // Start slightly after pinning

      // Animate header section shadow appearing when scrolling starts
      tl.to(credentialsHeaderSection, {
        boxShadow: headerShadow,
        ease: 'power2.out',
        duration: 0.3,
      }, 0.15) // Start shadow animation shortly after scroll begins

      // Animate badge rotation on scroll
      if (credentialsBadge) {
        tl.to(credentialsBadge, {
          rotation: 30, // 0 + 30 degrees
          ease: 'none',
          duration: 1,
        }, 0.1) // Start at same time as list scroll
      }
    }
  }

  // Calculate after layout is ready
  if (document.readyState === 'complete') {
    calculateScroll()
  } else {
    window.addEventListener('load', calculateScroll)
  }
}

/**
 * CTA Videos section animation
 * REMOVED: Now using line animation (js-line-animation) instead
 * The line animation handles the headline animation
 * Button animation can be added separately if needed
 */

/**
 * Line Animation for Headings
 * Splits text into lines and animates them on scroll
 * Simple approach - doesn't preserve text justification
 * @param {boolean} reducedMotion - If true, skip animation and show final state
 */
function initLineAnimations(reducedMotion = false) {
  const animatedElements = document.querySelectorAll('[js-line-animation]')
  
  if (animatedElements.length === 0) {
    return
  }

  // If reduced motion, show all elements immediately
  if (reducedMotion) {
    animatedElements.forEach((element) => {
      gsap.set(element, { opacity: 1 })
    })
    return
  }
  
  // Initialize hero background video to opacity 0 (if it exists)
  const heroBackgroundImage = document.querySelector('.hero .background-image')
  if (heroBackgroundImage) {
    gsap.set(heroBackgroundImage, { opacity: 0 })
  }
  
  animatedElements.forEach((element) => {
    console.log('Processing element with js-line-animation:', element)
    const originalHTML = element.innerHTML.trim()
    const hasBrTags = originalHTML.includes('<br>') || originalHTML.includes('<br/>') || originalHTML.includes('<br />')
    
    // If element has <br> tags, respect them for line breaks
    if (hasBrTags) {
      // Split by <br> tags to get lines
      const lineParts = originalHTML.split(/<br\s*\/?>/i)
      const lines = lineParts.map(part => {
        // Extract text content from each part, handling HTML entities like &nbsp;
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = part
        return tempDiv.textContent || tempDiv.innerText || ''
      }).filter(line => line.trim().length > 0)
      
      // Clear original and create line structure
      element.innerHTML = ''
      element.style.overflow = 'hidden'
      
      // Check if this is a featured image headline (needs natural text flow)
      const isFeaturedImage = element.classList.contains('section--featured-image__headline')
      
      lines.forEach((lineText) => {
        const lineSpan = document.createElement('span')
        lineSpan.className = 'line'
        lineSpan.style.display = 'block'
        // CSS handles overflow and width
        
        const lineInner = document.createElement('span')
        lineInner.className = 'line-inner'
        lineInner.style.display = 'block'
        // CSS handles width and whiteSpace
        // Preserve HTML entities like &nbsp; by using innerHTML
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = lineText
        lineInner.innerHTML = tempDiv.innerHTML || lineText
        
        lineSpan.appendChild(lineInner)
        element.appendChild(lineSpan)
      })
      
      // Get line elements and animate
      const lineElements = element.querySelectorAll('.line-inner')
      
      // Debug: Log line count for featured image headlines
      if (isFeaturedImage) {
        console.log(`Featured image headline (br tags): ${lineElements.length} lines created`)
        console.log('Lines:', Array.from(lineElements).map(el => el.textContent))
      }
      
      if (lineElements.length === 0) {
        element.innerHTML = originalHTML
        element.style.overflow = ''
        return
      }
      
      // Set initial state
      gsap.set(lineElements, {
        y: '100%',
        opacity: 0
      })
      
      // Check if element is already in viewport (use cached viewport height)
      const rect = element.getBoundingClientRect()
      const isInView = rect.top < viewportHeight * 0.85 && rect.bottom > 0
      
      // Check if this is a hero headline that might be hidden by intro
      const heroContent = element.closest('.hero-content')
      const isHeroHeadline = heroContent !== null
      let shouldWaitForIntro = false
      
      if (isHeroHeadline && heroContent) {
        const heroOpacity = parseFloat(window.getComputedStyle(heroContent).opacity)
        shouldWaitForIntro = heroOpacity === 0
      }
      
      // Check if this is a hero headline for video fade-in
      const backgroundImage = isHeroHeadline ? element.closest('.hero')?.querySelector('.background-image') : null
      
      if (isInView && !shouldWaitForIntro) {
        // Animate immediately if already in view and hero is visible
        const textAnim = animateLineElements(lineElements)
        
        // Fade in video after text animation completes (for hero headline)
        if (isHeroHeadline && backgroundImage) {
          // Ensure GSAP has control over opacity
          gsap.set(backgroundImage, { opacity: 0 })
          
          // Use callback to fade in video when text animation completes
          const fadeInVideo = () => {
            console.log('Text animation complete (br tags), fading in video')
            gsap.to(backgroundImage, {
              opacity: 1,
              duration: 1.2,
              ease: 'power2.out',
              delay: 0.3
            })
          }
          
          textAnim.eventCallback('onComplete', fadeInVideo)
          
          // Backup: delayed call based on calculated duration
          const lineCount = lineElements.length
          const textDuration = 0.9 + (0.1 * (lineCount - 1))
          gsap.delayedCall(textDuration + 0.3, () => {
            const inlineOpacity = backgroundImage.style.opacity
            const computedOpacity = parseFloat(window.getComputedStyle(backgroundImage).opacity)
            const currentOpacity = inlineOpacity ? parseFloat(inlineOpacity) : computedOpacity
            
            if (currentOpacity === 0 || isNaN(currentOpacity) || !currentOpacity) {
              console.log('Backup: Fading in video via delayed call (br tags)')
              gsap.to(backgroundImage, {
                opacity: 1,
                duration: 1.2,
                ease: 'power2.out'
              })
            }
          })
        }
      } else if (isInView && shouldWaitForIntro) {
        // Hero headline is in view but hidden - wait for hero opacity to reach exactly 1
        const checkHeroVisible = () => {
          const currentOpacity = parseFloat(window.getComputedStyle(heroContent).opacity)
          if (currentOpacity === 1) {
            // Hero is fully visible, trigger animation
            const textAnim = animateLineElements(lineElements)
            
            // Fade in video after text animation completes (for hero headline)
            if (isHeroHeadline && backgroundImage) {
              // Ensure GSAP has control over opacity
              gsap.set(backgroundImage, { opacity: 0 })
              
              // Use callback to fade in video when text animation completes
              const fadeInVideo = () => {
                console.log('Text animation complete (br tags, wait for intro), fading in video', backgroundImage)
                const beforeOpacity = window.getComputedStyle(backgroundImage).opacity
                console.log('Opacity before animation:', beforeOpacity)
                
                const videoAnim = gsap.to(backgroundImage, {
                  opacity: 1,
                  duration: 1.2,
                  ease: 'power2.out',
                  delay: 0.3,
                  onStart: () => {
                    console.log('Video fade animation started')
                  },
                  onComplete: () => {
                    const afterOpacity = window.getComputedStyle(backgroundImage).opacity
                    console.log('Video fade animation complete, opacity:', afterOpacity)
                  }
                })
                console.log('GSAP animation created:', videoAnim)
              }
              
              textAnim.eventCallback('onComplete', fadeInVideo)
              
              // Backup: delayed call
              const lineCount = lineElements.length
              const textDuration = 0.9 + (0.1 * (lineCount - 1))
              gsap.delayedCall(textDuration + 0.3, () => {
                const inlineOpacity = backgroundImage.style.opacity
                const computedOpacity = parseFloat(window.getComputedStyle(backgroundImage).opacity)
                const currentOpacity = inlineOpacity ? parseFloat(inlineOpacity) : computedOpacity
                
                if (currentOpacity === 0 || isNaN(currentOpacity) || !currentOpacity) {
                  console.log('Backup: Fading in video via delayed call (br tags, wait for intro)', backgroundImage)
                  const beforeOpacity = window.getComputedStyle(backgroundImage).opacity
                  console.log('Backup - Opacity before:', beforeOpacity)
                  
                  const videoAnim = gsap.to(backgroundImage, {
                    opacity: 1,
                    duration: 1.2,
                    ease: 'power2.out',
                    onStart: () => {
                      console.log('Backup video fade animation started')
                    },
                    onComplete: () => {
                      const afterOpacity = window.getComputedStyle(backgroundImage).opacity
                      console.log('Backup video fade animation complete, opacity:', afterOpacity)
                    }
                  })
                  console.log('Backup GSAP animation created:', videoAnim)
                } else {
                  console.log('Backup skipped - video already faded in, opacity:', currentOpacity)
                }
              })
            }
          } else if (currentOpacity > 0) {
            // Still fading in, keep checking
            requestAnimationFrame(checkHeroVisible)
          } else {
            // Still at 0, keep checking
            requestAnimationFrame(checkHeroVisible)
          }
        }
        checkHeroVisible()
      } else {
        // Use ScrollTrigger for elements not yet in view
        let anim;
        
        if (isHeroHeadline && backgroundImage) {
          // Ensure GSAP has control over opacity
          gsap.set(backgroundImage, { opacity: 0 })
          
          anim = animateLineElements(lineElements, {
            scrollTrigger: {
              trigger: element,
              start: 'top 85%',
              toggleActions: 'play none none none',
              onEnter: () => {
                if (anim) {
                  anim.restart()
                }
              },
              onEnterBack: () => {
                if (anim) {
                  anim.restart()
                }
              },
              onComplete: () => {
                console.log('ScrollTrigger complete (br tags), fading in video')
                gsap.to(backgroundImage, {
                  opacity: 1,
                  duration: 1.2,
                  ease: 'power2.out',
                  delay: 0.3
                })
              }
            }
          })
          
          // Also set callback on animation as backup
          const fadeInVideo = () => {
            console.log('Animation onComplete callback fired (br tags), fading in video')
            gsap.to(backgroundImage, {
              opacity: 1,
              duration: 1.2,
              ease: 'power2.out',
              delay: 0.3
            })
          }
          anim.eventCallback('onComplete', fadeInVideo)
          
          // Backup: delayed call
          const lineCount = lineElements.length
          const textDuration = 0.9 + (0.1 * (lineCount - 1))
          gsap.delayedCall(textDuration + 0.3, () => {
            const inlineOpacity = backgroundImage.style.opacity
            const computedOpacity = parseFloat(window.getComputedStyle(backgroundImage).opacity)
            const currentOpacity = inlineOpacity ? parseFloat(inlineOpacity) : computedOpacity
            
            if (currentOpacity === 0 || isNaN(currentOpacity) || !currentOpacity) {
              console.log('Backup: Fading in video via delayed call (br tags, scroll-triggered)')
              gsap.to(backgroundImage, {
                opacity: 1,
                duration: 1.2,
                ease: 'power2.out'
              })
            }
          })
        } else {
          anim = animateLineElements(lineElements, {
            scrollTrigger: {
              trigger: element,
              start: 'top 85%',
              toggleActions: 'play none none none',
              onEnter: () => {
                if (anim) {
                  anim.restart()
                }
              },
              onEnterBack: () => {
                if (anim) {
                  anim.restart()
                }
              }
            }
          })
        }
        
        // Fallback: if ScrollTrigger doesn't fire, animate after a delay
        if (anim) {
          setTimeout(() => {
            if (anim && anim.progress() === 0) {
              const currentRect = element.getBoundingClientRect()
              if (currentRect.top < viewportHeight && currentRect.bottom > 0) {
                anim.restart()
              }
            }
          }, 1000)
        }
      }
      
      return // Skip the rest of the function for <br> tag handling
    }
    
    // Original logic for elements without <br> tags
    const originalText = element.textContent.trim()
    const words = originalText.split(' ').filter(w => w.length > 0)
    
    if (words.length === 0) {
      return
    }
    
    // Get element width for clone measurement - optimized fallback chain
    let elementWidth = element.getBoundingClientRect().width || element.offsetWidth
    if (elementWidth <= 0) {
      const parent = element.parentElement
      elementWidth = parent ? (parent.getBoundingClientRect().width || parent.offsetWidth) : viewportWidth
    }
    
    // Ensure we have a valid width
    if (elementWidth <= 0) {
      console.warn('Could not determine width for element:', element)
      return
    }
    
    // Create clone to measure line breaks
    const clone = element.cloneNode(true)
    const computedStyle = window.getComputedStyle(element)
    
    clone.style.position = 'absolute'
    clone.style.visibility = 'hidden'
    clone.style.top = '-9999px'
    clone.style.left = '0'
    clone.style.width = elementWidth + 'px'
    clone.style.height = 'auto'
    clone.style.margin = '0'
    clone.style.padding = computedStyle.padding
    clone.style.fontSize = computedStyle.fontSize
    clone.style.fontFamily = computedStyle.fontFamily
    clone.style.fontWeight = computedStyle.fontWeight
    clone.style.letterSpacing = computedStyle.letterSpacing
    clone.style.lineHeight = computedStyle.lineHeight
    clone.style.textTransform = computedStyle.textTransform
    clone.style.whiteSpace = 'normal'
    
    document.body.appendChild(clone)
    clone.textContent = originalText
    void clone.offsetHeight
    
    // Create word spans to measure positions
    const wordSpans = []
    clone.innerHTML = ''
    
    words.forEach((word, index) => {
      const span = document.createElement('span')
      span.textContent = word + (index < words.length - 1 ? ' ' : '')
      span.style.whiteSpace = 'pre'
      clone.appendChild(span)
      wordSpans.push(span)
    })
    
    void clone.offsetHeight
    
    // Group words into lines based on vertical position
    const lines = []
    let currentLine = []
    let currentLineTop = null
    
    wordSpans.forEach((span, index) => {
      const rect = span.getBoundingClientRect()
      const top = Math.round(rect.top)
      
      if (currentLineTop === null || Math.abs(top - currentLineTop) < 5) {
        currentLine.push(words[index])
        if (currentLineTop === null) currentLineTop = top
      } else {
        if (currentLine.length > 0) {
          lines.push([...currentLine])
        }
        currentLine = [words[index]]
        currentLineTop = top
      }
      
      if (index === wordSpans.length - 1 && currentLine.length > 0) {
        lines.push([...currentLine])
      }
    })
    
    // Clean up clone
    if (clone.parentNode) {
      document.body.removeChild(clone)
    }
    
    // Fallback to single line if no lines detected
    if (lines.length === 0) {
      lines.push(words)
    }
    
    // Check if this is a featured image headline (needs natural text flow)
    const isFeaturedImage = element.classList.contains('section--featured-image__headline')
    
    // Debug: Log line detection for featured image headlines
    if (isFeaturedImage) {
      console.log(`Featured image headline: ${lines.length} lines detected from word splitting`)
      console.log('Detected lines:', lines.map(line => line.join(' ')))
    }
    
    // Clear original and create line structure
    element.innerHTML = ''
    element.style.overflow = 'hidden'
    
    lines.forEach((lineWords) => {
      const lineSpan = document.createElement('span')
      lineSpan.className = 'line'
      lineSpan.style.display = 'block'
      // CSS handles overflow and width
      
      const lineInner = document.createElement('span')
      lineInner.className = 'line-inner'
      lineInner.style.display = 'block'
      // CSS handles width and whiteSpace
      lineInner.textContent = lineWords.join(' ')
      
      lineSpan.appendChild(lineInner)
      element.appendChild(lineSpan)
    })
    
    // Get line elements and animate
    const lineElements = element.querySelectorAll('.line-inner')
    
    // Debug: Log line count for featured image headlines
    if (isFeaturedImage) {
      console.log(`Featured image headline: ${lineElements.length} lines created`)
      console.log('Lines:', Array.from(lineElements).map(el => el.textContent))
    }
    
    if (lineElements.length === 0) {
      element.innerHTML = originalText
      element.style.overflow = ''
      return
    }
    
    // Set initial state
    gsap.set(lineElements, {
      y: '100%',
      opacity: 0
    })
    
    // Check if element is already in viewport (use cached viewport height)
    const rect = element.getBoundingClientRect()
    const isInView = rect.top < viewportHeight * 0.85 && rect.bottom > 0
    
    // Check if this is a hero headline that might be hidden by intro
    const heroContent = element.closest('.hero-content')
    const isHeroHeadline = heroContent !== null
    let shouldWaitForIntro = false
    
    if (isHeroHeadline && heroContent) {
      const heroOpacity = parseFloat(window.getComputedStyle(heroContent).opacity)
      shouldWaitForIntro = heroOpacity === 0
    }
    
    // Helper function to create text animation with video fade-in callback
    const createHeroAnimationTimeline = () => {
      console.log('createHeroAnimationTimeline called', { isHeroHeadline, element })
      
      if (!isHeroHeadline) {
        // Not hero headline, just animate text normally
        console.log('Not hero headline, animating text normally')
        return animateLineElements(lineElements)
      }
      
      const backgroundImage = element.closest('.hero')?.querySelector('.background-image')
      console.log('Background image found:', backgroundImage)
      
      if (!backgroundImage) {
        // No background image, just animate text
        console.log('No background image found, animating text normally')
        return animateLineElements(lineElements)
      }
      
      // Ensure GSAP has control over opacity
      gsap.set(backgroundImage, { opacity: 0 })
      console.log('Set background image opacity to 0')
      
      // Create text animation
      const textAnim = animateLineElements(lineElements)
      
      // Use callback to fade in video when text animation completes
      // Store backgroundImage in closure to ensure it's accessible
      const fadeInVideo = () => {
        console.log('Text animation complete, fading in video')
        gsap.to(backgroundImage, {
          opacity: 1,
          duration: 1.2,
          ease: 'power2.out',
          delay: 0.3
        })
      }
      
      textAnim.eventCallback('onComplete', fadeInVideo)
      console.log('onComplete callback set on text animation')
      
      // Also add as backup using the animation's duration
      const lineCount = lineElements.length
      const textDuration = 0.9 + (0.1 * (lineCount - 1))
      gsap.delayedCall(textDuration + 0.3, () => {
        // Check if still at 0 (callback might not have fired)
        // Check inline style first (GSAP sets this), then computed style
        const inlineOpacity = backgroundImage.style.opacity
        const computedOpacity = parseFloat(window.getComputedStyle(backgroundImage).opacity)
        const currentOpacity = inlineOpacity ? parseFloat(inlineOpacity) : computedOpacity
        
        console.log('Backup delayed call fired', { 
          inlineOpacity, 
          computedOpacity, 
          currentOpacity,
          backgroundImage 
        })
        
        if (currentOpacity === 0 || isNaN(currentOpacity) || !currentOpacity) {
          console.log('Backup: Fading in video via delayed call')
          gsap.to(backgroundImage, {
            opacity: 1,
            duration: 1.2,
            ease: 'power2.out'
          })
        } else {
          console.log('Video already faded in, skipping backup')
        }
      })
      
      return textAnim
    }
    
    if (isInView && !shouldWaitForIntro) {
      // Animate immediately if already in view and hero is visible
      createHeroAnimationTimeline()
    } else if (isInView && shouldWaitForIntro) {
      // Hero headline is in view but hidden - wait for hero opacity to reach exactly 1
      const checkHeroVisible = () => {
        const currentOpacity = parseFloat(window.getComputedStyle(heroContent).opacity)
        if (currentOpacity === 1) {
          // Hero is fully visible, trigger animation
          createHeroAnimationTimeline()
        } else if (currentOpacity > 0) {
          // Still fading in, keep checking
          requestAnimationFrame(checkHeroVisible)
        } else {
          // Still at 0, keep checking
          requestAnimationFrame(checkHeroVisible)
        }
      }
      checkHeroVisible()
    } else {
      // Use ScrollTrigger for elements not yet in view
      // Declare anim at function scope so fallback can access it
      let anim;
      
      if (isHeroHeadline) {
        const backgroundImage = element.closest('.hero')?.querySelector('.background-image')
        if (backgroundImage) {
          // Ensure GSAP has control over opacity
          gsap.set(backgroundImage, { opacity: 0 })
          
          // Create text animation with ScrollTrigger
          anim = animateLineElements(lineElements, {
            scrollTrigger: {
              trigger: element,
              start: 'top 85%',
              toggleActions: 'play none none none',
              onEnter: () => {
                if (anim) {
                  anim.restart()
                }
              },
              onEnterBack: () => {
                if (anim) {
                  anim.restart()
                }
              },
              onComplete: () => {
                // Fade in video when scroll trigger completes
                console.log('ScrollTrigger complete, fading in video')
                gsap.to(backgroundImage, {
                  opacity: 1,
                  duration: 1.2,
                  ease: 'power2.out',
                  delay: 0.3
                })
              }
            }
          })
          
          // Also set callback on animation as backup
          const fadeInVideo = () => {
            console.log('Animation onComplete callback fired, fading in video')
            gsap.to(backgroundImage, {
              opacity: 1,
              duration: 1.2,
              ease: 'power2.out',
              delay: 0.3
            })
          }
          anim.eventCallback('onComplete', fadeInVideo)
          
          // Backup: delayed call based on calculated duration
          const lineCount = lineElements.length
          const textDuration = 0.9 + (0.1 * (lineCount - 1))
          gsap.delayedCall(textDuration + 0.3, () => {
            const currentOpacity = parseFloat(window.getComputedStyle(backgroundImage).opacity)
            if (currentOpacity === 0 || isNaN(currentOpacity)) {
              console.log('Backup: Fading in video via delayed call (scroll-triggered)')
              gsap.to(backgroundImage, {
                opacity: 1,
                duration: 1.2,
                ease: 'power2.out'
              })
            }
          })
        } else {
          // No background image, use regular animation
      anim = animateLineElements(lineElements, {
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none none',
          onEnter: () => {
            if (anim) {
              anim.restart()
            }
          },
          onEnterBack: () => {
            if (anim) {
              anim.restart()
            }
          }
        }
      })
        }
      } else {
        // Not hero headline, use regular animation
        anim = animateLineElements(lineElements, {
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none none',
            onEnter: () => {
              if (anim) {
                anim.restart()
              }
            },
            onEnterBack: () => {
              if (anim) {
                anim.restart()
              }
            }
          }
        })
      }
      
      // Fallback: if ScrollTrigger doesn't fire, animate after a delay
      if (anim) {
      setTimeout(() => {
          if (anim && anim.progress() === 0) {
          // Animation hasn't started, check if element is now in view
          const currentRect = element.getBoundingClientRect()
          if (currentRect.top < viewportHeight && currentRect.bottom > 0) {
            anim.restart()
          }
        }
      }, 1000)
      }
    }
  })
}

/**
 * Intro Animation
 * Video reveal sequence that plays on load, then fades out to reveal existing hero
 * 
 * Sequence:
 * 1. Nav fades in (500ms)
 * 2. Center video shrinks (600ms)
 * 3. Pause with center video (600ms)
 * 4. Side videos slide out (1800ms, staggered)
 * 5. Name character reveal - "TYLER CHOU" (1300ms, heavy deceleration)
 * 6. Name lingers on screen (~800ms)
 * 7. Videos pop out sequentially right→left (instant, 200ms apart)
 * 8. Name stays alone (~500ms)
 * 9. Characters slide out in reverse order (600ms)
 * 10. Hero fades in (800ms)
 * Total duration: ~7 seconds
 */
function initIntro() {
  const intro = document.querySelector('.intro')
  const centerVideo = document.querySelector('.intro__video--center') // wrapper
  const leftVideo = document.querySelector('.intro__video--left') // wrapper
  const rightVideo = document.querySelector('.intro__video--right') // wrapper
  const heroContent = document.querySelector('.hero-content')
  const nameElement = document.querySelector('.intro__name[js-char-animation]')

  // Skip if no intro element or reduced motion
  if (!intro || prefersReducedMotion) {
    intro?.classList.add('is-complete')
    document.body.classList.remove('intro-active')
    return
  }

  // Prevent scroll restoration and lock scroll
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'
  }
  window.scrollTo(0, 0)
  document.body.classList.add('intro-active')

  // Add body class to control nav visibility via CSS (same as curtain)
  document.body.classList.add('curtain-active')

  // Set initial states
  gsap.set(heroContent, { opacity: 0 })
  gsap.set([leftVideo, centerVideo, rightVideo], {
    transformOrigin: 'center center'
  })
  gsap.set(leftVideo, { 
    x: 0,
    xPercent: -50,
    yPercent: -50,
    height: '80vh',
    opacity: 0,
    clipPath: 'inset(0 100% 0 0)'
  })
  gsap.set(rightVideo, { 
    x: 0,
    xPercent: -50,
    yPercent: -50,
    height: '80vh',
    opacity: 0,
    clipPath: 'inset(0 0 0 100%)'
  })
  
  // Split name into characters and set initial states
  let charElements = []
  if (nameElement) {
    charElements = splitTextIntoChars(nameElement)
    gsap.set(nameElement, { opacity: 0 })
    gsap.set(charElements, {
      x: '-100%',
      opacity: 0
    })
  }

  // Add scroll interrupt handler
  let scrollInterrupted = false
  let touchStartY = 0
  let touchMoveY = 0
  
  const handleScrollInterrupt = () => {
    if (scrollInterrupted) return
    scrollInterrupted = true
    
    // Kill the timeline
    tl.kill()
    
    // Create a fade-out timeline (works for both mobile and desktop)
    const fadeOutTl = gsap.timeline({
      onComplete: () => {
        // Clean up after fade
        intro.classList.add('is-complete')
        document.body.classList.remove('intro-active')
        document.body.classList.remove('curtain-active')
        cleanupListeners()
      }
    })
    
    // Fade out intro
    fadeOutTl.to(intro, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out'
    })
    
    // Fade in hero content simultaneously
    fadeOutTl.to(heroContent, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out'
    }, 0) // Start at same time
  }
  
  const handleWheel = (e) => {
    // Desktop: any wheel movement interrupts
    if (Math.abs(e.deltaY) > 0) {
      e.preventDefault()
      handleScrollInterrupt()
    }
  }
  
  const handleTouchStart = (e) => {
    // Mobile: record initial touch position
    touchStartY = e.touches[0].clientY
  }
  
  const handleTouchMove = (e) => {
    // Mobile: detect actual scroll movement
    touchMoveY = e.touches[0].clientY
    const deltaY = touchMoveY - touchStartY
    
    // If user is trying to scroll (more than 10px movement)
    if (Math.abs(deltaY) > 10) {
      e.preventDefault() // Prevent scroll
      handleScrollInterrupt()
    }
  }
  
  const handleKeyInterrupt = (e) => {
    // Allow space, arrow down, page down to interrupt
    if ([' ', 'ArrowDown', 'PageDown'].includes(e.key)) {
      e.preventDefault()
      handleScrollInterrupt()
    }
  }
  
  const cleanupListeners = () => {
    window.removeEventListener('wheel', handleWheel, { passive: false })
    window.removeEventListener('touchstart', handleTouchStart, { passive: true })
    window.removeEventListener('touchmove', handleTouchMove, { passive: false })
    window.removeEventListener('keydown', handleKeyInterrupt)
  }

  // Create timeline
  const tl = gsap.timeline({
    onComplete: () => {
      intro.classList.add('is-complete')
      document.body.classList.remove('intro-active')
      document.body.classList.remove('curtain-active')
      cleanupListeners()
      // CSS handles nav animation - no cleanup needed
    }
  })
  
  // Listen for scroll attempts
  window.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('touchstart', handleTouchStart, { passive: true })
  window.addEventListener('touchmove', handleTouchMove, { passive: false })
  window.addEventListener('keydown', handleKeyInterrupt)

  // Step 2: Center video shrinks vertically (700ms–1300ms) - longer pause before scaling
  tl.to(centerVideo, {
    height: '80vh',
    duration: 0.6,
    ease: 'power2.out'
  }, 0.7)

  // Step 3: Side videos slide out (1500ms–3400ms) - staggered for elegance
  const slideDistance = (viewportWidth * 0.33) + 16 // video width + gap
  
  tl.to(leftVideo, {
    x: -slideDistance,
    opacity: 1,
    clipPath: 'inset(0 0% 0 0)',
    duration: 1.8,
    ease: 'power3.out'
  }, 1.5)

  tl.to(rightVideo, {
    x: slideDistance,
    opacity: 1,
    clipPath: 'inset(0 0 0 0%)',
    duration: 1.8,
    ease: 'power3.out'
  }, 1.6)

  // Step 4: Name reveal (2800ms–4600ms) - massive character animation with extended dramatic deceleration
  if (nameElement && charElements.length > 0) {
    // Fade in name container
    tl.to(nameElement, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out'
    }, 2.8)
    
    // Animate characters sliding in with extended heavy deceleration for suspense
    tl.to(charElements, {
      x: '0%',
      opacity: 1,
      duration: 1.7, // Extended from 1.2s to build more suspense
      stagger: 0.05,
      ease: 'power4.out' // Heavier deceleration creates dramatic slow-down
    }, 2.9)
  }

  // Step 5: Sequential pop out - videos disappear right to left, immediate exit
  
  // Videos pop out sequentially (4700ms–5100ms) - instant opacity changes
  tl.to(rightVideo, {
    opacity: 0,
    duration: 0,
    ease: 'none'
  }, 4.7)
  
  tl.to(centerVideo, {
    opacity: 0,
    duration: 0,
    ease: 'none'
  }, 4.9)
  
  tl.to(leftVideo, {
    opacity: 0,
    duration: 0,
    ease: 'none'
  }, 5.1)
  
  // Name stays alone briefly, then characters slide out in reverse (5300ms–5900ms)
  if (nameElement && charElements.length > 0) {
    tl.to(charElements, {
      x: '-100%', // Exit to the left
      opacity: 0,
      duration: 0.6,
      stagger: -0.03, // Negative stagger = reverse order (right to left)
      ease: 'power3.in'
    }, 5.3)
  }
  
  // Intro container fades (cleanup) - starts immediately after name exits
  tl.to(intro, {
    opacity: 0,
    duration: 0.4,
    ease: 'power2.out'
  }, 5.9)
  
  // Hero fades in (5900ms–6700ms)
  tl.to(heroContent, {
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out'
  }, 5.9)
}


/**
 * Page Load Curtain
 * CSS-only animation - no JS needed for curtain itself
 * Only handles homepage skip and reduced motion check
 * Animation is handled entirely by CSS for better performance
 */
function initCurtain() {
  // Check URL pathname instead of body class (body class is unreliable on Netlify)
  const pathname = window.location.pathname
  const isHomepage = pathname === '/' || pathname === '/index.html' || pathname.endsWith('/index.html')
  
  // Skip on homepage (has its own intro) or if reduced motion
  if (isHomepage || prefersReducedMotion) {
    const curtain = document.querySelector('.curtain')
    if (curtain) {
      curtain.classList.add('is-complete')
    }
    return
  }
  
  // CSS handles the animation - no JS needed
  // Curtain will automatically hide after animation completes via CSS
}


// Initialize Lenis first, then curtain/intro, then animations
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initLenis()
    initCurtain() // Simple curtain for non-homepage
    initIntro()   // Video intro for homepage only
    initAnimations()
  })
} else {
  initLenis()
  initCurtain() // Simple curtain for non-homepage
  initIntro()   // Video intro for homepage only
  initAnimations()
}

// Re-initialize on page navigation (for SPA-like behavior if needed)
export { initAnimations }

