import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Serve from /react-193-playground/ so assets resolve on GitHub Pages
  base: '/react-193-playground/',
  plugins: [react()],
})
