/**
 * Blog Build Script
 * Pre-renders markdown blog posts to HTML at build time
 * Generates listing page with all posts
 */

import { readdir, readFile, writeFile, mkdir, stat } from 'fs/promises'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'
import { marked } from 'marked'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

const contentDir = join(projectRoot, 'content', 'blog')
// Generate to dist directory after Vite build
const outputDir = join(projectRoot, 'dist', 'love-letters')
const listingPagePath = join(projectRoot, 'love-letters.html')
const templatePath = join(projectRoot, 'src', 'templates', 'blog-post.html')
const componentsDir = join(projectRoot, 'src', 'components')

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
 * Get Vite-generated asset filenames
 */
async function getViteAssets() {
  try {
    const assetsDir = join(projectRoot, 'dist', 'assets')
    
    // Check if dist/assets directory exists
    try {
      await stat(assetsDir)
    } catch {
      throw new Error('dist/assets directory not found. Run vite build first.')
    }
    
    const files = await readdir(assetsDir)
    
    const mainJs = files.find(f => f.startsWith('main-') && f.endsWith('.js'))
    const mainCss = files.find(f => f.startsWith('main-') && f.endsWith('.css'))
    
    return {
      mainJs: mainJs ? `/assets/${mainJs}` : null,
      mainCss: mainCss ? `/assets/${mainCss}` : null
    }
  } catch (error) {
    console.error('Error getting Vite assets:', error)
    throw error
  }
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
      
      // Handle YAML arrays (e.g., ["item1", "item2"])
      if (value.startsWith('[') && value.endsWith(']')) {
        // Extract array elements, removing brackets and quotes
        const arrayContent = value.slice(1, -1) // Remove [ and ]
        const items = arrayContent.split(',').map(item => {
          const trimmed = item.trim()
          // Remove quotes from each item
          if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
              (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            return trimmed.slice(1, -1)
          }
          return trimmed
        })
        metadata[key] = items
      } else {
        // Remove quotes if present (for string values)
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        metadata[key] = value
      }
    }
  })
  
  return { metadata, body }
}

/**
 * Resolve featured image path
 * CMS stores in src/assets/images/blog/, public path is /assets/images/blog/
 */
function resolveFeaturedImage(featuredImage) {
  if (!featuredImage) return null
  
  // If it's already a full URL, return as is
  if (featuredImage.startsWith('http://') || featuredImage.startsWith('https://')) {
    return featuredImage
  }
  
  // If it starts with /, assume it's already a public path
  if (featuredImage.startsWith('/')) {
    return `https://tylerchoulaw.com${featuredImage}`
  }
  
  // Extract filename from path (CMS might store full path or just filename)
  const filename = basename(featuredImage)
  return `https://tylerchoulaw.com/assets/images/blog/${filename}`
}

/**
 * Generate featured image meta tags
 */
function generateFeaturedImageMeta(featuredImage) {
  if (!featuredImage) {
    return {
      ogImage: '',
      twitterImage: '',
      schemaImage: ''
    }
  }
  
  const imageUrl = resolveFeaturedImage(featuredImage)
  
  return {
    ogImage: `<meta property="og:image" content="${imageUrl}" />`,
    twitterImage: `<meta name="twitter:image" content="${imageUrl}" />`,
    schemaImage: `"image": {
        "@type": "ImageObject",
        "url": "${imageUrl}"
      },`
  }
}

/**
 * Generate tags HTML
 */
