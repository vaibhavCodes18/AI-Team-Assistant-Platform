import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:1818',
        changeOrigin: true,
        secure: false,
      },
      '/oauth2/authorization': {
        target: 'http://localhost:1818',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
