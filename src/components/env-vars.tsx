'use client'

// Coreloom UI — EnvVars (settings block). A project's environment variables, per environment
// (Production, Preview, Development): values masked when secret, Add, Edit, Delete, Import a pasted
// `.env` file (parsed and previewed before anything is sent), and Compare, which lines environments
// up to show what is missing or different. Your API stores them: every change is a callback.
import { ArrowLeftRightIcon, FileUpIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppForm } from '@/components/ui/form'
import { Popconfirm } from '@/components/ui/popconfirm'
import { SecretValue } from '@/components/ui/secret-value'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { type DotenvEntry, ENV_KEY, parseDotenv } from '@/lib/dotenv'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface EnvEnvironment {
  id: string
  name: string
}

interface EnvVariable {
  key: string
  /** The value in each environment, by environment id; missing where it isn't set. */
  values: Partial<Record<string, string>>
  /** Masked until revealed. */
  secret?: boolean
}

interface EnvVariableInput {
  key: string
  value: string
  secret: boolean
  /** The environments to set it in. */
  environments: string[]
}

type EnvComparison = 'same' | 'different' | 'missing'

function comparison(missing: boolean, distinctValues: number): EnvComparison {
  if (missing) return 'missing'
  return distinctValues > 1 ? 'different' : 'same'
}

/** For each variable: set to the same value everywhere, set with different values, or missing somewhere. */
function compareEnvironments(
  variables: readonly EnvVariable[],
  environments: readonly string[],
): { key: string; status: EnvComparison; missing: string[] }[] {
  return variables.map((v) => {
    const missing = environments.filter((e) => v.values[e] === undefined)
    const set = new Set(environments.flatMap((e) => v.values[e] ?? []))
    return { key: v.key, status: comparison(missing.length > 0, set.size), missing }
  })
}

type DialogState =
  | { kind: 'closed' }
  | { kind: 'add' }
  | { kind: 'edit'; variable: EnvVariable }
  | { kind: 'import' }

