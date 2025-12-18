/**
 * Main JavaScript
 * Initializes global components and functionality
 */

// Import CSS so Vite processes it during build
import '../styles/main.css'

import { initNavigation } from './nav.js'
import { initForms } from './forms.js'
import './animations.js'

// Initialize navigation when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigation)
} else {
  initNavigation()
}

// Load header and footer components
async function loadComponent(selector, path) {
  try {
    const response = await fetch(path)
    const html = await response.text()
    const element = document.querySelector(selector)
    if (element) {
      element.innerHTML = html
      // Re-initialize navigation after header is loaded
      if (selector === 'header') {
        initNavigation()
      }
    }
  } catch (error) {
    console.warn(`Could not load component from ${path}:`, error)
  }
}

// Load global components
loadComponent('header', '/components/header.html')
loadComponent('footer', '/components/footer.html')

// Initialize forms and creator transitions
async function initializeApp() {
  initForms()
  
  // Initialize creator transitions with error handling
  try {
    const { initCreatorTransitions } = await import('./creator-transition-simple.js')
    if (typeof initCreatorTransitions === 'function') {
      initCreatorTransitions()
    }
  } catch (error) {
    console.warn('Creator transitions not available:', error)
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  // DOM already ready, but wait a tick for any dynamic content
  setTimeout(initializeApp, 0)
}
