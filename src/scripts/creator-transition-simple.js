/**
 * Creator Page Overlay
 * Static overlay for creator pages (no animations)
 * Implements best practices: state persistence, focus management, accessibility
 */

let isTransitioning = false
let savedScrollPosition = 0
let previousURL = null
let originPage = null // Track which page user came from (home or roster)
let previouslyFocusedElement = null // For focus restoration
let focusTrapHandler = null // For focus trap management

// SessionStorage keys for state persistence
const STORAGE_KEYS = {
  ORIGIN_URL: 'creatorOverlay_originURL',
  ORIGIN_SCROLL: 'creatorOverlay_originScrollPosition',
  ORIGIN_PAGE: 'creatorOverlay_originPage',
  CREATOR_ID: 'creatorOverlay_creatorId'
}

/**
 * Save overlay state to sessionStorage
 */
function saveOverlayState(originURL, scrollPosition, originPage, creatorId) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.ORIGIN_URL, originURL)
    sessionStorage.setItem(STORAGE_KEYS.ORIGIN_SCROLL, String(scrollPosition))
    sessionStorage.setItem(STORAGE_KEYS.ORIGIN_PAGE, originPage)
    sessionStorage.setItem(STORAGE_KEYS.CREATOR_ID, creatorId)
  } catch (e) {
    // sessionStorage may not be available (private browsing, etc.)
    console.warn('Could not save overlay state to sessionStorage:', e)
  }
}

/**
 * Get overlay state from sessionStorage
 */
function getOverlayState() {
  try {
    const originURL = sessionStorage.getItem(STORAGE_KEYS.ORIGIN_URL)
    const originScroll = sessionStorage.getItem(STORAGE_KEYS.ORIGIN_SCROLL)
    const originPage = sessionStorage.getItem(STORAGE_KEYS.ORIGIN_PAGE)
    const creatorId = sessionStorage.getItem(STORAGE_KEYS.CREATOR_ID)
    
    if (originURL && originScroll !== null && originPage && creatorId) {
      return {
        originURL,
        originScrollPosition: parseInt(originScroll, 10) || 0,
        originPage,
        creatorId
      }
    }
  } catch (e) {
    console.warn('Could not read overlay state from sessionStorage:', e)
  }
  return null
}

/**
 * Clear overlay state from sessionStorage
 */
function clearOverlayState() {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.ORIGIN_URL)
    sessionStorage.removeItem(STORAGE_KEYS.ORIGIN_SCROLL)
    sessionStorage.removeItem(STORAGE_KEYS.ORIGIN_PAGE)
    sessionStorage.removeItem(STORAGE_KEYS.CREATOR_ID)
  } catch (e) {
    console.warn('Could not clear overlay state from sessionStorage:', e)
  }
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container) {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ')
  
  return Array.from(container.querySelectorAll(focusableSelectors)).filter(
    el => el.offsetParent !== null && !el.hasAttribute('aria-hidden')
  )
}

/**
 * Trap focus within overlay
 */
function trapFocus(overlay) {
  const focusableElements = getFocusableElements(overlay)
  if (focusableElements.length === 0) return
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  // Move focus to first element if overlay just opened
  if (document.activeElement === document.body || !overlay.contains(document.activeElement)) {
    firstElement.focus()
  }
  
  // Set up focus trap handler
  focusTrapHandler = (e) => {
    if (e.key !== 'Tab') return
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }
  
  overlay.addEventListener('keydown', focusTrapHandler)
}

/**
 * Remove focus trap
 */
function removeFocusTrap(overlay) {
  if (focusTrapHandler) {
    overlay.removeEventListener('keydown', focusTrapHandler)
    focusTrapHandler = null
  }
}

/**
 * Restore focus to previously focused element
 */
function restoreFocus() {
  if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
    // Check if element is still in DOM
    if (document.body.contains(previouslyFocusedElement)) {
      previouslyFocusedElement.focus()
    } else {
      // Element no longer exists, try to find the card by creator ID
      const state = getOverlayState()
      if (state) {
        const card = document.querySelector(`[data-creator="${state.creatorId}"]`)
        if (card && typeof card.focus === 'function') {
          card.focus()
        }
      }
    }
  }
  previouslyFocusedElement = null
}