function VariableDialog({
  state,
  environments,
  environment,
  onClose,
  onSet,
}: {
  state: { kind: 'add' } | { kind: 'edit'; variable: EnvVariable }
  environments: EnvEnvironment[]
  environment: string
  onClose: () => void
  onSet: (input: EnvVariableInput) => unknown
}) {
  const t = useCoreloomI18n().messages.envVars
  const editing = state.kind === 'edit' ? state.variable : undefined
  const envName = environments.find((e) => e.id === environment)?.name ?? environment
  const form = useAppForm({
    defaultValues: {
      key: editing?.key ?? '',
      value: editing?.values[environment] ?? '',
      secret: editing?.secret ?? true,
      environments: [environment],
    },
    validators: {
      onChange: z.object({
        key: z.string().trim().regex(ENV_KEY, t.keyInvalid),
        value: z.string(),
        secret: z.boolean(),
        environments: z.array(z.string()).min(1, t.environmentsRequired),
      }),
    },
    onSubmit: async ({ value }) => {
      await onSet({ ...value, key: value.key.trim() })
      onClose()
    },
  })
  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <DialogHeader>
        <DialogTitle>{editing ? t.editTitle(editing.key) : t.addTitle}</DialogTitle>
        <DialogDescription>
          {editing ? t.editDescription(envName) : t.addDescription}
        </DialogDescription>
      </DialogHeader>
      {!editing && (
        <form.AppField name="key">
          {(field) => (
            <field.TextField
              label={t.key}
              placeholder="DATABASE_URL"
              autoComplete="off"
              spellCheck={false}
              className="font-mono"
            />
          )}
        </form.AppField>
      )}
      <form.AppField name="value">
        {(field) => (
          <field.TextareaField
            label={t.value}
            rows={3}
            spellCheck={false}
            autoComplete="off"
            className="font-mono text-[12.5px]"
          />
        )}
      </form.AppField>
      <form.AppField name="secret">
        {(field) => <field.SwitchField label={t.secret} description={t.secretHint} />}
      </form.AppField>
      {!editing && environments.length > 1 && (
        <form.AppField name="environments">
          {(field) => (
            <field.CheckboxGroupField
              label={t.environments}
              options={environments.map((e) => ({ value: e.id, label: e.name }))}
            />
          )}
        </form.AppField>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {t.cancel}
        </Button>
        <form.AppForm>
          <form.SubmitButton pendingLabel={t.saving}>{t.save}</form.SubmitButton>
        </form.AppForm>
      </DialogFooter>
    </form>
  )
}

function ImportDialog({
  environment,
  variables,
  onClose,
  onImport,
}: {
  environment: EnvEnvironment
  variables: EnvVariable[]
  onClose: () => void
  onImport: (environment: string, entries: DotenvEntry[]) => unknown
}) {
  const t = useCoreloomI18n().messages.envVars
  const [text, setText] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const id = React.useId()
  const parsed = React.useMemo(() => parseDotenv(text), [text])
  const replaced = parsed.entries.filter((e) =>
    variables.some((v) => v.key === e.key && v.values[environment.id] !== undefined),
  ).length
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!parsed.entries.length) return
        setBusy(true)
        void Promise.resolve(onImport(environment.id, parsed.entries))
          .then(onClose)
          .finally(() => {
            setBusy(false)
          })
      }}
    >
      <DialogHeader>
        <DialogTitle>{t.importTitle(environment.name)}</DialogTitle>
        <DialogDescription>{t.importDescription}</DialogDescription>
      </DialogHeader>
      <label htmlFor={`${id}-text`} className="sr-only">
        {t.importLabel}
      </label>
      <Textarea
        id={`${id}-text`}
        value={text}
        rows={8}
        spellCheck={false}
        placeholder={'DATABASE_URL=postgres://…\nSTRIPE_KEY="sk_…"'}
        aria-describedby={`${id}-summary`}
        className="font-mono text-[12.5px]"
        onChange={(e) => {
          setText(e.target.value)
        }}
      />
      <div id={`${id}-summary`} role="status" className="flex flex-col gap-1 text-[12.5px]">
        {text.trim() && (
          <p className="m-0 text-fg-secondary">
            {t.importSummary(parsed.entries.length, replaced)}
          </p>
        )}
        {parsed.errors.length > 0 && (
          <p className="m-0 text-destructive">{t.importErrors(parsed.errors.map((e) => e.line))}</p>
        )}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {t.cancel}
        </Button>
        <Button type="submit" disabled={!parsed.entries.length || busy} aria-busy={busy}>
          {t.importConfirm(parsed.entries.length)}
        </Button>
      </DialogFooter>
    </form>
  )
}

function VariableRow({
  variable,
  environment,
  onEdit,
  onDelete,
}: {
  variable: EnvVariable
  environment: EnvEnvironment
  onEdit?: (button: HTMLButtonElement) => void
  onDelete?: () => unknown
}) {
  const t = useCoreloomI18n().messages.envVars
  const value = variable.values[environment.id] ?? ''
  return (
    <li
      data-slot="env-var"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border-subtle px-5 py-3 last:border-b-0"
    >
      <code className="min-w-0 flex-1 basis-48 truncate font-mono text-[13px] font-medium text-foreground">
        {variable.key}
      </code>
      <div className="flex min-w-0 flex-[2] basis-64 items-center">
        {variable.secret ? (
          <SecretValue value={value} label={variable.key} className="max-w-full" />
        ) : (
          <code className="max-w-full truncate rounded-sm bg-inset px-1.5 py-0.5 font-mono text-[12.5px] text-fg-secondary">
            {value || t.empty}
          </code>
        )}
      </div>
      <div className="ml-auto flex gap-1">
        {onEdit && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t.edit(variable.key)}
            onClick={(e) => {
              onEdit(e.currentTarget)
            }}
          >
            <PencilIcon />
          </Button>
        )}
        {onDelete && (
          <Popconfirm
            title={t.deleteTitle(variable.key, environment.name)}
            confirmLabel={t.delete}
            destructive
            onConfirm={onDelete}
          >
            <Button variant="ghost" size="icon-sm" aria-label={t.deleteLabel(variable.key)}>
              <Trash2Icon />
            </Button>
          </Popconfirm>
        )}
      </div>
    </li>
  )
}

