/**
 * Clients collection — loads all creator YAML files from src/content/clients/*.yml
 * and exposes them as a global `clients` array sorted by `order`.
 *
 * Each entry's URL is built from the slug.
 *
 * (Renamed from roster.js — the section was previously called "Roster". The
 * data shape is unchanged so individual client pages and the grid component
 * work without yml changes.)
 */
import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

const CLIENTS_DIR = path.resolve('src/content/clients')

export default function () {
  if (!fs.existsSync(CLIENTS_DIR)) return []

  const files = fs.readdirSync(CLIENTS_DIR).filter((f) => /\.ya?ml$/.test(f))

  const creators = files.map((file) => {
    const raw = fs.readFileSync(path.join(CLIENTS_DIR, file), 'utf-8')
    const data = yaml.load(raw) || {}
    const slug = data.slug || path.basename(file, path.extname(file))
    return {
      ...data,
      slug,
      // Normalize the photo path to /assets/... (current files use /src/assets/...)
      image: (data.photo || '').replace(/^\/src\//, '/'),
      alt: data.alt || `${data.handle} portrait`,
      url: data.external_url ? data.external_url : `/clients/${slug}/`,
      external: !!data.external_url
    }
  })

  return creators.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
}
