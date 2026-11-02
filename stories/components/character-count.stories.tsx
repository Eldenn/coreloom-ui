import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { CharacterCount } from '@/components/ui/character-count'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const meta = {
  title: 'Components/Forms/Character count',
  component: CharacterCount,
  tags: ['autodocs'],
  args: { value: 'Shipping the new billing page today.', max: 80 },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A "120/280" counter under a text field. The consumer passes the text and `max`, gives it an `id` and adds that id to the field’s `aria-describedby`. In a form, use `maxCount` on `TextField` / `TextareaField`.',
      },
    },
  },
} satisfies Meta<typeof CharacterCount>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [text, setText] = React.useState('Shipping the new billing page today.')
    return (
      <Field className="max-w-md">
        <FieldLabel htmlFor="cc-status">Status</FieldLabel>
        <Textarea
          id="cc-status"
          value={text}
          aria-describedby="cc-status-count"
          onChange={(e) => {
            setText(e.target.value)
          }}
        />
        <CharacterCount id="cc-status-count" value={text} max={80} />
      </Field>
    )
  },
}

export const States: Story = {
  render: () => (
    <FieldGroup className="max-w-md">
      <Field>
        <FieldLabel htmlFor="cc-near">Near the limit</FieldLabel>
        <Input
          id="cc-near"
          defaultValue="A title that is getting rather long"
          aria-describedby="cc-near-count"
        />
        <CharacterCount id="cc-near-count" value="A title that is getting rather long" max={40} />
      </Field>
      <Field data-invalid="true">
        <FieldLabel htmlFor="cc-over">Over the limit</FieldLabel>
        <Input
          id="cc-over"
          defaultValue="This title is definitely longer than allowed"
          aria-invalid
          aria-describedby="cc-over-count"
        />
        <CharacterCount
          id="cc-over-count"
          value="This title is definitely longer than allowed"
          max={40}
        />
      </Field>
    </FieldGroup>
  ),
}
