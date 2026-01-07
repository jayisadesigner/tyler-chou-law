/**
 * Main JavaScript
 * Initializes global components and functionality
 */

// Global error handler to suppress Netlify service worker errors
// This catches the "Response with null body status cannot have body" error from cnm-sw.js
window.addEventListener('error', function(event) {
  // Suppress Netlify service worker errors that we can't control
  if (event.message && event.message.includes('Response with null body status')) {
    event.preventDefault()
    event.stopPropagation()
    return false
  }
}, true)

// Also catch unhandled promise rejections from service worker
window.addEventListener('unhandledrejection', function(event) {
  if (event.reason && event.reason.message && event.reason.message.includes('Response with null body status')) {
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
