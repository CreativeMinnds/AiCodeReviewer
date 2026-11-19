import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    // Same relative /api path as production, so no CORS or hardcoded URLs.
    proxy: { "/api": "http://localhost:2000" },
  },
})
