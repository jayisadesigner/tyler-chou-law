# Client SEO verification packet (§12 template)

Use this checklist after deploy. Replace bracketed placeholders with screenshots, exports, or pasted content.

## A. Platform confirmation

- **Static stack:** Vite build → Netlify (`dist/`), Node 20.
- **Webflow:** Designer project per `CLIENT_GUIDE.md` — mirror copy, SEO fields, and global symbols.

## B. Live crawl files (paste or attach)

1. **`https://tylerchoulaw.com/robots.txt`** — full text:
2. **`https://tylerchoulaw.com/llms.txt`** — confirm 200 OK:
3. **`https://tylerchoulaw.com/sitemap.xml`** — note URL count and lastmod:

## C. Google Search Console

- Property verified under Tyler’s account: **yes / pending**
- Sitemap submitted: **URL** — status **Success / Errors** (screenshot)

## D. Structured data

- **Homepage** — paste all `application/ld+json` blocks from “View Source”:
- **About** — paste Person + Breadcrumb JSON-LD:
- **Press** — note Article blocks count:
- **Rich Results Test** — homepage, About, Press, one Love Letter: **pass / issues** (link or screenshot)
- **schema.org validator** — same pages: **pass / issues**

## E. Core Web Vitals (mobile)

- PageSpeed Insights URLs tested:  
  Record **LCP / CLS / INP** (or field data if available) per major template.

## F. Glossary / case studies (scope)

- §7.3 reserves `/glossary` and `/case-studies` for future content; §10 checklist may conflict—confirm with Tyler before treating as launch blockers.