function generateTagsHTML(tags) {
  if (!tags || tags.length === 0) {
    return ''
  }
  
  let tagArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())
  
  // Clean up tags: remove brackets, quotes, and extra whitespace
  tagArray = tagArray.map(tag => {
    let cleaned = tag.trim()
    // Remove brackets if present
    cleaned = cleaned.replace(/^\[|\]$/g, '')
    // Remove quotes if present
    cleaned = cleaned.replace(/^["']|["']$/g, '')
    return cleaned.trim()
  }).filter(tag => tag.length > 0) // Remove empty tags
  
  return `
            <div class="blog-post-tags">
              ${tagArray.map(tag => `<span class="blog-post-tag">${tag}</span>`).join('')}
            </div>`
}

/**
 * Generate featured image hero section
 */
function generateFeaturedImageHero(featuredImage) {
  if (!featuredImage) {
    return ''
  }
  
  const imageUrl = resolveFeaturedImage(featuredImage)
  
  return `
        <div class="blog-post-hero-image">
          <div class="container-wide">
            <img 
              src="${imageUrl.replace('https://tylerchoulaw.com', '')}" 
              alt="{{title}}" 
              class="blog-post-hero-image__img"
              loading="eager"
              fetchpriority="high"
            />
          </div>
        </div>`
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

/**
 * Format date as ISO 8601
 */
function formatDateISO(dateString) {
  if (!dateString) return new Date().toISOString()
  return new Date(dateString).toISOString()
}

/**
 * Escape JSON for schema
 */
function escapeJSON(str) {
  if (!str) return ''
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}

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
    
    // Read template
    let template = await readFile(templatePath, 'utf-8')
    
    // Load global component templates
    const headerTemplate = await loadComponentTemplate('header')
    const footerTemplate = await loadComponentTemplate('footer')
    const disclaimerTemplate = await loadComponentTemplate('disclaimer')
    
    // Handle featured image
    const featuredImage = metadata.featured_image || null
    const imageMeta = generateFeaturedImageMeta(featuredImage)
    const featuredImageHero = generateFeaturedImageHero(featuredImage)
    
    // Format dates
    const dateDisplay = formatDate(metadata.date)
    const dateISO = formatDateISO(metadata.date)
    const datePublished = formatDateISO(metadata.date)
    const dateModified = formatDateISO(metadata.date) // Could use file mtime in future
    
    // Generate tags HTML
    const tagsHTML = generateTagsHTML(metadata.tags)
    
    // Escape content for JSON schema
    const articleBody = escapeJSON(body.substring(0, 5000)) // Limit for schema
    
    // Get Vite-generated asset paths first (needed for template replacements)
    const viteAssets = await getViteAssets()
    
    // Replace template variables
    template = template
      .replace(/\{\{title\}\}/g, metadata.title || 'Untitled')
      .replace(/\{\{slug\}\}/g, slug)
      .replace(/\{\{author\}\}/g, metadata.author || 'Tyler Chou')
      .replace(/\{\{date\}\}/g, dateDisplay)
      .replace(/\{\{dateISO\}\}/g, dateISO)
      .replace(/\{\{datePublished\}\}/g, datePublished)
      .replace(/\{\{dateModified\}\}/g, dateModified)
      .replace(/\{\{readingTime\}\}/g, readingTime.toString())
      .replace(/\{\{content\}\}/g, htmlContent)
      .replace(/\{\{excerpt\}\}/g, metadata.excerpt || '')
      .replace(/\{\{tagsHTML\}\}/g, tagsHTML)
      .replace(/\{\{featuredImageHero\}\}/g, featuredImageHero)
      .replace(/\{\{ogImage\}\}/g, imageMeta.ogImage)
      .replace(/\{\{twitterImage\}\}/g, imageMeta.twitterImage)
      .replace(/\{\{featuredImageSchema\}\}/g, imageMeta.schemaImage)
      .replace(/\{\{articleBody\}\}/g, articleBody)
      .replace(/\{\{mainCss\}\}/g, viteAssets.mainCss || '')
    
    // Replace header and footer placeholders
    template = template.replace(/<header[^>]*>[\s\S]*?<\/header>/g, headerTemplate)
    template = template.replace(/<footer[^>]*>[\s\S]*?<\/footer>/g, footerTemplate)
    
    // Remove all existing disclaimer sections
    template = template.replace(/<section[^>]*class="[^"]*site-disclaimer[^"]*"[^>]*>[\s\S]*?<\/section>/gi, '')
    template = template.replace(/<section[^>]*class="[^"]*disclaimer[^"]*"[^>]*>[\s\S]*?<\/section>/gi, '')
    template = template.replace(/<section[^>]*class='[^']*site-disclaimer[^']*'[^>]*>[\s\S]*?<\/section>/gi, '')
    template = template.replace(/<section[^>]*class='[^']*disclaimer[^']*'[^>]*>[\s\S]*?<\/section>/gi, '')
    template = template.replace(/<!--\s*Disclaimer[^>]*-->/gi, '')
    
    // Add disclaimer after footer
    const footerEndIndex = template.lastIndexOf('</footer>')
    if (footerEndIndex !== -1) {
      template = template.substring(0, footerEndIndex + 9) + '\n    ' + disclaimerTemplate + template.substring(footerEndIndex + 9)
    } else {
      const bodyEndIndex = template.lastIndexOf('</body>')
      if (bodyEndIndex !== -1) {
        template = template.substring(0, bodyEndIndex) + '    ' + disclaimerTemplate + '\n' + template.substring(bodyEndIndex)
      }
    }
    
    // Replace /src/scripts/main.js with actual Vite-generated JS path
    if (viteAssets.mainJs) {
      template = template.replace(/src="\/src\/scripts\/main\.js"/g, `src="${viteAssets.mainJs}"`)
    }
    
    // Create output directory
    await mkdir(outputDir, { recursive: true })
    
    // Write HTML file with correct Vite-generated asset paths
    await writeFile(join(outputDir, `${slug}.html`), template)
    
    return {
      slug,
      title: metadata.title,
      date: metadata.date,
      dateISO,
      excerpt: metadata.excerpt,
      author: metadata.author || 'Tyler Chou',
      readingTime,
      tags: metadata.tags ? (Array.isArray(metadata.tags) ? metadata.tags : metadata.tags.split(',').map(t => t.trim())) : [],
      featuredImage: featuredImage ? resolveFeaturedImage(featuredImage) : null,
    }
  } catch (error) {
    console.error(`Error building post ${fileName}:`, error)
    return null
  }
}

