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
export function animateFlowerRotation(flowerSelector, triggerSelector, prefersReducedMotion = false, startPosition = 'top bottom') {
  const flower = document.querySelector(flowerSelector)
  // Handle both selector string and element
  const trigger = typeof triggerSelector === 'string' 
    ? document.querySelector(triggerSelector) 
    : triggerSelector
  
  if (!flower || !trigger) {
    return
  }
  
  if (prefersReducedMotion) {
    gsap.set(flower, { rotation: 30 })
    return
  }
  
  // Animate from 0 to 30 degrees based on scroll
  // Use the full height of the trigger section to ensure complete rotation
  const animation = gsap.fromTo(flower, 
    { rotation: 0 },
    {
      rotation: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: trigger,
        start: startPosition, // Use provided start position (defaults to 'top bottom', but can be customized)
        end: '+=100%', // Extend the end point to give more scroll range for complete rotation
        scrub: 2, // Increased from 1 to 2 for smoother animation (less jittery)
        invalidateOnRefresh: true,
        // Removed callbacks that were directly setting rotation values
        // These were causing glitchiness by interfering with GSAP's smooth scroll animation
        // GSAP's fromTo with initial values ensures proper start/end states
      },
    }
  )
  
  return animation
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
    const heroSection = img.closest('.hero--inner-page') || 
                        img.closest('.hero--blog-post') || 
                        img.closest('.hero')
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
  
  // Handle videos (iframes inside .background-image__video-wrapper).
  // The wrapper handles centering in CSS; we animate scale + y on the iframe.
  // Because we never touch xPercent/yPercent on the iframe, GSAP can't double-translate.
  // Playback is controlled by the iframe URL params (autoplay/loop/muted/background) —
  // no Vimeo Player SDK is loaded, so we never wait on a JS player API.
  backgroundVideos.forEach(video => {
    const backgroundImage = video.closest('.background-image')

    if (backgroundImage) backgroundImage.classList.add('is-ready')
    video.classList.add('is-ready')

    if (reducedMotion) return

    // Find parent section for trigger (hero or content-section with parallax)
    const triggerSection =
      video.closest('.hero--inner-page') ||
      video.closest('.hero--blog-post') ||
      video.closest('.hero') ||
      video.closest('.content-section--parallax')
    if (!triggerSection) return

    // Animate scale + y (in pixels) on the iframe. Centering belongs to the
    // wrapper, so neither property composes with a translate(-50%) — both
    // are additive transforms applied on top of the inherited CSS layout.
    gsap.fromTo(video,
      { scale: 1, y: 0 },
      {
        scale: 1.15,
        y: () => triggerSection.offsetHeight * 0.1, // 10% of section height
        ease: 'none',
        scrollTrigger: {
          trigger: triggerSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          invalidateOnRefresh: true
        }
      }
    )
  })
}

