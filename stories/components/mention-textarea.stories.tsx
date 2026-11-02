import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { type MentionOption, mentionsIn, MentionTextarea } from '@/components/ui/mention-textarea'

const people: MentionOption[] = [
  ['ada', 'Ada Lovelace', 'Engineering'],
  ['alan', 'Alan Turing', 'Research'],
  ['grace', 'Grace Hopper', 'Platform'],
  ['katherine', 'Katherine Johnson', 'Data'],
  ['margaret', 'Margaret Hamilton', 'Reliability'],
].map(([value = '', label = '', description]) => ({
  value,
  label,
  description,
  icon: (
    <Avatar className="size-6">
      <AvatarFallback className="text-[10px]">{label.slice(0, 2)}</AvatarFallback>
    </Avatar>
  ),
}))

const meta = {
  title: 'Components/Forms/Mention textarea',
  component: MentionTextarea,
  tags: ['autodocs'],
  args: { options: people },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A textarea where "@" suggests people. The consumer provides `options` (`{ value, label, description?, icon? }`), `value` + `onValueChange` (plain text) and a label (`id` for a FieldLabel); `trigger` changes the character. `mentionsIn(text, options)` lists who was mentioned.',
      },
    },
  },
} satisfies Meta<typeof MentionTextarea>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [text, setText] = React.useState('Looks good to me. @gr')
    const mentioned = mentionsIn(text, people)
    return (
      <Field className="max-w-lg">
        <FieldLabel htmlFor="mt-comment">Comment</FieldLabel>
        <MentionTextarea id="mt-comment" options={people} value={text} onValueChange={setText} />
        <FieldDescription>
          Notifies: {mentioned.length ? mentioned.join(', ') : 'nobody yet'}
        </FieldDescription>
      </Field>
    )
  },
}

export const Open: Story = {
  name: 'Suggestions open',
  render: () => (
    <Field className="max-w-lg pb-64">
      <FieldLabel htmlFor="mt-open">Task description</FieldLabel>
      <MentionTextarea id="mt-open" options={people} defaultValue="Pair with @a" />
    </Field>
  ),
  play: ({ canvasElement }) => {
    const area = canvasElement.querySelector<HTMLTextAreaElement>('#mt-open')
    if (!area) return
    area.focus()
    area.setSelectionRange(area.value.length, area.value.length)
    area.click()
  },
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <Field className="max-w-lg">
      <FieldLabel htmlFor="mt-fr">Commentaire</FieldLabel>
      <MentionTextarea id="mt-fr" options={people} defaultValue="Merci @ada !" />
    </Field>
  ),
}
