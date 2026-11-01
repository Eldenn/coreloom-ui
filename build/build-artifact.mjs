import fs from 'node:fs'
import path from 'node:path'

import * as esbuild from 'esbuild'

const root = path.resolve(import.meta.dirname, '..')
const out = process.argv[2]
const NS = 'CoreloomUIDesignSystem_ff5f32'
const COMPONENTS = [
  'Accordion',
  'Alert',
  'AlertDialog',
  'Avatar',
  'Badge',
  'Breadcrumb',
  'Button',
  'Calendar',
  'Card',
  'Carousel',
  'Chart',
  'Sparkline',
  'DonutChart',
  'BarList',
  'Gauge',
  'Heatmap',
  'FunnelChart',
  'RadarChart',
  'ScatterChart',
  'TreemapChart',
  'SankeyChart',
  'Checkbox',
  'Collapsible',
  'Combobox',
  'Command',
  'ContextMenu',
  'DataTable',
  'DatePicker',
  'Dialog',
  'Drawer',
  'DropdownMenu',
  'Empty',
  'Field',
  'HoverCard',
  'Icon',
  'Input',
  'InputOTP',
  'Item',
  'Kbd',
  'Label',
  'Menubar',
  'NavigationMenu',
  'Pagination',
  'Popover',
  'Progress',
  'RadioGroup',
  'Resizable',
  'ScrollArea',
  'Select',
  'Separator',
  'Sheet',
  'Sidebar',
  'Skeleton',
  'Slider',
  'Spinner',
  'Switch',
  'Table',
  'Tabs',
  'Textarea',
  'Toaster',
  'Toggle',
  'ToggleGroup',
  'Tooltip',
  'DateRangePicker',
  'TagsInput',
  'FileUpload',
  'Stepper',
  'MultiSelect',
  'MoneyInput',
  'PhoneInput',
  'RichTextEditor',
  'VirtualList',
  'Markdown',
  'PromptInput',
  'Reasoning',
  'ToolCall',
  'AgentPlan',
  'ToolForm',
  'InlineCitation',
  'ModelPicker',
  'ContextMeter',
  'AgentGraph',
  'AppShell',
  'LoginForm',
  'SettingsLayout',
  'Hero',
  'DocsLayout',
  'Chat',
  'ConversationList',
  'ChatWidget',
  'ArtifactPanel',
  'AgentList',
  'AgentEditor',
  'RunList',
  'RunTrace',
  'AgentTeams',
  'Playground',
  'KnowledgeBase',
  'RetrievalTest',
]

const globals = {
  name: 'globals',
  setup(b) {
    b.onResolve({ filter: /^react\/jsx(-dev)?-runtime$/ }, () => ({
      path: path.join(root, 'build/jsx-runtime-shim.js'),
    }))
    b.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'g' }))
    b.onResolve({ filter: /^react-dom(\/client)?$/ }, () => ({ path: 'react-dom', namespace: 'g' }))
    b.onLoad({ filter: /.*/, namespace: 'g' }, (a) => ({
      contents: `module.exports = window.${a.path === 'react' ? 'React' : 'ReactDOM'}`,
      loader: 'js',
    }))
  },
}

const r = await esbuild.build({
  entryPoints: [path.join(root, 'build/artifact-entry.ts')],
  bundle: true,
  format: 'iife',
  globalName: '__coreloom',
  minify: true,
  target: 'es2020',
  jsx: 'automatic',
  alias: { '@': path.join(root, 'src') },
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [globals],
  write: false,
  legalComments: 'none',
  metafile: true,
})
let code = r.outputFiles[0].text
const header = { format: 3, namespace: NS, components: COMPONENTS.map((name) => ({ name })) }
code = `/* @ds-bundle: ${JSON.stringify(header)} */\n/* Coreloom UI on shadcn/ui (Radix). Built from components/src — do not edit by hand. */\n${code}\nwindow.${NS} = Object.assign(window.${NS} || {}, __coreloom);\n`
for (const bad of ['</script', '<!--'])
  if (code.toLowerCase().includes(bad))
    code = code.split(bad).join(bad === '</script' ? '<\\/script' : '\\x3C!--')
if (/<\/script|<!--/i.test(code)) throw new Error('unsafe sequence left')
fs.writeFileSync(out, code)
console.log('bundle', (code.length / 1024).toFixed(1) + ' KB')
