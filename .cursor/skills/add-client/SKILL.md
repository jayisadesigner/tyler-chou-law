---
name: add-client
description: Adds a new client (creator) to the Tyler Chou Law clients page, generating a /clients/<handle>/ page automatically. Use when the user wants to add a new client, creator, or talent to the firm's clients list (e.g. "add Jenny Hoyos as a client", "publish the new client we onboarded", "add a new creator profile").
---

# Add a client (creator)

Client entries live in `src/content/clients/<handle>.yml` as YAML-only data. Each entry produces:

- A card on `/clients/` (via the `client-grid` component)
- A standalone page at `/clients/<slug>/` (via `src/content/pages/client-detail.liquid` pagination)

## Workflow

1. **Pick a slug** — usually the YouTube handle without the `@`. Lowercase, hyphenated. Examples: `jennyhoyos`, `samandcolby`, `littleremyfood`.
2. **Drop the photo** at `src/assets/images/clients/<photo>.jpg` (or `.webp`). Square, minimum 800×800px. Files starting with `@` are fine — many existing client photos use that convention (e.g. `@jacksfilms.webp`).
3. **Pick the display order.** Lower numbers appear first in the grid. Featured creators usually get 1–10.
4. **Write `src/content/clients/<slug>.yml`** using the template.
5. **Verify**:
   - `http://localhost:8080/clients/` — card appears in the grid in the right order.
   - `http://localhost:8080/clients/<slug>/` — standalone page renders with hero, stats, and bio.

## Template

```yaml
handle: "@<creator-handle>"
slug: <slug>
order: 50
photo: /assets/images/clients/<photo-filename>
external_url: ""           # optional — if set, the card links here instead of /clients/<slug>/
youtube_url: https://youtube.com/@<handle>
seo_description: "<140–160 char description used in the per-creator page meta description.>"
stats:
  - { value: "9.85M", label: "subscribers" }
  - { value: "2.1B",  label: "total views" }
  - { value: "Gen Z", label: "core demo" }
  - { value: "U.S.",  label: "top region" }
bio:
  - "<First paragraph — who they are, what they make, why their channel works.>"
  - "<Second paragraph — what's at stake legally / in their business.>"
featured_videos:
  - <youtube-id>           # the part after watch?v=
  - <youtube-id>
```

## Field guidance

| Field | Required | Notes |
|---|---|---|
| `handle` | Yes | With the `@`. Used as the card's main label. |
| `slug` | Yes | URL-safe. Drives `/clients/<slug>/`. |
| `order` | Yes | Lower = sooner. Featured creators 1–10. |
| `photo` | Yes | Path starting with `/assets/`. |
| `external_url` | No | If set, clicking the card links here. Use for creators who want to point to their own site. |
| `youtube_url` | No | Linked from the per-creator page CTA. |
| `seo_description` | Yes | Per-page meta description. |
| `stats` | No | Up to 4 stats shown on the standalone page. |
| `bio` | Yes | One array entry per paragraph. |
| `featured_videos` | No | YouTube video IDs. Embedded on the standalone page. |

## Hard rules

- **Slug must be URL-safe** — no `@`, no spaces. The `@` lives in `handle:`, not `slug:`.
- **Photo path** starts with `/assets/`, never `/src/assets/`.
- **Trademark spelling** in any prose: `The Creators' Attorney`.
- **Order** must be a number, not a string. `order: 50`, not `order: "50"`.
- The per-client page generation is automatic — don't add a `permalink:` to the YAML.
