/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Proxy vers le backend Spring Boot (port 7035).
// L'app appelle axios avec baseURL '/api' -> /api/auth/login => http://localhost:7035/api/auth/login
export default defineConfig({
  // Application servie sous /med : http://localhost:5173/med
  // Les fichiers JS/CSS et les images publiques sont prefixes par /med/.
  base: '/med/',
  plugins: [
    react(),
    tailwindcss(),
    {
      // En dev, /med sans slash renvoie 404 : on redirige vers /med/
      // (en production, c'est le backend qui fait cette redirection).
      name: 'redirect-med-root',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/med' || req.url === '/med?') {
            res.writeHead(302, { Location: '/med/' });
            res.end();
            return;
          }
          next();
        });
      },
    },
  ],
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