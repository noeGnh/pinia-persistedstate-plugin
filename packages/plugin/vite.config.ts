/// <reference types="vitest"/>
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      name: 'PiniaPersistencePlugin',
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es', 'cjs', 'iife'],
      fileName: (format) => {
        switch (format) {
          case 'es':
            return 'index.mjs'
          case 'cjs':
            return 'index.cjs'
          case 'iife':
            return 'index.js'
          default:
            return 'index.js'
        }
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
})
