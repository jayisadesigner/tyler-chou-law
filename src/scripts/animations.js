/**
 * GSAP Animations
 * Handles all page animations including hero reveals and scroll triggers
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Initialize animations when DOM is ready
function initAnimations() {
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

  // Fade in elements on scroll
  document.querySelectorAll('.fade-in').forEach((element) => {
      gsap.fromTo(element,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )
  })

  // Subtle flower rotation on scroll - About section
  const aboutFlower = document.querySelector('.about-flower')
  if (aboutFlower) {
    const aboutSection = document.querySelector('.about')
    if (aboutSection) {
      gsap.to(aboutFlower, {
        rotation: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: aboutSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      })
    }
  }

  // Subtle flower rotation on scroll - Palo Verde section
  const paloVerdeFlower = document.querySelector('.palo-verde-flower')
  const paloVerdeSection = document.querySelector('.palo-verde')
  
  if (paloVerdeFlower && paloVerdeSection) {
    gsap.to(paloVerdeFlower, {
      rotation: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: paloVerdeSection,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    })
  }

  // Animate page background color based on scroll position
  const defaultColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--chuparosa-600').trim()
  
  gsap.set(document.body, { backgroundColor: defaultColor })

  // Palo Verde section background switching
  if (paloVerdeSection) {
    const paloVerdeColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--palo-verde-700').trim()

    ScrollTrigger.create({
      trigger: paloVerdeSection,
      start: 'top top',
      end: 'bottom top',
      onEnter: () => {
        gsap.set(document.body, { backgroundColor: paloVerdeColor })
        document.body.classList.add('bg-palo-verde')
        document.body.classList.remove('bg-bone')
      },
      onLeave: () => {
        gsap.set(document.body, { backgroundColor: defaultColor })
        document.body.classList.remove('bg-palo-verde')
      },
      onEnterBack: () => {
        gsap.set(document.body, { backgroundColor: paloVerdeColor })
        document.body.classList.add('bg-palo-verde')
        document.body.classList.remove('bg-bone')
      },
      onLeaveBack: () => {
        gsap.set(document.body, { backgroundColor: defaultColor })
        document.body.classList.remove('bg-palo-verde')
      },
    })
  }

  // Philosophy section (bone background) switching
  const philosophySection = document.querySelector('.philosophy')
  if (philosophySection) {
    const boneColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--bone').trim()

    // Calculate the same end point as the pinned animation to stay in sync
    const scrollMultiplier = Math.max(2.5, Math.min(5, window.innerHeight / 250))
    const pinnedDuration = scrollMultiplier * 100 // Percentage of viewport height

    ScrollTrigger.create({
      trigger: philosophySection,
      start: 'top top',
      end: `+=${pinnedDuration}%`, // Match the pinned animation duration
      onEnter: () => {
        gsap.set(document.body, { backgroundColor: boneColor })
        document.body.classList.add('bg-bone')
        document.body.classList.remove('bg-palo-verde')
      },
      onLeave: () => {
        gsap.set(document.body, { backgroundColor: defaultColor })
        document.body.classList.remove('bg-bone')
      },
      onEnterBack: () => {
        gsap.set(document.body, { backgroundColor: boneColor })
        document.body.classList.add('bg-bone')
        document.body.classList.remove('bg-palo-verde')
      },
      onLeaveBack: () => {
        gsap.set(document.body, { backgroundColor: defaultColor })
        document.body.classList.remove('bg-bone')
      },
      refreshPriority: -1, // Lower priority to avoid conflicts with pinned animation
    })
  }

  // Philosophy section redaction animation
  initPhilosophyRedaction()

  // Credentials section shadow animation
  initCredentialsShadow()

  // Headshot shuffle animation on hover
  initHeadshotShuffle()
}

/**
 * Philosophy section redaction animation
 * Redacts "Content" and "is king" text and fades in "ip is Queen" based on scroll progress
 * Fully responsive - calculates widths/heights dynamically based on actual text dimensions
 */
