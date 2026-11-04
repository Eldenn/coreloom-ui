'use client'

// Coreloom UI — Diagram properties. The diagram editor's panel for what's selected: an element's
// name, stereotype, members, attributes, description or technology; a relation's kind, label and
// ends. A text field applies when it loses focus (or on Enter); a choice applies at once.
import { ArrowLeftRightIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { type Messages, useCoreloomI18n } from '@/lib/i18n'
import type { ErCardinality, UmlSpec } from '@/lib/uml'
import { relationEnds, relationTypes, START_END, type UmlRelationType } from '@/lib/uml-edit'
import {
  elementFields,
  relationFields,
  type UmlElementFields,
  type UmlRelationFields,
} from '@/lib/uml-edit-fields'
import { cn } from '@/lib/utils'

type PropertiesText = Messages['diagramTools']

/** What the panel edits: one element, one relation, nothing, or several things. */
type Target =
  | { kind: 'element'; id: string; fields: UmlElementFields }
  | { kind: 'relation'; index: number; fields: UmlRelationFields; from: string; to: string }
  | { kind: 'none' }
  | { kind: 'several'; count: number }

interface DiagramPropertiesProps {
  diagram: UmlSpec
  selection: { elements: readonly string[]; relations: readonly number[] }
  /** The tools can't edit (the text has problems): the fields are read-only. */
  locked: boolean
  onElementChange: (id: string, fields: UmlElementFields) => void
  onRelationChange: (index: number, fields: UmlRelationFields) => void
  onReverse: (index: number) => void
  /** The name field, so the editor can focus it after adding an element. */
  nameRef?: React.Ref<HTMLInputElement>
  className?: string
}

function relationEndsOf(diagram: UmlSpec, index: number): [string, string] {
  if (diagram.kind === 'sequence') return ['', '']
  const list: readonly { from: string; to: string }[] =
    diagram.kind === 'state' ? diagram.transitions : diagram.relations
  const r = index >= 0 && index < list.length ? list[index] : undefined
  return r ? [r.from, r.to] : ['', '']
}

function targetOf(diagram: UmlSpec, selection: DiagramPropertiesProps['selection']): Target {
  const count = selection.elements.length + selection.relations.length
  if (count > 1) return { kind: 'several', count }
  const id = selection.elements.at(0)
  if (id !== undefined) {
    const fields = elementFields(diagram, id)
    return fields ? { kind: 'element', id, fields } : { kind: 'none' }
  }
  const index = selection.relations.at(0)
  if (index === undefined) return { kind: 'none' }
  const fields = relationFields(diagram, index)
  if (!fields) return { kind: 'none' }
  const [from, to] = relationEndsOf(diagram, index)
  return { kind: 'relation', index, fields, from, to }
}

/** Edits not yet applied, by field; what isn't here shows the diagram's value. */
function useDrafts<T extends object>(key: string) {
  const [drafts, setDrafts] = React.useState<Partial<T>>({})
  const [owner, setOwner] = React.useState(key)
  if (owner !== key) {
    // Another element: drop the drafts of the previous one.
    setOwner(key)
    setDrafts({})
  }
  const set = <K extends keyof T>(k: K, value: T[K]) => {
    setDrafts((d) => ({ ...d, [k]: value }))
  }
  const take = () => {
    const out = drafts
    setDrafts({})
    return out
  }
  return { drafts, set, take }
}

function TextField({
  label,
  value,
  hint,
  multiline = false,
  disabled,
  onChange,
  onCommit,
  inputRef,
}: {
  label: string
  value: string
  hint?: string
  multiline?: boolean
  disabled: boolean
  onChange: (value: string) => void
  onCommit: () => void
  inputRef?: React.Ref<HTMLInputElement> | undefined
}) {
  const id = React.useId()
  const described = hint ? { 'aria-describedby': `${id}-hint` } : {}
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {multiline ? (
        <Textarea
          id={id}
          value={value}
          readOnly={disabled}
          rows={4}
          spellCheck={false}
          className="min-h-20 font-mono text-[12px]"
          onChange={(e) => {
            onChange(e.target.value)
          }}
          onBlur={onCommit}
          {...described}
        />
      ) : (
        <Input
          id={id}
          ref={inputRef}
          value={value}
          readOnly={disabled}
          className="h-8 text-[13px]"
          onChange={(e) => {
            onChange(e.target.value)
          }}
          onBlur={onCommit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCommit()
          }}
          {...described}
        />
      )}
      {hint && (
        <p id={`${id}-hint`} className="text-[12px] text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  )
}

function ElementForm({
  target,
  locked,
  onChange,
  nameRef,
  t,
}: {
  target: Extract<Target, { kind: 'element' }>
  locked: boolean
  onChange: (id: string, fields: UmlElementFields) => void
  nameRef?: React.Ref<HTMLInputElement> | undefined
  t: PropertiesText
}) {
  const { fields, id } = target
  const { drafts, set, take } = useDrafts<UmlElementFields>(id)
  const value = <K extends keyof UmlElementFields>(k: K) => drafts[k] ?? fields[k]
  const commit = () => {
    const changed = take()
    if (Object.keys(changed).length) onChange(id, { ...fields, ...changed })
  }
  const note = /^note:\d+$/.test(id)
  const p = t.properties
  const text = (
    k: 'name' | 'stereotype' | 'members' | 'attributes' | 'description' | 'technology',
  ) => value(k) ?? ''
  return (
    <>
      <TextField
        label={note ? p.text : p.name}
        value={text('name')}
        multiline={note}
        disabled={locked}
        inputRef={nameRef}
        onChange={(v) => {
          set('name', v)
        }}
        onCommit={commit}
      />
      {fields.stereotype !== undefined && (
        <TextField
          label={p.stereotype}
          value={text('stereotype')}
          hint={p.stereotypeHint}
          disabled={locked}
          onChange={(v) => {
            set('stereotype', v)
          }}
          onCommit={commit}
        />
      )}
      {(['members', 'attributes', 'description'] as const).map(
        (k) =>
          fields[k] !== undefined && (
            <TextField
              key={k}
              label={p[k]}
              value={text(k)}
              multiline
              {...(k === 'description' ? {} : { hint: p[`${k}Hint`] })}
              disabled={locked}
              onChange={(v) => {
                set(k, v)
              }}
              onCommit={commit}
            />
          ),
      )}
      {fields.technology !== undefined && (
        <TextField
          label={p.technology}
          value={text('technology')}
          disabled={locked}
          onChange={(v) => {
            set('technology', v)
          }}
          onCommit={commit}
        />
      )}
      {fields.external !== undefined && (
        <Label className="flex items-center gap-2 font-normal">
          <Checkbox
            checked={fields.external}
            disabled={locked}
            onCheckedChange={(checked) => {
              onChange(id, { ...fields, ...drafts, external: checked === true })
            }}
          />
          {p.external}
        </Label>
      )}
    </>
  )
}

const ER_ENDS: readonly ErCardinality[] = ['zeroOrOne', 'exactlyOne', 'zeroOrMore', 'oneOrMore']

function Choice<T extends string>({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  disabled: boolean
  onChange: (value: T) => void
}) {
  const id = React.useId()
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <NativeSelect
        id={id}
        size="sm"
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const next = options.find((o) => o.value === e.target.value)
          if (next) onChange(next.value)
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </NativeSelect>
    </div>
  )
}

function RelationForm({
  target,
  diagram,
  locked,
  onChange,
  onReverse,
  t,
}: {
  target: Extract<Target, { kind: 'relation' }>
  diagram: UmlSpec
  locked: boolean
  onChange: (index: number, fields: UmlRelationFields) => void
  onReverse: (index: number) => void
  t: PropertiesText
}) {
  const cardinality = useCoreloomI18n().messages.diagram.cardinality
  const { fields, index } = target
  const { drafts, set, take } = useDrafts<UmlRelationFields>(String(index))
  const commit = () => {
    const changed = take()
    if (Object.keys(changed).length) onChange(index, { ...fields, ...changed })
  }
  const names = new Map(relationEnds(diagram).map((e) => [e.id, e.name]))
  const name = (id: string, side: 'from' | 'to') => {
    if (id === START_END) return side === 'from' ? t.form.start : t.form.end
    return names.get(id) ?? id
  }
  const p = t.properties
  const types = relationTypes(diagram)
  const text = (k: 'label' | 'fromCardinality' | 'toCardinality' | 'technology') =>
    drafts[k] ?? fields[k] ?? ''
  const textField = (
    k: 'label' | 'fromCardinality' | 'toCardinality' | 'technology',
    label: string,
  ) => (
    <TextField
      label={label}
      value={text(k)}
      disabled={locked}
      onChange={(v) => {
        set(k, v)
      }}
      onCommit={commit}
    />
  )
  return (
    <>
      <p className="text-[12.5px] text-fg-secondary">
        {p.relation(name(target.from, 'from'), name(target.to, 'to'))}
      </p>
      {fields.type !== undefined && types.length > 1 && (
        <Choice<UmlRelationType>
          label={p.kind}
          value={fields.type}
          options={types.map((x) => ({ value: x, label: t.relations[x] }))}
          disabled={locked}
          onChange={(type) => {
            onChange(index, { ...fields, ...drafts, type })
          }}
        />
      )}
      {textField('label', p.lineLabel)}
      {fields.fromCardinality !== undefined &&
        textField('fromCardinality', p.endAt(name(target.from, 'from')))}
      {fields.toCardinality !== undefined &&
        textField('toCardinality', p.endAt(name(target.to, 'to')))}
      {(['fromEnd', 'toEnd'] as const).map((k) => {
        const current = fields[k]
        if (current === undefined) return null
        return (
          <Choice<ErCardinality>
            key={k}
            label={p.endAt(k === 'fromEnd' ? name(target.from, 'from') : name(target.to, 'to'))}
            value={current}
            options={ER_ENDS.map((x) => ({ value: x, label: cardinality[x] }))}
            disabled={locked}
            onChange={(v) => {
              onChange(index, { ...fields, ...drafts, [k]: v })
            }}
          />
        )
      })}
      {fields.technology !== undefined && textField('technology', p.technology)}
      {diagram.kind !== 'state' && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={locked}
          onClick={() => {
            onReverse(index)
          }}
        >
          <ArrowLeftRightIcon aria-hidden />
          {p.reverse}
        </Button>
      )}
    </>
  )
}

