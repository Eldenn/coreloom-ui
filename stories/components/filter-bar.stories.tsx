import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ColumnDef } from '@tanstack/react-table'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { FilterBar, type FilterView } from '@/components/ui/filter-bar'
import { FilterConditionEditor } from '@/components/ui/filter-condition'
import { QueryBuilder } from '@/components/ui/query-builder'
import {
  emptyFilter,
  type FilterCondition,
  type FilterField,
  type FilterGroup,
  matchesFilter,
} from '@/lib/filter'

interface Invoice {
  number: string
  customer: string
  amount: number
  issued: string
  status: 'draft' | 'open' | 'paid' | 'overdue'
  tags: string[]
  recurring: boolean
}

const invoices: Invoice[] = [
  {
    number: 'INV-1042',
    customer: 'Acme Corp',
    amount: 1200,
    issued: '2026-10-02',
    status: 'paid',
    tags: ['enterprise'],
    recurring: true,
  },
  {
    number: 'INV-1043',
    customer: 'Northwind',
    amount: 340,
    issued: '2026-10-05',
    status: 'open',
    tags: ['eu'],
    recurring: false,
  },
  {
    number: 'INV-1044',
    customer: 'Globex',
    amount: 8900,
    issued: '2026-09-21',
    status: 'overdue',
    tags: ['enterprise', 'us'],
    recurring: true,
  },
  {
    number: 'INV-1045',
    customer: 'Initech',
    amount: 75,
    issued: '2026-10-11',
    status: 'draft',
    tags: [],
    recurring: false,
  },
  {
    number: 'INV-1046',
    customer: 'Umbrella Health',
    amount: 2450,
    issued: '2026-10-12',
    status: 'open',
    tags: ['eu', 'enterprise'],
    recurring: true,
  },
  {
    number: 'INV-1047',
    customer: 'Stark Industries',
    amount: 15800,
    issued: '2026-08-30',
    status: 'paid',
    tags: ['us'],
    recurring: false,
  },
  {
    number: 'INV-1048',
    customer: 'Wayne Logistics',
    amount: 610,
    issued: '2026-10-13',
    status: 'overdue',
    tags: ['us'],
    recurring: false,
  },
]

const fields: FilterField<Invoice>[] = [
  { id: 'customer', label: 'Customer', type: 'text' },
  { id: 'amount', label: 'Amount', type: 'number' },
  { id: 'issued', label: 'Issued', type: 'date' },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'open', label: 'Open' },
      { value: 'paid', label: 'Paid' },
      { value: 'overdue', label: 'Overdue' },
    ],
  },
  {
    id: 'tags',
    label: 'Tags',
    type: 'multiselect',
    options: [
      { value: 'enterprise', label: 'Enterprise' },
      { value: 'eu', label: 'EU' },
      { value: 'us', label: 'US' },
    ],
  },
  { id: 'recurring', label: 'Recurring', type: 'boolean' },
]

const frLabels: Record<string, string> = {
  customer: 'Client',
  amount: 'Montant',
  issued: 'Émise le',
  status: 'Statut',
  tags: 'Étiquettes',
  recurring: 'Récurrente',
  draft: 'Brouillon',
  open: 'Ouverte',
  paid: 'Payée',
  overdue: 'En retard',
}
const frFields: FilterField<Invoice>[] = fields.map((field) => ({
  ...field,
  label: frLabels[field.id] ?? field.label,
  options: field.options?.map((o) => ({ ...o, label: frLabels[o.value] ?? o.label })),
}))

const condition = (
  id: string,
  field: string,
  operator: FilterCondition['operator'],
  value: FilterCondition['value'],
): FilterCondition => ({ kind: 'condition', id, field, operator, value })

const unpaid: FilterGroup = {
  kind: 'group',
  id: 'unpaid',
  combinator: 'and',
  rules: [
    condition('c-status', 'status', 'anyOf', ['open', 'overdue']),
    condition('c-amount', 'amount', 'gte', 500),
  ],
}

const views: FilterView[] = [
  { id: 'unpaid', label: 'Unpaid over 500', filter: unpaid },
  {
    id: 'enterprise',
    label: 'Enterprise',
    filter: {
      kind: 'group',
      id: 'enterprise',
      combinator: 'and',
      rules: [condition('c-tags', 'tags', 'anyOf', ['enterprise'])],
    },
  },
]

const nested: FilterGroup = {
  kind: 'group',
  id: 'root',
  combinator: 'and',
  rules: [
    condition('n-issued', 'issued', 'between', { from: '2026-10-01', to: '2026-10-14' }),
    {
      kind: 'group',
      id: 'n-or',
      combinator: 'or',
      rules: [
        condition('n-status', 'status', 'is', 'overdue'),
        condition('n-amount', 'amount', 'gt', 2000),
      ],
    },
  ],
}

