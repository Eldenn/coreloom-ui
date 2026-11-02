'use client'

// Coreloom UI — FormRenderer. Builds a form at runtime from a FormSpec, a JSON description of its
// sections and fields, using the Form fields (`useAppForm`). Use it when the form's shape comes from
// data: a settings page your server describes, a survey, a form made in the FormBuilder block.
//
//   const spec: FormSpec = {
//     version: 1,
//     title: 'Contact',
//     sections: [{ id: 'main', columns: 2, fields: [
//       { name: 'email', type: 'email', label: 'Email', required: true },
//       { name: 'topic', type: 'select', label: 'Topic', options: [{ value: 'sales', label: 'Sales' }] },
//       { name: 'company', type: 'text', label: 'Company', visibleWhen: { field: 'topic', op: 'equals', value: 'sales' } },
//     ] }],
//   }
//   <FormRenderer spec={spec} onSubmit={(values) => save(values)} />
//
// A spec received from elsewhere is untrusted: read it with `readFormSpec` first. Field types live in
// `formFieldTypes`; pass `types={{ ...formFieldTypes, mine }}` to add your own. `fromJSONSchema` turns a
// JSON Schema (and a react-jsonschema-form style UI schema) into a FormSpec; `toJSONSchema` goes back.
import {
  AlignLeftIcon,
  AtSignIcon,
  CalendarClockIcon,
  CalendarIcon,
  CalendarRangeIcon,
  ChevronsUpDownIcon,
  CircleDotIcon,
  ClockIcon,
  CoinsIcon,
  HashIcon,
  KeyRoundIcon,
  LinkIcon,
  ListChecksIcon,
  type LucideIcon,
  PaperclipIcon,
  PhoneIcon,
  RectangleEllipsisIcon,
  SquareCheckIcon,
  TagsIcon,
  TextSearchIcon,
  ToggleRightIcon,
  TypeIcon,
} from 'lucide-react'
import * as React from 'react'

import type { DateRange } from '@/components/ui/date-range-picker'
import { FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field'
import {
  CheckboxField,
  ComboboxField,
  DateField,
  DateRangeField,
  DateTimeField,
  FileField,
  MoneyField,
  MultiSelectField,
  NumberField,
  OTPField,
  PasswordField,
  PhoneField,
  RadioGroupField,
  SelectField,
  SwitchField,
  TagsField,
  TextareaField,
  TextField,
  TimeField,
  useAppForm,
} from '@/components/ui/form'
import { isValidPhone } from '@/components/ui/phone-input'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------------------------------
// The format
// ---------------------------------------------------------------------------------------------------

/** One choice of a select, radio or multi-select field. */
interface FormOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

/** How a condition compares the other field's value. */
type FormConditionOp = 'equals' | 'notEquals' | 'in' | 'filled' | 'empty' | 'gt' | 'lt' | 'contains'

/**
 * When a field shows: `{ field, op, value }` compares another field's value (as submitted),
 * `{ all: [...] }` and `{ any: [...] }` combine conditions. A hidden field isn't checked or submitted.
 */
type FormCondition =
  | { field: string; op: FormConditionOp; value?: unknown }
  | { all: FormCondition[] }
  | { any: FormCondition[] }

/**
 * One field. `type` picks the control (see `formFieldTypes`); the settings a type reads (`currency`,
 * `min`, `options`, `accept`…) sit next to the common keys, flat, so a field reads like its props.
 */
interface FormFieldSpec {
  /** The key in the submitted values: letters, digits, `_` or `-`, starting with a letter or `_`. */
  name: string
  type: string
  label: string
  /** Help text under the field. */
  description?: string
  placeholder?: string
  required?: boolean
  /** As submitted: "YYYY-MM-DD" for a date, a number for a number, string[] for a multi-select… */
  defaultValue?: unknown
  /** Columns this field takes in its section's grid (1 by default). */
  span?: 1 | 2 | 3
  visibleWhen?: FormCondition
  minLength?: number
  maxLength?: number
  /** A regular expression the whole value must match, e.g. "[A-Z]{2}\\d{4}". */
  pattern?: string
  /** Shown when `pattern` doesn't match (default: a generic message). */
  patternMessage?: string
  /** Numbers, or "YYYY-MM-DD" / "HH:mm" bounds for dates and times. */
  min?: number | string
  max?: number | string
  minItems?: number
  maxItems?: number
  options?: FormOption[]
  [setting: string]: unknown
}

interface FormSectionSpec {
  /** Unique in the form. */
  id: string
  title?: string
  description?: string
  /** Fields per row from a medium width up (1 by default). */
  columns?: 1 | 2 | 3
  fields: FormFieldSpec[]
}

/** A form as data: what FormRenderer draws and FormBuilder edits. */
interface FormSpec {
  version: 1
  title?: string
  description?: string
  submitLabel?: string
  sections: FormSectionSpec[]
}

/** The submitted values by field name, as JSON (except files, which stay `File[]`). */
type FormValues = Record<string, unknown>

// ---------------------------------------------------------------------------------------------------
// Field types
// ---------------------------------------------------------------------------------------------------

/** A setting the FormBuilder's inspector offers for a type. Its label comes from the i18n messages. */
interface FormFieldSetting {
  key: string
  kind: 'text' | 'number' | 'boolean' | 'select'
  /** For `select`. */
  choices?: readonly { value: string; label: string }[]
}

/** Which checks the FormBuilder offers for a type (they run on any type, from the value's shape). */
type FormFieldCheck = 'length' | 'pattern' | 'range' | 'dateRange' | 'timeRange' | 'items'

interface FormFieldType {
  /** The key fields use in `type`. */
  type: string
  /** The name shown in the builder when the i18n messages have none for this type. */
  label: string
  icon: LucideIcon
  /** Where the builder's palette lists it. */
  group: 'text' | 'number' | 'choice' | 'date' | 'other'
  /** The control's value when nothing is entered. */
  empty: unknown
  /** The field draws its label beside the control (checkbox, switch): no "optional" mark. */
  inline?: boolean
  /** It picks from `options`. */
  hasOptions?: boolean
  placeholder?: boolean
  settings?: readonly FormFieldSetting[]
  checks?: readonly FormFieldCheck[]
  /** The control, inside `form.AppField`. `label` already carries the "optional" mark. */
  render: (field: FormFieldSpec, label: React.ReactNode) => React.ReactNode
  /** Submitted (JSON) value → the control's value. */
  fromJSON?: (value: unknown, field: FormFieldSpec) => unknown
  /** The control's value → the submitted value. */
  toJSON?: (value: unknown, field: FormFieldSpec) => unknown
  /** A check of its own, on the submitted value once it's filled in. */
  validate?: (value: unknown, field: FormFieldSpec) => FormFieldError | undefined
}

type FormFieldTypes = Record<string, FormFieldType>

/** What's wrong with a value: the locale turns it into a sentence. */
type FormFieldError =
  | { type: 'required' | 'checked' | 'email' | 'url' | 'phone' | 'pattern' }
  | {
      type: 'minLength' | 'maxLength' | 'min' | 'max' | 'minItems' | 'maxItems'
      limit: number | string
    }
  | { type: 'dateMin' | 'dateMax' | 'timeMin' | 'timeMax'; limit: string }
  | { type: 'custom'; message: string }

const str = (v: unknown) => (typeof v === 'string' && v !== '' ? v : undefined)
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined)
const bool = (v: unknown) => v === true

