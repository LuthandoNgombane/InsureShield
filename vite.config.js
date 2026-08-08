import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        policies: resolve(__dirname, 'src/policies/index.html'),
      },
    },
  },
});