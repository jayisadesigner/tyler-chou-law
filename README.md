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
- If a blog post has a `featured_image` in frontmatter, that image is used
- If no image is provided, the script automatically fetches a relevant image from Unsplash based on the post's tags and title
- Images include proper attribution to the photographer and Unsplash
- Free tier: 50 requests/hour (sufficient for build-time generation)

**Note:** The script works without an API key, but will skip automatic image fetching and show a warning.

## Design System

See `src/styles/variables.css` for design tokens (colors, typography, spacing).

## Deployment

The site is deployed to Netlify. Pushes to `main` branch trigger automatic deployments.

