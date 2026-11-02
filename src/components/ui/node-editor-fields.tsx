'use client'

// Coreloom UI — NodeEditor fields and data. What the node panel needs to work with real data: `{{ }}`
// expressions with suggestions taken from the data a node receives, a preview of what they give, a
// view of a node's input and output, and the richer settings (conditions, key/value rows, JSON or
// code, credentials). Evaluation here is plain path lookup — no code is ever run.
import { BracesIcon, PlusIcon, XIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** A value an expression can use, offered as you type `{{`. */
interface ExpressionVariable {
  /** What goes between the braces: `email`, `company.name`, `$node.http.status`. */
  path: string
  /** A sample value, shown next to it. */
  sample?: unknown
  /** Where it comes from ("Input", a node's name, "Variables"). */
  group?: string
}

/** A saved connection to a service. The editor only ever sees its id and name, never the secret. */
interface NodeCredential {
  id: string
  name: string
  /** Matches a `credential` field's `credentialType` ("smtp", "slack"). */
  type: string
}

type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'lt'
  | 'isEmpty'
  | 'isNotEmpty'

interface ConditionRule {
  left: string
  operator: ConditionOperator
  right?: string
}

/** A `conditions` field's value. */
interface ConditionsValue {
  combinator: 'and' | 'or'
  rules: ConditionRule[]
}

/** One row of a `keyValue` field. */
interface KeyValueItem {
  key: string
  value: string
}

/** What `{{ }}` expressions read: the node's input, other nodes' outputs and the app's variables. */
interface ExpressionScope {
  /** The node's input. When it's a list of items, the first item is used. */
  input?: unknown
  /** Each node's output by id, for `{{ $node.<id>.path }}`. */
  nodes?: Partial<Record<string, unknown>>
  /** Named values the app adds (`{{ topic }}`). They win over input fields of the same name. */
  variables?: Record<string, unknown>
}

const OPERATORS: readonly ConditionOperator[] = [
  'equals',
  'notEquals',
  'contains',
  'notContains',
  'startsWith',
  'endsWith',
  'gt',
  'lt',
  'isEmpty',
  'isNotEmpty',
]
const UNARY = new Set<ConditionOperator>(['isEmpty', 'isNotEmpty'])

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/** The first item of a list of items, or the value itself. */
const firstItem = (v: unknown): unknown => (Array.isArray(v) ? (v as unknown[])[0] : v)

/** `a.b[0]['c d']` → `['a', 'b', '0', 'c d']`. */
function pathSegments(path: string) {
  const out: string[] = []
  const re = /\[(\d+)\]|\[(['"])(.*?)\2\]|([^.[\]]+)/g
  for (const m of path.matchAll(re)) {
    // A group that didn't take part is undefined at run time, whatever the match type says.
    const g: (string | undefined)[] = Array.from(m)
    const seg = g[1] ?? g[3] ?? g[4]
    if (seg !== undefined) out.push(seg)
  }
  return out
}

const FORBIDDEN = new Set(['__proto__', 'prototype', 'constructor'])

/** Reads `path` in `value`, own keys only. `found` is false when a step is missing. */
function readPath(value: unknown, path: string): { found: boolean; value: unknown } {
  let cur = value
  for (const seg of pathSegments(path)) {
    if (FORBIDDEN.has(seg)) return { found: false, value: undefined }
    if (Array.isArray(cur)) {
      const i = Number(seg)
      if (!Number.isInteger(i) || i < 0 || i >= cur.length)
        return { found: false, value: undefined }
      cur = (cur as unknown[])[i]
    } else if (isRecord(cur) && Object.hasOwn(cur, seg)) {
      cur = cur[seg]
    } else return { found: false, value: undefined }
  }
  return { found: true, value: cur }
}

const asText = (v: unknown): string => {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint') return String(v)
  if (v === null || v === undefined) return ''
  return JSON.stringify(v)
}

const EXPRESSION = /\{\{\s*([^{}]*?)\s*\}\}/g

/** One expression's value, or `found: false`. */
function lookup(expr: string, scope: ExpressionScope) {
  const node = /^\$node\.([\w-]+)(.*)$/.exec(expr)
  if (node) {
    const parts: (string | undefined)[] = Array.from(node)
    const id = parts[1] ?? ''
    const nodes = scope.nodes ?? {}
    if (!Object.hasOwn(nodes, id)) return { found: false, value: undefined }
    const rest = (parts[2] ?? '').replace(/^\./, '')
    const out = firstItem(nodes[id])
    return rest ? readPath(out, rest) : { found: true, value: out }
  }
  const head = pathSegments(expr).at(0)
  const vars = scope.variables ?? {}
  if (head !== undefined && Object.hasOwn(vars, head)) return readPath(vars, expr)
  return readPath(firstItem(scope.input), expr)
}

/**
 * Fills the `{{ path }}` expressions of a template from `scope`. Only paths are read — nothing is
 * evaluated. What isn't found stays as written and is listed in `missing`. When the template is a
 * single expression, `value` is the raw value found (a number stays a number).
 */
function resolveExpression(
  template: string,
  scope: ExpressionScope,
): { text: string; value: unknown; missing: string[] } {
  const missing: string[] = []
  const whole = /^\{\{\s*([^{}]*?)\s*\}\}$/.exec(template.trim())
  let single: unknown = template
  const text = template.replace(EXPRESSION, (raw, expr: string) => {
    const r = lookup(expr, scope)
    if (!r.found) {
      missing.push(expr)
      return raw
    }
    if (whole) single = r.value
    return asText(r.value)
  })
  return { text, value: whole && !missing.length ? single : text, missing }
}

const hasExpression = (s: string) => /\{\{[^{}]*\}\}/.test(s)

/**
 * The paths inside a sample (the first item of a list), for suggestions: `email`, `company`,
 * `company.name`… Goes 4 levels deep and stops at `max`.
 */
function dataPaths(value: unknown, max = 100): { path: string; sample: unknown }[] {
  const out: { path: string; sample: unknown }[] = []
  const walk = (v: unknown, prefix: string, depth: number) => {
    if (!isRecord(v) || depth > 4) return
    for (const [k, child] of Object.entries(v)) {
      if (out.length >= max) return
      const key = /^[A-Za-z_$][\w$]*$/.test(k) ? k : `['${k.replace(/'/g, '')}']`
      const path = prefix ? (key.startsWith('[') ? prefix + key : `${prefix}.${key}`) : key
      out.push({ path, sample: child })
      walk(Array.isArray(child) ? (child as unknown[])[0] : child, path, depth + 1)
    }
  }
  walk(firstItem(value), '', 0)
  return out
}

const isNumeric = (v: unknown) =>
  typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v)))

const isBlank = (v: unknown) =>
  v === undefined ||
  v === null ||
  (typeof v === 'string' && !v.trim()) ||
  (Array.isArray(v) && v.length === 0) ||
  (isRecord(v) && Object.keys(v).length === 0)

function test(rule: ConditionRule, scope: ExpressionScope): boolean | null {
  const l = resolveExpression(rule.left, scope)
  if (l.missing.length) return null
  if (rule.operator === 'isEmpty') return isBlank(l.value)
  if (rule.operator === 'isNotEmpty') return !isBlank(l.value)
  const r = resolveExpression(rule.right ?? '', scope)
  if (r.missing.length) return null
  const a = l.value
  const b = r.value
  const sa = asText(a)
  const sb = asText(b)
  switch (rule.operator) {
    case 'equals':
      return isNumeric(a) && isNumeric(b) ? Number(a) === Number(b) : sa === sb
    case 'notEquals':
      return isNumeric(a) && isNumeric(b) ? Number(a) !== Number(b) : sa !== sb
    case 'contains':
      return Array.isArray(a) ? a.some((x) => asText(x) === sb) : sa.includes(sb)
    case 'notContains':
      return Array.isArray(a) ? !a.some((x) => asText(x) === sb) : !sa.includes(sb)
    case 'startsWith':
      return sa.startsWith(sb)
    case 'endsWith':
      return sa.endsWith(sb)
    case 'gt':
      return isNumeric(a) && isNumeric(b) ? Number(a) > Number(b) : sa > sb
    case 'lt':
      return isNumeric(a) && isNumeric(b) ? Number(a) < Number(b) : sa < sb
  }
}

/**
 * Whether the conditions hold for `scope`. `null` when a value they use isn't there (no sample yet),
 * or when there's no rule.
 */
function evaluateConditions(value: unknown, scope: ExpressionScope): boolean | null {
  const c = asConditions(value)
  const rules = c.rules.filter((r) => r.left.trim())
  if (!rules.length) return null
  const results = rules.map((r) => test(r, scope))
  if (c.combinator === 'and') {
    if (results.includes(false)) return false
    return results.includes(null) ? null : true
  }
  if (results.includes(true)) return true
  return results.includes(null) ? null : false
}

/** Reads a stored conditions value, whatever shape it arrives in. */
function asConditions(v: unknown): ConditionsValue {
  if (!isRecord(v)) return { combinator: 'and', rules: [] }
  const rules = Array.isArray(v.rules)
    ? (v.rules as unknown[]).filter(isRecord).map((r) => ({
        left: typeof r.left === 'string' ? r.left : '',
        operator: OPERATORS.includes(r.operator as ConditionOperator)
          ? (r.operator as ConditionOperator)
          : ('equals' as const),
        right: typeof r.right === 'string' ? r.right : '',
      }))
    : []
  return { combinator: v.combinator === 'or' ? 'or' : 'and', rules }
}

const asKeyValues = (v: unknown): KeyValueItem[] =>
  Array.isArray(v)
    ? (v as unknown[]).filter(isRecord).map((r) => ({
        key: typeof r.key === 'string' ? r.key : '',
        value: typeof r.value === 'string' ? r.value : '',
      }))
    : []

/** Turns `keyValue` rows into an object, filling expressions from `scope` when given. */
function keyValuesToObject(v: unknown, scope?: ExpressionScope): Record<string, string> {
  const out: Record<string, string> = {}
  for (const { key, value } of asKeyValues(v))
    if (key.trim() && !FORBIDDEN.has(key.trim()))
      out[key.trim()] = scope ? resolveExpression(value, scope).text : value
  return out
}

/** The JSON parse error of a code field's text, or null when it parses (or is empty). */
function jsonError(text: unknown): string | null {
  if (typeof text !== 'string' || !text.trim()) return null
  try {
    JSON.parse(text)
    return null
  } catch (e) {
    return e instanceof Error ? e.message : 'invalid'
  }
}

/** What the fields of the open node can reach: suggestions, a scope for previews, credentials. */
interface NodeFieldsEnv {
  suggestions: ExpressionVariable[]
  /** Null when there's nothing to preview against (no sample data, no variables). */
  scope: ExpressionScope | null
  credentials: readonly NodeCredential[]
  onCreateCredential?: ((type: string) => Promise<NodeCredential | undefined>) | undefined
  announce: (message: string) => void
}

const NodeFieldsContext = React.createContext<NodeFieldsEnv>({
  suggestions: [],
  scope: null,
  credentials: [],
  announce: () => undefined,
})

const useFieldsEnv = () => React.use(NodeFieldsContext)

/** The `{{` left open before the caret: where it starts and what's typed after it. */
function openExpression(text: string, caret: number) {
  const before = text.slice(0, caret)
  const start = before.lastIndexOf('{{')
  if (start < 0 || before.slice(start).includes('}}')) return null
  const query = before.slice(start + 2)
  if (/[\n{}]/.test(query)) return null
  return { start, query: query.trim() }
}

const sampleText = (v: unknown) => {
  const s = asText(v)
  return s.length > 40 ? `${s.slice(0, 39)}…` : s
}

interface ExpressionInputProps {
  id: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string | undefined
  readOnly?: boolean
  /** A textarea instead of a one-line input. */
  multiline?: boolean
  rows?: number | undefined
  /** Show the resolved value under the field (default: true). */
  preview?: boolean
  className?: string
  'aria-invalid'?: boolean | undefined
  'aria-describedby'?: string | undefined
  'aria-label'?: string | undefined
  'aria-labelledby'?: string | undefined
}

/**
 * A text field that takes `{{ }}` expressions. Typing `{{` (or the braces button) lists the values
 * the node can use; arrows pick, Enter inserts, Escape closes. The field keeps its textbox role and
 * points at the active suggestion with `aria-activedescendant`.
 */
function ExpressionInput({
  id,
  value,
  onValueChange,
  placeholder,
  readOnly = false,
  multiline = false,
  rows,
  preview = true,
  className,
  ...aria
}: ExpressionInputProps) {
  const t = useCoreloomI18n().messages.nodeEditor
  const env = useFieldsEnv()
  const listId = `${id}-suggestions`
  const ref = React.useRef<HTMLInputElement & HTMLTextAreaElement>(null)
  const [open, setOpen] = React.useState<{ start: number; query: string } | null>(null)
  const [active, setActive] = React.useState(0)
  const q = open?.query.toLowerCase() ?? ''
  const matches = open
    ? env.suggestions.filter((s) => s.path.toLowerCase().includes(q)).slice(0, 50)
    : []
  const shown = open !== null && matches.length > 0
  const current = Math.min(active, matches.length - 1)

  const sync = (el: HTMLInputElement | HTMLTextAreaElement) => {
    const next = readOnly ? null : openExpression(el.value, el.selectionStart ?? el.value.length)
    if (next?.query !== open?.query || (next === null) !== (open === null)) {
      setActive(0)
      if (next && !open) {
        const n = env.suggestions.length
        if (n) env.announce(t.suggestions(n))
      }
    }
    setOpen(next)
  }

  const insert = (path: string) => {
    const el = ref.current
    if (!el || !open) return
    const caret = el.selectionStart
    const after = value.slice(caret).replace(/^\s*\}\}/, '')
    const token = `{{ ${path} }}`
    const next = value.slice(0, open.start) + token + after
    onValueChange(next)
    setOpen(null)
    const pos = open.start + token.length
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(pos, pos)
    })
  }

  const startExpression = () => {
    const el = ref.current
    if (!el) return
    const caret = el.selectionStart
    const next = `${value.slice(0, caret)}{{ ${value.slice(caret)}`
    onValueChange(next)
    const pos = caret + 3
    setOpen({ start: caret, query: '' })
    setActive(0)
    env.announce(t.suggestions(env.suggestions.length))
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(pos, pos)
    })
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!shown) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const d = e.key === 'ArrowDown' ? 1 : -1
      setActive((current + d + matches.length) % matches.length)
    } else if (e.key === 'Enter') {
      const m = matches.at(current)
      if (!m) return
      e.preventDefault()
      insert(m.path)
    } else if (e.key === 'Escape') {
      // Close the list, not the dialog or panel around the field.
      e.preventDefault()
      e.stopPropagation()
      setOpen(null)
    }
  }

  const shared = {
    id,
    value,
    placeholder,
    readOnly,
    autoComplete: 'off',
    spellCheck: false,
    'aria-autocomplete': 'list' as const,
    'aria-controls': shown ? listId : undefined,
    'aria-activedescendant': shown ? `${listId}-${String(current)}` : undefined,
    onKeyDown,
    onBlur: () => {
      setOpen(null)
    },
    onSelect: (e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      sync(e.currentTarget)
    },
    ...aria,
  }

  const canInsert = !readOnly && env.suggestions.length > 0
  const result =
    preview && env.scope && hasExpression(value) ? resolveExpression(value, env.scope) : null

  return (
    <div className={cn('relative flex min-w-0 flex-col gap-1', className)}>
      <div className="relative">
        {multiline ? (
          <Textarea
            ref={ref}
            rows={rows ?? 4}
            className={cn(canInsert && 'pr-9')}
            onChange={(e) => {
              onValueChange(e.target.value)
              sync(e.currentTarget)
            }}
            {...shared}
          />
        ) : (
          <Input
            ref={ref}
            className={cn(canInsert && 'pr-9')}
            onChange={(e) => {
              onValueChange(e.target.value)
              sync(e.currentTarget)
            }}
            {...shared}
          />
        )}
        {canInsert && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t.insertValue}
            className={cn('absolute right-1 size-7', multiline ? 'bottom-1' : 'top-1')}
            onMouseDown={(e) => {
              // Keep the caret where it is in the field.
              e.preventDefault()
            }}
            onClick={startExpression}
          >
            <BracesIcon aria-hidden />
          </Button>
        )}
        {shown && (
          <ul
            id={listId}
            role="listbox"
            aria-label={t.insertValue}
            className="absolute inset-x-0 top-full z-(--z-popover) m-0 mt-1 max-h-56 list-none overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-lg"
          >
            {matches.map((m, i) => (
              <li
                key={m.path}
                id={`${listId}-${String(i)}`}
                role="option"
                aria-selected={i === current}
                onMouseDown={(e) => {
                  e.preventDefault()
                  insert(m.path)
                }}
                onMouseEnter={() => {
                  setActive(i)
                }}
                className={cn(
                  'flex cursor-pointer items-baseline gap-2 rounded-sm px-2 py-1.5 text-[12.5px]',
                  i === current && 'bg-accent',
                )}
              >
                <span className="truncate font-mono text-foreground">{m.path}</span>
                {m.sample !== undefined && (
                  <span className="ml-auto max-w-[45%] shrink-0 truncate text-muted-foreground">
                    {sampleText(m.sample)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {result && (
        <p className="m-0 flex min-w-0 flex-col gap-0.5 rounded-sm bg-inset px-2 py-1 text-[12px] text-fg-secondary">
          <span className="font-mono text-[10.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            {t.preview}
          </span>
          <span className="break-words whitespace-pre-wrap text-foreground">
            {result.text || '—'}
          </span>
          {result.missing.length > 0 && (
            <span className="text-warning">{t.missing(result.missing.join(', '))}</span>
          )}
        </p>
      )}
    </div>
  )
}

interface ControlProps<V> {
  id: string
  value: V
  onChange: (value: V) => void
  readOnly: boolean
  invalid?: boolean
  describedBy?: string | undefined
  labelId: string
}

/** Rows of "value · operator · compare to", matched all or any. */
function ConditionsControl({
  id,
  value,
  onChange,
  readOnly,
  describedBy,
  labelId,
}: ControlProps<unknown>) {
  const t = useCoreloomI18n().messages.nodeEditor.conditions
  const env = useFieldsEnv()
  const c = asConditions(value)
  const set = (patch: Partial<ConditionsValue>) => {
    onChange({ ...c, ...patch })
  }
  const setRule = (i: number, patch: Partial<ConditionRule>) => {
    set({ rules: c.rules.map((r, j) => (j === i ? { ...r, ...patch } : r)) })
  }
  const addRef = React.useRef<HTMLButtonElement>(null)
  const result = env.scope ? evaluateConditions(c, env.scope) : null
  return (
    <div
      id={id}
      role="group"
      aria-labelledby={labelId}
      aria-describedby={describedBy}
      className="flex flex-col gap-2"
    >
      {c.rules.length > 1 && (
        <Select
          value={c.combinator}
          disabled={readOnly}
          onValueChange={(v) => {
            set({ combinator: v === 'or' ? 'or' : 'and' })
          }}
        >
          <SelectTrigger size="sm" className="w-full" aria-label={t.match}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="and">{t.all}</SelectItem>
            <SelectItem value="or">{t.any}</SelectItem>
          </SelectContent>
        </Select>
      )}
      {c.rules.map((r, i) => {
        const n = i + 1
        const rid = `${id}-r${String(i)}`
        return (
          <div
            // eslint-disable-next-line @eslint-react/no-array-index-key -- rules have no id; rows are only added at the end or removed, and each row is stateless
            key={i}
            role="group"
            aria-label={t.rule(n)}
            className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-inset/40 p-2"
          >
            <div className="flex items-start gap-1.5">
              <ExpressionInput
                id={`${rid}-left`}
                className="flex-1"
                value={r.left}
                placeholder="{{ email }}"
                readOnly={readOnly}
                preview={false}
                aria-label={t.value}
                onValueChange={(v) => {
                  setRule(i, { left: v })
                }}
              />
              {!readOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t.remove(n)}
                  className="mt-0.5"
                  onClick={() => {
                    set({ rules: c.rules.filter((_, j) => j !== i) })
                    requestAnimationFrame(() => addRef.current?.focus())
                  }}
                >
                  <XIcon aria-hidden />
                </Button>
              )}
            </div>
            <Select
              value={r.operator}
              disabled={readOnly}
              onValueChange={(v) => {
                setRule(i, { operator: v as ConditionOperator })
              }}
            >
              <SelectTrigger size="sm" className="w-full" aria-label={t.operator}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPERATORS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {t.operators[o]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!UNARY.has(r.operator) && (
              <ExpressionInput
                id={`${rid}-right`}
                value={r.right ?? ''}
                readOnly={readOnly}
                preview={false}
                aria-label={t.compareTo}
                onValueChange={(v) => {
                  setRule(i, { right: v })
                }}
              />
            )}
          </div>
        )
      })}
      {!readOnly && (
        <Button
          ref={addRef}
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => {
            set({ rules: [...c.rules, { left: '', operator: 'equals', right: '' }] })
            requestAnimationFrame(() => {
              document.getElementById(`${id}-r${String(c.rules.length)}-left`)?.focus()
            })
          }}
        >
          <PlusIcon aria-hidden />
          {t.add}
        </Button>
      )}
      {result !== null && <p className="m-0 text-[12px] text-fg-secondary">{t.result(result)}</p>}
    </div>
  )
}

/** Rows of key and value (headers, query parameters, fields to set). Values take expressions. */
function KeyValueControl({
  id,
  value,
  onChange,
  readOnly,
  describedBy,
  labelId,
  keyPlaceholder,
  valuePlaceholder,
}: ControlProps<unknown> & {
  keyPlaceholder?: string | undefined
  valuePlaceholder?: string | undefined
}) {
  const t = useCoreloomI18n().messages.nodeEditor.keyValue
  const rows = asKeyValues(value)
  const addRef = React.useRef<HTMLButtonElement>(null)
  const setRow = (i: number, patch: Partial<KeyValueItem>) => {
    onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  }
  return (
    <div
      id={id}
      role="group"
      aria-labelledby={labelId}
      aria-describedby={describedBy}
      className="flex flex-col gap-1.5"
    >
      {rows.map((r, i) => {
        const n = i + 1
        return (
          <div
            // eslint-disable-next-line @eslint-react/no-array-index-key -- rows have no id; they're only added at the end or removed, and each row is stateless
            key={i}
            role="group"
            aria-label={t.row(n)}
            // Key above value: a narrow panel leaves no room for both on one line.
            className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-inset/40 p-2"
          >
            <div className="flex items-start gap-1.5">
              <Input
                id={`${id}-k${String(i)}`}
                value={r.key}
                placeholder={keyPlaceholder ?? t.key}
                readOnly={readOnly}
                autoComplete="off"
                aria-label={t.key}
                className="flex-1 font-mono text-[12.5px]"
                onChange={(e) => {
                  setRow(i, { key: e.target.value })
                }}
              />
              {!readOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t.remove(n)}
                  className="mt-0.5"
                  onClick={() => {
                    onChange(rows.filter((_, j) => j !== i))
                    requestAnimationFrame(() => addRef.current?.focus())
                  }}
                >
                  <XIcon aria-hidden />
                </Button>
              )}
            </div>
            <ExpressionInput
              id={`${id}-v${String(i)}`}
              value={r.value}
              placeholder={valuePlaceholder ?? t.value}
              readOnly={readOnly}
              aria-label={t.value}
              onValueChange={(v) => {
                setRow(i, { value: v })
              }}
            />
          </div>
        )
      })}
      {!readOnly && (
        <Button
          ref={addRef}
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => {
            onChange([...rows, { key: '', value: '' }])
            requestAnimationFrame(() => {
              document.getElementById(`${id}-k${String(rows.length)}`)?.focus()
            })
          }}
        >
          <PlusIcon aria-hidden />
          {t.add}
        </Button>
      )}
    </div>
  )
}

