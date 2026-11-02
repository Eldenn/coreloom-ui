import type { Meta, StoryObj } from '@storybook/react-vite'
import { GaugeIcon, LockIcon, PaletteIcon, PlugIcon } from 'lucide-react'
import * as React from 'react'

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { SortableList, type SortableOption } from '@/components/ui/sortable-list'

const priorities: SortableOption[] = [
  {
    value: 'speed',
    label: 'Speed',
    description: 'Pages load in under a second',
    icon: <GaugeIcon className="size-4 text-muted-foreground" />,
  },
  {
    value: 'security',
    label: 'Security',
    description: 'SSO and audit logs',
    icon: <LockIcon className="size-4 text-muted-foreground" />,
  },
  {
    value: 'design',
    label: 'Design',
    description: 'A polished interface',
    icon: <PaletteIcon className="size-4 text-muted-foreground" />,
  },
  {
    value: 'integrations',
    label: 'Integrations',
    description: 'Slack, GitHub, Linear',
    icon: <PlugIcon className="size-4 text-muted-foreground" />,
  },
]

const meta = {
  title: 'Components/Forms/Sortable list',
  component: SortableList,
  tags: ['autodocs'],
  args: { options: priorities },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Items to put in order. The consumer provides `options` (`{ value, label, description?, icon? }`), `value` + `onValueChange` (the values in order) and a name (`aria-labelledby`). Drag by the handle, with Space and arrows on it, or with the up and down buttons.',
      },
    },
  },
} satisfies Meta<typeof SortableList>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [order, setOrder] = React.useState(priorities.map((p) => p.value))
    return (
      <Field className="max-w-md">
        <FieldLabel id="sl-label">Rank what matters most to you</FieldLabel>
        <SortableList
          aria-labelledby="sl-label"
          options={priorities}
          value={order}
          onValueChange={setOrder}
        />
        <FieldDescription>Order: {order.join(', ')}</FieldDescription>
      </Field>
    )
  },
}

export const Plain: Story = {
  render: () => (
    <Field className="max-w-sm">
      <FieldLabel id="sl-plain">Export columns</FieldLabel>
      <SortableList
        aria-labelledby="sl-plain"
        numbered={false}
        options={['Name', 'Email', 'Plan', 'Created'].map((c) => ({
          value: c.toLowerCase(),
          label: c,
        }))}
      />
    </Field>
  ),
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <Field className="max-w-sm">
      <FieldLabel id="sl-fr">Étapes</FieldLabel>
      <SortableList
        aria-labelledby="sl-fr"
        options={[
          { value: 'brief', label: 'Brief' },
          { value: 'maquette', label: 'Maquette' },
          { value: 'dev', label: 'Développement' },
        ]}
      />
    </Field>
  ),
}
