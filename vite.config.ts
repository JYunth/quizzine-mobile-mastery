import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'Quizzine',
        short_name: 'Quizzine',
        description: 'A mobile quiz application',
        icons: [
          {
            src: '/favicon.ico', // Using existing favicon as placeholder
            sizes: '64x64 32x32 24x24 16x16', // Common favicon sizes
            type: 'image/x-icon',
            purpose: 'any' // Add purpose
          },
          // Placeholder entries for required sizes - REPLACE with actual images later!
          {
            src: '/android-chrome-192x192.png', // Updated path to actual icon
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/android-chrome-512x512.png', // Updated path to actual icon
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ],
        start_url: '/',
        display: 'standalone',
        background_color: '#FAFAFD', // Updated background color
        theme_color: '#7E69AB' // Updated theme color (primary)
      }
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
