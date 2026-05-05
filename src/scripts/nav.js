/**
 * Navigation - Mobile menu with slide-up animation
 */

import gsap from 'gsap'

// Inlined line-element tween (was the only consumer of the deleted
// line-animations.js module). Reveals a NodeList of span-inners by sliding
// each up from y:100% with a small stagger.
function animateLineElements(elements, options = {}) {
  return gsap.to(elements, {
    y: '0%',
    opacity: 1,
    duration: 0.9,
    stagger: 0.1,
    ease: 'power2.out',
    delay: 0,
    ...options
  })
}

export function initNavigation() {
  const menu = document.querySelector('.nav-menu')
  const button = document.querySelector('.mobile-menu-button')
  const menuItems = document.querySelectorAll('.nav-menu a')
  
  if (!menu || !button || menuItems.length === 0) return
  
  const isMobile = () => window.innerWidth < 768
  
  // Wrap each menu item text in line animation structure
  menuItems.forEach((item) => {
    if (item && !item.querySelector('.line-inner')) {
      const text = item.textContent.trim()
      item.innerHTML = `<span class="line"><span class="line-inner">${text}</span></span>`
    }
  })
  
  const lineInners = document.querySelectorAll('.nav-menu a .line-inner')
  
  // Set initial state only on mobile
  if (isMobile()) {
    gsap.set(menu, { yPercent: 100 })
    gsap.set(lineInners, { y: '100%', opacity: 0 })
    gsap.set(menuItems, { scale: 0.95 })
  } else {
    gsap.set(menu, { yPercent: 0, clearProps: 'transform' })
    gsap.set(lineInners, { y: '0%', opacity: 1, clearProps: 'transform' })
    gsap.set(menuItems, { scale: 1, clearProps: 'transform' })
  }
  
  let isOpen = false
  
  button.addEventListener('click', () => {
    if (!isMobile()) return
    
    isOpen = !isOpen
    
    if (isOpen) {
      menu.classList.add('is-open')
      document.body.style.overflow = 'hidden'
      
      gsap.to(menu, { yPercent: 0, duration: 0.6, ease: 'power3.out' })
      animateLineElements(lineInners, { delay: 0.2 })
      gsap.to(menuItems, { scale: 1, duration: 0.9, stagger: 0.1, ease: 'power2.out', delay: 0.2 })
    } else {
      gsap.to(lineInners, { y: '100%', opacity: 0, duration: 0.4, stagger: -0.04, ease: 'power2.in' })
      gsap.to(menuItems, { scale: 0.95, duration: 0.4, stagger: -0.04, ease: 'power2.in' })
      document.body.style.overflow = ''
      gsap.to(menu, {
        yPercent: 100,
        duration: 0.5,
        ease: 'power3.in',
        delay: 0.2,
        onComplete: () => menu.classList.remove('is-open')
      })
    }
  })
  
  // Handle resize
  let wasMobile = isMobile()
  window.addEventListener('resize', () => {
    const nowMobile = isMobile()
    if (wasMobile !== nowMobile) {
      if (nowMobile) {
        gsap.set(menu, { yPercent: 100 })
        gsap.set(lineInners, { y: '100%', opacity: 0 })
        gsap.set(menuItems, { scale: 0.95 })
        isOpen = false
        document.body.style.overflow = ''
      } else {
        gsap.set(menu, { yPercent: 0, clearProps: 'transform' })
        gsap.set(lineInners, { y: '0%', opacity: 1, clearProps: 'transform' })
        gsap.set(menuItems, { scale: 1, clearProps: 'transform' })
        menu.classList.remove('is-open')
        isOpen = false
        document.body.style.overflow = ''
      }
      wasMobile = nowMobile
    }
  })
}
