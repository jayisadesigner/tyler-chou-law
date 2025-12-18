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
  // Only animate if GSAP is available
  if (typeof gsap !== 'undefined' && ScrollTrigger) {
    const sections = document.querySelectorAll('.section-reveal')
    sections.forEach((section) => {
      // Set initial state for animation
      gsap.set(section, { opacity: 0, y: 60 })
      
      gsap.to(section, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })
    })

    // Fade in elements on scroll
    const fadeElements = document.querySelectorAll('.fade-in')
    fadeElements.forEach((element) => {
      // Set initial state for animation
      gsap.set(element, { opacity: 0 })
      
      gsap.to(element, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    })

    // Subtle flower rotation on scroll
    const flower = document.querySelector('.about-flower')
    if (flower) {
      const aboutSection = document.querySelector('.about')
      if (aboutSection) {
        gsap.to(flower, {
          rotation: 30, // 30 degree clockwise rotation
          ease: 'none', // Linear rotation based on scroll
          scrollTrigger: {
            trigger: aboutSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1, // Smooth rotation tied to scroll position
          },
        })
      }
    }

    // Headshot shuffle animation on hover
    initHeadshotShuffle()
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

