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
import { CharacterCount } from '@/components/ui/character-count'
import { Checkbox } from '@/components/ui/checkbox'
import { ChipGroup, type ChipOption } from '@/components/ui/chip-group'
import { RadioCard, RadioCardGroup } from '@/components/ui/choice-card'
import { ColorPicker } from '@/components/ui/color-picker'
import { Combobox } from '@/components/ui/combobox'
import { DatePicker } from '@/components/ui/date-picker'
import { type DateRange, DateRangePicker } from '@/components/ui/date-range-picker'
import { DurationInput } from '@/components/ui/duration-input'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { FileUpload } from '@/components/ui/file-upload'
import { ImageInput, type ImageValue } from '@/components/ui/image-input'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/input-group'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { JsonInput } from '@/components/ui/json-input'
import { KeyValueEditor, type KeyValuePair } from '@/components/ui/key-value-editor'
import { MaskedInput } from '@/components/ui/masked-input'
import { MentionTextarea } from '@/components/ui/mention-textarea'
import { MoneyInput } from '@/components/ui/money-input'
import { MonthPicker } from '@/components/ui/month-picker'
import { MultiSelect } from '@/components/ui/multi-select'
import { NumberInput } from '@/components/ui/number-input'
import { PhoneInput } from '@/components/ui/phone-input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  type NumberRange,
  NumberRangeInput,
  type TimeRange,
  TimeRangePicker,
} from '@/components/ui/range-inputs'
import { Rating } from '@/components/ui/rating'
import { type Recurrence, RecurrenceInput } from '@/components/ui/recurrence-input'
import { ScaleInput } from '@/components/ui/scale-input'
import { SegmentedControl } from '@/components/ui/segmented-control'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SliderInput } from '@/components/ui/slider-input'
import { SortableList } from '@/components/ui/sortable-list'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { TagsInput } from '@/components/ui/tags-input'
import { Textarea } from '@/components/ui/textarea'
import { DateTimePicker, TimePicker } from '@/components/ui/time-picker'
import { TimezoneSelect } from '@/components/ui/timezone-select'
import { TransferList } from '@/components/ui/transfer-list'
import { type TreeNode, TreeSelect } from '@/components/ui/tree-select'
import { UnitInput, type UnitValue } from '@/components/ui/unit-input'
import { WeekPicker } from '@/components/ui/week-picker'
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
  group = false,
  children,
}: VerticalShellProps & {
  meta: Meta
  /** The control is a group (radios, stars, rows) named by the label's id, not a single input. */
  group?: boolean
  children: React.ReactNode
}) {
  const labelEl = (
    <FieldLabel
      id={meta.labelId}
      htmlFor={group ? undefined : meta.id}
      className={cn(hideLabel && 'sr-only')}
    >
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
  maxCount,
  ...props
}: VerticalShellProps & {
  /** Shows a "120/280" counter under the field (a soft limit: validate the length too). */
  maxCount?: number
} & Omit<
    React.ComponentProps<typeof Input>,
    'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'
  >) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value)
  const countId = `${meta.id}-count`
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
        aria-describedby={
          [describedBy(meta, description), maxCount === undefined ? null : countId]
            .filter(Boolean)
            .join(' ') || undefined
        }
        {...props}
      />
      {maxCount !== undefined && (
        // eslint-disable-next-line @typescript-eslint/no-base-to-string -- the field holds a string or a number.
        <CharacterCount id={countId} value={value == null ? '' : String(value)} max={maxCount} />
      )}
    </VerticalShell>
  )
}

function TextareaField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  maxCount,
  ...props
}: VerticalShellProps & {
  /** Shows a "120/280" counter under the field (a soft limit: validate the length too). */
  maxCount?: number
} & Omit<
    React.ComponentProps<typeof Textarea>,
    'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'
  >) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value)
  const countId = `${meta.id}-count`
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
        aria-describedby={
          [describedBy(meta, description), maxCount === undefined ? null : countId]
            .filter(Boolean)
            .join(' ') || undefined
        }
        {...props}
      />
      {maxCount !== undefined && (
        // eslint-disable-next-line @typescript-eslint/no-base-to-string -- the field holds a string or a number.
        <CharacterCount id={countId} value={value == null ? '' : String(value)} max={maxCount} />
      )}
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