// Creator data (would ideally come from a data source)
const creatorData = {
  jennyhoyos: {
    name: '@jennyhoyos',
    breadcrumb: 'jenny hoyos',
    description: [
      'Miami-based short-form strategist who reverse-engineered virality before most creators knew what a hook was. A former Peloton marketing prodigy turned YouTube phenom, Jenny built her empire on extreme budgeting challenges (think surviving on $1/day) that pull 10M+ views per Short on average.',
      'Her secret? Psychological precision in the first 2 seconds. She\'s cracked the code on attention economics and now teaches creators how to stop leaving views on the table.'
    ],
    stats: [
      { value: '9.15M', label: 'subscribers' },
      { value: '2B+', label: 'total views' },
      { value: '18-34', label: 'core demo' },
      { value: 'US', label: 'top region' }
    ],
    videos: ['rGdOljEhqBc', 'BJv4MYm7-rU', 'Ie7Ywgwfxxo']
  },
  calebhammer: {
    name: '@calebhammer',
    breadcrumb: 'caleb hammer',
    description: [
      'Austin-based creator behind Financial Audit, the viral series best described as "Jerry Springer meets Dave Ramsey." Caleb\'s unflinching approach to personal finance, where guests bare their bank statements and get brutally honest advice, has turned financial literacy into must-watch content.',
      'With CAA backing and a growing media empire, Caleb\'s proving that tough love sells, and that Americans are desperate for someone to tell them the truth about their money.'
    ],
    stats: [
      { value: '2.7M', label: 'subscribers' },
      { value: '2.4B+', label: 'total views' },
      { value: '25-44', label: 'core demo' },
      { value: 'US', label: 'top region' }
    ],
    videos: ['Y60e5Q2EYf0', 'nGj_iUGzNBM', 'icNanVDqpL0']
  },
  jesser: {
    name: '@jesser',
    breadcrumb: 'jesser',
    description: [
      'LA-based basketball content king who turned NBA 2K gameplay into a media empire. Three-time Streamy Award winner for Sports Creator of the Year, Jesser has collaborated with Giannis, Damian Lillard, and James Harden, and sat courtside as a judge at the 2025 NBA Slam Dunk Contest.',
      'With an official NBA apparel partnership and CAA representation, he\'s the blueprint for how gaming creators cross over into real-world sports legitimacy. Member of 2HYPE and 100 Thieves.'
    ],
    stats: [
      { value: '32M', label: 'subscribers' },
      { value: '7.9B+', label: 'total views' },
      { value: '13-24', label: 'core demo' },
      { value: 'US', label: 'top region' }
    ],
    videos: ['A94VYOssTF8', 'RqnbCPEXE-M', 'Ip2b0YeDMxI']
  },
  jadroppingscience: {
    name: '@jadroppingscience',
    breadcrumb: 'james andrews',
    description: [
      'Portland-based educational creator turning complex science into binge-worthy content. His signature style (deadpan delivery meets absurdist scenarios) makes learning feel like entertainment.',
      'Breakout hit "How to deal with getting impaled" racked up 33M+ views and established his lane: morbid curiosity meets genuine utility. He\'s building the next generation of science communicators, one unhinged hypothetical at a time.'
    ],
    stats: [
      { value: '2.17M', label: 'subscribers' },
      { value: '1.6B+', label: 'total views' },
      { value: '18-34', label: 'core demo' },
      { value: 'US', label: 'top region' }
    ],
    videos: ['wlZCcLFzoC0', 'y0_fFuEpz5E', 'd87CjFIlCGw']
  },
  sticks: {
    name: '@Sticks',
    breadcrumb: 'sticks',
    description: [
      'Australian-American filmmaking duo Lucas and Curtis Nicotra are redefining creator content with Hollywood-level production. Known for making cinematic trailers for creators like Emma Chamberlain, Ryan Trahan, and MatPat, they\'ve graduated to full branded productions, most recently helming MrBeast\'s Feastables "mini movie."',
      'Their mission: make a feature film about MrBeast and release it in theaters. They\'re not waiting for Hollywood\'s permission.'
    ],
    stats: [
      { value: '1.1M', label: 'subscribers' },
      { value: '53M+', label: 'total views' },
      { value: '18-34', label: 'core demo' },
      { value: 'US/AU', label: 'top region' }
    ],
    videos: ['NvTduUDqozE', 'Q9yK7OPkdzc', '6jQw52XTvK4']
  },
  jacksfilms: {
    name: '@jacksfilms',
    breadcrumb: 'jacksfilms',
    description: [
      'John Patrick Douglass has been a YouTube institution since 2006, nearly two decades of parodies, sketch comedy, and the iconic Yesterday I Asked You (YIAY) series. A 2018 Shorty Award winner for YouTuber of the Year, JacksFilms built his empire on community interaction and sharp comedic timing.',
      'He\'s outlasted algorithm shifts, platform pivots, and countless trends. Longevity is rare in the creator economy; Jack\'s the blueprint.'
    ],
    stats: [
      { value: '5M', label: 'subscribers' },
      { value: '2.8B+', label: 'total views' },
      { value: '18-34', label: 'core demo' },
      { value: 'US', label: 'top region' }
    ],
    videos: ['xDDxe_2AUEQ', 'dFbFHIsy_-c', 'CnnMrQaHupk']
  },
  cassandrabankson: {
    name: '@cassandraBankson',
    breadcrumb: 'cassandra bankson',
    description: [
      'San Francisco-based medical aesthetician and acne-positive advocate who turned her struggle with severe cystic acne into a skincare education empire. Her 2010 breakthrough video showing her bare skin transformation pulled 28M+ views and helped destigmatize skin conditions globally.',
      'Now a licensed professional, Cassandra bridges the gap between clinical expertise and accessible beauty content, proving that vulnerability can be a business strategy.'
    ],
    stats: [
      { value: '2.4M', label: 'subscribers' },
      { value: '178M+', label: 'total views' },
      { value: '18-34', label: 'core demo' },
      { value: 'US', label: 'top region' }
    ],
    videos: ['X4h364JPPVc', 'csCdlDhAgso', 'd77Sqiji4OY']
  },
  samandcolby: {
    name: '@samandcolby',
    breadcrumb: 'sam and colby',
    description: [
      'Sam Golbach and Colby Brock turned urban exploration and paranormal investigation into appointment viewing. Their signature series (Stanley Hotel, Hell Week, The Conjuring House) blend horror entertainment with genuine friendship chemistry.',
      'With their XPLR clothing line and a fanbase that rivals traditional media audiences, they\'ve proven that fear sells when you\'ve got the right hosts. Feature-length investigations averaging 90+ minutes regularly pull 10M+ views.'
    ],
    stats: [
      { value: '15.3M', label: 'subscribers' },
      { value: '2.3B+', label: 'total views' },
      { value: '13-24', label: 'core demo' },
      { value: 'US', label: 'top region' }
    ],
    videos: ['hij-U_onHXg', '9vNnBJmtBio', 'zSJRUojx3dE']
  }
}

