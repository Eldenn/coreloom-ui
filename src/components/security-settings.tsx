'use client'

// Coreloom UI — TwoFactorSettings and ActiveSessions (security settings block).
// TwoFactorSettings turns on two-step sign-in with an authenticator app: your `onSetupStart` returns
// the secret (and a QR code you render), people type a code, your `onSetupVerify` checks it and
// returns recovery codes, shown once. ActiveSessions lists where the account is signed in, with
// Sign out per device and for every other device. The block checks nothing itself.
import {
  LaptopIcon,
  LogOutIcon,
  MonitorIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
  SmartphoneIcon,
  TabletIcon,
} from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'

import { CopyButton } from '@/components/copy-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
import { RelativeTime } from '@/components/ui/relative-time'
import { SecretValue } from '@/components/ui/secret-value'
import { Spinner } from '@/components/ui/spinner'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface TwoFactorSetup {
  /** The base32 secret, for people who type it into their app. */
  secret: string
  /** Your QR code for the otpauth:// URI (an <img> or an SVG you render). */
  qrCode?: React.ReactNode
}

interface ActiveSession {
  id: string
  /** "Chrome on macOS". */
  name: string
  device?: 'desktop' | 'laptop' | 'phone' | 'tablet'
  location?: string
  ip?: string
  lastActiveAt: Date
  /** The session this page is open in: marked, and it can't be signed out from here. */
  current?: boolean
}

const deviceIcon = {
  desktop: MonitorIcon,
  laptop: LaptopIcon,
  phone: SmartphoneIcon,
  tablet: TabletIcon,
}