function DiagramProperties({
  diagram,
  selection,
  locked,
  onElementChange,
  onRelationChange,
  onReverse,
  nameRef,
  className,
}: DiagramPropertiesProps) {
  const t = useCoreloomI18n().messages.diagramTools
  const id = React.useId()
  const target = targetOf(diagram, selection)
  return (
    <div
      role="group"
      aria-labelledby={`${id}-title`}
      data-slot="diagram-properties"
      className={cn('flex min-h-0 flex-col gap-3 overflow-auto p-3', className)}
    >
      <p
        id={`${id}-title`}
        className="font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
      >
        {t.properties.label}
      </p>
      {target.kind === 'none' && (
        <p className="text-[12.5px] text-muted-foreground">{t.properties.empty}</p>
      )}
      {target.kind === 'several' && (
        <p className="text-[12.5px] text-muted-foreground">{t.properties.several(target.count)}</p>
      )}
      {target.kind === 'element' && (
        <ElementForm
          target={target}
          locked={locked}
          onChange={onElementChange}
          nameRef={nameRef}
          t={t}
        />
      )}
      {target.kind === 'relation' && (
        <RelationForm
          target={target}
          diagram={diagram}
          locked={locked}
          onChange={onRelationChange}
          onReverse={onReverse}
          t={t}
        />
      )}
    </div>
  )
}

export { DiagramProperties, type DiagramPropertiesProps }