/**
 * Get creator ID from current URL
 */
function getCreatorIdFromURL() {
  const pathname = window.location.pathname
  const match = pathname.match(/\/roster\/([^\/]+)\.html$/)
  return match ? match[1] : null
}

/**
 * Update URL when opening overlay
 * Includes full state object for better state management
 */
function updateURLForCreator(creatorId, originURL, originScrollPosition, originPage) {
  const newURL = `/roster/${creatorId}.html`
  previousURL = originURL || window.location.pathname + window.location.search
  
  // Store full state in history
  const state = {
    creatorId,
    originURL: previousURL,
    originScrollPosition: originScrollPosition || savedScrollPosition,
    originPage: originPage || 'roster'
  }
  
  history.pushState(state, '', newURL)
}

/**
 * Restore previous URL when closing overlay
 * Checks sessionStorage if previousURL is missing (refresh scenario)
 * If we're on a creator page URL after refresh, we need to actually navigate
 */
function restoreURL() {
  let urlToRestore = previousURL
  
  // If previousURL is missing, try to get from sessionStorage (refresh scenario)
  if (!urlToRestore) {
    const state = getOverlayState()
    if (state) {
      urlToRestore = state.originURL
    }
  }
  
  // Check if we're currently on a creator page (refresh scenario)
  const currentPath = window.location.pathname
  const isOnCreatorPage = currentPath.startsWith('/roster/') && currentPath.endsWith('.html')
  
  if (urlToRestore) {
    // If we're on a creator page and need to navigate to a different page, use full navigation
    if (isOnCreatorPage && urlToRestore !== currentPath) {
      // Full page navigation to restore to origin page
      window.location.href = urlToRestore
      return // Don't continue - navigation will happen
    } else {
      // Just update URL (same page, different state)
      history.replaceState(null, '', urlToRestore)
    }
    previousURL = null
  } else {
    // Fallback: determine where to go
    if (isOnCreatorPage) {
      // Try to determine origin from sessionStorage
      const state = getOverlayState()
      if (state && state.originPage === 'home') {
        window.location.href = '/'
        return
      } else {
        window.location.href = '/roster.html'
        return
      }
    }
  }
}

