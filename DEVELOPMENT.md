# Development Guide

## Local Development

### Start Dev Server
```bash
npm run dev
```
- Opens at `http://localhost:3000`
- Hot module replacement (HMR) enabled
- Changes reflect immediately
- Header/footer components load via fetch (works in dev)

### Preview Production Build Locally
```bash
npm run build
npm run preview
```
- Builds the site for production
- Serves at `http://localhost:4173`
- Tests the actual production build
- Good for catching build-time issues

## Netlify Deployment

### Automatic Deployments
- **Preview Deployments**: Created automatically on every pull request
- **Production Deployments**: Created automatically on pushes to `main` branch

### Manual Deployment
1. Push to GitHub
2. Netlify automatically builds and deploys
3. Check Netlify dashboard for deployment status

### Netlify Preview URLs
- Each PR gets a unique preview URL
- Format: `https://[random-name]--[site-name].netlify.app`
- Share with client for review before merging

## Component Loading

Header and footer components are loaded dynamically via JavaScript fetch:
- Works in both dev and production
- Components load after initial page render
- If components fail to load, page still functions (graceful degradation)

## Blog Posts

Blog posts are pre-rendered at build time:
- Markdown files in `content/blog/` are converted to HTML
- Build script runs before Vite build: `npm run build:blog && vite build`
- Generated HTML files in `dist/love-letters/[slug]/index.html`

### Unsplash API for Featured Images

The build script can automatically fetch featured images from Unsplash:
- **Setup**: Create a `.env` file with `UNSPLASH_ACCESS_KEY=your_key`
- **Netlify**: Add `UNSPLASH_ACCESS_KEY` as an environment variable in Netlify dashboard
- **Behavior**: If no `featured_image` is in frontmatter, script fetches from Unsplash based on post tags/title
- **Attribution**: Automatically included for Unsplash images
- **Fallback**: Works without API key (skips auto-fetching, shows warning)

## CMS Access

Decap CMS is available at:
- Local: `http://localhost:3000/admin`
- Production: `https://[your-site].netlify.app/admin`
- Uses GitHub OAuth for authentication (requires GitHub account)
- Users need write access to the repository

## Troubleshooting

### Components Not Loading
- Check browser console for fetch errors
- Verify paths are correct (`/src/components/header.html`)
- In production, ensure files are in `dist/` after build

### Blog Posts Not Building
- Ensure markdown files are in `content/blog/`
- Check that `scripts/build-blog.js` runs successfully
- Verify template exists at `src/templates/blog-post.html`

### Netlify Build Fails
- Check build logs in Netlify dashboard
- Verify `netlify.toml` configuration
- Ensure Node version matches (18)

