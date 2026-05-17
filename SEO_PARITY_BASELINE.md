# SEO / deploy baseline (static site + Webflow parity)

## Production domain

- Canonical host: **`https://tylerchoulaw.com`**
- All `canonical` links, `Sitemap:` in `robots.txt`, and JSON-LD URLs use this host (not `tylerchou.com` from the client brief).

## Static site (this repo)

- **Build:** `npm run build` → output **`dist/`** (Netlify `publish = dist`).
- **Canonical URL strategy:** HTML files use **`.html` suffixes** in the repo (e.g. `/about.html`). Netlify **301 redirects** map extensionless paths (e.g. `/press`, `/services/trademark`) to those files where configured in [`netlify.toml`](netlify.toml).
- **`robots.txt` / `llms.txt` / `sitemap.xml`:** Served from [`public/`](public/) and copied into `dist/` at build time.

## Webflow (mirror)

- Site: **Tyler Chou Law For Creators** — see [`CLIENT_GUIDE.md`](CLIENT_GUIDE.md) and [`WEBFLOW_MIGRATION.md`](WEBFLOW_MIGRATION.md).
- Replicate the same **visible copy, meta tags, nav/footer, structured data intent, and IA** in Designer. Custom `robots.txt` / `llms.txt` may require Webflow hosting settings or the same edge host as the static site—document any platform limits for the client.

## Verification

- After deploy, confirm live `https://tylerchoulaw.com/robots.txt`, `/llms.txt`, `/sitemap.xml`, and Rich Results / schema.org validation. Use [`CLIENT_SEO_VERIFICATION.md`](CLIENT_SEO_VERIFICATION.md) for the §12 checklist packet.
