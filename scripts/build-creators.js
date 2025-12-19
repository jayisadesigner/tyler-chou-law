/**
 * Creator Pages Build Script
 * Pre-renders creator pages to HTML at build time
 */

import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

const outputDir = join(projectRoot, 'roster')
const templatePath = join(projectRoot, 'src', 'templates', 'creator-page.html')
const creatorDataPath = join(projectRoot, 'src', 'scripts', 'creator-transition-simple.js')

/**
 * Extract creator data from JavaScript file
 */
async function extractCreatorData() {
  try {
    const fileContent = await readFile(creatorDataPath, 'utf-8')
    
    // Extract the creatorData object using regex
    // Match from "const creatorData = {" to the closing "}" before the next function
    const match = fileContent.match(/const creatorData = (\{[\s\S]*?\n\})/m)
    if (!match) {
      throw new Error('Could not find creatorData in file')
    }
    
    // Use Function constructor for safer evaluation (still executes code, but more controlled)
    // This is safe since we control the source file
    const creatorData = new Function('return ' + match[1])()
    return creatorData
  } catch (error) {
    console.error('Error extracting creator data:', error)
    throw error
  }
}

/**
 * Generate meta description from creator data
 */
function generateMetaDescription(data) {
  if (data.description && data.description.length > 0) {
    // Use first paragraph, truncate to ~150 chars
    const firstPara = data.description[0]
    if (firstPara.length <= 160) {
      return firstPara
    }
    return firstPara.substring(0, 157) + '...'
  }
  return `${data.name} - Creator represented by Tyler Chou Law`
}

/**
 * Generate meta title
 */
function generateMetaTitle(data) {
  return data.name || `Creator`
}

/**
 * Generate description HTML
 */
function generateDescriptionHTML(description) {
  if (!description || !Array.isArray(description)) {
    return ''
  }
  return description.map(para => `<p>${para}</p>`).join('\n            ')
}

/**
 * Generate videos HTML
 */
function generateVideosHTML(videos) {
  if (!videos || !Array.isArray(videos) || videos.length === 0) {
    return ''
  }
  
  const videosHTML = videos.map((videoId, index) => `
              <div class="creator-video">
                <div class="video">
                  <iframe 
                    class="video__embed"
                    src="https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&controls=1&modestbranding=1&rel=0"
                    allow="encrypted-media; fullscreen"
                    allowfullscreen
                    loading="lazy"
                    title="Video ${index + 1}"
                  ></iframe>
                </div>
              </div>`).join('')
  
  return `
          <div class="creator-videos">
            <h2>Sample Videos</h2>
            <div class="creator-videos-grid">
              ${videosHTML}
            </div>
          </div>`
}

/**
 * Generate Open Graph image meta tag
 */
function generateOGImage(creatorId) {
  // Map creator IDs to their actual image file names and extensions
  const imageMap = {
    'jesser': '@jesser.webp',
    'sticks': '@sticks.jpg',
    'jacksfilms': '@jacksfilms.webp',
    'jennyhoyos': 'jennyhoyos.png',
    'samandcolby': 'samandcolby.png',
    'calebhammer': '@calebhammer.png',
    'jadroppingscience': '@jadroppingscience.png',
    'cassandrabankson': '@cassandraBankson.png'
  }
  
  const imageFile = imageMap[creatorId] || `${creatorId}.png`
  const imagePath = `https://tylerchoulaw.com/src/assets/images/roster/${imageFile}`
  return `<meta property="og:image" content="${imagePath}" />`
}

/**
 * Generate Twitter image meta tag
 */
function generateTwitterImage(creatorId) {
  // Map creator IDs to their actual image file names and extensions
  const imageMap = {
    'jesser': '@jesser.webp',
    'sticks': '@sticks.jpg',
    'jacksfilms': '@jacksfilms.webp',
    'jennyhoyos': 'jennyhoyos.png',
    'samandcolby': 'samandcolby.png',
    'calebhammer': '@calebhammer.png',
    'jadroppingscience': '@jadroppingscience.png',
    'cassandrabankson': '@cassandraBankson.png'
  }
  
  const imageFile = imageMap[creatorId] || `${creatorId}.png`
  const imagePath = `https://tylerchoulaw.com/src/assets/images/roster/${imageFile}`
  return `<meta name="twitter:image" content="${imagePath}" />`
}

