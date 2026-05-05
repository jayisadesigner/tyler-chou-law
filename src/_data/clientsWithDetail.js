/**
 * Subset of `clients` that get a full detail page at /clients/<slug>/.
 *
 * Clients with `external_url` set link directly to their YouTube channel from
 * the grid (per src/_data/clients.js), so generating a thin detail page for
 * them just dilutes SEO. This filter excludes them from pagination in
 * `src/content/pages/client-detail.liquid`.
 */
import clients from './clients.js'

export default function () {
  return clients().filter((c) => !c.external)
}
