import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { type TreeNode, TreeSelect } from '@/components/ui/tree-select'

const org: TreeNode[] = [
  {
    value: 'eng',
    label: 'Engineering',
    children: [
      { value: 'fe', label: 'Frontend', children: [{ value: 'ds', label: 'Design system' }] },
      { value: 'be', label: 'Backend' },
      { value: 'sre', label: 'Reliability', disabled: true },
    ],
  },
  {
    value: 'product',
    label: 'Product',
    children: [
      { value: 'pm', label: 'Product management' },
      { value: 'design', label: 'Design' },
    ],
  },
  { value: 'sales', label: 'Sales' },
]

const meta = {
  title: 'Components/Forms/Tree select',
  component: TreeSelect,
  tags: ['autodocs'],
  args: { nodes: org },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A select whose options nest. The consumer provides `nodes` (`{ value, label, children?, disabled? }`), `value` + `onValueChange` (a string, or a string[] with `multiple`) and a label (`id` for a FieldLabel). Any node can be picked.',
      },
    },
  },
} satisfies Meta<typeof TreeSelect>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [team, setTeam] = React.useState('ds')
    const [teams, setTeams] = React.useState(['be', 'design'])
    return (
      <FieldGroup className="max-w-sm">
        <Field>
          <FieldLabel htmlFor="ts-team">Team</FieldLabel>
          <TreeSelect id="ts-team" nodes={org} value={team} onValueChange={setTeam} />
          <FieldDescription>Value: {team || '—'}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="ts-teams">Visible to</FieldLabel>
          <TreeSelect id="ts-teams" nodes={org} multiple value={teams} onValueChange={setTeams} />
          <FieldDescription>Values: {teams.join(', ') || '—'}</FieldDescription>
        </Field>
      </FieldGroup>
    )
  },
}

export const Open: Story = {
  render: () => (
    <Field className="max-w-sm pb-72">
      <FieldLabel htmlFor="ts-open">Team</FieldLabel>
      <TreeSelect id="ts-open" nodes={org} defaultValue="fe" />
    </Field>
  ),
  play: ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('#ts-open')?.click()
  },
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="ts-fr">Équipes</FieldLabel>
      <TreeSelect id="ts-fr" nodes={org} multiple defaultValue={['fe', 'be']} />
    </Field>
  ),
}
