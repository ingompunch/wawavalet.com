import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify({
    projectId: 'dummy-project-id',
    appId: 'dummy-app-id',
    apiKey: 'dummy-api-key',
    authDomain: 'dummy-auth-domain',
    firestoreDatabaseId: 'dummy-db-id',
    storageBucket: 'dummy-storage-bucket',
    messagingSenderId: 'dummy-messaging-sender-id',
    measurementId: ''
  }, null, 2));
}

export default defineConfig(({ command }) => {
  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR === 'true' ? false : {
        overlay: false,
      },
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