const DATE = /^\d{4}-\d{2}-\d{2}$/
const TIME = /^\d{2}:\d{2}$/
const pad = (n: number) => String(n).padStart(2, '0')

/** "YYYY-MM-DD" ↔ a local Date. */
function dateToJSON(value: unknown) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
}
function dateFromJSON(value: unknown) {
  if (typeof value !== 'string' || !DATE.test(value)) return undefined
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}
/** "YYYY-MM-DDTHH:mm" (local time, no zone) ↔ a Date. */
function dateTimeToJSON(value: unknown) {
  const day = dateToJSON(value)
  return day && value instanceof Date
    ? `${day}T${pad(value.getHours())}:${pad(value.getMinutes())}`
    : null
}
function dateTimeFromJSON(value: unknown) {
  if (typeof value !== 'string') return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

const options = (field: FormFieldSpec) => field.options ?? []
const commonProps = (field: FormFieldSpec, label: React.ReactNode) => ({
  label,
  description: field.description,
})

function isWebAddress(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

const textChecks = ['length', 'pattern'] as const

/** The built-in field types: one per Form field. */
const formFieldTypes: FormFieldTypes = {
  text: {
    type: 'text',
    label: 'Text',
    icon: TypeIcon,
    group: 'text',
    empty: '',
    placeholder: true,
    settings: [{ key: 'maxCount', kind: 'number' }],
    checks: textChecks,
    render: (f, label) => (
      <TextField
        {...commonProps(f, label)}
        placeholder={f.placeholder}
        maxCount={num(f.maxCount)}
      />
    ),
  },
  email: {
    type: 'email',
    label: 'Email',
    icon: AtSignIcon,
    group: 'text',
    empty: '',
    placeholder: true,
    checks: textChecks,
    render: (f, label) => (
      <TextField
        {...commonProps(f, label)}
        type="email"
        autoComplete="email"
        placeholder={f.placeholder}
      />
    ),
    validate: (v) =>
      typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? undefined : { type: 'email' },
  },
  url: {
    type: 'url',
    label: 'Web address',
    icon: LinkIcon,
    group: 'text',
    empty: '',
    placeholder: true,
    checks: textChecks,
    render: (f, label) => (
      <TextField {...commonProps(f, label)} type="url" placeholder={f.placeholder} />
    ),
    validate: (v) => (typeof v === 'string' && isWebAddress(v) ? undefined : { type: 'url' }),
  },
  textarea: {
    type: 'textarea',
    label: 'Long text',
    icon: AlignLeftIcon,
    group: 'text',
    empty: '',
    placeholder: true,
    settings: [
      { key: 'rows', kind: 'number' },
      { key: 'maxCount', kind: 'number' },
    ],
    checks: textChecks,
    render: (f, label) => (
      <TextareaField
        {...commonProps(f, label)}
        placeholder={f.placeholder}
        rows={num(f.rows)}
        maxCount={num(f.maxCount)}
      />
    ),
  },
  password: {
    type: 'password',
    label: 'Password',
    icon: KeyRoundIcon,
    group: 'text',
    empty: '',
    placeholder: true,
    checks: textChecks,
    render: (f, label) => (
      <PasswordField
        {...commonProps(f, label)}
        autoComplete="new-password"
        placeholder={f.placeholder}
      />
    ),
  },
  phone: {
    type: 'phone',
    label: 'Phone',
    icon: PhoneIcon,
    group: 'text',
    empty: '',
    placeholder: true,
    settings: [{ key: 'defaultCountry', kind: 'text' }],
    render: (f, label) => (
      <PhoneField
        {...commonProps(f, label)}
        placeholder={f.placeholder}
        defaultCountry={str(f.defaultCountry)}
      />
    ),
    validate: (v) => (typeof v === 'string' && isValidPhone(v) ? undefined : { type: 'phone' }),
  },
  otp: {
    type: 'otp',
    label: 'One-time code',
    icon: RectangleEllipsisIcon,
    group: 'text',
    empty: '',
    settings: [{ key: 'length', kind: 'number' }],
    render: (f, label) => <OTPField {...commonProps(f, label)} length={num(f.length) ?? 6} />,
  },
  number: {
    type: 'number',
    label: 'Number',
    icon: HashIcon,
    group: 'number',
    empty: null,
    placeholder: true,
    settings: [
      { key: 'step', kind: 'number' },
      {
        key: 'stepper',
        kind: 'select',
        choices: [
          { value: 'end', label: 'end' },
          { value: 'sides', label: 'sides' },
          { value: 'none', label: 'none' },
        ],
      },
    ],
    checks: ['range'],
    render: (f, label) => (
      <NumberField
        {...commonProps(f, label)}
        placeholder={f.placeholder}
        min={num(f.min)}
        max={num(f.max)}
        step={num(f.step)}
        stepper={
          f.stepper === 'sides' || f.stepper === 'none' || f.stepper === 'end'
            ? f.stepper
            : undefined
        }
      />
    ),
  },
  money: {
    type: 'money',
    label: 'Amount',
    icon: CoinsIcon,
    group: 'number',
    empty: null,
    placeholder: true,
    settings: [
      { key: 'currency', kind: 'text' },
      { key: 'allowNegative', kind: 'boolean' },
    ],
    checks: ['range'],
    render: (f, label) => (
      <MoneyField
        {...commonProps(f, label)}
        placeholder={f.placeholder}
        currency={str(f.currency) ?? 'EUR'}
        allowNegative={bool(f.allowNegative)}
        min={num(f.min)}
        max={num(f.max)}
      />
    ),
  },
  select: {
    type: 'select',
    label: 'Select',
    icon: ChevronsUpDownIcon,
    group: 'choice',
    empty: '',
    hasOptions: true,
    placeholder: true,
    render: (f, label) => (
      <SelectField {...commonProps(f, label)} options={options(f)} placeholder={f.placeholder} />
    ),
  },
  combobox: {
    type: 'combobox',
    label: 'Searchable select',
    icon: TextSearchIcon,
    group: 'choice',
    empty: '',
    hasOptions: true,
    placeholder: true,
    render: (f, label) => (
      <ComboboxField
        {...commonProps(f, label)}
        options={options(f)}
        placeholder={f.placeholder}
        clearable={!f.required}
      />
    ),
  },
  radio: {
    type: 'radio',
    label: 'Radio buttons',
    icon: CircleDotIcon,
    group: 'choice',
    empty: '',
    hasOptions: true,
    render: (f, label) => <RadioGroupField {...commonProps(f, label)} options={options(f)} />,
  },
  multiselect: {
    type: 'multiselect',
    label: 'Multi-select',
    icon: ListChecksIcon,
    group: 'choice',
    empty: [],
    hasOptions: true,
    placeholder: true,
    checks: ['items'],
    render: (f, label) => (
      <MultiSelectField
        {...commonProps(f, label)}
        options={options(f)}
        placeholder={f.placeholder}
        maxSelected={num(f.maxItems)}
      />
    ),
  },
  tags: {
    type: 'tags',
    label: 'Tags',
    icon: TagsIcon,
    group: 'choice',
    empty: [],
    placeholder: true,
    checks: ['items'],
    render: (f, label) => (
      <TagsField {...commonProps(f, label)} placeholder={f.placeholder} maxTags={num(f.maxItems)} />
    ),
  },
  checkbox: {
    type: 'checkbox',
    label: 'Checkbox',
    icon: SquareCheckIcon,
    group: 'choice',
    empty: false,
    inline: true,
    render: (f, label) => <CheckboxField {...commonProps(f, label)} />,
  },
  switch: {
    type: 'switch',
    label: 'Switch',
    icon: ToggleRightIcon,
    group: 'choice',
    empty: false,
    inline: true,
    render: (f, label) => <SwitchField {...commonProps(f, label)} />,
  },
  date: {
    type: 'date',
    label: 'Date',
    icon: CalendarIcon,
    group: 'date',
    empty: undefined,
    placeholder: true,
    settings: [{ key: 'typing', kind: 'boolean' }],
    checks: ['dateRange'],
    render: (f, label) => {
      const min = dateFromJSON(f.min)
      const max = dateFromJSON(f.max)
      return (
        <DateField
          {...commonProps(f, label)}
          placeholder={f.placeholder}
          typing={bool(f.typing)}
          calendarProps={{
            disabled: [...(min ? [{ before: min }] : []), ...(max ? [{ after: max }] : [])],
          }}
        />
      )
    },
    fromJSON: dateFromJSON,
    toJSON: dateToJSON,
  },
  daterange: {
    type: 'daterange',
    label: 'Date range',
    icon: CalendarRangeIcon,
    group: 'date',
    empty: undefined,
    placeholder: true,
    render: (f, label) => <DateRangeField {...commonProps(f, label)} placeholder={f.placeholder} />,
    fromJSON: (v) => {
      if (typeof v !== 'object' || v === null) return undefined
      const r = v as { from?: unknown; to?: unknown }
      const from = dateFromJSON(r.from)
      return from ? { from, to: dateFromJSON(r.to) } : undefined
    },
    toJSON: (v) => {
      const r = v as DateRange | undefined
      const from = dateToJSON(r?.from)
      return from ? { from, to: dateToJSON(r?.to) } : null
    },
  },
  time: {
    type: 'time',
    label: 'Time',
    icon: ClockIcon,
    group: 'date',
    empty: undefined,
    placeholder: true,
    settings: [{ key: 'step', kind: 'number' }],
    checks: ['timeRange'],
    render: (f, label) => (
      <TimeField
        {...commonProps(f, label)}
        placeholder={f.placeholder}
        step={num(f.step)}
        min={typeof f.min === 'string' && TIME.test(f.min) ? f.min : undefined}
        max={typeof f.max === 'string' && TIME.test(f.max) ? f.max : undefined}
      />
    ),
  },
  datetime: {
    type: 'datetime',
    label: 'Date and time',
    icon: CalendarClockIcon,
    group: 'date',
    empty: undefined,
    render: (f, label) => <DateTimeField {...commonProps(f, label)} />,
    fromJSON: dateTimeFromJSON,
    toJSON: dateTimeToJSON,
  },
  file: {
    type: 'file',
    label: 'File',
    icon: PaperclipIcon,
    group: 'other',
    empty: [],
    settings: [
      { key: 'accept', kind: 'text' },
      { key: 'multiple', kind: 'boolean' },
      { key: 'maxSize', kind: 'number' },
    ],
    checks: ['items'],
    render: (f, label) => (
      <FileField
        {...commonProps(f, label)}
        accept={str(f.accept)}
        multiple={bool(f.multiple)}
        maxSize={num(f.maxSize)}
        maxFiles={num(f.maxItems)}
      />
    ),
    // Files can't come from JSON; they stay File objects in the submitted values.
    fromJSON: () => [],
  },
}

// ---------------------------------------------------------------------------------------------------
// Values, conditions and checks
// ---------------------------------------------------------------------------------------------------

/** Empty: nothing typed, nothing picked, unchecked. */
function isEmptyValue(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    value === false ||
    (Array.isArray(value) && value.length === 0)
  )
}

/** The value a field submits, as JSON: empty optional fields become null (lists stay [], toggles false). */
function toSubmitted(field: FormFieldSpec, value: unknown, types: FormFieldTypes): unknown {
  const type = types[field.type] as FormFieldType | undefined
  const json = type?.toJSON ? type.toJSON(value, field) : value
  if (Array.isArray(type?.empty)) return Array.isArray(json) ? json : []
  if (type?.empty === false) return json === true
  return isEmptyValue(json) ? null : json
}

/** Whether `condition` holds for these submitted values. Missing or broken conditions hold. */
function evaluateCondition(condition: FormCondition | undefined, values: FormValues): boolean {
  if (!condition) return true
  if ('all' in condition) return condition.all.every((c) => evaluateCondition(c, values))
  if ('any' in condition)
    return condition.any.length === 0 || condition.any.some((c) => evaluateCondition(c, values))
  const actual = values[condition.field]
  const expected = condition.value
  switch (condition.op) {
    case 'equals':
      return Array.isArray(actual) ? actual.includes(expected) : actual === expected
    case 'notEquals':
      return Array.isArray(actual) ? !actual.includes(expected) : actual !== expected
    case 'in':
      return Array.isArray(expected) && expected.includes(actual)
    case 'filled':
      return !isEmptyValue(actual)
    case 'empty':
      return isEmptyValue(actual)
    case 'gt':
      return typeof actual === typeof expected && (actual as number) > (expected as number)
    case 'lt':
      return typeof actual === typeof expected && (actual as number) < (expected as number)
    case 'contains':
      return Array.isArray(actual)
        ? actual.includes(expected)
        : typeof actual === 'string' && typeof expected === 'string' && actual.includes(expected)
    default:
      return true
  }
}

function allFields(spec: FormSpec) {
  return spec.sections.flatMap((s) => s.fields)
}

/** Every field's submitted value, hidden ones included (conditions read them). */
function submittedValues(spec: FormSpec, values: FormValues, types: FormFieldTypes): FormValues {
  return Object.fromEntries(
    allFields(spec).map((f) => [f.name, toSubmitted(f, values[f.name], types)]),
  )
}

/** Whether a field shows. A condition on a hidden field holds only if that field would, too. */
function isFieldVisible(
  spec: FormSpec,
  name: string,
  submitted: FormValues,
  seen = new Set<string>(),
): boolean {
  const field = allFields(spec).find((f) => f.name === name)
  if (!field?.visibleWhen || seen.has(name)) return true
  seen.add(name)
  const refs = conditionFields(field.visibleWhen)
  return (
    evaluateCondition(field.visibleWhen, submitted) &&
    refs.every((r) => isFieldVisible(spec, r, submitted, seen))
  )
}

function conditionFields(condition: FormCondition): string[] {
  if ('all' in condition) return condition.all.flatMap(conditionFields)
  if ('any' in condition) return condition.any.flatMap(conditionFields)
  return [condition.field]
}

/** What the form submits: the visible fields, as JSON. */
function formSpecValues(spec: FormSpec, values: FormValues, types = formFieldTypes): FormValues {
  const submitted = submittedValues(spec, values, types)
  return Object.fromEntries(
    allFields(spec)
      .filter((f) => isFieldVisible(spec, f.name, submitted))
      .map((f) => [f.name, submitted[f.name]]),
  )
}

/** The form's starting values (the controls' shape): `defaultValues` (JSON) win over the spec's. */
function initialFormValues(
  spec: FormSpec,
  types: FormFieldTypes = formFieldTypes,
  defaultValues: FormValues = {},
): FormValues {
  return Object.fromEntries(
    allFields(spec).map((f) => {
      const type = types[f.type] as FormFieldType | undefined
      const json = f.name in defaultValues ? defaultValues[f.name] : f.defaultValue
      if (json === undefined || json === null) return [f.name, type?.empty]
      return [f.name, type?.fromJSON ? type.fromJSON(json, f) : json]
    }),
  )
}

const patternCache = new Map<string, RegExp | null>()
function compilePattern(source: string) {
  if (!patternCache.has(source)) {
    try {
      patternCache.set(source, new RegExp(`^(?:${source})$`, 'u'))
    } catch {
      patternCache.set(source, null)
    }
  }
  return patternCache.get(source) ?? null
}

/**
 * Checks one submitted value against its field: required, then the bounds that fit the value's shape
 * (length for text, min / max for numbers, dates and times, item counts for lists), then the type's own check.
 */
function checkFormField(
  field: FormFieldSpec,
  value: unknown,
  types: FormFieldTypes = formFieldTypes,
): FormFieldError | undefined {
  const type = types[field.type] as FormFieldType | undefined
  if (isEmptyValue(value)) {
    if (!field.required) return undefined
    return { type: type?.empty === false ? 'checked' : 'required' }
  }
  if (typeof value === 'string') {
    const isDate =
      DATE.test(value) && (field.type === 'date' || type?.checks?.includes('dateRange'))
    const isTime = TIME.test(value) && type?.checks?.includes('timeRange')
    if (isDate || isTime) {
      const prefix = isDate ? 'date' : 'time'
      if (typeof field.min === 'string' && value < field.min)
        return { type: `${prefix}Min`, limit: field.min }
      if (typeof field.max === 'string' && value > field.max)
        return { type: `${prefix}Max`, limit: field.max }
    } else {
      const length = value.length
      if (field.minLength !== undefined && length < field.minLength)
        return { type: 'minLength', limit: field.minLength }
      if (field.maxLength !== undefined && length > field.maxLength)
        return { type: 'maxLength', limit: field.maxLength }
      const re = field.pattern ? compilePattern(field.pattern) : null
      if (re && !re.test(value))
        return field.patternMessage
          ? { type: 'custom', message: field.patternMessage }
          : { type: 'pattern' }
    }
  }
  if (typeof value === 'number') {
    if (typeof field.min === 'number' && value < field.min) return { type: 'min', limit: field.min }
    if (typeof field.max === 'number' && value > field.max) return { type: 'max', limit: field.max }
  }
  if (Array.isArray(value)) {
    if (field.minItems !== undefined && value.length < field.minItems)
      return { type: 'minItems', limit: field.minItems }
    if (field.maxItems !== undefined && value.length > field.maxItems)
      return { type: 'maxItems', limit: field.maxItems }
  }
  return type?.validate?.(value, field)
}

// ---------------------------------------------------------------------------------------------------
// Reading a spec from untrusted JSON
// ---------------------------------------------------------------------------------------------------

/** Something `readFormSpec` fixed or dropped, with where (`sections[0].fields[2]`). */
interface FormSpecIssue {
  path: string
  code:
    | 'notObject'
    | 'missingName'
    | 'duplicateName'
    | 'unknownType'
    | 'noOptions'
    | 'badCondition'
    | 'tooMany'
  detail?: string
}

const NAME = /^[A-Za-z_][\w-]{0,63}$/
const MAX_FIELDS = 200
const OPS = new Set<FormConditionOp>([
  'equals',
  'notEquals',
  'in',
  'filled',
  'empty',
  'gt',
  'lt',
  'contains',
])
const COMMON_KEYS = new Set([
  'name',
  'type',
  'label',
  'description',
  'placeholder',
  'required',
  'defaultValue',
  'span',
  'visibleWhen',
  'minLength',
  'maxLength',
  'pattern',
  'patternMessage',
  'min',
  'max',
  'minItems',
  'maxItems',
  'options',
])

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)
const count = (v: unknown) =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0 ? v : undefined
const columnsOf = (v: unknown) => (v === 2 || v === 3 ? v : v === 1 ? 1 : undefined)
const isJSONScalar = (v: unknown) =>
  v === null || ['string', 'number', 'boolean'].includes(typeof v)

