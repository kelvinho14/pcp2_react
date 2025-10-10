import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    chunkSizeWarningLimit: 3000,
  },
  optimizeDeps: {
    exclude: ['react-select/creatable'],
    include: ['hoist-non-react-statics', '@emotion/react', '@emotion/styled']
  },
  define: {
    global: 'globalThis',
  },
})
