/**
 * Intro Animation
 * Homepage intro sequence and curtain
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initLineAnimations } from './line-animations.js'
import { splitTextIntoChars } from './line-animations.js'
// Vimeo loader no longer needed - using local video elements

// Register GSAP plugins
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Global flag to track if user scrolled before intro initialized
let earlyScrollDetected = false

// Early scroll detection - runs immediately, before initIntro
export function setupEarlyScrollDetection() {
  // Check if page is already scrolled (user might have scrolled before JS loaded)
  if (window.pageYOffset > 0 || document.documentElement.scrollTop > 0) {
    earlyScrollDetected = true
    return
  }
  
  let touchStartY = 0
  
  const handleWheel = () => {
    earlyScrollDetected = true
    cleanup()
  }
  
  const handleTouchStart = (e) => {
    touchStartY = e.touches[0].clientY
  }
  
  const handleTouchMove = (e) => {
    const touchMoveY = e.touches[0].clientY
    const deltaY = Math.abs(touchMoveY - touchStartY)
    // If user moved more than 10px, consider it a scroll attempt
    if (deltaY > 10) {
      earlyScrollDetected = true
      cleanup()
    }
  }
  
  const handleKeyDown = (e) => {
    if ([' ', 'ArrowDown', 'PageDown'].includes(e.key)) {
      earlyScrollDetected = true
      cleanup()
    }
  }
  
  const handleScroll = () => {
    // Check if page actually scrolled
    if (window.pageYOffset > 0 || document.documentElement.scrollTop > 0) {
      earlyScrollDetected = true
      cleanup()
    }
  }
  
  const cleanup = () => {
    window.removeEventListener('wheel', handleWheel, { passive: true })
    window.removeEventListener('touchstart', handleTouchStart, { passive: true })
    window.removeEventListener('touchmove', handleTouchMove, { passive: true })
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('scroll', handleScroll, { passive: true })
  }
  
  // Listen for any scroll attempts before intro is set up
  window.addEventListener('wheel', handleWheel, { passive: true })
  window.addEventListener('touchstart', handleTouchStart, { passive: true })
  window.addEventListener('touchmove', handleTouchMove, { passive: true })
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('scroll', handleScroll, { passive: true })
}

/**
 * Page Load Curtain
 * CSS-only animation - no JS needed for curtain itself
 * Only handles homepage skip and reduced motion check
 * Animation is handled entirely by CSS for better performance
 */
export function initCurtain(prefersReducedMotion = false) {
  // Check URL pathname instead of body class (body class is unreliable on Netlify)
  const pathname = window.location.pathname
  const isHomepage = pathname === '/' || pathname === '/index.html' || pathname.endsWith('/index.html')
  
  // Skip on homepage (has its own intro) or if reduced motion
  if (isHomepage || prefersReducedMotion) {
    const curtain = document.querySelector('.curtain')
    if (curtain) {
      curtain.classList.add('is-complete')
    }
    return
  }
  
  // CSS handles the animation - no JS needed
  // Curtain will automatically hide after animation completes via CSS
}

/**
 * Intro Animation
 * Video reveal sequence that plays on load, then fades out to reveal existing hero
 * 
 * Sequence:
 * 1. Nav fades in (500ms)
 * 2. Center video shrinks (600ms)
 * 3. Pause with center video (600ms)
 * 4. Side videos slide out (1800ms, staggered)
 * 5. Name character reveal - "TYLER CHOU" (1300ms, heavy deceleration)
 * 6. Name lingers on screen (~800ms)
 * 7. Videos pop out sequentially right→left (instant, 200ms apart)
 * 8. Name stays alone (~500ms)
 * 9. Characters slide out in reverse order (600ms)
 * 10. Hero fades in (800ms)
 * Total duration: ~7 seconds
 */
