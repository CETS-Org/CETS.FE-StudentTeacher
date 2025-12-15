import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(() => {
  // load env
  const apiUrl = process.env.VITE_API_URL || 'https://localhost:8000'
  const port = Number(process.env.VITE_PORT) || 3000

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port,
      strictPort: true,
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
          secure: false, // Allow self-signed certificates
          configure: (proxy, _options) => {
            proxy.on('error', (_err, _req, _res) => {
            });
            proxy.on('proxyReq', (_proxyReq, _req, _res) => {
            });
            proxy.on('proxyRes', (_proxyRes, _req, _res) => {
            });
          },
        }
      }
    }
  }
})