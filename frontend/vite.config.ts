import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      includeAssets: ['cropped-wildcat-logo.png'],
      devOptions: {
        enabled: true
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^(?!\/(api|_)).*$/],
        skipWaiting: true,
        clientsClaim: true,
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
            src: '/cropped-wildcat-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/cropped-wildcat-logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
