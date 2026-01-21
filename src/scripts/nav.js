/**
 * Navigation - Mobile menu with slide-up animation
 */

import gsap from 'gsap'
import { animateLineElements } from './animations/line-animations.js'

export function initNavigation() {
  const menu = document.querySelector('.nav-menu')
  const button = document.querySelector('.mobile-menu-button')
  const menuItems = document.querySelectorAll('.nav-menu a')
  
  // #region agent log H1
  fetch('http://127.0.0.1:7242/ingest/0a8475d7-dbb5-4388-a048-99ec51a10bc4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'nav.js:init',message:'initNavigation called',data:{hasMenu:!!menu,hasButton:!!button,menuItemsCount:menuItems.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  
  // Early return if elements aren't ready
  if (!menu || !button || menuItems.length === 0) return
  
  // #region agent log H1-pass
  fetch('http://127.0.0.1:7242/ingest/0a8475d7-dbb5-4388-a048-99ec51a10bc4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'nav.js:afterGuard',message:'Passed early return check',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
  
  // Check if mobile (button visible)
  const isMobile = () => window.innerWidth < 768
  
  /**
   * Get menu items in visual order for mobile (matches CSS Grid order)
   * Visual order: Services, About, Roster, CreatorArq, Love Letters, Contact
   */
  const getItemsInVisualOrder = () => {
    const order = [
      '/services.html',
      '/about.html',
      '/roster.html',
      '/creatorarq.html',
      '/love-letters.html',
      '/contact.html'
    ]
    return order.map(href => 
      Array.from(menuItems).find(item => item.getAttribute('href') === href)
    ).filter(Boolean)
  }
  
  // Wrap each menu item text in line animation structure (like headlines)
  // Only wrap if not already wrapped (prevents double-wrapping on re-initialization)
  let wrappedCount = 0;
  menuItems.forEach((item) => {
    if (item && !item.querySelector('.line-inner')) {
      const text = item.textContent.trim()
      item.innerHTML = `<span class="line"><span class="line-inner">${text}</span></span>`
      wrappedCount++;
    }
  })
  
  const lineInners = document.querySelectorAll('.nav-menu a .line-inner')
  
  // #region agent log H2
  fetch('http://127.0.0.1:7242/ingest/0a8475d7-dbb5-4388-a048-99ec51a10bc4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'nav.js:afterWrap',message:'After wrapping items',data:{wrappedCount,lineInnersCount:lineInners.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
  // #endregion
  
  // Set initial state only on mobile
  // #region agent log H3
  fetch('http://127.0.0.1:7242/ingest/0a8475d7-dbb5-4388-a048-99ec51a10bc4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'nav.js:initialState',message:'Setting initial state',data:{isMobile:isMobile(),windowWidth:window.innerWidth},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
  // #endregion
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
    // #region agent log H4
    fetch('http://127.0.0.1:7242/ingest/0a8475d7-dbb5-4388-a048-99ec51a10bc4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'nav.js:clickHandler',message:'Button clicked',data:{isMobile:isMobile(),windowWidth:window.innerWidth,isOpenBefore:isOpen},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    
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
      
      // Get items in visual order for mobile stagger animation
      const visualOrderItems = isMobile() ? getItemsInVisualOrder() : Array.from(menuItems)
      const visualOrderLineInners = visualOrderItems.map(item => 
        item?.querySelector('.line-inner')
      ).filter(Boolean)
      
      // #region agent log H5
      fetch('http://127.0.0.1:7242/ingest/0a8475d7-dbb5-4388-a048-99ec51a10bc4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'nav.js:openMenu',message:'Opening menu',data:{visualOrderItemsCount:visualOrderItems.length,visualOrderLineInnersCount:visualOrderLineInners.length,menuHasIsOpen:menu.classList.contains('is-open')},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
      // #endregion
      
      // Stagger in menu items - line animation effect (using shared utility)
      // Use visual order for mobile, DOM order for desktop
      if (visualOrderLineInners.length > 0) {
        if (isMobile()) {
          animateLineElements(visualOrderLineInners, { delay: 0.2 })
        } else {
          animateLineElements(lineInners, { delay: 0.2 })
        }
      }
      
      // Animate scale separately - use visual order for mobile
      if (visualOrderItems.length > 0) {
        gsap.to(visualOrderItems, {
          scale: 1,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.2
        })
      }
    } else {
      // Close menu - slide down with line animation effect (reverse order)
      // Get items in visual order for mobile stagger animation (reverse)
      const visualOrderItems = isMobile() ? getItemsInVisualOrder() : Array.from(menuItems)
      const visualOrderLineInners = visualOrderItems.map(item => 
        item?.querySelector('.line-inner')
      ).filter(Boolean)
      
      // Reverse order for close animation
      const reverseOrderLineInners = isMobile() 
        ? [...visualOrderLineInners].reverse()
        : Array.from(lineInners).reverse()
      const reverseOrderItems = isMobile()
        ? [...visualOrderItems].reverse()
        : Array.from(menuItems).reverse()
      
      // Only animate if we have valid elements
      if (reverseOrderLineInners.length > 0) {
        gsap.to(reverseOrderLineInners, {
          y: '100%',
          opacity: 0,
          duration: 0.4,
          stagger: -0.04,
          ease: 'power2.in'
        })
      }
      
      if (reverseOrderItems.length > 0) {
        gsap.to(reverseOrderItems, {
          scale: 0.95,
          duration: 0.4,
          stagger: -0.04,
          ease: 'power2.in'
        })
      }
      
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

