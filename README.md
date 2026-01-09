# Tyler Chou Law for Creators

Website for Tyler Chou Law for Creators - "The Godmother of Creators"

## Tech Stack

- **Build Tool**: Vite
- **Framework**: Vanilla HTML/CSS/JS
- **Animations**: GSAP
- **CMS**: Decap CMS
- **Hosting**: Netlify

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
tyler-chou-law/
├── index.html              # Landing page
├── about.html              # About page
├── roster.html             # Roster page
├── creatorarq.html         # CreatorArq page
├── services.html           # Services page
├── love-letters.html       # Blog index
├── contact.html            # Contact page
├── admin/                  # Decap CMS
│   ├── index.html
│   └── config.yml
├── src/
│   ├── styles/             # CSS files
│   ├── scripts/            # JavaScript files
│   ├── assets/             # Images, fonts
│   └── templates/          # Blog post template
├── content/
│   └── blog/               # Markdown blog posts
└── scripts/
    └── build-blog.js       # Blog build script
```

## Blog Posts

Blog posts are written in Markdown in `content/blog/` and pre-rendered to HTML at build time for optimal SEO.

### Automatic Featured Images (Unsplash)

The build script can automatically fetch featured images from Unsplash if no image is provided in the blog post frontmatter.

**Setup:**
1. Sign up at [unsplash.com/developers](https://unsplash.com/developers)
2. Create a new application
3. Copy your Access Key
4. Create a `.env` file in the project root:
   ```bash
   UNSPLASH_ACCESS_KEY=your_access_key_here
   ```
5. For Netlify deployment, add `UNSPLASH_ACCESS_KEY` as an environment variable in your Netlify dashboard

**How it works:**
- If a blog post has a `featured_image` in frontmatter and the file exists, that image is used
- If no image is provided or the file doesn't exist, the script automatically fetches a relevant image from Unsplash
- Image keywords are determined by priority:
  1. **Manual `image_keywords` field** (comma-separated) - highest priority
  2. **Description field** - extracts meaningful keywords
  3. **Tags** - maps abstract concepts to visual terms (e.g., "creator economy" → "business, entrepreneur")
  4. **Title** - extracts keywords as fallback
- Images include proper attribution to the photographer and Unsplash
- Free tier: 50 requests/hour (sufficient for build-time generation)

**Example frontmatter:**
```yaml
---
title: "My Blog Post"
description: "A great description"
tags: ["creator business", "legal"]
image_keywords: "business, entrepreneur, success, startup"  # Optional: manual control
---
```

**Note:** The script works without an API key, but will skip automatic image fetching and show a warning.

## YouTube Video Grid

The homepage video grid automatically fetches the latest or most popular videos from the YouTube channel using YouTube Data API v3.

**Setup:**
See [YOUTUBE_API_SETUP.md](./YOUTUBE_API_SETUP.md) for detailed instructions.

**Quick setup:**
1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "YouTube Data API v3"
3. Set environment variable:
   - Local: Create `.env` file with `YOUTUBE_API_KEY=your_key`
   - Netlify: Add `YOUTUBE_API_KEY` in site settings > Environment variables

**Options:**
- `YOUTUBE_VIDEO_ORDER=date` - Latest videos (default)
- `YOUTUBE_VIDEO_ORDER=viewCount` - Most popular videos
- `YOUTUBE_VIDEO_ORDER=rating` - Highest rated videos

**Note:** The script works without an API key, but will skip video updates and use existing hardcoded videos.

## Design System

See `src/styles/variables.css` for design tokens (colors, typography, spacing).

## Deployment

The site is deployed to Netlify. Pushes to `main` branch trigger automatic deployments.