/**
 * Handle browser back/forward navigation
 * Reads from event.state first, then falls back to sessionStorage
 */
function handlePopState(event) {
  const creatorId = getCreatorIdFromURL()
  const overlay = document.getElementById('creator-page-overlay')
  
  if (!overlay) return
  
  const isOverlayOpen = overlay.getAttribute('aria-hidden') === 'false'
  
  // Try to get state from event.state first, then sessionStorage
  let state = null
  if (event.state && event.state.creatorId) {
    state = event.state
    // Restore previousURL and savedScrollPosition from state
    previousURL = state.originURL || null
    savedScrollPosition = state.originScrollPosition || 0
    originPage = state.originPage || null
  } else {
    // Fallback to sessionStorage
    state = getOverlayState()
    if (state) {
      previousURL = state.originURL
      savedScrollPosition = state.originScrollPosition
      originPage = state.originPage
    }
  }
  
  if (creatorId && !isOverlayOpen) {
    // URL has creator ID but overlay is closed - open it
    const card = document.querySelector(`[data-creator="${creatorId}"]`)
    if (card) {
      openCreatorPage(card, creatorId, false) // false = don't update URL (already updated)
    } else {
      openCreatorPage(null, creatorId, false) // No card found, use fallback
    }
  } else if (!creatorId && isOverlayOpen) {
    // URL doesn't have creator ID but overlay is open - close it
    closeCreatorPage(false) // false = don't update URL (already updated)
  }
}

export function initCreatorTransitions() {
  const cards = document.querySelectorAll('.roster-card[data-creator]')
  const overlay = document.getElementById('creator-page-overlay')
  const closeButton = overlay?.querySelector('.creator-page-overlay__close')

  if (!overlay) {
    console.warn('Creator page overlay not found')
    return
  }

  // Handle card clicks
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault()
      const creatorId = card.getAttribute('data-creator')
      
      if (creatorId && !isTransitioning) {
        openCreatorPage(card, creatorId)
      }
    })
  })

  // Handle close button
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      closeCreatorPage()
    })
  }

  // Handle escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.getAttribute('aria-hidden') === 'false') {
      closeCreatorPage()
    }
  })

  // Handle browser navigation
  window.addEventListener('popstate', handlePopState)

  // Check URL on initialization - open overlay if creator ID is in URL
  const creatorIdFromURL = getCreatorIdFromURL()
  if (creatorIdFromURL) {
    // Check if we have state in sessionStorage (refresh scenario)
    const savedState = getOverlayState()
    if (savedState && savedState.creatorId === creatorIdFromURL) {
      // Restore state from sessionStorage
      previousURL = savedState.originURL
      savedScrollPosition = savedState.originScrollPosition
      originPage = savedState.originPage
    }
    
    // Wait for all resources (CSS, fonts, etc.) to load before opening overlay
    // This prevents broken styles when closing after a page refresh
    const openOverlayFromURL = () => {
      const card = document.querySelector(`[data-creator="${creatorIdFromURL}"]`)
      if (card) {
        openCreatorPage(card, creatorIdFromURL, false) // false = don't update URL (already correct)
      } else {
        openCreatorPage(null, creatorIdFromURL, false) // No card found, use fallback
      }
    }

    // Wait for stylesheets to be loaded before opening overlay
    // This prevents broken styles when closing after a page refresh
    const waitForStyles = () => {
      // Check if stylesheets are loaded
      const stylesheets = Array.from(document.styleSheets)
      const allLoaded = stylesheets.every(sheet => {
        try {
          return sheet.cssRules || sheet.rules // Accessing rules checks if sheet is loaded
        } catch (e) {
          // Cross-origin stylesheets will throw, but that's okay
          return true
        }
      })
      
      if (allLoaded || document.readyState === 'complete') {
        // Use a small delay to ensure CSS is fully parsed and applied
        setTimeout(openOverlayFromURL, 50)
      } else {
        // Wait a bit more and try again
        setTimeout(waitForStyles, 50)
      }
    }

    // If page is already fully loaded, check stylesheets
    if (document.readyState === 'complete') {
      waitForStyles()
    } else {
      // Wait for window.onload first, then check stylesheets
      let overlayOpened = false
      const openOnce = () => {
        if (!overlayOpened) {
          overlayOpened = true
          waitForStyles()
        }
      }
      
      window.addEventListener('load', openOnce, { once: true })
      // Fallback timeout in case onload doesn't fire (shouldn't happen, but safety)
      setTimeout(openOnce, 200)
    }
  }
}

