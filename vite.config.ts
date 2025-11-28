
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Prevent crashes if process.env is undefined in browser
    'process.env': {} 
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
    // Reduce strictness to allow build to pass with warnings
    commonjsOptions: {
      ignoreTryCatch: false,
    },
  }
})
