import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist/demo',
    emptyOutDir: true,
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    allowedHosts: true,
  },
})
