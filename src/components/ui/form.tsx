'use client'

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
import { createFormHook, createFormHookContexts, useSelector } from '@tanstack/react-form'
import * as React from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Combobox } from '@/components/ui/combobox'
import { DatePicker } from '@/components/ui/date-picker'
import { type DateRange, DateRangePicker } from '@/components/ui/date-range-picker'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { FileUpload } from '@/components/ui/file-upload'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { MoneyInput } from '@/components/ui/money-input'
import { MultiSelect } from '@/components/ui/multi-select'
import { PhoneInput } from '@/components/ui/phone-input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { TagsInput } from '@/components/ui/tags-input'
import { Textarea } from '@/components/ui/textarea'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts()

interface FieldIssue {
  message?: string
}

/** Turns TanStack's mixed error values (strings, Standard Schema issues) into `{ message }`. */
function toIssues(errors: unknown[]): FieldIssue[] {
  return errors
    .flatMap((e): unknown[] => (Array.isArray(e) ? e : [e]))
    .map((e) => (typeof e === 'string' ? { message: e } : (e as FieldIssue | null)))
    .filter((e): e is FieldIssue => typeof e?.message === 'string' && e.message !== '')
}

/** State shared by every field component: ids, the invalid flag and the errors to show. */
function useFieldMeta() {
  const field = useFieldContext<unknown>()
  const errors = useSelector(field.store, (s): unknown[] => s.meta.errors)
  const isBlurred = useSelector(field.store, (s) => s.meta.isBlurred)
  const submitted = useSelector(field.form.store, (s) => s.submissionAttempts > 0)
  const baseId = React.useId()
  const id = `${field.name}-${baseId}`
  const issues = toIssues(errors)
  const invalid = (isBlurred || submitted) && issues.length > 0
  return {
    field,
    id,
    labelId: `${id}-label`,
    descriptionId: `${id}-description`,
    errorId: `${id}-error`,
    invalid,
    issues,
  }
}

interface FieldShellProps {
  label: React.ReactNode
  description?: React.ReactNode
  className?: string
}

type VerticalShellProps = FieldShellProps & {
  /** Shown at the right of the label, e.g. a "Forgot password?" link. */
  labelAction?: React.ReactNode
  /** Keeps the label for assistive tech only. */
  hideLabel?: boolean
}

type Meta = ReturnType<typeof useFieldMeta>

function describedBy(meta: Meta, description?: React.ReactNode) {
  return (
    [description ? meta.descriptionId : null, meta.invalid ? meta.errorId : null]
      .filter(Boolean)
      .join(' ') || undefined
  )
}

/** Label on top, control, then the description and the error. */
function VerticalShell({
  meta,
  label,
  description,
  className,
  labelAction,
  hideLabel,
  children,
}: VerticalShellProps & { meta: Meta; children: React.ReactNode }) {
  const labelEl = (
    <FieldLabel id={meta.labelId} htmlFor={meta.id} className={cn(hideLabel && 'sr-only')}>
      {label}
    </FieldLabel>
  )
  return (
    <Field data-invalid={meta.invalid || undefined} className={className}>
      {labelAction && !hideLabel ? (
        <div className="flex items-center justify-between gap-3">
          {labelEl}
          {labelAction}
        </div>
      ) : (
        labelEl
      )}
      {children}
      {description ? (
        <FieldDescription id={meta.descriptionId}>{description}</FieldDescription>
      ) : null}
      {meta.invalid && <FieldError id={meta.errorId} errors={meta.issues} />}
    </Field>
  )
}

function TextField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps &
  Omit<
    React.ComponentProps<typeof Input>,
    'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'
  >) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value)
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
    >
      <Input
        id={meta.id}
        name={field.name}
        // eslint-disable-next-line @typescript-eslint/no-base-to-string -- the field holds a string or a number; String() is what the input shows.
        value={value == null ? '' : String(value)}
        onChange={(e) => {
          field.handleChange(
            props.type === 'number'
              ? e.target.value === ''
                ? undefined
                : e.target.valueAsNumber
              : e.target.value,
          )
        }}
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
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps &
  Omit<
    React.ComponentProps<typeof Textarea>,
    'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'
  >) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value)
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
    >
      <Textarea
        id={meta.id}
        name={field.name}
        // eslint-disable-next-line @typescript-eslint/no-base-to-string -- the field holds a string or a number; String() is what the input shows.
        value={value == null ? '' : String(value)}
        onChange={(e) => {
          field.handleChange(e.target.value)
        }}
        onBlur={field.handleBlur}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** A one-time code in slots (InputOTP). `submitOnComplete` submits the form when the last slot is filled. */
