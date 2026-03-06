import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  build: {
    rollupOptions: {
      external: ['leaflet', 'react-leaflet', 'socket.io-client', 'react-leaflet-cluster', 'leaflet.heat'],
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['leaflet', 'react-leaflet', 'socket.io-client', 'react-leaflet-cluster', 'leaflet.heat']
  },
  ssr: {
    external: ['leaflet', 'react-leaflet', 'socket.io-client', 'react-leaflet-cluster', 'leaflet.heat']
  }
})