/** A number (or null when empty) from NumberInput: units, percents, bounds and steps as props. */
function NumberField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps &
  Omit<
    React.ComponentProps<typeof NumberInput>,
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
    | 'onBlur'
    | 'id'
    | 'name'
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
      <NumberInput
        id={meta.id}
        name={field.name}
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

/** A password with a show/hide toggle. Put a "Forgot password?" link in `labelAction`. */
function PasswordField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps &
  Omit<
    React.ComponentProps<typeof PasswordInput>,
    'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'
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
      <PasswordInput
        id={meta.id}
        name={field.name}
        value={value ?? ''}
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

/** A time of day as "HH:mm" (or undefined), typed or picked. */
function TimeField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps &
  Omit<
    React.ComponentProps<typeof TimePicker>,
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
    | 'onBlur'
    | 'id'
    | 'name'
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
      <TimePicker
        id={meta.id}
        name={field.name}
        value={value}
        onValueChange={(t) => {
          field.handleChange(t)
        }}
        onBlur={field.handleBlur}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** A day and a time as one Date (or undefined): DatePicker and TimePicker side by side. */
function DateTimeField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps &
  Omit<
    React.ComponentProps<typeof DateTimePicker>,
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
      <DateTimePicker
        id={meta.id}
        value={value}
        onValueChange={(d) => {
          field.handleChange(d)
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

/** Props a field takes from its control, minus what the field wires itself. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any component's props
type ControlProps<C extends React.JSXElementConstructor<any>, Extra extends string = never> = Omit<
  React.ComponentProps<C>,
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'onBlur'
  | 'id'
  | 'name'
  | 'className'
  | 'aria-invalid'
  | 'aria-describedby'
  | 'aria-label'
  | 'aria-labelledby'
  | Extra
>

/** IBAN, card, SIREN, SIRET or your own mask. The value is the raw characters. */
function MaskedField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps & ControlProps<typeof MaskedInput, 'onChange'>) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as string | null | undefined
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
    >
      <MaskedInput
        id={meta.id}
        name={field.name}
        value={value ?? ''}
        onValueChange={(raw) => {
          field.handleChange(raw)
        }}
        onBlur={field.handleBlur}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** A "#rrggbb" colour from swatches, a hex code or the system dialog. */
function ColorField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps & ControlProps<typeof ColorPicker>) {
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
      <ColorPicker
        id={meta.id}
        value={value}
        onValueChange={(hex) => {
          field.handleChange(hex)
          field.handleBlur()
        }}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** Stars; the value is a number, 0 for no score. */
function RatingField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps & ControlProps<typeof Rating, 'readOnly'>) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as number | undefined
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
      group
    >
      <Rating
        name={field.name}
        value={value ?? 0}
        onValueChange={(n) => {
          field.handleChange(n)
          field.handleBlur()
        }}
        aria-labelledby={meta.labelId}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** A slider and a number field on one value. `label` is text: it also names the slider. */
function SliderField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: Omit<VerticalShellProps, 'label'> & { label: string } & ControlProps<
    typeof SliderInput,
    'label'
  >) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as number | undefined
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
    >
      <SliderInput
        id={meta.id}
        label={label}
        value={value}
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

/** A number with its unit; the value is `{ value, unit }`. */
function UnitField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps & ControlProps<typeof UnitInput>) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as UnitValue | undefined
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
    >
      <UnitInput
        id={meta.id}
        name={field.name}
        value={value}
        onValueChange={(next) => {
          field.handleChange(next)
        }}
        onBlur={field.handleBlur}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** A typed duration ("1h30"); the value is minutes, or null. */