function readCondition(value: unknown, depth = 0): FormCondition | undefined {
  if (!isRecord(value) || depth > 4) return undefined
  if (Array.isArray(value.all) || Array.isArray(value.any)) {
    const key = Array.isArray(value.all) ? 'all' : 'any'
    const list = (value[key] as unknown[])
      .map((c) => readCondition(c, depth + 1))
      .filter((c): c is FormCondition => c !== undefined)
    return key === 'all' ? { all: list } : { any: list }
  }
  const field = str(value.field)
  const op = (str(value.op) ?? 'equals') as FormConditionOp
  if (!field || !OPS.has(op)) return undefined
  const v = value.value
  const ok = isJSONScalar(v) || (Array.isArray(v) && v.every(isJSONScalar)) || v === undefined
  return ok ? { field, op, ...(v === undefined ? {} : { value: v }) } : undefined
}

function readOptions(value: unknown): FormOption[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  return (value as unknown[]).flatMap((o): FormOption[] => {
    const option: FormOption | undefined =
      typeof o === 'string' && o
        ? { value: o, label: o }
        : isRecord(o) && (typeof o.value === 'string' || typeof o.value === 'number')
          ? {
              value: String(o.value),
              label: str(o.label) ?? String(o.value),
              ...(str(o.description) ? { description: str(o.description) } : {}),
              ...(o.disabled === true ? { disabled: true } : {}),
            }
          : undefined
    if (!option || option.value === '' || seen.has(option.value)) return []
    seen.add(option.value)
    return [option]
  })
}