const meta = {
  title: 'Components/Forms/Filter bar',
  component: FilterBar,
  tags: ['autodocs'],
  args: { fields, defaultValue: unpaid, resultCount: 3 },
  argTypes: { resultCount: { control: 'number' } },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The filters of a list or a table as chips: "Add filter" picks a field, a chip opens to edit its operator and value, × removes it. The consumer provides `fields` (id, label, type, options) and `value` + `onValueChange` (a `FilterGroup`), and runs the filter with `matchesFilter` from `@/lib/filter` or sends it to its API. `QueryBuilder` edits the same value as nested AND / OR groups.',
      },
    },
  },
} satisfies Meta<typeof FilterBar<Invoice>>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  args: { defaultValue: undefined, resultCount: invoices.length },
}

export const WithViews: Story = {
  name: 'Saved views',
  render: () => {
    const [filter, setFilter] = React.useState<FilterGroup>(unpaid)
    const [saved, setSaved] = React.useState(views)
    const count = invoices.filter((row) => matchesFilter(row, filter, fields)).length
    return (
      <FilterBar
        fields={fields}
        value={filter}
        onValueChange={setFilter}
        views={saved}
        onSaveView={(next) => {
          setSaved([
            ...saved,
            { id: `view-${String(saved.length + 1)}`, label: 'My view', filter: next },
          ])
        }}
        resultCount={count}
      />
    )
  },
}

export const ManyFilters: Story = {
  name: 'Many filters',
  args: {
    resultCount: 0,
    defaultValue: {
      kind: 'group',
      id: 'many',
      combinator: 'or',
      rules: [
        condition('m1', 'customer', 'contains', 'Umbrella Health International Holdings'),
        condition('m2', 'status', 'anyOf', ['draft', 'open', 'paid', 'overdue']),
        condition('m3', 'amount', 'between', { from: 1000, to: 25000 }),
        condition('m4', 'issued', 'after', '2026-09-30'),
        condition('m5', 'tags', 'allOf', ['enterprise', 'eu']),
        condition('m6', 'recurring', 'isTrue', null),
        condition('m7', 'customer', 'startsWith', ''),
        { ...nested, id: 'm8' },
      ],
    },
  },
}

const columns: ColumnDef<Invoice>[] = [
  { accessorKey: 'number', header: 'Invoice' },
  { accessorKey: 'customer', header: 'Customer' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <span className="font-mono">
        {new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' }).format(
          row.original.amount,
        )}
      </span>
    ),
  },
  { accessorKey: 'issued', header: 'Issued' },
]

export const WithTable: Story = {
  name: 'Over a table',
  render: () => {
    const [filter, setFilter] = React.useState<FilterGroup>(unpaid)
    const rows = invoices.filter((row) => matchesFilter(row, filter, fields))
    return (
      <div className="flex flex-col gap-3">
        <FilterBar
          fields={fields}
          value={filter}
          onValueChange={setFilter}
          resultCount={rows.length}
        />
        <DataTable columns={columns} data={rows} getRowId={(row) => row.number} pageSize={10} />
      </div>
    )
  },
}

export const Builder: Story = {
  name: 'Query builder',
  render: () => {
    const [filter, setFilter] = React.useState<FilterGroup>(nested)
    const count = invoices.filter((row) => matchesFilter(row, filter, fields)).length
    return (
      <div className="flex max-w-3xl flex-col gap-2">
        <QueryBuilder fields={fields} value={filter} onValueChange={setFilter} />
        <p className="text-[13px] text-muted-foreground">{count} of 7 invoices match.</p>
      </div>
    )
  },
}

export const EmptyBuilder: Story = {
  name: 'Query builder, empty',
  render: () => <QueryBuilder fields={fields} defaultValue={emptyFilter()} maxDepth={2} />,
}

export const ConditionEditor: Story = {
  name: 'Condition editor',
  render: () => {
    const [value, setValue] = React.useState<FilterCondition>(() =>
      condition('e1', 'amount', 'between', { from: 100, to: 2500 }),
    )
    return (
      <div className="flex max-w-xs flex-col gap-4">
        <FilterConditionEditor fields={fields} condition={value} onConditionChange={setValue} />
      </div>
    )
  },
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => {
    const [filter, setFilter] = React.useState<FilterGroup>(nested)
    return (
      <div className="flex max-w-3xl flex-col gap-4">
        <FilterBar
          fields={frFields}
          value={filter}
          onValueChange={setFilter}
          views={[{ id: 'unpaid', label: 'Impayées de plus de 500', filter: unpaid }]}
          resultCount={2}
        />
        <QueryBuilder fields={frFields} value={filter} onValueChange={setFilter} />
      </div>
    )
  },
}
