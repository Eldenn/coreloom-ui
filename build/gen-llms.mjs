// Writes what AI assistants read about Coreloom UI (https://llmstxt.org), from registry.json and the
// component guides in stories/guidelines/:
//   public/llms.txt        an index: what the system is, how to install, every item with its guide
//   public/llms-full.txt   the same, with every guide inlined, for tools that read one file
//   public/guides/*.md     each guide on its own, linked from llms.txt
// Usage: node build/gen-llms.mjs [outDir]   (default: public)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE = 'https://eldenn.github.io/coreloom-ui'
const root = path.resolve(import.meta.dirname, '..')
const out = path.resolve(process.argv[2] ?? path.join(root, 'public'))
const guidesDir = path.join(root, 'stories/guidelines')

/** Items whose guide isn't named after them. */
const GUIDE_FOR = {
  auth: ['LoginForm', 'PasswordReset'],
  settings: ['SettingsLayout'],
  marketing: ['Hero'],
  docs: ['DocsLayout'],
  'model-field': ['ModelPicker'],
  'theme-toggle': ['Accents'],
  'command-menu': ['Command'],
  i18n: ['Language'],
  accent: ['ThemeGenerator'],
}

/** Guides about the system rather than one item, listed under "Guides". */
const TOPICS = [
  'AiSdk',
  'EditorAi',
  'Accents',
  'ThemeGenerator',
  'Language',
  'InteractionStates',
  'Motion',
]

const SECTIONS = [
  ['Foundations', (i) => ['registry:item', 'registry:lib', 'registry:hook'].includes(i.type)],
  ['Components', (i) => i.type === 'registry:ui'],
  ['Block parts', (i) => i.type === 'registry:component'],
  ['Blocks', (i) => i.type === 'registry:block'],
]

const pascal = (name) =>
  name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')

const exists = (guide) => fs.existsSync(path.join(guidesDir, `${guide}.md`))

/** The guides that document an item, in order. */
export function guidesFor(item) {
  const named = GUIDE_FOR[item.name] ?? [
    pascal(item.name),
    (item.title ?? '').replace(/[^A-Za-z0-9]/g, ''),
  ]
  return [...new Set(named)].filter(exists)
}

const guideUrl = (guide) => `${SITE}/guides/${guide}.md`
const readGuide = (guide) => fs.readFileSync(path.join(guidesDir, `${guide}.md`), 'utf8').trim()

export function build() {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'registry.json'), 'utf8'))
  const items = registry.items

  const intro = `# Coreloom UI

> A React design system on shadcn/ui (React 19, Radix, Tailwind CSS v4, TanStack Form/Table/Virtual), shipped as a shadcn registry under the \`@coreloom\` namespace. Dark and light themes, accent presets, English/French/Spanish/German strings, WCAG AA. Front-end only: the AI blocks read the AI SDK's \`UIMessage\` shapes but never call a model.

## Install

Add the namespace to the app's \`components.json\`, then add items by name:

\`\`\`json
{ "registries": { "@coreloom": "${SITE}/r/{name}.json" } }
\`\`\`

\`\`\`bash
pnpm dlx shadcn@latest add @coreloom/all          # theme, fonts, utils, every component
pnpm dlx shadcn@latest add @coreloom/button @coreloom/ai-chat
\`\`\`

Then, in the global CSS after \`@import "tailwindcss";\`: \`@import "tw-animate-css"; @import "./coreloom/fonts.css"; @import "./coreloom/tokens.css"; @import "./coreloom/theme.css";\`. Mount \`TooltipProvider\` and one \`Toaster\` at the root. Components install into \`@/components/ui/<name>\`, block parts into \`@/components/<name>\`; import them by name (named exports only).

Rules that hold everywhere: colours come from the semantic Tailwind tokens (\`bg-primary\`, \`text-muted-foreground\`, \`border-border\`…), never hex values; every string comes from \`useCoreloomI18n()\`; focus is the 3 px \`ring-ring\`; one primary (cyan) action per view.

- [Registry index](${SITE}/r/registry.json): every item as JSON (files, dependencies)
- [Storybook](${SITE}/): live examples of every component and block
- [Design tokens (DTCG)](${SITE}/tokens/coreloom.tokens.json)
`

  const index = [intro]
  const full = [intro]
  for (const [title, match] of SECTIONS) {
    const section = items.filter(match)
    if (!section.length) continue
    index.push(`## ${title}\n`)
    full.push(`## ${title}\n`)
    for (const item of section) {
      const guides = guidesFor(item)
      const install = `\`@coreloom/${item.name}\``
      const description = item.description?.trim() ?? ''
      index.push(
        guides.length
          ? `- [${item.title ?? item.name}](${guideUrl(guides[0])}): ${install} — ${description}`
          : `- ${item.title ?? item.name}: ${install} — ${description}`,
      )
      full.push(`### ${item.title ?? item.name} (${install})\n\n${description}\n`)
      for (const guide of guides) full.push(readGuide(guide).replace(/^# .*\n+/, '') + '\n')
    }
    index.push('')
  }

  const topics = TOPICS.filter(exists)
  index.push('## Guides\n')
  full.push('## Guides\n')
  for (const guide of topics) {
    const text = readGuide(guide)
    const heading = /^# (.*)$/m.exec(text)?.[1] ?? guide
    index.push(`- [${heading}](${guideUrl(guide)})`)
    full.push(text.replace(/^# /, '### ') + '\n')
  }
  index.push(
    '\n## Optional\n',
    `- [Everything in one file](${SITE}/llms-full.txt): every guide inlined`,
  )

  const used = new Set([...items.flatMap(guidesFor), ...topics])
  return { index: index.join('\n') + '\n', full: full.join('\n') + '\n', guides: [...used].sort() }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const { index, full, guides } = build()
  fs.mkdirSync(path.join(out, 'guides'), { recursive: true })
  fs.writeFileSync(path.join(out, 'llms.txt'), index)
  fs.writeFileSync(path.join(out, 'llms-full.txt'), full)
  for (const guide of guides)
    fs.copyFileSync(path.join(guidesDir, `${guide}.md`), path.join(out, 'guides', `${guide}.md`))
  console.log(
    `wrote llms.txt, llms-full.txt and ${guides.length} guides to ${path.relative(root, out) || '.'}`,
  )
}
