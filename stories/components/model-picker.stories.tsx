import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/components/ui/form"
import { ModelField } from "@/components/ui/model-field"
import { ModelList, ModelPicker } from "@/components/ui/model-picker"
import type { AiModel } from "@/lib/ai"
import { catalog } from "../blocks/ai-models"

const meta = {
  title: "Components/AI/Model picker",
  component: ModelPicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Which model answers. A small trigger with the chosen model's name opens a searchable list grouped by provider: what each model is for, its context window, its price per million tokens (in / out) and what it can do. Ghost in a composer's toolbar, outline in a form. Arrows move, Enter picks, Escape closes.",
      },
    },
  },
  args: {
    models: catalog,
    value: "claude-sonnet",
    variant: "ghost",
    size: "sm",
    disabled: false,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["ghost", "outline"] },
    size: { control: "inline-radio", options: ["sm", "default"] },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    models: { control: false },
    onValueChange: { control: false },
  },
  render: function Render(args) {
    const [value, setValue] = React.useState(args.value)
    React.useEffect(() => setValue(args.value), [args.value])
    return (
      <div className="flex max-w-xl items-center gap-1 rounded-lg border border-input bg-inset p-2">
        <ModelPicker {...args} value={value} onValueChange={setValue} />
      </div>
    )
  },
} satisfies Meta<typeof ModelPicker>
export default meta
type Story = StoryObj<typeof meta>

/** In a composer's bottom bar: a ghost trigger. Open it and type "fast" or "openai". */
export const Default: Story = {}

/** The list on its own — what the trigger opens, or an inline choice on a settings page. */
export const List: Story = {
  render: function Render(args) {
    const [value, setValue] = React.useState(args.value)
    return (
      <div className="max-w-[400px] overflow-hidden rounded-md border border-border bg-popover">
        <ModelList models={args.models} value={value} onValueChange={setValue} />
      </div>
    )
  },
}

/** Outline, full width: in a settings form, through the form kit's `ModelField`. */
export const InAForm: Story = {
  render: function Render(args) {
    const [saved, setSaved] = React.useState<string>()
    const form = useAppForm({
      defaultValues: { model: "claude-haiku" },
      onSubmit: ({ value }) => setSaved(value.model),
    })
    return (
      <form
        noValidate
        className="flex max-w-md flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.AppField name="model">{() => <ModelField label="Default model" description="New chats start with it." models={args.models} />}</form.AppField>
        <div className="flex items-center gap-3">
          <Button type="submit">Save</Button>
          <p className="m-0 text-[13px] text-muted-foreground" aria-live="polite">
            {saved && `Saved: ${saved}`}
          </p>
        </div>
      </form>
    )
  },
}

const long: AiModel[] = [
  {
    id: "long-1",
    name: "Claude Sonnet — extended thinking, research preview, EU data residency",
    provider: "Anthropic via Amazon Bedrock (eu-central-1)",
    description: "Same model as Sonnet, served from Frankfurt with a longer thinking budget and stricter retention.",
    contextWindow: 1_000_000,
    pricing: { input: 3.3, output: 16.5 },
    capabilities: ["vision", "tools", "reasoning", "files", "web"],
  },
  ...catalog,
]

/** Long names, providers and descriptions wrap in the list; the trigger truncates. */
export const LongNames: Story = {
  args: { models: long, value: "long-1" },
  render: function Render(args) {
    const [value, setValue] = React.useState(args.value)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex w-64 items-center gap-1 rounded-lg border border-input bg-inset p-2">
          <ModelPicker {...args} value={value} onValueChange={setValue} />
        </div>
        <div className="max-w-[400px] overflow-hidden rounded-md border border-border bg-popover">
          <ModelList models={args.models} value={value} onValueChange={setValue} />
        </div>
      </div>
    )
  },
}

/** French: translated labels, prices and windows in the French format ("3 $US", "200 k"). */
export const French: Story = {
  globals: { locale: "fr" },
  render: List.render,
}

/** Nothing chosen yet, and a disabled picker. */
export const EmptyAndDisabled: Story = {
  render: (args) => (
    <div className="flex max-w-xl items-center gap-3 rounded-lg border border-input bg-inset p-2">
      <ModelPicker models={args.models} />
      <ModelPicker models={args.models} value="claude-sonnet" disabled />
    </div>
  ),
}
