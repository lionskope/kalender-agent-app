import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/kalender-agent-app/',
  server: {
    port: 5183,
    open: true,
  },
}); 