/**
 * Generate YouTube URL for structured data
 */
function generateYouTubeUrl(creatorId) {
  // Extract handle from creatorId (remove @ if present)
  const handle = creatorId.replace('@', '')
  return `"https://youtube.com/@${handle}"`
}

/**
 * Build a single creator page
 */
async function buildCreatorPage(creatorId, data) {
  try {
    // Read template
    let template = await readFile(templatePath, 'utf-8')
    
    // Generate meta information
    const metaTitle = generateMetaTitle(data)
    const metaDescription = generateMetaDescription(data)
    const descriptionHTML = generateDescriptionHTML(data.description)
    const videosHTML = generateVideosHTML(data.videos)
    const ogImage = generateOGImage(creatorId)
    const twitterImage = generateTwitterImage(creatorId)
    const youtubeUrl = generateYouTubeUrl(creatorId)
    
    // Get stats
    const stats = data.stats || []
    const stat1Value = stats[0]?.value || ''
    const stat1Label = stats[0]?.label || ''
    const stat2Value = stats[1]?.value || ''
    const stat2Label = stats[1]?.label || ''
    const stat3Value = stats[2]?.value || ''
    const stat3Label = stats[2]?.label || ''
    const stat4Value = stats[3]?.value || ''
    const stat4Label = stats[3]?.label || ''
    
    // Replace template variables
    template = template
      .replace(/\{\{creatorId\}\}/g, creatorId)
      .replace(/\{\{metaTitle\}\}/g, metaTitle)
      .replace(/\{\{metaDescription\}\}/g, metaDescription)
      .replace(/\{\{name\}\}/g, data.name || `@${creatorId}`)
      .replace(/\{\{breadcrumbName\}\}/g, data.breadcrumb || creatorId)
      .replace(/\{\{stat1Value\}\}/g, stat1Value)
      .replace(/\{\{stat1Label\}\}/g, stat1Label)
      .replace(/\{\{stat2Value\}\}/g, stat2Value)
      .replace(/\{\{stat2Label\}\}/g, stat2Label)
      .replace(/\{\{stat3Value\}\}/g, stat3Value)
      .replace(/\{\{stat3Label\}\}/g, stat3Label)
      .replace(/\{\{stat4Value\}\}/g, stat4Value)
      .replace(/\{\{stat4Label\}\}/g, stat4Label)
      .replace(/\{\{description\}\}/g, descriptionHTML)
      .replace(/\{\{videos\}\}/g, videosHTML)
      .replace(/\{\{ogImage\}\}/g, ogImage)
      .replace(/\{\{twitterImage\}\}/g, twitterImage)
      .replace(/\{\{youtubeUrl\}\}/g, youtubeUrl)
    
    // Create output directory
    await mkdir(outputDir, { recursive: true })
    
    // Write HTML file
    const outputPath = join(outputDir, `${creatorId}.html`)
    await writeFile(outputPath, template)
    
    return {
      creatorId,
      name: data.name,
      breadcrumb: data.breadcrumb
    }
  } catch (error) {
    console.error(`Error building creator page ${creatorId}:`, error)
    return null
  }
}

/**
 * Build all creator pages
 */
async function buildCreators() {
  try {
    console.log('Building creator pages...')
    
    // Extract creator data
    const creatorData = await extractCreatorData()
    
    // Build pages in order: jennyhoyos, calebhammer, jesser, jadroppingscience, sticks, jacksfilms, cassandrabankson, samandcolby
    const order = ['jennyhoyos', 'calebhammer', 'jesser', 'jadroppingscience', 'sticks', 'jacksfilms', 'cassandrabankson', 'samandcolby']
    
    const results = []
    for (const creatorId of order) {
      const data = creatorData[creatorId]
      if (data) {
        const result = await buildCreatorPage(creatorId, data)
        if (result) {
          results.push(result)
          console.log(`✓ Built: ${result.name}`)
        }
      } else {
        console.warn(`⚠ Creator data not found for: ${creatorId}`)
      }
    }
    
    console.log(`\n✓ Built ${results.length} creator page(s)`)
    return results
  } catch (error) {
    console.error('Error building creators:', error)
    return []
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildCreators()
}

export { buildCreators }

