/**
 * Color Utilities
 * HSL-based color conversion and palette generation
 */

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex) {
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
 * Convert RGB to HSL
 */
export function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h, s, l) {
  h /= 360
  s /= 100
  l /= 100

  let r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.round(n).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

/**
 * Convert hex to HSL
 */
export function hexToHsl(hex) {
  const rgb = hexToRgb(hex)
  return rgbToHsl(rgb.r, rgb.g, rgb.b)
}

/**
 * Convert HSL to hex
 */
export function hslToHex(h, s, l) {
  const rgb = hslToRgb(h, s, l)
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

/**
 * Tailwind-inspired lightness scale
 * Matches the lightness curve used in Tailwind CSS
 */
const LIGHTNESS_SCALE = {
  50: 98,
  100: 95,
  200: 90,
  300: 80,
  400: 65,
  500: 50,
  600: 40,
  700: 30,
  800: 20,
  900: 15,
  950: 10
}

/**
 * Generate a color scale from a base color at a specific position
 * @param {string} baseHex - Base color in hex format
 * @param {number} basePosition - Position of base color (500, 600, etc.)
 * @param {number} targetHue - Target hue (0-360), null to preserve base hue
 * @returns {Object} Object with scale positions as keys and hex colors as values
 */
export function generateColorScale(baseHex, basePosition, targetHue = null) {
  const baseHsl = hexToHsl(baseHex)
  const baseLightness = baseHsl.l
  const targetLightness = LIGHTNESS_SCALE[basePosition]
  
  // Calculate lightness adjustment factor
  const lightnessDiff = baseLightness - targetLightness
  
  // Use target hue if provided, otherwise use base hue
  const hue = targetHue !== null ? targetHue : baseHsl.h
  
  // Preserve saturation from base color
  const saturation = baseHsl.s
  
  const scale = {}
  
  // Generate colors for each scale position
  for (const [position, targetL] of Object.entries(LIGHTNESS_SCALE)) {
    // For the base position, use the exact input color
    if (parseInt(position) === basePosition) {
      scale[position] = baseHex
      continue
    }
    
    // Adjust lightness relative to base position
    const adjustedLightness = Math.max(0, Math.min(100, targetL + lightnessDiff))
    
    // Maintain saturation, but allow slight variation for very light/dark colors
    let adjustedSaturation = saturation
    if (adjustedLightness > 95) {
      // Very light colors need reduced saturation
      adjustedSaturation = Math.max(0, saturation * 0.3)
    } else if (adjustedLightness < 15) {
      // Very dark colors can have slightly higher saturation
      adjustedSaturation = Math.min(100, saturation * 1.1)
    }
    
    scale[position] = hslToHex(hue, adjustedSaturation, adjustedLightness)
  }
  
  return scale
}

/**
 * Generate opacity variant (rgba string)
 */
export function generateOpacityVariant(hex, opacity) {
  const rgb = hexToRgb(hex)
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
}

/**
 * Generate all opacity variants for a color
 */
export function generateOpacityVariants(hex, name) {
  const variants = {}
  const opacities = [0, 0.1, 0.2, 0.25, 0.3, 0.5]
  
  for (const opacity of opacities) {
    const key = Math.round(opacity * 100)
    variants[`${name}-${key === 0 ? '0' : key}`] = generateOpacityVariant(hex, opacity)
  }
  
  return variants
}

