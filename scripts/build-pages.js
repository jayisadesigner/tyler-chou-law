/**
 * Pages Build Script
 * Injects global header, footer, and disclaimer components into page HTML files
 * Simplified: Page content is hand-written in HTML files, not templated
 */

import { readFile, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Paths
const componentsDir = join(projectRoot, 'src', 'components')
const pagesToBuild = ['index', 'about', 'services', 'contact', 'creatorarq', 'love-letters', 'roster']

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
 * Build a single page
 * Injects header and footer templates into the page HTML
 */
async function buildPage(pageName) {
  try {
    const pagePath = join(projectRoot, `${pageName}.html`)
    
    // Read page HTML
    let html = await readFile(pagePath, 'utf-8')
    
    // Load global component templates
    const headerTemplate = await loadComponentTemplate('header')
    const footerTemplate = await loadComponentTemplate('footer')
    const disclaimerTemplate = await loadComponentTemplate('disclaimer')
    
    // Extract curtain from header template (everything before <header> tag)
    const curtainMatch = headerTemplate.match(/^([\s\S]*?)(<header)/)
    const curtainHtml = curtainMatch ? curtainMatch[1].trim() : ''
    const headerOnly = headerTemplate.replace(/^[\s\S]*?(<header)/, '$1')
    
    // Remove any existing curtain divs
    html = html.replace(/<div[^>]*class="[^"]*curtain[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    html = html.replace(/<!--\s*Page Load Curtain[^>]*-->[\s\S]*?<\/div>/gi, '')
    
    // Insert curtain before header (or before body content if no header)
    if (curtainHtml) {
      const headerIndex = html.indexOf('<header')
      if (headerIndex !== -1) {
        html = html.substring(0, headerIndex) + curtainHtml + '\n' + html.substring(headerIndex)
      } else {
        // Fallback: insert after <body> tag
        const bodyIndex = html.indexOf('<body')
        if (bodyIndex !== -1) {
          const bodyTagEnd = html.indexOf('>', bodyIndex) + 1
          html = html.substring(0, bodyTagEnd) + '\n' + curtainHtml + html.substring(bodyTagEnd)
        }
      }
    }
    
    // Replace header (match any header tag with or without content)
    html = html.replace(/<header[^>]*>[\s\S]*?<\/header>/g, headerOnly)
    
    // Replace footer (match any footer tag with or without content)
    // Prefer footer after </main> if found
    const mainEndIndex = html.indexOf('</main>')
    if (mainEndIndex !== -1) {
      const afterMain = html.substring(mainEndIndex)
      const footerReplaced = afterMain.replace(/<footer[^>]*>[\s\S]*?<\/footer>/, footerTemplate)
      html = html.substring(0, mainEndIndex) + footerReplaced
    } else {
      // Fallback: replace any footer tag
      html = html.replace(/<footer[^>]*>[\s\S]*?<\/footer>/g, footerTemplate)
    }
    
    // Remove all existing disclaimer sections (both site-disclaimer and disclaimer classes)
    // Match sections with class containing disclaimer (with or without quotes, any order)
    html = html.replace(/<section[^>]*class="[^"]*site-disclaimer[^"]*"[^>]*>[\s\S]*?<\/section>/gi, '')
    html = html.replace(/<section[^>]*class="[^"]*disclaimer[^"]*"[^>]*>[\s\S]*?<\/section>/gi, '')
    // Also match sections with class='disclaimer' (single quotes)
    html = html.replace(/<section[^>]*class='[^']*site-disclaimer[^']*'[^>]*>[\s\S]*?<\/section>/gi, '')
    html = html.replace(/<section[^>]*class='[^']*disclaimer[^']*'[^>]*>[\s\S]*?<\/section>/gi, '')
    // Remove any remaining disclaimer-related comments
    html = html.replace(/<!--\s*Disclaimer[^>]*-->/gi, '')
    
    // Add disclaimer after footer (or before </body> if no footer found)
    // First, try to find footer closing tag
    const footerEndIndex = html.lastIndexOf('</footer>')
    if (footerEndIndex !== -1) {
      // Insert disclaimer after footer
      html = html.substring(0, footerEndIndex + 9) + '\n' + disclaimerTemplate + html.substring(footerEndIndex + 9)
    } else {
      // Fallback: insert before </body>
      const bodyEndIndex = html.lastIndexOf('</body>')
      if (bodyEndIndex !== -1) {
        html = html.substring(0, bodyEndIndex) + disclaimerTemplate + '\n' + html.substring(bodyEndIndex)
      } else {
        // Last resort: append to end
        html = html + '\n' + disclaimerTemplate
      }
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

