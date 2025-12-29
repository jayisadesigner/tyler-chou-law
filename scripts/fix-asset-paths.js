/**
 * Fix Asset Paths Script
 * Post-processes generated blog posts after Vite build
 * to replace /src/ paths with actual Vite-generated asset paths
 * Note: Roster pages are handled by Vite directly as static entry points
 */

import { readdir, readFile, writeFile, stat } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
const distDir = join(projectRoot, 'dist')
const distAssetsDir = join(distDir, 'assets')

/**
 * Find Vite-generated asset files
 */
async function findViteAssets() {
  try {
    const files = await readdir(distAssetsDir)
    
    // Find main.js (entry point)
    const mainJs = files.find(f => f.startsWith('main-') && f.endsWith('.js'))
    const mainCss = files.find(f => f.startsWith('main-') && f.endsWith('.css'))
    
    // Find other JS chunks (if any)
    const jsFiles = files.filter(f => f.endsWith('.js') && !f.includes('polyfill'))
    const cssFiles = files.filter(f => f.endsWith('.css'))
    
    return {
      mainJs: mainJs ? `/assets/${mainJs}` : null,
      mainCss: mainCss ? `/assets/${mainCss}` : null,
      jsFiles: jsFiles.map(f => `/assets/${f}`),
      cssFiles: cssFiles.map(f => `/assets/${f}`)
    }
  } catch (error) {
    console.error('Error finding Vite assets:', error)
    return { mainJs: null, mainCss: null, jsFiles: [], cssFiles: [] }
  }
}

/**
 * Fix asset paths in a single HTML file
 */
async function fixAssetPathsInFile(filePath, assets) {
  try {
    let html = await readFile(filePath, 'utf-8')
    let modified = false
    
    // Replace /assets/main.js with actual Vite-generated path
    // Handles: <script type="module" src="/assets/main.js"></script>
    // (build-blog.js already converts /src/scripts/main.js to /assets/main.js)
    if (assets.mainJs && html.includes('/assets/main.js')) {
      html = html.replace(/src="\/assets\/main\.js"/g, `src="${assets.mainJs}"`)
      modified = true
    }
    
    // Also handle legacy /src/ paths if any remain
    if (assets.mainJs && html.includes('/src/scripts/main.js')) {
      html = html.replace(/src="\/src\/scripts\/main\.js"/g, `src="${assets.mainJs}"`)
      modified = true
    }
    
    // Replace /assets/main.css with actual Vite-generated path (if needed)
    if (assets.mainCss && html.includes('/assets/main.css')) {
      html = html.replace(/href="\/assets\/main\.css"/g, `href="${assets.mainCss}"`)
      modified = true
    }
    
    // Also handle legacy /src/styles/main.css if any remain
    if (assets.mainCss && html.includes('/src/styles/main.css')) {
      html = html.replace(/href="\/src\/styles\/main\.css"/g, `href="${assets.mainCss}"`)
      modified = true
    }
    
    if (modified) {
      await writeFile(filePath, html)
      return true
    }
    
    return false
  } catch (error) {
    console.error(`Error fixing paths in ${filePath}:`, error)
    return false
  }
}

/**
 * Fix blog posts
 */
async function fixBlogPosts(assets) {
  try {
    const blogDir = join(distDir, 'love-letters')
    
    // Check if blog directory exists
    try {
      await stat(blogDir)
    } catch {
      console.log('No love-letters directory in dist, skipping blog posts')
      return 0
    }
    
    const files = await readdir(blogDir)
    const htmlFiles = files.filter(f => f.endsWith('.html'))
    
    let fixed = 0
    for (const file of htmlFiles) {
      const filePath = join(blogDir, file)
      if (await fixAssetPathsInFile(filePath, assets)) {
        fixed++
      }
    }
    
    return fixed
  } catch (error) {
    console.error('Error fixing blog posts:', error)
    return 0
  }
}

/**
 * Main function
 */
async function fixAssetPaths() {
  try {
    console.log('Fixing asset paths in generated pages...')
    
    // Check if dist directory exists
    try {
      await stat(distDir)
    } catch {
      console.error('dist directory not found. Run vite build first.')
      return
    }
    
    // Check if assets directory exists
    try {
      await stat(distAssetsDir)
    } catch {
      console.error('dist/assets directory not found. Vite build may have failed.')
      return
    }
    
    // Find Vite-generated assets
    const assets = await findViteAssets()
    
    if (!assets.mainJs) {
      console.warn('⚠ Could not find main.js in dist/assets. Asset paths may not be updated.')
    } else {
      console.log(`Found main.js: ${assets.mainJs}`)
    }
    
    // Fix blog posts (roster pages are handled by Vite directly)
    const blogPostsFixed = await fixBlogPosts(assets)
    
    console.log(`✓ Fixed ${blogPostsFixed} blog post(s)`)
    console.log('\n✓ Asset paths fixed')
  } catch (error) {
    console.error('Error fixing asset paths:', error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixAssetPaths()
}

export { fixAssetPaths }

