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
  // Hero curtain reveal animation
  const heroSection = document.querySelector('.hero')
  if (heroSection) {
    const curtain = heroSection.querySelector('.curtain')
    const heroContent = heroSection.querySelector('.hero-content')
    
    if (curtain) {
      gsap.to(curtain, {
        height: 0,
        duration: 1.2,
        ease: 'power3.inOut',
        delay: 0.3,
        onComplete: () => {
          // Change text color to obsidian when curtain is gone
          if (heroContent) {
            heroContent.style.color = 'var(--obsidian)'
          }
        }
      })
    }
    
    if (heroContent) {
      // Start with bone text (visible on obsidian curtain)
      heroContent.style.color = 'var(--bone)'
      
      gsap.from(heroContent, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
        delay: 0.5,
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
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations)
} else {
  initAnimations()
}

// Re-initialize on page navigation (for SPA-like behavior if needed)
export { initAnimations }

