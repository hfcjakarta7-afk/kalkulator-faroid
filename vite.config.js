import { defineConfig } from 'vite';

export default defineConfig({
  // path relatif supaya bisa dipasang di subfolder (GitHub Pages) maupun dibuka dari mana saja
  base: './',
  build: { outDir: 'dist', target: 'es2020' },
  test: { include: ['test/**/*.test.js'] },
});
