/**
 * Color Generation Script
 * Generates color palettes maintaining visual consistency and WCAG AA accessibility
 */

import { readFile, writeFile, copyFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { generateColorScale, generateOpacityVariants, hexToHsl, hslToHex } from './utils/color-utils.js'
import { validateColorPairs, formatValidationResults, calculateContrastRatio } from './utils/accessibility.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

const CONFIG_PATH = join(projectRoot, 'color-config.json')
const VARIABLES_CSS_PATH = join(projectRoot, 'src', 'styles', 'variables.css')

// Base colors that need to work on chuparosa-600
const BASE_COLORS = {
  bone: '#FFFFF5',
  obsidian: '#120203',
  black: '#000000',
  white: '#FFFFFF'
}

/**
 * Load and parse config file
 */
async function loadConfig() {
  try {
    const configText = await readFile(CONFIG_PATH, 'utf-8')
    return JSON.parse(configText)
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Config file not found: ${CONFIG_PATH}`)
    }
    throw new Error(`Failed to parse config: ${error.message}`)
  }
}

/**
 * Save config file
 */
async function saveConfig(config) {
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n', 'utf-8')
}

/**
 * Generate all color palettes
 */
function generatePalettes(baseRed, basePosition, palettes) {
  const allColors = { ...BASE_COLORS }
  const generatedPalettes = {}
  
  // Generate chuparosa palette (base red)
  const chuparosaHsl = hexToHsl(baseRed)
  const chuparosaScale = generateColorScale(baseRed, basePosition, chuparosaHsl.h)
  generatedPalettes.chuparosa = chuparosaScale
  
  // Add chuparosa colors to allColors map
  for (const [position, color] of Object.entries(chuparosaScale)) {
    allColors[`chuparosa-${position}`] = color
  }
  
  // Convert camelCase to kebab-case helper
  const toKebabCase = (str) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  
  // Generate related palettes
  // Get the HSL of chuparosa at base position to extract lightness
  const chuparosaBaseHsl = hexToHsl(chuparosaScale[basePosition.toString()])
  
  for (const [name, paletteConfig] of Object.entries(palettes)) {
    if (!paletteConfig.enabled || name === 'chuparosa') continue
    
    // Create a base color with target hue but matching lightness from chuparosa
    // This ensures visual weight consistency across palettes
    const baseColorForPalette = hslToHex(
      paletteConfig.hue,
      chuparosaBaseHsl.s, // Match saturation for consistency
      chuparosaBaseHsl.l  // Match lightness for visual weight
    )
    
    // Generate palette with target hue but matching lightness curve
    const paletteScale = generateColorScale(baseColorForPalette, basePosition, paletteConfig.hue)
    generatedPalettes[name] = paletteScale
    
    // Add to allColors map (use kebab-case for CSS variable names)
    const cssName = toKebabCase(name)
    for (const [position, color] of Object.entries(paletteScale)) {
      allColors[`${cssName}-${position}`] = color
    }
  }
  
  return { generatedPalettes, allColors }
}

/**
 * Generate opacity variants
 */
function generateAllOpacityVariants(palettes, baseColors) {
  const variants = {}
  
  // Obsidian variants
  const obsidianVariants = generateOpacityVariants(baseColors.obsidian, 'obsidian')
  Object.assign(variants, obsidianVariants)
  
  // Bone variants
  const boneVariants = generateOpacityVariants(baseColors.bone, 'bone')
  Object.assign(variants, boneVariants)
  
  // White variants
  const whiteVariants = generateOpacityVariants(baseColors.white, 'white')
  Object.assign(variants, whiteVariants)
  
  // Chuparosa variants (for gradients)
  const chuparosa500 = palettes.chuparosa['500']
  variants['chuparosa-rgba-25'] = generateOpacityVariants(chuparosa500, 'chuparosa-rgba')['chuparosa-rgba-25']
  
  // Chuparosa-950 variants (for shadows)
  const chuparosa950 = palettes.chuparosa['950']
  const chuparosa950Variants = generateOpacityVariants(chuparosa950, 'chuparosa-950')
  Object.assign(variants, chuparosa950Variants)
  
  // Lupine variants (for gradients)
  if (palettes.lupine) {
    const lupine500 = palettes.lupine['500']
    variants['lupine-rgba-25'] = generateOpacityVariants(lupine500, 'lupine-rgba')['lupine-rgba-25']
  }
  
  // Desert gold variants (for gradients)
  if (palettes.desertGold) {
    const desertGold500 = palettes.desertGold['500']
    variants['desert-gold-rgba-20'] = generateOpacityVariants(desertGold500, 'desert-gold-rgba')['desert-gold-rgba-20']
  }
  
  // Obsidian dark variants (for video overlays)
  const obsidianDark = '#0D0809'
  variants['obsidian-dark-20'] = generateOpacityVariants(obsidianDark, 'obsidian-dark')['obsidian-dark-20']
  variants['obsidian-dark-50'] = generateOpacityVariants(obsidianDark, 'obsidian-dark')['obsidian-dark-50']
  
  return variants
}

/**
 * Parse CSS file and extract non-color sections
 */
async function parseCSSFile() {
  const content = await readFile(VARIABLES_CSS_PATH, 'utf-8')
  
  // Find the start and end of color sections to preserve everything else
  const lines = content.split('\n')
  
  // Find indices of color sections
  let baseColorsStart = -1
  let baseColorsEnd = -1
  let opacityStart = -1
  let opacityEnd = -1
  let colorPalettesStart = -1
  let colorPalettesEnd = -1
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    if (line.includes('/* Base Colors */')) {
      baseColorsStart = i
    } else if (baseColorsStart >= 0 && line.includes('/* Opacity Variants */')) {
      baseColorsEnd = i
      opacityStart = i
    } else if (opacityStart >= 0 && line.match(/\/\* (Chuparosa|Lupine|Palo Verde|Desert Gold)/)) {
      opacityEnd = i
      colorPalettesStart = i
    } else if (colorPalettesStart >= 0 && line.includes('/* Spacing System */')) {
      colorPalettesEnd = i
      break
    }
  }
  
  // Extract non-color sections
  const beforeColors = lines.slice(0, baseColorsStart >= 0 ? baseColorsStart : 0).join('\n')
  const afterColors = colorPalettesEnd >= 0 
    ? lines.slice(colorPalettesEnd).join('\n')
    : (opacityEnd >= 0 ? lines.slice(opacityEnd).join('\n') : '')
  
  return {
    beforeColors: beforeColors + (beforeColors ? '\n' : ''),
    afterColors: afterColors ? '\n' + afterColors : ''
  }
}

/**
 * Generate nav/footer text color mappings based on background colors
 * Automatically finds best WCAG AA compliant colors
 */
function generateNavColorMappings(allColors, generatedPalettes) {
  // Convert camelCase to kebab-case helper
  const toKebabCase = (str) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  
  // Automatically find all potential background colors
  const backgrounds = ['bone', 'obsidian', 'black', 'white']
  
  // Add all palette colors at positions 600, 700, 800, 900 (typical background positions)
  Object.keys(generatedPalettes).forEach(paletteName => {
    const cssName = toKebabCase(paletteName)
    ;['600', '700', '800', '900'].forEach(pos => {
      if (generatedPalettes[paletteName][pos]) {
        backgrounds.push(`${cssName}-${pos}`)
      }
    })
  })
  
  let css = '\n/* Nav/Footer Text Color Mappings (WCAG AA) */\n'
  css += '/* Automatically generated - best contrast colors for each background */\n'
  css += ':root {\n'
  
  backgrounds.forEach(bgName => {
    const bgColor = allColors[bgName]
    if (!bgColor) return
    
    // Find best contrast color that meets WCAG AA (4.5:1)
    // Prefer design system colors over pure white/black
    let bestColor = null
    let bestContrast = 0
    const designSystemColors = [] // Colors from palettes
    const baseColors = [] // Pure white/black
    
    Object.entries(allColors).forEach(([name, color]) => {
      // Skip the background color itself
      if (name === bgName) return
      
      const contrast = calculateContrastRatio(color, bgColor)
      
      // Categorize colors
      if (name === 'white' || name === 'black') {
        baseColors.push({ name, color, contrast })
      } else {
        designSystemColors.push({ name, color, contrast })
      }
      
      // Prefer colors that meet WCAG AA and have highest contrast
      if (contrast >= 4.5 && contrast > bestContrast) {
        bestContrast = contrast
        bestColor = name
      }
    })
    
    // If we have design system colors that meet AA, prefer those over white/black
    if (bestColor && (bestColor === 'white' || bestColor === 'black')) {
      const bestDesignSystem = designSystemColors
        .filter(c => c.contrast >= 4.5)
        .sort((a, b) => b.contrast - a.contrast)[0]
      
      if (bestDesignSystem && bestDesignSystem.contrast >= 4.5) {
        bestColor = bestDesignSystem.name
        bestContrast = bestDesignSystem.contrast
      }
    }
    
    // If no color meets AA, use highest contrast anyway
    if (!bestColor) {
      Object.entries(allColors).forEach(([name, color]) => {
        if (name === bgName) return
        const contrast = calculateContrastRatio(color, bgColor)
        if (contrast > bestContrast) {
          bestContrast = contrast
          bestColor = name
        }
      })
    }
    
    if (bestColor) {
      // Convert color name to CSS variable format
      const cssVarName = bestColor.replace(/-(\d+)$/, '-$1') // Keep as-is
      const bgCssVar = bgName.replace(/-(\d+)$/, '-$1')
      css += `  --nav-text-on-${bgCssVar}: var(--${cssVarName});\n`
    }
  })
  
  css += '}\n\n'
  return css
}

/**
 * Generate CSS color sections
 */
function generateColorSections(palettes, opacityVariants, config, allColors) {
  let css = ''
  
  // Base Colors section
  css += '/* Base Colors */\n'
  css += ':root {\n'
  css += `  --bone: ${BASE_COLORS.bone};      /* Off-white, warm */\n`
  css += `  --obsidian: ${BASE_COLORS.obsidian};  /* Deep black with red undertone */\n`
  css += `  --focus-color: #99b4ff; /* Focus indicator blue */\n`
  css += `  --gray-200: #d1d1d1;   /* Light gray for active states */\n`
  css += `  --gray-400: #888;      /* Medium gray for disabled states */\n`
  css += `  --gray-600: #666;      /* Dark gray for disabled text */\n`
  css += `  --black: ${BASE_COLORS.black};     /* Pure black */\n`
  css += `  --white: ${BASE_COLORS.white};     /* Pure white */\n`
  css += '}\n\n'
  
  // Opacity Variants section
  css += '/* Opacity Variants */\n'
  css += ':root {\n'
  
  // Obsidian variants
  css += '  /* Obsidian opacity variants */\n'
  css += `  --obsidian-0: ${opacityVariants['obsidian-0']};\n`
  css += `  --obsidian-10: ${opacityVariants['obsidian-10']};\n`
  css += `  --obsidian-20: ${opacityVariants['obsidian-20']};\n`
  css += `  --obsidian-30: ${opacityVariants['obsidian-30']};\n`
  css += `  --obsidian-50: ${opacityVariants['obsidian-50']};\n`
  css += '  \n'
  
  // Bone/White variants
  css += '  /* Bone/White opacity variants */\n'
  css += `  --bone-10: ${opacityVariants['bone-10']};\n`
  css += `  --white-10: ${opacityVariants['white-10']};\n`
  css += '  \n'
  
  // Chuparosa variants
  if (opacityVariants['chuparosa-rgba-25']) {
    css += '  /* Chuparosa opacity variants (for gradients) */\n'
    css += `  --chuparosa-rgba-25: ${opacityVariants['chuparosa-rgba-25']};\n`
    css += '  \n'
  }
  
  // Chuparosa-950 variants
  if (opacityVariants['chuparosa-950-01']) {
    css += '  /* Chuparosa-950 opacity variants (for shadows) */\n'
    css += `  --chuparosa-950-01: ${opacityVariants['chuparosa-950-01']};\n`
    css += `  --chuparosa-950-05: ${opacityVariants['chuparosa-950-05']};\n`
    css += `  --chuparosa-950-18: ${opacityVariants['chuparosa-950-18']};\n`
    css += `  --chuparosa-950-30: ${opacityVariants['chuparosa-950-30']};\n`
    css += `  --chuparosa-950-34: ${opacityVariants['chuparosa-950-34']};\n`
    css += '  \n'
  }
  
  // Lupine variants
  if (opacityVariants['lupine-rgba-25']) {
    css += '  /* Lupine opacity variants (for gradients) */\n'
    css += `  --lupine-rgba-25: ${opacityVariants['lupine-rgba-25']};\n`
    css += '  \n'
  }
  
  // Desert gold variants
  if (opacityVariants['desert-gold-rgba-20']) {
    css += '  /* Desert gold opacity variants (for gradients) */\n'
    css += `  --desert-gold-rgba-20: ${opacityVariants['desert-gold-rgba-20']};\n`
    css += '  \n'
  }
  
  // Obsidian dark variants
  if (opacityVariants['obsidian-dark-20']) {
    css += '  /* Obsidian dark variant (for video overlays) */\n'
    css += `  --obsidian-dark-20: ${opacityVariants['obsidian-dark-20']};\n`
    css += `  --obsidian-dark-50: ${opacityVariants['obsidian-dark-50']};\n`
  }
  
  css += '}\n\n'
  
  // Generate palette sections
  const paletteNames = {
    chuparosa: 'Chuparosa (Red) - Power, protection, intensity',
    lupine: 'Lupine (Purple) - Creativity, wisdom, premium',
    paloVerde: 'Palo Verde (Green) - Growth, resilience, life',
    desertGold: 'Desert Gold (Yellow/Gold) - Achievement, value, legacy'
  }
  
  // Convert camelCase to kebab-case for CSS variable names
  const toKebabCase = (str) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  
  for (const [name, scale] of Object.entries(palettes)) {
    const displayName = paletteNames[name] || config.palettes[name]?.description || `${name.charAt(0).toUpperCase() + name.slice(1)}`
    const cssName = toKebabCase(name)
    css += `/* ${displayName} */\n`
    css += ':root {\n'
    
    const positions = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']
    for (const pos of positions) {
      if (scale[pos]) {
        const comment = pos === '500' ? '  /* Primary color */' : ''
        css += `  --${cssName}-${pos}: ${scale[pos]};${comment}\n`
      }
    }
    
    css += '}\n\n'
  }
  
  // Add nav color mappings
  const navMappings = generateNavColorMappings(allColors, palettes)
  
  return css + navMappings
}

/**
 * Reassemble CSS file
 */
function reassembleCSS(parsedSections, colorSections) {
  return parsedSections.beforeColors + colorSections + parsedSections.afterColors
}

/**
 * Create backup of variables.css
 */
async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const backupPath = `${VARIABLES_CSS_PATH}.backup.${timestamp}`
  await copyFile(VARIABLES_CSS_PATH, backupPath)
  return backupPath
}

/**
 * Parse CLI arguments
 */
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    red: null,
    add: false,
    remove: false,
    enable: false,
    disable: false,
    name: null,
    hue: null,
    color: null,
    base: 600,
    preview: false,
    list: false,
    validate: false,
    noBackup: false,
    force: false
  }
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    if (arg === '--red' || arg === '-r') {
      options.red = args[++i]
    } else if (arg === '--add') {
      options.add = true
    } else if (arg === '--remove') {
      options.remove = true
    } else if (arg === '--enable') {
      options.enable = true
    } else if (arg === '--disable') {
      options.disable = true
    } else if (arg === '--name') {
      options.name = args[++i]
    } else if (arg === '--hue') {
      options.hue = parseInt(args[++i])
    } else if (arg === '--color') {
      options.color = args[++i]
    } else if (arg === '--base') {
      options.base = parseInt(args[++i])
    } else if (arg === '--preview') {
      options.preview = true
    } else if (arg === '--list') {
      options.list = true
    } else if (arg === '--validate') {
      options.validate = true
    } else if (arg === '--no-backup') {
      options.noBackup = true
    } else if (arg === '--force') {
      options.force = true
    }
  }
  
  return options
}

