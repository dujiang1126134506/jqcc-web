import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 8700,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8800',
        changeOrigin: true,
      },
      '/api-docs': {
        target: 'http://localhost:8800',
        changeOrigin: true,
      },
      '/swagger-ui.html': {
        target: 'http://localhost:8800',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-antd': ['antd', '@ant-design/icons'],
          'vendor-utils': ['axios', 'dayjs'],
        },
      },
    },
  },
})
