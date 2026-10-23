import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  // The card tests import .tsx; tsconfig leaves JSX to Next, so tell esbuild here.
  esbuild: { jsx: 'automatic' },
  test: { include: ['src/**/*.test.{ts,tsx}'] },
});
