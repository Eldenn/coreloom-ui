import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArchiveIcon, DownloadIcon, FolderInputIcon, TrashIcon } from 'lucide-react'
import * as React from 'react'

import { ActionBar } from '@/components/ui/action-bar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

const meta = {
  title: 'Components/Actions/Action bar',
  component: ActionBar,
  tags: ['autodocs'],
  args: { count: 3 },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A bar for the selected items. The consumer provides the `count`, the actions as `children` (small Buttons), and `onClear` (close button and Escape). Optional: `label` to replace "3 selected", `open` to force it, and `position` (`fixed` at the bottom of the screen, `sticky` or `static`).',
      },
    },
  },
} satisfies Meta<typeof ActionBar>
export default meta
type Story = StoryObj<typeof meta>

const invoices = [
  'INV-1042 · Atelier Martin',
  'INV-1043 · Nordwind GmbH',
  'INV-1044 · Casa Lumo',
  'INV-1045 · Studio Brume',
  'INV-1046 · Helio Labs',
]

function Selection() {
  const [selected, setSelected] = React.useState<string[]>(invoices.slice(0, 3))
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <ul className="m-0 flex list-none flex-col divide-y divide-border rounded-md border border-border p-0">
        {invoices.map((inv) => (
          <li key={inv} className="flex items-center gap-3 px-3 py-2.5 text-[14px] text-foreground">
            <Checkbox
              id={inv}
              checked={selected.includes(inv)}
              onCheckedChange={(on) => {
                setSelected((s) => (on ? [...s, inv] : s.filter((x) => x !== inv)))
              }}
            />
            <label htmlFor={inv}>{inv}</label>
          </li>
        ))}
      </ul>
      <ActionBar
        count={selected.length}
        position="static"
        onClear={() => {
          setSelected([])
        }}
      >
        <Button size="sm" variant="ghost">
          <ArchiveIcon /> Archive
        </Button>
        <Button size="sm" variant="ghost">
          <FolderInputIcon /> Move
        </Button>
        <Button size="sm" variant="ghost">
          <DownloadIcon /> Export
        </Button>
        <Button size="sm" variant="destructive">
          <TrashIcon /> Delete
        </Button>
      </ActionBar>
    </div>
  )
}

export const Default: Story = { render: () => <Selection /> }
