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
function generateHero(template, data) {
  if (!data) return ''
  
  let html = template
    .replace(/\{\{headline\}\}/g, data.headline || '')
    .replace(/\{\{variant-class\}\}/g, data.variant && data.variant !== 'default' ? ` hero--${data.variant}` : '')
  
  // Handle subheadline
  if (data.subheadline) {
    html = html.replace(/\{\{subheadline\}\}/g, `<p class="hero-subheadline">${data.subheadline}</p>`)
  } else {
    html = html.replace(/\{\{subheadline\}\}/g, '')
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
    .replace(/\{\{variant-class\}\}/g, data.variant && data.variant !== 'default' ? ` cta-videos--${data.variant}` : '')
  
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
    const heroTemplate = await loadComponentTemplate('hero')
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
    const heroHtml = data.hero ? generateHero(heroTemplate, data.hero) : ''
    const bodyHtml = data.body ? generateBodyContent(bodyContentTemplate, data.body) : ''
    const ctaHtml = data.cta ? generateCTA(ctaTemplate, data.cta) : ''
    
    // Replace placeholders in HTML
    html = html.replace(/\{\{hero\}\}/g, heroHtml)
    html = html.replace(/\{\{body-content\}\}/g, bodyHtml)
    html = html.replace(/\{\{cta-section\}\}/g, ctaHtml)
    
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

