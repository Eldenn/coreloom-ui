import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { CodeEditor, type CodeEditorDiagnostic } from '@/components/ui/code-editor'
import { Label } from '@/components/ui/label'

const component = `import * as React from 'react'

interface CounterProps {
  /** Where it starts. */
  initial?: number
}

export function Counter({ initial = 0 }: CounterProps) {
  const [count, setCount] = React.useState(initial)
  return (
    <button type="button" onClick={() => setCount((c) => c + 1)}>
      Clicked {count} times
    </button>
  )
}
`

const config = `{
  "compilerOptions": {
    "target": "ES2023",
    "strict": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
`

const query = `def top_customers(orders, n=5):
    """The n customers who spent the most."""
    totals = {}
    for order in orders:
        totals[order["customer"]] = totals.get(order["customer"], 0) + order["amount"]
    return sorted(totals.items(), key=lambda kv: kv[1], reverse=True)[:n]
`

const styles = `.card {
  display: grid;
  gap: 12px;
  border-radius: 12px;
  padding: 16px 20px;
}
`

const meta = {
  title: 'Components/Forms/Code editor',
  component: CodeEditor,
  tags: ['autodocs'],
  args: { defaultValue: component, path: 'counter.tsx', 'aria-label': 'Code', maxHeight: '420px' },
  argTypes: {
    language: {
      control: 'select',
      options: [
        'javascript',
        'jsx',
        'typescript',
        'tsx',
        'json',
        'css',
        'html',
        'markdown',
        'python',
        'text',
      ],
    },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Code to write, on CodeMirror 6 with Coreloom colours. The consumer provides `value` + `onChange` (or `defaultValue`), a `language` or a `path` to derive it from, and optionally `diagnostics` by line and column, `onSave` (Mod-S), `readOnly`, `wrap`, `tabSize`, sizes and more CodeMirror `extensions`.',
      },
    },
  },
} satisfies Meta<typeof CodeEditor>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function Render(args) {
    const [value, setValue] = React.useState(component)
    return <CodeEditor {...args} className="max-w-2xl" value={value} onChange={setValue} />
  },
}

/** JSON, Python and CSS: the language comes from each file's extension. */
export const Languages: Story = {
  render: () => (
    <div className="grid max-w-2xl gap-6">
      <CodeEditor defaultValue={config} path="tsconfig.json" aria-label="tsconfig.json" />
      <CodeEditor defaultValue={query} path="reports.py" aria-label="reports.py" />
      <CodeEditor defaultValue={styles} path="card.css" aria-label="card.css" />
    </div>
  ),
}

const problems: CodeEditorDiagnostic[] = [
  {
    line: 9,
    column: 10,
    endColumn: 15,
    severity: 'warning',
    message: "'count' is declared but never read.",
    source: 'ts(6133)',
  },
  {
    line: 11,
    column: 19,
    endColumn: 26,
    severity: 'error',
    message: 'Unknown prop.',
    source: 'tsc',
  },
]

/** Diagnostics underline the code and mark the gutter; hover or press Mod-Shift-M to read them. */
export const WithDiagnostics: Story = {
  args: { diagnostics: problems },
  render: (args) => <CodeEditor {...args} className="max-w-2xl" />,
}

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: config, path: 'tsconfig.json' },
  render: (args) => <CodeEditor {...args} className="max-w-2xl" />,
}

/** A field in a form, labelled by its `<Label>`, with a placeholder and wrapped lines. */
export const InAForm: Story = {
  render: function Render() {
    const id = React.useId()
    const [value, setValue] = React.useState('')
    return (
      <div className="grid max-w-xl gap-2">
        <Label id={id}>Transform script</Label>
        <CodeEditor
          aria-labelledby={id}
          language="javascript"
          value={value}
          onChange={setValue}
          placeholder="return input.map((row) => ({ ...row, total: row.price * row.qty }))"
          wrap
          lineNumbers={false}
          folding={false}
          minHeight="120px"
        />
      </div>
    )
  },
}

export const French: Story = {
  args: { diagnostics: problems },
  globals: { locale: 'fr' },
  render: (args) => <CodeEditor {...args} className="max-w-2xl" />,
}
