#!/usr/bin/env bash
# Builds everything GitHub Pages serves for one checkout of the repository: the registry (r/),
# Storybook, the DTCG tokens, llms.txt and the guides, and the starter demo.
#
# Usage: build/build-site.sh <checkout> <out-dir> <base-path>
#   build/build-site.sh . site/next /coreloom-ui/next/
#
# The checkout can be an older commit (a release): steps it doesn't have yet are skipped, so this
# script must only call scripts through `pnpm run --if-present`.
set -euo pipefail

src="$(cd "$1" && pwd)"
mkdir -p "$2"
out="$(cd "$2" && pwd)"
base="$3"

cd "$src"
pnpm install --frozen-lockfile
# Links written into the registry items and llms.txt point at this copy of the site.
export SITE_URL="https://eldenn.github.io${base%/}"
pnpm registry:build
# r/sizes.json: what each item costs an app.
pnpm run --if-present registry:size
pnpm storybook:build
# The tokens in the DTCG format (Figma, Style Dictionary, native apps).
pnpm run --if-present tokens:dtcg
# What AI assistants read (https://llmstxt.org): llms.txt, llms-full.txt, guides/.
pnpm run --if-present llms
pnpm --dir starter install --frozen-lockfile
pnpm --dir starter exec vite build --base "${base}starter/" --outDir ../public/starter --emptyOutDir

cp -R public/. "$out/"
