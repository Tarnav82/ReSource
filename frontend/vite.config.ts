import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173,
        host: 'localhost',
        strictPort: false,
      },
      plugins: [react()],
      define: {
        'import.meta.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL || 'http://localhost:8000'),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
      },
    };
});
