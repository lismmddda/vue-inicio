import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@socket': path.resolve(__dirname, './src/socket')
    }
  },

  server: {
    host: true,
    port: 3000
  }
})
