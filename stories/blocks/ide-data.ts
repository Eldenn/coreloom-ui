// Demo project for the IDE stories: a small React + TypeScript app, and a toy linter that runs in
// the browser so the Problems panel has something real to show.
import type { IdeFile } from '@/components/ide'
import type { CodeEditorDiagnostic } from '@/components/ui/code-editor'

export const demoProject: IdeFile[] = [
  {
    path: 'package.json',
    content: `{
  "name": "orbit-dashboard",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  }
}
`,
  },
  {
    path: 'README.md',
    content: `# Orbit dashboard

A **small** dashboard to try the IDE block.

- \`src/app.tsx\` renders the page
- \`src/lib/format.ts\` formats numbers and dates
`,
  },
  {
    path: 'src/app.tsx',
    content: `import { useState } from 'react'

import { StatCard } from './components/stat-card'
import { formatCompact } from './lib/format'

export function App() {
  const [range, setRange] = useState<'7d' | '30d'>('7d')
  const visitors = range === '7d' ? 12840 : 51203

  console.log('render', range)

  return (
    <main className="dashboard">
      <h1>Orbit</h1>
      <button onClick={() => setRange(range === '7d' ? '30d' : '7d')}>
        Last {range === '7d' ? '7' : '30'} days
      </button>
      <StatCard label="Visitors" value={formatCompact(visitors)} trend={0.124} />
    </main>
  )
}
`,
  },
  {
    path: 'src/components/stat-card.tsx',
    content: `interface StatCardProps {
  label: string
  value: string
  /** 0.12 = +12 % */
  trend?: number
}

export function StatCard({ label, value, trend }: StatCardProps) {
  const up = (trend ?? 0) >= 0
  return (
    <section className="stat-card">
      <p className="label">{label}</p>
      <p className="value">{value}</p>
      {trend !== undefined && (
        <p className={up ? 'trend up' : 'trend down'}>
          {up ? '▲' : '▼'} {Math.abs(trend * 100).toFixed(1)} %
        </p>
      )}
    </section>
  )
}
`,
  },
  {
    path: 'src/lib/format.ts',
    content: `const compact = new Intl.NumberFormat('en', { notation: 'compact' })

/** 12840 → "13K" */
export function formatCompact(n: number): string {
  return compact.format(n)
}

// TODO: take the user's locale
export function formatDay(date: Date, options: any = {}) {
  return date.toLocaleDateString('en', { day: 'numeric', month: 'short', ...options })
}
`,
  },
  {
    path: 'src/styles.css',
    content: `.dashboard {
  display: grid;
  gap: 16px;
  padding: 24px;
}

.stat-card .value {
  font-size: 32px;
  font-weight: 600;
}

.trend.up { color: #0b9a92; }
.trend.down { color: #d55181; }
`,
  },
  {
    path: 'scripts/seed.py',
    content: `"""Writes demo rows for the dashboard."""
import json
import random

def seed(days: int = 30) -> list[dict]:
    return [{"day": d, "visitors": random.randint(300, 900)} for d in range(days)]

if __name__ == "__main__":
    print(json.dumps(seed(), indent=2))
`,
  },
]

/**
 * A toy linter, in the browser: console calls, `any`, TODO comments. A real app would run ESLint
 * or TypeScript in a worker, or ask its server.
 */
export function lintFiles(files: IdeFile[]): Record<string, CodeEditorDiagnostic[]> {
  const out: Record<string, CodeEditorDiagnostic[]> = {}
  for (const file of files) {
    if (!/\.(m?[jt]sx?)$/.test(file.path)) continue
    const list: CodeEditorDiagnostic[] = []
    file.content.split('\n').forEach((text, i) => {
      const line = i + 1
      const consoleAt = text.indexOf('console.')
      if (consoleAt >= 0)
        list.push({
          line,
          column: consoleAt + 1,
          endColumn: text.indexOf('(', consoleAt) + 1 || undefined,
          severity: 'warning',
          message: 'Unexpected console statement.',
          source: 'no-console',
        })
      const anyMatch = /:\s*any\b/.exec(text)
      if (anyMatch)
        list.push({
          line,
          column: anyMatch.index + anyMatch[0].length - 2,
          endColumn: anyMatch.index + anyMatch[0].length + 1,
          severity: 'error',
          message: 'Unexpected any. Specify a different type.',
          source: 'no-explicit-any',
        })
      const todoAt = text.indexOf('TODO')
      if (todoAt >= 0)
        list.push({
          line,
          column: todoAt + 1,
          endColumn: todoAt + 5,
          severity: 'info',
          message: 'Unresolved TODO comment.',
          source: 'no-warning-comments',
        })
    })
    if (list.length > 0) out[file.path] = list
  }
  return out
}
