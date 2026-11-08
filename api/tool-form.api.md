# @coreloom/tool-form

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/tool-form.tsx

```ts
function formTool<Input = unknown, Output = ToolFormValues>({ label, display, fields, title, description, submitLabel, cancellable, toOutput, }?: { label?: React.ReactNode; display?: 'card' | 'inline'; fields?: FromInput<Input, readonly ToolFormField[]>; title?: FromInput<Input, React.ReactNode>; description?: FromInput<Input, React.ReactNode>; submitLabel?: React.ReactNode; cancellable?: boolean; toOutput?: (values: ToolFormValues, input: Input) => Output; }) => ToolComponent<Input, Output>
function readToolFormFields(value: unknown) => ToolFormField[]
function ToolForm
ToolForm.fields: readonly ToolFormField[]
ToolForm.title?: React.ReactNode
ToolForm.description?: React.ReactNode
ToolForm.submitLabel?: React.ReactNode
ToolForm.onSubmit?: ((values: ToolFormValues) => void) | undefined
ToolForm.onCancel?: (() => void) | undefined
ToolForm.values?: Record<string, unknown> | undefined
ToolForm.cancelled?: boolean | undefined
ToolForm.className?: string | undefined
type ToolFormError = { type: 'required' | 'number' | 'email' | 'url'; } | { type: 'min' | 'max'; limit: number | string; }
type ToolFormField = (FieldBase & { type?: 'text' | 'email' | 'url' | 'textarea'; placeholder?: string; maxLength?: number; defaultValue?: string; }) | (FieldBase & { type: 'number'; min?: number; max?: number; step?: number; placeholder?: string; defaultValue?: number; }) | (FieldBase & { type: 'date'; min?: string; max?: string; defaultValue?: string; }) | (FieldBase & { type: 'select'; options: readonly { value: string; label: string; }[]; defaultValue?: string; }) | (FieldBase & { type: 'checkbox'; defaultValue?: boolean; })
type ToolFormValues = { [x: string]: string | number | boolean | null; }
function toolFormValues(fields: readonly ToolFormField[], draft: Draft) => ToolFormValues
function validateToolForm(fields: readonly ToolFormField[], draft: Record<string, string | boolean | undefined>) => Partial<Record<string, ToolFormError>>
```
