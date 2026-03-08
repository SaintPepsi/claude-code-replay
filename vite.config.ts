import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  root: '.',
  plugins: [tsconfigPaths()],
  build: {
    outDir: 'dist',
  },
  test: {
    environment: 'jsdom',
  },
});
