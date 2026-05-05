/**
 * Main JavaScript
 * Initializes global components and functionality
 */

// Global error handler to suppress Netlify service worker errors
// This catches the "Response with null body status cannot have body" error from cnm-sw.js

// Helper function to check if error is from Netlify service worker
function isNetlifySWError(message, stack) {
  if (!message && !stack) return false
  const errorText = (message || '') + (stack || '')
  return errorText.includes('Response with null body status') ||
         errorText.includes('cnm-sw.js') ||
         (errorText.includes('Failed to construct \'Response\'') && errorText.includes('null body status'))
}

// Intercept console.error to filter Netlify SW errors (if not already intercepted)
if (!window.__netlifySWErrorSuppressed) {
  const originalConsoleError = console.error
  console.error = function(...args) {
    const errorText = args.map(arg => 
      typeof arg === 'string' ? arg : 
      (arg?.message || arg?.toString() || '')
    ).join(' ')
    
    if (isNetlifySWError(errorText, args.find(arg => arg?.stack)?.stack)) {
      // Silently suppress Netlify service worker errors
      return
    }
    originalConsoleError.apply(console, args)
  }
  window.__netlifySWErrorSuppressed = true
}

// Catch global errors
window.addEventListener('error', function(event) {
  if (isNetlifySWError(event.message, event.error?.stack)) {
    event.preventDefault()
    event.stopPropagation()
    return false
  }
}, true)

// Catch unhandled promise rejections from service worker
window.addEventListener('unhandledrejection', function(event) {
  const reason = event.reason
  const message = reason?.message || reason?.toString() || ''
  const stack = reason?.stack || ''
  
  if (isNetlifySWError(message, stack)) {
    event.preventDefault()
    return false
  }
})

import { initNavigation } from './nav.js'
import { initForms } from './forms.js'

// Initialize navigation when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigation)
} else {
  initNavigation()
}

// Lazy-load the animation system (GSAP + Lenis + scroll-triggers) off the
// critical path. esbuild code-splitting emits this as a separate chunk, so the
// main bundle stays small and first paint isn't blocked by animation deps.
function loadAnimations() {
  import('./animations/index.js').catch((err) => {
    console.warn('Failed to load animation module:', err)
  })
}

if ('requestIdleCallback' in window) {
  window.requestIdleCallback(loadAnimations, { timeout: 1500 })
} else {
  // Safari < 17 fallback — wait one paint, then load.
  window.setTimeout(loadAnimations, 1)
}

// Set credentials date to today's date
function setCredentialsDate() {
  const dateElement = document.querySelector('.credentials-date')
  if (dateElement) {
    const today = new Date()
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    const formattedDate = today.toLocaleDateString('en-US', options)
    dateElement.textContent = formattedDate
  }
}

// Initialize forms
async function initializeApp() {
  initForms()
  setCredentialsDate()
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  // DOM already ready, but wait a tick for any dynamic content
  setTimeout(initializeApp, 0)
}
