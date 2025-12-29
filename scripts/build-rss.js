/**
 * RSS Feed Generator
 * Generates RSS feed.xml with full blog post content
 */

import { readdir, readFile, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { marked } from 'marked'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

const contentDir = join(projectRoot, 'content', 'blog')
const outputPath = join(projectRoot, 'public', 'feed.xml')

const baseUrl = 'https://tylerchoulaw.com'
const siteTitle = 'Love Letters to Creators'
const siteDescription = 'Thought leadership on creator legal issues, business strategy, and the creator economy. Written by entertainment attorney Tyler Chou.'

/**
 * Parse frontmatter from markdown
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)
  
  if (!match) {
    return { metadata: {}, body: content }
  }
  
  const frontmatter = match[1]
  const body = match[2]
  const metadata = {}
  
  frontmatter.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':')
    if (colonIndex > -1) {
      const key = line.slice(0, colonIndex).trim()
      let value = line.slice(colonIndex + 1).trim()
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      
      metadata[key] = value
    }
  })
  
  return { metadata, body }
}

/**
 * Generate slug from title
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Escape XML entities
 */
function escapeXML(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Format date as RFC 822 (RSS standard)
 */
function formatRSSDate(dateString) {
  if (!dateString) return new Date().toUTCString()
  return new Date(dateString).toUTCString()
}

/**
 * Build RSS feed
 */
async function buildRSS() {
  try {
    console.log('Building RSS feed...')
    
    // Read all markdown files
    const files = await readdir(contentDir)
    const markdownFiles = files.filter(f => f.endsWith('.md'))
    
    if (markdownFiles.length === 0) {
      console.log('No blog posts found for RSS feed')
      return
    }
    
    // Parse all posts
    const posts = []
    for (const file of markdownFiles) {
      const filePath = join(contentDir, file)
      const content = await readFile(filePath, 'utf-8')
      const { metadata, body } = parseFrontmatter(content)
      
      const slug = metadata.slug || slugify(metadata.title || file.replace('.md', ''))
      const htmlContent = marked(body)
      
      posts.push({
        title: metadata.title || 'Untitled',
        slug,
        date: metadata.date,
        author: metadata.author || 'Tyler Chou',
        excerpt: metadata.excerpt || '',
        content: htmlContent,
        url: `${baseUrl}/love-letters/${slug}.html`
      })
    }
    
    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    // Generate RSS items
    const items = posts.map(post => {
      const pubDate = formatRSSDate(post.date)
      const description = post.excerpt || post.content.substring(0, 500) + '...'
      
      return `    <item>
      <title>${escapeXML(post.title)}</title>
      <link>${post.url}</link>
      <guid isPermaLink="true">${post.url}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXML(post.author)}</author>
      <description>${escapeXML(description)}</description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
    </item>`
    }).join('\n')
    
    // Generate RSS XML
    const buildDate = new Date().toUTCString()
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXML(siteTitle)}</title>
    <link>${baseUrl}/love-letters.html</link>
    <description>${escapeXML(siteDescription)}</description>
    <language>en-US</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <generator>Tyler Chou Law Build System</generator>
${items}
  </channel>
</rss>`
    
    // Write RSS feed
    await writeFile(outputPath, rss, 'utf-8')
    
    console.log(`✓ Generated RSS feed with ${posts.length} posts`)
    return posts.length
  } catch (error) {
    console.error('Error building RSS feed:', error)
    throw error
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildRSS()
}

export { buildRSS }

