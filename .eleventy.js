/**
 * Eleventy Configuration
 *
 * Tyler Chou Law for Creators — Eleventy v3 + Bookshop + CloudCannon
 *
 * Pipeline:
 *   src/                       -> input
 *   dist/                      -> output
 *   src/content/pages/*.md     -> rendered through layouts/page.liquid using Bookshop blocks
 *   src/content/blog/*.md      -> rendered through layouts/blog-post.liquid (Phase 3d)
 *   src/content/clients/*.yml  -> per-creator pages via pagination (Phase 3d)
 *   src/content/press/*.md     -> data only, surfaced via the press-grid component on /press/
 *   src/content/speaking/*.md  -> data only, surfaced via the speaking-grid component on /speaking/
 *
 * Bookshop integration:
 *   Components live at  src/components/<name>/<name>.bookshop.{html,yml}
 *   Pages emit them via {% bookshop "name" props %} in layouts.
 *   See: https://github.com/CloudCannon/bookshop
 */

import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'
import { DateTime } from 'luxon'
import * as esbuild from 'esbuild'

import EleventyPluginRss from '@11ty/eleventy-plugin-rss'
import bundlePlugin from '@11ty/eleventy-plugin-bundle'
import Image from '@11ty/eleventy-img'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Bookshop ships CommonJS — load it via createRequire from this ESM file.
const require = createRequire(import.meta.url)
const bookshopPlugin = require('@bookshop/eleventy-bookshop')

