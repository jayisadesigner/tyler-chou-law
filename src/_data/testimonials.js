/**
 * Testimonials — loaded from src/content/data/testimonials.yml.
 * Normalizes photo paths from `/src/assets/...` to `/assets/...`.
 */
import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

const FILE = path.resolve('src/content/data/testimonials.yml')

export default function () {
  if (!fs.existsSync(FILE)) return []
  const raw = fs.readFileSync(FILE, 'utf-8')
  const data = yaml.load(raw) || []
  return data.map((t) => ({
    ...t,
    image: (t.photo || '').replace(/^\/src\//, '/'),
    alt: t.alt || t.name
  }))
}
