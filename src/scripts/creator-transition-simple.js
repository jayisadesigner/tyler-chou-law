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
      'Jenny Hoyos is a short-form content strategist and finance educator from Miami who averages 10 million views per YouTube Short. Based in Miami, she started creating content at age eight when all 20 of her cousins were making YouTube videos at family sleepovers.',
      'Her signature style combines extreme budgeting challenges with cinematic storytelling hooks, featuring videos like "$1 fast food hacks" and turning her brother\'s room into an Airbnb (168M views). She graduated from Florida International University with a finance degree in just two years as a first-generation college student. Her most-watched content proves that viral isn\'t luck, it\'s architecture: powerful hooks, deliberate retention curves, and endings that satisfy.'
    ],
    stats: [
      { value: '9.15m', label: 'subscribers' },
      { value: '2b+', label: 'total views' },
      { value: '13-24', label: 'core demo' },
      { value: 'US', label: 'top region' }
    ],
    videos: ['rGdOljEhqBc', 'BJv4MYm7-rU', 'Ie7Ywgwfxxo']
  },
  cassandrabankson: {
    name: '@cassandrabankson',
    breadcrumb: 'cassandra bankson',
    description: [
      'Cassandra Bankson is a licensed medical aesthetician and acne-positive advocate from San Francisco who turned her biggest insecurity into her platform. At fourteen, severe cystic acne covered 90% of her face. She was pulled from school due to bullying and completed her education with a private tutor.',
      'Her signature style combines clinical skincare expertise with raw vulnerability, featuring before-and-after reveals, ingredient deep-dives, and celebrity routine reactions. Her breakthrough video showing her bare skin transformation garnered 28 million views and media features from Good Morning America to Vogue. She\'s spent 14+ years studying cosmetic chemistry and now calls herself an "Acne Warrior" helping others embrace and care for their skin through science-backed routines.'
    ],
    stats: [
      { value: '2.4m', label: 'subscribers' },
      { value: '178m+', label: 'total views' },
      { value: '18-34', label: 'core demo' },
      { value: 'US', label: 'top region' }
    ],
    videos: ['X4h364JPPVc', 'csCdlDhAgso', 'd77Sqiji4OY']
  },
  jeanelleats: {
    name: '@jeanelleats',
    breadcrumb: 'jeanelleats',
    description: [
      'Jeanelle Castro is a Filipino-American food and travel creator who moved from the Philippines to California at age eight. Based in the US, she started her channel in 2016 with a mission to make cooking feel accessible to people afraid to experiment in the kitchen.',
      'Her signature style combines quick-hit food content with cultural storytelling, featuring everything from Spam musubi tutorials to global street food adventures. She launched MyMusubi, a product that lets people create perfectly shaped musubi at home. Her most-watched videos include "Is peas and corn still a thing?" and "How to keep pizza dough from sticking," each pulling millions of views through relatable, snackable content.'
    ],
    stats: [
      { value: '1.9m', label: 'subscribers' },
      { value: '1.25b+', label: 'total views' },
      { value: '25-44', label: 'core demo' },
      { value: 'US', label: 'top region' }
    ],
    videos: ['lOYXrhi42_Q', 'uJBQfZEplpg', 'Kps7CFBr0-g']
  },
  andymorris: {
    name: '@andymorris',
    breadcrumb: 'andy morris',
    description: [
      'Andy Morris is a pianist and classical crossover artist from Bloomington, Indiana who turned TikTok piano challenges into a multi-platform music career. Born in 1998, he studied at Indiana University\'s Kelley School of Business before going full-time creator.',
      'His signature style combines viral piano performances with intimate fan interaction, taking song requests live and turning them into polished covers. His cafeteria performance of Coldplay\'s "Viva La Vida" pulled 6.9 million YouTube views. He\'s released original arrangements on Spotify (857K monthly listeners) and built a sheet music business alongside his content. His dog Coco makes regular appearances.'
    ],
    stats: [
      { value: '1.05m (YT) / 4.8m (TT)', label: 'subscribers' },
      { value: '166m+', label: 'total likes' },
      { value: '18-34', label: 'core demo' },
      { value: 'US', label: 'top region' }
    ],
    videos: ['zhSx7i44tjc', 'S2AdAFFq24M', '6CwFngCj3xA']
  },
  calebhammer: {
    name: '@calebhammer',
    breadcrumb: 'caleb hammer',
    description: [
      'Caleb Hammer is a personal finance educator from Kalamazoo, Michigan who hosts Financial Audit, described as "Jerry Springer meets Dave Ramsey." Based in Austin, Texas, he started the show in 2022 after clawing his way out of $69,500 in debt himself.',
      'His signature style combines tough-love accountability with genuine compassion, auditing real guests\' bank statements and spending habits live on camera. He recently signed with CAA and became the largest membership channel on YouTube. Notable guests have included Michigan Governor Gretchen Whitmer. His DollarWise budgeting app extends the show\'s mission beyond content.'
    ],
    stats: [
      { value: '2.7m', label: 'subscribers' },
      { value: '2.4b', label: 'total views' },
      { value: '25-44', label: 'core demo' },
      { value: 'US', label: 'top region' }
    ],
    videos: ['Y60e5Q2EYf0', 'nGj_iUGzNBM', 'icNanVDqpL0']
  },
  jadroppingscience: {
    name: '@jadroppingscience',
    breadcrumb: 'jad dropping science',
    description: [
      'James Andrews is an educational YouTuber and Cal Poly graduate who makes science digestible through punchy short-form content. Based in Portland, he launched his channel in November 2020 and uploaded his first Short, "How to deal with getting impaled," in March 2021 (33M+ views).',
      'His signature style combines quick science facts with visual hooks and dry humor, featuring series like "2 Truths & Trash" now in its fourth season. He\'s turned his format into a physical product with the "2 Truths & Trash Science Trivia Pack." His content covers everything from laser physics demonstrations to party-trick science explainers.'
    ],
    stats: [
      { value: '2.17m', label: 'subscribers' },
      { value: '1.6b', label: 'total views' },
      { value: '13-34', label: 'core demo' },
      { value: 'US', label: 'top region' }
    ],
    videos: ['wlZCcLFzoC0', 'y0_fFuEpz5E', 'd87CjFIlCGw']
  },
  rogerwakefield: {
    name: '@rogerwakefield',
    breadcrumb: 'roger wakefield',
    description: [
      'Roger Wakefield is a Texas Master Plumber with 40+ years of experience who built the largest plumbing YouTube channel in the world. Based in Richardson, Texas, he started making videos in 2018 after spending $4,000/month on marketing that wasn\'t working.',
      'His signature style combines practical DIY tutorials with trade advocacy, teaching both homeowners and aspiring plumbers. He went from 361 subscribers his first year to selling his plumbing company and going full-time creator. He founded The Trades Academy to recruit the next generation into construction, driven by his goal to fill hundreds of thousands of open trade jobs. His content gains 1,000+ subscribers daily.'
    ],
    stats: [
      { value: '650k+', label: 'subscribers' },
      { value: '125m+', label: 'total views' },
      { value: '35-54', label: 'core demo' },
      { value: 'US', label: 'top region' }
    ],
    videos: ['hibRt6dIBHM', 'zIp-qmIJ3Cs', 'jw15b1RacP0']
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
  if (overlayContentWrapper) overlayContentWrapper.style.opacity = '1'
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

