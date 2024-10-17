import path from 'node:path'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import relay from 'vite-plugin-relay-lite'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [react(), relay(), svgr()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
