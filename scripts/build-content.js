/**
 * build-content.js
 * Reads YAML data files from content/data/ and injects generated HTML
 * into placeholder comments in index.html, services.html, and creatorarq.html.
 *
 * Content blocks handled:
 *   - Testimonials (index.html) → content/data/testimonials.yml
 *   - Home service cards (index.html) → content/data/home-services.yml
 *   - Services infra capability cards → content/data/services-caps-infra.yml
 *   - Services IP capability cards → content/data/services-caps-ip.yml
 *   - CreatorArq agency cards → content/data/creatorarq-caps-agencies.yml
 *   - CreatorArq exit cards → content/data/creatorarq-caps-exit.yml
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import yaml from 'js-yaml'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

function readYaml(filename) {
  const filePath = join(ROOT, 'content', 'data', filename)
  if (!existsSync(filePath)) return []
  return yaml.load(readFileSync(filePath, 'utf-8')) || []
}

function readHtml(filename) {
  return readFileSync(join(ROOT, filename), 'utf-8')
}

function writeHtml(filename, content) {
  writeFileSync(join(ROOT, filename), content, 'utf-8')
}

function escapeHtml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function inject(html, startTag, endTag, content) {
  const start = `<!-- ${startTag} -->`
  const end = `<!-- ${endTag} -->`
  const startIdx = html.indexOf(start)
  const endIdx = html.indexOf(end)
  if (startIdx === -1 || endIdx === -1) {
    console.warn(`  ⚠  Placeholder not found: ${startTag}`)
    return html
  }
  return (
    html.substring(0, startIdx + start.length) +
    '\n' +
    content +
    '\n            ' +
    html.substring(endIdx)
  )
}

// --- Generators ---

function generateTestimonialCard(t) {
  return `                <article class="roster-card roster-card--testimonial">
                  <div class="roster-card__image-wrapper">
                    <img
                      src="${t.photo}"
                      alt="${escapeHtml(t.name)}"
                      class="roster-card__image"
                      width="800"
                      height="1000"
                      loading="lazy"
                    >
                    <div class="roster-card__overlay"></div>
                    <div class="roster-card__scrim"></div>
                  </div>
                  <div class="roster-card__content">
                    <div class="roster-card__meta">
                      <h4 class="roster-card__name">${escapeHtml(t.name)}</h4>
                      <p class="roster-card__handle">${escapeHtml(t.handle)}</p>
                      <p class="roster-card__stats">${escapeHtml(t.stats)}</p>
                    </div>
                    <p class="roster-card__quote text-large">${escapeHtml(t.quote)}</p>
                  </div>
                </article>`
}

function generateServiceCard(s) {
  return `            <a href="${s.link}" class="service-card">
              <h3 class="service-card__title">${escapeHtml(s.title)}</h3>
              <p class="service-card__description">${escapeHtml(s.description)}</p>
              <span class="btn btn--secondary btn--on-dark btn--chuparosa btn--align-start">${escapeHtml(s.button_text)}</span>
            </a>`
}

function generateCapabilityCard(c) {
  return `            <div class="services-capabilities__cell" role="listitem">
              <div class="services-capabilities__cell-inner">
                <h3 class="services-capabilities__title">${escapeHtml(c.title)}</h3>
                <p class="services-capabilities__text">${escapeHtml(c.text)}</p>
              </div>
            </div>`
}

// --- Main ---

async function buildContent() {
  console.log('\nBuilding data-driven content...')

  // index.html — testimonials + service cards
  const testimonials = readYaml('testimonials.yml')
  const homeServices = readYaml('home-services.yml')

  if (testimonials.length || homeServices.length) {
    let html = readHtml('index.html')

    if (testimonials.length) {
      const mid = Math.ceil(testimonials.length / 2)
      const topHtml = testimonials.slice(0, mid).map(generateTestimonialCard).join('\n\n')
      const bottomHtml = testimonials.slice(mid).map(generateTestimonialCard).join('\n\n')
      html = inject(html, 'TESTIMONIALS_TOP_START', 'TESTIMONIALS_TOP_END', topHtml)
      html = inject(html, 'TESTIMONIALS_BOTTOM_START', 'TESTIMONIALS_BOTTOM_END', bottomHtml)
      console.log(`  ✓ ${testimonials.length} testimonials → index.html`)
    }

    if (homeServices.length) {
      const cardsHtml = homeServices.map(generateServiceCard).join('\n')
      html = inject(html, 'HOME_SERVICES_START', 'HOME_SERVICES_END', cardsHtml)
      console.log(`  ✓ ${homeServices.length} service cards → index.html`)
    }

    writeHtml('index.html', html)
  }

  // services.html — two capability grids
  const capsInfra = readYaml('services-caps-infra.yml')
  const capsIp = readYaml('services-caps-ip.yml')

  if (capsInfra.length || capsIp.length) {
    let html = readHtml('services.html')

    if (capsInfra.length) {
      html = inject(html, 'SERVICES_CAPS_INFRA_START', 'SERVICES_CAPS_INFRA_END',
        capsInfra.map(generateCapabilityCard).join('\n'))
      console.log(`  ✓ ${capsInfra.length} infra capability cards → services.html`)
    }

    if (capsIp.length) {
      html = inject(html, 'SERVICES_CAPS_IP_START', 'SERVICES_CAPS_IP_END',
        capsIp.map(generateCapabilityCard).join('\n'))
      console.log(`  ✓ ${capsIp.length} IP capability cards → services.html`)
    }

    writeHtml('services.html', html)
  }

  // creatorarq.html — two capability grids
  const capsAgencies = readYaml('creatorarq-caps-agencies.yml')
  const capsExit = readYaml('creatorarq-caps-exit.yml')

  if (capsAgencies.length || capsExit.length) {
    let html = readHtml('creatorarq.html')

    if (capsAgencies.length) {
      html = inject(html, 'CREATORARQ_CAPS_AGENCIES_START', 'CREATORARQ_CAPS_AGENCIES_END',
        capsAgencies.map(generateCapabilityCard).join('\n'))
      console.log(`  ✓ ${capsAgencies.length} agency capability cards → creatorarq.html`)
    }

    if (capsExit.length) {
      html = inject(html, 'CREATORARQ_CAPS_EXIT_START', 'CREATORARQ_CAPS_EXIT_END',
        capsExit.map(generateCapabilityCard).join('\n'))
      console.log(`  ✓ ${capsExit.length} exit capability cards → creatorarq.html`)
    }

    writeHtml('creatorarq.html', html)
  }

  console.log('\n✓ Content build complete\n')
}

buildContent().catch(err => {
  console.error('Content build failed:', err)
  process.exit(1)
})
