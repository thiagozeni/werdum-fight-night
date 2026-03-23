import { defineConfig } from 'vite'

export default defineConfig({
  base: '/werdum-fight-night/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    allowedHosts: true,
  },
})
