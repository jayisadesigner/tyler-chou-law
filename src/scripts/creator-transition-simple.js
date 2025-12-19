/**
 * Creator Page Overlay
 * Static overlay for creator pages (no animations)
 */

let isTransitioning = false
let savedScrollPosition = 0
let previousURL = null

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
      { value: 'Gen Z/Millennial', label: 'core demo' },
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
      { value: 'Gen Z Male', label: 'core demo' },
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
      { value: 'Creator/Filmmaker Audience', label: 'core demo' },
      { value: 'US/Australia', label: 'top region' }
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
      { value: '18-34 Female', label: 'core demo' },
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
      { value: 'Gen Z', label: 'core demo' },
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
 */
function updateURLForCreator(creatorId) {
  const newURL = `/roster/${creatorId}.html`
  previousURL = window.location.pathname + window.location.search
  history.pushState({ creatorId }, '', newURL)
}

/**
 * Restore previous URL when closing overlay
 */
function restoreURL() {
  if (previousURL) {
    history.replaceState(null, '', previousURL)
    previousURL = null
  } else {
    // Fallback: go back in history or go to home
    const currentPath = window.location.pathname
    if (currentPath.startsWith('/roster/') && currentPath.endsWith('.html')) {
      history.replaceState(null, '', '/roster.html')
    }
  }
}

/**
 * Handle browser back/forward navigation
 */
function handlePopState(event) {
  const creatorId = getCreatorIdFromURL()
  const overlay = document.getElementById('creator-page-overlay')
  
  if (!overlay) return
  
  const isOverlayOpen = overlay.getAttribute('aria-hidden') === 'false'
  
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
    // Wait for first paint before opening overlay
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const card = document.querySelector(`[data-creator="${creatorIdFromURL}"]`)
        if (card) {
          openCreatorPage(card, creatorIdFromURL, false) // false = don't update URL (already correct)
        } else {
          openCreatorPage(null, creatorIdFromURL, false) // No card found, use fallback
        }
      })
    })
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

  // Save current scroll position
  savedScrollPosition = window.scrollY
  
  // Show overlay
  overlay.setAttribute('aria-hidden', 'false')
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
  
  // Update URL if requested
  if (updateURL) {
    updateURLForCreator(creatorId)
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

  // Hide overlay
  overlay.setAttribute('aria-hidden', 'true')
  overlay.classList.remove('creator-page-overlay--middle', 'creator-page-overlay--end')
  overlay.style.opacity = '0'
  
  // Restore body scroll and scroll position (instant, no smooth scroll)
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
  document.body.style.top = ''
  window.scrollTo({ top: savedScrollPosition, behavior: 'auto' })
  savedScrollPosition = 0
  
  // Restore URL if requested
  if (updateURL) {
    restoreURL()
  }
  
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

