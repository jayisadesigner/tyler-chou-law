/**
 * Line Animations
 * Text splitting and reveal animations for headlines
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Match BREAKPOINTS.tablet in animations/index.js — skip line splitting below this width
const MOBILE_MAX_WIDTH = 768

/**
 * Animate Line Elements (reusable utility)
 * @param {NodeList|Array} elements - Line elements to animate
 * @param {Object} options - GSAP animation options
 * @returns {gsap.core.Tween} GSAP animation instance
 */
export function animateLineElements(elements, options = {}) {
  const defaults = {
    y: '0%',
    opacity: 1,
    duration: 0.9,
    stagger: 0.1,
    ease: 'power2.out',
    delay: 0
  }
  
  const config = { ...defaults, ...options }
  
  return gsap.to(elements, config)
}

/**
 * Animate Character Elements (reusable utility)
 * Similar to animateLineElements but for character-level animations
 * @param {NodeList|Array} elements - Character elements to animate
 * @param {Object} options - GSAP animation options
 * @returns {gsap.core.Tween} GSAP animation instance
 */
export function animateCharElements(elements, options = {}) {
  const defaults = {
    x: '0%',
    opacity: 1,
    duration: 0.8,
    stagger: 0.03,
    ease: 'power3.out',
    delay: 0
  }
  
  const config = { ...defaults, ...options }
  
  return gsap.to(elements, config)
}

/**
 * Split text into characters and prepare for animation
 * @param {HTMLElement} element - Element containing text to split
 * @returns {NodeList} Character inner elements ready for animation
 */
export function splitTextIntoChars(element) {
  if (!element) return []
  
  const originalText = element.textContent.trim()
  const chars = originalText.split('')
  
  // Clear and rebuild with character structure
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
    charInner.textContent = char === ' ' ? '\u00A0' : char // Non-breaking space
    
    charSpan.appendChild(charInner)
    element.appendChild(charSpan)
  })
  
  return element.querySelectorAll('.char-inner')
}

/**
 * Initialize line animations for all elements with [js-line-animation] attribute
 * @param {boolean} reducedMotion - If true, skip animation and show final state
 * @param {number} viewportHeight - Current viewport height (for batching)
 */
