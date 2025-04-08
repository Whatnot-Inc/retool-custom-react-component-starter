import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

export default [
  // Build for React app dev environment
  {
    input: 'src/retool-entry.tsx',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      peerDepsExternal(),
      postcss({
        modules: false,
        minimize: true,
        extensions: ['.css']
      }),
      babel({
        exclude: 'node_modules/**',
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }),
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }),
      commonjs(),
      terser()
    ]
  },
]; 