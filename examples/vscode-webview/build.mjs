// Builds the example into dist/: the extension (Node, CommonJS), the webview app (browser) and its
// stylesheet (Tailwind). It uses the esbuild and Tailwind installed at the repo's root, and resolves
// `@/…` to the repo's src/ through the root tsconfig.json — in your own extension, `@/…` points at
// the components shadcn copied into it.
//   node build.mjs            production build
//   node build.mjs --watch    rebuild on change
//   node build.mjs --preview  also build the browser preview (pnpm preview)
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import * as esbuild from 'esbuild'

const here = import.meta.dirname
const root = path.resolve(here, '../..')
const watch = process.argv.includes('--watch')
const preview = process.argv.includes('--preview')
const dist = path.join(here, 'dist')

fs.rmSync(dist, { recursive: true, force: true })

const common = {
  bundle: true,
  minify: !watch,
  sourcemap: watch ? 'inline' : false,
  logLevel: 'info',
  tsconfig: path.join(root, 'tsconfig.json'),
  absWorkingDir: here,
}

const builds = [
  {
    ...common,
    entryPoints: ['src/extension.ts'],
    outfile: 'dist/extension.js',
    platform: 'node',
    format: 'cjs',
    target: 'node20',
    external: ['vscode'],
  },
  {
    ...common,
    entryPoints: ['src/webview/main.tsx'],
    outfile: 'dist/webview.js',
    platform: 'browser',
    format: 'iife',
    target: 'chrome120',
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': JSON.stringify(watch ? 'development' : 'production') },
  },
]
if (preview) {
  builds.push(
    {
      ...common,
      entryPoints: ['preview/host.ts'],
      outfile: 'dist/preview-host.js',
      platform: 'browser',
      format: 'iife',
      target: 'chrome120',
    },
    {
      ...common,
      entryPoints: ['preview/server.ts'],
      outfile: 'dist/preview-server.js',
      platform: 'node',
      format: 'esm',
      target: 'node20',
    },
  )
}

function tailwind() {
  const bin = path.join(root, 'node_modules', '.bin', 'tailwindcss')
  const args = ['-i', 'src/webview/styles.css', '-o', 'dist/styles.css']
  if (watch) args.push('--watch')
  else args.push('--minify')
  const child = spawn(bin, args, { cwd: here, stdio: 'inherit' })
  return new Promise((resolve, reject) => {
    if (watch) resolve(undefined)
    child.on('exit', (code) => {
      if (code === 0) resolve(undefined)
      else reject(new Error(`tailwindcss exited with ${code}`))
    })
  })
}

if (watch) {
  for (const options of builds) await (await esbuild.context(options)).watch()
  await tailwind()
} else {
  await Promise.all([...builds.map((options) => esbuild.build(options)), tailwind()])
}