function DurationField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps & ControlProps<typeof DurationInput>) {
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
      <DurationInput
        id={meta.id}
        name={field.name}
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

/** A month; the value is "YYYY-MM" or "". */
function MonthField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps & ControlProps<typeof MonthPicker>) {
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
      <MonthPicker
        id={meta.id}
        value={value ?? ''}
        onValueChange={(next) => {
          field.handleChange(next)
        }}
        onBlur={field.handleBlur}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** An ISO week; the value is "YYYY-Www" or "". */
function WeekField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps & ControlProps<typeof WeekPicker>) {
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
      <WeekPicker
        id={meta.id}
        value={value ?? ''}
        onValueChange={(next) => {
          field.handleChange(next)
        }}
        onBlur={field.handleBlur}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** Pick one of a few options in a pill ("Monthly · Yearly"). */
function SegmentedField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps & ControlProps<typeof SegmentedControl>) {
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
      group
    >
      <SegmentedControl
        name={field.name}
        value={value ?? ''}
        onValueChange={(next) => {
          field.handleChange(next)
          field.handleBlur()
        }}
        aria-labelledby={meta.labelId}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

interface CardOption {
  value: string
  title: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
}

/** One choice among cards with a title and a description (a plan, a delivery option). */
function RadioCardField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  options,
  orientation,
  disabled,
}: VerticalShellProps & {
  options: CardOption[]
  orientation?: 'vertical' | 'horizontal'
  disabled?: boolean
}) {
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
      group
    >
      <RadioCardGroup
        name={field.name}
        value={value ?? ''}
        onValueChange={(next) => {
          field.handleChange(next)
          field.handleBlur()
        }}
        orientation={orientation}
        disabled={disabled}
        aria-labelledby={meta.labelId}
        aria-describedby={describedBy(meta, description)}
        aria-invalid={meta.invalid || undefined}
      >
        {options.map((o) => (
          <RadioCard
            key={o.value}
            value={o.value}
            title={o.title}
            description={o.description}
            icon={o.icon}
            disabled={o.disabled}
          />
        ))}
      </RadioCardGroup>
    </VerticalShell>
  )
}

/** Several checkboxes on one field; the value is the array of ticked values. */
function CheckboxGroupField({
  label,
  description,
  className,
  options,
  disabled,
}: FieldShellProps & { options: Option[]; disabled?: boolean }) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as string[] | undefined
  const picked = value ?? []
  return (
    <Field
      role="group"
      aria-labelledby={meta.labelId}
      aria-describedby={describedBy(meta, description)}
      data-invalid={meta.invalid || undefined}
      className={className}
    >
      <FieldLabel id={meta.labelId}>{label}</FieldLabel>
      {description ? (
        <FieldDescription id={meta.descriptionId}>{description}</FieldDescription>
      ) : null}
      <div className="grid gap-3">
        {options.map((o) => (
          <Field key={o.value} orientation="horizontal">
            <Checkbox
              id={`${meta.id}-${o.value}`}
              name={field.name}
              value={o.value}
              checked={picked.includes(o.value)}
              disabled={(disabled ?? false) || (o.disabled ?? false)}
              aria-invalid={meta.invalid || undefined}
              onCheckedChange={(c) => {
                field.handleChange(
                  c === true
                    ? [...picked.filter((v) => v !== o.value), o.value]
                    : picked.filter((v) => v !== o.value),
                )
                field.handleBlur()
              }}
            />
            <FieldLabel htmlFor={`${meta.id}-${o.value}`}>{o.label}</FieldLabel>
          </Field>
        ))}
      </div>
      {meta.invalid && <FieldError id={meta.errorId} errors={meta.issues} />}
    </Field>
  )
}

/** Key and value rows (headers, variables); the value is `{ key, value }[]`. */
function KeyValueField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps & ControlProps<typeof KeyValueEditor>) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as KeyValuePair[] | undefined
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
      group
    >
      <KeyValueEditor
        value={value ?? [{ key: '', value: '' }]}
        onValueChange={(pairs) => {
          field.handleChange(pairs)
        }}
        aria-labelledby={meta.labelId}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** Toggleable pills: `type="multiple"` (a string[], default) or `type="single"` (a string). */
