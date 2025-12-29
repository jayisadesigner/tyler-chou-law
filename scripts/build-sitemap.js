/**
 * Sitemap Generator
 * Auto-generates sitemap.xml with all pages, creator pages, and blog posts
 */

import { readdir, readFile, writeFile, stat } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

const outputPath = join(projectRoot, 'public', 'sitemap.xml')
const distPath = join(projectRoot, 'dist')
const rosterPath = join(projectRoot, 'roster')
// Blog posts are in dist/love-letters/ after build:blog runs
const blogPostsPath = join(projectRoot, 'dist', 'love-letters')

const baseUrl = 'https://tylerchoulaw.com'

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date) {
  return date.toISOString().split('T')[0]
}

/**
 * Get file modification date
 */
async function getFileModDate(filePath) {
  try {
    const stats = await stat(filePath)
    return formatDate(stats.mtime)
  } catch (error) {
    // If file doesn't exist, return current date
    return formatDate(new Date())
  }
}

/**
 * Generate sitemap entry
 */
function generateSitemapEntry(url, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

/**
 * Build sitemap
 */
async function buildSitemap() {
  try {
    console.log('Building sitemap...')
    
    const entries = []
    
    // Static pages
    const staticPages = [
      { path: 'index.html', url: '/', changefreq: 'weekly', priority: '1.0' },
      { path: 'about.html', url: '/about.html', changefreq: 'monthly', priority: '0.8' },
      { path: 'roster.html', url: '/roster.html', changefreq: 'monthly', priority: '0.8' },
      { path: 'creatorarq.html', url: '/creatorarq.html', changefreq: 'monthly', priority: '0.9' },
      { path: 'creatorarq-apply.html', url: '/creatorarq-apply.html', changefreq: 'monthly', priority: '0.7' },
      { path: 'services.html', url: '/services.html', changefreq: 'monthly', priority: '0.9' },
      { path: 'love-letters.html', url: '/love-letters.html', changefreq: 'weekly', priority: '0.8' },
      { path: 'contact.html', url: '/contact.html', changefreq: 'monthly', priority: '0.7' },
    ]
    
    for (const page of staticPages) {
      const filePath = join(projectRoot, page.path)
      const lastmod = await getFileModDate(filePath)
      entries.push({
        url: `${baseUrl}${page.url}`,
        lastmod,
        changefreq: page.changefreq,
        priority: page.priority
      })
    }
    
    // Creator pages
    try {
      const creatorFiles = await readdir(rosterPath)
      const htmlFiles = creatorFiles.filter(f => f.endsWith('.html'))
      
      for (const file of htmlFiles) {
        const filePath = join(rosterPath, file)
        const lastmod = await getFileModDate(filePath)
        const creatorSlug = file.replace('.html', '')
        entries.push({
          url: `${baseUrl}/roster/${file}`,
          lastmod,
          changefreq: 'monthly',
          priority: '0.7'
        })
      }
    } catch (error) {
      console.warn('Could not read creator pages directory:', error.message)
    }
    
    // Blog posts
    try {
      const blogFiles = await readdir(blogPostsPath)
      const htmlFiles = blogFiles.filter(f => f.endsWith('.html'))
      
      for (const file of htmlFiles) {
        const filePath = join(blogPostsPath, file)
        const lastmod = await getFileModDate(filePath)
        const postSlug = file.replace('.html', '')
        entries.push({
          url: `${baseUrl}/love-letters/${file}`,
          lastmod,
          changefreq: 'monthly',
          priority: '0.9'
        })
      }
    } catch (error) {
      console.warn('Could not read blog posts directory:', error.message)
    }
    
    // Generate XML
    const xmlEntries = entries.map(entry => 
      generateSitemapEntry(entry.url, entry.lastmod, entry.changefreq, entry.priority)
    ).join('\n')
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`
    
    // Write sitemap
    await writeFile(outputPath, sitemap, 'utf-8')
    
    console.log(`✓ Generated sitemap with ${entries.length} entries`)
    return entries.length
  } catch (error) {
    console.error('Error building sitemap:', error)
    throw error
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildSitemap()
}

export { buildSitemap }

