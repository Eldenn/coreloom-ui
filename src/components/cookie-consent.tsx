'use client'

// Coreloom UI — Cookie consent (cookie-consent block). The banner that asks before a site sets
// non-essential cookies, with "Reject all" and "Accept all" given the same weight, and
// `CookiePreferences`, the dialog that turns each category on or off (also from a "Cookie settings"
// link in the footer, later). The app keeps the choices (a cookie, localStorage) and loads its
// scripts from them; `parseConsent` reads back what it stored.
import { CookieIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface ConsentCategory {
  id: string
  name: React.ReactNode
  description?: React.ReactNode
  /** Always on (the cookies the site can't work without): its switch is locked. */
  required?: boolean
}

/** Category id → allowed. */
type ConsentChoices = Record<string, boolean>

/** Necessary (required), preferences, analytics and marketing, named in the current language. */
function useDefaultCategories(): ConsentCategory[] {
  const t = useCoreloomI18n().messages.cookieConsent.categories
  return [
    { id: 'necessary', name: t.necessary, description: t.necessaryHint, required: true },
    { id: 'preferences', name: t.preferences, description: t.preferencesHint },
    { id: 'analytics', name: t.analytics, description: t.analyticsHint },
    { id: 'marketing', name: t.marketing, description: t.marketingHint },
  ]
}

/** Every category allowed. */
function acceptAll(categories: ConsentCategory[]): ConsentChoices {
  return Object.fromEntries(categories.map((c) => [c.id, true]))
}

/** Only the required categories allowed. */
function rejectAll(categories: ConsentCategory[]): ConsentChoices {
  return Object.fromEntries(categories.map((c) => [c.id, !!c.required]))
}

/**
 * Reads stored choices back (the JSON string you saved, or its parsed value). Unknown ids are
 * dropped, required categories are on, a missing category is off. Anything unreadable, or a stored
 * value that has none of the current categories (they changed: ask again), gives null.
 */
function parseConsent(raw: unknown, categories: ConsentCategory[]): ConsentChoices | null {
  let value = raw
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw)
    } catch {
      return null
    }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const stored = value as Record<string, unknown>
  if (!categories.some((c) => c.id in stored)) return null
  return Object.fromEntries(
    categories.map((c) => [c.id, c.required === true || stored[c.id] === true]),
  )
}

/**
 * Where focus goes when the banner leaves: the element it came from, or the page's main landmark.
 * Without this, a keyboard user who answered would be left on <body>.
 */
function useFocusReturn() {
  const from = React.useRef<HTMLElement | null>(null)
  const onFocus = (event: React.FocusEvent) => {
    if (event.relatedTarget instanceof HTMLElement && !from.current)
      from.current = event.relatedTarget
  }
  const restore = () => {
    const target = from.current?.isConnected
      ? from.current
      : document.querySelector<HTMLElement>('main, [role=main]')
    if (!target) return
    if (target.tabIndex < 0 && !target.hasAttribute('tabindex')) target.tabIndex = -1
    target.focus()
  }
  return { onFocus, restore }
}

