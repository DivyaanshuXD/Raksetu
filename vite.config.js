import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Ensures paths work correctly on Vercel
  envPrefix: 'VITE_', // Matches your .env variables
});