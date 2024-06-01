import * as path from 'path'
import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/manifest'

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: 'build',
    rollupOptions: {
      input: {
        options: path.resolve('templates', 'options.html'),
        popup: path.resolve('templates', 'popup.html'),
        sidepanel: path.resolve('templates', 'sidepanel.html'),
      },
      output: {
        chunkFileNames: 'assets/chunk-[hash].js',
      },
    },
  },
  plugins: [crx({ manifest })],
})
