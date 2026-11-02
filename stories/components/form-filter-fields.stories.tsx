import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'
import { z } from 'zod'

import { FieldGroup } from '@/components/ui/field'
import { useAppForm } from '@/components/ui/form'
import { parseJson } from '@/components/ui/json-input'
import type { NumberRange, TimeRange } from '@/components/ui/range-inputs'
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
  logo: z.custom<File | string | null>((v) => v !== null, 'Add a logo.'),
  ranking: z.array(z.string()),
  standup: z.object({ frequency: z.string() }).loose(),
  zone: z.string().min(1, 'Pick a time zone.'),
})

const emptyBudget: NumberRange = { min: null, max: null }
const noHours: TimeRange = {}

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
      budget: emptyBudget,
      hours: noHours,
      config: '{\n  "retries": 3\n}',
      note: '',
      team: '',
      columns: ['name'] as string[],
      logo: null as File | string | null,
      ranking: ['speed', 'price', 'support'],
      standup: {
        frequency: 'day',
        interval: 1,
        end: { type: 'never' },
      },
      zone: '',
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
          {(field) => <field.NumberRangeField label="Budget" />}
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
        <form.AppField name="logo">
          {(field) => <field.ImageField label="Logo" shape="square" />}
        </form.AppField>
        <form.AppField name="ranking">
          {(field) => (
            <field.SortableField
              label="Rank by importance"
              options={[
                { value: 'speed', label: 'Speed' },
                { value: 'price', label: 'Price' },
                { value: 'support', label: 'Support' },
              ]}
            />
          )}
        </form.AppField>
        <form.AppField name="standup">
          {(field) => <field.RecurrenceField label="Stand-up" />}
        </form.AppField>
        <form.AppField name="zone">
          {(field) => <field.TimezoneField label="Time zone" />}
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
          '`ChipField` (string[] or string), `ScaleField` (number or null), `NumberRangeField` (`{ min, max }`), `TimeRangeField` (`{ start, end }`), `JsonField` (text), `MentionField` (text), `TreeSelectField` (string or string[]), `TransferField` (string[]), `ImageField` (File, URL or null), `SortableField` (string[] in order), `RecurrenceField` (`Recurrence`) and `TimezoneField` (IANA name) on `useAppForm`.',
      },
    },
  },
} satisfies Meta<typeof FilterFieldsForm>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Submitted empty: each field shows its error. */
export const WithErrors: Story = { args: { submitOnMount: true } }
