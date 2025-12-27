/**
 * Navigation - Mobile menu with slide-up animation
 */

import gsap from 'gsap'
import { animateLineElements } from './animations.js'

export function initNavigation() {
  const menu = document.querySelector('.nav-menu')
  const button = document.querySelector('.mobile-menu-button')
  const menuItems = document.querySelectorAll('.nav-menu a')
  
  if (!menu || !button) return
  
  // Check if mobile (button visible)
  const isMobile = () => window.innerWidth < 768
  
  // Wrap each menu item text in line animation structure (like headlines)
  menuItems.forEach((item) => {
    const text = item.textContent.trim()
    item.innerHTML = `<span class="line"><span class="line-inner">${text}</span></span>`
  })
  
  const lineInners = document.querySelectorAll('.nav-menu a .line-inner')
  
  // Set initial state only on mobile
  if (isMobile()) {
    gsap.set(menu, { yPercent: 100 })
    gsap.set(lineInners, { y: '100%', opacity: 0 })
    gsap.set(menuItems, { scale: 0.95 })
  } else {
    // Ensure visible on desktop
    gsap.set(menu, { yPercent: 0, clearProps: 'transform' })
    gsap.set(lineInners, { y: '0%', opacity: 1, clearProps: 'transform' })
    gsap.set(menuItems, { scale: 1, clearProps: 'transform' })
  }
  
  let isOpen = false
  
  button.addEventListener('click', () => {
    // Only handle clicks on mobile
    if (!isMobile()) return
    
    isOpen = !isOpen
    
    if (isOpen) {
      // Open menu - slide up from bottom
      menu.classList.add('is-open')
      document.body.style.overflow = 'hidden'
      
      // Animate menu slide up
      gsap.to(menu, {
        yPercent: 0,
        duration: 0.6,
        ease: 'power3.out'
      })
      
      // Stagger in menu items - line animation effect (using shared utility)
      animateLineElements(lineInners, { delay: 0.2 })
      
      // Animate scale separately
      gsap.to(menuItems, {
        scale: 1,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.2
      })
    } else {
      // Close menu - slide down with line animation effect (reverse order)
      gsap.to(lineInners, {
        y: '100%',
        opacity: 0,
        duration: 0.4,
        stagger: -0.04,
        ease: 'power2.in'
      })
      
      gsap.to(menuItems, {
        scale: 0.95,
        duration: 0.4,
        stagger: -0.04,
        ease: 'power2.in'
      })
      
      document.body.style.overflow = ''
      gsap.to(menu, {
        yPercent: 100,
        duration: 0.5,
        ease: 'power3.in',
        delay: 0.2,
        onComplete: () => {
          menu.classList.remove('is-open')
        }
      })
    }
  })
  
  // Handle resize - reset animations if switching between mobile/desktop
  let wasMobile = isMobile()
  window.addEventListener('resize', () => {
    const nowMobile = isMobile()
    if (wasMobile !== nowMobile) {
      if (nowMobile) {
        // Switched to mobile - set initial animation state
        gsap.set(menu, { yPercent: 100 })
        gsap.set(lineInners, { y: '100%', opacity: 0 })
        gsap.set(menuItems, { scale: 0.95 })
        isOpen = false
        document.body.style.overflow = ''
      } else {
        // Switched to desktop - clear animations
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

