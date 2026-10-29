import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { FileUpload } from "@/components/ui/file-upload"
import { useAppForm } from "@/components/ui/form"
import { toast } from "@/components/ui/sonner"
import { Stepper } from "@/components/ui/stepper"
import { TagsInput } from "@/components/ui/tags-input"

const meta = {
  title: "Components/Forms/Files, tags, ranges & steps",
  component: DateRangePicker,
  tags: ["autodocs"],
} satisfies Meta<typeof DateRangePicker>
export default meta
type Story = StoryObj<typeof meta>

export const DateRangePickerStory: Story = {
  name: "DateRangePicker",
  render: () => {
    const [range, setRange] = React.useState<DateRange | undefined>({ from: new Date(2026, 9, 1), to: new Date(2026, 9, 14) })
    return (
      <Field className="max-w-xs">
        <FieldLabel htmlFor="range">Report period</FieldLabel>
        <DateRangePicker id="range" value={range} onValueChange={setRange} />
        <FieldDescription>Shortcuts are relative to today.</FieldDescription>
      </Field>
    )
  },
}

export const TagsInputStory: Story = {
  name: "TagsInput",
  render: () => (
    <Field className="max-w-md">
      <FieldLabel htmlFor="tags">Topics</FieldLabel>
      <TagsInput id="tags" defaultValue={["design-system", "react", "tailwind"]} maxTags={8} />
      <FieldDescription>Enter or a comma adds a tag; Backspace removes the last one.</FieldDescription>
    </Field>
  ),
}

// A 1×1 teal PNG, so the thumbnail renders without the network.
const pixel = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNgYPj/HwADBQJ/gK3bWAAAAABJRU5ErkJggg=="), (c) => c.charCodeAt(0))
const demoFiles = [
  new File([pixel], "cover.png", { type: "image/png", lastModified: 1 }),
  new File([new Uint8Array(2_400_000)], "brand-guidelines.pdf", { type: "application/pdf", lastModified: 2 }),
]

export const FileUploadStory: Story = {
  name: "FileUpload",
  render: () => {
    const [files, setFiles] = React.useState<File[]>(demoFiles)
    return (
      <Field className="max-w-md">
        <FieldLabel htmlFor="files">Attachments</FieldLabel>
        <FileUpload
          id="files"
          value={files}
          onValueChange={setFiles}
          accept="image/*,.pdf"
          maxSize={5 * 1024 * 1024}
          maxFiles={4}
          progress={(f) => (f.name.endsWith(".pdf") ? 64 : undefined)}
        />
        <FieldDescription>PNG, JPG or PDF, up to 5 MB each.</FieldDescription>
      </Field>
    )
  },
}

const steps = [
  { title: "Account", description: "Name and email" },
  { title: "Workspace", description: "Team and region" },
  { title: "Invite", description: "Add teammates" },
  { title: "Done" },
]

export const StepperStory: Story = {
  name: "Stepper",
  render: () => {
    const [current, setCurrent] = React.useState(1)
    return (
      <div className="flex max-w-2xl flex-col gap-8">
        <Stepper steps={steps} current={current} onStepChange={setCurrent} />
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
            Back
          </Button>
          <Button onClick={() => setCurrent((c) => Math.min(steps.length, c + 1))} disabled={current === steps.length}>
            Next
          </Button>
        </div>
        <Stepper steps={steps} current={2} orientation="vertical" aria-label="Setup progress (vertical)" className="max-w-xs" />
      </div>
    )
  },
}

const releaseSchema = z.object({
  period: z.object({ from: z.date().or(z.undefined()), to: z.date().optional() }).refine((r) => r.from && r.to, "Pick a start and an end date."),
  labels: z.array(z.string()).min(1, "Add at least one label."),
  assets: z.array(z.instanceof(File)).min(1, "Attach at least one file."),
})

export const InAForm: Story = {
  name: "In a form (TanStack)",
  render: () => {
    const form = useAppForm({
      defaultValues: { period: { from: undefined, to: undefined } as DateRange, labels: [] as string[], assets: [] as File[] },
      validators: { onChange: releaseSchema },
      onSubmit: async ({ value }) => {
        await new Promise((r) => setTimeout(r, 600))
        toast.success(`Release planned with ${value.assets.length} file(s)`)
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
          <form.AppField name="period">{(field) => <field.DateRangeField label="Release window" />}</form.AppField>
          <form.AppField name="labels">{(field) => <field.TagsField label="Labels" description="Shown on the changelog." />}</form.AppField>
          <form.AppField name="assets">{(field) => <field.FileField label="Assets" accept="image/*,.pdf" maxSize={5 * 1024 * 1024} />}</form.AppField>
          <form.AppForm>
            <form.SubmitButton className="self-start" pendingLabel="Planning…">
              Plan release
            </form.SubmitButton>
          </form.AppForm>
        </FieldGroup>
      </form>
    )
  },
}
