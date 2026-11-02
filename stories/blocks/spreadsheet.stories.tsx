import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import {
  type SheetColumn,
  type SheetRow,
  type SheetValue,
  Spreadsheet,
} from '@/components/spreadsheet'

const currency = (value: SheetValue, locale: string) =>
  typeof value === 'number'
    ? new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(value)
    : (value ?? '')

const columns: SheetColumn[] = [
  { id: 'sku', title: 'SKU', width: 96, readOnly: true },
  { id: 'product', title: 'Product', width: 200 },
  { id: 'region', title: 'Region', width: 110 },
  { id: 'units', title: 'Units', type: 'number', width: 90 },
  { id: 'price', title: 'Unit price', type: 'number', width: 110, format: currency },
  { id: 'notes', title: 'Notes', width: 220 },
]

const rows: SheetRow[] = [
  {
    id: 'r1',
    sku: 'CL-001',
    product: 'Starter plan',
    region: 'EU',
    units: 128,
    price: 19,
    notes: '',
  },
  {
    id: 'r2',
    sku: 'CL-002',
    product: 'Team plan',
    region: 'EU',
    units: 64,
    price: 49,
    notes: 'Annual',
  },
  {
    id: 'r3',
    sku: 'CL-003',
    product: 'Enterprise',
    region: 'US',
    units: 6,
    price: 1200,
    notes: 'Custom SLA',
  },
  {
    id: 'r4',
    sku: 'CL-004',
    product: 'Extra seats',
    region: 'US',
    units: 310,
    price: 9,
    notes: '',
  },
  {
    id: 'r5',
    sku: 'CL-005',
    product: 'Storage 1 TB',
    region: 'APAC',
    units: 42,
    price: 15,
    notes: '',
  },
  {
    id: 'r6',
    sku: 'CL-006',
    product: 'Priority support',
    region: 'EU',
    units: 18,
    price: 99,
    notes: 'Renews in Nov',
  },
  {
    id: 'r7',
    sku: 'CL-007',
    product: 'Training day',
    region: 'EU',
    units: 3,
    price: 1500,
    notes: null,
  },
  {
    id: 'r8',
    sku: 'CL-008',
    product: 'API calls (100k)',
    region: 'US',
    units: 75,
    price: 25,
    notes: '',
  },
]

const meta = {
  title: 'Blocks/Spreadsheet',
  component: Spreadsheet,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'An editable grid that behaves like a spreadsheet: arrows, type to replace or Enter to edit, ranges with Shift or by dragging, copy, cut and paste as tab-separated text (to and from Excel or Google Sheets), Delete to clear, Ctrl/⌘+Z to undo. Number columns read "1 234,5" and "1,234.5". Controlled: keep `rows` and save them in `onRowsChange`; `createRow` lets a paste add rows.',
      },
    },
  },
  args: { columns, rows, 'aria-label': 'Q4 sales' },
} satisfies Meta<typeof Spreadsheet>
export default meta
type Story = StoryObj<typeof meta>

/** Edit, paste a block from another spreadsheet, undo: the rows live in local state. */
export const Default: Story = {
  render: function Render(args) {
    const [data, setData] = React.useState(args.rows)
    return (
      <Spreadsheet
        {...args}
        rows={data}
        onRowsChange={setData}
        createRow={(i) => ({ id: `new-${String(i)}`, sku: `CL-${String(i + 1).padStart(3, '0')}` })}
        className="max-h-[420px]"
      />
    )
  },
}

/** Read only: move, select and copy. */
export const ReadOnly: Story = { args: { readOnly: true } }

/** A cell that isn't a number in a number column shows in red, and isn't summed. */
export const InvalidNumber: Story = {
  args: {
    rows: rows.map((r) => (r.id === 'r3' ? { ...r, units: 'six' } : r)),
    onRowsChange: () => undefined,
  },
}

export const Empty: Story = { args: { rows: [] } }

export const French: Story = {
  globals: { locale: 'fr' },
  args: {
    columns: columns.map((c) => ({
      ...c,
      title:
        {
          sku: 'Réf.',
          product: 'Produit',
          region: 'Région',
          units: 'Unités',
          price: 'Prix unitaire',
          notes: 'Notes',
        }[c.id] ?? c.title,
    })),
    onRowsChange: () => undefined,
  },
}

export const Phone: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { onRowsChange: () => undefined },
  render: (args) => (
    <div className="max-w-[390px]">
      <Spreadsheet {...args} />
    </div>
  ),
}
