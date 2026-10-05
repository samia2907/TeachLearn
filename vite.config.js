import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { existsSync } from 'node:fs'
import { VitePWA } from 'vite-plugin-pwa'

// Only publish real assets. See docs/pwa.md for the required brand icons.
const hasPublicAsset = (path) => existsSync(new URL(`./public${path}`, import.meta.url))
const icons = [
  { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
  { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
  { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
].filter((icon) => hasPublicAsset(icon.src))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'techminds-apple-touch-icon',
      transformIndexHtml() {
        return hasPublicAsset('/apple-touch-icon.png')
          ? [{ tag: 'link', attrs: { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }, injectTo: 'head' }]
          : []
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      // Native registration updates the worker without forcibly reloading forms.
      injectRegister: 'script',
      includeAssets: ['favicon.svg', ...icons.map((icon) => icon.src.slice(1)),
        ...(hasPublicAsset('/apple-touch-icon.png') ? ['apple-touch-icon.png'] : [])],
      manifest: {
        id: '/',
        name: 'TechMinds',
        short_name: 'TechMinds',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        theme_color: '#6840d8',
        background_color: '#f5f7fc',
        icons,
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        // Cache the application shell, never Firebase/API responses or user data.
        globPatterns: ['**/*.{js,css,html,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: '/index.html',
        // Firebase reserved endpoints (including Auth handlers) must reach Hosting.
        navigateFallbackDenylist: [/^\/__\//, /^\/api(?:\/|$)/],
        cleanupOutdatedCaches: true,
        runtimeCaching: [],
      },
    }),
  ],
})
