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
  
  const paloVerdeSection = document.querySelector('.palo-verde')

  // Palo Verde section background switching (CSS handles color transition)
  if (paloVerdeSection) {
    ScrollTrigger.create({
      trigger: paloVerdeSection,
      start: 'top center',
      end: 'bottom top',
      onEnter: () => {
        document.body.classList.add('bg-palo-verde')
        document.body.classList.remove('bg-bone')
      },
      onLeave: () => {
        document.body.classList.remove('bg-palo-verde')
      },
      onEnterBack: () => {
        document.body.classList.add('bg-palo-verde')
        document.body.classList.remove('bg-bone')
      },
      onLeaveBack: () => {
        document.body.classList.remove('bg-palo-verde')
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
    
    // Find parent hero section for trigger
    const heroSection = img.closest('.hero--inner-page') || img.closest('.hero')
    if (!heroSection) return
    
    // Moderate parallax: scale + y movement for reliable coverage
    // Image is already taller in CSS (120%) and offset (-10%) for initial coverage
    gsap.to(img, {
      scale: 1.15, // Zoom in 15% (covers more area, prevents gaps)
      yPercent: 10, // Move down 10% (image is already taller, so this is safe)
      ease: 'none', // Linear movement for smooth parallax
      scrollTrigger: {
        trigger: heroSection,
        start: 'top bottom', // Start when hero top hits viewport bottom
        end: 'bottom top', // End when hero bottom hits viewport top
        scrub: 1, // Smooth scrubbing (1 = 1 second lag for smoothness)
        invalidateOnRefresh: true // Recalculate on resize
      }
    })
  })
}

/**
 * Philosophy section redaction animation
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

  // If reduced motion, show final state immediately
  if (reducedMotion) {
    gsap.set([contentText, kingText], { opacity: 1 })
    gsap.set(queenText, { opacity: 1 })
    // Set redaction boxes to full scale (final state)
    const getSpacingValue = (variableName) => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(variableName).trim()
      const remValue = parseFloat(value)
      return Math.ceil(remValue * 16)
    }
    void contentText.offsetHeight
    void kingText.offsetHeight
    const contentRect = contentText.getBoundingClientRect()
    const kingRect = kingText.getBoundingClientRect()
    const strikethroughPadding = getSpacingValue('--space-xs')
    const firstWidth = contentRect.width + (strikethroughPadding * 2)
    const secondWidth = kingRect.width + (strikethroughPadding * 2)
    gsap.set(redactionFirst, { width: firstWidth, scaleX: 1, transformOrigin: 'left center' })
    gsap.set(redactionSecond, { width: secondWidth, scaleX: 1, transformOrigin: 'left center' })
    return
  }

  // Mobile: fade in text elements sequentially on scroll
  if (window.matchMedia('(max-width: 768px)').matches) {
    // Set initial state - all text hidden
    gsap.set([contentText, kingText, queenText], { opacity: 0 })
    
    // Create a simple scroll-triggered timeline for mobile
    const mobileTl = gsap.timeline({
      scrollTrigger: {
        trigger: philosophySection,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1,
      },
    })
    
    // Fade in "Content" first
    mobileTl.to(contentText, {
      opacity: 1,
      ease: 'power2.out',
      duration: 1.2,
    }, 0)
    
    // Fade in "is king" second (staggered)
    mobileTl.to(kingText, {
      opacity: 1,
      ease: 'power2.out',
      duration: 1.2,
    }, 0.5)
    
    // Fade in "ip is Queen" last
    mobileTl.to(queenText, {
      opacity: 1,
      ease: 'power2.out',
      duration: 1.2,
    }, 1.0)
    
    return
  }

  // Set CSS variables for animated layout (left-aligned, original grid positions)
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

  // Get spacing values from CSS variables
  const getSpacingValue = (variableName) => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(variableName).trim()
    // Convert rem to pixels (assuming 16px base)
    const remValue = parseFloat(value)
    return Math.ceil(remValue * 16) // Convert to pixels
  }

  // Measure actual text dimensions and calculate positioning
  const getDimensions = () => {
    // Force a reflow to ensure accurate measurements
    void contentText.offsetHeight
    void kingText.offsetHeight
    
    const contentRect = contentText.getBoundingClientRect()
    const kingRect = kingText.getBoundingClientRect()
    const firstItem = contentText.closest('.philosophy-item')
    const secondItem = kingText.closest('.philosophy-item')
    const firstItemRect = firstItem.getBoundingClientRect()
    const secondItemRect = secondItem.getBoundingClientRect()
    
    const strikethroughHeight = getSpacingValue('--space-lg')
    const strikethroughPadding = getSpacingValue('--space-xs') // Small padding on left and right
    
    // Calculate left offset: text position relative to its container minus padding
    // This positions the strikethrough to start before the text by the padding amount
    const firstLeft = (contentRect.left - firstItemRect.left) - strikethroughPadding
    const secondLeft = (kingRect.left - secondItemRect.left) - strikethroughPadding
    
    // Width = exact text width + padding on both sides (no rounding until final pixel value)
    const firstWidth = contentRect.width + (strikethroughPadding * 2)
    const secondWidth = kingRect.width + (strikethroughPadding * 2)
    
    return {
      firstWidth: Math.round(firstWidth), // Round to nearest pixel for clean rendering
      firstHeight: strikethroughHeight,
      firstLeft: Math.round(firstLeft), // Round to nearest pixel
      secondWidth: Math.round(secondWidth), // Round to nearest pixel
      secondHeight: strikethroughHeight,
      secondLeft: Math.round(secondLeft), // Round to nearest pixel
    }
  }

  // Calculate dimensions - will be recalculated on resize
  let dims = getDimensions()
  
  // Function to update dimensions (position and height only)
  const updateDimensions = () => {
    dims = getDimensions()
    gsap.set(redactionFirst, { 
      height: dims.firstHeight,
      left: dims.firstLeft
    })
    gsap.set(redactionSecond, { 
      height: dims.secondHeight,
      left: dims.secondLeft
    })
  }

  // Set initial state - boxes start at 0 scale, positioned correctly, queen text hidden
  updateDimensions()
  gsap.set(redactionFirst, { width: dims.firstWidth, scaleX: 0, transformOrigin: 'left center' })
  gsap.set(redactionSecond, { width: dims.secondWidth, scaleX: 0, transformOrigin: 'left center' })
  gsap.set(queenText, { opacity: 0 })

  // Responsive scroll duration based on viewport height
  // Increased multiplier to give more time to view "ip is queen" after animation completes
  const scrollMultiplier = Math.max(2.5, Math.min(5, window.innerHeight / 250))

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: philosophySection,
      start: 'top top',
      end: `+=${scrollMultiplier * 100}%`,
      scrub: 2.5,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      onRefresh: updateDimensions,
      onEnter: () => {
        document.body.classList.add('bg-bone')
        document.body.classList.remove('bg-palo-verde')
      },
      onLeave: () => {
        document.body.classList.remove('bg-bone')
      },
      onEnterBack: () => {
        document.body.classList.add('bg-bone')
        document.body.classList.remove('bg-palo-verde')
      },
      onLeaveBack: () => {
        document.body.classList.remove('bg-bone')
      },
    },
  })

  // First redaction box - starts after delay to give time to read
  tl.to(redactionFirst, {
    scaleX: 1,
    ease: 'power2.inOut',
    duration: 1,
  }, 0.2)

  // Second redaction box - starts slightly after first (staggered)
  tl.to(redactionSecond, {
    scaleX: 1,
    ease: 'power2.inOut',
    duration: 1,
  }, 0.35)

  // Fade in "ip is Queen" after both redactions are completely done
  tl.to(queenText, {
    opacity: 1,
    ease: 'power2.out',
    duration: 0.6,
  }, 1.4)

  // Add a pause/hold at the end to keep "ip is queen" visible longer
  // This extends the timeline, giving more scroll distance before unpinning
  tl.to({}, { duration: 1.2 }) // Add 1.2 more timeline duration (60% more viewing time)

  // Function to update dimensions on resize
  const updateDimensionsOnResize = () => {
    dims = getDimensions() // Update the dims variable
    
    // Update position, dimensions, and maintain scale
    const progress = tl.progress()
    
    gsap.set(redactionFirst, { 
      height: dims.firstHeight,
      left: dims.firstLeft,
      width: dims.firstWidth
    })
    gsap.set(redactionSecond, { 
      height: dims.secondHeight,
      left: dims.secondLeft,
      width: dims.secondWidth
    })
    
    // Maintain current scale based on progress
    if (progress >= 0.2) {
      const firstProgress = Math.min(1, (progress - 0.2) / 0.8)
      gsap.set(redactionFirst, { scaleX: firstProgress })
    } else {
      gsap.set(redactionFirst, { scaleX: 0 })
    }
    
    if (progress >= 0.35) {
      const secondProgress = Math.min(1, (progress - 0.35) / 0.65)
      gsap.set(redactionSecond, { scaleX: secondProgress })
    } else {
      gsap.set(redactionSecond, { scaleX: 0 })
    }
  }

  // Handle resize - recalculate dimensions and refresh ScrollTrigger
  ScrollTrigger.addEventListener('refresh', updateDimensionsOnResize)
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
      const anim = gsap.to(lineElements, {
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
            // Ensure animation plays
            anim.restart()
          },
          onEnterBack: () => {
            // Ensure animation plays when scrolling back
            anim.restart()
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

