/**
 * Media Gallery
 * Carousel for the combined photo/video media block on press + speaking cards.
 *
 * Progressive enhancement: the markup is a native CSS scroll-snap track, so it
 * already swipes on touch and scrolls with a trackpad before this runs. This
 * module adds the controls that need JS — prev/next arrows, dot indicators,
 * keyboard paging — and pauses videos as they scroll out of view.
 */

const ICON_PREV = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>'
const ICON_NEXT = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>'

function setupGallery(gallery) {
  const viewport = gallery.querySelector('.press-card__media-viewport')
  const track = gallery.querySelector('.press-card__media-track')
  if (!viewport || !track) return

  const slides = Array.from(track.children)
  // A single item needs no navigation — it just fills the media slot.
  if (slides.length < 2) return

  let current = 0

  const prev = document.createElement('button')
  prev.type = 'button'
  prev.className = 'press-card__media-nav press-card__media-nav--prev'
  prev.setAttribute('aria-label', 'Previous item')
  prev.innerHTML = ICON_PREV

  const next = document.createElement('button')
  next.type = 'button'
  next.className = 'press-card__media-nav press-card__media-nav--next'
  next.setAttribute('aria-label', 'Next item')
  next.innerHTML = ICON_NEXT

  const dots = document.createElement('div')
  dots.className = 'press-card__media-dots'

  const dotButtons = slides.map((_, i) => {
    const dot = document.createElement('button')
    dot.type = 'button'
    dot.className = 'press-card__media-dot'
    dot.setAttribute('aria-label', `Go to item ${i + 1} of ${slides.length}`)
    dot.addEventListener('click', () => goTo(i))
    dots.appendChild(dot)
    return dot
  })

  function goTo(index) {
    const target = slides[Math.max(0, Math.min(index, slides.length - 1))]
    if (target) track.scrollTo({ left: target.offsetLeft - track.offsetLeft })
  }

  function setCurrent(index) {
    current = index
    prev.disabled = index === 0
    next.disabled = index === slides.length - 1
    dotButtons.forEach((dot, i) => {
      dot.setAttribute('aria-current', String(i === index))
    })
    // Stop media that has scrolled out of view so audio never plays offscreen.
    slides.forEach((slide, i) => {
      if (i === index) return
      slide.querySelectorAll('video').forEach((video) => {
        if (!video.paused) video.pause()
      })
      // Embedded players are cross-origin, so they are paused through the
      // Vimeo player's postMessage API rather than the media element.
      slide.querySelectorAll('iframe[src*="player.vimeo.com"]').forEach((frame) => {
        frame.contentWindow?.postMessage('{"method":"pause"}', 'https://player.vimeo.com')
      })
    })
  }

  prev.addEventListener('click', () => goTo(current - 1))
  next.addEventListener('click', () => goTo(current + 1))

  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goTo(current - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      goTo(current + 1)
    }
  })

  // The slide occupying most of the viewport is the current one. This keeps
  // the controls in sync with native swiping and scrolling, not just clicks.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const index = slides.indexOf(entry.target)
        if (index !== -1 && index !== current) setCurrent(index)
      })
    },
    { root: track, threshold: 0.6 }
  )
  slides.forEach((slide) => observer.observe(slide))

  track.tabIndex = 0
  track.setAttribute('role', 'group')
  track.setAttribute('aria-roledescription', 'carousel')
  track.setAttribute('aria-label', `Media gallery, ${slides.length} items`)

  viewport.appendChild(prev)
  viewport.appendChild(next)
  gallery.appendChild(dots)

  setCurrent(0)
}

export function initMediaGalleries() {
  document.querySelectorAll('[data-media-gallery]').forEach(setupGallery)
}
