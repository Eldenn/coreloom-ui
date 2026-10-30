import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { z } from "zod"

import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useAppForm } from "@/components/ui/form"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { RichTextField } from "@/components/ui/rich-text-field"
import { toast } from "@/components/ui/sonner"

const sample = `<h2>Release notes</h2><p>This release adds <strong>typed dates</strong>, a <em>server-driven</em> table and a <a href="https://eldenn.github.io/coreloom-ui/">rich text editor</a>.</p><ul><li>Faster builds</li><li>Fewer surprises</li></ul><blockquote><p>Ship small, ship often.</p></blockquote>`

const meta = {
  title: "Components/Forms/Rich text editor",
  component: RichTextEditor,
  tags: ["autodocs"],
} satisfies Meta<typeof RichTextEditor>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [html, setHtml] = React.useState(sample)
    return (
      <Field className="max-w-2xl">
        <FieldLabel id="notes-label">Release notes</FieldLabel>
        <RichTextEditor value={html} onValueChange={setHtml} aria-labelledby="notes-label" />
        <FieldDescription>
          <span className="font-mono">{html.length}</span> characters of HTML
        </FieldDescription>
      </Field>
    )
  },
}

export const Empty: Story = {
  render: () => (
    <Field className="max-w-2xl">
      <FieldLabel id="empty-label">Comment</FieldLabel>
      <RichTextEditor aria-labelledby="empty-label" minHeight={100} />
    </Field>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Field className="max-w-2xl">
      <FieldLabel id="disabled-label">Archived notes</FieldLabel>
      <RichTextEditor defaultValue={sample} disabled aria-labelledby="disabled-label" />
    </Field>
  ),
}

/** Submit empty to see the error; the value is HTML, checked here for real text. */
export const InAForm: Story = {
  name: "In a form (TanStack)",
  render: () => {
    const form = useAppForm({
      defaultValues: { body: "" },
      validators: {
        onChange: z.object({
          body: z.string().refine((html) => html.replace(/<[^>]+>/g, "").trim().length >= 10, "Write at least 10 characters."),
        }),
      },
      onSubmit: async () => {
        await new Promise((r) => setTimeout(r, 500))
        toast.success("Posted")
      },
    })
    return (
      <form
        noValidate
        className="max-w-2xl"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <FieldGroup className="gap-5">
          <form.AppField name="body">{() => <RichTextField label="Description" description="Markdown shortcuts work: ## for a heading, - for a list." />}</form.AppField>
          <form.AppForm>
            <form.SubmitButton className="self-start" pendingLabel="Posting…">
              Post
            </form.SubmitButton>
          </form.AppForm>
        </FieldGroup>
      </form>
    )
  },
}