function ChipField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  options,
  type = 'multiple',
  size,
  disabled,
}: VerticalShellProps & {
  options: ChipOption[]
  type?: 'single' | 'multiple'
  size?: 'sm' | 'default'
  disabled?: boolean
}) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as string | string[] | undefined
  const common = {
    options,
    name: field.name,
    size,
    disabled,
    'aria-labelledby': meta.labelId,
    'aria-describedby': describedBy(meta, description),
  }
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
      group
    >
      {type === 'single' ? (
        <ChipGroup
          {...common}
          type="single"
          value={typeof value === 'string' ? value : ''}
          onValueChange={(next) => {
            field.handleChange(next)
            field.handleBlur()
          }}
        />
      ) : (
        <ChipGroup
          {...common}
          type="multiple"
          value={Array.isArray(value) ? value : []}
          onValueChange={(next) => {
            field.handleChange(next)
            field.handleBlur()
          }}
        />
      )}
    </VerticalShell>
  )
}

/** A survey scale (NPS 0–10, Likert); the value is a number, or null before an answer. */
function ScaleField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps & ControlProps<typeof ScaleInput>) {
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
      group
    >
      <ScaleInput
        name={field.name}
        value={value ?? null}
        onValueChange={(n) => {
          field.handleChange(n)
          field.handleBlur()
        }}
        aria-labelledby={meta.labelId}
        aria-describedby={describedBy(meta, description)}
        aria-invalid={meta.invalid || undefined}
        {...props}
      />
    </VerticalShell>
  )
}

/** A minimum and a maximum; the value is `{ min, max }`, each a number or null. */
function NumberRangeField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps & ControlProps<typeof NumberRangeInput>) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as NumberRange | undefined
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
    >
      <NumberRangeInput
        id={meta.id}
        value={value ?? { min: null, max: null }}
        onValueChange={(next) => {
          field.handleChange(next)
        }}
        onBlur={field.handleBlur}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** A start and an end time; the value is `{ start, end }` as "HH:mm". */
function TimeRangeField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps & ControlProps<typeof TimeRangePicker>) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as TimeRange | undefined
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
    >
      <TimeRangePicker
        id={meta.id}
        value={value ?? {}}
        onValueChange={(next) => {
          field.handleChange(next)
        }}
        onBlur={field.handleBlur}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** JSON as text; validate it with `parseJson` or a schema on the parsed value. */
function JsonField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps & ControlProps<typeof JsonInput>) {
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
      <JsonInput
        id={meta.id}
        name={field.name}
        value={value ?? ''}
        onValueChange={(text) => {
          field.handleChange(text)
        }}
        onBlur={field.handleBlur}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** A textarea with @mentions; the value is the plain text. */
function MentionField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps & ControlProps<typeof MentionTextarea>) {
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
      <MentionTextarea
        id={meta.id}
        name={field.name}
        value={value ?? ''}
        onValueChange={(text) => {
          field.handleChange(text)
        }}
        onBlur={field.handleBlur}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** A pick in a tree of options: a string, or a string[] with `multiple`. */
function TreeSelectField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  nodes,
  multiple = false,
  placeholder,
  disabled,
}: VerticalShellProps & {
  nodes: TreeNode[]
  multiple?: boolean
  placeholder?: string
  disabled?: boolean
}) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as string | string[] | undefined
  const common = {
    id: meta.id,
    nodes,
    placeholder,
    disabled,
    onBlur: field.handleBlur,
    'aria-invalid': meta.invalid || undefined,
    'aria-describedby': describedBy(meta, description),
  }
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
    >
      {multiple ? (
        <TreeSelect
          {...common}
          multiple
          value={Array.isArray(value) ? value : []}
          onValueChange={(next) => {
            field.handleChange(next)
          }}
        />
      ) : (
        <TreeSelect
          {...common}
          value={typeof value === 'string' ? value : ''}
          onValueChange={(next) => {
            field.handleChange(next)
          }}
        />
      )}
    </VerticalShell>
  )
}