function initPhilosophyRedaction() {
  const philosophySection = document.querySelector('.philosophy')
  if (!philosophySection) return

  const redactionFirst = philosophySection.querySelector('.philosophy-redaction--first')
  const redactionSecond = philosophySection.querySelector('.philosophy-redaction--second')
  const queenText = philosophySection.querySelector('.philosophy-text--queen')
  const contentText = philosophySection.querySelector('.philosophy-text--content')
  const kingText = philosophySection.querySelector('.philosophy-text--king')

  if (!redactionFirst || !redactionSecond || !queenText || !contentText || !kingText) return

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

  // Set initial state - boxes start at 0 width, positioned correctly, queen text hidden
  updateDimensions()
  gsap.set(redactionFirst, { width: 0 })
  gsap.set(redactionSecond, { width: 0 })
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
      onRefresh: updateDimensions
    },
  })

  // First redaction box - starts after delay to give time to read
  tl.to(redactionFirst, {
    width: dims.firstWidth,
    ease: 'power2.inOut',
    duration: 1,
  }, 0.2)

  // Second redaction box - starts slightly after first (staggered)
  tl.to(redactionSecond, {
    width: dims.secondWidth,
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
    
    // Update position and height
    gsap.set(redactionFirst, { 
      height: dims.firstHeight,
      left: dims.firstLeft
    })
    gsap.set(redactionSecond, { 
      height: dims.secondHeight,
      left: dims.secondLeft
    })
    
    // Get current progress to maintain visual state
    const progress = tl.progress()
    
    // Update widths immediately based on current progress
    if (progress >= 0.2) {
      const firstProgress = Math.min(1, (progress - 0.2) / 0.8)
      gsap.set(redactionFirst, { width: dims.firstWidth * firstProgress })
    } else {
      gsap.set(redactionFirst, { width: 0 })
    }
    
    if (progress >= 0.35) {
      const secondProgress = Math.min(1, (progress - 0.35) / 0.65)
      gsap.set(redactionSecond, { width: dims.secondWidth * secondProgress })
    } else {
      gsap.set(redactionSecond, { width: 0 })
    }
    
    // Update the timeline tween end values
    const children = tl.getChildren()
    const firstTween = children.find(t => t.targets && t.targets().includes(redactionFirst))
    const secondTween = children.find(t => t.targets && t.targets().includes(redactionSecond))
    
    if (firstTween) {
      firstTween.vars.width = dims.firstWidth
      firstTween.invalidate()
    }
    if (secondTween) {
      secondTween.vars.width = dims.secondWidth
      secondTween.invalidate()
    }
    
    // Invalidate timeline to force recalculation
    tl.invalidate()
  }

  // Handle resize - recalculate dimensions and refresh ScrollTrigger
  ScrollTrigger.addEventListener('refresh', updateDimensionsOnResize)
  
  // Also handle window resize directly
  let resizeTimeout
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      updateDimensionsOnResize()
      ScrollTrigger.refresh()
    }, 150) // Debounce resize events
  })
}

/**
 * Credentials section scroll animation
 * Pins the section and scrolls credentials content, with shadow on header
 */
function initCredentialsShadow() {
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
 * Text scales up and fades in from center on scroll
 */
function initCTAVideos() {
  const ctaSection = document.querySelector('.cta-videos')
  if (!ctaSection) return

  const ctaHeadline = ctaSection.querySelector('.cta-videos-headline')
  const ctaButton = ctaSection.querySelector('.cta-videos-content .btn')
  
  if (!ctaHeadline) return

  // Set initial state - scaled down and transparent
  gsap.set(ctaHeadline, { 
    scale: 0.8, 
    opacity: 0,
    transformOrigin: 'center center'
  })
  
  if (ctaButton) {
    gsap.set(ctaButton, {
      scale: 0.8,
      opacity: 0,
      transformOrigin: 'center center'
    })
  }

  // Animate on scroll
  gsap.to(ctaHeadline, {
    scale: 1,
    opacity: 1,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: ctaSection,
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
  })

  if (ctaButton) {
    gsap.to(ctaButton, {
      scale: 1,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
      delay: 0.2, // Slight delay after headline
      scrollTrigger: {
        trigger: ctaSection,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    })
  }
}

/**
 * Headshot shuffle animation
 * Cycles through headshot images on hover before returning to original
 */
function initHeadshotShuffle() {
  const portraitContainer = document.querySelector('.about-portrait')
  if (!portraitContainer) return

  const mainImage = portraitContainer.querySelector('.about-portrait__image')
  const shuffleImages = Array.from(portraitContainer.querySelectorAll('.about-portrait__shuffle'))
  
  if (!mainImage || shuffleImages.length === 0) return

  const originalSrc = mainImage.getAttribute('data-original') || mainImage.src
  let shuffleInterval = null
  let currentIndex = 0
  let shuffledIndices = []

  // Shuffle array function
  function shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Show a specific image by index (-1 for original)
  function showImage(imageIndex) {
    if (imageIndex === -1) {
      // Show original
      gsap.set(mainImage, { opacity: 1 })
      shuffleImages.forEach(img => {
        gsap.set(img, { opacity: 0 })
      })
    } else {
      // Show shuffle image at index
      gsap.set(mainImage, { opacity: 0 })
      shuffleImages.forEach((img, index) => {
        if (index === imageIndex) {
          gsap.set(img, { opacity: 1 })
        } else {
          gsap.set(img, { opacity: 0 })
        }
      })
    }
  }

  // Start shuffle animation
  function startShuffle() {
    // Create shuffled array of indices
    shuffledIndices = shuffleArray([...Array(shuffleImages.length).keys()])
    currentIndex = 0

    // Cycle through shuffled images
    shuffleInterval = setInterval(() => {
      if (currentIndex < shuffledIndices.length) {
        const imgIndex = shuffledIndices[currentIndex]
        showImage(imgIndex)
        currentIndex++
      } else {
        // Return to original
        clearInterval(shuffleInterval)
        showImage(-1)
      }
    }, 200) // Change image every 200ms
  }

  // Stop shuffle and return to original
  function stopShuffle() {
    if (shuffleInterval) {
      clearInterval(shuffleInterval)
      shuffleInterval = null
    }
    showImage(-1)
    currentIndex = 0
    shuffledIndices = []
  }

  // Add hover event listeners
  portraitContainer.addEventListener('mouseenter', startShuffle)
  portraitContainer.addEventListener('mouseleave', stopShuffle)
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations)
} else {
  initAnimations()
}

// Re-initialize on page navigation (for SPA-like behavior if needed)
export { initAnimations }