/**
 * Reads a FormSpec from untrusted JSON (a server's answer, a model's output, a pasted file): keeps what
 * is well formed, fixes what it can and says so in `issues`. Unknown types become text; fields without a
 * usable name are dropped; names are unique; at most 200 fields. `{ title, fields: [...] }` (one section,
 * as ToolForm takes) is accepted too.
 */
function readFormSpec(
  value: unknown,
  types: FormFieldTypes = formFieldTypes,
): { spec: FormSpec; issues: FormSpecIssue[] } {
  const issues: FormSpecIssue[] = []
  const spec: FormSpec = { version: 1, sections: [] }
  if (!isRecord(value)) {
    issues.push({ path: '', code: 'notObject' })
    return { spec, issues }
  }
  if (str(value.title)) spec.title = str(value.title)
  if (str(value.description)) spec.description = str(value.description)
  if (str(value.submitLabel)) spec.submitLabel = str(value.submitLabel)
  const rawSections: unknown[] = Array.isArray(value.sections)
    ? value.sections
    : Array.isArray(value.fields)
      ? [{ id: 'main', fields: value.fields }]
      : []
  const names = new Set<string>()
  const ids = new Set<string>()
  let total = 0
  rawSections.forEach((rawSection, si) => {
    const sPath = Array.isArray(value.sections) ? `sections[${si}]` : ''
    if (!isRecord(rawSection)) {
      issues.push({ path: sPath, code: 'notObject' })
      return
    }
    let id = str(rawSection.id) ?? `section-${si + 1}`
    while (ids.has(id)) id = `${id}-${si + 1}`
    ids.add(id)
    const section: FormSectionSpec = { id, fields: [] }
    if (str(rawSection.title)) section.title = str(rawSection.title)
    if (str(rawSection.description)) section.description = str(rawSection.description)
    const columns = columnsOf(rawSection.columns)
    if (columns) section.columns = columns
    const rawFields = Array.isArray(rawSection.fields) ? (rawSection.fields as unknown[]) : []
    rawFields.forEach((raw, fi) => {
      const path = `${sPath ? `${sPath}.` : ''}fields[${fi}]`
      if (!isRecord(raw)) {
        issues.push({ path, code: 'notObject' })
        return
      }
      const name = str(raw.name)
      if (!name || !NAME.test(name)) {
        issues.push({ path, code: 'missingName', detail: name })
        return
      }
      if (names.has(name)) {
        issues.push({ path, code: 'duplicateName', detail: name })
        return
      }
      if (total >= MAX_FIELDS) {
        if (total === MAX_FIELDS) issues.push({ path, code: 'tooMany' })
        total++
        return
      }
      total++
      names.add(name)
      let type = str(raw.type) ?? 'text'
      if (!(type in types)) {
        issues.push({ path, code: 'unknownType', detail: type })
        type = 'text'
      }
      const field: FormFieldSpec = { name, type, label: str(raw.label) ?? name }
      for (const key of ['description', 'placeholder', 'pattern', 'patternMessage'] as const)
        if (str(raw[key])) field[key] = str(raw[key])
      if (raw.required === true) field.required = true
      for (const key of ['minLength', 'maxLength', 'minItems', 'maxItems'] as const)
        if (count(raw[key]) !== undefined) field[key] = count(raw[key])
      for (const key of ['min', 'max'] as const)
        if (num(raw[key]) !== undefined || str(raw[key])) field[key] = raw[key] as number | string
      const span = columnsOf(raw.span)
      if (span && span > 1) field.span = span
      if (raw.defaultValue !== undefined) field.defaultValue = raw.defaultValue
      if (types[type].hasOptions) {
        field.options = readOptions(raw.options)
        if (!field.options.length) issues.push({ path, code: 'noOptions', detail: name })
      }
      if (raw.visibleWhen !== undefined) {
        const condition = readCondition(raw.visibleWhen)
        if (condition) field.visibleWhen = condition
        else issues.push({ path, code: 'badCondition', detail: name })
      }
      // Type settings: kept as long as they are plain JSON scalars.
      for (const [key, v] of Object.entries(raw))
        if (!COMMON_KEYS.has(key) && isJSONScalar(v) && v !== null) field[key] = v
      section.fields.push(field)
    })
    spec.sections.push(section)
  })
  if (!spec.sections.length) spec.sections.push({ id: 'main', fields: [] })
  // A condition on a field that doesn't exist would hide its field forever.
  for (const section of spec.sections)
    for (const field of section.fields)
      if (field.visibleWhen && conditionFields(field.visibleWhen).some((n) => !names.has(n))) {
        delete field.visibleWhen
        issues.push({ path: field.name, code: 'badCondition', detail: field.name })
      }
  return { spec, issues }
}

