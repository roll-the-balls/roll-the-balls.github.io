import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json'

// Конфигурация сборки: project-site на GitHub Pages лежит в подпапке,
// поэтому base зафиксирован с первого коммита (иначе 404 ассетов).
// https://vite.dev/config/
export default defineConfig({
  // Базовый путь project-site; для кастомного домена или user-site сменить на '/'.
  base: '/billiards-together/',
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      // Автообновление воркера: новый билд подхватывается без зависшего precache.
      registerType: 'autoUpdate',
      manifest: {
        name: 'Billiards Together',
        short_name: 'Billiards',
        display: 'fullscreen',
        orientation: 'landscape',
        theme_color: '#0E1113',
        background_color: '#0E1113',
        // Иконки-заглушки 192/512 из public/ (A4: достаточны для офлайна v1;
        // install-prompt не требуется). base подставляется плагином.
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'] },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Только современные браузеры (см. Constraints/Compat проекта).
  build: { target: 'es2022' },
  define: {
    // Штамп версии для детекции нового билда в меню (план 01-04).
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
})
