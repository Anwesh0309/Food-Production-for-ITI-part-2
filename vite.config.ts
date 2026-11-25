import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // keep the heavy WebGL library in its own lazy chunk (only the pastry unit needs it)
        manualChunks: (id) => (id.includes('node_modules/three') || id.includes('@react-three') ? 'three' : undefined),
      },
    },
  },
});