/**
 * Open creator page (static - no animations)
 * @param {HTMLElement|null} sourceCard - The roster card element, or null for direct URL access
 * @param {string} creatorId - The creator ID
 * @param {boolean} updateURL - Whether to update the URL (default: true)
 */
function openCreatorPage(sourceCard, creatorId, updateURL = true) {
  const overlay = document.getElementById('creator-page-overlay')
  if (!overlay || isTransitioning) return

  isTransitioning = true

  // Get source card image (if card exists)
  let cardImage = null
  if (sourceCard) {
    cardImage = sourceCard.querySelector('.roster-card__image')
    if (!cardImage) {
      isTransitioning = false
      return
    }
  }

  // Get overlay elements
  const overlayImageCard = overlay.querySelector('.creator-page-overlay__image-card')
  const overlayImage = overlay.querySelector('.creator-page-overlay__image')
  const overlayHandle = overlay.querySelector('.creator-page-overlay__handle')
  const overlayHeader = overlay.querySelector('.creator-page-overlay__header')
  const overlayContentWrapper = overlay.querySelector('.creator-page-overlay__content-wrapper')
  const overlayBreadcrumbs = overlay.querySelector('.creator-page-overlay__breadcrumbs')
  const overlayCloseBtn = overlay.querySelector('.creator-page-overlay__close')

  if (!overlayImageCard || !overlayImage) {
    isTransitioning = false
    return
  }

  // Get creator data with fallback
  const data = creatorData[creatorId] || {
    name: `@${creatorId}`,
    breadcrumb: creatorId,
    description: [
      'Creator description will be added here.',
      'Additional details about the creator will be added here.'
    ],
    stats: [
      { value: '0', label: 'subscribers' },
      { value: '0', label: 'total views' },
      { value: '0', label: 'core demo' },
      { value: 'US', label: 'top region' }
    ],
    videos: []
  }

  // Populate overlay content
  populateCreatorContent(creatorId, data, overlay)
  
  // Set image source (from card if available, or use data)
  if (cardImage) {
    overlayImage.src = cardImage.src
    overlayImage.alt = cardImage.alt || ''
  } else {
    // Fallback: map creator IDs to their actual image file names and extensions
    const imageMap = {
      'jesser': '/src/assets/images/roster/@jesser.webp',
      'sticks': '/src/assets/images/roster/@sticks.jpg',
      'jacksfilms': '/src/assets/images/roster/@jacksfilms.webp',
      'jennyhoyos': '/src/assets/images/roster/jennyhoyos.png',
      'samandcolby': '/src/assets/images/roster/samandcolby.png',
      'calebhammer': '/src/assets/images/roster/@calebhammer.png',
      'jadroppingscience': '/src/assets/images/roster/@jadroppingscience.png',
      'cassandrabankson': '/src/assets/images/roster/@cassandraBankson.png'
    }
    
    const imagePath = imageMap[creatorId] || `/src/assets/images/roster/${creatorId}.png`
    overlayImage.src = imagePath
    overlayImage.alt = data.name || `@${creatorId}`
  }
  
  // Set handle text from card or data
  if (sourceCard) {
    const cardHandle = sourceCard.querySelector('.roster-card__handle')
    if (overlayHandle && cardHandle) {
      overlayHandle.textContent = cardHandle.textContent
    }
  } else if (overlayHandle) {
    overlayHandle.textContent = data.name || `@${creatorId}`
  }

  // Store reference to source card for focus restoration
  previouslyFocusedElement = sourceCard || document.activeElement
  
  // IMPORTANT: Check sessionStorage FIRST for refresh scenarios
  const savedState = getOverlayState()
  if (savedState && savedState.creatorId === creatorId) {
    // We have saved state - use it (refresh scenario)
    previousURL = savedState.originURL
    savedScrollPosition = savedState.originScrollPosition
    originPage = savedState.originPage
  } else {
    // Determine origin page (home or roster) from current state
    // If previousURL exists, use it; otherwise check current path
    if (previousURL) {
      originPage = previousURL === '/' || previousURL === '/index.html' ? 'home' : 'roster'
    } else {
      const currentPath = window.location.pathname
      // If on a creator page, default to roster; otherwise use current path
      if (currentPath.startsWith('/roster/') && currentPath.endsWith('.html')) {
        originPage = 'roster' // Direct URL access defaults to roster page
        previousURL = '/roster.html' // Set fallback
      } else {
        originPage = currentPath === '/' || currentPath === '/index.html' ? 'home' : 'roster'
        previousURL = currentPath === '/' || currentPath === '/index.html' ? '/' : '/roster.html'
      }
    }
    
    // Save current scroll position (only if not already saved from sessionStorage)
    if (savedScrollPosition === 0) {
      savedScrollPosition = window.scrollY
    }
  }
  
  // Update breadcrumb link based on origin
  const breadcrumbLink = overlayBreadcrumbs?.querySelector('a[href="/roster.html"], a[href="/#roster"]')
  if (breadcrumbLink) {
    breadcrumbLink.textContent = 'roster'
    if (originPage === 'home') {
      breadcrumbLink.href = '/#roster'
    } else {
      breadcrumbLink.href = '/roster.html'
    }
  }
  
  // Determine origin URL for state persistence
  const currentOriginURL = previousURL || (window.location.pathname + window.location.search)
  
  // Save state to sessionStorage for refresh scenarios
  saveOverlayState(currentOriginURL, savedScrollPosition, originPage, creatorId)
  
  // Set accessibility attributes
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')
  if (overlayHandle) {
    overlayHandle.id = 'creator-overlay-handle'
    overlay.setAttribute('aria-labelledby', 'creator-overlay-handle')
  }
  
  // Stop Lenis smooth scrolling to allow overlay to scroll independently
  if (window.lenis) {
    window.lenis.stop()
  }
  
  // Show overlay
  overlay.setAttribute('aria-hidden', 'false')
  document.body.classList.add('creator-overlay-open') // Hide nav
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
  document.body.style.top = `-${savedScrollPosition}px`
  overlay.style.opacity = '1'
  
  // Show all elements
  if (overlayImageCard) overlayImageCard.style.opacity = '1'
  if (overlayContentWrapper) overlayContentWrapper.style.opacity = '1'
  if (overlayHeader) overlayHeader.style.opacity = '0'
  if (overlayBreadcrumbs) overlayBreadcrumbs.style.opacity = '1'
  if (overlayCloseBtn) overlayCloseBtn.style.opacity = '1'
  
  overlay.classList.add('creator-page-overlay--middle')
  
  // Set up focus trap and move focus to close button
  trapFocus(overlay)
  if (overlayCloseBtn) {
    // Add class to suppress focus styles for programmatic focus
    overlayCloseBtn.classList.add('programmatic-focus')
    overlayCloseBtn.focus()
    // Remove class after a short delay to allow keyboard focus to work normally
    setTimeout(() => {
      overlayCloseBtn.classList.remove('programmatic-focus')
    }, 100)
  }
  
  // Update URL if requested
  if (updateURL) {
    updateURLForCreator(creatorId, currentOriginURL, savedScrollPosition, originPage)
  }
  
  isTransitioning = false
}

