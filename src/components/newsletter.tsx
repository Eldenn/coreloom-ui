'use client'

// Coreloom UI — Newsletter (newsletter block). Collect an email address: `NewsletterForm` signs
// someone up to a newsletter, `Waitlist` puts them in line for a launch and can show their place
// and a link to share. The app does the sending (`onSubscribe`, `onJoin`); the form checks the
// address, shows the wait, the error your callback throws, and the thank-you, said aloud.
import { CheckIcon } from 'lucide-react'
import * as React from 'react'

import { CopyButton } from '@/components/copy-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Whether a string looks like an email address (something@domain.tld, no spaces). */
function isEmail(value: string) {
  return EMAIL.test(value.trim())
}

/** What `onJoin` may return: the person's place in line and a link that moves them up. */
interface WaitlistResult {
  position?: number
  referralUrl?: string
}

type SignupState<R> =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'invalid'; error: string }
  | { status: 'failed'; error: string }
  | { status: 'done'; result: R }

/** The form's state and its submit handler: checks the address, awaits `send`, keeps its outcome. */
function useSignup<R>(send: (email: string) => Promise<R> | R) {
  const t = useCoreloomI18n().messages.newsletter
  const [state, setState] = React.useState<SignupState<R>>({ status: 'idle' })
  const [value, setValue] = React.useState('')

  async function submit(event: React.SyntheticEvent) {
    event.preventDefault()
    const email = value.trim()
    if (state.status === 'submitting') return
    if (!email) {
      setState({ status: 'invalid', error: t.required })
      return
    }
    if (!isEmail(email)) {
      setState({ status: 'invalid', error: t.invalid })
      return
    }
    setState({ status: 'submitting' })
    try {
      const result = await send(email)
      setState({ status: 'done', result })
    } catch (error) {
      // The callback's message, when it gave one ("Already subscribed"); otherwise a generic line.
      setState({
        status: 'failed',
        error: error instanceof Error && error.message ? error.message : t.failed,
      })
    }
  }

  return { state, submit, value, setValue }
}

/** The thank-you that replaces the form. It takes focus, since the field it replaced had it. */
function Done({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    ref.current?.focus()
  }, [])
  return (
    <div
      ref={ref}
      tabIndex={-1}
      className="flex items-start gap-3 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
    >
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-success-subtle text-success">
        <CheckIcon aria-hidden className="size-3.5" />
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="m-0 text-[14.5px] font-medium text-foreground">{title}</p>
        {children}
      </div>
    </div>
  )
}

function EmailForm<R>({
  signup,
  submitLabel,
  placeholder,
  note,
}: {
  signup: ReturnType<typeof useSignup<R>>
  submitLabel: React.ReactNode
  placeholder?: string
  note?: React.ReactNode
}) {
  const t = useCoreloomI18n().messages.newsletter
  const inputId = React.useId()
  const errorId = React.useId()
  const { state, submit } = signup
  const busy = state.status === 'submitting'
  const error = state.status === 'invalid' || state.status === 'failed' ? state.error : undefined
  return (
    <form noValidate onSubmit={(e) => void submit(e)} className="flex w-full flex-col gap-2">
      <label htmlFor={inputId} className="sr-only">
        {t.email}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id={inputId}
          name="email"
          value={signup.value}
          onChange={(e) => {
            signup.setValue(e.target.value)
          }}
          type="email"
          autoComplete="email"
          placeholder={placeholder ?? t.placeholder}
          aria-invalid={state.status === 'invalid' || undefined}
          aria-describedby={error ? errorId : undefined}
          readOnly={busy}
          className="sm:flex-1"
        />
        <Button type="submit" aria-disabled={busy || undefined} data-submitting={busy || undefined}>
          {busy && <Spinner aria-hidden />}
          {submitLabel}
        </Button>
      </div>
      <p
        id={errorId}
        role="alert"
        className="m-0 min-h-0 text-[13px] text-destructive empty:hidden"
      >
        {error}
      </p>
      {!!note && <p className="m-0 text-[12.5px] text-muted-foreground">{note}</p>}
    </form>
  )
}

