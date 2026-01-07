/**
 * Main JavaScript
 * Initializes global components and functionality
 */

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
async function loadComponent(selector, path) {
  try {
    const element = document.querySelector(selector)
    // Only load if element is empty (dev mode) - in production, content is already in HTML
    if (element && !element.innerHTML.trim()) {
      const response = await fetch(path, {
        redirect: 'manual',
        cache: 'no-store'
      })
      
      // Handle response - check if it's valid before trying to read text
      if (response.ok || response.status === 0) {
        const html = await response.text()
        element.innerHTML = html
        // Re-initialize navigation after header is loaded (dev mode only)
        // In production, navigation is already initialized at startup (line 17)
        if (selector === 'header') {
          initNavigation()
        }
      }
    }
    // Note: If content already exists (production), navigation was already initialized
    // at startup, so we don't need to call initNavigation() again here
  } catch (error) {
    // Silently handle service worker errors - component loading is non-critical
    // The error is from Netlify's service worker trying to handle responses incorrectly
    if (error.message && error.message.includes('Response with null body status')) {
      console.warn(`Service worker error loading ${path}, component may already be loaded`)
    } else {
      console.warn(`Could not load component from ${path}:`, error)
    }
  }
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