/**
 * Close creator page
 * @param {boolean} updateURL - Whether to update the URL (default: true)
 */
function closeCreatorPage(updateURL = true) {
  const overlay = document.getElementById('creator-page-overlay')
  if (!overlay || isTransitioning) return

  isTransitioning = true

  // Remove focus trap
  removeFocusTrap(overlay)
  
  // Get state from sessionStorage FIRST (before clearing) - needed for refresh scenarios
  const savedState = getOverlayState()
  
  // Get scroll position from sessionStorage if savedScrollPosition is 0 (refresh scenario)
  let scrollToRestore = savedScrollPosition
  if (scrollToRestore === 0 && savedState) {
    scrollToRestore = savedState.originScrollPosition
  }
  
  // Get previousURL from sessionStorage if missing (refresh scenario)
  if (!previousURL && savedState) {
    previousURL = savedState.originURL
    originPage = savedState.originPage
  }

  // Hide overlay - let CSS handle visibility/opacity via aria-hidden
  overlay.setAttribute('aria-hidden', 'true')
  overlay.removeAttribute('role')
  overlay.removeAttribute('aria-modal')
  overlay.removeAttribute('aria-labelledby')
  overlay.classList.remove('creator-page-overlay--middle', 'creator-page-overlay--end')
  // Clear any inline opacity that was set when opening - let CSS handle it via aria-hidden
  overlay.style.removeProperty('opacity')
  document.body.classList.remove('creator-overlay-open') // Show nav
  
  // Restore body scroll styles first
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
  document.body.style.top = ''
  
  // Re-enable Lenis smooth scrolling
  if (window.lenis) {
    window.lenis.start()
  }
  
  // Restore URL if requested (do this BEFORE clearing state, as restoreURL might need it)
  if (updateURL) {
    restoreURL()
    // If restoreURL triggered navigation, don't continue - let the page reload
    // (This happens in refresh scenarios where we navigate to a different page)
    return
  }
  
  // Restore scroll position in next frame (after fixed is removed)
  // Only do this if we're not navigating away
  requestAnimationFrame(() => {
    const html = document.documentElement
    const originalScrollBehavior = html.style.scrollBehavior
    html.style.scrollBehavior = 'auto'
    window.scrollTo(0, scrollToRestore)
    html.style.scrollBehavior = originalScrollBehavior
    savedScrollPosition = 0
  })
  
  // Clear sessionStorage after successful close (only if we're not navigating)
  clearOverlayState()
  
  // Restore focus to previously focused element
  restoreFocus()
  
  isTransitioning = false
}

