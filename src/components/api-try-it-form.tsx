'use client'

// Coreloom UI — API try it, the request part. The form state (a reducer, so the fields change
// together), the parameter fields grouped by where they go, the token, extra headers, the JSON
// body, and the Send / Cancel / Copy as cURL row.
import { CopyIcon, SendIcon, XIcon } from 'lucide-react'
import * as React from 'react'

import {
  type ApiParameter,
  type ApiParamValues,
  type ApiRequest,
  toCurl,
} from '@/components/api-try-it-request'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { JsonInput } from '@/components/ui/json-input'
import { KeyValueEditor, type KeyValuePair } from '@/components/ui/key-value-editor'
import { toast } from '@/components/ui/sonner'
import { Spinner } from '@/components/ui/spinner'
import { useCoreloomI18n } from '@/lib/i18n'

interface FormState {
  values: ApiParamValues
  headers: KeyValuePair[]
  body: string
  token: string
  /** Set by the first Send: required fields show their errors from then on. */
  checked: boolean
}

type FormAction =
  | { type: 'value'; name: string; value: string }
  | { type: 'headers'; headers: KeyValuePair[] }
  | { type: 'body'; body: string }
  | { type: 'token'; token: string }
  | { type: 'check' }

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'value':
      return { ...state, values: { ...state.values, [action.name]: action.value } }
    case 'headers':
      return { ...state, headers: action.headers }
    case 'body':
      return { ...state, body: action.body }
    case 'token':
      return { ...state, token: action.token }
    case 'check':
      return { ...state, checked: true }
  }
}

const sectionLabel =
  'font-mono text-[11px] font-semibold tracking-[0.08em] text-fg-secondary uppercase'

function ParamField({
  param,
  id,
  value,
  invalid,
  onChange,
}: {
  param: ApiParameter
  id: string
  value: string
  invalid: boolean
  onChange: (value: string) => void
}) {
  const t = useCoreloomI18n().messages.apiTryIt
  const required = param.required === true || param.in === 'path'
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [param.description ? hintId : '', invalid ? errorId : '']
    .filter(Boolean)
    .join(' ')
  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id} className="flex flex-wrap items-baseline gap-2">
        <span className="font-mono text-[13px] break-all">{param.name}</span>
        {required ? (
          <span className="text-[12px] font-normal text-fg-secondary">{t.required}</span>
        ) : null}
      </FieldLabel>
      <Input
        id={id}
        value={value}
        placeholder={param.example}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy || undefined}
        autoComplete="off"
        spellCheck={false}
        className="font-mono text-[13px]"
        onChange={(e) => {
          onChange(e.target.value)
        }}
      />
      {param.description ? (
        <FieldDescription id={hintId}>{param.description}</FieldDescription>
      ) : null}
      {invalid ? <FieldError id={errorId}>{t.missing(param.name)}</FieldError> : null}
    </Field>
  )
}

function ParamFields({
  legend,
  params,
  form,
  missing,
  idFor,
  onChange,
}: {
  legend: string
  params: ApiParameter[]
  form: FormState
  missing: ReadonlySet<string>
  idFor: (name: string) => string
  onChange: (name: string, value: string) => void
}) {
  if (params.length === 0) return null
  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className={`mb-2 ${sectionLabel}`}>{legend}</legend>
      {params.map((p) => (
        <ParamField
          key={`${p.in}-${p.name}`}
          param={p}
          id={idFor(p.name)}
          value={form.values[p.name] ?? ''}
          invalid={form.checked && missing.has(p.name)}
          onChange={(value) => {
            onChange(p.name, value)
          }}
        />
      ))}
    </fieldset>
  )
}

function TokenField({
  id,
  label,
  header,
  value,
  onChange,
}: {
  id: string
  label?: string
  header: string
  value: string
  onChange: (value: string) => void
}) {
  const t = useCoreloomI18n().messages.apiTryIt
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label ?? t.token}</FieldLabel>
      <Input
        id={id}
        type="password"
        autoComplete="off"
        spellCheck={false}
        value={value}
        aria-describedby={`${id}-hint`}
        className="font-mono text-[13px]"
        onChange={(e) => {
          onChange(e.target.value)
        }}
      />
      <FieldDescription id={`${id}-hint`}>{t.tokenHint(header)}</FieldDescription>
    </Field>
  )
}

function HeadersField({
  id,
  value,
  onChange,
}: {
  id: string
  value: KeyValuePair[]
  onChange: (headers: KeyValuePair[]) => void
}) {
  const t = useCoreloomI18n().messages.apiTryIt
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p id={id} className={sectionLabel}>
        {t.headers}
      </p>
      <KeyValueEditor
        value={value}
        aria-labelledby={id}
        keyLabel={t.headerName}
        valueLabel={t.headerValue}
        keyPlaceholder="X-Request-Id"
        addLabel={t.addHeader}
        onValueChange={onChange}
      />
    </div>
  )
}

function BodyField({
  id,
  value,
  invalid,
  onChange,
}: {
  id: string
  value: string
  invalid: boolean
  onChange: (body: string) => void
}) {
  const t = useCoreloomI18n().messages.apiTryIt
  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id}>{t.body}</FieldLabel>
      {/* JsonInput says where the JSON breaks (on blur). Ctrl/⌘+Enter sends from here too: the
          form's key handler catches it on the way up. */}
      <JsonInput
        id={id}
        value={value}
        rows={8}
        aria-invalid={invalid || undefined}
        onValueChange={onChange}
      />
    </Field>
  )
}

function CopyCurlButton({ request }: { request: ApiRequest | undefined }) {
  const { messages } = useCoreloomI18n()
  const t = messages.apiTryIt
  return (
    <Button
      type="button"
      variant="outline"
      disabled={!request}
      onClick={async () => {
        if (!request) return
        try {
          await navigator.clipboard.writeText(toCurl(request))
          toast.success(t.curlCopied)
        } catch {
          toast.error(messages.copy.failed)
        }
      }}
    >
      <CopyIcon />
      {t.copyCurl}
    </Button>
  )
}

function SendActions({
  formId,
  sending,
  request,
  sendRef,
  onCancel,
}: {
  /** The form Send submits: the row sits outside it. */
  formId: string
  sending: boolean
  request: ApiRequest | undefined
  sendRef: React.Ref<HTMLButtonElement>
  onCancel: () => void
}) {
  const t = useCoreloomI18n().messages.apiTryIt
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Stays focusable while sending (aria-disabled, not disabled) so focus isn't lost. */}
      <Button
        ref={sendRef}
        type="submit"
        form={formId}
        aria-disabled={sending || undefined}
        aria-keyshortcuts="Control+Enter Meta+Enter"
      >
        {sending ? <Spinner /> : <SendIcon />}
        {sending ? t.sending : t.send}
      </Button>
      {sending ? (
        <Button type="button" variant="ghost" onClick={onCancel}>
          <XIcon />
          {t.cancel}
        </Button>
      ) : null}
      <CopyCurlButton request={request} />
    </div>
  )
}

export {
  BodyField,
  type FormAction,
  formReducer,
  type FormState,
  HeadersField,
  ParamFields,
  SendActions,
  TokenField,
}
