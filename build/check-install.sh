#!/usr/bin/env bash
# Installs every registry item into a new app with `shadcn add`, as a consumer would, then
# type-checks and builds it. It fails when an item misses a file or an npm dependency, or doesn't
# compile outside this repository.
#
#   next  a Next.js app (App Router). Every module is imported from a Server Component, so it also
#         fails on a module that can't load on the server (a missing 'use client', a `window` read
#         while the module loads).
#   vite  a Vite + React app, with the template's strict TypeScript settings (`verbatimModuleSyntax`,
#         `erasableSyntaxOnly`, `noUnusedLocals`).
#
# Usage: build/check-install.sh [next|vite] [work-dir]     after pnpm registry:build (reads public/r)
set -euo pipefail

framework="${1:-next}"
case "$framework" in
  next | vite) ;;
  *)
    echo "Unknown framework '$framework': use next or vite." >&2
    exit 2
    ;;
esac

root="$(cd "$(dirname "$0")/.." && pwd)"
work="${2:-$(mktemp -d)}"
port="${INSTALL_PORT:-6190}"
mkdir -p "$work"

# The registry as built, served the way GitHub Pages serves it.
python3 -m http.server "$port" --bind 127.0.0.1 --directory "$root/public" >/dev/null 2>&1 &
server=$!
trap 'kill "$server"' EXIT
curl --silent --fail --retry 10 --retry-connrefused --retry-delay 1 --output /dev/null \
  "http://127.0.0.1:$port/r/registry.json"

cd "$work"

# A new app, set up the way each framework's shadcn guide says.
create_next() {
  pnpm create next-app@latest app --ts --tailwind --app --src-dir --no-eslint \
    --import-alias '@/*' --use-pnpm --disable-git --yes
  cd app
  css=src/app/globals.css
  styles=../styles/coreloom
  entry=src/app/page.tsx
}

create_vite() {
  pnpm create vite@latest app --template react-ts --no-interactive
  cd app
  pnpm install
  pnpm add tailwindcss @tailwindcss/vite
  pnpm add -D @types/node
  # The `@/` alias, in both TypeScript projects and in Vite.
  node -e '
    const fs = require("fs")
    for (const file of ["tsconfig.json", "tsconfig.app.json"]) {
      // The template has comments in its tsconfig files: strip them before parsing.
      const text = fs.readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm, "")
      const config = JSON.parse(text)
      config.compilerOptions = { ...config.compilerOptions, paths: { "@/*": ["./src/*"] } }
      fs.writeFileSync(file, JSON.stringify(config, null, 2))
    }
  '
  cat > vite.config.ts <<'TS'
import path from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
})
TS
  echo "@import 'tailwindcss';" > src/index.css
  css=src/index.css
  styles=./styles/coreloom
  entry=src/App.tsx
}

"create_$framework"

# Coreloom is built on Radix: with a Base UI style the CLI rewrites `asChild` into `render`.
pnpm dlx shadcn@latest init --yes --base radix --preset nova
node -e '
  const fs = require("fs")
  const config = JSON.parse(fs.readFileSync("components.json", "utf8"))
  config.registries = { "@coreloom": `http://127.0.0.1:${process.argv[1]}/r/{name}.json` }
  fs.writeFileSync("components.json", JSON.stringify(config, null, 2))
' "$port"

# Every item except the *-demo examples (stories, which need Storybook).
items="$(node -e '
  const { items } = require(process.argv[1])
  console.log(items.map((item) => `@coreloom/${item.name}`).join(" "))
' "$root/registry.json")"
# shellcheck disable=SC2086 -- one argument per item
pnpm dlx shadcn@latest add $items --yes --overwrite

# The global CSS of the README's quick start.
cat > "$css" <<CSS
@import 'tailwindcss';
@import 'tw-animate-css';
@import '$styles/fonts.css';
@import '$styles/tokens.css';
@import '$styles/theme.css';
@import '$styles/accents.css';
@import '$styles/surfaces.css';
CSS

# A component that imports every installed module: a Server Component in Next.js, the app's root
# in Vite.
node -e '
  const fs = require("fs")
  const [entry, name] = process.argv.slice(1)
  const modules = ["components/ui", "components", "hooks", "lib"].flatMap((dir) =>
    fs.existsSync(`src/${dir}`)
      ? fs.readdirSync(`src/${dir}`).filter((f) => /\.tsx?$/.test(f)).map((f) => `@/${dir}/${f.replace(/\.tsx?$/, "")}`)
      : [],
  )
  const imports = modules.map((m, i) => `import * as m${i} from "${m}"`).join("\n")
  const names = modules.map((_, i) => `m${i}`).join(", ")
  fs.writeFileSync(
    entry,
    `${imports}\n\nexport default function ${name}() {\n  return <p>{[${names}].length} modules</p>\n}\n`,
  )
  console.log(`${modules.length} modules imported from ${entry}`)
' "$entry" "$([ "$framework" = next ] && echo Page || echo App)"

if [ "$framework" = next ]; then
  pnpm exec tsc --noEmit
  pnpm exec next build
else
  # The template's build script: `tsc -b && vite build`.
  pnpm run build
fi
echo "Installed, type-checked and built in $work/app"
