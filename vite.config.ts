import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(() => {
  // load env
  const apiUrl = process.env.VITE_API_URL
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
          changeOrigin: true
        }
      }
    }
  }
})