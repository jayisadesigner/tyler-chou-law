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
        'creatorarq-apply': resolve(__dirname, 'creatorarq-apply.html'),
        services: resolve(__dirname, 'services.html'),
        'love-letters': resolve(__dirname, 'love-letters.html'),
        contact: resolve(__dirname, 'contact.html'),
        admin: resolve(__dirname, 'admin/index.html'),
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