function Shell({
  title,
  description,
  variant,
  className,
  slot,
  children,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  variant: 'inline' | 'card'
  className?: string
  slot: string
  children: React.ReactNode
}) {
  return (
    <div
      data-slot={slot}
      className={cn(
        'flex w-full flex-col gap-4',
        variant === 'card' &&
          'rounded-lg border border-border bg-card p-6 text-card-foreground shadow-hairline',
        className,
      )}
    >
      {(!!title || !!description) && (
        <div className="flex flex-col gap-1.5">
          {!!title && (
            <p className="m-0 font-display text-[20px] leading-[1.3] font-semibold tracking-[-0.01em] text-foreground">
              {title}
            </p>
          )}
          {!!description && (
            <p className="m-0 text-[14.5px] leading-[1.6] text-fg-secondary">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

function NewsletterForm({
  onSubscribe,
  title,
  description,
  placeholder,
  submitLabel,
  note,
  successMessage,
  variant = 'inline',
  className,
}: {
  /** Sends the address. Throw an `Error` to show its message ("You're already subscribed."). */
  onSubscribe: (email: string) => Promise<void> | void
  title?: React.ReactNode
  description?: React.ReactNode
  placeholder?: string
  /** Default "Subscribe". */
  submitLabel?: React.ReactNode
  /** A line under the field: how often you write, a link to the privacy policy. */
  note?: React.ReactNode
  /** Replaces "Check your inbox to confirm…". */
  successMessage?: React.ReactNode
  /** "card" puts it on a card, for a sidebar or the end of an article. */
  variant?: 'inline' | 'card'
  className?: string
}) {
  const t = useCoreloomI18n().messages.newsletter
  const signup = useSignup(onSubscribe)
  return (
    <Shell
      slot="newsletter"
      title={title}
      description={description}
      variant={variant}
      className={className}
    >
      {signup.state.status === 'done' ? (
        <Done title={t.subscribed}>
          <p className="m-0 text-[13.5px] text-fg-secondary">{successMessage ?? t.confirm}</p>
        </Done>
      ) : (
        <EmailForm
          signup={signup}
          submitLabel={submitLabel ?? t.subscribe}
          placeholder={placeholder}
          note={note}
        />
      )}
    </Shell>
  )
}

function Waiting({ count, avatars }: { count: number; avatars?: string[] }) {
  const { messages, formatNumber } = useCoreloomI18n()
  return (
    <div className="flex items-center gap-3">
      {!!avatars?.length && (
        <span className="flex -space-x-2" aria-hidden>
          {avatars.slice(0, 4).map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              className="size-7 rounded-full bg-secondary object-cover ring-2 ring-background"
            />
          ))}
        </span>
      )}
      <p className="m-0 text-[13.5px] text-fg-secondary">
        {messages.newsletter.waiting(count, formatNumber(count))}
      </p>
    </div>
  )
}

function Waitlist({
  onJoin,
  title,
  description,
  count,
  avatars,
  placeholder,
  submitLabel,
  note,
  variant = 'inline',
  className,
}: {
  /** Adds the address; may return `{ position, referralUrl }`. Throw an `Error` to show its message. */
  onJoin: (email: string) => Promise<WaitlistResult | undefined> | WaitlistResult | undefined
  title?: React.ReactNode
  description?: React.ReactNode
  /** How many people are already waiting: "1,204 people are waiting". */
  count?: number
  /** A few portraits' URLs beside the count (decorative). */
  avatars?: string[]
  placeholder?: string
  /** Default "Join the waitlist". */
  submitLabel?: React.ReactNode
  note?: React.ReactNode
  variant?: 'inline' | 'card'
  className?: string
}) {
  const { messages, formatNumber } = useCoreloomI18n()
  const t = messages.newsletter
  const signup = useSignup(onJoin)
  const { state } = signup
  return (
    <Shell
      slot="waitlist"
      title={title}
      description={description}
      variant={variant}
      className={className}
    >
      {state.status === 'done' ? (
        <Done title={t.joined}>
          {state.result?.position !== undefined && (
            <p className="m-0 text-[13.5px] text-fg-secondary">
              {t.position(formatNumber(state.result.position))}
            </p>
          )}
          {!!state.result?.referralUrl && (
            <div className="mt-2 flex flex-col gap-1.5">
              <p className="m-0 text-[13px] text-muted-foreground">{t.share}</p>
              <div className="flex items-center gap-2 rounded-md border border-border bg-inset py-1 ps-3 pe-1">
                <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-foreground">
                  {state.result.referralUrl}
                </span>
                <CopyButton value={state.result.referralUrl} label={t.copyLink} />
              </div>
            </div>
          )}
        </Done>
      ) : (
        <>
          <EmailForm
            signup={signup}
            submitLabel={submitLabel ?? t.join}
            placeholder={placeholder}
            note={note}
          />
          {count !== undefined && count > 0 && <Waiting count={count} avatars={avatars} />}
        </>
      )}
    </Shell>
  )
}

export { isEmail, NewsletterForm, Waitlist, type WaitlistResult }
