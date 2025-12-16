import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
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
      },
    },
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

