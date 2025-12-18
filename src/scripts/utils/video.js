/**
 * Video Utility Functions
 * Helper functions for working with video components (YouTube and native)
 */

/**
 * Generate YouTube embed URL with autoplay, mute, and loop
 * @param {string} videoId - YouTube video ID
 * @param {object} options - Additional options
 * @returns {string} YouTube embed URL
 */
export function getYouTubeEmbedUrl(videoId, options = {}) {
  const {
    autoplay = 1,
    mute = 1,
    loop = 1,
    controls = 0,
    modestbranding = 1,
    rel = 0,
    start = 0,
  } = options;

  // For looping, we need to use the playlist parameter with the same video ID
  const params = new URLSearchParams({
    autoplay: autoplay,
    mute: mute,
    loop: loop,
    playlist: loop ? videoId : undefined,
    controls: controls,
    modestbranding: modestbranding,
    rel: rel,
    start: start,
  });

  // Remove undefined values
  params.forEach((value, key) => {
    if (value === undefined || value === 'undefined') {
      params.delete(key);
    }
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Initialize video components
 * Can be extended later for lazy loading, intersection observer, etc.
 */
export function initVideos() {
  // Future: Add lazy loading, intersection observer, etc.
  const videos = document.querySelectorAll('.video');
  
  videos.forEach((video) => {
    // Add any initialization logic here
    // For now, videos work automatically
  });
}

