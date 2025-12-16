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

## Design System

See `src/styles/variables.css` for design tokens (colors, typography, spacing).

## Deployment

The site is deployed to Netlify. Pushes to `main` branch trigger automatic deployments.

