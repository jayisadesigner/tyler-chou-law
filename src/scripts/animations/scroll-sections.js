/**
 * Scroll Sections
 * Pinned/scrubbed scroll animations for content sections
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { 
  setBodyTheme, 
  getSpacingValue, 
  calculateScrollMultiplier, 
  createPinnedScrollConfig 
} from './utils.js'

// Register GSAP plugins
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Pin centered sections during scroll
 * Creates a sticky effect for sections with .content-section--pinned
 * Note: Use --pinned modifier separately from --full-height for more control
 */
export function initPinnedSections() {
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
 * @param {number} viewportHeight - Current viewport height
 */
export function initLoveLettersScroll(reducedMotion = false, viewportHeight = window.innerHeight) {
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
          end: '+=400%', // Pin for 4x viewport height - faster scroll while ensuring all cards fully scroll through
          scrub: 1,
          callbacks: {
            id: 'love-notes-desktop',
            invalidateOnRefresh: true,
            // Set nav color when love-notes enters (philosophy is now on about page, not before love-notes)
            onEnter: () => setBodyTheme('bg-bone'),
            onEnterBack: () => setBodyTheme('bg-bone'),
            // Reset nav color when love-notes unpins (scrolling down past the section)
            onLeave: () => setBodyTheme(''),
            // Reset when scrolling back up past love-notes
            onLeaveBack: () => setBodyTheme(''),
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
 * Philosophy section redaction animation
 * Mobile-first: Same redaction animation on all screen sizes
 * Redacts "Content" and "is king" text and fades in "ip is Queen" based on scroll progress
 * Fully responsive - calculates widths/heights dynamically based on actual text dimensions
 * @param {boolean} reducedMotion - If true, skip animation and show final state
 * @param {number} viewportHeight - Current viewport height
 */
export function initPhilosophyRedaction(reducedMotion = false, viewportHeight = window.innerHeight) {
  const philosophySection = document.querySelector('.philosophy')
  if (!philosophySection) return

  const redactionFirst = philosophySection.querySelector('.philosophy-redaction--first')
  const redactionSecond = philosophySection.querySelector('.philosophy-redaction--second')
  const queenText = philosophySection.querySelector('.philosophy-text--queen')
  const contentText = philosophySection.querySelector('.philosophy-text--content')
  const kingText = philosophySection.querySelector('.philosophy-text--king')

  if (!redactionFirst || !redactionSecond || !queenText || !contentText || !kingText) return

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
    
    // Scale redaction line height with font size (18% of font size for thicker lines)
    // This ensures vertical centering stays correct with fluid clamp() font sizes
    // top: 50% + translateY(-50%) keeps lines vertically centered regardless of height
    const strikethroughHeight = fontSize * 0.18
    
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

  // Helper: Extract duplicate mobile timeline creation
  const playMobileRedaction = () => {
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
    
    return mobileTl
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
          playMobileRedaction()
        },
        onEnterBack: () => {
          playMobileRedaction()
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
      const desktopScrollMultiplier = calculateScrollMultiplier(2.5, 5, 250, viewportHeight)
      
      // Philosophy section - no background color change needed
      // About page already has bone background by default
      // Only palo verde section changes background to green
      
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
export function initCredentialsShadow(reducedMotion = false) {
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

