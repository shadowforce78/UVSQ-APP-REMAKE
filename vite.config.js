import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Configuration du proxy pour l'API UVSQ
      '/api/uvsq': {
        target: 'https://api.saumondeluxe.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/uvsq/, '')
      },
      // Proxy pour les appels API vers le serveur backend
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    allowedHosts: ['uvsq.saumondeluxe.com']
  }
})
