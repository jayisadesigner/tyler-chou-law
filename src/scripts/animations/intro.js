/**
 * Intro Animation
 * Homepage intro sequence and curtain
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { forceReveal } from './reveal.js'

/**
 * Split text content of an element into per-character spans for the intro
 * name/subtitle reveal. Only used by the intro animation — every other
 * heading uses the build-time `line_animate` Liquid filter instead.
 */
function splitTextIntoChars(element) {
  if (!element) return []
  const originalText = element.textContent.trim()
  const chars = originalText.split('')
  element.innerHTML = ''
  element.style.overflow = 'hidden'
  chars.forEach((char) => {
    const charSpan = document.createElement('span')
    charSpan.className = 'char'
    charSpan.style.display = 'inline-block'
    charSpan.style.overflow = 'hidden'
    const charInner = document.createElement('span')
    charInner.className = 'char-inner'
    charInner.style.display = 'inline-block'
    charInner.textContent = char === ' ' ? '\u00A0' : char
    charSpan.appendChild(charInner)
    element.appendChild(charSpan)
  })
  return element.querySelectorAll('.char-inner')
}
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
 *
 * The curtain itself is animated entirely by CSS (curtain.css). This function
 * only:
 *   1. Skips the curtain on the homepage (the intro splash takes its place)
 *      and when the user prefers reduced motion.
 *   2. Replays the CSS animation on bfcache (back/forward cache) restore —
 *      browsers restore the DOM in the post-animation state (display:none),
 *      so without this the user navigating back from a page would land on a
 *      blank/flashy state.
 */
