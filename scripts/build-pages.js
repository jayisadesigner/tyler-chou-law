/**
 * Pages Build Script
 * Injects global header and footer components into page HTML files
 * Simplified: Page content is hand-written in HTML files, not templated
 */

import { readFile, writeFile, readdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Paths
const componentsDir = join(projectRoot, 'src', 'components')
const pagesToBuild = ['index', 'about', 'services', 'contact', 'creatorarq', 'love-letters', 'roster', 'thank-you', 'press', 'speaking']
const rosterDir = join(projectRoot, 'roster')
const servicesDir = join(projectRoot, 'services')

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
async function buildPage(pageName, customPath = null) {
  try {
    const pagePath = customPath || join(projectRoot, `${pageName}.html`)
    
    // Read page HTML
    let html = await readFile(pagePath, 'utf-8')
    
    // Load global component templates
    const headerTemplate = await loadComponentTemplate('header')
    const footerTemplate = await loadComponentTemplate('footer')
    
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
    
    // Remove legacy standalone disclaimer sections (disclaimer now lives in footer)
    html = html.replace(/<section[^>]*class="[^"]*site-disclaimer[^"]*"[^>]*>[\s\S]*?<\/section>/gi, '')
    html = html.replace(/<section[^>]*class="[^"]*disclaimer[^"]*"[^>]*>[\s\S]*?<\/section>/gi, '')
    html = html.replace(/<section[^>]*class='[^']*site-disclaimer[^']*'[^>]*>[\s\S]*?<\/section>/gi, '')
    html = html.replace(/<section[^>]*class='[^']*disclaimer[^']*'[^>]*>[\s\S]*?<\/section>/gi, '')
    html = html.replace(/<!--\s*Disclaimer[^>]*-->/gi, '')
    
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
 * Build a roster page (same as buildPage but with roster path and CTA injection)
 */
async function buildRosterPage(fileName) {
  try {
    const pagePath = join(rosterDir, fileName)
    
    // First build the page normally
    const result = await buildPage(fileName.replace('.html', ''), pagePath)
    
    if (!result.success) {
      return result
    }
    
    // Read the built page
    let html = await readFile(pagePath, 'utf-8')
    
    // Load CTA component
    const ctaTemplate = await loadComponentTemplate('cta')
    
    // Remove any existing CTA sections (in case of rebuild)
    html = html.replace(/<section[^>]*class="[^"]*content-section[^"]*content-section--centered[^"]*content-section--full-height[^"]*content-section--large-text[^"]*"[^>]*>[\s\S]*?<\/section>/gi, '')
    
    // Insert CTA before </main> tag
    const mainEndIndex = html.indexOf('</main>')
    if (mainEndIndex !== -1) {
      html = html.substring(0, mainEndIndex) + '\n      ' + ctaTemplate + '\n    ' + html.substring(mainEndIndex)
    } else {
      // Fallback: insert before footer
      const footerIndex = html.indexOf('<footer')
      if (footerIndex !== -1) {
        html = html.substring(0, footerIndex) + ctaTemplate + '\n    ' + html.substring(footerIndex)
      }
    }
    
    // Write updated HTML back to file
    await writeFile(pagePath, html, 'utf-8')
    
    return result
  } catch (error) {
    console.error(`Error building roster page ${fileName}:`, error)
    return {
      pageName: fileName,
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
    // Build main pages
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

    try {
      const serviceFiles = await readdir(servicesDir)
      const serviceHtml = serviceFiles.filter((f) => f.endsWith('.html'))
      for (const file of serviceHtml) {
        const slug = file.replace(/\.html$/, '')
        const result = await buildPage(`services/${slug}`, join(servicesDir, file))
        if (result) {
          results.push(result)
          if (result.success) {
            console.log(`✓ Built: services/${file}`)
          } else {
            console.error(`✗ Failed: services/${file} - ${result.error}`)
          }
        }
      }
    } catch (error) {
      console.warn('Could not read services directory:', error.message)
    }
    
    // Build roster pages
    try {
      const rosterFiles = await readdir(rosterDir)
      const htmlFiles = rosterFiles.filter(f => f.endsWith('.html'))
      
      for (const fileName of htmlFiles) {
        const result = await buildRosterPage(fileName)
        if (result) {
          results.push(result)
          if (result.success) {
            console.log(`✓ Built: roster/${fileName}`)
          } else {
            console.error(`✗ Failed: roster/${fileName} - ${result.error}`)
          }
        }
      }
    } catch (error) {
      console.warn('Could not read roster directory:', error.message)
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

