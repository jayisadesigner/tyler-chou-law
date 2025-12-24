/**
 * Creator Page Overlay - Simplified
 * Dead simple open/close functionality with URL management
 */

// Creator data
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
 * Get creator ID from URL
 */
function getCreatorIdFromURL() {
  const match = window.location.pathname.match(/\/roster\/([^\/]+)\.html$/)
  return match ? match[1] : null
}

/**
 * Populate overlay with creator data
 */
function populateOverlay(creatorId) {
  const overlay = document.getElementById('creator-page-overlay')
  if (!overlay) return

  const data = creatorData[creatorId]
  if (!data) return

  // Image
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
  
  const img = overlay.querySelector('.creator-page-overlay__image')
  if (img) {
    img.src = imageMap[creatorId] || `/src/assets/images/roster/${creatorId}.png`
    img.alt = data.name
  }

  // Handle
  const handle = overlay.querySelector('.creator-page-overlay__handle')
  if (handle) handle.textContent = data.name

  // Breadcrumb
  const breadcrumbName = overlay.querySelector('.creator-page-overlay__breadcrumb-name')
  if (breadcrumbName) breadcrumbName.textContent = data.breadcrumb

  // Description
  const descTexts = overlay.querySelectorAll('.creator-page-overlay__description-text')
  if (descTexts.length >= 2) {
    descTexts[0].textContent = data.description[0]
    descTexts[1].textContent = data.description[1]
  }

  // Stats
  const statValues = overlay.querySelectorAll('.creator-page-overlay__stat-value')
  const statLabels = overlay.querySelectorAll('.creator-page-overlay__stat-label')
  data.stats.forEach((stat, i) => {
    if (statValues[i]) statValues[i].textContent = stat.value
    if (statLabels[i]) statLabels[i].textContent = stat.label
  })

  // Videos
  const videosContainer = overlay.querySelector('.creator-page-overlay__videos')
  if (videosContainer && data.videos.length > 0) {
    videosContainer.innerHTML = data.videos.map((videoId, i) => `
      <div class="creator-page-overlay__video">
        <div class="video">
          <iframe 
            class="video__embed"
            src="https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&controls=1&modestbranding=1&rel=0"
            allow="encrypted-media; fullscreen"
            title="Video ${i + 1}"
          ></iframe>
        </div>
        <p class="creator-page-overlay__video-label">watch on youtube</p>
      </div>
    `).join('')
  }
}

/**
 * Open overlay
 */
function openOverlay(creatorId) {
  const overlay = document.getElementById('creator-page-overlay')
  if (!overlay) return

  populateOverlay(creatorId)
  overlay.setAttribute('aria-hidden', 'false')
  history.pushState({ creatorId }, '', `/roster/${creatorId}.html`)
}

/**
 * Close overlay
 */
function closeOverlay() {
  const overlay = document.getElementById('creator-page-overlay')
  if (!overlay) return

  overlay.setAttribute('aria-hidden', 'true')
  history.back()
}

/**
 * Handle browser back/forward
 */
function handlePopState() {
  const creatorId = getCreatorIdFromURL()
  const overlay = document.getElementById('creator-page-overlay')
  if (!overlay) return

  const isOpen = overlay.getAttribute('aria-hidden') === 'false'

  if (creatorId && !isOpen) {
    populateOverlay(creatorId)
    overlay.setAttribute('aria-hidden', 'false')
  } else if (!creatorId && isOpen) {
    overlay.setAttribute('aria-hidden', 'true')
  }
}

/**
 * Initialize
 */
export function initCreatorTransitions() {
  const overlay = document.getElementById('creator-page-overlay')
  if (!overlay) return

  // Card clicks
  document.querySelectorAll('.roster-card[data-creator]').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault()
      const creatorId = card.getAttribute('data-creator')
      if (creatorId) openOverlay(creatorId)
    })
  })

  // Close button
  const closeBtn = overlay.querySelector('.creator-page-overlay__close')
  if (closeBtn) {
    closeBtn.addEventListener('click', closeOverlay)
  }

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.getAttribute('aria-hidden') === 'false') {
      closeOverlay()
    }
  })

  // Browser navigation
  window.addEventListener('popstate', handlePopState)

  // Open on page load if URL has creator ID
  const creatorId = getCreatorIdFromURL()
  if (creatorId) {
    populateOverlay(creatorId)
    overlay.setAttribute('aria-hidden', 'false')
  }
}
