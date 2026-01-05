/**
 * Parallax Effects
 * Background image/video parallax and flower rotation animations
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getSpacingValue } from './utils.js'

// Register GSAP plugins
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Animate flower rotation based on scroll
 * @param {string} flowerSelector - Selector for flower element
 * @param {string} triggerSelector - Selector for trigger element
 * @param {boolean} prefersReducedMotion - If true, skip animation
 */
export function animateFlowerRotation(flowerSelector, triggerSelector, prefersReducedMotion = false) {
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
 * Initialize hero background parallax effects
 * @param {boolean} reducedMotion - If true, skip animation and show final state
 */
export function initHeroParallax(reducedMotion = false) {
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

