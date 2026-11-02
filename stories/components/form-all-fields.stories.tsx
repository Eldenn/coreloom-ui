import type { Meta, StoryObj } from '@storybook/react-vite'
import { BikeIcon, RocketIcon } from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'

import { FieldGroup } from '@/components/ui/field'
import { useAppForm } from '@/components/ui/form'
import type { KeyValuePair } from '@/components/ui/key-value-editor'
import { toast } from '@/components/ui/sonner'

const schema = z.object({
  plan: z.string().min(1, 'Pick a plan.'),
  billing: z.string(),
  features: z.array(z.string()).min(1, 'Pick at least one feature.'),
  iban: z.string().length(27, 'Enter the full IBAN.'),
  color: z.string(),
  rating: z.number().min(1, 'Give a score.'),
  volume: z.number(),
  size: z.object({ value: z.number().nullable(), unit: z.string() }),
  estimate: z.number({ error: 'Enter a duration.' }),
  month: z.string().min(1, 'Pick a month.'),
  week: z.string().min(1, 'Pick a week.'),
  headers: z.array(z.object({ key: z.string(), value: z.string() })),
})

function AllFieldsForm({ submitOnMount = false }: { submitOnMount?: boolean }) {
  const form = useAppForm({
    defaultValues: {
      plan: '',
      billing: 'monthly',
      features: [] as string[],
      iban: '',
      color: '#3b82f6',
      rating: 0,
      volume: 40,
      size: { value: null as number | null, unit: 'px' },
      estimate: null as number | null,
      month: '',
      week: '',
      headers: [{ key: 'Accept', value: 'application/json' }] as KeyValuePair[],
    },
    validators: { onChange: schema as never },
    onSubmit: async ({ value }) => {
      await new Promise((r) => setTimeout(r, 400))
      toast.success(`Saved the ${value.plan} plan`)
    },
  })
  React.useEffect(() => {
    if (submitOnMount) void form.handleSubmit()
  }, [form, submitOnMount])

  return (
    <form
      noValidate
      className="max-w-lg"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldGroup>
        <form.AppField name="plan">
          {(field) => (
            <field.RadioCardField
              label="Plan"
              orientation="horizontal"
              options={[
                { value: 'starter', title: 'Starter', description: 'Free', icon: <BikeIcon /> },
                { value: 'team', title: 'Team', description: '€12 / seat', icon: <RocketIcon /> },
              ]}
            />
          )}
        </form.AppField>
        <form.AppField name="billing">
          {(field) => (
            <field.SegmentedField
              label="Billing"
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
            />
          )}
        </form.AppField>
        <form.AppField name="features">
          {(field) => (
            <field.CheckboxGroupField
              label="Features"
              options={[
                { value: 'sso', label: 'Single sign-on' },
                { value: 'audit', label: 'Audit logs' },
              ]}
            />
          )}
        </form.AppField>
        <form.AppField name="iban">
          {(field) => <field.MaskedField label="IBAN" preset="iban" />}
        </form.AppField>
        <form.AppField name="color">
          {(field) => <field.ColorField label="Workspace colour" />}
        </form.AppField>
        <form.AppField name="rating">
          {(field) => <field.RatingField label="How was setup?" />}
        </form.AppField>
        <form.AppField name="volume">
          {(field) => <field.SliderField label="Volume" />}
        </form.AppField>
        <form.AppField name="size">
          {(field) => (
            <field.UnitField label="Base size" units={[{ value: 'px' }, { value: 'rem' }]} />
          )}
        </form.AppField>
        <form.AppField name="estimate">
          {(field) => <field.DurationField label="Estimate" />}
        </form.AppField>
        <form.AppField name="month">
          {(field) => <field.MonthField label="Start month" />}
        </form.AppField>
        <form.AppField name="week">
          {(field) => <field.WeekField label="Sprint week" />}
        </form.AppField>
        <form.AppField name="headers">
          {(field) => <field.KeyValueField label="Headers" />}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton>Save</form.SubmitButton>
        </form.AppForm>
      </FieldGroup>
    </form>
  )
}

const meta = {
  title: 'Components/Forms/Form fields: cards, masks, units, periods',
  component: AllFieldsForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`RadioCardField`, `SegmentedField`, `CheckboxGroupField` (string[]), `MaskedField` (raw characters), `ColorField` ("#rrggbb"), `RatingField` (number), `SliderField` (number), `UnitField` (`{ value, unit }`), `DurationField` (minutes), `MonthField` ("YYYY-MM"), `WeekField` ("YYYY-Www") and `KeyValueField` (`{ key, value }[]`) on `useAppForm`.',
      },
    },
  },
} satisfies Meta<typeof AllFieldsForm>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Submitted empty: each field shows its error. */
export const WithErrors: Story = { args: { submitOnMount: true } }
