#!/usr/bin/env bash
# Installs every registry item into a new Next.js app with `shadcn add`, as a consumer would, then
# type-checks and builds it. It fails when an item misses a file or an npm dependency, doesn't
# compile outside this repository, or can't be imported from a Server Component (a missing
# 'use client', a `window` read while the module loads).
#
# Usage: build/check-install.sh [work-dir]     after pnpm registry:build (reads public/r)
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
work="${1:-$(mktemp -d)}"
port="${INSTALL_PORT:-6190}"
mkdir -p "$work"

# The registry as built, served the way GitHub Pages serves it.
python3 -m http.server "$port" --bind 127.0.0.1 --directory "$root/public" >/dev/null 2>&1 &
server=$!
trap 'kill "$server"' EXIT
curl --silent --fail --retry 10 --retry-connrefused --retry-delay 1 --output /dev/null \
  "http://127.0.0.1:$port/r/registry.json"

cd "$work"
pnpm create next-app@latest app --ts --tailwind --app --src-dir --no-eslint \
  --import-alias '@/*' --use-pnpm --disable-git --yes
cd app
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
cat > src/app/globals.css <<'CSS'
@import 'tailwindcss';
@import 'tw-animate-css';
@import '../styles/coreloom/fonts.css';
@import '../styles/coreloom/tokens.css';
@import '../styles/coreloom/theme.css';
@import '../styles/coreloom/accents.css';
@import '../styles/coreloom/surfaces.css';
CSS

# A Server Component that imports every installed module.
node -e '
  const fs = require("fs")
  const modules = ["components/ui", "components", "hooks", "lib"].flatMap((dir) =>
    fs.existsSync(`src/${dir}`)
      ? fs.readdirSync(`src/${dir}`).filter((f) => /\.tsx?$/.test(f)).map((f) => `@/${dir}/${f.replace(/\.tsx?$/, "")}`)
      : [],
  )
  const imports = modules.map((m, i) => `import * as m${i} from "${m}"`).join("\n")
  const names = modules.map((_, i) => `m${i}`).join(", ")
  fs.writeFileSync(
    "src/app/page.tsx",
    `${imports}\n\nexport default function Page() {\n  return <p>{[${names}].length} modules</p>\n}\n`,
  )
  console.log(`${modules.length} modules imported from a Server Component`)
'

pnpm exec tsc --noEmit
pnpm exec next build
echo "Installed, type-checked and built in $work/app"
