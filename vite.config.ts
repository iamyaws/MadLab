import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  // Bind the dev server to all network interfaces so a phone on the same WiFi
  // can hit it via the printed LAN URL ("Network: http://192.168.x.x:5173").
  // Enables fast iteration without a deploy round-trip.
  server: {
    host: true,
    port: 5173,
  },
  plugins: [react()],
});