/** JSON or code, in a monospace box. JSON is checked as you type. */
function CodeControl({
  id,
  value,
  onChange,
  readOnly,
  invalid,
  describedBy,
  rows,
  placeholder,
}: ControlProps<unknown> & { rows?: number | undefined; placeholder?: string | undefined }) {
  return (
    <Textarea
      id={id}
      value={typeof value === 'string' ? value : ''}
      rows={rows ?? 6}
      placeholder={placeholder}
      readOnly={readOnly}
      spellCheck={false}
      autoComplete="off"
      autoCapitalize="off"
      className="font-mono text-[12.5px] leading-5"
      aria-invalid={invalid ? true : undefined}
      aria-describedby={describedBy}
      onChange={(e) => {
        onChange(e.target.value)
      }}
    />
  )
}

/** Picks one of the app's saved credentials of a type; "New credential" asks the app for one. */
function CredentialControl({
  id,
  value,
  onChange,
  readOnly,
  invalid,
  describedBy,
  labelId,
  credentialType,
}: ControlProps<unknown> & { credentialType: string }) {
  const t = useCoreloomI18n().messages.nodeEditor.credential
  const env = useFieldsEnv()
  const options = env.credentials.filter((c) => c.type === credentialType)
  const [busy, setBusy] = React.useState(false)
  const create = env.onCreateCredential
  return (
    <div className="flex flex-col gap-1.5">
      {options.length > 0 || typeof value === 'string' ? (
        <Select
          value={typeof value === 'string' ? value : ''}
          disabled={readOnly}
          onValueChange={(v) => {
            onChange(v)
          }}
        >
          <SelectTrigger
            id={id}
            className="w-full"
            aria-labelledby={labelId}
            aria-invalid={invalid ? true : undefined}
            aria-describedby={describedBy}
          >
            <SelectValue placeholder={t.choose} />
          </SelectTrigger>
          <SelectContent>
            {options.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <p id={id} className="m-0 text-[12.5px] text-muted-foreground">
          {t.none}
        </p>
      )}
      {create && !readOnly && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          disabled={busy}
          aria-busy={busy || undefined}
          onClick={() => {
            setBusy(true)
            void create(credentialType)
              .then((c) => {
                if (c) onChange(c.id)
              })
              .catch(() => undefined)
              .finally(() => {
                setBusy(false)
              })
          }}
        >
          <PlusIcon aria-hidden />
          {t.create}
        </Button>
      )}
    </div>
  )
}

