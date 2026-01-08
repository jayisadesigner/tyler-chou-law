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
// Read from root file (source), write to both root (dev) and dist (production)
const listingPageSourcePath = join(projectRoot, 'love-letters.html')
const listingPageDistPath = join(projectRoot, 'dist', 'love-letters.html')
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
 * Get colors for all posts ensuring no consecutive duplicates
 * Uses only 600 variants
 */
function assignPostColors(posts) {
  const colorOptions = [
    'chuparosa-600', 
    'lupine-600', 
    'palo-verde-600', 
    'desert-gold-600',
    'obsidian'
  ]
  
  let previousColor = null
  
  return posts.map((post, index) => {
    // Check if post has explicit color in metadata (from Decap or manual edit)
    // imageColor is null if not set, or the actual color value if set
    const hasExplicitColor = post.imageColor && 
      post.imageColor !== 'chuparosa-600' && 
      colorOptions.includes(post.imageColor)
    
    // If explicit color exists, use it (respects Decap uploads)
    if (hasExplicitColor) {
      previousColor = post.imageColor
      return { ...post, imageColor: post.imageColor }
    }
    
    // Only auto-assign if no explicit color was set
    // Start with index-based color
    let colorIndex = index % colorOptions.length
    let color = colorOptions[colorIndex]
    
    // If this would be the same as previous, find next different color
    if (color === previousColor && colorOptions.length > 1) {
      // Try next color in sequence
      colorIndex = (colorIndex + 1) % colorOptions.length
      color = colorOptions[colorIndex]
      
      // If still same (shouldn't happen with 5 colors), try next
      if (color === previousColor) {
        colorIndex = (colorIndex + 1) % colorOptions.length
        color = colorOptions[colorIndex]
      }
    }
    
    previousColor = color
    return { ...post, imageColor: color }
  })
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
 * In dev mode (when dist/assets doesn't exist), returns dev-friendly paths
 * In production (after vite build), returns actual Vite-generated paths
 */
async function getViteAssets() {
  try {
    const assetsDir = join(projectRoot, 'dist', 'assets')
    
    // Check if dist/assets directory exists
    try {
      await stat(assetsDir)
    } catch {
      // Dev mode: dist/assets doesn't exist yet, use dev-friendly paths
      // Vite dev server will handle these paths correctly
      return {
        mainJs: '/src/scripts/main.js',
        mainCss: null // CSS is imported via JS in dev mode
      }
    }
    
    // Production mode: dist/assets exists, check if files actually exist
    const files = await readdir(assetsDir)
    
    const mainJs = files.find(f => f.startsWith('main-') && f.endsWith('.js'))
    const mainCss = files.find(f => f.startsWith('main-') && f.endsWith('.css'))
    
    // Only use production paths if files actually exist
    // In dev mode, even if dist/assets exists from old build, use dev paths
    if (mainJs) {
      try {
        await stat(join(assetsDir, mainJs))
      } catch {
        // File doesn't exist, use dev path
        return {
          mainJs: '/src/scripts/main.js',
          mainCss: null
        }
      }
    }
    
    if (mainCss) {
      try {
        await stat(join(assetsDir, mainCss))
      } catch {
        // File doesn't exist, return dev-friendly paths
        return {
          mainJs: mainJs ? `/assets/${mainJs}` : '/src/scripts/main.js',
          mainCss: null
        }
      }
    }
    
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
 * Handles direct URLs (external images) and local files in src/assets/images/blog/
 */
async function resolveFeaturedImage(featuredImage) {
  // If no featured image provided, return null
  if (!featuredImage) {
    return { url: null }
  }
  
  // If it's already a full URL, return as is (external image)
  if (featuredImage.startsWith('http://') || featuredImage.startsWith('https://')) {
    return { url: featuredImage }
  }
  
  // Check if local file exists
  let filename
  let localPath
  
  if (featuredImage.startsWith('/')) {
    // Path like "/images/blog/filename.jpg"
    filename = basename(featuredImage)
    localPath = join(projectRoot, 'src', 'assets', 'images', 'blog', filename)
  } else {
    // Just filename or relative path
    filename = basename(featuredImage)
    localPath = join(projectRoot, 'src', 'assets', 'images', 'blog', filename)
  }
  
  // Check if file exists
  try {
    await stat(localPath)
    // File exists, use it
    // Use /src/assets/images/blog/ path to match pattern used elsewhere in codebase
    // This works with Vite dev server and will be processed by Vite in production
    const publicPath = featuredImage.startsWith('/src/assets/')
      ? featuredImage
      : `/src/assets/images/blog/${filename}`
    return { url: publicPath }
  } catch {
    // File doesn't exist, log warning
    console.warn(`  ⚠ Local image not found: ${filename}`)
    return { url: null }
  }
}

/**
 * Generate featured image meta tags
 */
function generateFeaturedImageMeta(imageData) {
  if (!imageData || !imageData.url) {
    return {
      ogImage: '',
      twitterImage: '',
      schemaImage: ''
    }
  }
  
  return {
    ogImage: `<meta property="og:image" content="${imageData.url}" />`,
    twitterImage: `<meta name="twitter:image" content="${imageData.url}" />`,
    schemaImage: `"image": {
        "@type": "ImageObject",
        "url": "${imageData.url}"
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
function generateFeaturedImageHero(imageData, imageColor = 'chuparosa-500', imageIntensity = '') {
  // If no image, return empty background-image div (CSS will handle fallback)
  if (!imageData || !imageData.url) {
    return `
        <div class="background-image" aria-hidden="true"></div>`
  }
  
  // For local images, remove domain prefix for relative path
  // For external URLs, use full URL
  const imageSrc = imageData.url.startsWith('https://tylerchoulaw.com')
    ? imageData.url.replace('https://tylerchoulaw.com', '')
    : imageData.url
  
  const intensityClass = imageIntensity ? ` blog-image--${imageIntensity}` : ''
  
  return `
        <div class="background-image" aria-hidden="true">
            <div class="blog-image${intensityClass}" data-color="${imageColor}">
            <img 
              src="${imageSrc}" 
              alt="{{title}}" 
              class="background-image__img"
              loading="eager"
              fetchpriority="high"
            />
            </div>
            <!-- Overlay Layer 1: Crimson to Purple gradient with soft-light blend -->
            <div class="background-image__overlay background-image__overlay-gradient-1"></div>
            <!-- Overlay Layer 2: Dark brown to gold gradient with hue blend -->
            <div class="background-image__overlay background-image__overlay-gradient-2"></div>
            <!-- Overlay Layer 3: Dark overlay with difference blend -->
            <div class="background-image__overlay background-image__overlay-dark"></div>
            <!-- Overlay Layer 4: Final opacity overlay -->
            <div class="background-image__overlay background-image__overlay-opacity"></div>
        </div>`
}

/**
 * Generate author headshot HTML for blog post hero
 */
function generateAuthorHeadshot() {
  return `
            <div class="hero--blog-post__author-image-wrapper">
              <img 
                src="/src/assets/images/about/tyler-chou-headshot.jpeg" 
                alt="Tyler Chou" 
                class="hero--blog-post__author-image background-image__img"
                width="354"
                height="442"
              />
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
 * Parse post metadata (lightweight, for color assignment)
 */
async function parsePostMetadata(filePath, fileName) {
  try {
    const content = await readFile(filePath, 'utf-8')
    const { metadata, body } = parseFrontmatter(content)
    const slug = metadata.slug || slugify(metadata.title || fileName.replace('.md', ''))
    
    // Calculate reading time (needed for listing page)
    const readingTime = calculateReadingTime(body)
    
    // Format dates (needed for listing page)
    const dateDisplay = formatDate(metadata.date)
    const dateISO = formatDateISO(metadata.date)
    
    // Resolve featured image URL (needed for listing page)
    const featuredImage = metadata.featured_image || null
    const imageData = await resolveFeaturedImage(featuredImage)
    
    return {
      filePath,
      fileName,
      slug,
      date: metadata.date,
      dateDisplay,
      dateISO,
      title: metadata.title,
      excerpt: metadata.excerpt || '',
      author: metadata.author || 'Tyler Chou',
      readingTime,
      tags: metadata.tags ? (Array.isArray(metadata.tags) ? metadata.tags : metadata.tags.split(',').map(t => t.trim())) : [],
      featuredImage: imageData.url,
      imageColor: metadata.image_color || null, // Preserve original or null
      imageIntensity: metadata.image_intensity || '',
    }
  } catch (error) {
    console.error(`Error parsing metadata for ${fileName}:`, error)
    return null
  }
}

/**
 * Build a single blog post
 */
async function buildPost(filePath, fileName, assignedColor = null) {
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
    
    // Extract curtain from header template (everything before <header> tag)
    const curtainMatch = headerTemplate.match(/^([\s\S]*?)(<header)/)
    const curtainHtml = curtainMatch ? curtainMatch[1].trim() : ''
    const headerOnly = headerTemplate.replace(/^[\s\S]*?(<header)/, '$1')
    
    // Handle featured image
    const featuredImage = metadata.featured_image || null
    const imageData = await resolveFeaturedImage(featuredImage)
    const imageMeta = generateFeaturedImageMeta(imageData)
    // Get image treatment settings: use assigned color if provided, otherwise metadata color, otherwise default
    // This ensures hero and card use the same color
    const defaultColor = 'chuparosa-600'
    const imageColor = assignedColor || metadata.image_color || defaultColor
    const imageIntensity = metadata.image_intensity || ''
    const featuredImageHero = generateFeaturedImageHero(imageData, imageColor, imageIntensity)
    const authorHeadshot = generateAuthorHeadshot()
    
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
      .replace(/\{\{authorHeadshot\}\}/g, authorHeadshot)
      .replace(/\{\{ogImage\}\}/g, imageMeta.ogImage)
      .replace(/\{\{twitterImage\}\}/g, imageMeta.twitterImage)
      .replace(/\{\{featuredImageSchema\}\}/g, imageMeta.schemaImage)
      .replace(/\{\{articleBody\}\}/g, articleBody)
      .replace(/\{\{mainCss\}\}/g, viteAssets.mainCss || '')
    
    // Remove any existing curtain divs
    template = template.replace(/<div[^>]*class="[^"]*curtain[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    template = template.replace(/<!--\s*Page Load Curtain[^>]*-->[\s\S]*?<\/div>/gi, '')
    
    // Insert curtain before header (or before body content if no header)
    if (curtainHtml) {
      const headerIndex = template.indexOf('<header')
      if (headerIndex !== -1) {
        template = template.substring(0, headerIndex) + curtainHtml + '\n    ' + template.substring(headerIndex)
      } else {
        // Fallback: insert after <body> tag
        const bodyIndex = template.indexOf('<body')
        if (bodyIndex !== -1) {
          const bodyTagEnd = template.indexOf('>', bodyIndex) + 1
          template = template.substring(0, bodyTagEnd) + '\n    ' + curtainHtml + template.substring(bodyTagEnd)
        }
      }
    }
    
    // Replace header - use a more robust regex that matches any header tag and its content
    // This handles both the placeholder <header><!-- Navigation will be injected here --></header>
    // and any existing full header structure
    template = template.replace(/<header[^>]*>[\s\S]*?<\/header>/gs, headerOnly)
    template = template.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gs, footerTemplate)
    
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
      featuredImage: imageData.url,
      imageColor: imageColor,
      imageIntensity: imageIntensity,
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
    
    // Get Vite-generated asset paths (needed for production)
    const viteAssets = await getViteAssets()
    
    // Read existing love-letters.html as base (try root first, fallback to dist)
    let listingHTML
    try {
      listingHTML = await readFile(listingPageSourcePath, 'utf-8')
    } catch {
      // Fallback to dist if root doesn't exist
      try {
        listingHTML = await readFile(listingPageDistPath, 'utf-8')
      } catch {
        throw new Error('Could not find love-letters.html source file')
      }
    }
    
    // Load components
    const headerTemplate = await loadComponentTemplate('header')
    const footerTemplate = await loadComponentTemplate('footer')
    const disclaimerTemplate = await loadComponentTemplate('disclaimer')
    
    // Extract curtain from header template (everything before <header> tag)
    const curtainMatch = headerTemplate.match(/^([\s\S]*?)(<header)/)
    const curtainHtml = curtainMatch ? curtainMatch[1].trim() : ''
    const headerOnly = headerTemplate.replace(/^[\s\S]*?(<header)/, '$1')
    
    // Generate blog post cards HTML
    console.log(`Generating HTML for ${posts.length} post(s)`)
    const postsHTML = posts.map((post, index) => {
      const dateDisplay = formatDate(post.date)
      const loveLetterNumber = posts.length - index
      // Handle both local and external URLs
      const imageSrc = post.featuredImage 
        ? (post.featuredImage.startsWith('https://tylerchoulaw.com') 
            ? post.featuredImage.replace('https://tylerchoulaw.com', '')
            : post.featuredImage)
        : null
      // Get image treatment settings from post metadata
      // Colors are pre-assigned in assignPostColors to avoid consecutive duplicates
      const imageColor = post.imageColor
      const imageIntensity = post.imageIntensity || ''
      const intensityClass = imageIntensity ? ` blog-image--${imageIntensity}` : ''
      
      const featuredImageHTML = imageSrc
        ? `<div class="blog-image${intensityClass}" data-color="${imageColor}">
            <img src="${imageSrc}" alt="${post.title}" class="background-image__img" loading="lazy" />
          </div>`
        : ''
      
      return `
        <article class="blog-card">
          <a href="/love-letters/${post.slug}.html" class="blog-card__link">
            ${featuredImageHTML ? `<div class="blog-card__image-wrapper">${featuredImageHTML}</div>` : ''}
            <div class="blog-card__content">
              <h3 class="blog-card__title">${post.title}</h3>
              <div class="blog-card__byline">
                <div class="blog-card__author-avatar">
                  <img src="/src/assets/images/about/tyler-chou-headshot.jpeg" alt="Tyler Chou" class="blog-card__author-image" />
                </div>
                <p class="blog-card__author-text">Written by Tyler Chou</p>
              </div>
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
    
    // Remove any existing curtain divs
    listingHTML = listingHTML.replace(/<div[^>]*class="[^"]*curtain[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    listingHTML = listingHTML.replace(/<!--\s*Page Load Curtain[^>]*-->[\s\S]*?<\/div>/gi, '')
    
    // Insert curtain before header (or before body content if no header)
    if (curtainHtml) {
      const headerIndex = listingHTML.indexOf('<header')
      if (headerIndex !== -1) {
        listingHTML = listingHTML.substring(0, headerIndex) + curtainHtml + '\n    ' + listingHTML.substring(headerIndex)
      } else {
        // Fallback: insert after <body> tag
        const bodyIndex = listingHTML.indexOf('<body')
        if (bodyIndex !== -1) {
          const bodyTagEnd = listingHTML.indexOf('>', bodyIndex) + 1
          listingHTML = listingHTML.substring(0, bodyTagEnd) + '\n    ' + curtainHtml + listingHTML.substring(bodyTagEnd)
        }
      }
    }
    
    // Replace header and footer - use dotall flag (s) to match across newlines
    listingHTML = listingHTML.replace(/<header[^>]*>[\s\S]*?<\/header>/gs, headerOnly)
    listingHTML = listingHTML.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gs, footerTemplate)
    
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
    
    // Replace asset paths
    // Root file (dev): use dev paths for Vite dev server
    // Dist file (production): use production paths if available
    
    // Create dev version (for root)
    let devHTML = listingHTML
    // Replace old production CSS paths - remove entirely in dev mode (imported via JS)
    devHTML = devHTML.replace(
      /<link rel="stylesheet" href="\/assets\/main-[^"]+\.css">\s*/g,
      '' // Remove CSS link in dev mode (imported via JS)
    )
    // Also remove any empty stylesheet link tags
    devHTML = devHTML.replace(
      /<link rel="stylesheet"\s*>\s*/g,
      '' // Remove empty CSS link tag
    )
    // Replace old production JS paths with dev path
    devHTML = devHTML.replace(
      /src="\/assets\/main-[^"]+\.js"/g,
      'src="/src/scripts/main.js"'
    )
    // Ensure dev path is set (in case file was already using dev path)
    if (!devHTML.includes('src="/src/scripts/main.js"')) {
      devHTML = devHTML.replace(
        /<script type="module" src="[^"]+"><\/script>/,
        '<script type="module" src="/src/scripts/main.js"></script>'
      )
    }
    
    // Create production version (for dist)
    let prodHTML = listingHTML
    // Replace old production paths with dev paths first
    prodHTML = prodHTML.replace(
      /href="\/assets\/main-[^"]+\.css"/g,
      viteAssets.mainCss ? `href="${viteAssets.mainCss}"` : ''
    )
    prodHTML = prodHTML.replace(
      /src="\/assets\/main-[^"]+\.js"/g,
      viteAssets.mainJs ? `src="${viteAssets.mainJs}"` : 'src="/src/scripts/main.js"'
    )
    // Replace dev paths with production paths (if available)
    if (viteAssets.mainCss) {
      prodHTML = prodHTML.replace(
        /href="\/src\/styles\/main\.css"/g,
        `href="${viteAssets.mainCss}"`
      )
    }
    if (viteAssets.mainJs) {
      prodHTML = prodHTML.replace(
        /src="\/src\/scripts\/main\.js"/g,
        `src="${viteAssets.mainJs}"`
      )
    }
    
    // Add CSS link if it doesn't exist (for production)
    if (viteAssets.mainCss && !prodHTML.includes('rel="stylesheet"')) {
      prodHTML = prodHTML.replace(
        /(<link rel="manifest"[^>]*>)/,
        `$1\n    <link rel="stylesheet" href="${viteAssets.mainCss}">`
      )
    }
    
    // Write dev version to root, production version to dist
    await writeFile(listingPageSourcePath, devHTML, 'utf-8')
    await writeFile(listingPageDistPath, prodHTML, 'utf-8')
    
    console.log('✓ Generated listing page: love-letters.html (root and dist)')
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
    
    // Step 1: Parse metadata for all posts (lightweight, just frontmatter)
    console.log(`Found ${markdownFiles.length} markdown file(s)`)
    const postMetadatas = []
    for (const file of markdownFiles) {
      const filePath = join(contentDir, file)
      try {
        const metadata = await parsePostMetadata(filePath, file)
        if (metadata) {
          postMetadatas.push(metadata)
        }
      } catch (error) {
        console.error(`✗ Error parsing metadata for ${file}:`, error.message)
      }
    }
    
    // Step 2: Sort by date (newest first)
    postMetadatas.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    // Step 3: Assign colors (respects explicit colors from Decap, auto-assigns others)
    const postsWithColors = assignPostColors(postMetadatas)
    
    // Log color assignments
    console.log(`\nColor assignments:`)
    postsWithColors.forEach((post, index) => {
      const colorSource = post.imageColor && post.imageColor !== 'chuparosa-600' && postMetadatas[index].imageColor 
        ? '(from metadata)' 
        : '(auto-assigned)'
      console.log(`  ${index + 1}. ${post.title}: ${post.imageColor} ${colorSource}`)
    })
    
    // Step 4: Build posts with assigned colors (ensures hero and card match)
    const posts = []
    for (const postWithColor of postsWithColors) {
      console.log(`Building: ${postWithColor.fileName}`)
      try {
        const builtPost = await buildPost(postWithColor.filePath, postWithColor.fileName, postWithColor.imageColor)
        if (builtPost) {
          posts.push(builtPost)
          console.log(`✓ Built: ${builtPost.title}`)
        } else {
          console.error(`✗ Failed to build: ${postWithColor.fileName} (buildPost returned null)`)
        }
      } catch (error) {
        console.error(`✗ Error building ${postWithColor.fileName}:`, error.message)
      }
    }
    
    // Step 5: Generate listing page with assigned colors
    // Use postsWithColors (metadata objects with assigned colors) for listing page
    await generateListingPage(postsWithColors)
    
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
