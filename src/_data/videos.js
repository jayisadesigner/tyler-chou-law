/**
 * YouTube videos — sourced from `config/youtube-videos.json`.
 * Each video gets a YouTube watch URL + standard hqdefault thumbnail.
 *
 * The `npm run build:youtube` script (kept as `legacy:youtube` during the
 * migration) refreshes this list from the YouTube API in production.
 */
import fs from 'node:fs'
import path from 'node:path'

const CONFIG = path.resolve('config/youtube-videos.json')

export default function () {
  if (!fs.existsSync(CONFIG)) return []
  const raw = fs.readFileSync(CONFIG, 'utf-8')
  const data = JSON.parse(raw) || {}
  const videos = data.manualVideos || []
  return videos.map((v) => ({
    id: v.id,
    title: v.title,
    url: `https://youtube.com/watch?v=${v.id}`,
    thumbnail: `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`,
    alt: v.title
  }))
}
