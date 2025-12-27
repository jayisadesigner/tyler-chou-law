/**
 * Pages Build Script
 * Pre-renders page content (hero, body, CTA) and injects header/footer at build time
 * Follows the same pattern as build-blog.js and build-creators.js
 */

import { readFile, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Import page data
const { pageData } = await import(join(projectRoot, 'src', 'data', 'pages.js'))

// Paths
const componentsDir = join(projectRoot, 'src', 'components')
const pagesToBuild = ['index', 'about', 'services', 'contact', 'creatorarq', 'creatorarq-apply', 'love-letters', 'roster']

/**
 * Load component template
 */
async function loadComponentTemplate(name) {
  try {
    const path = join(componentsDir, `${name}.html`)
    return await readFile(path, 'utf-8')
  } catch (error) {
    console.error(`Error loading component ${name}:`, error)
    throw error
  }
}

/**
 * Generate hero HTML from template and data
 */
async function generateHero(template, data) {
  if (!data) return ''
  
  // Load background image component if needed (only for inner pages)
  let backgroundImageHtml = ''
  if (data.backgroundImage) {
    try {
      const backgroundImageTemplate = await loadComponentTemplate('background-image')
      backgroundImageHtml = backgroundImageTemplate.replace(/\{\{image-src\}\}/g, data.backgroundImage)
    } catch (error) {
      console.warn(`Warning: Could not load background-image component: ${error.message}`)
    }
  }
  
  let html = template
    .replace(/\{\{headline\}\}/g, data.headline || '')
    .replace(/\{\{eyebrow\}\}/g, data.eyebrow || '')
    .replace(/\{\{subheadline\}\}/g, data.subheadline || '')
    .replace(/\{\{variant-class\}\}/g, data.variant && data.variant !== 'default' ? ` hero--${data.variant}` : '')
    .replace(/\{\{background-image\}\}/g, backgroundImageHtml)
  
  // Handle subheadline for home page (simple format)
  if (data.subheadline && html.includes('{{subheadline}}') && !html.includes('hero-subheadline--inner-page')) {
    html = html.replace(/\{\{subheadline\}\}/g, `<p class="hero-subheadline">${data.subheadline}</p>`)
  }
  
  // Hide eyebrow div if empty (inner pages only)
  if (!data.eyebrow) {
    html = html.replace(/<div class="hero-eyebrow">[\s\S]*?<\/div>/g, '')
  }
  
  // Hide subheadline div if empty (inner pages only)
  if (!data.subheadline) {
    html = html.replace(/<div class="hero-subheadline-wrapper">[\s\S]*?<\/div>/g, '')
  }
  
  return html
}

/**
 * Generate body content HTML from template and data
 */
function generateBodyContent(template, data) {
  if (!data) return ''
  
  // Generate column HTML
  const columnsHtml = data.content.map(col => `<div class="body-content__column">${col}</div>`).join('\n      ')
  
  let html = template
    .replace(/\{\{columns\}\}/g, data.columns || 1)
    .replace(/\{\{content-columns\}\}/g, columnsHtml)
    .replace(/\{\{variant-class\}\}/g, data.variant && data.variant !== 'default' ? ` body-content--${data.variant}` : '')
    .replace(/\{\{wide-class\}\}/g, data.wide ? ' container-wide' : '')
  
  return html
}

/**
 * Generate CTA section HTML from template and data
 */
function generateCTA(template, data) {
  if (!data) return ''
  
  let html = template
    .replace(/\{\{headline\}\}/g, data.headline || '')
    .replace(/\{\{buttonText\}\}/g, data.buttonText || '')
    .replace(/\{\{buttonLink\}\}/g, data.buttonLink || '#')
    .replace(/\{\{variant-class\}\}/g, data.variant && data.variant !== 'default' ? ` section--centered--${data.variant}` : '')
  
  return html
}

/**
 * Build a single page
 */
async function buildPage(pageName) {
  try {
    const pagePath = join(projectRoot, `${pageName}.html`)
    
    // Read page HTML
    let html = await readFile(pagePath, 'utf-8')
    
    // Get page data
    const data = pageData[pageName]
    if (!data) {
      console.warn(`⚠ No data found for page: ${pageName}`)
      return null
    }
    
    // Load component templates
    const headerTemplate = await loadComponentTemplate('header')
    const footerTemplate = await loadComponentTemplate('footer')
    // Use home hero template for index, regular hero for other pages
    const heroTemplate = pageName === 'index' 
      ? await loadComponentTemplate('hero-home')
      : await loadComponentTemplate('hero')
    const bodyContentTemplate = await loadComponentTemplate('body-content')
    const ctaTemplate = await loadComponentTemplate('cta-section')
    
    // Inject header and footer (replace both empty tags and existing content)
    // Match header tag with any attributes and content, or empty header tag
    html = html.replace(/<header[^>]*>[\s\S]*?<\/header>/g, headerTemplate)
    html = html.replace(/<header><\/header>/g, headerTemplate)
    
    // Replace footer tag that's outside main (look for </main> followed by footer before </body>)
    const mainEndIndex = html.indexOf('</main>')
    if (mainEndIndex !== -1) {
      const afterMain = html.substring(mainEndIndex)
      // Match footer tag with any attributes and content, or empty footer tag
      const footerReplaced = afterMain.replace(/<footer[^>]*>[\s\S]*?<\/footer>/, footerTemplate)
      html = html.substring(0, mainEndIndex) + footerReplaced
    } else {
      // Fallback: replace any footer tag (with content or empty)
      html = html.replace(/<footer[^>]*>[\s\S]*?<\/footer>/g, footerTemplate)
      html = html.replace(/<footer><\/footer>/g, footerTemplate)
    }
    
    // Generate component HTML
    const heroHtml = data.hero ? await generateHero(heroTemplate, data.hero) : ''
    const bodyHtml = data.body ? generateBodyContent(bodyContentTemplate, data.body) : ''
    const ctaHtml = data.cta ? generateCTA(ctaTemplate, data.cta) : ''
    
    // Replace hero section (handle both placeholder and existing hero section)
    if (heroHtml) {
      // First try to replace placeholder
      html = html.replace(/\{\{hero\}\}/g, heroHtml)
      // Then replace existing hero section if placeholder wasn't found
      html = html.replace(/<!-- Hero Section[^>]*-->[\s\S]*?<section class="hero[^>]*>[\s\S]*?<\/section>/g, heroHtml)
      // Fallback: replace any hero section
      html = html.replace(/<section class="hero[^>]*>[\s\S]*?<\/section>/g, heroHtml)
    }
    
    // Replace placeholders in HTML
    html = html.replace(/\{\{body-content\}\}/g, bodyHtml)
    html = html.replace(/\{\{cta-section\}\}/g, ctaHtml)
    
    // Replace existing CTA section (handle both old cta-videos and new section--centered classes)
    if (ctaHtml) {
      // Replace old cta-videos class with comment
      html = html.replace(/<!-- CTA Section[^>]*-->[\s\S]*?<section class="cta-videos[^>]*>[\s\S]*?<\/section>/g, ctaHtml)
      // Replace old cta-videos class without comment (fallback)
      html = html.replace(/<section class="cta-videos[^>]*>[\s\S]*?<\/section>/g, ctaHtml)
      // Replace new section--centered class with comment
      html = html.replace(/<!-- CTA Section[^>]*-->[\s\S]*?<section class="section--centered[^>]*section--centered--large-text[^>]*>[\s\S]*?<\/section>/g, ctaHtml)
      // Replace new section--centered class without comment (fallback)
      html = html.replace(/<section class="section--centered[^>]*section--centered--large-text[^>]*>[\s\S]*?<\/section>/g, ctaHtml)
    }
    
    // Write updated HTML back to file
    await writeFile(pagePath, html, 'utf-8')
    
    return {
      pageName,
      success: true
    }
  } catch (error) {
    console.error(`Error building page ${pageName}:`, error)
    return {
      pageName,
      success: false,
      error: error.message
    }
  }
}

/**
 * Build all pages
 */
async function buildPages() {
  try {
    console.log('Building pages...')
    
    const results = []
    for (const pageName of pagesToBuild) {
      const result = await buildPage(pageName)
      if (result) {
        results.push(result)
        if (result.success) {
          console.log(`✓ Built: ${pageName}.html`)
        } else {
          console.error(`✗ Failed: ${pageName}.html - ${result.error}`)
        }
      }
    }
    
    const successCount = results.filter(r => r.success).length
    console.log(`\n✓ Built ${successCount}/${results.length} page(s)`)
    
    return results
  } catch (error) {
    console.error('Error building pages:', error)
    return []
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildPages()
}

export { buildPages }

