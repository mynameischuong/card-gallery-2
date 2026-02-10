import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  const base = command === 'build' ? '/card-gallery-2/' : '/'
  
  return {
    base: base,
    plugins: [react()], // Added this!
    server: {
      port: 5173,
      open: true
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'terser'
    }
  }
})