const MAX_ROWS = 60

/** A node's data, as a tree: items, then each field. Nested objects fold. */
/** The path of `key` under `prefix`, written as an expression would: `a.b`, `a['c d']`, `a[0]`. */
function childPath(prefix: string, key: string, index: boolean) {
  const part = index
    ? `[${key}]`
    : /^[A-Za-z_$][\w$]*$/.test(key)
      ? key
      : `['${key.replace(/'/g, '')}']`
  if (!prefix) return index ? key : part
  return part.startsWith('[') ? prefix + part : `${prefix}.${part}`
}

/**
 * A node's data, as a tree: items, then each field. Nested objects fold. With `draggable`, each field
 * can be dragged into a setting, where it lands as `{{ path }}` (typing `{{` does the same from the
 * keyboard).
 */
function DataView({
  value,
  draggable = false,
  className,
}: {
  value: unknown
  draggable?: boolean
  className?: string
}) {
  const t = useCoreloomI18n().messages.nodeEditor
  if (Array.isArray(value)) {
    const items = value as unknown[]
    return (
      <div data-slot="node-data" className={cn('flex flex-col gap-1.5', className)}>
        <p className="m-0 text-[12px] text-muted-foreground">{t.items(items.length)}</p>
        {items.slice(0, 20).map((item, i) => (
          <details
            // eslint-disable-next-line @eslint-react/no-array-index-key -- items are a read-only sample; their position is their identity
            key={i}
            open={i === 0}
            className="rounded-md border border-border-subtle"
          >
            <summary className="cursor-pointer rounded-md px-2 py-1 text-[12.5px] font-medium text-fg-secondary outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
              {t.item(i + 1)}
            </summary>
            <div className="border-t border-border-subtle px-2 py-1.5">
              <DataTree value={item} path="" draggable={draggable} />
            </div>
          </details>
        ))}
        {items.length > 20 && (
          <p className="m-0 text-[12px] text-muted-foreground">{t.more(items.length - 20)}</p>
        )}
      </div>
    )
  }
  return (
    <div
      data-slot="node-data"
      className={cn('rounded-md border border-border-subtle px-2 py-1.5', className)}
    >
      <DataTree value={value} path="" draggable={draggable} />
    </div>
  )
}

