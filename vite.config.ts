import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import electron from 'vite-plugin-electron';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      entry: [
        'src/main/main.ts',
        'src/preload/preload.ts'
      ],
      vite: {
        build: {
          outDir: 'dist/main',
          rollupOptions: {
            output: {
              entryFileNames: '[name].js',
            },
          },
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        reminder: path.resolve(__dirname, 'reminder.html')
      }
    }
  },
}); 