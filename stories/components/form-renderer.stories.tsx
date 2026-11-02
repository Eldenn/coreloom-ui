import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { FormRenderer, type FormValues, fromJSONSchema } from '@/components/ui/form-renderer'

import { demoSchema, demoSpec, demoUiSchema, moreFieldsSpec } from '../blocks/form-data'

const meta = {
  title: 'Components/Forms/Form renderer',
  component: FormRenderer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Builds a form at runtime from a FormSpec: sections, fields, checks and conditions as JSON. Each field type is one of the Form fields; `onSubmit` gets the visible fields’ values as JSON. Read a spec from elsewhere with `readFormSpec`, or turn a JSON Schema into one with `fromJSONSchema`.',
      },
    },
  },
  args: { spec: demoSpec },
  decorators: [(Story) => <div className="max-w-3xl">{Story()}</div>],
} satisfies Meta<typeof FormRenderer>
export default meta
type Story = StoryObj<typeof meta>

function WithValues(args: React.ComponentProps<typeof FormRenderer>) {
  const [values, setValues] = React.useState<FormValues | null>(null)
  return (
    <div className="flex flex-col gap-6">
      <FormRenderer {...args} onSubmit={setValues} />
      {values && (
        <pre
          aria-label="Submitted values"
          className="overflow-x-auto rounded-lg bg-inset p-3 font-mono text-[12px]"
        >
          {JSON.stringify(values, null, 2)}
        </pre>
      )}
    </div>
  )
}

/** Sections in columns, a condition (Company and Seats show for “A company”), checks on Submit. */
export const Default: Story = { render: (args) => <WithValues {...args} /> }

/** The same renderer fed a JSON Schema and a UI schema, through `fromJSONSchema`. */
export const FromJSONSchema: Story = {
  args: { spec: fromJSONSchema(demoSchema, demoUiSchema).spec },
  render: (args) => <WithValues {...args} />,
}

/** Starting values (as JSON) over the spec's defaults. */
export const Prefilled: Story = {
  args: {
    defaultValues: {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      kind: 'company',
      company: 'Analytical Engines',
      seats: 12,
      start: '2026-12-01',
      topics: ['forms', 'ai'],
    },
  },
  render: (args) => <WithValues {...args} />,
}

/** One field of each newer type: masked, color, unit, duration, month, week, time range, time zone, number range, slider, segmented, checkboxes, choice cards, chips, tree select, ranking, transfer, rating, scale, recurrence, image, key-value, mentions and JSON. */
export const MoreFields: Story = {
  args: { spec: moreFieldsSpec },
  render: (args) => <WithValues {...args} />,
}