// ---------------------------------------------------------------------------------------------------
// JSON Schema
// ---------------------------------------------------------------------------------------------------

type JSONSchema = Record<string, unknown>

const FORMATS: Record<string, string> = {
  email: 'email',
  uri: 'url',
  url: 'url',
  date: 'date',
  'date-time': 'datetime',
  time: 'time',
  password: 'password',
}
const WIDGETS: Record<string, string> = {
  textarea: 'textarea',
  password: 'password',
  radio: 'radio',
  select: 'select',
  checkbox: 'checkbox',
  checkboxes: 'multiselect',
  email: 'email',
  uri: 'url',
  date: 'date',
  'date-time': 'datetime',
  time: 'time',
  updown: 'number',
  range: 'number',
  file: 'file',
}

function schemaOptions(schema: JSONSchema): FormOption[] {
  if (Array.isArray(schema.enum))
    return readOptions(
      (schema.enum as unknown[]).map((v, i) => ({
        value: v,
        label: Array.isArray(schema.enumNames) ? (schema.enumNames as unknown[])[i] : v,
      })),
    )
  const list = Array.isArray(schema.oneOf) ? schema.oneOf : schema.anyOf
  if (Array.isArray(list))
    return readOptions(
      (list as unknown[]).filter(isRecord).map((o) => ({ value: o.const, label: o.title })),
    )
  return []
}

