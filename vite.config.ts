import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Ensure API_KEY is available in the browser environment
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || "")
  },
  resolve: {
    alias: {
      '@': '/'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      }
    },
    commonjsOptions: {
      ignoreTryCatch: false,
    },
  }
})