/**
 * Mouse Trail Effect
 * Creates a trail of images following the cursor on sections with --has-mousetrail modifier
 * Works with both .content-section and .hero sections
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Initialize mouse trail effect
 * @param {boolean} reducedMotion - If true, skip animation
 */
export function initMouseTrail(reducedMotion = false) {
  // Check if device supports hover (desktop/tablet with mouse)
  const hasHover = window.matchMedia('(hover: hover)').matches
  
  // Support both content-section and hero sections
  const sections = document.querySelectorAll(
    '.content-section--has-mousetrail, .hero--has-mousetrail'
  )
  
  if (sections.length === 0 || reducedMotion || !hasHover) {
    return
  }

  sections.forEach((section) => {
    // Get trail images from the section
    const trailImages = section.querySelectorAll('.mouse-trail__image')
    
    if (trailImages.length === 0) {
      return
    }

    // Configuration
    const STAGGER = 0.1 // Delay between each image
    const TRAIL_DURATION = 0.8 // Animation duration
    // Calculate total trail duration: last image start delay + animation duration
    // This ensures trail completes before hiding when movement stops
    const TOTAL_TRAIL_DURATION = ((trailImages.length - 1) * STAGGER) + TRAIL_DURATION
    const MOVEMENT_TIMEOUT = TOTAL_TRAIL_DURATION * 1000 // Convert to ms
    
    // Set initial state - position off-screen (opacity controlled by CSS class)
    // Clear any inline opacity styles that might interfere with CSS classes
    gsap.set(trailImages, {
      x: -9999,
      y: -9999,
      clearProps: 'opacity' // Remove any inline opacity styles
    })

    // Track latest mouse position and active state
    let mouseX = 0
    let mouseY = 0
    let isActive = false
    let movementTimeout = null // Track timeout for hiding when movement stops
    
    // Mouse move handler - update position and start animation
    const handleMouseMove = (e) => {
      const rect = section.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
      
      // Check if target is an interactive element
      const target = e.target
      const isInteractive = target.matches('a, button, input, textarea, select, label, .btn, [role="button"], [role="link"]')
      
      // Clear any existing movement timeout (mouse is moving)
      if (movementTimeout) {
        clearTimeout(movementTimeout)
        movementTimeout = null
      }
      
      // Show/hide images based on whether over interactive element
      if (isInteractive) {
        // Hide images when over interactive elements
        trailImages.forEach(img => img.classList.remove('is-visible'))
        isActive = false
      } else {
        // Show images when mouse moves (and not over interactive)
        trailImages.forEach(img => img.classList.add('is-visible'))
        
        if (!isActive) {
          isActive = true
          animateTrail()
        }
        
        // Set timeout to hide images when movement stops
        movementTimeout = setTimeout(() => {
          // Hide images instantly when mouse stops moving
          trailImages.forEach(img => img.classList.remove('is-visible'))
          isActive = false
          movementTimeout = null
        }, MOVEMENT_TIMEOUT)
      }
    }
    
    // Continuous animation loop using RAF
    const animateTrail = () => {
      if (!isActive) return
      
      trailImages.forEach((img, index) => {
        const delay = index * STAGGER
        
        // Animate to position (visibility handled by mousemove)
        gsap.to(img, {
          x: mouseX,
          y: mouseY,
          duration: TRAIL_DURATION,
          delay: delay,
          ease: 'power2.out',
          overwrite: 'auto'
        })
      })
      
      requestAnimationFrame(animateTrail)
    }

    // Mouse leave - stop animation and hide images
    const handleMouseLeave = () => {
      isActive = false
      
      // Clear movement timeout
      if (movementTimeout) {
        clearTimeout(movementTimeout)
        movementTimeout = null
      }
      
      // Hide images instantly when leaving section
      trailImages.forEach(img => img.classList.remove('is-visible'))
      
      // Reset position
      gsap.set(trailImages, {
        x: -9999,
        y: -9999
      })
    }

    // Event listeners
    section.addEventListener('mousemove', handleMouseMove, { passive: true })
    section.addEventListener('mouseleave', handleMouseLeave, { passive: true })

    // Store cleanup function
    section._mouseTrailCleanup = () => {
      isActive = false
      if (movementTimeout) clearTimeout(movementTimeout)
      section.removeEventListener('mousemove', handleMouseMove)
      section.removeEventListener('mouseleave', handleMouseLeave)
    }
  })
}

