/**
 * Vimeo Video Loader
 * Handles initialization and ready state detection for Vimeo iframes
 */

/**
 * Initialize a Vimeo player from an iframe and wait for it to be ready
 * @param {HTMLIFrameElement} iframe - The Vimeo iframe element
 * @returns {Promise<Vimeo.Player>} Promise that resolves when player is ready
 */
export function initVimeoPlayer(iframe) {
  return new Promise((resolve, reject) => {
    // Wait for Vimeo Player API to be available
    if (typeof Vimeo === 'undefined' || !Vimeo.Player) {
      // If script hasn't loaded yet, wait for it
      const checkVimeo = setInterval(() => {
        if (typeof Vimeo !== 'undefined' && Vimeo.Player) {
          clearInterval(checkVimeo)
          createPlayer()
        }
      }, 100)
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkVimeo)
        reject(new Error('Vimeo Player API failed to load'))
      }, 5000)
    } else {
      createPlayer()
    }
    
    function createPlayer() {
      try {
        const player = new Vimeo.Player(iframe)
        
        player.ready().then(() => {
          resolve(player)
        }).catch((error) => {
          reject(error)
        })
      } catch (error) {
        reject(error)
      }
    }
  })
}

/**
 * Initialize multiple Vimeo players and wait for all to be ready
 * @param {NodeList|Array<HTMLIFrameElement>} iframes - Collection of Vimeo iframes
 * @returns {Promise<Array<Vimeo.Player>>} Promise that resolves when all players are ready
 */
export function initVimeoPlayers(iframes) {
  const iframeArray = Array.from(iframes)
  const playerPromises = iframeArray.map(iframe => initVimeoPlayer(iframe))
  return Promise.all(playerPromises)
}

