/**
 * Roster Build Script
 * Reads content/roster/*.yml and:
 *   1. Generates roster/[slug].html for creators without external_url
 *   2. Injects roster cards into index.html and roster.html
 *
 * on all generated pages (text, image, array types).
 */

import { readFile, writeFile, readdir, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import yaml from 'js-yaml'
import { escapeHtml, escapeJson, safeUrl } from './utils/escape.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

const rosterContentDir = join(projectRoot, 'content', 'roster')
const rosterPagesDir = join(projectRoot, 'roster')

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * A slug becomes both a URL and a filename, so keep it to characters that are
 * safe in each — this stops a `slug: ../../etc/foo` in YAML from writing
 * outside roster/.
 */
function isSafeSlug(slug) {
  return typeof slug === 'string' && /^[a-z0-9][a-z0-9-]*$/i.test(slug)
}

/** YouTube ids are opaque; allow only the characters the API actually uses. */
function isSafeVideoId(id) {
  return typeof id === 'string' && /^[\w-]{5,32}$/.test(id)
}

// ─── Roster card (used in index.html and roster.html) ────────────────────────

function generateRosterCard(creator) {
  const isExternal = Boolean(creator.external_url)
  const href = isExternal ? safeUrl(creator.external_url) : `/roster/${escapeHtml(creator.slug)}.html`
  const externalAttrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''

  return `<a href="${href}" class="roster-card" aria-label="View ${escapeHtml(creator.handle)} profile"${externalAttrs}>
              <div class="roster-card__image-wrapper">
                <img src="${safeUrl(creator.photo)}" alt="${escapeHtml(creator.handle)}" class="roster-card__image" width="800" height="800" loading="lazy">
                <div class="roster-card__overlay"></div>
                <div class="roster-card__scrim"></div>
              </div>
              <p class="roster-card__handle">${escapeHtml(creator.handle)}</p>
            </a>`
}

// ─── Individual creator page ──────────────────────────────────────────────────

function generateCreatorPage(creator) {
  const rawDescription = creator.seo_description || (creator.bio && creator.bio[0]) || ''
  const seoDescription = escapeHtml(rawDescription)
  const canonicalUrl = `https://tylerchoulaw.com/roster/${encodeURIComponent(creator.slug)}.html`
  const photoAbsolute = safeUrl(`https://tylerchoulaw.com${creator.photo || ''}`)

  const statsHtml = (creator.stats || []).map(stat => `
              <div class="creator-stat">
                <p class="creator-stat-value">${escapeHtml(stat.value)}</p>
                <p class="creator-stat-label">${escapeHtml(stat.label)}</p>
              </div>`).join('')

  const bioHtml = (creator.bio || []).map(p => `              <p>${escapeHtml(p)}</p>`).join('\n')

  const videosHtml = (creator.featured_videos && creator.featured_videos.length) ? `
          <div class="creator-videos">
            <h2>Featured Videos</h2>
            <div class="youtube-videos-grid">
              ${creator.featured_videos.filter(isSafeVideoId).map(videoId => `<div class="youtube-video">
                <a href="https://youtube.com/watch?v=${videoId}" target="_blank" rel="noopener noreferrer" class="youtube-video__card">
                  <img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="Featured video" class="youtube-video__image">
                  <div class="youtube-video__overlay">
                    <img src="/src/assets/icons/play.svg" alt="" class="youtube-video__play-icon" aria-hidden="true">
                  </div>
                </a>
              </div>`).join('\n              ')}
            </div>
          </div>` : ''

  const youtubeUrl = safeUrl(creator.youtube_url)
  const sameAsJson = youtubeUrl ? `,\n      "sameAs": ["${escapeJson(creator.youtube_url)}"]` : ''

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#120203" />
    <style>
      body:not(.ready) { visibility: hidden; }
      body:not(.ready) { animation: show-after-load 0.01s 3s forwards; }
      @keyframes show-after-load { to { visibility: visible; } }
    </style>
    <script>
      window.addEventListener('load', function() {
        document.body.classList.add('ready');
      });
    </script>
    <link rel="stylesheet" href="/src/styles/main.css">
    <title>${escapeHtml(creator.handle)} | Tyler Chou Law Roster</title>
    <meta name="description" content="${seoDescription}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:title" content="${escapeHtml(creator.handle)} | Tyler Chou Law Roster" />
    <meta property="og:description" content="${seoDescription}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${photoAbsolute}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(creator.handle)} | Tyler Chou Law Roster" />
    <meta name="twitter:description" content="${seoDescription}" />
    <meta name="twitter:image" content="${photoAbsolute}" />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "${escapeJson(creator.handle)}",
      "description": "${escapeJson(rawDescription)}",
      "url": "${escapeJson(canonicalUrl)}"${sameAsJson}
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://tylerchoulaw.com/" },
        { "@type": "ListItem", "position": 2, "name": "Roster", "item": "https://tylerchoulaw.com/roster.html" },
        { "@type": "ListItem", "position": 3, "name": "${escapeJson(creator.handle)}", "item": "${escapeJson(canonicalUrl)}" }
      ]
    }
    </script>
  </head>
  <body class="page-creator">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <header class="site-header"></header>
    <main id="main-content">
      <article class="content-section content-section--media-bleed content-section--parallax">
        <div class="content-section__container">
          <div class="content-section__media">
            <div class="background-image">
              <img
                src="${safeUrl(creator.photo)}"
                alt="${escapeHtml(creator.handle)}"
                class="background-image__img"
              >
            </div>
            <h1 class="creator-name">${escapeHtml(creator.handle)}</h1>
          </div>
          <div class="content-section__content">
            <div class="creator-stats">
              ${statsHtml}
            </div>
            <div class="creator-description">
