// Publishes the Storybook stories as shadcn `registry:example` items, so assistants can read how each
// item is used. shadcn's MCP server answers "show me an example of X" (get_item_examples_from_registries)
// with the code of matching `*-demo` items; Coreloom's real usage code lives in stories/.
// Runs after `shadcn build` (see `registry:build`): writes public/r/<story>-demo.json for every story
// file and adds them to public/r/registry.json. registry.json at the root stays as written.
// Usage: node build/registry-examples.mjs [dir]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(import.meta.dirname, '..')
const SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json'
const STORY_DIRS = ['stories/components', 'stories/blocks']

/** '@/components/ui/button' → 'button', for every file a registry item ships. */
function itemsByImport(registry) {
  const map = new Map()
  for (const item of registry.items)
    for (const file of item.files ?? []) {
      const spec = file.path.replace(/^src\//, '@/').replace(/\.tsx?$/, '')
      if (!map.has(spec)) map.set(spec, item)
    }
  return map
}

/** The story file and the local helpers it imports (`./ai-data`, `../blocks/ai-models`). */
function storyFiles(file, seen = new Set()) {
  if (seen.has(file)) return []
  seen.add(file)
  const source = fs.readFileSync(path.join(root, file), 'utf8')
  const helpers = [...source.matchAll(/from '(\.{1,2}\/[^']+)'/g)].flatMap(([, spec]) => {
    const base = path.join(path.dirname(file), spec)
    const found = ['.tsx', '.ts']
      .map((ext) => base + ext)
      .find((f) => fs.existsSync(path.join(root, f)))
    return found ? storyFiles(found, seen) : []
  })
  return [{ file, source }, ...helpers]
}

/** One example item per story file, naming the Coreloom items it shows. */
export function buildExamples(registry = readRegistry()) {
  const byImport = itemsByImport(registry)
  const examples = []
  for (const dir of STORY_DIRS)
    for (const name of fs.readdirSync(path.join(root, dir)).sort()) {
      if (!name.endsWith('.stories.tsx')) continue
      const files = storyFiles(path.join(dir, name))
      const [{ source }] = files
      const shown = [
        ...new Set(
          [...source.matchAll(/from '(@\/[^']+)'/g)]
            .map(([, spec]) => byImport.get(spec))
            .filter(Boolean),
        ),
      ]
      if (!shown.length) continue
      const title = /title: '((?:Components|Blocks)\/[^']+)'/.exec(source)?.[1] ?? name
      const titles = shown.map((item) => item.title ?? item.name)
      examples.push({
        $schema: SCHEMA,
        name: `${name.replace(/\.stories\.tsx$/, '')}-demo`,
        type: 'registry:example',
        title: `Examples: ${titles.join(', ')}`,
        description: `Usage examples (Storybook "${title}") for ${shown.map((item) => `${item.title ?? item.name} (@coreloom/${item.name})`).join(', ')}.`,
        registryDependencies: shown.map((item) => `@coreloom/${item.name}`),
        files: files.map(({ file, source: content }) => ({
          path: file,
          type: 'registry:example',
          target: `examples/coreloom/${path.basename(file)}`,
          content,
        })),
      })
    }
  return examples
}

function readRegistry() {
  return JSON.parse(fs.readFileSync(path.join(root, 'registry.json'), 'utf8'))
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const dir = path.resolve(process.argv[2] ?? path.join(root, 'public/r'))
  const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
  const examples = buildExamples()
  for (const example of examples) write(path.join(dir, `${example.name}.json`), example)
  const index = JSON.parse(fs.readFileSync(path.join(dir, 'registry.json'), 'utf8'))
  const names = new Set(examples.map((e) => e.name))
  write(path.join(dir, 'registry.json'), {
    ...index,
    items: [
      ...index.items.filter((item) => !names.has(item.name)),
      // The index lists files without their content, like `shadcn build` does.
      ...examples.map(({ $schema: _, files, ...item }) => ({
        ...item,
        files: files.map(({ content: __, ...file }) => file),
      })),
    ],
  })
  console.log(`wrote ${examples.length} example items to ${path.relative(root, dir)}`)
}
