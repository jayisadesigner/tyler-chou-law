/**
 * Creator Page Overlay
 * Static overlay for creator pages (no animations)
 */

let isTransitioning = false
let savedScrollPosition = 0

// Creator data (would ideally come from a data source)
const creatorData = {
  samandcolby: {
    name: '@samandcolby',
    breadcrumb: 'mr. purple',
    description: [
      'Sam Golbach and Colby Brock are paranormal investigators and YouTubers best known for their haunted exploration videos. Based in Los Angeles, they started making Vine videos together in 2014 after bonding at Blue Valley High School marching band camp in Kansas, where two self-described "shy, awkward band kids" pushed each other to step out of their comfort zones.',
      'Their signature style combines cinematic storytelling with genuine friendship chemistry, often featuring feature-length investigations at iconic locations like The Conjuring House, Queen Mary, and Stanley Hotel. They\'ve expanded into theatrical releases with two films and built XPLR, a clothing line sold at Zumiez and Hot Topic. Their most-watched upload, "ALONE in The Real Conjuring House," has been viewed over 16 million times.'
    ],
    stats: [
      { value: '15.3m', label: 'subscribers' },
      { value: '2.3b', label: 'total views' },
      { value: '13-35', label: 'core demo' },
      { value: 'US', label: 'top region' }
    ],
    videos: ['hij-U_onHXg', '9vNnBJmtBio', 'zSJRUojx3dE']
  },
  jennyhoyos: {
    name: '@jennyhoyos',
    breadcrumb: 'jenny hoyos',
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
  },
  cassandrabankson: {
    name: '@cassandrabankson',
    breadcrumb: 'cassandra bankson',
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
  },
  jeanelleats: {
    name: '@jeanelleats',
    breadcrumb: 'jeanelleats',
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
  },
  andymorris: {
    name: '@andymorris',
    breadcrumb: 'andy morris',
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
  },
  calebhammer: {
    name: '@calebhammer',
    breadcrumb: 'caleb hammer',
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
  },
  jadroppingscience: {
    name: '@jadroppingscience',
    breadcrumb: 'jad dropping science',
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
  },
  rogerwakefield: {
    name: '@rogerwakefield',
    breadcrumb: 'roger wakefield',
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
}

/**
 * Open creator page (static - no animations)
 */
function openCreatorPage(sourceCard, creatorId) {
  const overlay = document.getElementById('creator-page-overlay')
  if (!overlay || isTransitioning) return

  isTransitioning = true

  // Get source card image
  const cardImage = sourceCard.querySelector('.roster-card__image')
  if (!cardImage) {
    isTransitioning = false
    return
  }

  // Get overlay elements
  const overlayImageCard = overlay.querySelector('.creator-page-overlay__image-card')
  const overlayImage = overlay.querySelector('.creator-page-overlay__image')
  const overlayHandle = overlay.querySelector('.creator-page-overlay__handle')
  const overlayHeader = overlay.querySelector('.creator-page-overlay__header')
  const overlayContent = overlay.querySelector('.creator-page-overlay__content')
  const overlayBreadcrumbs = overlay.querySelector('.creator-page-overlay__breadcrumbs')
  const overlayCloseBtn = overlay.querySelector('.creator-page-overlay__close')

  if (!overlayImageCard || !overlayImage) {
    isTransitioning = false
    return
  }

  // Get creator data
  const data = creatorData[creatorId]
  const creatorDataToUse = data || {
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
  populateCreatorContent(creatorId, creatorDataToUse, overlay)
  
  // Set image source
  overlayImage.src = cardImage.src
  overlayImage.alt = cardImage.alt || ''
  
  // Set handle text from card
  const cardHandle = sourceCard.querySelector('.roster-card__handle')
  if (overlayHandle && cardHandle) {
    overlayHandle.textContent = cardHandle.textContent
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
  if (overlayContent) overlayContent.style.opacity = '1'
  if (overlayHeader) overlayHeader.style.opacity = '0'
  if (overlayBreadcrumbs) overlayBreadcrumbs.style.opacity = '1'
  if (overlayCloseBtn) overlayCloseBtn.style.opacity = '1'
  
  overlay.classList.add('creator-page-overlay--middle')
  isTransitioning = false
}

/**
 * Close creator page
 */
function closeCreatorPage() {
  const overlay = document.getElementById('creator-page-overlay')
  if (!overlay || isTransitioning) return

  isTransitioning = true

  // Hide overlay
  overlay.setAttribute('aria-hidden', 'true')
  overlay.classList.remove('creator-page-overlay--middle', 'creator-page-overlay--end')
  overlay.style.opacity = '0'
  
  // Restore body scroll and scroll position
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
  document.body.style.top = ''
  window.scrollTo(0, savedScrollPosition)
  savedScrollPosition = 0
  
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
              allow="encrypted-media"
              allowfullscreen
              title="Video ${index + 1}"
            ></iframe>
            <div class="video__overlay">
              <div class="video__overlay-gradient-1"></div>
              <div class="video__overlay-gradient-2"></div>
              <div class="video__overlay-dark"></div>
              <div class="video__overlay-opacity"></div>
            </div>
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