/**
 * Turns an object JSON Schema into a FormSpec: a field per property (strings by `format`, enums and
 * `oneOf` consts as selects, numbers, booleans, arrays as multi-selects or tags), `required`, titles,
 * descriptions, defaults and bounds. An optional UI schema (react-jsonschema-form style) sets
 * `ui:order`, `ui:widget` (theirs, or any of our type names), `ui:placeholder`, `ui:help`, `ui:options`.
 * Nested objects become sections; their fields stay flat in the values.
 */
function fromJSONSchema(
  schema: unknown,
  uiSchema: unknown = {},
  types: FormFieldTypes = formFieldTypes,
): { spec: FormSpec; issues: FormSpecIssue[] } {
  if (!isRecord(schema)) return readFormSpec(undefined, types)
  const ui = isRecord(uiSchema) ? uiSchema : {}
  const sections: Record<string, unknown>[] = []
  const toFields = (obj: JSONSchema, objUi: Record<string, unknown>) => {
    const props = isRecord(obj.properties) ? obj.properties : {}
    const required = new Set(Array.isArray(obj.required) ? (obj.required as unknown[]) : [])
    const order = Array.isArray(objUi['ui:order']) ? (objUi['ui:order'] as unknown[]) : []
    const keys = Object.keys(props).sort((a, b) => {
      const rank = (k: string) => {
        const i = order.indexOf(k)
        const rest = order.indexOf('*')
        return i === -1 ? (rest === -1 ? order.length : rest) : i
      }
      return rank(a) - rank(b)
    })
    const fields: Record<string, unknown>[] = []
    for (const name of keys) {
      const p = props[name]
      if (!isRecord(p)) continue
      const pUi = isRecord(objUi[name]) ? objUi[name] : {}
      if (p.type === 'object') {
        sections.push({
          id: name,
          title: str(p.title) ?? name,
          description: str(p.description),
          fields: toFields(p, pUi),
        })
        continue
      }
      const items = isRecord(p.items) ? p.items : {}
      const widget = str(pUi['ui:widget'])
      const opts = schemaOptions(p.type === 'array' ? items : p)
      let type =
        p.type === 'boolean'
          ? 'checkbox'
          : p.type === 'number' || p.type === 'integer'
            ? 'number'
            : p.type === 'array'
              ? opts.length
                ? 'multiselect'
                : 'tags'
              : opts.length
                ? 'select'
                : (FORMATS[str(p.format) ?? ''] ?? 'text')
      if (widget) type = widget in types ? widget : (WIDGETS[widget] ?? type)
      const uiOptions = isRecord(pUi['ui:options']) ? pUi['ui:options'] : {}
      fields.push({
        ...uiOptions,
        name,
        type,
        label: str(p.title) ?? name,
        description: str(pUi['ui:help']) ?? str(p.description),
        placeholder: str(pUi['ui:placeholder']),
        required: required.has(name) || undefined,
        defaultValue: p.default,
        minLength: p.minLength,
        maxLength: p.maxLength,
        pattern: p.pattern,
        min: p.minimum ?? p.formatMinimum,
        max: p.maximum ?? p.formatMaximum,
        step: p.multipleOf ?? (p.type === 'integer' ? 1 : undefined),
        minItems: p.minItems,
        maxItems: p.maxItems,
        options: opts.length ? opts : undefined,
      })
    }
    return fields
  }
  const rootFields = toFields(schema, ui)
  return readFormSpec(
    {
      title: schema.title,
      description: schema.description,
      sections: [
        ...(rootFields.length || !sections.length ? [{ id: 'main', fields: rootFields }] : []),
        ...sections,
      ],
    },
    types,
  )
}