/**
 * Populate creator content in overlay
 */
function populateCreatorContent(creatorId, data, overlay) {
  if (!overlay || !data) return

  // Set breadcrumb name
  const breadcrumbName = overlay.querySelector('.creator-page-overlay__breadcrumb-name')
  if (breadcrumbName) {
    breadcrumbName.textContent = data.breadcrumb || creatorId
  }

  // Set handle
  const handle = overlay.querySelector('.creator-page-overlay__handle')
  if (handle) {
    handle.textContent = data.name || `@${creatorId}`
  }

  // Set description
  const descriptionTexts = overlay.querySelectorAll('.creator-page-overlay__description-text')
  if (descriptionTexts.length >= 2 && data.description && data.description.length >= 2) {
    descriptionTexts[0].textContent = data.description[0] || ''
    descriptionTexts[1].textContent = data.description[1] || ''
  }

  // Set stats
  const statValues = overlay.querySelectorAll('.creator-page-overlay__stat-value')
  const statLabels = overlay.querySelectorAll('.creator-page-overlay__stat-label')
  if (statValues.length >= 4 && statLabels.length >= 4 && data.stats && data.stats.length >= 4) {
    data.stats.forEach((stat, index) => {
      if (statValues[index]) statValues[index].textContent = stat.value || '0'
      if (statLabels[index]) statLabels[index].textContent = stat.label || ''
    })
  }

  // Set videos using the video component structure
  const videosContainer = overlay.querySelector('.creator-page-overlay__videos')
  if (videosContainer) {
    if (data.videos && data.videos.length > 0) {
      videosContainer.innerHTML = data.videos.map((videoId, index) => `
        <div class="creator-page-overlay__video">
          <div class="video">
              <iframe 
                class="video__embed"
                src="https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&controls=1&modestbranding=1&rel=0"
                allow="encrypted-media; fullscreen"
                title="Video ${index + 1}"
              ></iframe>
          </div>
          <p class="creator-page-overlay__video-label">watch on youtube</p>
        </div>
      `).join('')
    } else {
      // Show placeholder if no videos
      videosContainer.innerHTML = ''
    }
  }
}

