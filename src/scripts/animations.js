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
  if (paloVerdeSection) {
    const defaultColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--chuparosa-800').trim()
    const paloVerdeColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--palo-verde-700').trim()

    gsap.set(document.body, { backgroundColor: defaultColor })

    ScrollTrigger.create({
      trigger: paloVerdeSection,
      start: 'top top',
      end: 'bottom top',
      onEnter: () => {
        gsap.set(document.body, { backgroundColor: paloVerdeColor })
        document.body.classList.add('bg-palo-verde')
      },
      onLeave: () => {
        gsap.set(document.body, { backgroundColor: defaultColor })
        document.body.classList.remove('bg-palo-verde')
      },
      onEnterBack: () => {
        gsap.set(document.body, { backgroundColor: paloVerdeColor })
        document.body.classList.add('bg-palo-verde')
      },
      onLeaveBack: () => {
        gsap.set(document.body, { backgroundColor: defaultColor })
        document.body.classList.remove('bg-palo-verde')
      },
    })
  }

  // Philosophy section redaction animation
  initPhilosophyRedaction()

  // Headshot shuffle animation on hover
  initHeadshotShuffle()
}

/**
 * Philosophy section redaction animation
 * Redacts "Content" and "is king" text and fades in "ip is Queen" based on scroll progress
 */
function initPhilosophyRedaction() {
  const philosophySection = document.querySelector('.philosophy')
  if (!philosophySection) return

  const redactionFirst = philosophySection.querySelector('.philosophy-redaction--first')
  const redactionSecond = philosophySection.querySelector('.philosophy-redaction--second')
  const queenText = philosophySection.querySelector('.philosophy-text--queen')

  if (!redactionFirst || !redactionSecond || !queenText) return

  // Set initial state - boxes start at 0 width, queen text hidden
  gsap.set([redactionFirst, redactionSecond], { width: 0 })
  gsap.set(queenText, { opacity: 0 })

  // Create a timeline that pins the section while animation plays
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: philosophySection,
      start: 'top top', // Pin when section reaches top of viewport
      end: '+=250%', // Pin for 250% of viewport height (more time after animation)
      scrub: 2.5, // Smooth scrubbing
      pin: true, // Pin the section during animation
      pinSpacing: true, // Add spacing to prevent layout shift
      anticipatePin: 1, // Smooth pinning
    },
  })

  // First redaction box - starts after delay to give time to read
  tl.to(redactionFirst, {
    width: '724px',
    ease: 'power2.inOut',
    duration: 1, // Takes up portion of timeline
  }, 0.2) // Start at 20% of timeline

  // Second redaction box - starts slightly after first (staggered)
  tl.to(redactionSecond, {
    width: '724px',
    ease: 'power2.inOut',
    duration: 1, // Takes up portion of timeline
  }, 0.35) // Start at 35% of timeline (15% after first)
  // Second redaction completes at: 0.35 + 1 = 1.35

  // Fade in "ip is Queen" after both redactions are completely done
  // Longer fade-in duration and more time to view
  tl.to(queenText, {
    opacity: 1,
    ease: 'power2.out',
    duration: 0.6, // Longer fade in duration
  }, 1.4) // Start at 1.4 (after second redaction completes at 1.35, with slight pause)
  // Animation completes at: 1.4 + 0.6 = 2.0, then extra scroll time before unpinning
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