export default function (eleventyConfig) {
  // ─── Plugins ───────────────────────────────────────────────────────────────

  eleventyConfig.addPlugin(EleventyPluginRss)
  eleventyConfig.addPlugin(bundlePlugin)
  eleventyConfig.addPlugin(
    bookshopPlugin({
      bookshopLocations: ['component-library']
    })
  )

  // Bookshop emits absolute paths to {% include %}, but LiquidJS resolves
  // includes relative to its `root` array. We add the project root so the
  // absolute paths Bookshop generates are reachable.
  eleventyConfig.setLiquidOptions({
    root: [
      path.resolve(__dirname, 'src/_includes'),
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname)
    ],
    jsTruthy: true,
    dynamicPartials: true
  })

  // ─── Data formats ──────────────────────────────────────────────────────────

  eleventyConfig.addDataExtension('yml,yaml', (contents) => yaml.load(contents))

  // ─── Passthrough copy ──────────────────────────────────────────────────────

  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' })
  eleventyConfig.addPassthroughCopy({ 'src/styles': 'styles' })
  eleventyConfig.addPassthroughCopy({ public: '/' })

  // ─── JS bundling (esbuild) ─────────────────────────────────────────────────
  // Eleventy fires this hook before every build. esbuild's code-splitting
  // separates dynamic imports — e.g. animations are loaded on idle time,
  // not during page parse — and shared deps (gsap, ScrollTrigger) end up in
  // a single shared chunk regardless of which entry triggers them.
  eleventyConfig.on('eleventy.before', async () => {
    await esbuild.build({
      entryPoints: ['src/scripts/main.js'],
      outdir: 'dist/scripts',
      bundle: true,
      splitting: true,
      format: 'esm',
      target: ['es2020'],
      minify: process.env.NODE_ENV !== 'development',
      sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : false,
      legalComments: 'none',
      chunkNames: 'chunks/[name]-[hash]',
      logLevel: 'warning'
    })
  })

  // ─── Watch targets ─────────────────────────────────────────────────────────

  eleventyConfig.addWatchTarget('src/styles/')
  eleventyConfig.addWatchTarget('src/scripts/')
  eleventyConfig.addWatchTarget('component-library/')
  eleventyConfig.addWatchTarget('src/content/')

  // ─── Filters ───────────────────────────────────────────────────────────────

  // formatDate: format an ISO/Date value with Luxon (default: "October 25, 2025").
  eleventyConfig.addFilter('formatDate', (value, format = 'LLLL d, yyyy') => {
    if (!value) return ''
    const dt =
      value instanceof Date
        ? DateTime.fromJSDate(value, { zone: 'utc' })
        : DateTime.fromISO(String(value), { zone: 'utc' })
    return dt.isValid ? dt.toFormat(format) : String(value)
  })

  // isoDate: render an ISO 8601 string for <time datetime="..."> attributes.
  eleventyConfig.addFilter('isoDate', (value) => {
    if (!value) return ''
    const dt =
      value instanceof Date
        ? DateTime.fromJSDate(value, { zone: 'utc' })
        : DateTime.fromISO(String(value), { zone: 'utc' })
    return dt.isValid ? dt.toISO() : ''
  })

  // absolute_url: prepend the site URL to a path. Idempotent for full URLs.
  eleventyConfig.addFilter('absolute_url', (urlPath, base) => {
    if (!urlPath) return base || ''
    if (/^https?:\/\//.test(urlPath)) return urlPath
    const baseUrl = (base || '').replace(/\/$/, '')
    const cleanPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`
    return `${baseUrl}${cleanPath}`
  })

  // jsonLd: stringify safely for inclusion inside <script type="application/ld+json">.
  // Escapes the </ sequence so a stray </script> in a string can't break out of the tag.
  eleventyConfig.addFilter('jsonLd', (value) =>
    JSON.stringify(value, null, 2).replace(/<\//g, '<\\/')
  )

  eleventyConfig.addFilter('limit', (arr, n) => (Array.isArray(arr) ? arr.slice(0, n) : arr))

  eleventyConfig.addFilter('reverseArr', (arr) =>
    Array.isArray(arr) ? [...arr].reverse() : arr
  )

  // line_animate: split a headline string on <br> at build time and wrap each
  // segment in <span class="line-animate__line"><span class="line-animate__inner">…</span></span>.
  // The wrapping is structural — CSS controls the reveal animation entirely.
  // If JS fails or never runs, the headline is fully visible (no opacity 0 anywhere).
  // Pair the output with class="line-animate" on the parent.
  //
  // Typography rules enforced here:
  //   • Each segment is trimmed of leading/trailing whitespace so authoring
  //     "Where <br> Creator" doesn't produce a left-padded line.
  //   • Empty segments are dropped so a trailing <br> doesn't emit a phantom
  //     empty line span (which would still occupy line-height space).
  //   • Inline HTML inside a segment (e.g. <em>, <strong>) passes through —
  //     the filter only splits on <br>, never on word/character boundaries.
  eleventyConfig.addFilter('line_animate', (value) => {
    if (value == null) return ''
    const segments = String(value).split(/<br\s*\/?>/i)
    return segments
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map(
        (line) =>
          `<span class="line-animate__line"><span class="line-animate__inner">${line}</span></span>`
      )
      .join('')
  })

  // ─── Shortcodes ────────────────────────────────────────────────────────────

  // Inline current year for the footer copyright.
  eleventyConfig.addShortcode('year', () => String(new Date().getUTCFullYear()))

  // {% image src, alt, sizes, widths, class %}
  // Generates a responsive <picture> with AVIF + WebP + JPEG fallback. Outputs
  // are written to dist/img/ and cached between builds.
  // Usage in Liquid:
  //   {% image "/assets/images/about/tyler-chou-headshot.jpeg", "Tyler Chou", "(min-width: 768px) 50vw, 100vw" %}
  eleventyConfig.addAsyncShortcode(
    'image',
    async (src, alt, sizes = '100vw', widths = [400, 800, 1200, 1600], extraClass = '') => {
      if (!src) return ''
      if (typeof alt !== 'string') {
        throw new Error(`Missing alt text for image: ${src}`)
      }

      // Resolve site-absolute paths (/assets/...) to filesystem paths.
      let fsPath = src
      if (src.startsWith('/')) fsPath = path.join('src', src)

      const metadata = await Image(fsPath, {
        widths,
        formats: ['avif', 'webp', 'jpeg'],
        outputDir: 'dist/img/',
        urlPath: '/img/',
        sharpOptions: { animated: false }
      })

      const imageAttributes = {
        alt,
        sizes,
        loading: 'lazy',
        decoding: 'async'
      }
      if (extraClass) imageAttributes.class = extraClass

      return Image.generateHTML(metadata, imageAttributes, {
        whitespaceMode: 'inline'
      })
    }
  )

  // ─── Collections ───────────────────────────────────────────────────────────

  eleventyConfig.addCollection('blogPosts', (collectionApi) =>
    collectionApi
      .getFilteredByGlob('./src/content/blog/*.md')
      .sort((a, b) => Number(b.date) - Number(a.date))
  )

  eleventyConfig.addCollection('press', (collectionApi) =>
    collectionApi
      .getFilteredByGlob('./src/content/press/*.md')
      .sort((a, b) => Number(b.date) - Number(a.date))
  )

  eleventyConfig.addCollection('speaking', (collectionApi) =>
    collectionApi
      .getFilteredByGlob('./src/content/speaking/*.md')
      .sort((a, b) => Number(b.date) - Number(a.date))
  )

  // ─── Server (dev) ──────────────────────────────────────────────────────────

  eleventyConfig.setServerOptions({
    port: 8080,
    showAllHosts: true,
    showVersion: false
  })

  // ─── Final config ──────────────────────────────────────────────────────────

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      layouts: '_includes/layouts',
      data: '_data',
      output: 'dist'
    },
    pathPrefix: '/',
    templateFormats: ['liquid', 'md', 'html', '11ty.js'],
    htmlTemplateEngine: 'liquid',
    markdownTemplateEngine: 'liquid'
  }
}
