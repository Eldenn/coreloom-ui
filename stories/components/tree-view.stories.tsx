import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  BookOpenIcon,
  FileCodeIcon,
  FileJsonIcon,
  FileTextIcon,
  FolderIcon,
  FolderOpenIcon,
} from 'lucide-react'
import * as React from 'react'

import { TreeView, type TreeViewNode } from '@/components/ui/tree-view'

const folder = (open: boolean) => (open ? <FolderOpenIcon /> : <FolderIcon />)

const files: TreeViewNode[] = [
  {
    id: 'src',
    label: 'src',
    icon: folder,
    children: [
      {
        id: 'src/components',
        label: 'components',
        icon: folder,
        children: [
          {
            id: 'src/components/button.tsx',
            label: 'button.tsx',
            icon: <FileCodeIcon />,
            meta: '4 KB',
          },
          {
            id: 'src/components/card.tsx',
            label: 'card.tsx',
            icon: <FileCodeIcon />,
            meta: '2 KB',
          },
          {
            id: 'src/components/legacy.tsx',
            label: 'legacy.tsx',
            icon: <FileCodeIcon />,
            disabled: true,
          },
        ],
      },
      { id: 'src/index.ts', label: 'index.ts', icon: <FileCodeIcon />, meta: '1 KB' },
    ],
  },
  {
    id: 'docs',
    label: 'docs',
    icon: folder,
    children: [{ id: 'docs/intro.md', label: 'intro.md', icon: <FileTextIcon />, meta: '6 KB' }],
  },
  { id: 'package.json', label: 'package.json', icon: <FileJsonIcon />, meta: '2 KB' },
  { id: 'README.md', label: 'README.md', icon: <FileTextIcon />, meta: '3 KB' },
]

const handbook: TreeViewNode[] = [
  {
    id: 'onboarding',
    label: 'Onboarding',
    meta: '4',
    children: [
      { id: 'first-day', label: 'Your first day' },
      { id: 'tools', label: 'Tools and accounts' },
      { id: 'buddy', label: 'Your buddy' },
      { id: 'faq', label: 'FAQ' },
    ],
  },
  {
    id: 'engineering',
    label: 'Engineering',
    meta: '3',
    children: [
      { id: 'reviews', label: 'Code reviews' },
      { id: 'releases', label: 'Releases' },
      { id: 'on-call', label: 'On call' },
    ],
  },
  { id: 'holidays', label: 'Holidays', icon: <BookOpenIcon /> },
]

const meta = {
  title: 'Components/Data display/Tree view',
  component: TreeView,
  tags: ['autodocs'],
  args: { nodes: files },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A hierarchy to browse. The consumer provides `nodes` (`{ id, label, icon?, meta?, children?, disabled? }`), a label, and optionally `selectionMode` (`none`, `single`, `multiple`) with `selected` + `onSelectedChange`, `expanded` + `onExpandedChange`, and `onAction` for Enter or a click.',
      },
    },
  },
} satisfies Meta<typeof TreeView>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [file, setFile] = React.useState<string | null>('src/components/button.tsx')
    return (
      <div className="flex max-w-sm flex-col gap-3">
        <TreeView
          aria-label="Files"
          nodes={files}
          selectionMode="single"
          selected={file}
          onSelectedChange={setFile}
          defaultExpanded={['src', 'src/components']}
        />
        <p className="m-0 text-[13px] text-muted-foreground">Open: {file ?? '—'}</p>
      </div>
    )
  },
}

export const Multiple: Story = {
  render: () => {
    const [pages, setPages] = React.useState(['first-day', 'tools'])
    return (
      <div className="flex max-w-sm flex-col gap-3">
        <TreeView
          aria-label="Pages to export"
          nodes={handbook}
          selectionMode="multiple"
          selected={pages}
          onSelectedChange={setPages}
          defaultExpanded={['onboarding']}
        />
        <p className="m-0 text-[13px] text-muted-foreground">
          {pages.length} pages: {pages.join(', ') || '—'}
        </p>
      </div>
    )
  },
}
