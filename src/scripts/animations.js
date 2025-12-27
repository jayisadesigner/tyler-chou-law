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
 * - .section--centered--pinned (pinned scroll sections)
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
          width: window.innerWidth, 
          height: window.innerHeight 
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
 * Pin centered sections during scroll
 * Creates a sticky effect for sections with .section--centered--pinned
 * Note: Use --pinned modifier separately from --full-height for more control
 */
function initPinnedSections() {
  const pinnedSections = document.querySelectorAll('.section--centered--pinned')
  
  if (!pinnedSections.length || !ScrollTrigger) return
  
  pinnedSections.forEach(section => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=200%', // Pin for 2 viewport heights of scroll
      pin: true,
      pinSpacing: true,
      anticipatePin: 1
    })
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
    // Mobile: Horizontal parallax
    "(max-width: 1279px)": function() {
      const topCards = loveNotesSection.querySelectorAll('.love-notes__carousel--top .roster-card--testimonial')
      const bottomCards = loveNotesSection.querySelectorAll('.love-notes__carousel--bottom .roster-card--testimonial')
      
      // Reset cards to base state for mobile (no scale on mobile)
      gsap.set(cards, { x: 0, y: 0, scale: 1 })
      
      const mobileTl = gsap.timeline({
        scrollTrigger: {
          trigger: loveNotesSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          invalidateOnRefresh: true,
          ...getThemeCallbacks('bg-bone'),
        }
      })
      
      // Top carousel - moves right
      topCards.forEach((card, index) => {
        const speed = 0.6 + (index * 0.15)
        mobileTl.to(card, {
          x: 60 * speed,
          ease: 'none',
        }, 0)
      })
      
      // Bottom carousel - moves left
      bottomCards.forEach((card, index) => {
        const speed = 0.6 + (index * 0.15)
        mobileTl.to(card, {
          x: -60 * speed,
          ease: 'none',
        }, 0)
      })
    },
    
    // Desktop: Pin section and scroll cards through viewport with parallax
    "(min-width: 1280px)": function() {
      if (!cards.length) return
      
      // Set initial scale from CSS custom property for each card
      cards.forEach(card => {
        const computedStyle = window.getComputedStyle(card)
        const scale = parseFloat(computedStyle.getPropertyValue('--scale').trim() || '1')
        gsap.set(card, { x: 0, y: 0, scale: scale })
      })
      
      // Headline is centered in section via CSS, ensure it's visible
      if (headline) {
        gsap.set(headline, { opacity: 1 })
      }
      
      // Create a pinned scroll-through effect
      const desktopTl = gsap.timeline({
        scrollTrigger: {
          trigger: loveNotesSection,
          start: 'top top',
          end: '+=500%', // Pin for 5x viewport height - enough to scroll all cards through
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          ...getThemeCallbacks('bg-bone'),
        }
      })
      
      // Cards move through viewport based on depth
      cards.forEach((card) => {
        // Get depth value from CSS (1 = back, 3 = front)
        const computedStyle = window.getComputedStyle(card)
        const depth = parseInt(computedStyle.getPropertyValue('--depth').trim() || '2')
        
        // Movement distance based on depth - all cards scroll through and off screen
        // depth 1 (back) = slower movement (less distance)
        // depth 2 (mid) = normal movement
        // depth 3 (front) = faster movement (more distance)
        let yMovement
        if (depth === 1) {
          yMovement = -window.innerHeight * 0.8 // 80vh upward
        } else if (depth === 2) {
          yMovement = -window.innerHeight * 1.2 // 120vh upward
        } else {
          yMovement = -window.innerHeight * 1.5 // 150vh upward
        }
        
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

// Initialize animations when DOM is ready
function initAnimations() {
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
    animateFlowerRotation('.about-flower', '.about')
    animateFlowerRotation('.palo-verde-flower', '.palo-verde')
    
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

  // Hero content reveal animation
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

  // Scroll-triggered section reveals
  if (!ScrollTrigger) return

  // Section reveal animations
  document.querySelectorAll('.section-reveal').forEach((section) => {
      gsap.fromTo(section, 
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )
  })


  // Flower rotation animations
  animateFlowerRotation('.about-flower', '.about')
  animateFlowerRotation('.palo-verde-flower', '.palo-verde')
  
  // Section-based theme switching
  // Palo Verde section - green background
  const paloVerdeSection = document.querySelector('.palo-verde')
  if (paloVerdeSection) {
    ScrollTrigger.create({
      trigger: paloVerdeSection,
      start: 'top center',
      end: 'bottom top',
      ...getThemeCallbacks('bg-palo-verde'),
    })
  }

  // Philosophy section - bone background
  // Theme switching is handled in initPhilosophyRedaction pinned ScrollTrigger (matches love-notes pattern)

  // Love Letters section - bone background
  // Note: Theme switching for love-notes is handled in initLoveLettersScroll
  // because the section is pinned on desktop and needs to coordinate with the pin animation

  // Final CTA section - return to default (chuparosa/red)
  const finalSection = document.querySelector('.section--centered:last-of-type')
  if (finalSection) {
    ScrollTrigger.create({
      trigger: finalSection,
      start: 'top center',
      end: 'bottom top',
      onEnter: () => setBodyTheme(''),
      onEnterBack: () => setBodyTheme(''),
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
  
  // Consolidated resize handler (debounced)
  let resizeTimeout
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      ScrollTrigger.refresh()
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
  
  if (!backgroundImages.length || !ScrollTrigger) return
  
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

  // Helper: Get spacing values from CSS variables
  const getSpacingValue = (variableName) => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(variableName).trim()
    return Math.ceil(parseFloat(value) * 16) // Convert rem to pixels
  }

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
    
    const strikethroughHeight = getSpacingValue('--space-lg')
    const strikethroughPadding = getSpacingValue('--space-xs')
    
    const firstLeft = (contentRect.left - firstItemRect.left) - strikethroughPadding
    const secondLeft = (kingRect.left - secondItemRect.left) - strikethroughPadding
    const firstWidth = contentRect.width + (strikethroughPadding * 2)
    const secondWidth = kingRect.width + (strikethroughPadding * 2)
    
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
    gsap.set(redactionFirst, { 
      width: dimensions.firstWidth, 
      scaleX: 0, 
      transformOrigin: 'left center',
      height: dimensions.firstHeight,
      left: dimensions.firstLeft,
      opacity: 1, // Ensure visible
      visibility: 'visible' // Ensure visible
    })
    gsap.set(redactionSecond, { 
      width: dimensions.secondWidth, 
      scaleX: 0, 
      transformOrigin: 'left center',
      height: dimensions.secondHeight,
      left: dimensions.secondLeft,
      opacity: 1, // Ensure visible
      visibility: 'visible' // Ensure visible
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
    // Hide redaction boxes on mobile - they don't animate
    gsap.set(redactionFirst, { opacity: 0, visibility: 'hidden' })
    gsap.set(redactionSecond, { opacity: 0, visibility: 'hidden' })
    
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
    // Mobile: Only fade in queen text
    "(max-width: 768px)": function() {
      const mobileScrollMultiplier = Math.max(2, Math.min(3.5, window.innerHeight / 300))
      
      createMobileTimeline({
        trigger: philosophySection,
        start: 'top top',
        end: `+=${mobileScrollMultiplier * 100}%`,
        scrub: 2,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        ...getThemeCallbacks('bg-bone'),
      })
    },
    
    // Desktop: Full redaction animation
    "(min-width: 769px)": function() {
      const desktopScrollMultiplier = Math.max(2.5, Math.min(5, window.innerHeight / 250))
      
      createRedactionTimeline({
        trigger: philosophySection,
        start: 'top top',
        end: `+=${desktopScrollMultiplier * 100}%`,
        scrub: 2.5,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        onRefresh: handleResize,
        invalidateOnRefresh: true,
        ...getThemeCallbacks('bg-bone'),
      })
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

  // Use ScrollTrigger's refresh to ensure proper calculations
  ScrollTrigger.refresh()

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
      scrollTrigger: {
        trigger: credentialsSection,
        start: 'top calc(100vh - var(--space-4xl))', // Pin when top is 4xl (128px) from top of viewport
        end: '+=250%', // Pin for 250% of viewport height
        scrub: 2, // Smooth scrubbing
        pin: true, // Pin the section during animation
        pinSpacing: true, // Add spacing to prevent layout shift
        anticipatePin: 1, // Smooth pinning
      },
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
  
  animatedElements.forEach((element) => {
    const originalText = element.textContent.trim()
    const words = originalText.split(' ').filter(w => w.length > 0)
    
    if (words.length === 0) {
      return
    }
    
    // Get element width for clone measurement - try multiple methods
    let elementWidth = element.getBoundingClientRect().width
    if (elementWidth === 0) {
      elementWidth = element.offsetWidth
    }
    if (elementWidth === 0) {
      // Try parent width
      const parent = element.parentElement
      if (parent) {
        elementWidth = parent.getBoundingClientRect().width || parent.offsetWidth
      }
    }
    if (elementWidth === 0) {
      // Last resort: use window width
      elementWidth = window.innerWidth
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
    
    // Clear original and create line structure
    element.innerHTML = ''
    element.style.overflow = 'hidden'
    
    lines.forEach((lineWords) => {
      const lineSpan = document.createElement('span')
      lineSpan.className = 'line'
      lineSpan.style.display = 'block'
      lineSpan.style.overflow = 'hidden'
      
      const lineInner = document.createElement('span')
      lineInner.className = 'line-inner'
      lineInner.style.display = 'block'
      lineInner.textContent = lineWords.join(' ')
      
      lineSpan.appendChild(lineInner)
      element.appendChild(lineSpan)
    })
    
    // Get line elements and animate
    const lineElements = element.querySelectorAll('.line-inner')
    
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
    
    // Check if element is already in viewport
    const rect = element.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const isInView = rect.top < viewportHeight * 0.85 && rect.bottom > 0
    
    if (isInView) {
      // Animate immediately if already in view
      gsap.to(lineElements, {
        y: '0%',
        opacity: 1,
        duration: 0.9,
        ease: 'power2.out',
        stagger: 0.1
      })
    } else {
      // Use ScrollTrigger for elements not yet in view
      // Declare anim first to avoid temporal dead zone error
      let anim;
      anim = gsap.to(lineElements, {
        y: '0%',
        opacity: 1,
        duration: 0.9,
        ease: 'power2.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none none',
          onEnter: () => {
            // Ensure animation plays - check if anim is defined first
            if (anim) {
              anim.restart()
            }
          },
          onEnterBack: () => {
            // Ensure animation plays when scrolling back
            if (anim) {
              anim.restart()
            }
          }
        }
      })
      
      // Fallback: if ScrollTrigger doesn't fire, animate after a delay
      setTimeout(() => {
        if (anim.progress() === 0) {
          // Animation hasn't started, check if element is now in view
          const currentRect = element.getBoundingClientRect()
          if (currentRect.top < viewportHeight && currentRect.bottom > 0) {
            anim.restart()
          }
        }
      }, 1000)
    }
  })
}


// Initialize Lenis first, then animations
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initLenis()
    initAnimations()
  })
} else {
  initLenis()
  initAnimations()
}

// Re-initialize on page navigation (for SPA-like behavior if needed)
export { initAnimations }

