import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'
import { z } from 'zod'

import { FieldGroup } from '@/components/ui/field'
import { useAppForm } from '@/components/ui/form'
import { parseJson } from '@/components/ui/json-input'
import { toast } from '@/components/ui/sonner'

const schema = z.object({
  topics: z.array(z.string()).min(1, 'Pick at least one topic.'),
  nps: z.number({ error: 'Pick a score.' }),
  budget: z
    .object({ min: z.number().nullable(), max: z.number().nullable() })
    .refine((r) => r.min === null || r.max === null || r.min <= r.max, 'Check the range.'),
  hours: z
    .object({ start: z.string().optional(), end: z.string().optional() })
    .refine((r) => r.start !== undefined && r.end !== undefined, 'Enter both times.'),
  config: z.string().refine((s) => parseJson(s).ok, 'Enter valid JSON.'),
  note: z.string().min(1, 'Write a note.'),
  team: z.string().min(1, 'Pick a team.'),
  columns: z.array(z.string()).min(1, 'Show at least one column.'),
})

const people = [
  { value: 'ada', label: 'Ada Lovelace' },
  { value: 'alan', label: 'Alan Turing' },
  { value: 'grace', label: 'Grace Hopper' },
]

function FilterFieldsForm({ submitOnMount = false }: { submitOnMount?: boolean }) {
  const form = useAppForm({
    defaultValues: {
      topics: [] as string[],
      nps: null as number | null,
      budget: { min: null, max: null },
      hours: {},
      config: '{\n  "retries": 3\n}',
      note: '',
      team: '',
      columns: ['name'] as string[],
    },
    validators: { onChange: schema as never },
    onSubmit: async () => {
      await new Promise((r) => setTimeout(r, 400))
      toast.success('Saved')
    },
  })
  React.useEffect(() => {
    if (submitOnMount) void form.handleSubmit()
  }, [form, submitOnMount])

  return (
    <form
      noValidate
      className="max-w-xl"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldGroup>
        <form.AppField name="topics">
          {(field) => (
            <field.ChipField
              label="Topics"
              options={[
                { value: 'billing', label: 'Billing' },
                { value: 'api', label: 'API' },
                { value: 'security', label: 'Security' },
              ]}
            />
          )}
        </form.AppField>
        <form.AppField name="nps">
          {(field) => (
            <field.ScaleField
              label="How likely are you to recommend us?"
              min={0}
              max={10}
              minLabel="Not at all likely"
              maxLabel="Extremely likely"
            />
          )}
        </form.AppField>
        <form.AppField name="budget">
          {(field) => (
            <field.NumberRangeField
              label="Budget"
              formatOptions={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }}
            />
          )}
        </form.AppField>
        <form.AppField name="hours">
          {(field) => <field.TimeRangeField label="Opening hours" />}
        </form.AppField>
        <form.AppField name="config">
          {(field) => <field.JsonField label="Settings" rows={4} />}
        </form.AppField>
        <form.AppField name="note">
          {(field) => <field.MentionField label="Note" options={people} rows={3} />}
        </form.AppField>
        <form.AppField name="team">
          {(field) => (
            <field.TreeSelectField
              label="Team"
              nodes={[
                {
                  value: 'eng',
                  label: 'Engineering',
                  children: [
                    { value: 'frontend', label: 'Frontend' },
                    { value: 'backend', label: 'Backend' },
                  ],
                },
                { value: 'design', label: 'Design' },
              ]}
            />
          )}
        </form.AppField>
        <form.AppField name="columns">
          {(field) => (
            <field.TransferField
              label="Columns"
              options={[
                { value: 'name', label: 'Name' },
                { value: 'email', label: 'Email' },
                { value: 'role', label: 'Role' },
                { value: 'team', label: 'Team' },
              ]}
            />
          )}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton>Save</form.SubmitButton>
        </form.AppForm>
      </FieldGroup>
    </form>
  )
}

const meta = {
  title: 'Components/Forms/Form fields: chips, scales, ranges, JSON, trees',
  component: FilterFieldsForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`ChipField` (string[] or string), `ScaleField` (number or null), `NumberRangeField` (`{ min, max }`), `TimeRangeField` (`{ start, end }`), `JsonField` (text), `MentionField` (text), `TreeSelectField` (string or string[]) and `TransferField` (string[]) on `useAppForm`.',
      },
    },
  },
} satisfies Meta<typeof FilterFieldsForm>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Submitted empty: each field shows its error. */
export const WithErrors: Story = { args: { submitOnMount: true } }
