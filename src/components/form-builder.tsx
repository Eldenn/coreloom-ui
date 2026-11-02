'use client'

// Coreloom UI — FormBuilder (block). Makes a form without code: pick fields from a palette, arrange
// them on a live canvas, set each one in the inspector, try it in Preview and read or paste its JSON.
// What it edits is a FormSpec, the same JSON FormRenderer draws, so a form built here can be stored
// and shown anywhere with `<FormRenderer spec={spec} />`.
//
//   const [spec, setSpec] = React.useState<FormSpec>(savedSpec)
//   <FormBuilder value={spec} onValueChange={setSpec} />
//
// Your own field types: pass `types={{ ...formFieldTypes, mine }}` to both FormBuilder and FormRenderer.
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  CheckIcon,
  CopyIcon,
  CopyPlusIcon,
  EyeOffIcon,
  GripVerticalIcon,
  PlusIcon,
  SplitIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from 'lucide-react'
import * as React from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import {
  fieldSpanClass,
  type FormCondition,
  type FormConditionOp,
  type FormFieldSpec,
  type FormFieldType,
  type FormFieldTypes,
  formFieldTypes,
  FormRenderer,
  type FormSectionSpec,
  type FormSpec,
  type FormSpecIssue,
  type FormValues,
  fromJSONSchema,
  readFormSpec,
  toJSONSchema,
} from '@/components/ui/form-renderer'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { type Messages, useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type T = Messages['formBuilder']

// ---------------------------------------------------------------------------------------------------
// Editing a spec (pure: each returns a new spec)
// ---------------------------------------------------------------------------------------------------

const NAME = /^[A-Za-z_][\w-]{0,63}$/

function fieldNames(spec: FormSpec) {
  return spec.sections.flatMap((s) => s.fields.map((f) => f.name))
}

function uniqueName(spec: FormSpec, base: string) {
  const names = new Set(fieldNames(spec))
  let n = 1
  while (names.has(`${base}_${n}`)) n++
  return `${base}_${n}`
}

/** Drops keys set to undefined, so a cleared setting leaves the JSON instead of staying as null. */
function withoutUndefined<O extends object>(o: O): O {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as O
}

function mapFields(spec: FormSpec, fn: (f: FormFieldSpec) => FormFieldSpec): FormSpec {
  return { ...spec, sections: spec.sections.map((s) => ({ ...s, fields: s.fields.map(fn) })) }
}

function renameInCondition(c: FormCondition, from: string, to: string): FormCondition {
  if ('all' in c) return { all: c.all.map((x) => renameInCondition(x, from, to)) }
  if ('any' in c) return { any: c.any.map((x) => renameInCondition(x, from, to)) }
  return c.field === from ? { ...c, field: to } : c
}

function dropFromCondition(c: FormCondition, name: string): FormCondition | undefined {
  if ('all' in c || 'any' in c) {
    const list = ('all' in c ? c.all : c.any)
      .map((x) => dropFromCondition(x, name))
      .filter((x): x is FormCondition => x !== undefined)
    if (!list.length) return undefined
    return 'all' in c ? { all: list } : { any: list }
  }
  return c.field === name ? undefined : c
}

/** Adds `field` after `after` (or at the end of `sectionId`, or of the last section). */
function addFormField(
  spec: FormSpec,
  field: FormFieldSpec,
  at: { sectionId?: string; after?: string } = {},
): FormSpec {
  const sections = spec.sections.length ? spec.sections : [{ id: 'main', fields: [] }]
  const bySection = at.after
    ? sections.findIndex((s) => s.fields.some((f) => f.name === at.after))
    : sections.findIndex((s) => s.id === at.sectionId)
  const target = bySection === -1 ? sections.length - 1 : bySection
  return {
    ...spec,
    sections: sections.map((s, i) => {
      if (i !== target) return s
      const index = at.after ? s.fields.findIndex((f) => f.name === at.after) + 1 : s.fields.length
      return { ...s, fields: [...s.fields.slice(0, index), field, ...s.fields.slice(index)] }
    }),
  }
}

/** Changes a field; a new `name` is carried into the conditions that read it. */
function updateFormField(spec: FormSpec, name: string, patch: Partial<FormFieldSpec>): FormSpec {
  const renamed = patch.name !== undefined && patch.name !== name ? patch.name : undefined
  return mapFields(spec, (f) => {
    const next = f.name === name ? withoutUndefined({ ...f, ...patch }) : f
    return renamed && next.visibleWhen
      ? { ...next, visibleWhen: renameInCondition(next.visibleWhen, name, renamed) }
      : next
  })
}

/** Removes a field and the conditions that read it. */
function removeFormField(spec: FormSpec, name: string): FormSpec {
  return {
    ...spec,
    sections: spec.sections.map((s) => ({
      ...s,
      fields: s.fields
        .filter((f) => f.name !== name)
        .map((f) => {
          if (!f.visibleWhen) return f
          const visibleWhen = dropFromCondition(f.visibleWhen, name)
          const { visibleWhen: _, ...rest } = f
          return visibleWhen ? { ...rest, visibleWhen } : rest
        }),
    })),
  }
}

/** Moves a field to `index` in section `sectionId`. */
function moveFormField(spec: FormSpec, name: string, sectionId: string, index: number): FormSpec {
  const field = spec.sections.flatMap((s) => s.fields).find((f) => f.name === name)
  if (!field) return spec
  const from = spec.sections.find((s) => s.fields.includes(field))
  if (from?.id === sectionId) {
    const oldIndex = from.fields.indexOf(field)
    return {
      ...spec,
      sections: spec.sections.map((s) =>
        s.id === sectionId ? { ...s, fields: arrayMove(s.fields, oldIndex, index) } : s,
      ),
    }
  }
  return {
    ...spec,
    sections: spec.sections.map((s) => {
      if (s.id === sectionId) {
        const fields = [...s.fields]
        fields.splice(Math.min(index, fields.length), 0, field)
        return { ...s, fields }
      }
      return { ...s, fields: s.fields.filter((f) => f !== field) }
    }),
  }
}

function updateSection(spec: FormSpec, id: string, patch: Partial<FormSectionSpec>): FormSpec {
  return {
    ...spec,
    sections: spec.sections.map((s) => {
      if (s.id !== id) return s
      return withoutUndefined({ ...s, ...patch })
    }),
  }
}

/** Removes a section; its fields move to the section before it (or after it, for the first). */
function removeSection(spec: FormSpec, id: string): FormSpec {
  const index = spec.sections.findIndex((s) => s.id === id)
  if (index === -1 || spec.sections.length < 2) return spec
  const heir = index === 0 ? 1 : index - 1
  const moved = spec.sections[index].fields
  return {
    ...spec,
    sections: spec.sections
      .map((s, i) => (i === heir ? { ...s, fields: [...s.fields, ...moved] } : s))
      .filter((_, i) => i !== index),
  }
}

function newField(spec: FormSpec, type: FormFieldType, t: T): FormFieldSpec {
  const field: FormFieldSpec = {
    name: uniqueName(spec, type.type),
    type: type.type,
    label: typeLabel(type, t),
  }
  if (type.hasOptions)
    field.options = [1, 2].map((n) => ({ value: `option-${n}`, label: t.newOption(n) }))
  return field
}

const typeLabel = (type: FormFieldType, t: T) => t.types[type.type] ?? type.label
const EMPTY: FormSpec = { version: 1, sections: [{ id: 'main', fields: [] }] }

// ---------------------------------------------------------------------------------------------------
// The block
// ---------------------------------------------------------------------------------------------------

type Selection =
  { kind: 'form' } | { kind: 'section'; id: string } | { kind: 'field'; name: string }

interface FormBuilderProps {
  /** The form being edited (controlled). */
  value?: FormSpec
  /** The starting form when uncontrolled (an empty one by default). */
  defaultValue?: FormSpec
  onValueChange?: (spec: FormSpec) => void
  /** Field types by key; defaults to `formFieldTypes`. Pass the same to FormRenderer. */
  types?: FormFieldTypes
  /** Called with the values when the form is sent in Preview. */
  onPreviewSubmit?: (values: FormValues) => void
  className?: string
}

function FormBuilder({
  value,
  defaultValue,
  onValueChange,
  types = formFieldTypes,
  onPreviewSubmit,
  className,
}: FormBuilderProps) {
  const t = useCoreloomI18n().messages.formBuilder
  const [inner, setInner] = React.useState<FormSpec>(defaultValue ?? EMPTY)
  const spec = value ?? inner
  const setSpec = (next: FormSpec) => {
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }
  const [selection, setSelection] = React.useState<Selection>({ kind: 'form' })
  const [tab, setTab] = React.useState('build')
  const [issues, setIssues] = React.useState<FormSpecIssue[]>([])

  const selectedField =
    selection.kind === 'field'
      ? spec.sections.flatMap((s) => s.fields).find((f) => f.name === selection.name)
      : undefined
  const selectedSection =
    selection.kind === 'section'
      ? spec.sections.find((s) => s.id === selection.id)
      : selection.kind === 'field'
        ? spec.sections.find((s) => s.fields.some((f) => f.name === selection.name))
        : undefined

  const add = (type: FormFieldType) => {
    const field = newField(spec, type, t)
    setSpec(
      addFormField(spec, field, {
        after: selectedField?.name,
        sectionId: selectedSection?.id,
      }),
    )
    setSelection({ kind: 'field', name: field.name })
  }

  const load = (next: { spec: FormSpec; issues: FormSpecIssue[] }) => {
    setSpec(next.spec)
    setIssues(next.issues)
    setSelection({ kind: 'form' })
  }

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      aria-label={t.label}
      className={cn('flex flex-col gap-4', className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="build">{t.tabs.build}</TabsTrigger>
          <TabsTrigger value="preview">{t.tabs.preview}</TabsTrigger>
          <TabsTrigger value="json">{t.tabs.json}</TabsTrigger>
        </TabsList>
        <ImportDialog t={t} types={types} onImport={load} />
      </div>
      {issues.length > 0 && <IssuesAlert t={t} issues={issues} onDismiss={() => setIssues([])} />}
      <TabsContent value="build">
        <div className="grid gap-4 lg:grid-cols-[13rem_minmax(0,1fr)_18rem]">
          <Palette t={t} types={types} onAdd={add} />
          <Canvas
            t={t}
            spec={spec}
            types={types}
            selection={selection}
            onSelect={setSelection}
            onChange={setSpec}
          />
          <Inspector
            t={t}
            spec={spec}
            types={types}
            selection={selection}
            field={selectedField}
            section={selection.kind === 'section' ? selectedSection : undefined}
            onSelect={setSelection}
            onChange={setSpec}
          />
        </div>
      </TabsContent>
      <TabsContent value="preview">
        <Preview t={t} spec={spec} types={types} onSubmit={onPreviewSubmit} />
      </TabsContent>
      <TabsContent value="json">
        <JsonView t={t} spec={spec} types={types} onApply={load} />
      </TabsContent>
    </Tabs>
  )
}

function IssuesAlert({
  t,
  issues,
  onDismiss,
}: {
  t: T
  issues: FormSpecIssue[]
  onDismiss: () => void
}) {
  const closeLabel = useCoreloomI18n().messages.common.close
  return (
    <Alert variant="warning" className="relative pr-10">
      <AlertTitle>{t.json.issues(issues.length)}</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-4">
          {issues.slice(0, 8).map((issue, i) => (
            // eslint-disable-next-line @eslint-react/no-array-index-key -- a fixed list for one import; never reordered.
            <li key={i}>{issueText(t, issue)}</li>
          ))}
        </ul>
      </AlertDescription>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-2 right-2"
        aria-label={closeLabel}
        onClick={onDismiss}
      >
        <XIcon />
      </Button>
    </Alert>
  )
}

function issueText(t: T, issue: FormSpecIssue) {
  const path = issue.path
  switch (issue.code) {
    case 'duplicateName':
      return t.issues.duplicateName(path, issue.detail ?? '')
    case 'unknownType':
      return t.issues.unknownType(path, issue.detail ?? '')
    default:
      return t.issues[issue.code](path)
  }
}

// ---------------------------------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------------------------------

const GROUPS = ['text', 'number', 'choice', 'date', 'other'] as const

function Palette({
  t,
  types,
  onAdd,
}: {
  t: T
  types: FormFieldTypes
  onAdd: (type: FormFieldType) => void
}) {
  const headingId = React.useId()
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h3
        id={headingId}
        className="font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
      >
        {t.palette.title}
      </h3>
      {GROUPS.map((group) => {
        const list = Object.values(types).filter((type) => type.group === group)
        if (!list.length) return null
        return (
          <div key={group} className="flex flex-col gap-1">
            <p className="text-[12.5px] font-medium text-fg-secondary">{t.groups[group]}</p>
            <ul className="flex flex-wrap gap-1 lg:flex-col">
              {list.map((type) => {
                const Icon = type.icon
                const label = typeLabel(type, t)
                return (
                  <li key={type.type}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      aria-label={t.palette.add(label)}
                      onClick={() => {
                        onAdd(type)
                      }}
                    >
                      <Icon aria-hidden />
                      {label}
                    </Button>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </section>
  )
}

// ---------------------------------------------------------------------------------------------------
// Canvas
// ---------------------------------------------------------------------------------------------------

function Canvas({
  t,
  spec,
  types,
  selection,
  onSelect,
  onChange,
}: {
  t: T
  spec: FormSpec
  types: FormFieldTypes
  selection: Selection
  onSelect: (s: Selection) => void
  onChange: (spec: FormSpec) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const fields = spec.sections.flatMap((s) => s.fields)
  const labelOf = (id: unknown) => fields.find((f) => f.name === id)?.label ?? String(id)
  const positionOf = (id: unknown) => {
    const section = spec.sections.find((s) => s.fields.some((f) => f.name === id))
    return (section?.fields.findIndex((f) => f.name === id) ?? 0) + 1
  }
  const sectionOf = (name: string) =>
    spec.sections.find((s) => s.fields.some((f) => f.name === name))

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const to = sectionOf(String(over.id))
    if (!to) return
    onChange(
      moveFormField(
        spec,
        String(active.id),
        to.id,
        to.fields.findIndex((f) => f.name === over.id),
      ),
    )
  }

  const isFormSelected = selection.kind === 'form'
  return (
    <section
      aria-label={t.canvas.label}
      className="flex min-w-0 flex-col gap-3 rounded-xl border border-border-subtle bg-inset p-2 sm:p-5"
    >
      <div className="relative rounded-xl border border-border bg-card p-3 shadow-sm sm:p-6">
        <SelectOverlay
          label={t.canvas.editForm}
          selected={isFormSelected}
          onSelect={() => {
            onSelect({ kind: 'form' })
          }}
        />
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          accessibility={{
            announcements: {
              onDragStart: ({ active }) => t.dnd.picked(labelOf(active.id)),
              onDragOver: ({ active, over }) =>
                over ? t.dnd.over(labelOf(active.id), positionOf(over.id)) : undefined,
              onDragEnd: ({ active, over }) =>
                over ? t.dnd.dropped(labelOf(active.id), positionOf(over.id)) : undefined,
              onDragCancel: ({ active }) => t.dnd.cancelled(labelOf(active.id)),
            },
          }}
        >
          <FormRenderer
            spec={spec}
            types={types}
            hideSubmit
            showHidden
            className="relative"
            renderSection={(section, node) => (
              <CanvasSection
                t={t}
                spec={spec}
                section={section}
                selected={selection.kind === 'section' && selection.id === section.id}
                onSelect={() => {
                  onSelect({ kind: 'section', id: section.id })
                }}
              >
                {node}
              </CanvasSection>
            )}
            renderField={(field, node, visible) => (
              <CanvasField
                t={t}
                field={field}
                type={field.type in types ? types[field.type] : undefined}
                visible={visible}
                columns={sectionOf(field.name)?.columns ?? 1}
                selected={selection.kind === 'field' && selection.name === field.name}
                onSelect={() => {
                  onSelect({ kind: 'field', name: field.name })
                }}
                onDuplicate={() => {
                  const copy = { ...field, name: uniqueName(spec, field.type) }
                  onChange(addFormField(spec, copy, { after: field.name }))
                  onSelect({ kind: 'field', name: copy.name })
                }}
                onRemove={() => {
                  onChange(removeFormField(spec, field.name))
                  const section = sectionOf(field.name)
                  onSelect(section ? { kind: 'section', id: section.id } : { kind: 'form' })
                }}
              >
                {node}
              </CanvasField>
            )}
          />
        </DndContext>
      </div>
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            let id = `section-${spec.sections.length + 1}`
            while (spec.sections.some((s) => s.id === id)) id = `${id}-1`
            onChange({
              ...spec,
              sections: [...spec.sections, { id, title: t.newSection, fields: [] }],
            })
            onSelect({ kind: 'section', id })
          }}
        >
          <PlusIcon aria-hidden />
          {t.canvas.addSection}
        </Button>
      </div>
    </section>
  )
}

/** A transparent button over a card: a click anywhere on it selects it. */
function SelectOverlay({
  label,
  selected,
  onSelect,
}: {
  label: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'absolute inset-0 rounded-[inherit] outline-none focus-visible:ring-[3px] focus-visible:ring-ring',
        selected && 'ring-2 ring-primary',
      )}
    />
  )
}

function CanvasSection({
  t,
  spec,
  section,
  selected,
  onSelect,
  children,
}: {
  t: T
  spec: FormSpec
  section: FormSectionSpec
  selected: boolean
  onSelect: () => void
  children: React.ReactNode
}) {
  const index = spec.sections.indexOf(section)
  const title = section.title ?? t.canvas.untitled(index + 1)
  return (
    <div className="relative flex flex-col gap-3 rounded-lg border border-dashed border-border p-3">
      <SelectOverlay label={t.canvas.editSection(title)} selected={selected} onSelect={onSelect} />
      <SortableContext items={section.fields.map((f) => f.name)} strategy={rectSortingStrategy}>
        {section.fields.length ? (
          children
        ) : (
          <p className="relative py-4 text-center text-[13px] text-muted-foreground">
            {t.canvas.empty}
          </p>
        )}
      </SortableContext>
    </div>
  )
}

function CanvasField({
  t,
  field,
  type,
  visible,
  columns,
  selected,
  onSelect,
  onDuplicate,
  onRemove,
  children,
}: {
  t: T
  field: FormFieldSpec
  type: FormFieldType | undefined
  visible: boolean
  columns: number
  selected: boolean
  onSelect: () => void
  onDuplicate: () => void
  onRemove: () => void
  children: React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.name })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      data-dragging={isDragging || undefined}
      className={cn(
        'relative flex flex-col gap-2 rounded-lg border border-border-subtle bg-card p-3 data-dragging:opacity-70 data-dragging:shadow-lg',
        fieldSpanClass(field, columns),
      )}
    >
      <SelectOverlay label={t.canvas.edit(field.label)} selected={selected} onSelect={onSelect} />
      <div className="relative flex items-center gap-1.5">
        <Button
          ref={setActivatorNodeRef}
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-grab touch-none text-muted-foreground"
          {...attributes}
          {...listeners}
          aria-label={t.canvas.move(field.label)}
        >
          <GripVerticalIcon />
        </Button>
        <Badge variant="outline">{type ? typeLabel(type, t) : field.type}</Badge>
        <span className="min-w-0 truncate font-mono text-[11px] text-muted-foreground">
          {field.name}
        </span>
        {field.visibleWhen && (
          <Badge variant="secondary" title={t.canvas.conditional} className="px-1.5">
            {visible ? <SplitIcon aria-hidden /> : <EyeOffIcon aria-hidden />}
            <span className="sr-only">{t.canvas.conditional}</span>
          </Badge>
        )}
        <span className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t.canvas.duplicate(field.label)}
          onClick={onDuplicate}
        >
          <CopyPlusIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t.canvas.remove(field.label)}
          onClick={onRemove}
        >
          <Trash2Icon />
        </Button>
      </div>
      {/* The live control, shown as it will look: not focusable or clickable here. */}
      <div inert className={cn('pointer-events-none', !visible && 'opacity-60')}>
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------------
// Inspector
// ---------------------------------------------------------------------------------------------------

function Inspector({
  t,
  spec,
  types,
  selection,
  field,
  section,
  onSelect,
  onChange,
}: {
  t: T
  spec: FormSpec
  types: FormFieldTypes
  selection: Selection
  field: FormFieldSpec | undefined
  section: FormSectionSpec | undefined
  onSelect: (s: Selection) => void
  onChange: (spec: FormSpec) => void
}) {
  const headingId = React.useId()
  const ti = t.inspector
  const heading = field ? ti.field : section ? ti.section : ti.form
  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col gap-4 rounded-xl border border-border-subtle bg-card p-4"
    >
      <h3
        id={headingId}
        className="font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
      >
        {ti.title} · {heading}
      </h3>
      {field ? (
        <FieldInspector
          // A fresh draft of the name per field.
          key={field.name}
          t={t}
          spec={spec}
          types={types}
          field={field}
          onRename={(name) => {
            onSelect({ kind: 'field', name })
          }}
          onChange={onChange}
        />
      ) : section ? (
        <SectionInspector
          t={t}
          spec={spec}
          section={section}
          onChange={onChange}
          onRemove={() => {
            onChange(removeSection(spec, section.id))
            onSelect({ kind: 'form' })
          }}
        />
      ) : selection.kind === 'form' ? (
        <>
          <TextSetting
            label={ti.formTitle}
            value={spec.title}
            onChange={(title) => {
              onChange({ ...spec, title })
            }}
          />
          <TextSetting
            label={ti.formDescription}
            value={spec.description}
            multiline
            onChange={(description) => {
              onChange({ ...spec, description })
            }}
          />
          <TextSetting
            label={ti.submitLabel}
            value={spec.submitLabel}
            onChange={(submitLabel) => {
              onChange({ ...spec, submitLabel })
            }}
          />
          <p className="text-[13px] text-muted-foreground">{ti.nothing}</p>
        </>
      ) : (
        <p className="text-[13px] text-muted-foreground">{ti.nothing}</p>
      )}
    </section>
  )
}

function SectionInspector({
  t,
  spec,
  section,
  onChange,
  onRemove,
}: {
  t: T
  spec: FormSpec
  section: FormSectionSpec
  onChange: (spec: FormSpec) => void
  onRemove: () => void
}) {
  const ti = t.inspector
  const set = (patch: Partial<FormSectionSpec>) => {
    onChange(updateSection(spec, section.id, patch))
  }
  return (
    <>
      <TextSetting
        label={ti.sectionTitle}
        value={section.title}
        onChange={(title) => {
          set({ title })
        }}
      />
      <TextSetting
        label={ti.sectionDescription}
        value={section.description}
        multiline
        onChange={(description) => {
          set({ description })
        }}
      />
      <ChoiceSetting
        label={ti.columns}
        value={String(section.columns ?? 1)}
        choices={[1, 2, 3].map((n) => ({ value: String(n), label: String(n) }))}
        onChange={(v) => {
          set({ columns: v === '1' ? undefined : (Number(v) as 2 | 3) })
        }}
      />
      {spec.sections.length > 1 && (
        <div>
          <Button type="button" variant="outline" size="sm" onClick={onRemove}>
            <Trash2Icon aria-hidden />
            {ti.removeSection}
          </Button>
        </div>
      )}
    </>
  )
}

function FieldInspector({
  t,
  spec,
  types,
  field,
  onRename,
  onChange,
}: {
  t: T
  spec: FormSpec
  types: FormFieldTypes
  field: FormFieldSpec
  onRename: (name: string) => void
  onChange: (spec: FormSpec) => void
}) {
  const ti = t.inspector
  const type = types[field.type] as FormFieldType | undefined
  const section = spec.sections.find((s) => s.fields.includes(field))
  const set = (patch: Partial<FormFieldSpec>) => {
    onChange(updateFormField(spec, field.name, patch))
  }
  const checks = type?.checks ?? []
  const others = spec.sections.flatMap((s) => s.fields).filter((f) => f.name !== field.name)

  return (
    <>
      <TextSetting
        label={ti.label}
        value={field.label}
        onChange={(label) => {
          set({ label: label ?? '' })
        }}
      />
      <NameSetting
        t={t}
        name={field.name}
        taken={others.map((f) => f.name)}
        onCommit={(name) => {
          set({ name })
          onRename(name)
        }}
      />
      <ChoiceSetting
        label={ti.type}
        value={field.type}
        choices={Object.values(types).map((ty) => ({ value: ty.type, label: typeLabel(ty, t) }))}
        onChange={(next) => {
          const nextType = types[next] as FormFieldType | undefined
          set({
            type: next,
            options:
              nextType?.hasOptions && !field.options?.length
                ? [1, 2].map((n) => ({ value: `option-${n}`, label: t.newOption(n) }))
                : field.options,
            defaultValue: undefined,
          })
        }}
      />
      <TextSetting
        label={ti.description}
        value={field.description}
        multiline
        onChange={(description) => {
          set({ description })
        }}
      />
      {type?.placeholder && (
        <TextSetting
          label={ti.placeholder}
          value={field.placeholder}
          onChange={(placeholder) => {
            set({ placeholder })
          }}
        />
      )}
      <BooleanSetting
        label={ti.required}
        value={field.required === true}
        onChange={(required) => {
          set({ required: required || undefined })
        }}
      />
      {(section?.columns ?? 1) > 1 && (
        <ChoiceSetting
          label={ti.span}
          value={String(field.span ?? 1)}
          choices={Array.from({ length: section?.columns ?? 1 }, (_, i) => ({
            value: String(i + 1),
            label: ti.spanValue(i + 1),
          }))}
          onChange={(v) => {
            set({ span: v === '1' ? undefined : (Number(v) as 2 | 3) })
          }}
        />
      )}
      {spec.sections.length > 1 && section && (
        <ChoiceSetting
          label={ti.section}
          value={section.id}
          choices={spec.sections.map((s, i) => ({
            value: s.id,
            label: s.title ?? t.canvas.untitled(i + 1),
          }))}
          onChange={(id) => {
            const to = spec.sections.find((s) => s.id === id)
            if (to) onChange(moveFormField(spec, field.name, id, to.fields.length))
          }}
        />
      )}
      {type?.hasOptions && (
        <OptionsSetting
          t={t}
          options={field.options ?? []}
          onChange={(options) => {
            set({ options })
          }}
        />
      )}
      {type?.settings?.map((setting) => {
        const label = ti.settings[setting.key] ?? setting.key
        const v = field[setting.key]
        if (setting.kind === 'boolean')
          return (
            <BooleanSetting
              key={setting.key}
              label={label}
              value={v === true}
              onChange={(b) => {
                set({ [setting.key]: b || undefined })
              }}
            />
          )
        if (setting.kind === 'number')
          return (
            <NumberSetting
              key={setting.key}
              label={label}
              value={typeof v === 'number' ? v : null}
              onChange={(n) => {
                set({ [setting.key]: n ?? undefined })
              }}
            />
          )
        if (setting.kind === 'list')
          return (
            <ListSetting
              key={setting.key}
              label={label}
              value={Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []}
              onChange={(list) => {
                set({ [setting.key]: list.length ? list : undefined })
              }}
            />
          )
        if (setting.kind === 'select')
          return (
            <ChoiceSetting
              key={setting.key}
              label={label}
              value={typeof v === 'string' ? v : (setting.choices?.[0]?.value ?? '')}
              choices={(setting.choices ?? []).map((c) => ({
                value: c.value,
                label: ti.choices[c.value] ?? c.label,
              }))}
              onChange={(c) => {
                set({ [setting.key]: c })
              }}
            />
          )
        return (
          <TextSetting
            key={setting.key}
            label={label}
            value={typeof v === 'string' ? v : undefined}
            onChange={(s) => {
              set({ [setting.key]: s })
            }}
          />
        )
      })}
      {checks.length > 0 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            {ti.checks}
          </legend>
          {checks.includes('length') && (
            <div className="grid grid-cols-2 gap-2">
              <NumberSetting
                label={ti.minLength}
                value={field.minLength ?? null}
                min={0}
                onChange={(n) => {
                  set({ minLength: n ?? undefined })
                }}
              />
              <NumberSetting
                label={ti.maxLength}
                value={field.maxLength ?? null}
                min={0}
                onChange={(n) => {
                  set({ maxLength: n ?? undefined })
                }}
              />
            </div>
          )}
          {checks.includes('pattern') && (
            <>
              <TextSetting
                label={ti.pattern}
                value={field.pattern}
                mono
                onChange={(pattern) => {
                  set({ pattern })
                }}
              />
              {field.pattern && (
                <TextSetting
                  label={ti.patternMessage}
                  value={field.patternMessage}
                  onChange={(patternMessage) => {
                    set({ patternMessage })
                  }}
                />
              )}
            </>
          )}
          {checks.includes('range') && (
            <div className="grid grid-cols-2 gap-2">
              <NumberSetting
                label={ti.min}
                value={typeof field.min === 'number' ? field.min : null}
                onChange={(n) => {
                  set({ min: n ?? undefined })
                }}
              />
              <NumberSetting
                label={ti.max}
                value={typeof field.max === 'number' ? field.max : null}
                onChange={(n) => {
                  set({ max: n ?? undefined })
                }}
              />
            </div>
          )}
          {(checks.includes('dateRange') || checks.includes('timeRange')) && (
            <div className="grid grid-cols-2 gap-2">
              {(['min', 'max'] as const).map((key) => (
                <TextSetting
                  key={key}
                  label={ti[key]}
                  inputType={checks.includes('dateRange') ? (type?.rangeInput ?? 'date') : 'time'}
                  value={typeof field[key] === 'string' ? field[key] : undefined}
                  onChange={(s) => {
                    set({ [key]: s })
                  }}
                />
              ))}
            </div>
          )}
          {checks.includes('items') && (
            <div className="grid grid-cols-2 gap-2">
              <NumberSetting
                label={ti.minItems}
                value={field.minItems ?? null}
                min={0}
                onChange={(n) => {
                  set({ minItems: n ?? undefined })
                }}
              />
              <NumberSetting
                label={ti.maxItems}
                value={field.maxItems ?? null}
                min={0}
                onChange={(n) => {
                  set({ maxItems: n ?? undefined })
                }}
              />
            </div>
          )}
        </fieldset>
      )}
      <ConditionSetting
        t={t}
        types={types}
        others={others}
        condition={field.visibleWhen}
        onChange={(visibleWhen) => {
          set({ visibleWhen })
        }}
      />
    </>
  )
}

// ---------------------------------------------------------------------------------------------------
// Inspector controls
// ---------------------------------------------------------------------------------------------------

function TextSetting({
  label,
  value,
  onChange,
  multiline = false,
  mono = false,
  inputType = 'text',
}: {
  label: string
  value: string | undefined
  /** `undefined` when emptied. */
  onChange: (value: string | undefined) => void
  multiline?: boolean
  mono?: boolean
  inputType?: 'text' | 'date' | 'time' | 'month' | 'week'
}) {
  const id = React.useId()
  const common = {
    id,
    value: value ?? '',
    className: cn(mono && 'font-mono text-[13px]'),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(e.target.value === '' ? undefined : e.target.value)
    },
  }
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {multiline ? <Textarea rows={2} {...common} /> : <Input type={inputType} {...common} />}
    </Field>
  )
}

