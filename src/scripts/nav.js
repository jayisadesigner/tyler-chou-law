/**
 * Navigation Component
 * Handles mobile menu, active page highlighting, and accessibility
 */

export function initNavigation() {
  const nav = document.querySelector('nav')
  if (!nav) return

  const mobileMenuButton = nav.querySelector('.mobile-menu-button')
  const mobileMenu = nav.querySelector('.mobile-menu')
  const menuLinks = nav.querySelectorAll('a')

  // Mobile menu toggle
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open')
      mobileMenu.classList.toggle('open')
      mobileMenuButton.setAttribute('aria-expanded', !isOpen)
      mobileMenuButton.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu')
      
      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? '' : 'hidden'
    })

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open')
        mobileMenuButton.setAttribute('aria-expanded', 'false')
        mobileMenuButton.setAttribute('aria-label', 'Open menu')
        document.body.style.overflow = ''
      }
    })

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open')
        mobileMenuButton.setAttribute('aria-expanded', 'false')
        mobileMenuButton.setAttribute('aria-label', 'Open menu')
        document.body.style.overflow = ''
      }
    })
  }

  // Highlight active page
  const currentPath = window.location.pathname
  menuLinks.forEach(link => {
    const linkPath = new URL(link.href).pathname
    if (linkPath === currentPath || 
        (currentPath === '/' && linkPath === '/index.html') ||
        (currentPath.includes(linkPath) && linkPath !== '/')) {
      link.classList.add('active')
      link.setAttribute('aria-current', 'page')
    }
  })
}