/** Two lists to move items between; the value is the selected values. */
function TransferField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps & ControlProps<typeof TransferList>) {
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
      group
    >
      <TransferList
        value={value ?? []}
        onValueChange={(next) => {
          field.handleChange(next)
          field.handleBlur()
        }}
        aria-labelledby={meta.labelId}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** One image with its preview (avatar, logo, cover); the value is a File, a saved URL, or null. */
function ImageField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps & ControlProps<typeof ImageInput>) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as ImageValue | undefined
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
    >
      <ImageInput
        id={meta.id}
        value={value ?? null}
        onValueChange={(file) => {
          field.handleChange(file)
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

/** Items to put in order (a ranking); the value is the values in their order. */
function SortableField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps & ControlProps<typeof SortableList>) {
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
      group
    >
      <SortableList
        value={value}
        onValueChange={(next) => {
          field.handleChange(next)
          field.handleBlur()
        }}
        aria-labelledby={meta.labelId}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** How often something repeats; the value is a `Recurrence` (see `toRRule`). */
function RecurrenceField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps & ControlProps<typeof RecurrenceInput>) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useSelector(field.store, (s) => s.value) as Recurrence | undefined
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      className={className}
      labelAction={labelAction}
      hideLabel={hideLabel}
    >
      <RecurrenceInput
        id={meta.id}
        value={value ?? { frequency: 'week', interval: 1, weekdays: [1], end: { type: 'never' } }}
        onValueChange={(rule) => {
          field.handleChange(rule)
        }}
        onBlur={field.handleBlur}
        aria-invalid={meta.invalid || undefined}
        aria-describedby={describedBy(meta, description)}
        {...props}
      />
    </VerticalShell>
  )
}

/** An IANA time zone ("Europe/Paris"), searchable, with offsets. */
function TimezoneField({
  label,
  description,
  className,
  labelAction,
  hideLabel,
  ...props
}: VerticalShellProps & ControlProps<typeof TimezoneSelect>) {
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
      <TimezoneSelect
        id={meta.id}
        value={value ?? ''}
        onValueChange={(zone) => {
          field.handleChange(zone)
          field.handleBlur()
        }}
        aria-invalid={meta.invalid || undefined}
        {...props}
      />
    </VerticalShell>
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
    NumberField,
    PasswordField,
    TimeField,
    DateTimeField,
    RadioGroupField,
    MaskedField,
    ColorField,
    RatingField,
    SliderField,
    UnitField,
    DurationField,
    MonthField,
    WeekField,
    SegmentedField,
    RadioCardField,
    CheckboxGroupField,
    KeyValueField,
    ChipField,
    ScaleField,
    NumberRangeField,
    TimeRangeField,
    JsonField,
    MentionField,
    TreeSelectField,
    TransferField,
    ImageField,
    SortableField,
    RecurrenceField,
    TimezoneField,
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
  CheckboxGroupField,
  ChipField,
  ColorField,
  ComboboxField,
  DateField,
  DateRangeField,
  DateTimeField,
  describedBy,
  DurationField,
  FileField,
  FormErrors,
  ImageField,
  JsonField,
  KeyValueField,
  MaskedField,
  MentionField,
  MoneyField,
  MonthField,
  MultiSelectField,
  NumberField,
  NumberRangeField,
  OTPField,
  PasswordField,
  PhoneField,
  RadioCardField,
  RadioGroupField,
  RatingField,
  RecurrenceField,
  ScaleField,
  SegmentedField,
  SelectField,
  SliderField,
  SortableField,
  SubmitButton,
  SwitchField,
  TagsField,
  TextareaField,
  TextField,
  TimeField,
  TimeRangeField,
  TimezoneField,
  TransferField,
  TreeSelectField,
  UnitField,
  useAppForm,
  useFieldContext,
  // For your own field components (see rich-text-field.tsx): ids, errors and the label / description / error frame.
  useFieldMeta,
  useFormContext,
  VerticalShell,
  type VerticalShellProps,
  WeekField,
  withFieldGroup,
  withForm,
}
