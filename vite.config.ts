import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { gitVersionPlugin } from './scripts/vite-plugin-git-version';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tailwindcss(), gitVersionPlugin()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      define: {
        __FILE_SERVER_API_KEY__: JSON.stringify(env.FILE_SERVER_API_KEY || ''),
        __AVG_DATABASE_API_URL__: JSON.stringify(env.AVG_DATABASE_API_URL || ''),
        __DEBUG_PASSWD__: JSON.stringify(env.DEBUG_PASSWD || ''),
        // NyaaAcount platform public https entry (register / recharge /
        // account links). Same pipeline as __AVG_DATABASE_API_URL__: value
        // comes from .env locally and from the NYAAACOUNT_PUBLIC_URL
        // build-arg in container builds (rebuild.py). Public URL only.
        __NYAACOUNT_PUBLIC_URL__: JSON.stringify(env.NYAAACOUNT_PUBLIC_URL || ''),
      }
    };
});
