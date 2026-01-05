/**
 * Animation Utilities
 * Shared helper functions for theme management, spacing, and ScrollTrigger factories
 */

import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Get spacing value from CSS variable (converts rem to pixels)
 * @param {string} variableName - CSS variable name (e.g., '--space-lg')
 * @returns {number} Spacing value in pixels
 */
export function getSpacingValue(variableName) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName).trim()
  return Math.ceil(parseFloat(value) * 16) // Convert rem to pixels
}

/**
 * Helper function to manage body theme classes efficiently
 * Removes all theme classes and adds the specified one
 * @param {string} themeClass - Theme class to apply (e.g., 'bg-palo-verde', 'bg-bone', or '' for default)
 */
export function setBodyTheme(themeClass) {
  const allThemes = ['bg-palo-verde', 'bg-bone']
  // Remove all themes in one operation
  document.body.classList.remove(...allThemes)
  // Add new theme if provided
  if (themeClass) {
    document.body.classList.add(themeClass)
    
    // Set nav colors based on theme via inline styles (reliable during pinned scrolls)
    let navColor = ''
    if (themeClass === 'bg-bone') {
      navColor = 'var(--nav-text-on-bone, var(--obsidian))'
    } else if (themeClass === 'bg-palo-verde') {
      navColor = 'var(--nav-text-on-palo-verde-600, var(--palo-verde-50))'
    }
    
    if (navColor) {
      document.body.style.setProperty('--nav-text-color', navColor)
      document.body.style.setProperty('--nav-hamburger-color', navColor)
    }
  } else {
    // Reset to default: check page class and set appropriate default immediately
    // This matches the CSS logic and avoids timing issues with requestAnimationFrame
    let defaultColor = 'var(--nav-text-on-chuparosa-600, var(--chuparosa-100))' // Default for home/contact/creator/blog-post
    
    if (document.body.classList.contains('page-services') || 
        document.body.classList.contains('page-about') || 
        document.body.classList.contains('page-roster')) {
      defaultColor = 'var(--bone)'
    } else if (document.body.classList.contains('page-love-letters')) {
      defaultColor = 'var(--obsidian)'
    }
    
    document.body.style.setProperty('--nav-text-color', defaultColor)
    document.body.style.setProperty('--nav-hamburger-color', defaultColor)
  }
}

/**
 * Initialize nav colors from CSS - promotes CSS values to inline styles so JS can override
 * Called early in initAnimations() to ensure CSS values are available for JavaScript to override
 */
export function initNavColors() {
  const computed = getComputedStyle(document.body)
  const textColor = computed.getPropertyValue('--nav-text-color').trim()
  const hamburgerColor = computed.getPropertyValue('--nav-hamburger-color').trim()
  
  if (textColor) {
    document.body.style.setProperty('--nav-text-color', textColor)
    document.body.style.setProperty('--nav-hamburger-color', hamburgerColor || textColor)
  }
}

/**
 * Helper function to manage nav colors via CSS custom properties
 * Always sets on body for consistency - inline styles override CSS reliably during pinned scrolls
 * @param {string} textColor - CSS variable or color value for nav text (e.g., 'var(--obsidian)' or 'var(--chuparosa-950)')
 * @param {string} hamburgerColor - CSS variable or color value for hamburger icon (optional, defaults to textColor)
 */
export function setNavColor(textColor, hamburgerColor = null) {
  if (textColor) {
    document.body.style.setProperty('--nav-text-color', textColor)
    document.body.style.setProperty('--nav-hamburger-color', hamburgerColor || textColor)
  } else {
    // Reset to default: check page class and set appropriate default immediately
    // This matches setBodyTheme logic and avoids timing issues
    let defaultColor = 'var(--nav-text-on-chuparosa-600, var(--chuparosa-100))' // Default for home/contact/creator/blog-post
    
    if (document.body.classList.contains('page-services') || 
        document.body.classList.contains('page-about') || 
        document.body.classList.contains('page-roster')) {
      defaultColor = 'var(--bone)'
    } else if (document.body.classList.contains('page-love-letters')) {
      defaultColor = 'var(--obsidian)'
    }
    
    document.body.style.setProperty('--nav-text-color', defaultColor)
    document.body.style.setProperty('--nav-hamburger-color', defaultColor)
  }
}

/**
 * Returns ScrollTrigger callbacks for theme switching
 * Reusable helper to avoid repeating theme switching code
 * @param {string} themeClass - Theme class to apply when entering section
 * @returns {Object} ScrollTrigger callback object with onEnter, onLeave, onEnterBack, onLeaveBack
 */
export function getThemeCallbacks(themeClass) {
  return {
    onEnter: () => setBodyTheme(themeClass),
    onLeave: () => setBodyTheme(''),
    onEnterBack: () => setBodyTheme(themeClass),
    onLeaveBack: () => setBodyTheme(''),
  }
}

/**
 * Calculate scroll multiplier based on viewport height
 * Used for responsive pinned section durations
 * @param {number} min - Minimum multiplier
 * @param {number} max - Maximum multiplier
 * @param {number} divisor - Divisor for viewport height calculation
 * @param {number} viewportHeight - Current viewport height
 * @returns {number} Calculated scroll multiplier
 */
export function calculateScrollMultiplier(min, max, divisor, viewportHeight) {
  return Math.max(min, Math.min(max, viewportHeight / divisor))
}

/**
 * Create a reusable pinned ScrollTrigger configuration
 * @param {Object} options - Configuration options
 * @param {Element|string} options.trigger - Trigger element or selector
 * @param {string} options.start - Start position (e.g., 'top top')
 * @param {string} options.end - End position (e.g., '+=200%')
 * @param {number} options.scrub - Scrub value (default: 1)
 * @param {Object} options.callbacks - Additional callbacks (onEnter, onLeave, etc.)
 * @returns {Object} ScrollTrigger configuration object
 */
export function createPinnedScrollConfig({ trigger, start, end, scrub = 1, callbacks = {} }) {
  return {
    trigger,
    start,
    end,
    scrub,
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    ...callbacks,
  }
}

/**
 * Create a simple theme switching ScrollTrigger
 * @param {Element|string} trigger - Trigger element or selector
 * @param {string} start - Start position (default: 'top center')
 * @param {string} end - End position (default: 'bottom top')
 * @param {string} themeClass - Theme class to apply (or '' for default)
 */
export function createThemeScrollTrigger(trigger, start = 'top center', end = 'bottom top', themeClass = '') {
  if (typeof trigger === 'string') {
    trigger = document.querySelector(trigger)
  }
  if (!trigger) return

  ScrollTrigger.create({
    trigger,
    start,
    end,
    ...(themeClass ? getThemeCallbacks(themeClass) : {
      onEnter: () => setBodyTheme(''),
      onEnterBack: () => setBodyTheme(''),
    }),
  })
}

