/**
 * YouTube Videos Build Script
 * Generates HTML for video grid from config file or YouTube API
 * Supports manual curation (config file) or automatic fetching (API)
 */

import { readFile, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// YouTube channel handle (for API mode)
const YOUTUBE_CHANNEL = 'TheCreatorsAttorney'
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

/**
 * Load config file
 */
async function loadConfig() {
  try {
    const configPath = join(projectRoot, 'config', 'youtube-videos.json')
    const configContent = await readFile(configPath, 'utf-8')
    return JSON.parse(configContent)
  } catch (error) {
    console.error('Error loading config file:', error)
    throw new Error('Could not load youtube-videos.json config file')
  }
}

/**
 * Get channel ID from channel handle (for API mode)
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
 * Fetch videos from YouTube Data API v3 (for auto mode)
 */
async function fetchYouTubeVideosFromAPI(channelId, config) {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY environment variable is not set')
  }
  
  const autoConfig = config.autoConfig
  const order = autoConfig.order || 'date'
  const maxVideos = autoConfig.maxVideos || 6
  
  try {
    const orderType = order === 'viewCount' ? 'most popular' : 
                     order === 'rating' ? 'highest rated' : 'latest'
    const dateFilter = (order === 'viewCount' && autoConfig.dateFilter?.enabled) 
                      ? ` from the last ${autoConfig.dateFilter.years || 1} year(s)` 
                      : ''
    console.log(`Fetching ${orderType} videos${dateFilter}...`)
    
    const searchUrl = new URL(`${YOUTUBE_API_BASE}/search`)
    searchUrl.searchParams.set('part', 'snippet')
    searchUrl.searchParams.set('channelId', channelId)
    searchUrl.searchParams.set('order', order)
    searchUrl.searchParams.set('maxResults', maxVideos.toString())
    searchUrl.searchParams.set('type', 'video')
    searchUrl.searchParams.set('key', YOUTUBE_API_KEY)
    
    // Add date filter if enabled
    if (autoConfig.dateFilter?.enabled) {
      const yearsAgo = new Date()
      yearsAgo.setFullYear(yearsAgo.getFullYear() - (autoConfig.dateFilter.years || 1))
      searchUrl.searchParams.set('publishedAfter', yearsAgo.toISOString())
    }
    
    const response = await fetch(searchUrl.toString())
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(`YouTube API error: ${error.error?.message || response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.items || data.items.length === 0) {
      throw new Error('No videos found')
    }
    
    let videos = data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt
    }))
    
    // Sort by published date (newest first) to ensure correct order
    if (order === 'date') {
      videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    }
    
    console.log(`✓ Found ${videos.length} videos`)
    return videos
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    throw error
  }
}

/**
 * Get videos from config or API
 */
async function getVideos() {
  const config = await loadConfig()
  
  if (config.mode === 'manual') {
    console.log('Using manual video list from config...')
    return config.manualVideos || []
  } else if (config.mode === 'auto') {
    if (!YOUTUBE_API_KEY) {
      console.warn('⚠ API mode enabled but YOUTUBE_API_KEY not set. Falling back to manual videos.')
      return config.manualVideos || []
    }
    
    console.log('Using automatic video fetching from YouTube API...')
    const channelId = await getChannelId()
    return await fetchYouTubeVideosFromAPI(channelId, config)
  } else {
    throw new Error(`Unknown mode: ${config.mode}. Use 'manual' or 'auto'.`)
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
    console.warn('No videos found')
    return ''
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
 * Update index.html with videos
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
    console.log('✓ Updated index.html with YouTube videos')
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
    console.log('Refreshing YouTube videos config...')

    const videos = await getVideos()

    if (videos.length === 0) {
      console.warn('No videos found. Check config/youtube-videos.json.')
      return
    }

    // Eleventy reads this list from src/_data/videos.js. We only need the
    // config refreshed here — page HTML is rendered by the youtube-grid
    // Bookshop component at build time.
    console.log(`✓ YouTube videos config ready (${videos.length} videos)`)
  } catch (error) {
    console.error('Error refreshing YouTube videos:', error)
    console.warn('Continuing with existing videos...')
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('build-youtube-videos.js')) {
  buildYouTubeVideos()
}

export { buildYouTubeVideos }