/**
 * Main function
 */
async function main() {
  try {
    const options = parseArgs()
    
    // Load config
    let config = await loadConfig()
    
    // Handle list command
    if (options.list) {
      console.log('\nConfigured Palettes:')
      for (const [name, palette] of Object.entries(config.palettes)) {
        const status = palette.enabled ? '✓' : '✗'
        console.log(`  ${status} ${name}: ${palette.description || ''} (hue: ${palette.hue})`)
      }
      return
    }
    
    // Handle add/remove/enable/disable
    if (options.add || options.remove || options.enable || options.disable) {
      if (!options.name) {
        console.error('Error: --name required for add/remove/enable/disable')
        process.exit(1)
      }
      
      if (options.add) {
        if (!options.hue && !options.color) {
          console.error('Error: --hue or --color required for --add')
          process.exit(1)
        }
        
        const hue = options.hue || (options.color ? hexToHsl(options.color).h : null)
        config.palettes[options.name] = {
          hue,
          enabled: true,
          description: `Custom palette: ${options.name}`
        }
        await saveConfig(config)
        console.log(`✓ Added palette: ${options.name}`)
        return
      }
      
      if (options.remove) {
        delete config.palettes[options.name]
        await saveConfig(config)
        console.log(`✓ Removed palette: ${options.name}`)
        return
      }
      
      if (options.enable || options.disable) {
        if (config.palettes[options.name]) {
          config.palettes[options.name].enabled = options.enable
          await saveConfig(config)
          console.log(`✓ ${options.enable ? 'Enabled' : 'Disabled'} palette: ${options.name}`)
        } else {
          console.error(`Error: Palette not found: ${options.name}`)
          process.exit(1)
        }
        return
      }
    }
    
    // Override base red if provided
    if (options.red) {
      config.baseRed = options.red
    }
    
    // Generate palettes
    const { generatedPalettes, allColors } = generatePalettes(
      config.baseRed,
      config.baseRedPosition,
      config.palettes
    )
    
    // Generate opacity variants
    const opacityVariants = generateAllOpacityVariants(generatedPalettes, BASE_COLORS)
    
    // Validate accessibility
    if (!options.force) {
      const validationResults = validateColorPairs(
        config.accessibility.testPairs,
        config.accessibility.enforceLevel,
        allColors
      )
      
      const formatted = formatValidationResults(validationResults)
      
      if (options.validate) {
        // Validation-only mode
        console.log('\nAccessibility Validation Results:')
        console.log(`  Total pairs: ${formatted.total}`)
        console.log(`  Passed: ${formatted.passCount}`)
        console.log(`  Failed: ${formatted.failCount}`)
        
        if (formatted.failed.length > 0) {
          console.log('\n  Failed pairs:')
          for (const result of formatted.failed) {
            console.log(`    ✗ ${result.foreground} on ${result.background}: ${result.ratio}:1 (required: ${result.required}:1)`)
          }
        }
        
        if (formatted.errors.length > 0) {
          console.log('\n  Errors:')
          for (const error of formatted.errors) {
            console.log(`    ✗ ${error.foreground} on ${error.background}: ${error.error}`)
          }
        }
        
        process.exit(formatted.failCount > 0 ? 1 : 0)
        return
      }
      
      // Check for failures
      if (formatted.failCount > 0) {
        console.error('\n✗ Accessibility validation failed:')
        for (const result of formatted.failed) {
          console.error(`  ${result.foreground} on ${result.background}: ${result.ratio}:1 (required: ${result.required}:1)`)
        }
        console.error('\nCannot proceed. Adjust colors or use --force (not recommended)')
        process.exit(1)
      }
      
      // Show warnings for low contrast
      if (formatted.passed.length > 0) {
        for (const result of formatted.passed) {
          const margin = result.ratio - result.required
          if (margin < 0.5) {
            console.warn(`⚠ Warning: ${result.foreground} on ${result.background} has contrast ratio ${result.ratio}:1 (close to minimum)`)
          }
        }
      }
    }
    
    // Preview mode
    if (options.preview) {
      console.log('\nGenerated Colors (Preview):')
      for (const [name, scale] of Object.entries(generatedPalettes)) {
        console.log(`\n${name}:`)
        for (const [pos, color] of Object.entries(scale)) {
          console.log(`  ${pos}: ${color}`)
        }
      }
      return
    }
    
    // Parse existing CSS
    const parsedSections = await parseCSSFile()
    
    // Generate new color sections
    const colorSections = generateColorSections(generatedPalettes, opacityVariants, config, allColors)
    
    // Reassemble CSS
    const newCSS = reassembleCSS(parsedSections, colorSections)
    
    // Create backup
    let backupPath = null
    if (!options.noBackup) {
      backupPath = await createBackup()
    }
    
    // Write new CSS
    await writeFile(VARIABLES_CSS_PATH, newCSS, 'utf-8')
    
    // Report success
    console.log('\n✓ Generated color palettes')
    console.log(`✓ Updated ${VARIABLES_CSS_PATH}`)
    if (backupPath) {
      console.log(`✓ Backup created: ${backupPath}`)
    }
    
  } catch (error) {
    console.error(`\n✗ Error: ${error.message}`)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

// Run main function
main()

