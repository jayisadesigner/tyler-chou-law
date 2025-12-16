/**
 * Blog Build Script
 * Pre-renders markdown blog posts to HTML at build time
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { marked } from 'marked'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

const contentDir = join(projectRoot, 'content', 'blog')
const outputDir = join(projectRoot, 'dist', 'love-letters')
const templatePath = join(projectRoot, 'src', 'templates', 'blog-post.html')

/**
 * Calculate reading time from word count
 */
function calculateReadingTime(content) {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
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
 * Build a single blog post
 */
async function buildPost(filePath, fileName) {
  try {
    const content = await readFile(filePath, 'utf-8')
    const { metadata, body } = parseFrontmatter(content)
    
    // Generate slug
    const slug = metadata.slug || slugify(metadata.title || fileName.replace('.md', ''))
    
    // Convert markdown to HTML
    const htmlContent = marked(body)
    
    // Calculate reading time
    const readingTime = calculateReadingTime(body)
    
    // Read template (create basic template if it doesn't exist)
    let template
    try {
      template = await readFile(templatePath, 'utf-8')
    } catch (error) {
      // Create a basic template if it doesn't exist
      template = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{title}} | Tyler Chou</title>
    <meta name="description" content="{{excerpt}}" />
    <link rel="stylesheet" href="/src/styles/main.css" />
  </head>
  <body>
    <header></header>
    <main id="main-content">
      <article class="blog-post">
        <header class="blog-post-header">
          <h1>{{title}}</h1>
          <div class="blog-post-meta">
            <span class="author">By {{author}}</span>
            <span class="date">{{date}}</span>
            <span class="reading-time">{{readingTime}} min read</span>
          </div>
          <div class="blog-post-tags">{{tags}}</div>
        </header>
        <div class="blog-post-content">{{content}}</div>
        <footer class="blog-post-footer">
          <a href="/contact.html" class="cta-button">Get in Touch</a>
        </footer>
      </article>
    </main>
    <footer></footer>
    <script type="module" src="/src/scripts/main.js"></script>
  </body>
</html>`
    }
    
    // Replace template variables
    template = template
      .replace(/\{\{title\}\}/g, metadata.title || 'Untitled')
      .replace(/\{\{author\}\}/g, metadata.author || 'Tyler Chou')
      .replace(/\{\{date\}\}/g, metadata.date ? new Date(metadata.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : '')
      .replace(/\{\{readingTime\}\}/g, readingTime.toString())
      .replace(/\{\{content\}\}/g, htmlContent)
      .replace(/\{\{excerpt\}\}/g, metadata.excerpt || '')
      .replace(/\{\{tags\}\}/g, metadata.tags ? metadata.tags.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('') : '')
    
    // Create output directory
    const postOutputDir = join(outputDir, slug)
    await mkdir(postOutputDir, { recursive: true })
    
    // Write HTML file
    await writeFile(join(postOutputDir, 'index.html'), template)
    
    return {
      slug,
      title: metadata.title,
      date: metadata.date,
      excerpt: metadata.excerpt,
      author: metadata.author || 'Tyler Chou',
      readingTime,
      tags: metadata.tags ? metadata.tags.split(',').map(t => t.trim()) : [],
    }
  } catch (error) {
    console.error(`Error building post ${fileName}:`, error)
    return null
  }
}

/**
 * Build all blog posts
 */
async function buildBlog() {
  try {
    console.log('Building blog posts...')
    
    // Ensure template exists
    try {
      await readFile(templatePath, 'utf-8')
    } catch (error) {
      console.warn(`Template not found at ${templatePath}, creating basic template...`)
      // Template will be created later, continue for now
    }
    
    // Read all markdown files
    const files = await readdir(contentDir)
    const markdownFiles = files.filter(f => f.endsWith('.md'))
    
    if (markdownFiles.length === 0) {
      console.log('No blog posts found in content/blog/')
      return []
    }
    
    // Build all posts
    const posts = []
    for (const file of markdownFiles) {
      const filePath = join(contentDir, file)
      const post = await buildPost(filePath, file)
      if (post) {
        posts.push(post)
        console.log(`✓ Built: ${post.title}`)
      }
    }
    
    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    console.log(`\n✓ Built ${posts.length} blog post(s)`)
    return posts
  } catch (error) {
    console.error('Error building blog:', error)
    return []
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildBlog()
}

export { buildBlog }

