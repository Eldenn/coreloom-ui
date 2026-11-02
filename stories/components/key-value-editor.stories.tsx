import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { KeyValueEditor, type KeyValuePair } from '@/components/ui/key-value-editor'

const meta = {
  title: 'Components/Forms/Key-value editor',
  component: KeyValueEditor,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Rows of key and value. The consumer provides `value` + `onValueChange` (an array of `{ key, value }`) and a name (`aria-labelledby` pointing at its label); optionally column titles, placeholders, `maxRows` and `sensitive` for secrets. Pasting "KEY=value" lines into a key field fills several rows.',
      },
    },
  },
} satisfies Meta<typeof KeyValueEditor>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [headers, setHeaders] = React.useState<KeyValuePair[]>([
      { key: 'Content-Type', value: 'application/json' },
      { key: 'X-Request-Id', value: '7f3a9c' },
    ])
    return (
      <Field className="max-w-xl">
        <FieldLabel id="kv-label">Request headers</FieldLabel>
        <KeyValueEditor
          aria-labelledby="kv-label"
          value={headers}
          onValueChange={setHeaders}
          keyPlaceholder="Header"
          valuePlaceholder="Value"
        />
        <FieldDescription>
          {headers.filter((h) => h.key).length} headers · paste "Name: value" lines to add many.
        </FieldDescription>
      </Field>
    )
  },
}

export const Secrets: Story = {
  render: () => (
    <Field className="max-w-xl">
      <FieldLabel id="kv-env">Environment variables</FieldLabel>
      <KeyValueEditor
        aria-labelledby="kv-env"
        sensitive
        maxRows={4}
        defaultValue={[
          { key: 'API_KEY', value: 'sk-live-123' },
          { key: 'REGION', value: 'eu-west-3' },
          { key: 'api_key', value: 'duplicate' },
        ]}
      />
    </Field>
  ),
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <Field className="max-w-xl">
      <FieldLabel id="kv-fr">Métadonnées</FieldLabel>
      <KeyValueEditor aria-labelledby="kv-fr" defaultValue={[{ key: 'client', value: 'Acme' }]} />
    </Field>
  ),
}
