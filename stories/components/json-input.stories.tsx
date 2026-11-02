import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { JsonInput } from '@/components/ui/json-input'

const meta = {
  title: 'Components/Forms/JSON input',
  component: JsonInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A code field for JSON. The consumer provides `value` + `onValueChange(text, parsed)` and a label (`id` for a FieldLabel), and optionally `rows`, `indent`, `formatOnBlur` and `readOnly`. It says where invalid JSON breaks; Format re-indents it.',
      },
    },
  },
} satisfies Meta<typeof JsonInput>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [keys, setKeys] = React.useState('3 keys')
    return (
      <Field className="max-w-xl">
        <FieldLabel htmlFor="json-payload">Webhook payload</FieldLabel>
        <JsonInput
          id="json-payload"
          defaultValue={'{"event":"invoice.paid","amount":4200,"currency":"EUR"}'}
          onValueChange={(_, parsed) => {
            setKeys(
              parsed && typeof parsed === 'object'
                ? `${String(Object.keys(parsed).length)} keys`
                : 'not an object',
            )
          }}
        />
        <FieldDescription>Sent with every test event · {keys}</FieldDescription>
      </Field>
    )
  },
}

export const Invalid: Story = {
  render: () => (
    <Field className="max-w-xl">
      <FieldLabel htmlFor="json-bad">Settings</FieldLabel>
      <JsonInput id="json-bad" rows={5} defaultValue={'{\n  "retries": 3,\n  "timeout": 30,\n}'} />
    </Field>
  ),
  play: ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('button')?.click()
  },
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <Field className="max-w-xl">
      <FieldLabel htmlFor="json-fr">Paramètres</FieldLabel>
      <JsonInput id="json-fr" rows={4} defaultValue={'{ "langue": "fr" }'} />
    </Field>
  ),
}
