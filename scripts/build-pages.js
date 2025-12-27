/**
 * Pages Build Script
 * Injects global header and footer components into page HTML files
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
    
    // Replace header (match any header tag with or without content)
    html = html.replace(/<header[^>]*>[\s\S]*?<\/header>/g, headerTemplate)
    
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

