import path from 'node:path'

import * as esbuild from 'esbuild'
const root = path.resolve(import.meta.dirname, '..')
const out = process.argv[2]
const common = {
  bundle: true,
  format: 'iife',
  minify: true,
  target: 'es2020',
  legalComments: 'none',
  define: { 'process.env.NODE_ENV': '"production"' },
}
await esbuild.build({
  ...common,
  entryPoints: [path.join(root, 'build/lib-react.js')],
  outfile: path.join(out, 'react.js'),
})
await esbuild.build({
  ...common,
  entryPoints: [path.join(root, 'build/lib-react-dom.js')],
  outfile: path.join(out, 'react-dom.js'),
  plugins: [
    {
      name: 'react-global',
      setup(b) {
        b.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'g' }))
        b.onLoad({ filter: /.*/, namespace: 'g' }, () => ({
          contents: 'module.exports = window.React',
          loader: 'js',
        }))
      },
    },
  ],
})