/** A JSON Schema (draft 2020-12) for what the form submits, plus the UI schema that rebuilds it. */
function toJSONSchema(spec: FormSpec): { schema: JSONSchema; uiSchema: Record<string, unknown> } {
  const properties: Record<string, JSONSchema> = {}
  const uiSchema: Record<string, unknown> = { 'ui:order': allFields(spec).map((f) => f.name) }
  const required: string[] = []
  for (const f of allFields(spec)) {
    const opts = f.options?.map((o) => ({ const: o.value, title: o.label }))
    const base: JSONSchema = {
      title: f.label,
      ...(f.description ? { description: f.description } : {}),
    }
    let p: JSONSchema
    switch (f.type) {
      case 'number':
      case 'money':
        p = { ...base, type: 'number', minimum: f.min, maximum: f.max, multipleOf: f.step }
        break
      case 'checkbox':
      case 'switch':
        p = { ...base, type: 'boolean' }
        break
      case 'multiselect':
      case 'tags':
        p = {
          ...base,
          type: 'array',
          items: opts ? { oneOf: opts } : { type: 'string' },
          minItems: f.minItems,
          maxItems: f.maxItems,
        }
        break
      case 'daterange':
        p = {
          ...base,
          type: 'object',
          properties: {
            from: { type: 'string', format: 'date' },
            to: { type: ['string', 'null'], format: 'date' },
          },
        }
        break
      case 'file':
        p = { ...base, type: 'array', items: { type: 'string', contentEncoding: 'binary' } }
        break
      default:
        p = {
          ...base,
          type: 'string',
          ...(opts ? { oneOf: opts } : {}),
          format: { email: 'email', url: 'uri', date: 'date', datetime: 'date-time', time: 'time' }[
            f.type
          ],
          minLength: f.minLength,
          maxLength: f.maxLength,
          pattern: f.pattern,
          ...(typeof f.min === 'string' ? { formatMinimum: f.min } : {}),
          ...(typeof f.max === 'string' ? { formatMaximum: f.max } : {}),
        }
    }
    if (f.defaultValue !== undefined) p.default = f.defaultValue
    properties[f.name] = Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined))
    if (f.required) required.push(f.name)
    uiSchema[f.name] = Object.fromEntries(
      Object.entries({ 'ui:widget': f.type, 'ui:placeholder': f.placeholder }).filter(
        ([, v]) => v !== undefined,
      ),
    )
  }
  return {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      ...(spec.title ? { title: spec.title } : {}),
      ...(spec.description ? { description: spec.description } : {}),
      properties,
      ...(required.length ? { required } : {}),
    },
    uiSchema,
  }
}

// ---------------------------------------------------------------------------------------------------
// The renderer
// ---------------------------------------------------------------------------------------------------

const GRID: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 @lg:grid-cols-2',
  3: 'grid-cols-1 @lg:grid-cols-2 @3xl:grid-cols-3',
}
const SPAN: Record<number, string> = {
  1: '',
  2: '@lg:col-span-2',
  3: '@lg:col-span-2 @3xl:col-span-3',
}

/** The classes a field takes in a grid of `columns` (used by FormBuilder's canvas too). */
function fieldSpanClass(field: FormFieldSpec, columns = 1) {
  return SPAN[Math.min(field.span ?? 1, columns)]
}

interface FormRendererProps {
  spec: FormSpec
  /** Field types by key; defaults to `formFieldTypes`. */
  types?: FormFieldTypes
  /** Starting values (as submitted: dates as "YYYY-MM-DD"…), over the spec's `defaultValue`s. */
  defaultValues?: FormValues
  /** The visible fields' values, as JSON (files stay `File[]`). Return a promise to show a spinner. */
  onSubmit?: (values: FormValues) => void | Promise<void>
  /** Every change, as `onSubmit` would get them. */
  onValuesChange?: (values: FormValues) => void
  /** Over the spec's `submitLabel` (default "Submit"). */
  submitLabel?: React.ReactNode
  /** Leaves out the spec's title and description (when the page already shows them). */
  hideHeader?: boolean
  hideSubmit?: boolean
  /** Shows fields whose condition is false (FormBuilder's canvas). */
  showHidden?: boolean
  /** Wraps each field (FormBuilder's canvas makes them selectable). */
  renderField?: (field: FormFieldSpec, node: React.ReactNode, visible: boolean) => React.ReactNode
  /** Wraps each section's grid of fields. */
  renderSection?: (section: FormSectionSpec, node: React.ReactNode) => React.ReactNode
  className?: string
}