${bioHtml}
            </div>
            ${videosHtml}
          </div>
        </div>
      </article>
    </main>
    <footer class="site-footer"></footer>
    <script type="module" src="/src/scripts/main.js"></script>
  </body>
</html>`
}

// ─── Inject roster cards into a page ─────────────────────────────────────────

async function injectRosterCards(pagePath, cardsHtml) {
  let html = await readFile(pagePath, 'utf-8')

  const start = '<!-- ROSTER_CARDS_START -->'
  const end = '<!-- ROSTER_CARDS_END -->'
  const startIdx = html.indexOf(start)
  const endIdx = html.indexOf(end)

  if (startIdx === -1 || endIdx === -1) {
    console.warn(`  ⚠ Roster card placeholders not found in ${pagePath}`)
    return
  }

  html = html.substring(0, startIdx + start.length) +
    '\n            ' + cardsHtml.join('\n            ') +
    '\n            ' + html.substring(endIdx)

  await writeFile(pagePath, html, 'utf-8')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function buildRoster() {
  console.log('Building roster...')

  // Read all YAML files
  const files = (await readdir(rosterContentDir)).filter(f => f.endsWith('.yml'))

  const creators = []
  for (const file of files) {
    const raw = await readFile(join(rosterContentDir, file), 'utf-8')
    const data = yaml.load(raw)
    creators.push(data)
  }

  // Sort by order field
  creators.sort((a, b) => (a.order || 99) - (b.order || 99))

  // Ensure roster pages directory exists
  if (!existsSync(rosterPagesDir)) {
    await mkdir(rosterPagesDir, { recursive: true })
  }

  // Generate individual creator pages (skip those with external_url)
  for (const creator of creators) {
    if (creator.external_url) {
      console.log(`  ↗ Skipped (external): ${creator.handle}`)
      continue
    }
    if (!isSafeSlug(creator.slug)) {
      console.warn(`  ⚠ Skipped (unsafe slug): ${creator.handle} → ${creator.slug}`)
      continue
    }
    const html = generateCreatorPage(creator)
    const outPath = join(rosterPagesDir, `${creator.slug}.html`)
    await writeFile(outPath, html, 'utf-8')
    console.log(`  ✓ Generated: roster/${creator.slug}.html`)
  }

  // Build roster card HTML for all creators
  const cards = creators.map(generateRosterCard)

  // Inject into index.html and roster.html
  const indexPath = join(projectRoot, 'index.html')
  const rosterPagePath = join(projectRoot, 'roster.html')

  await injectRosterCards(indexPath, cards)
  console.log('  ✓ Injected cards into index.html')

  await injectRosterCards(rosterPagePath, cards)
  console.log('  ✓ Injected cards into roster.html')

  console.log(`\n✓ Roster build complete — ${creators.length} creators`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  buildRoster()
}
