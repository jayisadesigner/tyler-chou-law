/**
 * YouTube Videos Build Script
 * Fetches latest or most popular videos from YouTube channel using Data API v3
 * Generates HTML for video grid
 */

import { readFile, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// YouTube channel handle
const YOUTUBE_CHANNEL = 'TheCreatorsAttorney'

// YouTube Data API v3 configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

// Video sort order: 'date' for latest, 'viewCount' for most popular, 'rating' for highest rated
const VIDEO_ORDER = process.env.YOUTUBE_VIDEO_ORDER || 'date' // 'date' | 'viewCount' | 'rating'
const MAX_VIDEOS = 6

/**
 * Get channel ID from channel handle
 */
async function getChannelId() {
  try {
    console.log(`Fetching channel ID for @${YOUTUBE_CHANNEL}...`)
    const response = await fetch(`https://www.youtube.com/@${YOUTUBE_CHANNEL}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch channel page: ${response.status}`)
    }
    
    const html = await response.text()
    
    // Try multiple patterns to find channel ID
    const patterns = [
      /"channelId":"([^"]+)"/,
      /"externalId":"([^"]+)"/,
      /<link[^>]+channelId=([^"'\s&]+)/,
      /channelId["']\s*:\s*["']([^"']+)["']/,
      /"browseId":"([^"]+)"/,
    ]
    
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match && match[1] && match[1].startsWith('UC')) {
        console.log(`✓ Found channel ID: ${match[1]}`)
        return match[1]
      }
    }
    
    throw new Error('Could not extract channel ID from YouTube page')
  } catch (error) {
    console.error('Error getting channel ID:', error)
    throw error
  }
}

/**
 * Fetch videos from YouTube Data API v3
 */
async function fetchYouTubeVideos(channelId) {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY environment variable is not set')
  }
  
  try {
    console.log(`Fetching ${VIDEO_ORDER === 'viewCount' ? 'most popular' : VIDEO_ORDER === 'rating' ? 'highest rated' : 'latest'} videos...`)
    
    // Use search endpoint to get videos from channel
    const searchUrl = new URL(`${YOUTUBE_API_BASE}/search`)
    searchUrl.searchParams.set('part', 'snippet')
    searchUrl.searchParams.set('channelId', channelId)
    searchUrl.searchParams.set('order', VIDEO_ORDER)
    searchUrl.searchParams.set('maxResults', MAX_VIDEOS.toString())
    searchUrl.searchParams.set('type', 'video')
    searchUrl.searchParams.set('key', YOUTUBE_API_KEY)
    
    const response = await fetch(searchUrl.toString())
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(`YouTube API error: ${error.error?.message || response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.items || data.items.length === 0) {
      throw new Error('No videos found')
    }
    
    const videos = data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt
    }))
    
    console.log(`✓ Found ${videos.length} videos`)
    return videos
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    throw error
  }
}

/**
 * Escape HTML entities for use in attributes
 */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Generate HTML for YouTube video grid
 */
function generateVideoGridHTML(videos) {
  if (videos.length === 0) {
    console.warn('No videos found, using fallback')
    return '' // Return empty, will use existing hardcoded videos
  }
  
  return videos.map(video => `
            <div class="youtube-video">
              <a href="https://youtube.com/watch?v=${video.id}" target="_blank" class="youtube-video__card">
                <img src="https://img.youtube.com/vi/${video.id}/hqdefault.jpg" alt="${escapeHtml(video.title)}" class="youtube-video__image">
                <div class="youtube-video__overlay">
                  <img src="/src/assets/icons/play.svg" alt="" class="youtube-video__play-icon" aria-hidden="true">
              </div>
              </a>
            </div>`).join('\n')
}

/**
 * Update index.html with latest videos
 */
async function updateIndexHTML(videoGridHTML) {
  try {
    const indexPath = join(projectRoot, 'index.html')
    let html = await readFile(indexPath, 'utf-8')
    
    // Find the youtube-videos-grid section and replace its content
    const gridStart = html.indexOf('<div class="youtube-videos-grid">')
    if (gridStart === -1) {
      console.warn('Could not find youtube-videos-grid in index.html')
      return
    }
    
    // Find the closing div of youtube-videos-grid (before the closing section)
    const afterGridStart = html.substring(gridStart)
    const gridEndMatch = afterGridStart.match(/<\/div>\s*<\/div>\s*<\/section>/)
    
    if (!gridEndMatch) {
      console.warn('Could not find closing tags for youtube-videos-grid')
      return
    }
    
    const gridEnd = gridStart + gridEndMatch.index
    const beforeGrid = html.substring(0, gridStart)
    const afterGrid = html.substring(gridEnd)
    
    // Reconstruct with new video grid
    html = beforeGrid + 
           '<div class="youtube-videos-grid">\n' + 
           videoGridHTML + '\n          ' + 
           afterGrid
    
    await writeFile(indexPath, html, 'utf-8')
    console.log('✓ Updated index.html with latest YouTube videos')
  } catch (error) {
    console.error('Error updating index.html:', error)
    throw error
  }
}

/**
 * Main build function
 */
async function buildYouTubeVideos() {
  try {
    console.log('Building YouTube videos grid...')
    
    if (!YOUTUBE_API_KEY) {
      console.warn('⚠ YOUTUBE_API_KEY not set. Skipping YouTube video fetch.')
      console.warn('Set YOUTUBE_API_KEY environment variable to enable automatic video updates.')
      return
    }
    
    // Get channel ID
    const channelId = await getChannelId()
    
    // Fetch videos from API
    const videos = await fetchYouTubeVideos(channelId)
    
    if (videos.length === 0) {
      console.warn('No videos found. Keeping existing hardcoded videos.')
      return
    }
    
    // Generate HTML
    const videoGridHTML = generateVideoGridHTML(videos)
    
    // Update index.html
    await updateIndexHTML(videoGridHTML)
    
    console.log('✓ YouTube videos grid built successfully')
  } catch (error) {
    console.error('Error building YouTube videos:', error)
    // Don't throw - allow build to continue with existing videos
    console.warn('Continuing with existing hardcoded videos...')
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('build-youtube-videos.js')) {
  buildYouTubeVideos()
}

export { buildYouTubeVideos }