export function initLineAnimations(reducedMotion = false, viewportHeight = window.innerHeight) {
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

  // Mobile: keep native headline markup so text wraps normally (no .line-inner / nowrap)
  if (window.innerWidth < MOBILE_MAX_WIDTH) {
    animatedElements.forEach((element) => {
      element.classList.add('line-animation--static')
      gsap.set(element, { opacity: 1, y: 0, clearProps: 'transform' })
    })

    const heroBackgroundImage = document
      .querySelector('.hero .hero-headline[js-line-animation]')
      ?.closest('.hero')
      ?.querySelector('.background-image')
    if (heroBackgroundImage) {
      gsap.set(heroBackgroundImage, { opacity: 1 })
    }

    return
  }
  
  // Check if intro is active (not yet complete)
  const intro = document.querySelector('.intro')
  const introIsActive = intro && !intro.classList.contains('is-complete')
  
  // Batch DOM reads: collect all getBoundingClientRect() calls upfront
  const elementData = Array.from(animatedElements).map(element => {
    const heroContent = element.closest('.hero-content')
    const isHeroHeadline = heroContent !== null
    const hasLineStructure = element.querySelector('.line-wrapper, .line')
    const rect = element.getBoundingClientRect()
    const isInView = rect.top < viewportHeight * 0.85 && rect.bottom > 0
    let heroOpacity = null
    let shouldWaitForIntro = false
    
    if (isHeroHeadline && heroContent) {
      heroOpacity = parseFloat(window.getComputedStyle(heroContent).opacity)
      shouldWaitForIntro = heroOpacity === 0
    }
    
    return {
      element,
      heroContent,
      isHeroHeadline,
      hasLineStructure,
      rect,
      isInView,
      heroOpacity,
      shouldWaitForIntro
    }
  })
  
  // Initialize hero background image/video to opacity 0 (if it exists AND hero has line animation)
  // Only hide if there's a line animation that will fade it back in
  const heroWithLineAnimation = document.querySelector('.hero .hero-headline[js-line-animation]')
  if (heroWithLineAnimation) {
    const heroBackgroundImage = heroWithLineAnimation.closest('.hero')?.querySelector('.background-image')
  if (heroBackgroundImage) {
    gsap.set(heroBackgroundImage, { opacity: 0 })
    }
  }
  
  // Now do all DOM writes: hide hero headlines that need hiding
  elementData.forEach(({ element, heroContent, hasLineStructure }) => {
    if (heroContent && !hasLineStructure) {
      gsap.set(element, { opacity: 0 })
    }
  })
  
  // Process each element
  elementData.forEach(({ element, heroContent, isHeroHeadline, hasLineStructure, isInView, shouldWaitForIntro }) => {
    // Skip if element has already been processed (has line structure)
    if (hasLineStructure) {
      // Ensure it stays visible if already processed
      if (heroContent) {
        const currentHeroOpacity = parseFloat(window.getComputedStyle(heroContent).opacity)
        // If hero is visible and headline is already processed, ensure headline is visible
        if (currentHeroOpacity === 1) {
          gsap.set(element, { opacity: 1 })
        }
      }
      return
    }
    
    // If intro is active and this is a hero headline, defer processing
    // The intro timeline's onComplete will handle processing hero headlines
    if (introIsActive && isHeroHeadline) {
      // Don't process now - wait for intro timeline onComplete callback
      return
    }
    
    // Process normally
    processElementAnimation(element, isHeroHeadline, isInView, shouldWaitForIntro, viewportHeight)
  })
  
  // Helper function to process a single element's animation
  function processElementAnimation(element, isHeroHeadlineCheck, isInView, shouldWaitForIntro, viewportHeight) {
    // Skip if element has already been processed (has line structure)
    const hasLineStructure = element.querySelector('.line-wrapper, .line')
    if (hasLineStructure) {
      return
    }
    
    // Define isHeroHeadline at function level so it's available throughout
    const heroContent = element.closest('.hero-content')
    const isHeroHeadline = heroContent !== null
    
    // Hide element immediately before processing to prevent flash
    if (isHeroHeadlineCheck) {
      gsap.set(element, { opacity: 0 })
    }
    
    const originalHTML = element.innerHTML.trim()
    const hasBrTags = originalHTML.includes('<br>') || originalHTML.includes('<br/>') || originalHTML.includes('<br />')
    
    // If element has <br> tags, respect them for line breaks
    if (hasBrTags) {
      // Split by <br> tags to get lines
      const lineParts = originalHTML.split(/<br\s*\/?>/i)
      const lines = lineParts.map(part => {
        // Extract text content from each part, handling HTML entities like &nbsp;
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = part
        return tempDiv.textContent || tempDiv.innerText || ''
      }).filter(line => line.trim().length > 0)
      
      // Clear original and create line structure
      element.innerHTML = ''
      element.style.overflow = 'hidden'
      
      // Check if this is a featured image headline (needs natural text flow)
      const isFeaturedImage = element.classList.contains('section--featured-image__headline')
      
      lines.forEach((lineText) => {
        const lineSpan = document.createElement('span')
        lineSpan.className = 'line'
        lineSpan.style.display = 'block'
        // CSS handles overflow and width
        
        const lineInner = document.createElement('span')
        lineInner.className = 'line-inner'
        lineInner.style.display = 'block'
        // CSS handles width and whiteSpace
        // Preserve HTML entities like &nbsp; by using innerHTML
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = lineText
        lineInner.innerHTML = tempDiv.innerHTML || lineText
        
        lineSpan.appendChild(lineInner)
        element.appendChild(lineSpan)
      })
      
      // Get line elements and animate
      const lineElements = element.querySelectorAll('.line-inner')
      
      if (lineElements.length === 0) {
        element.innerHTML = originalHTML
        element.style.overflow = ''
        return
      }
      
      // Set initial state
      gsap.set(lineElements, {
        y: '100%',
        opacity: 0
      })
      
      // Check if this is a hero headline for video fade-in (use the function-level variable)
      const backgroundImage = isHeroHeadline ? element.closest('.hero')?.querySelector('.background-image') : null
      
      if (isInView && !shouldWaitForIntro) {
        // Restore element opacity right before starting animation
        if (isHeroHeadlineCheck) {
          gsap.set(element, { opacity: 1 })
        }
        
        // Animate immediately if already in view and hero is visible
        const textAnim = animateLineElements(lineElements)
        
        // Fade in video after text animation completes (for hero headline)
        if (isHeroHeadline && backgroundImage) {
          // Ensure GSAP has control over opacity
          gsap.set(backgroundImage, { opacity: 0 })
          
          // Use callback to fade in video when text animation completes
          const fadeInVideo = () => {
            gsap.to(backgroundImage, {
              opacity: 1,
              duration: 1.2,
              ease: 'power2.out',
              delay: 0.3
            })
          }
          
          textAnim.eventCallback('onComplete', fadeInVideo)
          
          // Backup: delayed call based on calculated duration
          const lineCount = lineElements.length
          const textDuration = 0.9 + (0.1 * (lineCount - 1))
          gsap.delayedCall(textDuration + 0.3, () => {
            const inlineOpacity = backgroundImage.style.opacity
            const computedOpacity = parseFloat(window.getComputedStyle(backgroundImage).opacity)
            const currentOpacity = inlineOpacity ? parseFloat(inlineOpacity) : computedOpacity
            
            if (currentOpacity === 0 || isNaN(currentOpacity) || !currentOpacity) {
              gsap.to(backgroundImage, {
                opacity: 1,
                duration: 1.2,
                ease: 'power2.out'
              })
            }
          })
        }
      } else if (isInView && shouldWaitForIntro) {
        // Hero headline is in view but hidden - wait for hero opacity to reach exactly 1
        const checkHeroVisible = () => {
          const currentOpacity = parseFloat(window.getComputedStyle(heroContent).opacity)
          if (currentOpacity === 1) {
            // Restore element opacity right before starting animation
            if (isHeroHeadlineCheck) {
              gsap.set(element, { opacity: 1 })
            }
            
            // Hero is fully visible, trigger animation
            const textAnim = animateLineElements(lineElements)
            
            // Fade in video after text animation completes (for hero headline)
            if (isHeroHeadline && backgroundImage) {
              // Ensure GSAP has control over opacity
              gsap.set(backgroundImage, { opacity: 0 })
              
              // Use callback to fade in video when text animation completes
              const fadeInVideo = () => {
                gsap.to(backgroundImage, {
                  opacity: 1,
                  duration: 1.2,
                  ease: 'power2.out',
                  delay: 0.3
                })
              }
              
              textAnim.eventCallback('onComplete', fadeInVideo)
              
              // Backup: delayed call
              const lineCount = lineElements.length
              const textDuration = 0.9 + (0.1 * (lineCount - 1))
              gsap.delayedCall(textDuration + 0.3, () => {
                const inlineOpacity = backgroundImage.style.opacity
                const computedOpacity = parseFloat(window.getComputedStyle(backgroundImage).opacity)
                const currentOpacity = inlineOpacity ? parseFloat(inlineOpacity) : computedOpacity
                
                if (currentOpacity === 0 || isNaN(currentOpacity) || !currentOpacity) {
                  gsap.to(backgroundImage, {
                    opacity: 1,
                    duration: 1.2,
                    ease: 'power2.out'
                  })
                }
              })
            }
          } else if (currentOpacity > 0) {
            // Still fading in, keep checking
            requestAnimationFrame(checkHeroVisible)
          } else {
            // Still at 0, keep checking
            requestAnimationFrame(checkHeroVisible)
          }
        }
        checkHeroVisible()
      } else {
        // Use ScrollTrigger for elements not yet in view
        let anim;
        
        if (isHeroHeadline && backgroundImage) {
          // Restore element opacity right before starting animation
          if (isHeroHeadlineCheck) {
            gsap.set(element, { opacity: 1 })
          }
          
          // Ensure GSAP has control over opacity
          gsap.set(backgroundImage, { opacity: 0 })
          
          anim = animateLineElements(lineElements, {
            scrollTrigger: {
              trigger: element,
              start: 'top 85%',
              toggleActions: 'play none none none',
              onEnter: () => {
                if (anim) {
                  anim.restart()
                }
              },
              onEnterBack: () => {
                if (anim) {
                  anim.restart()
                }
              },
              onComplete: () => {
                gsap.to(backgroundImage, {
                  opacity: 1,
                  duration: 1.2,
                  ease: 'power2.out',
                  delay: 0.3
                })
              }
            }
          })
          
          // Also set callback on animation as backup
          const fadeInVideo = () => {
            gsap.to(backgroundImage, {
              opacity: 1,
              duration: 1.2,
              ease: 'power2.out',
              delay: 0.3
            })
          }
          anim.eventCallback('onComplete', fadeInVideo)
          
          // Backup: delayed call
          const lineCount = lineElements.length
          const textDuration = 0.9 + (0.1 * (lineCount - 1))
          gsap.delayedCall(textDuration + 0.3, () => {
            const inlineOpacity = backgroundImage.style.opacity
            const computedOpacity = parseFloat(window.getComputedStyle(backgroundImage).opacity)
            const currentOpacity = inlineOpacity ? parseFloat(inlineOpacity) : computedOpacity
            
            if (currentOpacity === 0 || isNaN(currentOpacity) || !currentOpacity) {
              gsap.to(backgroundImage, {
                opacity: 1,
                duration: 1.2,
                ease: 'power2.out'
              })
            }
          })
        } else {
          anim = animateLineElements(lineElements, {
            scrollTrigger: {
              trigger: element,
              start: 'top 85%',
              toggleActions: 'play none none none',
              onEnter: () => {
                if (anim) {
                  anim.restart()
                }
              },
              onEnterBack: () => {
                if (anim) {
                  anim.restart()
                }
              }
            }
          })
        }
        
        // Fallback: if ScrollTrigger doesn't fire, animate after a delay
        if (anim) {
          setTimeout(() => {
            if (anim && anim.progress() === 0) {
              const currentRect = element.getBoundingClientRect()
              if (currentRect.top < viewportHeight && currentRect.bottom > 0) {
                anim.restart()
              }
            }
          }, 1000)
        }
      }
      
      return // Skip the rest of the function for <br> tag handling
    }
    
    // Original logic for elements without <br> tags
    const originalText = element.textContent.trim()
    const words = originalText.split(' ').filter(w => w.length > 0)
    
    if (words.length === 0) {
      return
    }
    
    // Batch DOM reads: get all measurements upfront
    const elementWidth = element.getBoundingClientRect().width || element.offsetWidth || (element.parentElement ? (element.parentElement.getBoundingClientRect().width || element.parentElement.offsetWidth) : window.innerWidth)
    
    // Ensure we have a valid width
    if (elementWidth <= 0) {
      return
    }
    
    const computedStyle = window.getComputedStyle(element)
    
    // Create clone to measure line breaks
    const clone = element.cloneNode(true)
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
    
    // Batch DOM reads: get all word span positions
    const wordRects = Array.from(wordSpans).map(span => span.getBoundingClientRect())
    
    // Group words into lines based on vertical position
    const lines = []
    let currentLine = []
    let currentLineTop = null
    
    wordRects.forEach((rect, index) => {
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
      
      if (index === wordRects.length - 1 && currentLine.length > 0) {
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
    
    // Check if this is a featured image headline (needs natural text flow)
    const isFeaturedImage = element.classList.contains('section--featured-image__headline')
    
    // Clear original and create line structure (DOM write)
    element.innerHTML = ''
    element.style.overflow = 'hidden'
    
    lines.forEach((lineWords) => {
      const lineSpan = document.createElement('span')
      lineSpan.className = 'line'
      lineSpan.style.display = 'block'
      // CSS handles overflow and width
      
      const lineInner = document.createElement('span')
      lineInner.className = 'line-inner'
      lineInner.style.display = 'block'
      // CSS handles width and whiteSpace
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
    
    // Helper function to create text animation with video fade-in callback
    const createHeroAnimationTimeline = () => {
      // Restore element opacity right before starting animation
      if (isHeroHeadlineCheck) {
        gsap.set(element, { opacity: 1 })
      }
      
      if (!isHeroHeadline) {
        // Not hero headline, just animate text normally
        return animateLineElements(lineElements)
      }
      
      const backgroundImage = element.closest('.hero')?.querySelector('.background-image')
      
      if (!backgroundImage) {
        // No background image, just animate text
        return animateLineElements(lineElements)
      }
      
      // Ensure GSAP has control over opacity
      gsap.set(backgroundImage, { opacity: 0 })
      
      // Create text animation
      const textAnim = animateLineElements(lineElements)
      
      // Use callback to fade in video when text animation completes
      // Store backgroundImage in closure to ensure it's accessible
      const fadeInVideo = () => {
        gsap.to(backgroundImage, {
          opacity: 1,
          duration: 1.2,
          ease: 'power2.out',
          delay: 0.3
        })
      }
      
      textAnim.eventCallback('onComplete', fadeInVideo)
      
      // Also add as backup using the animation's duration
      const lineCount = lineElements.length
      const textDuration = 0.9 + (0.1 * (lineCount - 1))
      gsap.delayedCall(textDuration + 0.3, () => {
        // Check if still at 0 (callback might not have fired)
        // Check inline style first (GSAP sets this), then computed style
        const inlineOpacity = backgroundImage.style.opacity
        const computedOpacity = parseFloat(window.getComputedStyle(backgroundImage).opacity)
        const currentOpacity = inlineOpacity ? parseFloat(inlineOpacity) : computedOpacity
        
        if (currentOpacity === 0 || isNaN(currentOpacity) || !currentOpacity) {
          gsap.to(backgroundImage, {
            opacity: 1,
            duration: 1.2,
            ease: 'power2.out'
          })
        }
      })
      
      return textAnim
    }
    
    if (isInView && !shouldWaitForIntro) {
      // Animate immediately if already in view and hero is visible
      createHeroAnimationTimeline()
    } else if (isInView && shouldWaitForIntro) {
      // Hero headline is in view but hidden - wait for hero opacity to reach exactly 1
      const checkHeroVisible = () => {
        const currentOpacity = parseFloat(window.getComputedStyle(heroContent).opacity)
        if (currentOpacity === 1) {
          // Hero is fully visible, trigger animation
          createHeroAnimationTimeline()
        } else if (currentOpacity > 0) {
          // Still fading in, keep checking
          requestAnimationFrame(checkHeroVisible)
        } else {
          // Still at 0, keep checking
          requestAnimationFrame(checkHeroVisible)
        }
      }
      checkHeroVisible()
    } else {
      // Use ScrollTrigger for elements not yet in view
      // Declare anim at function scope so fallback can access it
      let anim;
      
      if (isHeroHeadline) {
        const backgroundImage = element.closest('.hero')?.querySelector('.background-image')
        if (backgroundImage) {
          // Restore element opacity right before starting animation
          if (isHeroHeadlineCheck) {
            gsap.set(element, { opacity: 1 })
          }
          
          // Ensure GSAP has control over opacity
          gsap.set(backgroundImage, { opacity: 0 })
          
          // Create text animation with ScrollTrigger
          anim = animateLineElements(lineElements, {
            scrollTrigger: {
              trigger: element,
              start: 'top 85%',
              toggleActions: 'play none none none',
              onEnter: () => {
                if (anim) {
                  anim.restart()
                }
              },
              onEnterBack: () => {
                if (anim) {
                  anim.restart()
                }
              },
              onComplete: () => {
                // Fade in video when scroll trigger completes
                gsap.to(backgroundImage, {
                  opacity: 1,
                  duration: 1.2,
                  ease: 'power2.out',
                  delay: 0.3
                })
              }
            }
          })
          
          // Also set callback on animation as backup
          const fadeInVideo = () => {
            gsap.to(backgroundImage, {
              opacity: 1,
              duration: 1.2,
              ease: 'power2.out',
              delay: 0.3
            })
          }
          anim.eventCallback('onComplete', fadeInVideo)
          
          // Backup: delayed call based on calculated duration
          const lineCount = lineElements.length
          const textDuration = 0.9 + (0.1 * (lineCount - 1))
          gsap.delayedCall(textDuration + 0.3, () => {
            const currentOpacity = parseFloat(window.getComputedStyle(backgroundImage).opacity)
            if (currentOpacity === 0 || isNaN(currentOpacity)) {
              gsap.to(backgroundImage, {
                opacity: 1,
                duration: 1.2,
                ease: 'power2.out'
              })
            }
          })
        } else {
          // No background image, use regular animation
          anim = animateLineElements(lineElements, {
            scrollTrigger: {
              trigger: element,
              start: 'top 85%',
              toggleActions: 'play none none none',
              invalidateOnRefresh: true, // Recalculate positions when ScrollTrigger refreshes (important after pinned sections)
              refreshPriority: -1, // Refresh after pinned sections (lower priority = refreshes later)
              onEnter: () => {
                if (anim) {
                  anim.restart()
                }
              },
              onEnterBack: () => {
                if (anim) {
                  anim.restart()
                }
              }
            }
          })
        }
      } else {
        // Not hero headline, use regular animation
        anim = animateLineElements(lineElements, {
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none none',
            invalidateOnRefresh: true, // Recalculate positions when ScrollTrigger refreshes (important after pinned sections)
            refreshPriority: -1, // Refresh after pinned sections (lower priority = refreshes later)
            onEnter: () => {
              if (anim) {
                anim.restart()
              }
            },
            onEnterBack: () => {
              if (anim) {
                anim.restart()
              }
            }
          }
        })
      }
      
      // Fallback: if ScrollTrigger doesn't fire, animate after a delay
      if (anim) {
        setTimeout(() => {
          if (anim && anim.progress() === 0) {
            // Animation hasn't started, check if element is now in view
            const currentRect = element.getBoundingClientRect()
            if (currentRect.top < viewportHeight && currentRect.bottom > 0) {
              anim.restart()
            }
          }
        }, 1000)
      }
    }
  }
}

