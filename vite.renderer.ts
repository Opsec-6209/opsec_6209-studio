import { defineConfig } from 'vite';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig({
  root: 'src/renderer',
  base: './',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
    target: 'es2022',
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'preact-vendor': ['preact', 'preact/hooks', 'htm', 'htm/preact'],
        },
      },
    },
  },
  plugins: [
    monacoEditorPlugin({}),
    {
      name: 'fix-electron',
      enforce: 'post',
      transformIndexHtml(html) {
        return html.replace(/ crossorigin/g, '');
      },
    },
  ],
});
