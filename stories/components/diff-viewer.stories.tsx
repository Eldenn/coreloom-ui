import type { Meta, StoryObj } from '@storybook/react-vite'

import { DiffViewer } from '@/components/ui/diff-viewer'

const before = `{
  "name": "coreloom-app",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "test": "vitest run",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "zod": "3.25.0"
  }
}`

const after = `{
  "name": "coreloom-app",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "test": "vitest run",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "zod": "4.1.0"
  }
}`

const meta = {
  title: 'Components/Data display/Diff viewer',
  component: DiffViewer,
  tags: ['autodocs'],
  args: { before, after, title: 'package.json' },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'What changed between two texts. The consumer provides `before` and `after`, and optionally `view` (`unified` or `split`), `context` (unchanged lines kept around each change), a `title` and `wrap`.',
      },
    },
  },
} satisfies Meta<typeof DiffViewer>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <DiffViewer
      className="max-w-2xl rounded-lg border border-border bg-inset"
      before={before}
      after={after}
      title="package.json"
    />
  ),
}

export const Split: Story = {
  render: () => (
    <DiffViewer
      className="max-w-4xl rounded-lg border border-border bg-inset"
      before={before}
      after={after}
      title="package.json"
      view="split"
      context={1}
    />
  ),
}
