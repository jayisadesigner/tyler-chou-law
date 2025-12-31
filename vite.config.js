import { defineConfig } from 'vite'
import { resolve } from 'path'

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
  },
  preview: {
    port: 4173,
    host: true,
  },
})