/**
 * Generate listing page HTML
 */
async function generateListingPage(posts) {
  try {
    console.log(`\ngenerateListingPage called with ${posts.length} post(s)`)
    
    // Read existing love-letters.html as base
    let listingHTML = await readFile(listingPagePath, 'utf-8')
    
    // Load components
    const headerTemplate = await loadComponentTemplate('header')
    const footerTemplate = await loadComponentTemplate('footer')
    const disclaimerTemplate = await loadComponentTemplate('disclaimer')
    
    // Generate blog post cards HTML
    console.log(`Generating HTML for ${posts.length} post(s)`)
    const postsHTML = posts.map((post, index) => {
      const dateDisplay = formatDate(post.date)
      const loveLetterNumber = posts.length - index
      const featuredImageHTML = post.featuredImage 
        ? `<img src="${post.featuredImage.replace('https://tylerchoulaw.com', '')}" alt="${post.title}" class="blog-card__image" loading="lazy" />`
        : ''
      
      return `
        <article class="blog-card">
          <a href="/love-letters/${post.slug}.html" class="blog-card__link">
            ${featuredImageHTML ? `<div class="blog-card__image-wrapper">${featuredImageHTML}</div>` : ''}
            <div class="blog-card__content">
              <h3 class="blog-card__title">${post.title}</h3>
              <p class="blog-card__excerpt">${post.excerpt || ''}</p>
              <div class="blog-card__meta">
                <span class="blog-card__love-letter-number">Love Letter #${loveLetterNumber}</span>
                <time datetime="${post.dateISO}">${dateDisplay}</time>
                <span class="blog-card__reading-time">${post.readingTime} min read</span>
              </div>
            </div>
          </a>
        </article>`
    }).join('')
    
    // Generate Blog schema with blogPost items
    const blogPostItems = posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "url": `https://tylerchoulaw.com/love-letters/${post.slug}.html`,
      "datePublished": post.dateISO,
      "author": {
        "@type": "Person",
        "name": post.author
      }
    }))
    
    const blogSchema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Love Letters to Creators",
      "description": "Thought leadership on creator legal issues, business strategy, and the creator economy",
      "url": "https://tylerchoulaw.com/love-letters.html",
      "author": {
        "@type": "Person",
        "name": "Tyler Chou"
      },
      "blogPost": blogPostItems
    }, null, 2)
    
    // Find the placeholder content section and replace with blog listing
    const contentSectionRegex = /<!--\s*Body Content[^>]*-->[\s\S]*?<!--\s*Content Section: Love Letters Intro[^>]*-->/
    // Also try to replace existing blog listing section if placeholder doesn't exist
    // Use dotall flag (s) to match across newlines
    const existingListingRegex = /<!--\s*Blog Listing Section[^>]*-->[\s\S]*?<section class="blog-listing[^>]*>[\s\S]*?<\/section>/s
    // Fallback regex to find section by class only
    const fallbackListingRegex = /<section class="blog-listing[^>]*>[\s\S]*?<\/section>/s
    const listingSection = `
      <!-- Blog Listing Section -->
      <section class="blog-listing section section-reveal">
        <div class="container">
          <div class="blog-listing__posts">
            ${postsHTML}
          </div>
        </div>
      </section>`
    
    // Try placeholder first, then existing section, then fallback
    let replaced = false
    if (contentSectionRegex.test(listingHTML)) {
      listingHTML = listingHTML.replace(contentSectionRegex, listingSection)
      replaced = true
      console.log('✓ Replaced blog listing using contentSectionRegex')
    } else if (existingListingRegex.test(listingHTML)) {
      listingHTML = listingHTML.replace(existingListingRegex, listingSection)
      replaced = true
      console.log('✓ Replaced blog listing using existingListingRegex')
    } else if (fallbackListingRegex.test(listingHTML)) {
      // Remove the comment from listingSection for fallback
      const fallbackSection = listingSection.replace(/<!--\s*Blog Listing Section[^>]*-->\s*/g, '')
      listingHTML = listingHTML.replace(fallbackListingRegex, fallbackSection)
      replaced = true
      console.log('✓ Replaced blog listing using fallbackListingRegex')
    }
    
    if (!replaced) {
      console.error('⚠ Warning: Could not find blog listing section to replace')
    }
    
    // Update Blog schema in head
    const existingSchemaRegex = /<script type="application\/ld\+json">[\s\S]*?<\/script>/
    const newSchema = `<script type="application/ld+json">\n    ${blogSchema}\n    </script>`
    listingHTML = listingHTML.replace(existingSchemaRegex, (match) => {
      // Only replace the Blog schema, not other schemas
      if (match.includes('"@type": "Blog"')) {
        return newSchema
      }
      return match
    })
    
    // Replace header and footer
    listingHTML = listingHTML.replace(/<header[^>]*>[\s\S]*?<\/header>/g, headerTemplate)
    listingHTML = listingHTML.replace(/<footer[^>]*>[\s\S]*?<\/footer>/g, footerTemplate)
    
    // Remove existing disclaimer sections
    listingHTML = listingHTML.replace(/<section[^>]*class="[^"]*site-disclaimer[^"]*"[^>]*>[\s\S]*?<\/section>/gi, '')
    listingHTML = listingHTML.replace(/<section[^>]*class="[^"]*disclaimer[^"]*"[^>]*>[\s\S]*?<\/section>/gi, '')
    listingHTML = listingHTML.replace(/<section[^>]*class='[^']*site-disclaimer[^']*'[^>]*>[\s\S]*?<\/section>/gi, '')
    listingHTML = listingHTML.replace(/<section[^>]*class='[^']*disclaimer[^']*'[^>]*>[\s\S]*?<\/section>/gi, '')
    listingHTML = listingHTML.replace(/<!--\s*Disclaimer[^>]*-->/gi, '')
    
    // Add disclaimer after footer
    const footerEndIndex = listingHTML.lastIndexOf('</footer>')
    if (footerEndIndex !== -1) {
      listingHTML = listingHTML.substring(0, footerEndIndex + 9) + '\n    ' + disclaimerTemplate + listingHTML.substring(footerEndIndex + 9)
    }
    
    // Write updated listing page
    await writeFile(listingPagePath, listingHTML, 'utf-8')
    
    console.log('✓ Generated listing page: love-letters.html')
  } catch (error) {
    console.error('Error generating listing page:', error)
    throw error
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
      console.error(`Template not found at ${templatePath}`)
      throw error
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
    console.log(`Found ${markdownFiles.length} markdown file(s)`)
    for (const file of markdownFiles) {
      const filePath = join(contentDir, file)
      console.log(`Processing: ${file}`)
      try {
        const post = await buildPost(filePath, file)
        if (post) {
          posts.push(post)
          console.log(`✓ Built: ${post.title}`)
        } else {
          console.error(`✗ Failed to build: ${file} (buildPost returned null)`)
        }
      } catch (error) {
        console.error(`✗ Error building ${file}:`, error.message)
      }
    }
    
    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    // Log posts before generating listing page
    console.log(`\nGenerating listing page with ${posts.length} post(s):`)
    posts.forEach((post, index) => {
      console.log(`  ${index + 1}. ${post.title} (date: ${post.date}, slug: ${post.slug})`)
    })
    
    // Generate listing page
    await generateListingPage(posts)
    
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