/** Draws a FormSpec as a form. A new spec starts the form over (fresh values). */
function FormRenderer(props: FormRendererProps) {
  // The fields, their order and their defaults all come from the spec: a changed spec is a new form.
  const key = React.useMemo(() => JSON.stringify(props.spec), [props.spec])
  return <SpecForm key={key} {...props} />
}

function SpecForm({
  spec,
  types = formFieldTypes,
  defaultValues,
  onSubmit,
  onValuesChange,
  submitLabel,
  hideHeader = false,
  hideSubmit = false,
  showHidden = false,
  renderField,
  renderSection,
  className,
}: FormRendererProps) {
  const { messages } = useCoreloomI18n()
  const t = messages.formRenderer
  const [initial] = React.useState(() => initialFormValues(spec, types, defaultValues))
  const form = useAppForm({
    defaultValues: initial,
    onSubmit: async ({ value }) => {
      await onSubmit?.(formSpecValues(spec, value, types))
    },
  })
  const headingId = React.useId()

  const errorText = (e: FormFieldError): string => {
    switch (e.type) {
      case 'custom':
        return e.message
      case 'minLength':
      case 'maxLength':
      case 'minItems':
      case 'maxItems':
      case 'min':
      case 'max':
        return t.errors[e.type](String(e.limit))
      case 'dateMin':
      case 'dateMax':
      case 'timeMin':
      case 'timeMax':
        return t.errors[e.type](e.limit)
      default:
        return t.errors[e.type]
    }
  }

  return (
    <form
      noValidate
      aria-labelledby={!hideHeader && spec.title ? headingId : undefined}
      className={cn('@container flex flex-col gap-6', className)}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      {!hideHeader && (spec.title ?? spec.description) && (
        <header className="flex flex-col gap-1">
          {spec.title && (
            <h2 id={headingId} className="font-display text-lg font-semibold text-foreground">
              {spec.title}
            </h2>
          )}
          {spec.description && (
            <p className="text-[13px] text-muted-foreground">{spec.description}</p>
          )}
        </header>
      )}
      {onValuesChange && (
        <form.Subscribe selector={(s) => s.values}>
          {(values) => (
            <ValuesListener
              values={formSpecValues(spec, values, types)}
              onChange={onValuesChange}
            />
          )}
        </form.Subscribe>
      )}
      <form.Subscribe selector={(s) => s.values}>
        {(values) => {
          const submitted = submittedValues(spec, values, types)
          return spec.sections.map((section) => {
            const columns = section.columns ?? 1
            const grid = (
              <div className={cn('grid gap-5', GRID[columns])}>
                {section.fields.map((field) => {
                  const visible = isFieldVisible(spec, field.name, submitted)
                  if (!visible && !showHidden) return null
                  const type = types[field.type] as FormFieldType | undefined
                  const label =
                    field.required || type?.inline ? (
                      field.label
                    ) : (
                      <>
                        {field.label}
                        <span className="font-normal text-muted-foreground"> ({t.optional})</span>
                      </>
                    )
                  const node = (
                    <div key={field.name} className={fieldSpanClass(field, columns)}>
                      {type ? (
                        <form.AppField
                          name={field.name}
                          validators={{
                            onChange: ({ fieldApi }) => {
                              const all = submittedValues(spec, fieldApi.form.state.values, types)
                              if (!isFieldVisible(spec, field.name, all)) return undefined
                              const error = checkFormField(field, all[field.name], types)
                              return error ? errorText(error) : undefined
                            },
                          }}
                        >
                          {() => type.render(field, label)}
                        </form.AppField>
                      ) : (
                        <p className="rounded-md border border-dashed border-border px-3 py-2 text-[13px] text-muted-foreground">
                          {t.unknownType(field.type)}
                        </p>
                      )}
                    </div>
                  )
                  return renderField ? (
                    <React.Fragment key={field.name}>
                      {renderField(field, node, visible)}
                    </React.Fragment>
                  ) : (
                    node
                  )
                })}
              </div>
            )
            const body = renderSection ? renderSection(section, grid) : grid
            return section.title || section.description ? (
              <FieldSet key={section.id}>
                {section.title && <FieldLegend>{section.title}</FieldLegend>}
                {section.description && <FieldDescription>{section.description}</FieldDescription>}
                {body}
              </FieldSet>
            ) : (
              <React.Fragment key={section.id}>{body}</React.Fragment>
            )
          })
        }}
      </form.Subscribe>
      {!hideSubmit && (
        <form.AppForm>
          <form.FormErrors />
          <div>
            <form.SubmitButton>{submitLabel ?? spec.submitLabel ?? t.submit}</form.SubmitButton>
          </div>
        </form.AppForm>
      )}
    </form>
  )
}

/** Calls `onChange` after a render where the values changed (not during it). */
function ValuesListener({
  values,
  onChange,
}: {
  values: FormValues
  onChange: (values: FormValues) => void
}) {
  // Compared as JSON so a re-render with equal values doesn't call back (File objects compare as {}).
  const json = JSON.stringify(values)
  const latest = React.useRef({ values, onChange })
  React.useEffect(() => {
    latest.current = { values, onChange }
  })
  React.useEffect(() => {
    latest.current.onChange(latest.current.values)
  }, [json])
  return null
}

export {
  checkFormField,
  evaluateCondition,
  fieldSpanClass,
  type FormCondition,
  type FormConditionOp,
  type FormFieldCheck,
  type FormFieldError,
  type FormFieldSetting,
  type FormFieldSpec,
  type FormFieldType,
  type FormFieldTypes,
  formFieldTypes,
  type FormOption,
  FormRenderer,
  type FormRendererProps,
  type FormSectionSpec,
  type FormSpec,
  type FormSpecIssue,
  formSpecValues,
  type FormValues,
  fromJSONSchema,
  initialFormValues,
  isFieldVisible,
  type JSONSchema,
  readFormSpec,
  toJSONSchema,
}