function OTPField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  length = 6,
  groupSize = 3,
  pattern,
  submitOnComplete = false,
  autoFocus,
  disabled,
}: VerticalShellProps & {
  length?: number
  /** Slots per group; groups are split by a separator. */
  groupSize?: number
  /** A RegExp source the characters must match, e.g. REGEXP_ONLY_DIGITS from "input-otp". */
  pattern?: string
  submitOnComplete?: boolean
  autoFocus?: boolean
  disabled?: boolean
}) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as string | undefined
  const groups = Array.from({ length: Math.ceil(length / groupSize) }, (_, g) =>
    Array.from(
      { length: Math.min(groupSize, length - g * groupSize) },
      (_, i) => g * groupSize + i,
    ),
  )
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
    >
      <InputOTP
        id={meta.id}
        name={field.name}
        maxLength={length}
        pattern={pattern}
        autoComplete="one-time-code"
        autoFocus={autoFocus}
        disabled={disabled}
        value={value ?? ''}
        onChange={(v: string) => {
          field.handleChange(v)
        }}
        onBlur={field.handleBlur}
        onComplete={() => {
          if (submitOnComplete) void field.form.handleSubmit()
        }}
        aria-describedby={describedBy(meta, description)}
        containerClassName="w-auto"
      >
        {groups.map((slots, g) => (
          // eslint-disable-next-line @eslint-react/no-array-index-key -- fixed slot groups computed from the length; they never reorder.
          <React.Fragment key={g}>
            {g > 0 && <InputOTPSeparator />}
            <InputOTPGroup>
              {slots.map((i) => (
                <InputOTPSlot key={i} index={i} aria-invalid={meta.invalid || undefined} />
              ))}
            </InputOTPGroup>
          </React.Fragment>
        ))}
      </InputOTP>
    </VerticalShell>
  )
}

interface Option {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

function SelectField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  options,
  placeholder,
  disabled,
}: VerticalShellProps & { options: Option[]; placeholder?: string; disabled?: boolean }) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as string | undefined
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
    >
      <Select
        name={field.name}
        value={value ?? ''}
        onValueChange={(v) => {
          field.handleChange(v)
        }}
        onOpenChange={(open) => !open && field.handleBlur()}
        disabled={disabled}
      >
        <SelectTrigger
          id={meta.id}
          aria-invalid={meta.invalid || undefined}
          aria-describedby={describedBy(meta, description)}
        >
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
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps &
  Omit<
    React.ComponentProps<typeof Combobox>,
    'value' | 'defaultValue' | 'onValueChange' | 'id' | 'className' | 'aria-invalid'
  >) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as string | undefined
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
    >
      <Combobox
        id={meta.id}
        value={value ?? ''}
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
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps &
  Omit<
    React.ComponentProps<typeof DatePicker>,
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
    | 'onBlur'
    | 'id'
    | 'className'
    | 'aria-invalid'
    | 'aria-describedby'
  >) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as Date | undefined
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
    >
      <DatePicker
        id={meta.id}
        value={value}
        onValueChange={(d) => {
          field.handleChange(d)
          // Picked from the calendar: done. Typed: wait for the field to be left.
          if (!props.typing) field.handleBlur()
        }}
        onBlur={field.handleBlur}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

function DateRangeField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps &
  Omit<
    React.ComponentProps<typeof DateRangePicker>,
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
    | 'onBlur'
    | 'id'
    | 'className'
    | 'aria-invalid'
    | 'aria-describedby'
  >) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as DateRange | undefined
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
    >
      <DateRangePicker
        id={meta.id}
        value={value ?? { from: undefined }}
        onValueChange={(r) => {
          field.handleChange(r)
        }}
        onBlur={field.handleBlur}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** Tags typed into one field (string[]). */
function TagsField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps &
  Omit<
    React.ComponentProps<typeof TagsInput>,
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
    | 'onBlur'
    | 'id'
    | 'className'
    | 'aria-invalid'
    | 'aria-describedby'
  >) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as string[] | undefined
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
    >
      <TagsInput
        id={meta.id}
        value={value ?? []}
        onValueChange={(tags) => {
          field.handleChange(tags)
        }}
        onBlur={field.handleBlur}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** Several values from a known list (string[]). */
function MultiSelectField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps &
  Omit<
    React.ComponentProps<typeof MultiSelect>,
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
    | 'onBlur'
    | 'id'
    | 'className'
    | 'aria-invalid'
    | 'aria-describedby'
  >) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as string[] | undefined
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
    >
      <MultiSelect
        id={meta.id}
        value={value ?? []}
        onValueChange={(v) => {
          field.handleChange(v)
        }}
        onBlur={field.handleBlur}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** An amount (number | null, in major units) in `currency`. */
function MoneyField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps &
  Omit<
    React.ComponentProps<typeof MoneyInput>,
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
    | 'onBlur'
    | 'id'
    | 'className'
    | 'aria-invalid'
    | 'aria-describedby'
  >) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as number | null | undefined
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
    >
      <MoneyInput
        id={meta.id}
        value={value ?? null}
        onValueChange={(n) => {
          field.handleChange(n)
        }}
        onBlur={field.handleBlur}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** A phone number, as E.164 ("+33612345678"). Validate with `isValidPhone`. */
function PhoneField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps &
  Omit<
    React.ComponentProps<typeof PhoneInput>,
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
    | 'onBlur'
    | 'id'
    | 'className'
    | 'aria-invalid'
    | 'aria-describedby'
  >) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as string | undefined
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
    >
      <PhoneInput
        id={meta.id}
        value={value ?? ''}
        onValueChange={(v) => {
          field.handleChange(v)
        }}
        onBlur={field.handleBlur}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** Files from a drop zone (File[]). Type and size limits refuse files with their own message. */
