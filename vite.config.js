import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readFileSync, existsSync, readdirSync, statSync, copyFileSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  build: {
    // Optimize for performance
    cssCodeSplit: true, // Split CSS per page for better caching
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        roster: resolve(__dirname, 'roster.html'),
        creatorarq: resolve(__dirname, 'creatorarq.html'),
        services: resolve(__dirname, 'services.html'),
        'love-letters': resolve(__dirname, 'love-letters.html'),
        contact: resolve(__dirname, 'contact.html'),
        'thank-you': resolve(__dirname, 'thank-you.html'),
        'email-signature-preview': resolve(__dirname, 'email-signature-preview.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        // Roster pages - static HTML files processed by Vite
        'roster/calebhammer': resolve(__dirname, 'roster/calebhammer.html'),
        'roster/cassandrabankson': resolve(__dirname, 'roster/cassandrabankson.html'),
        'roster/jacksfilms': resolve(__dirname, 'roster/jacksfilms.html'),
        'roster/jadroppingscience': resolve(__dirname, 'roster/jadroppingscience.html'),
        'roster/jennyhoyos': resolve(__dirname, 'roster/jennyhoyos.html'),
        'roster/jesser': resolve(__dirname, 'roster/jesser.html'),
        'roster/samandcolby': resolve(__dirname, 'roster/samandcolby.html'),
        'roster/sticks': resolve(__dirname, 'roster/sticks.html'),
        // Blog posts are generated to love-letters/ directory by build:blog
        // Vite will process them automatically if they're in the root
        // They'll be copied to dist/love-letters/ during build
      },
      output: {
        // Optimize chunk splitting
        manualChunks: undefined, // Let Vite handle it automatically
      },
    },
    // Minify for smaller bundle sizes
    minify: 'esbuild', // Fast and effective minification
    // Generate source maps only in dev
    sourcemap: false,
    // Copy static assets including generated blog posts
    copyPublicDir: true,
  },
  server: {
    port: 3000,
    open: true,
    host: true, // Allow access from network
    // Serve blog posts from dist/love-letters/ in dev mode
    middlewareMode: false,
  },
  preview: {
    port: 4173,
    host: true,
  },
  // Configure dev server to serve blog posts with proper asset paths
  plugins: [
    {
      name: 'serve-blog-posts',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Serve admin config.yml from public directory
          if (req.url === '/admin/config.yml') {
            const configPath = join(__dirname, 'public', 'admin', 'config.yml')
            if (existsSync(configPath)) {
              const content = readFileSync(configPath, 'utf-8')
              res.setHeader('Content-Type', 'text/yaml')
              res.end(content)
              return
            }
          }
          
          // Check if request is for a blog post
          if (req.url?.startsWith('/love-letters/') && req.url.endsWith('.html')) {
            const blogPostPath = join(__dirname, 'dist', req.url)
            if (existsSync(blogPostPath)) {
              let content = readFileSync(blogPostPath, 'utf-8')
              
              // Rewrite asset paths for dev mode
              // Remove built CSS link - main.js imports CSS via Vite
              content = content.replace(
                /<link rel="stylesheet" href="\/assets\/main-[^"]+\.css">\s*/g,
                ''
              )
              
              // Replace built JS path with Vite dev server path
              // This will process CSS imports through Vite's dev server
              content = content.replace(
                /<script type="module" src="\/assets\/main-[^"]+\.js"><\/script>/g,
                '<script type="module" src="/src/scripts/main.js"></script>'
              )
              
              res.setHeader('Content-Type', 'text/html')
              res.end(content)
              return
            }
          }
          next()
        })
      },
    },
    {
      name: 'copy-src-images-to-public',
      buildStart() {
        // Copy images from src/assets/images/ to public/assets/images/ during build
        // This ensures images referenced with /src/assets/images/ work in production
        const srcImagesDir = join(__dirname, 'src', 'assets', 'images')
        const publicImagesDir = join(__dirname, 'public', 'assets', 'images')
        
        if (!existsSync(srcImagesDir)) {
          return
        }
        
        // Recursively copy directory structure
        function copyDir(src, dest) {
          if (!existsSync(dest)) {
            mkdirSync(dest, { recursive: true })
          }
          
          const entries = readdirSync(src, { withFileTypes: true })
          
          for (const entry of entries) {
            const srcPath = join(src, entry.name)
            const destPath = join(dest, entry.name)
            
            if (entry.isDirectory()) {
              copyDir(srcPath, destPath)
            } else {
              // Only copy if destination doesn't exist or source is newer
              if (!existsSync(destPath) || statSync(srcPath).mtime > statSync(destPath).mtime) {
                copyFileSync(srcPath, destPath)
              }
            }
          }
        }
        
        try {
          copyDir(srcImagesDir, publicImagesDir)
        } catch (error) {
          console.warn('Warning: Could not copy images from src/assets/images/ to public/assets/images/:', error.message)
        }
      },
    },
    {
      name: 'rewrite-image-paths-in-html',
      generateBundle(options, bundle) {
        // Rewrite /src/assets/images/ paths to /assets/images/ in HTML files
        for (const [fileName, chunk] of Object.entries(bundle)) {
          if (chunk.type === 'asset' && fileName.endsWith('.html')) {
            let content = chunk.source.toString()
            
            // Rewrite image paths from /src/assets/images/ to /assets/images/
            content = content.replace(
              /src="\/src\/assets\/images\/([^"]+)"/g,
              'src="/assets/images/$1"'
            )
            
            // Also handle srcset attributes
            content = content.replace(
              /srcset="\/src\/assets\/images\/([^"]+)"/g,
              'srcset="/assets/images/$1"'
            )
            
            chunk.source = content
          }
        }
      },
      writeBundle(options, bundle) {
        // Also process HTML files in the output directory after write
        const distDir = options.dir || join(__dirname, 'dist')
        
        function processHtmlFiles(dir) {
          try {
            const entries = readdirSync(dir, { withFileTypes: true })
            
            for (const entry of entries) {
              const fullPath = join(dir, entry.name)
              
              if (entry.isDirectory()) {
                processHtmlFiles(fullPath)
              } else if (entry.name.endsWith('.html')) {
                let content = readFileSync(fullPath, 'utf-8')
                const originalContent = content
                
                // Rewrite image paths from /src/assets/images/ to /assets/images/
                content = content.replace(
                  /src="\/src\/assets\/images\/([^"]+)"/g,
                  'src="/assets/images/$1"'
                )
                
                // Also handle srcset attributes
                content = content.replace(
                  /srcset="\/src\/assets\/images\/([^"]+)"/g,
                  'srcset="/assets/images/$1"'
                )
                
                // Only write if content changed
                if (content !== originalContent) {
                  writeFileSync(fullPath, content, 'utf-8')
                }
              }
            }
          } catch (error) {
            // Ignore errors for directories that don't exist
            if (error.code !== 'ENOENT') {
              console.warn(`Warning: Could not process HTML files in ${dir}:`, error.message)
            }
          }
        }
        
        if (existsSync(distDir)) {
          processHtmlFiles(distDir)
        }
      },
    },
  ],
})

