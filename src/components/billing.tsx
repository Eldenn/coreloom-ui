'use client'

// Coreloom UI — Billing block. The parts of a billing page: the current plan, usage against the
// plan's limits, the payment method and the invoices. Amounts are numbers in major units,
// formatted in the reader's locale; dates are Dates.
import { CreditCardIcon, DownloadIcon } from 'lucide-react'
import * as React from 'react'

import { Badge, BadgeDot } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCoreloomI18n } from '@/lib/i18n'
import { AppLink } from '@/lib/link'
import { cn } from '@/lib/utils'

function useMoney(currency: string) {
  const { locale } = useCoreloomI18n()
  return React.useCallback(
    (amount: number) =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: amount % 1 ? 2 : 0,
      }).format(amount),
    [locale, currency],
  )
}

function useDate() {
  const { locale } = useCoreloomI18n()
  return (
    d: Date,
    opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
  ) => d.toLocaleDateString(locale, opts)
}

function CardHeading({ children }: { children: React.ReactNode }) {
  return (
    <CardTitle asChild>
      <h2 className="m-0">{children}</h2>
    </CardTitle>
  )
}

/** The current plan: name, price, renewal and the two actions. */
function PlanCard({
  name,
  price,
  currency = 'EUR',
  interval = 'month',
  renewsAt,
  endsAt,
  features,
  onChangePlan,
  onCancel,
  className,
}: {
  name: string
  price: number
  currency?: string
  interval?: 'month' | 'year'
  renewsAt?: Date
  /** A cancelled plan's last day (replaces "Renews on"). */
  endsAt?: Date
  features?: string[]
  onChangePlan?: () => void
  onCancel?: () => void
  className?: string
}) {
  const t = useCoreloomI18n().messages.billing
  const money = useMoney(currency)
  const date = useDate()
  return (
    <Card accent className={className}>
      <CardHeader>
        <CardDescription className="font-mono text-[11px] tracking-[0.08em] uppercase">
          {t.plan}
        </CardDescription>
        <CardHeading>{name}</CardHeading>
        <CardAction>
          {endsAt ? <Badge variant="warning">{t.ends(date(endsAt))}</Badge> : null}
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="m-0 flex items-baseline gap-1.5">
          <span className="font-display text-[32px] leading-none font-semibold tracking-[-0.02em] text-foreground">
            {money(price)}
          </span>
          <span className="text-[14px] text-muted-foreground">
            {interval === 'year' ? t.perYear : t.perMonth}
          </span>
        </p>
        {renewsAt && !endsAt && (
          <p className="m-0 text-[13px] text-muted-foreground">{t.renews(date(renewsAt))}</p>
        )}
        {features && features.length > 0 && (
          <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-[13px] text-fg-secondary marker:text-primary">
            {features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
      </CardContent>
      {(onChangePlan || onCancel) && (
        <CardFooter className="gap-2">
          {onChangePlan && (
            <Button size="sm" onClick={onChangePlan}>
              {t.changePlan}
            </Button>
          )}
          {onCancel && !endsAt && (
            <Button size="sm" variant="ghost" onClick={onCancel}>
              {t.cancel}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

interface UsageItem {
  label: string
  used: number
  limit: number
  /** "GB", "builds"… shown after the numbers. */
  unit?: string
}

/** Usage against the plan's limits; a meter turns amber past 80 % and red past 100 %. */
function UsageMeters({ items, className }: { items: UsageItem[]; className?: string }) {
  const { messages, formatNumber } = useCoreloomI18n()
  const t = messages.billing
  return (
    <Card className={className}>
      <CardHeader>
        <CardHeading>{t.usage}</CardHeading>
        <CardDescription>{t.usageHint}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {items.map((item) => {
            const ratio = item.limit > 0 ? item.used / item.limit : 0
            const tone = ratio > 1 ? 'over' : ratio >= 0.8 ? 'near' : 'ok'
            const unit = item.unit ? ` ${item.unit}` : ''
            return (
              <li
                key={item.label}
                className="flex flex-col gap-1.5"
                data-slot="usage-meter"
                data-tone={tone}
              >
                <div className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="font-medium text-foreground">{item.label}</span>
                  <span className="font-mono text-[12px] text-muted-foreground">
                    {t.usageOf(formatNumber(item.used) + unit, formatNumber(item.limit) + unit)}
                  </span>
                </div>
                <Progress
                  value={Math.min(ratio, 1) * 100}
                  aria-label={`${item.label}: ${t.usageOf(formatNumber(item.used) + unit, formatNumber(item.limit) + unit)}`}
                  className={cn(
                    tone === 'near' && '[&_[data-slot=progress-indicator]]:bg-warning',
                    tone === 'over' && '[&_[data-slot=progress-indicator]]:bg-destructive',
                  )}
                />
                {tone !== 'ok' && (
                  <span
                    className={cn(
                      'text-[12px]',
                      tone === 'over' ? 'text-destructive' : 'text-warning',
                    )}
                  >
                    {tone === 'over' ? t.overLimit : t.nearLimit}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

/** The card on file. */
function PaymentMethod({
  brand,
  last4,
  expires,
  onUpdate,
  className,
}: {
  /** "Visa", "Mastercard"… */
  brand: string
  last4: string
  expires: Date
  onUpdate?: () => void
  className?: string
}) {
  const t = useCoreloomI18n().messages.billing
  const date = useDate()
  return (
    <Card className={className}>
      <CardHeader>
        <CardHeading>{t.paymentMethod}</CardHeading>
        {onUpdate && (
          <CardAction>
            <Button size="sm" variant="secondary" onClick={onUpdate}>
              {t.update}
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <span className="flex h-9 w-12 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground [&_svg]:size-5">
          <CreditCardIcon />
        </span>
        <span className="flex flex-col">
          <span className="text-[14px] text-foreground">{t.cardEnding(brand, last4)}</span>
          <span className="text-[12px] text-muted-foreground">
            {t.expires(date(expires, { month: '2-digit', year: 'numeric' }))}
          </span>
        </span>
      </CardContent>
    </Card>
  )
}

interface Invoice {
  id: string
  date: Date
  amount: number
  currency?: string
  status: 'paid' | 'due' | 'failed'
  /** Link to the PDF. */
  href?: string
}

const statusVariant = { paid: 'success', due: 'warning', failed: 'destructive' } as const

/** Past invoices, newest first. */
function InvoiceTable({
  invoices,
  currency = 'EUR',
  className,
}: {
  invoices: Invoice[]
  currency?: string
  className?: string
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.billing
  const date = useDate()
  return (
    <Card className={cn('gap-0 p-0', className)}>
      <CardHeader className="px-5 py-4">
        <CardHeading>{t.invoices}</CardHeading>
      </CardHeader>
      <CardContent className="p-0">
        {invoices.length === 0 ? (
          <p className="m-0 border-t border-border px-5 py-8 text-center text-[13px] text-muted-foreground">
            {t.noInvoices}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">{t.invoice}</TableHead>
                <TableHead>{t.date}</TableHead>
                <TableHead>{t.status}</TableHead>
                <TableHead className="text-right">{t.amount}</TableHead>
                <TableHead className="w-12 pr-5">
                  <span className="sr-only">PDF</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="pl-5 font-mono text-[12px] text-foreground">
                    {inv.id}
                  </TableCell>
                  <TableCell>
                    {date(inv.date, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[inv.status]}>
                      <BadgeDot />
                      {t[inv.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-[13px] text-foreground">
                    {new Intl.NumberFormat(locale, {
                      style: 'currency',
                      currency: inv.currency ?? currency,
                    }).format(inv.amount)}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    {inv.href && (
                      <Button variant="ghost" size="icon-sm" asChild>
                        <AppLink href={inv.href} aria-label={t.download(inv.id)} download>
                          <DownloadIcon />
                        </AppLink>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export { type Invoice, InvoiceTable, PaymentMethod, PlanCard, type UsageItem, UsageMeters }
