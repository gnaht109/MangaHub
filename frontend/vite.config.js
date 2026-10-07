import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:8080' },
  },
  test: {
    environment: 'jsdom',
    execArgv: ['--no-experimental-webstorage'], // Node 25's built-in localStorage shadows jsdom's
    setupFiles: './src/test/setup.js',
  },
})