/** A list typed comma-separated; the text is kept as typed so a trailing comma survives. */
function ListSetting({
  label,
  value,
  onChange,
}: {
  label: string
  value: string[]
  onChange: (value: string[]) => void
}) {
  const id = React.useId()
  const [draft, setDraft] = React.useState(value.join(', '))
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value)
          onChange(
            e.target.value
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean),
          )
        }}
      />
    </Field>
  )
}

function NumberSetting({
  label,
  value,
  onChange,
  min,
}: {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  min?: number
}) {
  const id = React.useId()
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <NumberInput id={id} value={value} min={min} stepper="none" onValueChange={onChange} />
    </Field>
  )
}

function BooleanSetting({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  const id = React.useId()
  return (
    <Field orientation="horizontal" className="justify-between">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Switch id={id} checked={value} onCheckedChange={onChange} />
    </Field>
  )
}

function ChoiceSetting({
  label,
  value,
  choices,
  onChange,
}: {
  label: string
  value: string
  choices: readonly { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  const id = React.useId()
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {choices.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

/** The name is applied on Enter or when the field is left, and only if it's valid and free. */
function NameSetting({
  t,
  name,
  taken,
  onCommit,
}: {
  t: T
  name: string
  taken: string[]
  onCommit: (name: string) => void
}) {
  const id = React.useId()
  const [draft, setDraft] = React.useState(name)
  const error = !NAME.test(draft)
    ? t.inspector.nameInvalid
    : taken.includes(draft)
      ? t.inspector.nameTaken
      : undefined
  const commit = () => {
    if (!error && draft !== name) onCommit(draft)
  }
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{t.inspector.name}</FieldLabel>
      <Input
        id={id}
        value={draft}
        className="font-mono text-[13px]"
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-hint`}
        onChange={(e) => {
          setDraft(e.target.value)
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
        }}
      />
      {error ? (
        <FieldError id={`${id}-hint`}>{error}</FieldError>
      ) : (
        <FieldDescription id={`${id}-hint`}>{t.inspector.nameHint}</FieldDescription>
      )}
    </Field>
  )
}

function OptionsSetting({
  t,
  options,
  onChange,
}: {
  t: T
  options: NonNullable<FormFieldSpec['options']>
  onChange: (options: NonNullable<FormFieldSpec['options']>) => void
}) {
  const ti = t.inspector
  const update = (i: number, patch: Partial<(typeof options)[number]>) => {
    onChange(options.map((o, j) => (j === i ? { ...o, ...patch } : o)))
  }
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {ti.options}
      </legend>
      {options.map((o, i) => (
        // eslint-disable-next-line @eslint-react/no-array-index-key -- rows are edited in place; the value itself is being typed, so it can't be the key.
        <div key={i} className="flex items-center gap-1.5">
          <Input
            aria-label={ti.optionLabel(i + 1)}
            value={o.label}
            onChange={(e) => {
              update(i, { label: e.target.value })
            }}
          />
          <Input
            aria-label={ti.optionValue(i + 1)}
            value={o.value}
            className="w-24 shrink-0 font-mono text-[13px]"
            onChange={(e) => {
              update(i, { value: e.target.value })
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={ti.removeOption(o.label || o.value)}
            onClick={() => {
              onChange(options.filter((_, j) => j !== i))
            }}
          >
            <XIcon />
          </Button>
        </div>
      ))}
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            let n = options.length + 1
            while (options.some((o) => o.value === `option-${n}`)) n++
            onChange([...options, { value: `option-${n}`, label: t.newOption(n) }])
          }}
        >
          <PlusIcon aria-hidden />
          {ti.addOption}
        </Button>
      </div>
    </fieldset>
  )
}

const OPS: FormConditionOp[] = ['equals', 'notEquals', 'filled', 'empty', 'gt', 'lt', 'contains']
const NO_VALUE = new Set<FormConditionOp>(['filled', 'empty'])

/** One "show only when <field> <op> <value>" condition. Combined ones (all / any) are edited in JSON. */
function ConditionSetting({
  t,
  types,
  others,
  condition,
  onChange,
}: {
  t: T
  types: FormFieldTypes
  others: FormFieldSpec[]
  condition: FormCondition | undefined
  onChange: (condition: FormCondition | undefined) => void
}) {
  const ti = t.inspector
  const switchId = React.useId()
  const simple = condition && 'field' in condition ? condition : undefined
  const target = simple ? others.find((f) => f.name === simple.field) : undefined
  const targetType = target ? (types[target.type] as FormFieldType | undefined) : undefined
  const coerce = (raw: string): unknown => {
    if (targetType?.empty === false) return raw === 'true'
    if (targetType?.empty === null) return raw === '' ? undefined : Number(raw)
    return raw
  }
  return (
    <fieldset className="flex flex-col gap-3">
      <Field orientation="horizontal" className="justify-between">
        <FieldLabel htmlFor={switchId}>{ti.condition}</FieldLabel>
        <Switch
          id={switchId}
          checked={condition !== undefined}
          disabled={!others.length && !condition}
          onCheckedChange={(on) => {
            onChange(on && others[0] ? { field: others[0].name, op: 'filled' } : undefined)
          }}
        />
      </Field>
      {condition && !simple && (
        <pre className="overflow-x-auto rounded-md bg-inset p-2 font-mono text-[11px] text-fg-secondary">
          {JSON.stringify(condition, null, 2)}
        </pre>
      )}
      {simple && (
        <>
          <ChoiceSetting
            label={ti.conditionField}
            value={simple.field}
            choices={others.map((f) => ({ value: f.name, label: f.label }))}
            onChange={(name) => {
              onChange({ field: name, op: simple.op })
            }}
          />
          <ChoiceSetting
            label={ti.conditionOp}
            value={simple.op}
            choices={OPS.map((op) => ({ value: op, label: ti.ops[op] }))}
            onChange={(op) => {
              const next = op as FormConditionOp
              onChange(
                NO_VALUE.has(next)
                  ? { field: simple.field, op: next }
                  : { ...simple, op: next, value: simple.value ?? coerce('') },
              )
            }}
          />
          {!NO_VALUE.has(simple.op) &&
            (target?.options?.length || targetType?.empty === false ? (
              <ChoiceSetting
                label={ti.conditionValue}
                value={
                  ['string', 'number', 'boolean'].includes(typeof simple.value)
                    ? String(simple.value)
                    : ''
                }
                choices={
                  target?.options?.length
                    ? target.options
                    : [
                        { value: 'true', label: ti.checked },
                        { value: 'false', label: ti.unchecked },
                      ]
                }
                onChange={(raw) => {
                  onChange({ ...simple, value: coerce(raw) })
                }}
              />
            ) : (
              <TextSetting
                label={ti.conditionValue}
                // eslint-disable-next-line @typescript-eslint/no-base-to-string -- a JSON scalar.
                value={simple.value === undefined ? undefined : String(simple.value)}
                onChange={(raw) => {
                  onChange({ ...simple, value: coerce(raw ?? '') })
                }}
              />
            ))}
        </>
      )}
    </fieldset>
  )
}

// ---------------------------------------------------------------------------------------------------
// Preview, JSON and import
// ---------------------------------------------------------------------------------------------------

function Preview({
  t,
  spec,
  types,
  onSubmit,
}: {
  t: T
  spec: FormSpec
  types: FormFieldTypes
  onSubmit?: (values: FormValues) => void
}) {
  const [values, setValues] = React.useState<FormValues | null>(null)
  const headingId = React.useId()
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <FormRenderer
          spec={spec}
          types={types}
          onSubmit={(v) => {
            setValues(v)
            onSubmit?.(v)
          }}
        />
      </div>
      <section
        aria-labelledby={headingId}
        className="flex min-w-0 flex-col gap-2 rounded-xl border border-border-subtle bg-inset p-4"
      >
        <h3
          id={headingId}
          className="font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
        >
          {t.preview.submitted}
        </h3>
        {values ? (
          <pre className="overflow-x-auto font-mono text-[12px] text-foreground">
            {JSON.stringify(values, (_, v: unknown) => (v instanceof File ? v.name : v), 2)}
          </pre>
        ) : (
          <p className="text-[13px] text-muted-foreground">{t.preview.nothing}</p>
        )}
      </section>
    </div>
  )
}

function CopyTextButton({ t, text }: { t: T; text: string }) {
  const [copied, setCopied] = React.useState(false)
  React.useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => {
      setCopied(false)
    }, 1400)
    return () => {
      clearTimeout(timer)
    }
  }, [copied])
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
        })
      }}
    >
      {copied ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
      <span aria-live="polite">{copied ? t.json.copied : t.json.copy}</span>
    </Button>
  )
}

function parse(text: string): { value: unknown } | { error: string } {
  try {
    return { value: JSON.parse(text) as unknown }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}

function JsonView({
  t,
  spec,
  types,
  onApply,
}: {
  t: T
  spec: FormSpec
  types: FormFieldTypes
  onApply: (result: { spec: FormSpec; issues: FormSpecIssue[] }) => void
}) {
  const id = React.useId()
  const [format, setFormat] = React.useState<'spec' | 'schema'>('spec')
  const current = JSON.stringify(spec, null, 2)
  const [draft, setDraft] = React.useState(current)
  const [status, setStatus] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const schemaText = React.useMemo(() => JSON.stringify(toJSONSchema(spec), null, 2), [spec])
  const shown = format === 'spec' ? draft : schemaText
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={format}
          aria-label={t.json.format}
          onValueChange={(v) => {
            if (v === 'spec' || v === 'schema') setFormat(v)
          }}
        >
          <ToggleGroupItem value="spec">{t.json.formSpec}</ToggleGroupItem>
          <ToggleGroupItem value="schema">{t.json.jsonSchema}</ToggleGroupItem>
        </ToggleGroup>
        <div className="flex items-center gap-2">
          <CopyTextButton t={t} text={shown} />
          {format === 'spec' && (
            <Button
              type="button"
              size="sm"
              disabled={draft === current}
              onClick={() => {
                const parsed = parse(draft)
                if ('error' in parsed) {
                  setError(t.json.invalid(parsed.error))
                  setStatus(null)
                  return
                }
                const result = readFormSpec(parsed.value, types)
                setError(null)
                setStatus(t.json.applied)
                setDraft(JSON.stringify(result.spec, null, 2))
                onApply(result)
              }}
            >
              {t.json.apply}
            </Button>
          )}
        </div>
      </div>
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor={id}>{t.json.label}</FieldLabel>
        <Textarea
          id={id}
          value={shown}
          readOnly={format === 'schema'}
          spellCheck={false}
          rows={22}
          className="font-mono text-[12.5px]"
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-status`}
          onChange={(e) => {
            setDraft(e.target.value)
            setStatus(null)
            setError(null)
          }}
        />
        <div id={`${id}-status`} aria-live="polite">
          {error ? (
            <FieldError>{error}</FieldError>
          ) : format === 'schema' ? (
            <FieldDescription>{t.json.readOnly}</FieldDescription>
          ) : status ? (
            <FieldDescription>{status}</FieldDescription>
          ) : null}
        </div>
      </Field>
    </div>
  )
}

function ImportDialog({
  t,
  types,
  onImport,
}: {
  t: T
  types: FormFieldTypes
  onImport: (result: { spec: FormSpec; issues: FormSpecIssue[] }) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [source, setSource] = React.useState('')
  const [ui, setUi] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const sourceId = React.useId()
  const uiId = React.useId()
  const submit = () => {
    const parsed = parse(source)
    const parsedUi = ui.trim() ? parse(ui) : { value: {} }
    if ('error' in parsed || 'error' in parsedUi) {
      setError(
        t.json.invalid('error' in parsed ? parsed.error : (parsedUi as { error: string }).error),
      )
      return
    }
    const v = parsed.value as Record<string, unknown> | null
    // A JSON Schema describes `properties`; a FormSpec has `sections` (or `fields`).
    const isSchema = v !== null && typeof v === 'object' && 'properties' in v
    onImport(
      isSchema ? fromJSONSchema(v, parsedUi.value, types) : readFormSpec(parsed.value, types),
    )
    setOpen(false)
    setSource('')
    setUi('')
    setError(null)
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <UploadIcon aria-hidden />
          {t.import.open}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t.import.title}</DialogTitle>
          <DialogDescription>{t.import.description}</DialogDescription>
        </DialogHeader>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor={sourceId}>{t.import.source}</FieldLabel>
          <Textarea
            id={sourceId}
            rows={10}
            spellCheck={false}
            className="font-mono text-[12.5px]"
            value={source}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${sourceId}-error` : undefined}
            onChange={(e) => {
              setSource(e.target.value)
              setError(null)
            }}
          />
          {error && <FieldError id={`${sourceId}-error`}>{error}</FieldError>}
        </Field>
        <Field>
          <FieldLabel htmlFor={uiId}>{t.import.uiSchema}</FieldLabel>
          <Textarea
            id={uiId}
            rows={4}
            spellCheck={false}
            className="font-mono text-[12.5px]"
            value={ui}
            onChange={(e) => {
              setUi(e.target.value)
            }}
          />
        </Field>
        <DialogFooter>
          <Button type="button" disabled={!source.trim()} onClick={submit}>
            {t.import.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export {
  addFormField,
  FormBuilder,
  type FormBuilderProps,
  moveFormField,
  removeFormField,
  removeSection,
  updateFormField,
  updateSection,
}
