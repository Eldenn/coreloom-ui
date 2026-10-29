"use client"

// Coreloom UI — Form: TanStack Form wired to Coreloom's Field and controls.
// `useAppForm` is TanStack's useForm with the field components below attached:
//
//   const form = useAppForm({ defaultValues, validators: { onSubmit: schema }, onSubmit })
//   <form.AppField name="email">{(field) => <field.TextField label="Email" type="email" />}</form.AppField>
//   <form.AppForm><form.FormErrors /><form.SubmitButton>Save</form.SubmitButton></form.AppForm>
//
// Validators accept any Standard Schema (zod, valibot, arktype) or plain functions returning a message.
// Validate on change (`validators: { onChange: schema }`): errors show once a field has been left or the
// form submitted, then update as the user types — with aria-invalid on the control.
import * as React from "react"
import { createFormHook, createFormHookContexts, useStore } from "@tanstack/react-form"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Combobox } from "@/components/ui/combobox"
import { DatePicker } from "@/components/ui/date-picker"
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts()

type FieldIssue = { message?: string }

/** Turns TanStack's mixed error values (strings, Standard Schema issues) into `{ message }`. */
function toIssues(errors: unknown[]): FieldIssue[] {
  return errors
    .flatMap((e) => (Array.isArray(e) ? e : [e]))
    .map((e) => (typeof e === "string" ? { message: e } : (e as FieldIssue | null)))
    .filter((e): e is FieldIssue => typeof e?.message === "string" && e.message !== "")
}

/** State shared by every field component: ids, the invalid flag and the errors to show. */
function useFieldMeta() {
  const field = useFieldContext<unknown>()
  const errors = useStore(field.store, (s) => s.meta.errors)
  const isBlurred = useStore(field.store, (s) => s.meta.isBlurred)
  const submitted = useStore(field.form.store, (s) => s.submissionAttempts > 0)
  const uid = React.useId()
  const id = `${field.name}-${uid}`
  const issues = toIssues(errors)
  const invalid = (isBlurred || submitted) && issues.length > 0
  return { field, id, descriptionId: `${id}-description`, errorId: `${id}-error`, invalid, issues }
}

type FieldShellProps = {
  label: React.ReactNode
  description?: React.ReactNode
  className?: string
}

type Meta = ReturnType<typeof useFieldMeta>

function describedBy(meta: Meta, description?: React.ReactNode) {
  return [description ? meta.descriptionId : null, meta.invalid ? meta.errorId : null].filter(Boolean).join(" ") || undefined
}

/** Label on top, control, then the description and the error. */
function VerticalShell({ meta, label, description, className, children }: FieldShellProps & { meta: Meta; children: React.ReactNode }) {
  return (
    <Field data-invalid={meta.invalid || undefined} className={className}>
      <FieldLabel htmlFor={meta.id}>{label}</FieldLabel>
      {children}
      {description && <FieldDescription id={meta.descriptionId}>{description}</FieldDescription>}
      {meta.invalid && <FieldError id={meta.errorId} errors={meta.issues} />}
    </Field>
  )
}