function CompareCell({ value, secret }: { value: string | undefined; secret?: boolean }) {
  const t = useCoreloomI18n().messages.envVars
  if (value === undefined)
    return <span className="font-sans text-muted-foreground">{t.notSet}</span>
  if (!secret) return <span className="text-fg-secondary">{value}</span>
  return (
    <span className="text-fg-secondary">
      <span aria-hidden>••••{value.slice(-4)}</span>
      <span className="sr-only">{t.secretEnding(value.slice(-4))}</span>
    </span>
  )
}

const STATUS_VARIANT = { same: 'success', different: 'warning', missing: 'destructive' } as const

function CompareTable({
  variables,
  environments,
}: {
  variables: EnvVariable[]
  environments: EnvEnvironment[]
}) {
  const t = useCoreloomI18n().messages.envVars
  const rows = compareEnvironments(
    variables,
    environments.map((e) => e.id),
  )
  return (
    // relative: the sr-only text in the cells is positioned, and must scroll with the table.
    <div className="relative overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <caption className="sr-only">{t.compare}</caption>
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th scope="col" className="px-5 py-2.5 font-medium">
              {t.key}
            </th>
            {environments.map((e) => (
              <th key={e.id} scope="col" className="px-3 py-2.5 font-medium">
                {e.name}
              </th>
            ))}
            <th scope="col" className="px-5 py-2.5 font-medium">
              {t.status}
            </th>
          </tr>
        </thead>
        <tbody>
          {variables.map((v, i) => (
            <tr key={v.key} className="border-b border-border-subtle last:border-b-0">
              <th scope="row" className="px-5 py-2.5 text-left font-mono font-medium">
                {v.key}
              </th>
              {environments.map((e) => (
                <td key={e.id} className="max-w-48 truncate px-3 py-2.5 font-mono text-[12.5px]">
                  <CompareCell value={v.values[e.id]} secret={v.secret} />
                </td>
              ))}
              <td className="px-5 py-2.5">
                <Badge variant={STATUS_VARIANT[rows[i].status]}>{t.statuses[rows[i].status]}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EnvironmentList({
  environment,
  variables,
  onEdit,
  onDelete,
}: {
  environment: EnvEnvironment
  variables: EnvVariable[]
  onEdit?: (variable: EnvVariable, button: HTMLButtonElement) => void
  onDelete?: (key: string, environment: string) => unknown
}) {
  const t = useCoreloomI18n().messages.envVars
  const listRef = React.useRef<HTMLUListElement>(null)
  const here = variables.filter((v) => v.values[environment.id] !== undefined)
  if (!here.length)
    return (
      <p className="m-0 px-5 py-10 text-center text-[13px] text-muted-foreground">
        {t.emptyEnvironment(environment.name)}
      </p>
    )
  return (
    <ul
      ref={listRef}
      tabIndex={-1}
      aria-label={t.listLabel(environment.name)}
      className="m-0 list-none p-0 outline-none"
    >
      {here.map((v) => (
        <VariableRow
          key={v.key}
          variable={v}
          environment={environment}
          onEdit={
            onEdit
              ? (button) => {
                  onEdit(v, button)
                }
              : undefined
          }
          onDelete={
            onDelete
              ? async () => {
                  await onDelete(v.key, environment.id)
                  // The row and its button are gone: keep focus in the list.
                  listRef.current?.focus()
                }
              : undefined
          }
        />
      ))}
    </ul>
  )
}

function EnvVarsDialog({
  state,
  environments,
  environment,
  variables,
  onSet,
  onImport,
  onClose,
  returnFocus,
}: {
  state: DialogState
  environments: EnvEnvironment[]
  environment: EnvEnvironment | undefined
  variables: EnvVariable[]
  onSet?: (input: EnvVariableInput) => unknown
  onImport?: (environment: string, entries: DotenvEntry[]) => unknown
  onClose: () => void
  returnFocus: React.RefObject<HTMLElement | null>
}) {
  return (
    <Dialog
      open={state.kind !== 'closed'}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        className="sm:max-w-lg"
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          returnFocus.current?.focus()
        }}
      >
        {(state.kind === 'add' || state.kind === 'edit') && onSet && (
          <VariableDialog
            state={state}
            environments={environments}
            environment={environment?.id ?? environments.at(0)?.id ?? ''}
            onClose={onClose}
            onSet={onSet}
          />
        )}
        {state.kind === 'import' && environment && onImport && (
          <ImportDialog
            environment={environment}
            variables={variables}
            onClose={onClose}
            onImport={onImport}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function EnvVars({
  environments,
  variables,
  defaultEnvironment,
  onSet,
  onDelete,
  onImport,
  title,
  description,
  className,
}: {
  environments: EnvEnvironment[]
  variables: EnvVariable[]
  /** The environment shown first (default: the first one). */
  defaultEnvironment?: string
  /** Adds a variable, or changes its value, in the given environments. Shows Add and Edit. */
  onSet?: (input: EnvVariableInput) => unknown
  /** Removes a variable from one environment. Shows Delete. */
  onDelete?: (key: string, environment: string) => unknown
  /** Sets every entry of a pasted `.env` in one environment. Shows Import. */
  onImport?: (environment: string, entries: DotenvEntry[]) => unknown
  title?: React.ReactNode
  description?: React.ReactNode
  className?: string
}) {
  const t = useCoreloomI18n().messages.envVars
  const [tab, setTab] = React.useState(defaultEnvironment ?? environments.at(0)?.id ?? 'compare')
  const [dialog, setDialog] = React.useState<DialogState>({ kind: 'closed' })
  const current = environments.find((e) => e.id === tab)
  // Dialogs open from different buttons; focus goes back to the one that opened it.
  const opener = React.useRef<HTMLElement | null>(null)
  const openDialog = (next: DialogState, button: HTMLElement) => {
    opener.current = button
    setDialog(next)
  }
  const close = () => {
    setDialog({ kind: 'closed' })
  }

  return (
    <Card data-slot="env-vars" className={cn('gap-0 p-0', className)}>
      <CardHeader className="border-b border-border px-5 py-4">
        <CardTitle asChild>
          <h2 className="m-0">{title ?? t.title}</h2>
        </CardTitle>
        <CardDescription>{description ?? t.description}</CardDescription>
        <CardAction className="flex flex-wrap justify-end gap-2">
          {onImport && current && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                openDialog({ kind: 'import' }, e.currentTarget)
              }}
            >
              <FileUpIcon />
              {t.import}
            </Button>
          )}
          {onSet && (
            <Button
              size="sm"
              onClick={(e) => {
                openDialog({ kind: 'add' }, e.currentTarget)
              }}
            >
              <PlusIcon />
              {t.add}
            </Button>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={tab} onValueChange={setTab} className="gap-0">
          <div className="overflow-x-auto border-b border-border px-5 py-2.5">
            <TabsList>
              {environments.map((e) => (
                <TabsTrigger key={e.id} value={e.id}>
                  {e.name}
                </TabsTrigger>
              ))}
              {environments.length > 1 && (
                <TabsTrigger value="compare">
                  <ArrowLeftRightIcon aria-hidden />
                  {t.compare}
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          {environments.map((env) => (
            <TabsContent key={env.id} value={env.id}>
              <EnvironmentList
                environment={env}
                variables={variables}
                onEdit={
                  onSet
                    ? (variable, button) => {
                        openDialog({ kind: 'edit', variable }, button)
                      }
                    : undefined
                }
                onDelete={onDelete}
              />
            </TabsContent>
          ))}
          <TabsContent value="compare">
            <CompareTable variables={variables} environments={environments} />
          </TabsContent>
        </Tabs>
      </CardContent>
      <EnvVarsDialog
        state={dialog}
        environments={environments}
        environment={current}
        variables={variables}
        onSet={onSet}
        onImport={onImport}
        onClose={close}
        returnFocus={opener}
      />
    </Card>
  )
}

export {
  compareEnvironments,
  type EnvComparison,
  type EnvEnvironment,
  type EnvVariable,
  type EnvVariableInput,
  EnvVars,
}