function CookiePreferences({
  open,
  onOpenChange,
  value,
  onValueChange,
  categories: categoriesProp,
  onCloseAutoFocus,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The current choices; null when the person hasn't chosen yet (everything optional off). */
  value?: ConsentChoices | null
  /** Called with every category's choice when they save. */
  onValueChange: (choices: ConsentChoices) => void
  /** Default: necessary, preferences, analytics, marketing. */
  categories?: ConsentCategory[]
  /** Where focus goes when the dialog closes (Radix's event: `preventDefault()` then focus). */
  onCloseAutoFocus?: (event: Event) => void
}) {
  const t = useCoreloomI18n().messages.cookieConsent
  const fallback = useDefaultCategories()
  const categories = categoriesProp ?? fallback
  const baseId = React.useId()
  const [draft, setDraft] = React.useState<ConsentChoices>(() => ({
    ...rejectAll(categories),
    ...value,
  }))
  // Start from the saved choices each time it opens.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setDraft({ ...rejectAll(categories), ...value })
  }

  function save(choices: ConsentChoices) {
    onValueChange(choices)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl" onCloseAutoFocus={onCloseAutoFocus}>
        <DialogHeader>
          <DialogTitle>{t.preferencesTitle}</DialogTitle>
          <DialogDescription>{t.preferencesDescription}</DialogDescription>
        </DialogHeader>
        <ul className="m-0 flex max-h-[50vh] list-none flex-col overflow-y-auto p-0">
          {categories.map((c) => {
            const id = `${baseId}-${c.id}`
            return (
              <li
                key={c.id}
                className="flex items-start justify-between gap-4 border-t border-border-subtle py-4 first:border-t-0"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <label htmlFor={id} className="text-[14px] font-medium text-foreground">
                    {c.name}
                  </label>
                  {!!c.description && (
                    <p id={`${id}-hint`} className="m-0 text-[13px] text-muted-foreground">
                      {c.description}
                    </p>
                  )}
                  {c.required && <p className="m-0 text-[12.5px] text-fg-secondary">{t.always}</p>}
                </div>
                <Switch
                  id={id}
                  checked={!!c.required || draft[c.id]}
                  disabled={c.required}
                  aria-describedby={c.description ? `${id}-hint` : undefined}
                  onCheckedChange={(on) => {
                    setDraft((d) => ({ ...d, [c.id]: on }))
                  }}
                />
              </li>
            )
          })}
        </ul>
        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" onClick={() => save(rejectAll(categories))}>
              {t.rejectAll}
            </Button>
            <Button variant="secondary" onClick={() => save(acceptAll(categories))}>
              {t.acceptAll}
            </Button>
          </div>
          <Button
            onClick={() => save({ ...draft, ...rejectAll(categories.filter((c) => c.required)) })}
          >
            {t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CookieConsent({
  value,
  onValueChange,
  categories: categoriesProp,
  title,
  description,
  policyHref,
  position = 'bottom',
  className,
}: {
  /** The saved choices. The banner shows while this is null or undefined. */
  value: ConsentChoices | null | undefined
  /** Called with every category's choice: save it, then load the scripts it allows. */
  onValueChange: (choices: ConsentChoices) => void
  /** Default: necessary, preferences, analytics, marketing. */
  categories?: ConsentCategory[]
  /** Default "We use cookies". */
  title?: React.ReactNode
  /** Replaces the default paragraph. */
  description?: React.ReactNode
  /** The cookie policy's address: adds a "Cookie policy" link. */
  policyHref?: string
  /** "bottom": across the bottom of the window. "bottom-start": a card in the corner. "inline": in the flow (a preview). */
  position?: 'bottom' | 'bottom-start' | 'inline'
  className?: string
}) {
  const t = useCoreloomI18n().messages.cookieConsent
  const fallback = useDefaultCategories()
  const categories = categoriesProp ?? fallback
  const [customizing, setCustomizing] = React.useState(false)
  const focus = useFocusReturn()
  const titleId = React.useId()
  const descriptionId = React.useId()

  function choose(choices: ConsentChoices) {
    onValueChange(choices)
    focus.restore()
  }

  if (value && !customizing) return null
  return (
    <>
      {!value && (
        <section
          data-slot="cookie-consent"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          onFocus={focus.onFocus}
          className={cn(
            'flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 text-[14px] text-fg-secondary shadow-xl',
            position === 'bottom' &&
              'fixed inset-x-3 bottom-3 z-(--z-modal) md:flex-row md:items-center md:justify-between md:gap-8',
            position === 'bottom-start' &&
              'fixed start-3 end-3 bottom-3 z-(--z-modal) sm:end-auto sm:max-w-md',
            className,
          )}
        >
          <div className="flex min-w-0 gap-3">
            <CookieIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-primary-text" />
            <div className="flex min-w-0 flex-col gap-1">
              <p id={titleId} className="m-0 text-[15px] font-semibold text-foreground">
                {title ?? t.title}
              </p>
              <p id={descriptionId} className="m-0 leading-[1.55]">
                {description ?? t.description}
                {!!policyHref && (
                  <>
                    {' '}
                    <a
                      href={policyHref}
                      className="rounded-xs text-primary-text underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                    >
                      {t.policy}
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>
          <div
            className={cn(
              'flex shrink-0 flex-col gap-2 sm:flex-row',
              position === 'bottom-start' && 'sm:flex-wrap',
            )}
          >
            <Button variant="ghost" onClick={() => setCustomizing(true)}>
              {t.customize}
            </Button>
            <Button variant="secondary" onClick={() => choose(rejectAll(categories))}>
              {t.rejectAll}
            </Button>
            <Button variant="secondary" onClick={() => choose(acceptAll(categories))}>
              {t.acceptAll}
            </Button>
          </div>
        </section>
      )}
      <CookiePreferences
        open={customizing}
        onOpenChange={setCustomizing}
        value={value}
        onValueChange={(choices) => {
          onValueChange(choices)
          // The banner and the button that opened the dialog are gone once it closes.
          requestAnimationFrame(focus.restore)
        }}
        categories={categories}
      />
    </>
  )
}

export {
  acceptAll,
  type ConsentCategory,
  type ConsentChoices,
  CookieConsent,
  CookiePreferences,
  parseConsent,
  rejectAll,
}
