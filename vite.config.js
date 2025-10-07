import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Ensures paths work correctly on Vercel
  envPrefix: 'VITE_', // Matches your .env variables
  
  build: {
    // Enable production optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    
    // Aggressive code splitting for faster initial load
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - separate large libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/messaging'],
          'leaflet': ['leaflet', 'react-leaflet'],
          'icons': ['lucide-react'],
          'motion': ['framer-motion']
        }
      }
    },
    
    // Reduce chunk size warning limit
    chunkSizeWarningLimit: 200, // Warn if chunk > 200KB
    
    // Disable source maps to reduce bundle size
    sourcemap: false,
    
    // Target modern browsers for smaller code
    target: 'es2020'
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore'
    ]
  }
});