function FileField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps &
  Omit<
    React.ComponentProps<typeof FileUpload>,
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
    | 'onBlur'
    | 'id'
    | 'className'
    | 'aria-invalid'
    | 'aria-describedby'
  >) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as File[] | undefined
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
    >
      <FileUpload
        id={meta.id}
        value={value ?? []}
        onValueChange={(files) => {
          field.handleChange(files)
          field.handleBlur()
        }}
        onBlur={field.handleBlur}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
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
  const value = useSelector(field.store, (s) => s.value) as string | undefined
  return (
    <Field data-invalid={meta.invalid || undefined} className={className}>
      <FieldLabel id={`${meta.id}-label`}>{label}</FieldLabel>
      {description ? (
        <FieldDescription id={meta.descriptionId}>{description}</FieldDescription>
      ) : null}
      <RadioGroup
        name={field.name}
        value={value ?? ''}
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
            <RadioGroupItem
              id={`${meta.id}-${o.value}`}
              value={o.value}
              disabled={o.disabled}
              aria-invalid={meta.invalid || undefined}
            />
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
}: FieldShellProps & { disabled?: boolean; control: 'checkbox' | 'switch' }) {
  const meta = useFieldMeta()
  const field = meta.field
  const checked = useSelector(field.store, (s) => Boolean(s.value))
  const common = {
    id: meta.id,
    name: field.name,
    checked,
    disabled,
    onCheckedChange: (c: boolean | 'indeterminate') => {
      field.handleChange(c === true)
      field.handleBlur()
    },
    'aria-invalid': meta.invalid || undefined,
    'aria-describedby': describedBy(meta, description),
  }
  return (
    <Field
      orientation="horizontal"
      data-invalid={meta.invalid || undefined}
      className={cn(control === 'switch' && 'justify-between', className)}
    >
      {control === 'checkbox' && <Checkbox {...common} />}
      <FieldContent>
        <FieldLabel htmlFor={meta.id}>{label}</FieldLabel>
        {description ? (
          <FieldDescription id={meta.descriptionId}>{description}</FieldDescription>
        ) : null}
        {meta.invalid && <FieldError id={meta.errorId} errors={meta.issues} />}
      </FieldContent>
      {control === 'switch' && <Switch {...common} />}
    </Field>
  )
}

function CheckboxField(props: FieldShellProps & { disabled?: boolean }) {
  return <ToggleField {...props} control="checkbox" />
}

function SwitchField(props: FieldShellProps & { disabled?: boolean }) {
  return <ToggleField {...props} control="switch" />
}

/** Submit button: stays enabled so a click reveals every error; disabled with a spinner while submitting or `pending`. */
function SubmitButton({
  children,
  pendingLabel,
  pending = false,
  disabled,
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'type'> & {
  pendingLabel?: React.ReactNode
  /** Busy state you control (an OAuth redirect, a parent's request), on top of the form's own submission. */
  pending?: boolean
}) {
  const form = useFormContext()
  const isSubmitting = useSelector(form.store, (s) => s.isSubmitting)
  const busy = isSubmitting || pending
  return (
    <Button
      {...props}
      type="submit"
      data-submitting={isSubmitting || undefined}
      aria-busy={busy || undefined}
      disabled={busy || disabled}
    >
      {busy && <Spinner className="text-current" />}
      {busy && pendingLabel ? pendingLabel : children}
    </Button>
  )
}

/** Form-level errors (a validator returning `{ form: "…" }`, or a server error you set). */
function FormErrors({ title, className }: { title?: React.ReactNode; className?: string }) {
  const t = useCoreloomI18n().messages
  const form = useFormContext()
  const errors = useSelector(form.store, (s): unknown[] => s.errors)
  const issues = toIssues(errors)
  if (!issues.length) return null
  return (
    <Alert variant="destructive" className={className}>
      <AlertTitle>{title ?? t.form.errorTitle}</AlertTitle>
      <AlertDescription>
        {issues
          .map((i) => i.message)
          .filter(Boolean)
          .join(' ')}
      </AlertDescription>
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
    MultiSelectField,
    DateField,
    DateRangeField,
    TagsField,
    FileField,
    MoneyField,
    PhoneField,
    RadioGroupField,
    CheckboxField,
    SwitchField,
    OTPField,
  },
  formComponents: {
    SubmitButton,
    FormErrors,
  },
})

export {
  CheckboxField,
  ComboboxField,
  DateField,
  DateRangeField,
  describedBy,
  FileField,
  FormErrors,
  MoneyField,
  MultiSelectField,
  OTPField,
  PhoneField,
  RadioGroupField,
  SelectField,
  SubmitButton,
  SwitchField,
  TagsField,
  TextareaField,
  TextField,
  useAppForm,
  useFieldContext,
  // For your own field components (see rich-text-field.tsx): ids, errors and the label / description / error frame.
  useFieldMeta,
  useFormContext,
  VerticalShell,
  type VerticalShellProps,
  withFieldGroup,
  withForm,
}
