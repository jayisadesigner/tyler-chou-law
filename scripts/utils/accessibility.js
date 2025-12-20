/**
 * Accessibility Utilities
 * WCAG 2.1 contrast ratio calculations and validation
 */

/**
 * Calculate relative luminance (WCAG 2.1)
 */
function getRelativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Get RGB values from hex color
 */
function hexToRgbValues(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`)
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  }
}

/**
 * Calculate contrast ratio between two colors (WCAG 2.1)
 * @param {string} color1 - First color in hex format
 * @param {string} color2 - Second color in hex format
 * @returns {number} Contrast ratio (1.0 to 21.0)
 */
export function calculateContrastRatio(color1, color2) {
  const rgb1 = hexToRgbValues(color1)
  const rgb2 = hexToRgbValues(color2)
  
  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)
  
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if contrast ratio meets WCAG AA standards
 * @param {number} ratio - Contrast ratio
 * @param {string} level - 'AA' or 'AAA'
 * @param {boolean} isLargeText - Whether this is large text (18px+ or 14px+ bold)
 * @returns {boolean} True if meets standard
 */
export function meetsWCAGStandard(ratio, level = 'AA', isLargeText = false) {
  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7
  } else {
    // AA level
    return isLargeText ? ratio >= 3 : ratio >= 4.5
  }
}

/**
 * Validate color pair for accessibility
 * @param {string} foreground - Foreground color (hex)
 * @param {string} background - Background color (hex)
 * @param {string} level - 'AA' or 'AAA'
 * @param {boolean} isLargeText - Whether this is large text
 * @returns {Object} Validation result
 */
export function validateColorPair(foreground, background, level = 'AA', isLargeText = false) {
  const ratio = calculateContrastRatio(foreground, background)
  const passes = meetsWCAGStandard(ratio, level, isLargeText)
  
  return {
    foreground,
    background,
    ratio: Math.round(ratio * 100) / 100,
    passes,
    required: isLargeText ? (level === 'AAA' ? 4.5 : 3) : (level === 'AAA' ? 7 : 4.5),
    level,
    isLargeText
  }
}

/**
 * Validate multiple color pairs
 * @param {Array} pairs - Array of [foreground, background] pairs
 * @param {string} level - 'AA' or 'AAA'
 * @param {Object} colorMap - Map of color names to hex values
 * @returns {Array} Array of validation results
 */
export function validateColorPairs(pairs, level, colorMap) {
  const results = []
  
  for (const [fgName, bgName, isLargeText = false] of pairs) {
    const foreground = colorMap[fgName] || fgName
    const background = colorMap[bgName] || bgName
    
    // Handle color scale references (e.g., "chuparosa-600")
    const fgColor = resolveColorReference(foreground, colorMap)
    const bgColor = resolveColorReference(background, colorMap)
    
    if (!fgColor || !bgColor) {
      results.push({
        foreground: fgName,
        background: bgName,
        error: `Could not resolve color: ${!fgColor ? fgName : bgName}`
      })
      continue
    }
    
    results.push(validateColorPair(fgColor, bgColor, level, isLargeText))
  }
  
  return results
}

/**
 * Resolve color reference (handles scale references like "chuparosa-600")
 */
function resolveColorReference(ref, colorMap) {
  // If it's already a hex color, return it
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(ref)) {
    return ref
  }
  
  // Check if it's a direct key in colorMap
  if (colorMap[ref]) {
    return colorMap[ref]
  }
  
  // Check if it's a scale reference (e.g., "chuparosa-600")
  const scaleMatch = ref.match(/^([a-z-]+)-(\d+)$/i)
  if (scaleMatch) {
    const [, paletteName, position] = scaleMatch
    const scaleKey = `${paletteName}-${position}`
    return colorMap[scaleKey]
  }
  
  return null
}

/**
 * Format validation results for console output
 */
export function formatValidationResults(results) {
  const passed = results.filter(r => r.passes && !r.error)
  const failed = results.filter(r => !r.passes && !r.error)
  const errors = results.filter(r => r.error)
  
  return {
    passed,
    failed,
    errors,
    total: results.length,
    passCount: passed.length,
    failCount: failed.length,
    errorCount: errors.length
  }
}