function RecoveryCodes({ codes }: { codes: string[] }) {
  const t = useCoreloomI18n().messages.security
  return (
    <div className="flex flex-col gap-2">
      <ul
        aria-label={t.recoveryCodes}
        className="m-0 grid list-none grid-cols-2 gap-x-6 gap-y-1.5 rounded-md border border-border bg-inset p-4 font-mono text-[13px] text-foreground"
      >
        {codes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
        <CopyButton value={codes.join('\n')} label={t.copyCodes} />
        {t.copyCodes}
      </div>
    </div>
  )
}

function SetupDialog({
  open,
  onOpenChange,
  setup,
  startFailed,
  onSetupVerify,
  onDone,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null while onSetupStart is running. */
  setup: TwoFactorSetup | null
  startFailed: boolean
  onSetupVerify: (
    code: string,
  ) => { recoveryCodes: string[] } | Promise<{ recoveryCodes: string[] }>
  onDone: () => void
}) {
  const t = useCoreloomI18n().messages.security
  const [wrongCode, setWrongCode] = React.useState(false)
  const [codes, setCodes] = React.useState<string[] | null>(null)
  const form = useAppForm({
    defaultValues: { code: '' },
    validators: { onChange: z.object({ code: z.string().regex(/^\d{6}$/, t.codeRequired) }) },
    onSubmit: async ({ value }) => {
      setWrongCode(false)
      try {
        const result = await onSetupVerify(value.code)
        setCodes(result.recoveryCodes)
      } catch {
        setWrongCode(true)
        form.setFieldValue('code', '')
      }
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Closing after the codes were shown is the end of the setup.
        if (!next && codes) onDone()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        {codes ? (
          <div className="flex flex-col gap-5">
            <DialogHeader>
              <DialogTitle>{t.codesTitle}</DialogTitle>
              <DialogDescription>{t.codesDescription}</DialogDescription>
            </DialogHeader>
            <RecoveryCodes codes={codes} />
            <DialogFooter>
              <Button
                onClick={() => {
                  onDone()
                  onOpenChange(false)
                }}
              >
                {t.done}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            noValidate
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault()
              void form.handleSubmit()
            }}
          >
            <DialogHeader>
              <DialogTitle>{t.setupTitle}</DialogTitle>
              <DialogDescription>{t.setupDescription}</DialogDescription>
            </DialogHeader>
            {startFailed ? (
              <Alert variant="destructive">
                <AlertDescription>{t.setupFailed}</AlertDescription>
              </Alert>
            ) : setup ? (
              <div className="flex flex-col items-center gap-3">
                {setup.qrCode !== undefined && (
                  <div className="flex size-44 items-center justify-center rounded-lg border border-border bg-card p-2 [&>*]:size-full">
                    {setup.qrCode}
                  </div>
                )}
                <p className="m-0 text-center text-[12.5px] text-muted-foreground">
                  {t.manualEntry}
                </p>
                <SecretValue value={setup.secret} label={t.setupKey} className="w-full" />
              </div>
            ) : (
              <div
                aria-busy
                className="flex items-center justify-center gap-2 py-8 text-[13px] text-muted-foreground"
              >
                <Spinner />
                {t.preparing}
              </div>
            )}
            {wrongCode && (
              <Alert variant="destructive">
                <AlertDescription>{t.wrongCode}</AlertDescription>
              </Alert>
            )}
            <form.AppField name="code">
              {(field) => (
                <field.OTPField
                  label={t.code}
                  description={t.codeHint}
                  submitOnComplete
                  disabled={!setup}
                  pattern="^[0-9]*$"
                />
              )}
            </form.AppField>
            <DialogFooter>
              <form.AppForm>
                <form.SubmitButton disabled={!setup} pendingLabel={t.verifying}>
                  {t.verify}
                </form.SubmitButton>
              </form.AppForm>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function TwoFactorSettings({
  enabled,
  enabledAt,
  recoveryCodesLeft,
  onSetupStart,
  onSetupVerify,
  onDisable,
  onRegenerateCodes,
  title,
  description,
  className,
}: {
  enabled: boolean
  enabledAt?: Date
  /** Unused recovery codes; a warning shows under 3. */
  recoveryCodesLeft?: number
  /** Starts the setup: create the secret on your server and return it (and a QR code). */
  onSetupStart?: () => TwoFactorSetup | Promise<TwoFactorSetup>
  /** Checks the 6-digit code; reject when it's wrong. Returns the recovery codes to show once. */
  onSetupVerify?: (
    code: string,
  ) => { recoveryCodes: string[] } | Promise<{ recoveryCodes: string[] }>
  /** Turns it off (after a confirmation). */
  onDisable?: () => unknown
  /** Makes new recovery codes (the old ones stop working) and returns them. */
  onRegenerateCodes?: () => string[] | Promise<string[]>
  title?: React.ReactNode
  description?: React.ReactNode
  className?: string
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.security
  const [setupOpen, setSetupOpen] = React.useState(false)
  // Each opening is a new attempt: a fresh dialog (its key) and a fresh secret.
  const [attempt, setAttempt] = React.useState(0)
  const [setup, setSetup] = React.useState<TwoFactorSetup | null>(null)
  const [startFailed, setStartFailed] = React.useState(false)
  const startSetup = () => {
    if (!onSetupStart) return
    const current = attempt + 1
    setAttempt(current)
    setSetup(null)
    setStartFailed(false)
    setSetupOpen(true)
    Promise.resolve(onSetupStart()).then(
      (s) => {
        setSetup(s)
      },
      () => {
        setStartFailed(true)
      },
    )
  }
  const [newCodes, setNewCodes] = React.useState<string[] | null>(null)
  const [regenerating, setRegenerating] = React.useState(false)
  const [announcement, setAnnouncement] = React.useState('')
  const regenerate = async () => {
    if (!onRegenerateCodes) return
    setRegenerating(true)
    try {
      setNewCodes(await onRegenerateCodes())
    } finally {
      setRegenerating(false)
    }
  }
  const date = (d: Date) =>
    d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <Card className={cn('gap-0 p-0', className)}>
      <CardHeader className="px-5 py-4">
        <CardTitle asChild>
          <h2 className="m-0">{title ?? t.twoFactorTitle}</h2>
        </CardTitle>
        <CardDescription>{description ?? t.twoFactorDescription}</CardDescription>
        <CardAction>
          {enabled ? (
            <Badge variant="success">
              <ShieldCheckIcon />
              {t.on}
            </Badge>
          ) : (
            <Badge variant="secondary">
              <ShieldOffIcon />
              {t.off}
            </Badge>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 border-t border-border px-5 py-4">
        {enabled ? (
          <>
            <p className="m-0 text-[13px] text-fg-secondary">
              {enabledAt ? t.enabledSince(date(enabledAt)) : t.enabled}
            </p>
            {recoveryCodesLeft !== undefined && (
              <p
                className={cn(
                  'm-0 text-[13px]',
                  recoveryCodesLeft < 3 ? 'text-warning' : 'text-muted-foreground',
                )}
              >
                {t.codesLeft(recoveryCodesLeft)}
              </p>
            )}
            {newCodes && (
              <div className="flex flex-col gap-2">
                <p className="m-0 text-[13px] font-medium text-foreground">{t.newCodes}</p>
                <RecoveryCodes codes={newCodes} />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {onRegenerateCodes && (
                <Button
                  variant="outline"
                  size="sm"
                  aria-busy={regenerating || undefined}
                  disabled={regenerating}
                  onClick={() => void regenerate()}
                >
                  {regenerating && <Spinner />}
                  {t.regenerate}
                </Button>
              )}
              {onDisable && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      {t.disable}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.disableTitle}</AlertDialogTitle>
                      <AlertDialogDescription>{t.disableDescription}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{messages.common.cancel}</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => {
                          setNewCodes(null)
                          void onDisable()
                        }}
                      >
                        {t.disableConfirm}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 max-w-prose text-[13px] text-fg-secondary">{t.offHint}</p>
            {onSetupStart && onSetupVerify && (
              <>
                <Button size="sm" onClick={startSetup}>
                  {t.setup}
                </Button>
              </>
            )}
          </div>
        )}
        {/* Outside the on / off branches: the app turns `enabled` on while the codes are shown. */}
        {onSetupVerify && (
          <SetupDialog
            key={attempt}
            open={setupOpen}
            onOpenChange={setSetupOpen}
            setup={setup}
            startFailed={startFailed}
            onSetupVerify={onSetupVerify}
            onDone={() => {
              setAnnouncement(t.enabled)
            }}
          />
        )}
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </CardContent>
    </Card>
  )
}

function ActiveSessions({
  sessions,
  onRevoke,
  onRevokeOthers,
  title,
  description,
  className,
}: {
  sessions: ActiveSession[]
  /** Shows Sign out on each session but the current one. */
  onRevoke?: (id: string) => unknown
  /** Shows "Sign out of all other sessions" (after a confirmation). */
  onRevokeOthers?: () => unknown
  title?: React.ReactNode
  description?: React.ReactNode
  className?: string
}) {
  const { messages } = useCoreloomI18n()
  const t = messages.security
  const others = sessions.filter((s) => !s.current)
  const sorted = [...sessions].sort(
    (a, b) =>
      Number(b.current ?? false) - Number(a.current ?? false) ||
      b.lastActiveAt.getTime() - a.lastActiveAt.getTime(),
  )
  return (
    <Card className={cn('gap-0 p-0', className)}>
      <CardHeader className="border-b border-border px-5 py-4">
        <CardTitle asChild>
          <h2 className="m-0">{title ?? t.sessionsTitle}</h2>
        </CardTitle>
        <CardDescription>{description ?? t.sessionsDescription}</CardDescription>
        {onRevokeOthers && others.length > 0 && (
          <CardAction>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <LogOutIcon />
                  {t.revokeOthers}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.revokeOthersTitle(others.length)}</AlertDialogTitle>
                  <AlertDialogDescription>{t.revokeOthersDescription}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{messages.common.cancel}</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => void onRevokeOthers()}>
                    {t.revokeOthersConfirm}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <ul className="m-0 list-none p-0">
          {sorted.map((s) => {
            const Icon = deviceIcon[s.device ?? 'laptop']
            return (
              <li
                key={s.id}
                data-slot="session"
                className="flex items-center gap-3 border-b border-border-subtle px-5 py-3 last:border-b-0"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground [&_svg]:size-4">
                  <Icon aria-hidden />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="flex flex-wrap items-center gap-2 text-[14px] font-medium text-foreground">
                    <span className="truncate">{s.name}</span>
                    {s.current && <Badge variant="success">{t.thisDevice}</Badge>}
                  </span>
                  <span className="truncate text-[12.5px] text-muted-foreground">
                    {[s.location, s.ip].filter(Boolean).join(' · ')}
                    {(s.location ?? s.ip) && ' · '}
                    {s.current ? t.activeNow : <RelativeTime date={s.lastActiveAt} />}
                  </span>
                </div>
                {onRevoke && !s.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={t.revoke(s.name)}
                    onClick={() => void onRevoke(s.id)}
                  >
                    {t.revokeShort}
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

export { type ActiveSession, ActiveSessions, TwoFactorSettings, type TwoFactorSetup }
