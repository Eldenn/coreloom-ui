import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Rating } from '@/components/ui/rating'

const meta = {
  title: 'Components/Forms/Rating',
  component: Rating,
  tags: ['autodocs'],
  args: { defaultValue: 3, max: 5, size: 'default', 'aria-label': 'Your rating' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    readOnly: { control: 'boolean' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Stars to give a score or show one. The consumer provides `value` + `onValueChange` (0 means no score) and a name for the group (`aria-label` or `aria-labelledby`). `readOnly` shows a score, halves included.',
      },
    },
  },
} satisfies Meta<typeof Rating>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [score, setScore] = React.useState(4)
    return (
      <Field>
        <FieldLabel id="rt-label">How was the onboarding?</FieldLabel>
        <Rating aria-labelledby="rt-label" value={score} onValueChange={setScore} size="lg" />
        <FieldDescription>
          Score: {score || 'none'} · click the picked star to clear.
        </FieldDescription>
      </Field>
    )
  },
}

export const ReadOnly: Story = {
  name: 'Read-only',
  render: () => (
    <div className="flex flex-col gap-3 text-[13px]">
      <div className="flex items-center gap-2">
        <Rating readOnly value={4.5} size="sm" />
        <span className="text-muted-foreground">4.5 · 1,284 reviews</span>
      </div>
      <Rating readOnly value={3} />
      <Rating readOnly value={0} max={10} size="sm" />
    </div>
  ),
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => <Rating aria-label="Votre note" defaultValue={2} />,
}