function TextField({
  label,
  description,
  className,
  ...props
}: FieldShellProps & Omit<React.ComponentProps<typeof Input>, "value" | "defaultValue" | "onChange" | "onBlur" | "id" | "name" | "className">) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useStore(field.store, (s) => s.value)
  return (
    <VerticalShell meta={meta} label={label} description={description} className={className}>
      <Input
        id={meta.id}
        name={field.name}
        value={value == null ? "" : String(value)}
        onChange={(e) => field.handleChange(props.type === "number" ? (e.target.value === "" ? undefined : e.target.valueAsNumber) : e.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

function TextareaField({
  label,
  description,
  className,
  ...props
}: FieldShellProps & Omit<React.ComponentProps<typeof Textarea>, "value" | "defaultValue" | "onChange" | "onBlur" | "id" | "name" | "className">) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useStore(field.store, (s) => s.value)
  return (
    <VerticalShell meta={meta} label={label} description={description} className={className}>
      <Textarea
        id={meta.id}
        name={field.name}
        value={value == null ? "" : String(value)}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

type Option = { value: string; label: React.ReactNode; disabled?: boolean }

function SelectField({
  label,
  description,
  className,
  options,
  placeholder,
  disabled,
}: FieldShellProps & { options: Option[]; placeholder?: string; disabled?: boolean }) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useStore(field.store, (s) => s.value) as string | undefined
  return (
    <VerticalShell meta={meta} label={label} description={description} className={className}>
      <Select
        name={field.name}
        value={value ?? ""}
        onValueChange={(v) => field.handleChange(v)}
        onOpenChange={(open) => !open && field.handleBlur()}
        disabled={disabled}
      >
        <SelectTrigger id={meta.id} aria-invalid={meta.invalid || undefined} aria-describedby={describedBy(meta, description)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </VerticalShell>
  )
}

function ComboboxField({
  label,
  description,
  className,
  ...props
}: FieldShellProps & Omit<React.ComponentProps<typeof Combobox>, "value" | "defaultValue" | "onValueChange" | "id" | "className" | "aria-invalid">) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useStore(field.store, (s) => s.value) as string | undefined
  return (
    <VerticalShell meta={meta} label={label} description={description} className={className}>
      <Combobox
        id={meta.id}
        value={value ?? ""}
        onValueChange={(v) => {
          field.handleChange(v)
          field.handleBlur()
        }}
        aria-invalid={meta.invalid || undefined}
        {...props}
      />
    </VerticalShell>
  )
}

function DateField({
  label,
  description,
  className,
  ...props
}: FieldShellProps & Omit<React.ComponentProps<typeof DatePicker>, "value" | "defaultValue" | "onValueChange" | "id" | "className" | "aria-invalid">) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useStore(field.store, (s) => s.value) as Date | undefined
  return (
    <VerticalShell meta={meta} label={label} description={description} className={className}>
      <DatePicker
        id={meta.id}
        value={value}
        onValueChange={(d) => {
          field.handleChange(d)
          field.handleBlur()
        }}
        aria-invalid={meta.invalid || undefined}
        {...props}
      />
    </VerticalShell>
  )
}

function RadioGroupField({
  label,
  description,
  className,
  options,
  disabled,
}: FieldShellProps & { options: Option[]; disabled?: boolean }) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useStore(field.store, (s) => s.value) as string | undefined
  return (
    <Field data-invalid={meta.invalid || undefined} className={className}>
      <FieldLabel id={`${meta.id}-label`}>{label}</FieldLabel>
      {description && <FieldDescription id={meta.descriptionId}>{description}</FieldDescription>}
      <RadioGroup
        name={field.name}
        value={value ?? ""}
        onValueChange={(v) => {
          field.handleChange(v)
          field.handleBlur()
        }}
        disabled={disabled}
        aria-labelledby={`${meta.id}-label`}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
      >
        {options.map((o) => (
          <Field key={o.value} orientation="horizontal">
            <RadioGroupItem id={`${meta.id}-${o.value}`} value={o.value} disabled={o.disabled} aria-invalid={meta.invalid || undefined} />
            <FieldLabel htmlFor={`${meta.id}-${o.value}`}>{o.label}</FieldLabel>
          </Field>
        ))}
      </RadioGroup>
      {meta.invalid && <FieldError id={meta.errorId} errors={meta.issues} />}
    </Field>
  )
}

/** Checkbox or switch on the left, label (and description) beside it. */
function ToggleField({
  label,
  description,
  className,
  disabled,
  control,
}: FieldShellProps & { disabled?: boolean; control: "checkbox" | "switch" }) {
  const meta = useFieldMeta()
  const field = meta.field
  const checked = useStore(field.store, (s) => Boolean(s.value))
  const common = {
    id: meta.id,
    name: field.name,
    checked,
    disabled,
    onCheckedChange: (c: boolean | "indeterminate") => {
      field.handleChange(c === true)
      field.handleBlur()
    },
    "aria-invalid": meta.invalid || undefined,
    "aria-describedby": describedBy(meta, description),
  }
  return (
    <Field orientation="horizontal" data-invalid={meta.invalid || undefined} className={cn(control === "switch" && "justify-between", className)}>
      {control === "checkbox" && <Checkbox {...common} />}
      <FieldContent>
        <FieldLabel htmlFor={meta.id}>{label}</FieldLabel>
        {description && <FieldDescription id={meta.descriptionId}>{description}</FieldDescription>}
        {meta.invalid && <FieldError id={meta.errorId} errors={meta.issues} />}
      </FieldContent>
      {control === "switch" && <Switch {...common} />}
    </Field>
  )
}

function CheckboxField(props: FieldShellProps & { disabled?: boolean }) {
  return <ToggleField {...props} control="checkbox" />
}

function SwitchField(props: FieldShellProps & { disabled?: boolean }) {
  return <ToggleField {...props} control="switch" />
}

/** Submit button: stays enabled so a click reveals every error; disabled with a spinner while submitting. */
function SubmitButton({
  children,
  pendingLabel,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "type"> & { pendingLabel?: React.ReactNode }) {
  const form = useFormContext()
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting)
  return (
    <Button type="submit" data-submitting={isSubmitting || undefined} disabled={isSubmitting || props.disabled} {...props}>
      {isSubmitting && <Spinner className="text-current" />}
      {isSubmitting && pendingLabel ? pendingLabel : children}
    </Button>
  )
}

/** Form-level errors (a validator returning `{ form: "…" }`, or a server error you set). */
function FormErrors({ title = "Couldn't save", className }: { title?: React.ReactNode; className?: string }) {
  const form = useFormContext()
  const errors = useStore(form.store, (s) => s.errors)
  const issues = toIssues(errors)
  if (!issues.length) return null
  return (
    <Alert variant="destructive" className={className}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{issues.map((i) => i.message).filter(Boolean).join(" ")}</AlertDescription>
    </Alert>
  )
}

const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    TextareaField,
    SelectField,
    ComboboxField,
    DateField,
    RadioGroupField,
    CheckboxField,
    SwitchField,
  },
  formComponents: {
    SubmitButton,
    FormErrors,
  },
})

export {
  useAppForm,
  withForm,
  withFieldGroup,
  useFieldContext,
  useFormContext,
  TextField,
  TextareaField,
  SelectField,
  ComboboxField,
  DateField,
  RadioGroupField,
  CheckboxField,
  SwitchField,
  SubmitButton,
  FormErrors,
}
