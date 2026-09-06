import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/**/*'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts'],
    },
  },
});