import type { Meta, StoryObj } from '@storybook/react-vite'
import { CircleDotIcon, UserIcon } from 'lucide-react'
import * as React from 'react'

import { ChipGroup } from '@/components/ui/chip-group'

const meta = {
  title: 'Components/Forms/Chip group',
  component: ChipGroup,
  tags: ['autodocs'],
  args: {
    options: [
      { value: 'open', label: 'Open' },
      { value: 'mine', label: 'Mine' },
    ],
    'aria-label': 'Filters',
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Pills that toggle on and off. The consumer provides `options` (`{ value, label, icon?, count?, disabled? }`), `value` + `onValueChange` (a string[] by default, a string with `type="single"`) and a name (`aria-label` or `aria-labelledby`).',
      },
    },
  },
} satisfies Meta<typeof ChipGroup>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [filters, setFilters] = React.useState(['open'])
    return (
      <div className="flex flex-col gap-3">
        <ChipGroup
          aria-label="Filters"
          value={filters}
          onValueChange={setFilters}
          options={[
            { value: 'open', label: 'Open', icon: <CircleDotIcon />, count: 24 },
            { value: 'mine', label: 'Assigned to me', icon: <UserIcon />, count: 7 },
            { value: 'week', label: 'This week', count: 12 },
            { value: 'archived', label: 'Archived', disabled: true },
          ]}
        />
        <p className="m-0 text-[13px] text-muted-foreground">
          Filters: {filters.join(', ') || 'none'}
        </p>
      </div>
    )
  },
}

export const Single: Story = {
  render: () => (
    <ChipGroup
      type="single"
      size="sm"
      aria-label="Size"
      defaultValue="m"
      options={['xs', 's', 'm', 'l', 'xl'].map((s) => ({ value: s, label: s.toUpperCase() }))}
    />
  ),
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <ChipGroup
      aria-label="Centres d’intérêt"
      defaultValue={['design']}
      options={[
        { value: 'design', label: 'Design' },
        { value: 'dev', label: 'Développement' },
        { value: 'data', label: 'Données' },
      ]}
    />
  ),
}
