import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { EditableText } from '@/components/ui/editable-text'

const meta = {
  title: 'Components/Forms/Editable text',
  component: EditableText,
  tags: ['autodocs'],
  args: { label: 'project name', defaultValue: 'Acme launch' },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Text that becomes a field when clicked. Enter or leaving the field saves, Escape restores. The consumer provides `value` + `onValueChange` (called once per saved edit) and a `label` saying what the text is.',
      },
    },
  },
} satisfies Meta<typeof EditableText>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [name, setName] = React.useState('Acme launch')
    const [saves, setSaves] = React.useState(0)
    return (
      <div className="flex max-w-md flex-col gap-3">
        <h2 className="m-0 font-display text-[22px] font-semibold">
          <EditableText
            label="project name"
            value={name}
            required
            maxLength={60}
            onValueChange={(v) => {
              setName(v)
              setSaves((n) => n + 1)
            }}
          />
        </h2>
        <p className="m-0 text-[13px] text-muted-foreground">
          Saved {saves} times · value: {name}
        </p>
      </div>
    )
  },
}

export const InText: Story = {
  name: 'In body text, empty and disabled',
  render: () => (
    <dl className="m-0 grid max-w-md grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-[14px]">
      <dt className="text-muted-foreground">Owner</dt>
      <dd className="m-0">
        <EditableText label="owner" defaultValue="Matthieu Chane" />
      </dd>
      <dt className="text-muted-foreground">Nickname</dt>
      <dd className="m-0">
        <EditableText label="nickname" placeholder="Add a nickname" />
      </dd>
      <dt className="text-muted-foreground">Workspace ID</dt>
      <dd className="m-0">
        <EditableText label="workspace ID" defaultValue="ws_2f81c0" disabled />
      </dd>
    </dl>
  ),
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => <EditableText label="nom du projet" defaultValue="Lancement Acme" />,
}