function Leaf({ value }: { value: unknown }) {
  if (typeof value === 'string')
    return <span className="break-all whitespace-pre-wrap text-foreground">{value}</span>
  if (value === null || value === undefined)
    return <span className="text-muted-foreground">{String(value)}</span>
  if (Array.isArray(value) && value.length === 0)
    return <span className="text-muted-foreground">[]</span>
  if (isRecord(value)) return <span className="text-muted-foreground">{'{}'}</span>
  return <span className="font-mono text-primary-text">{asText(value)}</span>
}

function DataTree({
  value,
  path,
  draggable,
}: {
  value: unknown
  path: string
  draggable: boolean
}) {
  const t = useCoreloomI18n().messages.nodeEditor
  const entries: [string, unknown][] = isRecord(value)
    ? Object.entries(value)
    : Array.isArray(value)
      ? (value as unknown[]).map((v, i) => [String(i), v])
      : []
  if (!entries.length) return <Leaf value={value} />
  return (
    <ul className="m-0 flex list-none flex-col gap-0.5 p-0 text-[12.5px]">
      {entries.slice(0, MAX_ROWS).map(([k, v]) => {
        const p = childPath(path, k, Array.isArray(value))
        const key = (
          <span
            draggable={draggable || undefined}
            onDragStart={
              draggable
                ? (e) => {
                    e.dataTransfer.setData('text/plain', `{{ ${p} }}`)
                    e.dataTransfer.effectAllowed = 'copy'
                  }
                : undefined
            }
            title={draggable ? `{{ ${p} }}` : undefined}
            className={cn(
              'shrink-0 font-mono text-fg-secondary',
              draggable && 'cursor-grab rounded-sm hover:bg-accent active:cursor-grabbing',
            )}
          >
            {k}
          </span>
        )
        const nested =
          (isRecord(v) && Object.keys(v).length > 0) || (Array.isArray(v) && v.length > 0)
        return (
          <li key={k} className="min-w-0">
            {nested ? (
              <details>
                <summary className="cursor-pointer rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
                  {key}
                  <span className="ml-1.5 font-sans text-muted-foreground">
                    {Array.isArray(v) ? t.items(v.length) : t.fields(Object.keys(v).length)}
                  </span>
                </summary>
                <div className="ml-1.5 border-l border-border-subtle pl-2.5">
                  <DataTree value={v} path={p} draggable={draggable} />
                </div>
              </details>
            ) : (
              <span className="flex min-w-0 gap-2">
                {key}
                <Leaf value={v} />
              </span>
            )}
          </li>
        )
      })}
      {entries.length > MAX_ROWS && (
        <li className="text-muted-foreground">{t.more(entries.length - MAX_ROWS)}</li>
      )}
    </ul>
  )
}

export {
  asConditions,
  CodeControl,
  type ConditionOperator,
  type ConditionRule,
  ConditionsControl,
  type ConditionsValue,
  CredentialControl,
  dataPaths,
  DataView,
  evaluateConditions,
  ExpressionInput,
  type ExpressionInputProps,
  type ExpressionScope,
  type ExpressionVariable,
  firstItem,
  hasExpression,
  jsonError,
  KeyValueControl,
  type KeyValueItem,
  keyValuesToObject,
  type NodeCredential,
  NodeFieldsContext,
  type NodeFieldsEnv,
  readPath,
  resolveExpression,
}
