import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    {
      name: 'rewrite-policies-route',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/policies' || req.url === '/policies/') {
            req.url = '/src/policies/index.html';
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/policies' || req.url === '/policies/') {
            req.url = '/src/policies/index.html';
          }
          next();
        });
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        policies: resolve(__dirname, 'src/policies/index.html'),
      },
    },
  },
});