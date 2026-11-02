import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { TransferList, type TransferOption } from '@/components/ui/transfer-list'

const columns: TransferOption[] = [
  { value: 'name', label: 'Name', description: 'Always shown', disabled: true },
  { value: 'email', label: 'Email' },
  { value: 'role', label: 'Role' },
  { value: 'team', label: 'Team' },
  { value: 'created', label: 'Created' },
  { value: 'last-seen', label: 'Last seen' },
  { value: 'plan', label: 'Plan' },
  { value: 'mrr', label: 'Monthly revenue' },
]

const meta = {
  title: 'Components/Forms/Transfer list',
  component: TransferList,
  tags: ['autodocs'],
  args: { options: columns },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Two lists, Available and Selected. The consumer provides `options` (`{ value, label, description?, disabled? }`), `value` + `onValueChange` (the selected values) and a name (`aria-labelledby`); optionally `availableLabel` / `selectedLabel`.',
      },
    },
  },
} satisfies Meta<typeof TransferList>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [shown, setShown] = React.useState(['name', 'email', 'plan'])
    return (
      <Field className="max-w-2xl">
        <FieldLabel id="tl-label">Table columns</FieldLabel>
        <TransferList
          aria-labelledby="tl-label"
          options={columns}
          value={shown}
          onValueChange={setShown}
          availableLabel="Hidden"
          selectedLabel="Shown"
        />
        <FieldDescription>Shown: {shown.join(', ')}</FieldDescription>
      </Field>
    )
  },
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <Field className="max-w-2xl">
      <FieldLabel id="tl-fr">Permissions du rôle</FieldLabel>
      <TransferList
        aria-labelledby="tl-fr"
        defaultValue={['read']}
        options={[
          { value: 'read', label: 'Lire' },
          { value: 'write', label: 'Écrire' },
          { value: 'delete', label: 'Supprimer' },
          { value: 'admin', label: 'Administrer' },
        ]}
      />
    </Field>
  ),
}
