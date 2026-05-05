/**
 * Roster collection — loads all creator YAML files from src/content/roster/*.yml
 * and exposes them as a global `roster` array sorted by `order`.
 *
 * Each entry's URL is built from the slug.
 */
import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

const ROSTER_DIR = path.resolve('src/content/roster')

export default function () {
  if (!fs.existsSync(ROSTER_DIR)) return []

  const files = fs.readdirSync(ROSTER_DIR).filter((f) => /\.ya?ml$/.test(f))

  const creators = files.map((file) => {
    const raw = fs.readFileSync(path.join(ROSTER_DIR, file), 'utf-8')
    const data = yaml.load(raw) || {}
    const slug = data.slug || path.basename(file, path.extname(file))
    return {
      ...data,
      slug,
      // Normalize the photo path to /assets/... (current files use /src/assets/...)
      image: (data.photo || '').replace(/^\/src\//, '/'),
      alt: data.alt || `${data.handle} portrait`,
      url: data.external_url ? data.external_url : `/roster/${slug}/`,
      external: !!data.external_url
    }
  })

  return creators.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
}
