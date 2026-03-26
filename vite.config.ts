import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  const isLibBuild = command === 'build' && mode !== 'development';

  if (!isLibBuild) {
    // Dev server: serves dev/index.html
    return {
      plugins: [react()],
      root: 'dev',
      server: { port: 3000 },
    };
  }

  // Library build
  return {
    plugins: [
      react(),
      dts({
        include: ['src'],
        outDir: 'dist',
        rollupTypes: true,
      }),
    ],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'Bracketo',
        formats: ['es', 'umd'],
        fileName: (format) => `bracketo.${format}.js`,
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime', '@xyflow/react'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'ReactJSXRuntime',
            '@xyflow/react': 'ReactFlow',
          },
        },
      },
      cssCodeSplit: false,
      sourcemap: true,
    },
  };
});
