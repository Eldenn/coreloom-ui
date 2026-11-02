import type { Meta, StoryObj } from '@storybook/react-vite'
import { FolderPlusIcon } from 'lucide-react'
import * as React from 'react'

import { FileManager, type FileManagerItem } from '@/components/file-manager'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/sonner'

// Sample pictures drawn inline (the stories load nothing from the network).
const picture = (sky: string, hill: string, sun: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 800 600"><rect width="800" height="600" fill="${sky}"/><circle cx="600" cy="170" r="70" fill="${sun}"/><path d="M0 420 Q200 300 400 400 T800 380 V600 H0Z" fill="${hill}" opacity=".85"/><path d="M0 500 Q250 420 520 500 T800 470 V600 H0Z" fill="${hill}"/></svg>`,
  )}`

const files: FileManagerItem[] = [
  {
    id: 'design',
    name: 'Design',
    kind: 'folder',
    parentId: null,
    modifiedAt: '2026-10-13T16:20:00Z',
  },
  {
    id: 'contracts',
    name: 'Contracts',
    kind: 'folder',
    parentId: null,
    modifiedAt: '2026-10-02T09:00:00Z',
  },
  {
    id: 'reports',
    name: 'Reports',
    kind: 'folder',
    parentId: null,
    modifiedAt: '2026-10-10T11:00:00Z',
  },
  { id: 'q3', name: 'Q3', kind: 'folder', parentId: 'reports', modifiedAt: '2026-10-01T11:00:00Z' },
  {
    id: 'brand',
    name: 'Brand',
    kind: 'folder',
    parentId: 'design',
    modifiedAt: '2026-09-20T11:00:00Z',
  },
  {
    id: 'hero',
    name: 'Homepage hero.png',
    kind: 'file',
    parentId: 'design',
    mimeType: 'image/png',
    size: 1_284_000,
    modifiedAt: '2026-10-13T16:20:00Z',
    thumbnailUrl: picture('#1d3b53', '#0fa89f', '#f5c451'),
    owner: 'Ada Lovelace',
  },
  {
    id: 'pricing-shot',
    name: 'Pricing page.png',
    kind: 'file',
    parentId: 'design',
    mimeType: 'image/png',
    size: 932_000,
    modifiedAt: '2026-10-12T10:02:00Z',
    thumbnailUrl: picture('#3b2b4f', '#9085e9', '#ff9f80'),
    owner: 'Ada Lovelace',
  },
  {
    id: 'logo',
    name: 'Logo kit.zip',
    kind: 'file',
    parentId: 'brand',
    size: 18_400_000,
    modifiedAt: '2026-09-20T11:00:00Z',
  },
  {
    id: 'msa',
    name: 'Master services agreement.pdf',
    kind: 'file',
    parentId: 'contracts',
    mimeType: 'application/pdf',
    size: 412_000,
    modifiedAt: '2026-10-02T09:00:00Z',
    owner: 'Grace Hopper',
  },
  {
    id: 'q3-revenue',
    name: 'Q3 revenue.xlsx',
    kind: 'file',
    parentId: 'q3',
    size: 86_000,
    modifiedAt: '2026-10-01T11:00:00Z',
  },
  {
    id: 'roadmap',
    name: 'Roadmap 2027.md',
    kind: 'file',
    parentId: null,
    mimeType: 'text/markdown',
    size: 12_800,
    modifiedAt: '2026-10-14T07:45:00Z',
    owner: 'Matthieu C.',
  },
  {
    id: 'demo',
    name: 'Product demo.mp4',
    kind: 'file',
    parentId: null,
    mimeType: 'video/mp4',
    size: 248_000_000,
    modifiedAt: '2026-10-09T15:30:00Z',
  },
  {
    id: 'export',
    name: 'customers-export.csv',
    kind: 'file',
    parentId: null,
    mimeType: 'text/csv',
    size: 2_300_000,
    modifiedAt: '2026-10-11T08:10:00Z',
  },
  {
    id: 'config',
    name: 'deploy.config.json',
    kind: 'file',
    parentId: null,
    mimeType: 'application/json',
    size: 2_048,
    modifiedAt: '2026-10-08T13:00:00Z',
  },
]

const meta = {
  title: 'Blocks/File manager',
  component: FileManager,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Folders and files in a grid or a list, with a breadcrumb, multi-selection (Ctrl/⌘-click, Shift-click, Shift+arrows, Ctrl/⌘+A), drag and drop onto a folder or a crumb (or Move to, from the keyboard), files dropped from the computer, and a details panel. Pass the items flat with their `parentId`; do the work in `onMove`, `onDelete`, `onUpload` and `onOpen`.',
      },
    },
  },
  args: { items: files },
} satisfies Meta<typeof FileManager>
export default meta
type Story = StoryObj<typeof meta>

/** Everything wired to local state: move, delete, upload (fake), open. */
export const Default: Story = {
  render: function Render(args) {
    const [items, setItems] = React.useState(args.items)
    return (
      <FileManager
        {...args}
        items={items}
        defaultSelectedIds={['roadmap']}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setItems((all) => [
                ...all,
                {
                  id: `folder-${String(all.length)}`,
                  name: 'Untitled folder',
                  kind: 'folder',
                  parentId: null,
                },
              ])
            }}
          >
            <FolderPlusIcon aria-hidden />
            New folder
          </Button>
        }
        onMove={(ids, folderId) => {
          setItems((all) => all.map((i) => (ids.includes(i.id) ? { ...i, parentId: folderId } : i)))
        }}
        onDelete={(ids) => {
          setItems((all) => all.filter((i) => !ids.includes(i.id)))
        }}
        onUpload={(uploaded, folderId) => {
          setItems((all) => [
            ...all,
            ...uploaded.map((f, n) => ({
              id: `upload-${String(all.length + n)}`,
              name: f.name,
              kind: 'file' as const,
              parentId: folderId,
              size: f.size,
              mimeType: f.type,
              modifiedAt: new Date('2026-10-14T10:00:00+02:00'),
            })),
          ])
        }}
        onOpen={(item) => {
          toast(`Open ${item.name}`)
        }}
      />
    )
  },
}

/** The list view, sortable by name, size and date. */
export const ListView: Story = {
  args: { defaultView: 'list', defaultSelectedIds: ['demo', 'export'] },
}

/** Inside a folder: the breadcrumb leads back up, and the preview shows the image. */
export const InAFolder: Story = {
  args: { defaultFolderId: 'design', defaultSelectedIds: ['hero'] },
}

export const EmptyFolder: Story = {
  args: { defaultFolderId: 'q3', items: files.filter((f) => f.parentId !== 'q3') },
}

/** Read only: no toolbar actions, no drag and drop, no preview panel. */
export const Browse: Story = { args: { preview: false } }

export const French: Story = {
  globals: { locale: 'fr' },
  args: { defaultSelectedIds: ['roadmap'], onMove: () => undefined, onDelete: () => undefined },
}

export const Phone: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { defaultSelectedIds: ['roadmap'] },
  render: (args) => (
    <div className="max-w-[390px]">
      <FileManager {...args} />
    </div>
  ),
}
