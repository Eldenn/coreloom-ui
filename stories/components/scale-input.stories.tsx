import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { ScaleInput } from '@/components/ui/scale-input'

const meta = {
  title: 'Components/Forms/Scale input',
  component: ScaleInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A survey scale. The consumer provides `min` and `max` (1–5 by default), `value` + `onValueChange` (a number, null before an answer), a name (`aria-labelledby`), and `minLabel` / `maxLabel` for the ends or `labels` for a worded Likert scale.',
      },
    },
  },
} satisfies Meta<typeof ScaleInput>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'NPS',
  render: () => {
    const [score, setScore] = React.useState<number | null>(null)
    return (
      <Field className="max-w-xl">
        <FieldLabel id="nps-label">
          How likely are you to recommend Coreloom to a colleague?
        </FieldLabel>
        <ScaleInput
          aria-labelledby="nps-label"
          min={0}
          max={10}
          value={score}
          onValueChange={setScore}
          minLabel="Not at all likely"
          maxLabel="Extremely likely"
        />
        <FieldDescription>Score: {score ?? 'no answer yet'}</FieldDescription>
      </Field>
    )
  },
}

export const Likert: Story = {
  render: () => (
    <FieldGroup className="max-w-2xl">
      <Field>
        <FieldLabel id="lk-label">The documentation answered my questions.</FieldLabel>
        <ScaleInput
          aria-labelledby="lk-label"
          defaultValue={4}
          labels={['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree']}
        />
      </Field>
      <Field data-invalid>
        <FieldLabel id="lk-inv">Setup was easy.</FieldLabel>
        <ScaleInput aria-labelledby="lk-inv" aria-invalid minLabel="Hard" maxLabel="Easy" />
      </Field>
    </FieldGroup>
  ),
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <Field className="max-w-xl">
      <FieldLabel id="fr-nps">Recommanderiez-vous Coreloom ?</FieldLabel>
      <ScaleInput
        aria-labelledby="fr-nps"
        min={0}
        max={10}
        defaultValue={9}
        minLabel="Pas du tout"
        maxLabel="Tout à fait"
      />
    </Field>
  ),
}
