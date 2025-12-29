/**
 * Schema Enhancement Script
 * Adds missing schema fields and BreadcrumbList to all pages
 */

import { readFile, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

const pagesToEnhance = [
  { name: 'index', path: 'index.html' },
  { name: 'about', path: 'about.html' },
  { name: 'services', path: 'services.html' },
  { name: 'contact', path: 'contact.html' },
  { name: 'creatorarq', path: 'creatorarq.html' },
  { name: 'love-letters', path: 'love-letters.html' },
]

/**
 * Generate BreadcrumbList schema
 */
function generateBreadcrumbList(pageName, pageUrl) {
  const breadcrumbs = [
    { position: 1, name: 'Home', item: 'https://tylerchoulaw.com/' }
  ]
  
  // Add page-specific breadcrumb
  const pageNames = {
    'index': null, // Home page, no additional breadcrumb
    'about': { name: 'About', item: 'https://tylerchoulaw.com/about.html' },
    'services': { name: 'Services', item: 'https://tylerchoulaw.com/services.html' },
    'contact': { name: 'Contact', item: 'https://tylerchoulaw.com/contact.html' },
    'creatorarq': { name: 'CreatorArq', item: 'https://tylerchoulaw.com/creatorarq.html' },
    'love-letters': { name: 'Love Letters', item: 'https://tylerchoulaw.com/love-letters.html' },
  }
  
  if (pageNames[pageName]) {
    breadcrumbs.push({
      position: 2,
      ...pageNames[pageName]
    })
  }
  
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": crumb.position,
      "name": crumb.name,
      "item": crumb.item
    }))
  }, null, 2)
}

/**
 * Enhance schema for a specific page
 */
function enhancePageSchema(html, pageName) {
  let enhanced = html
  
  // Find existing schema script tags
  const schemaRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
  const schemas = []
  let match
  
  while ((match = schemaRegex.exec(html)) !== null) {
    schemas.push({
      full: match[0],
      content: match[1].trim()
    })
  }
  
  // Enhance based on page type
  if (pageName === 'index') {
    // Add sameAs, logo, image to Attorney schema
    enhanced = enhanced.replace(
      /"sameAs":\s*\[\]/g,
      '"sameAs": ["https://linkedin.com/in/tylerchou", "https://twitter.com/tylerchou"]'
    )
    
    // Add logo and image if not present
    if (!enhanced.includes('"logo"')) {
      enhanced = enhanced.replace(
        /("description":\s*"[^"]*")/,
        '$1,\n      "logo": {\n        "@type": "ImageObject",\n        "url": "https://tylerchoulaw.com/src/assets/images/home/tyler-chou-mongram-logo.svg"\n      },\n      "image": "https://tylerchoulaw.com/src/assets/images/about/tyler-chou-headshot.jpeg"'
      )
    }
  } else if (pageName === 'about') {
    // Add alumniOf, knowsAbout, sameAs to Person schema
    if (!enhanced.includes('"alumniOf"')) {
      enhanced = enhanced.replace(
        /("sameAs":\s*\[\])/,
        '"alumniOf": [\n        {"@type": "Organization", "name": "Disney"},\n        {"@type": "Organization", "name": "Skydance"},\n        {"@type": "Organization", "name": "BuzzFeed"}\n      ],\n      "knowsAbout": [\n        "Entertainment Law",\n        "Creator Economy",\n        "Intellectual Property"\n      ],\n      $1'
      )
    }
    
    enhanced = enhanced.replace(
      /"sameAs":\s*\[\]/g,
      '"sameAs": ["https://linkedin.com/in/tylerchou", "https://twitter.com/tylerchou"]'
    )
  } else if (pageName === 'services') {
    // Add priceRange, serviceArea to Service schema
    if (!enhanced.includes('"priceRange"')) {
      enhanced = enhanced.replace(
        /("areaServed":\s*"US")/,
        '"priceRange": "$$$$",\n      "serviceArea": {\n        "@type": "Country",\n        "name": "United States"\n      },\n      $1'
      )
    }
  } else if (pageName === 'contact') {
    // Add telephone, email to LocalBusiness schema
    // Note: These should be added manually or from config
    // For now, we'll just ensure structure is ready
  } else if (pageName === 'creatorarq') {
    // Add logo, image, sameAs to Organization schema
    if (!enhanced.includes('"logo"')) {
      enhanced = enhanced.replace(
        /("foundingDate":\s*"2024")/,
        '$1,\n      "logo": {\n        "@type": "ImageObject",\n        "url": "https://tylerchoulaw.com/src/assets/images/creatorarq/creatorarq-logo-horizontal-on-dark.svg"\n      },\n      "image": "https://tylerchoulaw.com/src/assets/images/creatorarq/creatorarq-hero-youtuber-placeholder.jpg",\n      "sameAs": ["https://linkedin.com/company/creatorarq"]'
      )
    }
  }
  
  // Add BreadcrumbList schema if not present
  const breadcrumbSchema = generateBreadcrumbList(pageName, `https://tylerchoulaw.com/${pageName === 'index' ? '' : pageName + '.html'}`)
  const breadcrumbScript = `<script type="application/ld+json">\n    ${breadcrumbSchema}\n    </script>`
  
  // Check if BreadcrumbList already exists
  if (!enhanced.includes('"@type": "BreadcrumbList"')) {
    // Add before closing </head> tag
    enhanced = enhanced.replace('</head>', `    ${breadcrumbScript}\n  </head>`)
  }
  
  return enhanced
}

/**
 * Enhance a single page
 */
async function enhancePage(page) {
  try {
    const pagePath = join(projectRoot, page.path)
    let html = await readFile(pagePath, 'utf-8')
    
    html = enhancePageSchema(html, page.name)
    
    await writeFile(pagePath, html, 'utf-8')
    
    console.log(`✓ Enhanced: ${page.path}`)
    return { success: true, page: page.name }
  } catch (error) {
    console.error(`Error enhancing ${page.path}:`, error)
    return { success: false, page: page.name, error: error.message }
  }
}

/**
 * Enhance all pages
 */
async function enhanceSchema() {
  try {
    console.log('Enhancing page schemas...')
    
    const results = []
    for (const page of pagesToEnhance) {
      const result = await enhancePage(page)
      results.push(result)
    }
    
    const successCount = results.filter(r => r.success).length
    console.log(`\n✓ Enhanced ${successCount}/${results.length} page(s)`)
    
    return results
  } catch (error) {
    console.error('Error enhancing schemas:', error)
    return []
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  enhanceSchema()
}

export { enhanceSchema }

