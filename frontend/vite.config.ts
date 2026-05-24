import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['wildcat-logo.png'],
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^(?!\/(api|_)).*$/],
      },
      manifest: {
        name: 'Wildcat Calendar',
        short_name: 'Wildcats',
        description: 'Burnaby Central Secondary School Clubs and Events',
        theme_color: '#D32F2F',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/wildcat-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/wildcat-logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
