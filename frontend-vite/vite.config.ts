/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Proxy vers le backend Spring Boot (port 7035).
// L'app appelle axios avec baseURL '/api' -> /api/auth/login => http://localhost:7035/api/auth/login
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:7035',
        changeOrigin: true,
      },
    },
  },
})