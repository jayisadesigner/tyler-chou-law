/**
 * YouTube Videos Build Script
 * Fetches latest 6 videos from YouTube channel and generates HTML for video grid
 * Uses YouTube RSS feed (no API key required)
 */

import { readFile, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { parseStringPromise } from 'xml2js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// YouTube channel handle
const YOUTUBE_CHANNEL = 'TheCreatorsAttorney'

/**
 * Fetch YouTube RSS feed
 * Uses channel handle to construct RSS URL
 * Note: YouTube RSS feeds work with channel IDs, but we can try the handle format
 */
async function fetchYouTubeVideos() {
  try {
    // Try multiple RSS feed formats
    const rssUrls = [
      // Format 1: Direct channel handle (may not work for all channels)
      `https://www.youtube.com/feeds/videos.xml?channel_id=UC${YOUTUBE_CHANNEL}`,
      // Format 2: User-based (legacy, may still work)
      `https://www.youtube.com/feeds/videos.xml?user=${YOUTUBE_CHANNEL}`,
    ]
    
    // First, try to get channel ID from the channel page
    console.log(`Attempting to fetch channel ID for @${YOUTUBE_CHANNEL}...`)
    try {
      const channelResponse = await fetch(`https://www.youtube.com/@${YOUTUBE_CHANNEL}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      if (channelResponse.ok) {
        const channelHtml = await channelResponse.text()
        
        // Try multiple patterns to find channel ID
        const patterns = [
          /"channelId":"([^"]+)"/,
          /"externalId":"([^"]+)"/,
          /<link[^>]+channelId=([^"'\s&]+)/,
          /channelId["']\s*:\s*["']([^"']+)["']/,
          /"browseId":"([^"]+)"/,
        ]
        
        for (const pattern of patterns) {
          const match = channelHtml.match(pattern)
          if (match && match[1] && match[1].startsWith('UC')) {
            const channelId = match[1]
            rssUrls.unshift(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)
            console.log(`Found channel ID: ${channelId}`)
            break
          }
        }
      }
    } catch (e) {
      console.log('Could not extract channel ID, trying direct RSS URLs...')
    }
    
    // Try each RSS URL until one works
    for (const rssUrl of rssUrls) {
      try {
        console.log(`Trying RSS URL: ${rssUrl}`)
        const rssResponse = await fetch(rssUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        
        if (rssResponse.ok) {
          const xml = await rssResponse.text()
          // Check if we got valid XML (not an error page)
          if (xml.includes('<feed') || xml.includes('<rss')) {
            console.log(`✓ Successfully fetched RSS feed`)
            return xml
          }
        }
      } catch (e) {
        // Try next URL
        continue
      }
    }
    
    throw new Error('Could not fetch YouTube RSS feed from any URL')
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    throw error
  }
}

/**
 * Parse RSS XML and extract video data
 */
async function parseRSSFeed(xml) {
  try {
    const result = await parseStringPromise(xml)
    const entries = result.feed?.entry || []
    
    const videos = entries.slice(0, 6).map(entry => {
      // Extract video ID from various possible locations
      const videoId = entry['yt:videoId']?.[0] || 
                     entry['media:group']?.[0]?.['yt:videoId']?.[0] ||
                     entry.id?.[0]?.split(':').pop() ||
                     entry.link?.[0]?.$.href?.split('v=')[1]?.split('&')[0]
      
      const title = entry.title?.[0] || 
                   entry['media:group']?.[0]?.['media:title']?.[0] || 
                   'Video'
      
      // Decode HTML entities from RSS feed
      const decodedTitle = title
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
      
      return {
        id: videoId,
        title: decodedTitle
      }
    }).filter(video => video.id) // Filter out any invalid entries
    
    return videos
  } catch (error) {
    console.error('Error parsing RSS feed:', error)
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
    // Match from opening div to closing div of youtube-videos-grid
    const gridRegex = /(<div class="youtube-videos-grid">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/section>)/
    
    if (gridRegex.test(html)) {
      html = html.replace(
        gridRegex,
        `$1\n${videoGridHTML}\n          $2`
      )
      await writeFile(indexPath, html, 'utf-8')
      console.log('✓ Updated index.html with latest YouTube videos')
    } else {
      console.warn('Could not find youtube-videos-grid in index.html')
    }
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
    
    // Fetch and parse videos
    const xml = await fetchYouTubeVideos()
    const videos = await parseRSSFeed(xml)
    
    if (videos.length === 0) {
      console.warn('No videos found. Keeping existing hardcoded videos.')
      return
    }
    
    console.log(`Found ${videos.length} videos`)
    
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