export async function initIntro(prefersReducedMotion = false, viewportWidth = window.innerWidth) {
  // Track page load time to block early scroll interrupts
  const pageLoadTime = Date.now()
  const scrollBlockDuration = 2000 // Block scroll interrupts for 2 seconds after page load
  
  const intro = document.querySelector('.intro')
  const centerVideo = document.querySelector('.intro__video--center') // wrapper
  const leftVideo = document.querySelector('.intro__video--left') // wrapper
  const rightVideo = document.querySelector('.intro__video--right') // wrapper
  const heroContent = document.querySelector('.hero-content')
  const nameElement = document.querySelector('.intro__name[js-char-animation]')

  // Skip if no intro element, reduced motion, or early scroll detected
  if (!intro || prefersReducedMotion || earlyScrollDetected) {
    intro?.classList.add('is-complete')
    document.body.classList.remove('intro-active')
    document.body.classList.remove('curtain-active')
    
    // If early scroll detected, show hero content immediately
    if (earlyScrollDetected && heroContent) {
      gsap.set(heroContent, { opacity: 1 })
      
      // Trigger hero headline line animation immediately
      const heroHeadline = heroContent.querySelector('[js-line-animation]')
      if (heroHeadline) {
        // Small delay to ensure DOM is ready
        gsap.delayedCall(0.1, () => {
          if (!heroHeadline.querySelector('.line-wrapper') && !heroHeadline.querySelector('.line')) {
            initLineAnimations(false)
          }
        })
      }
    }
    
    return
  }

  // Wait for all intro videos to be ready before starting animation
  const introVideos = document.querySelectorAll('.intro__video')
  
  // Wait for video elements to be ready (canplaythrough event)
  const videoReadyPromises = Array.from(introVideos).map(video => {
    return new Promise((resolve) => {
      if (video.tagName === 'VIDEO') {
        if (video.readyState >= 3) { // HAVE_FUTURE_DATA or better
          resolve()
        } else {
          video.addEventListener('canplaythrough', resolve, { once: true })
          // Fallback timeout
          setTimeout(resolve, 3000)
        }
      } else {
        // Not a video element, resolve immediately
        resolve()
      }
    })
  })
  
  try {
    await Promise.all(videoReadyPromises)
    // Videos are ready - show center video immediately
    // Show intro container and center video wrapper
    intro.classList.remove('intro--hidden')
    intro.classList.add('is-ready')
    
    // Show center video wrapper immediately (centerVideo is already the wrapper element)
    if (centerVideo) {
      centerVideo.classList.add('is-ready')
    }
  } catch (error) {
    console.error('Failed to load intro videos:', error)
    // Fallback: continue after 2 second timeout
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  // Prevent scroll restoration and lock scroll
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'
  }
  window.scrollTo(0, 0)
  document.body.classList.add('intro-active')

  // Add body class to control nav visibility via CSS (same as curtain)
  document.body.classList.add('curtain-active')

  // Set initial states
  gsap.set(heroContent, { opacity: 0 })
  gsap.set([leftVideo, centerVideo, rightVideo], {
    transformOrigin: 'center center'
  })
  // Center video starts visible now (opacity: 1 by default, no need to set to 0)
  gsap.set(leftVideo, { 
    x: 0,
    xPercent: -50,
    yPercent: -50,
    height: '80vh',
    opacity: 0,
    clipPath: 'inset(0 100% 0 0)'
  })
  gsap.set(rightVideo, { 
    x: 0,
    xPercent: -50,
    yPercent: -50,
    height: '80vh',
    opacity: 0,
    clipPath: 'inset(0 0 0 100%)'
  })
  
  // Split name into characters and set initial states
  let charElements = []
  if (nameElement) {
    charElements = splitTextIntoChars(nameElement)
    gsap.set(nameElement, { opacity: 0 })
    gsap.set(charElements, {
      x: '-100%',
      opacity: 0
    })
  }

  // Add scroll interrupt handler
  let scrollInterrupted = false
  let touchStartY = 0
  let touchMoveY = 0
  let tl = null // Declare timeline variable early so it's accessible in interrupt handler
  let fallbackTimeout = null // Declare fallback timeout early so it's accessible in interrupt handler
  
  const handleScrollInterrupt = () => {
    if (scrollInterrupted) return
    
    // Block interrupts for a few seconds after page load to let intro initialize
    const timeSinceLoad = Date.now() - pageLoadTime
    if (timeSinceLoad < scrollBlockDuration) {
      return // Block the interrupt
    }
    
    scrollInterrupted = true
    
    // Clear fallback timeout since interrupt is handling it
    if (fallbackTimeout) {
      clearTimeout(fallbackTimeout)
      fallbackTimeout = null
    }
    
    // Kill the timeline if it exists (may not exist if interrupted before creation)
    if (tl) {
      tl.kill()
    }
    
    // Get references fresh in case they weren't set up yet
    const introElement = document.querySelector('.intro')
    const heroContentElement = document.querySelector('.hero-content')
    
    // If intro doesn't exist yet, just skip to hero content
    if (!introElement) {
      // Mark intro as complete immediately
      document.body.classList.remove('intro-active')
      document.body.classList.remove('curtain-active')
      cleanupListeners()
      
      // Ensure hero content is visible
      if (heroContentElement) {
        gsap.set(heroContentElement, { opacity: 1 })
      }
      
      // Trigger hero headline line animation
      const heroHeadline = heroContentElement?.querySelector('[js-line-animation]')
      if (heroHeadline) {
        // Check if already processed
        if (!heroHeadline.querySelector('.line-wrapper') && !heroHeadline.querySelector('.line')) {
          initLineAnimations(false)
        }
      }
      return
    }
    
    // Mark intro as complete immediately (even if fade hasn't started)
    introElement.classList.add('is-complete')
    
    // Create a fade-out timeline (works for both mobile and desktop)
    const fadeOutTl = gsap.timeline({
      onComplete: () => {
        // Clean up after fade
        document.body.classList.remove('intro-active')
        document.body.classList.remove('curtain-active')
        cleanupListeners()
        
        // Trigger hero headline line animation after interrupt fade completes
        // This ensures the sequence: intro fade → hero text → bg video
        const heroHeadline = heroContentElement?.querySelector('[js-line-animation]')
        if (heroHeadline) {
          // Wait for heroContent to be fully visible before processing
          const checkHeroReady = () => {
            const heroOpacity = parseFloat(window.getComputedStyle(heroContentElement).opacity)
            if (heroOpacity === 1) {
              // Check if already processed
              if (!heroHeadline.querySelector('.line-wrapper') && !heroHeadline.querySelector('.line')) {
                // Re-initialize line animations - it will process the hero headline now
                // The guard in initLineAnimations will prevent re-processing other elements
                initLineAnimations(false)
              }
            } else {
              // Still fading in, keep checking
              requestAnimationFrame(checkHeroReady)
            }
          }
          requestAnimationFrame(checkHeroReady)
        }
      }
    })
    
    // Fade out intro (if it exists and is visible)
    if (introElement) {
      fadeOutTl.to(introElement, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out'
      })
    }
    
    // Fade in hero content simultaneously
    if (heroContentElement) {
      fadeOutTl.to(heroContentElement, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
      }, 0) // Start at same time
    }
  }
  
  const handleWheel = (e) => {
    // Desktop: any wheel movement interrupts
    if (Math.abs(e.deltaY) > 0) {
      e.preventDefault()
      handleScrollInterrupt()
    }
  }
  
  const handleTouchStart = (e) => {
    // Mobile: record initial touch position
    touchStartY = e.touches[0].clientY
  }
  
  const handleTouchMove = (e) => {
    // Mobile: detect actual scroll movement
    touchMoveY = e.touches[0].clientY
    const deltaY = touchMoveY - touchStartY
    
    // If user is trying to scroll (more than 10px movement)
    if (Math.abs(deltaY) > 10) {
      e.preventDefault() // Prevent scroll
      handleScrollInterrupt()
    }
  }
  
  const handleKeyInterrupt = (e) => {
    // Allow space, arrow down, page down to interrupt
    if ([' ', 'ArrowDown', 'PageDown'].includes(e.key)) {
      e.preventDefault()
      handleScrollInterrupt()
    }
  }
  
  const cleanupListeners = () => {
    window.removeEventListener('wheel', handleWheel, { passive: false })
    window.removeEventListener('touchstart', handleTouchStart, { passive: true })
    window.removeEventListener('touchmove', handleTouchMove, { passive: false })
    window.removeEventListener('keydown', handleKeyInterrupt)
  }

  // Store hero headline reference for processing after intro completes
  const heroHeadline = heroContent?.querySelector('[js-line-animation]')
  
  // Fallback timeout: Ensure hero appears even if intro animation fails
  // This will be cleared if timeline completes successfully or is interrupted
  fallbackTimeout = setTimeout(() => {
    const heroContentCheck = document.querySelector('.hero-content')
    const introCheck = document.querySelector('.intro')
    const introIsComplete = introCheck?.classList.contains('is-complete')
    
    // If hero is still hidden and intro hasn't completed, force show it
    if (heroContentCheck) {
      const currentOpacity = parseFloat(window.getComputedStyle(heroContentCheck).opacity)
      
      if ((currentOpacity === 0 || isNaN(currentOpacity)) && !introIsComplete) {
        // Hero is still hidden - force show it
        gsap.set(heroContentCheck, { opacity: 1 })
        
        // Mark intro as complete if it exists
        if (introCheck) {
          introCheck.classList.add('is-complete')
          document.body.classList.remove('intro-active')
          document.body.classList.remove('curtain-active')
        }
        
        // Trigger hero headline line animation if it hasn't been processed
        const heroHeadline = heroContentCheck.querySelector('[js-line-animation]')
        if (heroHeadline) {
          if (!heroHeadline.querySelector('.line-wrapper') && !heroHeadline.querySelector('.line')) {
            initLineAnimations(false)
          }
        }
        
        // Fade in background video if it exists
        const heroBackgroundImage = document.querySelector('.hero .background-image')
        if (heroBackgroundImage) {
          const bgOpacity = parseFloat(window.getComputedStyle(heroBackgroundImage).opacity)
          if (bgOpacity === 0 || isNaN(bgOpacity)) {
            gsap.to(heroBackgroundImage, {
              opacity: 1,
              duration: 1.2,
              ease: 'power2.out'
            })
          }
        }
      }
    }
  }, 8000) // 8 seconds - after intro should complete (~7s) + 1s buffer
  
  // Create timeline
  tl = gsap.timeline({
    onStart: () => {
      // Intro container and center video are already visible
      // Show side video wrappers now that animation is starting
      introVideos.forEach((video) => {
        const wrapper = video.closest('.intro__video-wrapper')
        if (wrapper && !wrapper.classList.contains('intro__video--center')) {
          wrapper.classList.add('is-ready')
        }
      })
    },
    onComplete: () => {
      // Clear fallback timeout since timeline completed successfully
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout)
        fallbackTimeout = null
      }
      
      intro.classList.add('is-complete')
      document.body.classList.remove('intro-active')
      document.body.classList.remove('curtain-active')
      cleanupListeners()
      // CSS handles nav animation - no cleanup needed
      
      // Trigger hero headline line animation after intro completes
      // This ensures the sequence: intro → hero text → bg video
      if (heroHeadline) {
        // Small delay to ensure heroContent opacity transition is complete
        gsap.delayedCall(0.1, () => {
          // Check if already processed
          if (!heroHeadline.querySelector('.line-wrapper') && !heroHeadline.querySelector('.line')) {
            // Re-initialize line animations - it will process the hero headline now
            // The guard in initLineAnimations will prevent re-processing other elements
            initLineAnimations(false)
          }
        })
      }
    }
  })
  
  // Listen for scroll attempts
  window.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('touchstart', handleTouchStart, { passive: true })
  window.addEventListener('touchmove', handleTouchMove, { passive: false })
  window.addEventListener('keydown', handleKeyInterrupt)

  // Step 1: Center video is already visible, no fade-in needed
  // (Center video was made visible immediately after Vimeo players loaded)

  // Step 2: Center video shrinks vertically (700ms–1300ms) - longer pause before scaling
  tl.to(centerVideo, {
    height: '80vh',
    duration: 0.6,
    ease: 'power2.out'
  }, 0.7)

  // Step 3: Side videos slide out (1500ms–3400ms) - staggered for elegance
  const slideDistance = (viewportWidth * 0.33) + 16 // video width + gap
  
  tl.to(leftVideo, {
    x: -slideDistance,
    opacity: 1,
    clipPath: 'inset(0 0% 0 0)',
    duration: 1.8,
    ease: 'power3.out'
  }, 1.5)

  tl.to(rightVideo, {
    x: slideDistance,
    opacity: 1,
    clipPath: 'inset(0 0 0 0%)',
    duration: 1.8,
    ease: 'power3.out'
  }, 1.6)

  // Step 4: Name reveal (2800ms–4600ms) - massive character animation with extended dramatic deceleration
  if (nameElement && charElements.length > 0) {
    // Fade in name container
    tl.to(nameElement, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out'
    }, 2.8)
    
    // Animate characters sliding in with extended heavy deceleration for suspense
    tl.to(charElements, {
      x: '0%',
      opacity: 1,
      duration: 1.7, // Extended from 1.2s to build more suspense
      stagger: 0.05,
      ease: 'power4.out' // Heavier deceleration creates dramatic slow-down
    }, 2.9)
  }

  // Step 5: Sequential pop out - videos disappear right to left, immediate exit
  
  // Videos pop out sequentially (4700ms–5100ms) - instant opacity changes
  tl.to(rightVideo, {
    opacity: 0,
    duration: 0,
    ease: 'none'
  }, 4.7)
  
  tl.to(centerVideo, {
    opacity: 0,
    duration: 0,
    ease: 'none'
  }, 4.9)
  
  tl.to(leftVideo, {
    opacity: 0,
    duration: 0,
    ease: 'none'
  }, 5.1)
  
  // Name stays alone briefly, then characters slide out in reverse (5300ms–5900ms)
  if (nameElement && charElements.length > 0) {
    tl.to(charElements, {
      x: '-100%', // Exit to the left
      opacity: 0,
      duration: 0.6,
      stagger: -0.03, // Negative stagger = reverse order (right to left)
      ease: 'power3.in'
    }, 5.3)
  }
  
  // Intro container fades (cleanup) - starts immediately after name exits
  tl.to(intro, {
    opacity: 0,
    duration: 0.4,
    ease: 'power2.out'
  }, 5.9)
  
  // Hero fades in (5900ms–6700ms)
  tl.to(heroContent, {
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out'
  }, 5.9)
}