export function initCurtain(prefersReducedMotion = false) {
  const pathname = window.location.pathname
  const isHomepage = pathname === '/' || pathname === '/index.html' || pathname.endsWith('/index.html')
  const curtain = document.querySelector('.curtain')

  if (isHomepage || prefersReducedMotion) {
    if (curtain) curtain.classList.add('is-complete')
    return
  }

  if (!curtain) return

  // bfcache restore: persisted=true means the page came from the back/forward
  // cache. Strip is-complete and force a reflow so the CSS animations replay.
  const replay = (event) => {
    if (!event.persisted) return
    curtain.classList.remove('is-complete')
    // Force a reflow so the browser re-evaluates the animations from t=0.
    // Reading offsetWidth is the standard idiomatic reflow trigger.
    // eslint-disable-next-line no-unused-expressions
    curtain.offsetWidth
    // Re-apply the animations by toggling a class. Easier than clone-replacing
    // the element and preserves any DOM listeners.
    curtain.style.animation = 'none'
    curtain.querySelectorAll('.curtain__panel').forEach((panel) => {
      panel.style.animation = 'none'
    })
    // Force another reflow before clearing so the browser registers the reset.
    // eslint-disable-next-line no-unused-expressions
    curtain.offsetWidth
    curtain.style.animation = ''
    curtain.querySelectorAll('.curtain__panel').forEach((panel) => {
      panel.style.animation = ''
    })
  }
  window.addEventListener('pageshow', replay)
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
  // The animation targets the WRAPPERS (.intro__video-wrapper--*), not the
  // inner <video> elements. The wrappers are absolutely positioned and
  // stacked at the center of .intro__videos; the timeline slides the side
  // wrappers out to their column positions via xPercent/yPercent + x.
  const centerWrapper = document.querySelector('.intro__video-wrapper--center')
  const leftWrapper = document.querySelector('.intro__video-wrapper--left')
  const rightWrapper = document.querySelector('.intro__video-wrapper--right')
  const heroContent = document.querySelector('.hero-content')
  const nameElement = document.querySelector('.intro__name[js-char-animation]')
  const subtitleElement = document.querySelector('.intro__subtitle[js-char-animation]')

  // Skip if no intro element, reduced motion, or early scroll detected
  if (!intro || prefersReducedMotion || earlyScrollDetected) {
    intro?.classList.add('is-complete')
    document.body.classList.remove('intro-active')
    document.body.classList.remove('curtain-active')
    
    // If early scroll detected, show hero content immediately
    if (earlyScrollDetected && heroContent) {
      gsap.set(heroContent, { opacity: 1 })
      forceReveal(heroContent.querySelector('.line-animate'))
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
    // Videos are ready - show center wrapper immediately so the splash isn't
    // a blank red screen during the first ~700ms before the timeline starts.
    intro.classList.remove('intro--hidden')
    intro.classList.add('is-ready')

    if (centerWrapper) {
      centerWrapper.classList.add('is-ready')
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

  // Set initial states.
  //
  // All three wrappers are anchored at top:50%/left:50% via CSS, so we use
  // GSAP's xPercent/yPercent to take over the centering transform. From here
  // the timeline can animate `x` in pixels (slideDistance) without composing
  // with a CSS translate(-50%, -50%) — that was the original bug where the
  // side wrappers ended up doubly-translated and off-screen.
  gsap.set(heroContent, { opacity: 0 })
  gsap.set([leftWrapper, centerWrapper, rightWrapper], {
    xPercent: -50,
    yPercent: -50,
    transformOrigin: 'center center'
  })

  // Center wrapper: full-height to start, will shrink to 80vh in the timeline.
  gsap.set(centerWrapper, { x: 0, height: '100vh', opacity: 1 })

  // Side wrappers: stacked behind center, hidden via clip + opacity, ready
  // to slide horizontally to their column positions.
  gsap.set(leftWrapper, {
    x: 0,
    height: '80vh',
    opacity: 0,
    clipPath: 'inset(0 100% 0 0)'
  })
  gsap.set(rightWrapper, {
    x: 0,
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

  // Split subtitle into characters and set initial states
  let subtitleCharElements = []
  if (subtitleElement) {
    subtitleCharElements = splitTextIntoChars(subtitleElement)
    gsap.set(subtitleElement, { opacity: 0 })
    gsap.set(subtitleCharElements, {
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
  let stuckCheckIntervalId = null

  /**
   * Detect intro stuck after background-tab throttling (timers + rAF stall).
   * Past ~8s wall time the hero should be visible; if not, force completion.
   */
  function runIntroStuckCheck() {
    const introEl = document.querySelector('.intro')
    if (!introEl || introEl.classList.contains('is-complete')) {
      if (stuckCheckIntervalId !== null) {
        clearInterval(stuckCheckIntervalId)
        stuckCheckIntervalId = null
      }
      return
    }
    const heroEl = document.querySelector('.hero-content')
    if (!heroEl) return
    const op = parseFloat(window.getComputedStyle(heroEl).opacity)
    const elapsed = Date.now() - pageLoadTime
    if (elapsed > 8000 && op < 0.95) {
      forceCompleteIntroFromStuckState()
    }
  }

  function removeIntroFailsafeListeners() {
    document.removeEventListener('visibilitychange', onIntroVisibilityOrFocus)
    window.removeEventListener('focus', onIntroVisibilityOrFocus)
    if (stuckCheckIntervalId !== null) {
      clearInterval(stuckCheckIntervalId)
      stuckCheckIntervalId = null
    }
  }

  function onIntroVisibilityOrFocus() {
    if (document.visibilityState === 'hidden') return
    tl?.resume()
    gsap.globalTimeline.resume()
    requestAnimationFrame(() => {
      requestAnimationFrame(runIntroStuckCheck)
    })
  }

  function forceCompleteIntroFromStuckState() {
    const introEl = document.querySelector('.intro')
    if (!introEl || introEl.classList.contains('is-complete')) return
    if (scrollInterrupted) return
    scrollInterrupted = true
    if (fallbackTimeout) {
      clearTimeout(fallbackTimeout)
      fallbackTimeout = null
    }
    if (tl) {
      tl.kill()
    }

    const heroEl = document.querySelector('.hero-content')
    introEl.classList.add('is-complete')
    document.body.classList.remove('intro-active')
    document.body.classList.remove('curtain-active')
    if (heroEl) {
      gsap.set(heroEl, { opacity: 1 })
    }
    forceReveal(heroEl?.querySelector('.line-animate'))
    cleanupListeners()
  }

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
      
      // Reveal the hero headline now that we're skipping straight to it
      forceReveal(heroContentElement?.querySelector('.line-animate'))
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
        
        // Reveal the hero headline once the hero-content fade-in completes.
        const heroHeadline = heroContentElement?.querySelector('.line-animate')
        if (heroHeadline) {
          const checkHeroReady = () => {
            const heroOpacity = parseFloat(window.getComputedStyle(heroContentElement).opacity)
            if (heroOpacity === 1) {
              forceReveal(heroHeadline)
            } else {
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
    removeIntroFailsafeListeners()
    window.removeEventListener('wheel', handleWheel, { passive: false })
    window.removeEventListener('touchstart', handleTouchStart, { passive: true })
    window.removeEventListener('touchmove', handleTouchMove, { passive: false })
    window.removeEventListener('keydown', handleKeyInterrupt)
  }

  // Store hero headline reference for the post-intro reveal
  const heroHeadline = heroContent?.querySelector('.line-animate')
  
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
        
        // Reveal the hero headline (CSS state machine).
        // Hero bg-video fade-in is now CSS-driven — removing `intro-active`
        // from <body> above triggers the .hero .background-image transition.
        forceReveal(heroContentCheck.querySelector('.line-animate'))
      }
    }
  }, 8000) // 8 seconds - after intro should complete (~7s) + 1s buffer
  
  // Create timeline
  tl = gsap.timeline({
    onStart: () => {
      // Center wrapper was already marked is-ready when videos finished
      // loading. Reveal the side wrappers now so the slide-out animation
      // is visible. (Center is unconditionally re-marked is-ready as a
      // belt-and-suspenders guard against initial render races.)
      ;[leftWrapper, centerWrapper, rightWrapper].forEach((wrapper) => {
        if (wrapper) wrapper.classList.add('is-ready')
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
      
      // Reveal hero headline after intro completes (sequence: intro → hero text → bg video)
      if (heroHeadline) {
        gsap.delayedCall(0.1, () => forceReveal(heroHeadline))
      }
    }
  })
  
  // Listen for scroll attempts
  window.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('touchstart', handleTouchStart, { passive: true })
  window.addEventListener('touchmove', handleTouchMove, { passive: false })
  window.addEventListener('keydown', handleKeyInterrupt)

  document.addEventListener('visibilitychange', onIntroVisibilityOrFocus)
  window.addEventListener('focus', onIntroVisibilityOrFocus)

  stuckCheckIntervalId = window.setInterval(runIntroStuckCheck, 2000)

  // Step 1: Center wrapper is already visible, no fade-in needed.

  // Step 2: Center wrapper shrinks vertically (700ms–1300ms) — longer pause before scaling.
  tl.to(centerWrapper, {
    height: '80vh',
    duration: 0.6,
    ease: 'power2.out'
  }, 0.7)

  // Step 3: Side wrappers slide out (1500ms–3400ms) — staggered for elegance.
  const slideDistance = (viewportWidth * 0.33) + 16 // wrapper width + gap

  tl.to(leftWrapper, {
    x: -slideDistance,
    opacity: 1,
    clipPath: 'inset(0 0% 0 0)',
    duration: 1.8,
    ease: 'power3.out'
  }, 1.5)

  tl.to(rightWrapper, {
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

  // Step 4.5: Subtitle reveal (3500ms–4200ms) - appears shortly after name starts animating
  if (subtitleElement && subtitleCharElements.length > 0) {
    // Fade in subtitle container
    tl.to(subtitleElement, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out'
    }, 3.5)
    
    // Animate subtitle characters sliding in
    tl.to(subtitleCharElements, {
      x: '0%',
      opacity: 1,
      duration: 0.7,
      stagger: 0.03,
      ease: 'power3.out'
    }, 3.6)
  }

  // Step 5: Sequential pop out — wrappers disappear right to left, instant.
  tl.to(rightWrapper, {
    opacity: 0,
    duration: 0,
    ease: 'none'
  }, 4.7)

  tl.to(centerWrapper, {
    opacity: 0,
    duration: 0,
    ease: 'none'
  }, 4.9)

  tl.to(leftWrapper, {
    opacity: 0,
    duration: 0,
    ease: 'none'
  }, 5.1)
  
  // Name and subtitle stay briefly, then slide out in reverse (5300ms–5900ms)
  if (nameElement && charElements.length > 0) {
    tl.to(charElements, {
      x: '-100%', // Exit to the left
      opacity: 0,
      duration: 0.6,
      stagger: -0.03, // Negative stagger = reverse order (right to left)
      ease: 'power3.in'
    }, 5.3)
  }

  // Subtitle exits with name
  if (subtitleElement && subtitleCharElements.length > 0) {
    tl.to(subtitleCharElements, {
      x: '-100%', // Exit to the left
      opacity: 0,
      duration: 0.6,
      stagger: -0.02, // Negative stagger = reverse order (right to left)
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

