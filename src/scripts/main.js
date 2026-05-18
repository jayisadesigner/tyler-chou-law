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

// Import CSS so Vite processes it during build
import '../styles/main.css'

import { initNavigation } from './nav.js'
import { initForms } from './forms.js'
import './animations/index.js'

// Initialize navigation when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigation)
} else {
  initNavigation()
}

// Load header and footer components (dev mode only)
// In production, these are injected at build time, so we only load if they're empty
// Use XMLHttpRequest instead of fetch to bypass Netlify service worker issues
function loadComponent(selector, path) {
  const element = document.querySelector(selector)
  // Only load if element is empty (dev mode) - in production, content is already in HTML
  if (!element || element.innerHTML.trim()) {
    return
  }
  
  const xhr = new XMLHttpRequest()
  xhr.open('GET', path, true)
  
  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 400) {
      element.innerHTML = xhr.responseText
      // Re-initialize navigation after header is loaded (dev mode only)
      // In production, navigation is already initialized at startup (line 17)
      if (selector === 'header') {
        initNavigation()
      }
      if (selector === 'footer') {
        setFooterYear()
      }
    }
  }
  
  xhr.onerror = function() {
    // Silently fail - component loading is non-critical
    // In production, components are already in HTML
    console.warn(`Could not load component from ${path}`)
  }
  
  xhr.send()
}

// Load global components (only if empty - dev mode convenience)
loadComponent('header', '/components/header.html')
loadComponent('footer', '/components/footer.html')

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

function setFooterYear() {
  const year = String(new Date().getFullYear())
  document.querySelectorAll('.footer__year').forEach((el) => {
    el.textContent = year
  })
}

// Initialize forms
async function initializeApp() {
  initForms()
  setCredentialsDate()
  setFooterYear()
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  // DOM already ready, but wait a tick for any dynamic content
  setTimeout(initializeApp, 0)
}
