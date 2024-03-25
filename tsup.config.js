import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  target: 'es2020',
  treeshake: false,
  splitting: false,
  entry: ['browser.js', 'node.js'],
  format: ['cjs'],
  dts: false,
  minify: false,
  clean: false,
  ...options,
}));
