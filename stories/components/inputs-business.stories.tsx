import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { z } from "zod"

import { DatePicker } from "@/components/ui/date-picker"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useAppForm } from "@/components/ui/form"
import { MoneyInput } from "@/components/ui/money-input"
import { MultiSelect } from "@/components/ui/multi-select"
import { PhoneInput, isValidPhone } from "@/components/ui/phone-input"
import { toast } from "@/components/ui/sonner"

const regions = [
  { value: "cdg1", label: "Paris (cdg1)" },
  { value: "fra1", label: "Frankfurt (fra1)" },
  { value: "lhr1", label: "London (lhr1)" },
  { value: "iad1", label: "Washington (iad1)" },
  { value: "sfo1", label: "San Francisco (sfo1)" },
  { value: "hnd1", label: "Tokyo (hnd1)" },
]

const meta = {
  title: "Components/Forms/Multi-select, money, phone, typed dates",
  component: MultiSelect,
  tags: ["autodocs"],
  args: { options: regions },
} satisfies Meta<typeof MultiSelect>
export default meta
type Story = StoryObj<typeof meta>

export const MultiSelectStory: Story = {
  name: "MultiSelect",
  render: () => {
    const [value, setValue] = React.useState(["cdg1", "fra1", "lhr1", "iad1"])
    return (
      <Field className="max-w-sm">
        <FieldLabel htmlFor="regions">Regions</FieldLabel>
        <MultiSelect id="regions" options={regions} value={value} onValueChange={setValue} />
        <FieldDescription>Deploys go to every region you pick.</FieldDescription>
      </Field>
    )
  },
}

export const MoneyInputStory: Story = {
  name: "MoneyInput",
  render: () => {
    const [eur, setEur] = React.useState<number | null>(1234.5)
    const [usd, setUsd] = React.useState<number | null>(980)
    return (
      <FieldGroup className="max-w-xs gap-5">
        <Field>
          <FieldLabel htmlFor="budget">Monthly budget</FieldLabel>
          <MoneyInput id="budget" value={eur} onValueChange={setEur} min={0} />
          <FieldDescription>Value: {eur === null ? "empty" : eur}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="usd">Invoice total</FieldLabel>
          <MoneyInput id="usd" currency="USD" value={usd} onValueChange={setUsd} />
        </Field>
      </FieldGroup>
    )
  },
}

export const PhoneInputStory: Story = {
  name: "PhoneInput",
  render: () => {
    const [value, setValue] = React.useState("+33612345678")
    return (
      <Field className="max-w-sm">
        <FieldLabel htmlFor="phone">Mobile</FieldLabel>
        <PhoneInput id="phone" value={value} onValueChange={setValue} />
        <FieldDescription>
          Sent as <code className="font-mono">{value || "—"}</code> · {isValidPhone(value) ? "valid" : "incomplete"}
        </FieldDescription>
      </Field>
    )
  },
}

export const TypedDate: Story = {
  name: "DatePicker (typing)",
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 10, 3))
    return (
      <Field className="max-w-xs">
        <FieldLabel htmlFor="due">Due date</FieldLabel>
        <DatePicker id="due" typing value={date} onValueChange={setDate} />
        <FieldDescription>Type it or pick it. Value: {date ? date.toDateString() : "none"}</FieldDescription>
      </Field>
    )
  },
}

const schema = z.object({
  regions: z.array(z.string()).min(1, "Pick at least one region."),
  budget: z.number({ error: "Enter a budget." }).min(10, "The minimum is €10."),
  phone: z.string().refine(isValidPhone, "Enter a complete phone number."),
  start: z.date({ error: "Enter a start date." }),
})

/** Submit empty to see each field's error; every value is typed, not a string. */
export const InAForm: Story = {
  name: "In a form (TanStack)",
  render: () => {
    const form = useAppForm({
      defaultValues: { regions: [] as string[], budget: null as number | null, phone: "", start: undefined as Date | undefined },
      validators: { onChange: schema as never },
      onSubmit: async ({ value }) => {
        await new Promise((r) => setTimeout(r, 500))
        toast.success(`Saved: ${value.regions.length} regions, ${value.budget} €, ${value.phone}`)
      },
    })
    return (
      <form
        noValidate
        className="max-w-md"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <FieldGroup className="gap-5">
          <form.AppField name="regions">{(field) => <field.MultiSelectField label="Regions" options={regions} />}</form.AppField>
          <form.AppField name="budget">{(field) => <field.MoneyField label="Monthly budget" description="Billing stops the deploys above it." min={0} />}</form.AppField>
          <form.AppField name="phone">{(field) => <field.PhoneField label="On-call phone" />}</form.AppField>
          <form.AppField name="start">{(field) => <field.DateField label="Start date" typing />}</form.AppField>
          <form.AppForm>
            <form.SubmitButton className="self-start" pendingLabel="Saving…">
              Save plan
            </form.SubmitButton>
          </form.AppForm>
        </FieldGroup>
      </form>
    )
  },
}
