'use client'

// Coreloom UI — Cart (shop block). What someone is about to buy: `Cart` lists the lines (quantity,
// remove) beside an `OrderSummary` (subtotal, promo code, shipping, tax, total, "Checkout");
// `CartSheet` is the same in a side panel, opened by `CartButton` and its count. The app keeps the
// lines and does the checkout (`onCheckout`): there is no payment here.
import { ShoppingBagIcon, Trash2Icon, XIcon } from 'lucide-react'
import * as React from 'react'

import {
  type CartLine,
  type CartTotals,
  cartTotals,
  type Discount,
  formatMoney,
} from '@/components/commerce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useCoreloomI18n } from '@/lib/i18n'
import { AppLink } from '@/lib/link'
import { cn } from '@/lib/utils'

/** How the totals are worked out: see `cartTotals`. */
interface CartPricing {
  discount?: Discount
  /** Shipping cost; leave it out to show "Calculated at checkout". */
  shipping?: number | null
  freeShippingFrom?: number
  /** 0.2 for 20%. */
  taxRate?: number
  /** Prices include the tax (shown as "Including … tax"). */
  taxIncluded?: boolean
}

function Money({ amount, currency }: { amount: number; currency: string }) {
  const { locale } = useCoreloomI18n()
  return <span className="tabular-nums">{formatMoney(amount, currency, locale)}</span>
}

function Line({
  line,
  currency,
  onQuantityChange,
  onRemove,
}: {
  line: CartLine
  currency: string
  onQuantityChange: (id: string, quantity: number) => void
  onRemove: (line: CartLine) => void
}) {
  const t = useCoreloomI18n().messages.shop
  return (
    <li
      data-line={line.id}
      className="flex gap-4 border-b border-border-subtle py-4 last:border-b-0"
    >
      <div className="size-20 shrink-0 overflow-hidden rounded-md border border-border bg-inset">
        {!!line.image && <img src={line.image.src} alt="" className="size-full object-cover" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="m-0 text-[14px] font-medium text-foreground">
              {line.href ? (
                <AppLink
                  href={line.href}
                  className="rounded-xs outline-none hover:underline hover:underline-offset-4 focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  {line.name}
                </AppLink>
              ) : (
                line.name
              )}
            </p>
            {!!line.variant && (
              <p className="m-0 text-[13px] text-muted-foreground">{line.variant}</p>
            )}
            <p className="m-0 text-[13px] text-muted-foreground">
              <Money amount={line.unitPrice} currency={currency} />
            </p>
          </div>
          <p className="m-0 text-[14px] font-medium text-foreground">
            <Money amount={line.unitPrice * line.quantity} currency={currency} />
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <NumberInput
            aria-label={t.quantityOf(line.name)}
            value={line.quantity}
            onValueChange={(q) => {
              if (q !== null && q >= 1) onQuantityChange(line.id, q)
            }}
            min={1}
            max={line.maxQuantity}
            stepper="sides"
            className="w-32"
          />
          <Button
            variant="ghost"
            size="sm"
            data-remove
            className="text-muted-foreground"
            onClick={() => {
              onRemove(line)
            }}
          >
            <Trash2Icon aria-hidden />
            <span className="sr-only sm:not-sr-only">{t.remove}</span>
            <span className="sr-only">{line.name}</span>
          </Button>
        </div>
      </div>
    </li>
  )
}

function CartLines({
  lines,
  currency = 'EUR',
  onQuantityChange,
  onRemove,
  className,
}: {
  lines: CartLine[]
  /** ISO 4217 code. Default "EUR". */
  currency?: string
  onQuantityChange: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  className?: string
}) {
  const t = useCoreloomI18n().messages.shop
  const listRef = React.useRef<HTMLUListElement>(null)
  const [announcement, setAnnouncement] = React.useState('')

  function remove(line: CartLine) {
    const buttons = [...(listRef.current?.querySelectorAll<HTMLElement>('[data-remove]') ?? [])]
    const index = lines.findIndex((l) => l.id === line.id)
    onRemove(line.id)
    setAnnouncement(t.removed(line.name))
    // The button goes with its line: focus the next line's (or the previous one's), else the list.
    requestAnimationFrame(() => {
      const next = buttons.at(index + 1) ?? (index > 0 ? buttons.at(index - 1) : undefined)
      if (next?.isConnected) next.focus()
      else listRef.current?.focus()
    })
  }

  return (
    <div className={className}>
      <ul
        ref={listRef}
        tabIndex={-1}
        aria-label={t.cart}
        className="m-0 list-none p-0 outline-none"
      >
        {lines.map((line) => (
          <Line
            key={line.id}
            line={line}
            currency={currency}
            onQuantityChange={onQuantityChange}
            onRemove={remove}
          />
        ))}
      </ul>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  )
}

function PromoCode({
  onApplyCode,
  appliedCode,
  onRemoveCode,
}: {
  onApplyCode: (code: string) => Promise<void> | void
  appliedCode?: string
  onRemoveCode?: () => void
}) {
  const t = useCoreloomI18n().messages.shop
  const inputId = React.useId()
  const errorId = React.useId()
  const [state, setState] = React.useState<
    { status: 'idle' | 'applying' } | { status: 'error'; error: string }
  >({
    status: 'idle',
  })
  const [value, setValue] = React.useState('')

  async function apply(event: React.SyntheticEvent) {
    event.preventDefault()
    const code = value.trim()
    if (!code || state.status === 'applying') return
    setState({ status: 'applying' })
    try {
      await onApplyCode(code)
      setState({ status: 'idle' })
      setValue('')
    } catch (error) {
      setState({
        status: 'error',
        error: error instanceof Error && error.message ? error.message : t.codeInvalid,
      })
    }
  }

  if (appliedCode)
    return (
      <div className="flex items-center justify-between gap-2 text-[13.5px]">
        <span className="text-fg-secondary">{t.codeApplied(appliedCode)}</span>
        {!!onRemoveCode && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t.removeCode(appliedCode)}
            onClick={onRemoveCode}
          >
            <XIcon aria-hidden />
          </Button>
        )}
      </div>
    )
  const error = state.status === 'error' ? state.error : undefined
  return (
    <form noValidate onSubmit={(e) => void apply(e)} className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-[13px] text-fg-secondary">
        {t.code}
      </label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          name="code"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
          }}
          autoComplete="off"
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-9 uppercase"
        />
        <Button
          type="submit"
          variant="secondary"
          aria-disabled={state.status === 'applying' || undefined}
        >
          {t.apply}
        </Button>
      </div>
      <p id={errorId} role="alert" className="m-0 text-[12.5px] text-destructive empty:hidden">
        {error}
      </p>
    </form>
  )
}

function ShippingCost({ amount, currency }: { amount: number | null; currency: string }) {
  const t = useCoreloomI18n().messages.shop
  if (amount === null) return t.atCheckout
  if (amount === 0) return t.free
  return <Money amount={amount} currency={currency} />
}

function SummaryRow({
  label,
  children,
  strong,
}: {
  label: React.ReactNode
  children: React.ReactNode
  strong?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4',
        strong ? 'text-[16px] font-semibold text-foreground' : 'text-[14px] text-fg-secondary',
      )}
    >
      <dt>{label}</dt>
      <dd className="m-0 text-end">{children}</dd>
    </div>
  )
}

function OrderSummary({
  totals,
  currency = 'EUR',
  taxIncluded = false,
  freeShippingFrom,
  onApplyCode,
  appliedCode,
  onRemoveCode,
  onCheckout,
  checkoutLabel,
  children,
  className,
}: {
  /** From `cartTotals(lines, pricing)`. */
  totals: CartTotals
  currency?: string
  /** The tax line reads "Including … tax" and isn't added to the total. */
  taxIncluded?: boolean
  /** Shows how much more gets free shipping. */
  freeShippingFrom?: number
  /** Shows a promo-code field. Throw an `Error` to show why a code was refused. */
  onApplyCode?: (code: string) => Promise<void> | void
  /** The code in use: shown instead of the field. */
  appliedCode?: string
  onRemoveCode?: () => void
  /** Shows the "Checkout" button. */
  onCheckout?: () => void
  checkoutLabel?: React.ReactNode
  /** Under the button: payment logos, a reassurance line. */
  children?: React.ReactNode
  className?: string
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.shop
  const money = (n: number) => <Money amount={n} currency={currency} />
  const toFree =
    freeShippingFrom !== undefined ? freeShippingFrom - (totals.subtotal - totals.discount) : 0
  return (
    <div
      data-slot="order-summary"
      className={cn('flex flex-col gap-5 rounded-lg border border-border bg-card p-5', className)}
    >
      <p className="m-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {t.summary}
      </p>
      <dl className="m-0 flex flex-col gap-2.5">
        <SummaryRow label={t.subtotal(totals.count)}>{money(totals.subtotal)}</SummaryRow>
        {totals.discount > 0 && (
          <SummaryRow label={t.discount}>−{money(totals.discount)}</SummaryRow>
        )}
        <SummaryRow label={t.shipping}>
          <ShippingCost amount={totals.shipping} currency={currency} />
        </SummaryRow>
        {totals.tax > 0 && (
          <SummaryRow label={taxIncluded ? t.taxIncluded : t.tax}>{money(totals.tax)}</SummaryRow>
        )}
        <div className="my-1 border-t border-border-subtle" />
        <SummaryRow label={t.total} strong>
          {money(totals.total)}
        </SummaryRow>
      </dl>
      {toFree > 0 && (
        <p className="m-0 text-[13px] text-fg-secondary">
          {t.freeShippingIn(formatMoney(toFree, currency, locale))}
        </p>
      )}
      {!!onApplyCode && (
        <PromoCode
          onApplyCode={onApplyCode}
          appliedCode={appliedCode}
          onRemoveCode={onRemoveCode}
        />
      )}
      {!!onCheckout && (
        <Button size="lg" onClick={onCheckout} disabled={totals.count === 0}>
          {checkoutLabel ?? t.checkout}
        </Button>
      )}
      {children}
    </div>
  )
}

type CartProps = CartPricing & {
  lines: CartLine[]
  /** ISO 4217 code. Default "EUR". */
  currency?: string
  onQuantityChange: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  onApplyCode?: (code: string) => Promise<void> | void
  appliedCode?: string
  onRemoveCode?: () => void
  onCheckout?: () => void
  /** Shows "Continue shopping" (in the empty state too). */
  onContinueShopping?: () => void
  className?: string
}

function EmptyCart({ onContinueShopping }: { onContinueShopping?: () => void }) {
  const t = useCoreloomI18n().messages.shop
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <ShoppingBagIcon aria-hidden className="size-8 text-muted-foreground" />
      <p className="m-0 text-[15px] font-medium text-foreground">{t.empty}</p>
      {!!onContinueShopping && (
        <Button variant="secondary" onClick={onContinueShopping}>
          {t.continue}
        </Button>
      )}
    </div>
  )
}

function Cart({
  lines,
  currency = 'EUR',
  discount,
  shipping,
  freeShippingFrom,
  taxRate,
  taxIncluded,
  onQuantityChange,
  onRemove,
  onApplyCode,
  appliedCode,
  onRemoveCode,
  onCheckout,
  onContinueShopping,
  className,
}: CartProps) {
  const t = useCoreloomI18n().messages.shop
  const totals = cartTotals(lines, { discount, shipping, freeShippingFrom, taxRate, taxIncluded })
  if (lines.length === 0) return <EmptyCart onContinueShopping={onContinueShopping} />
  return (
    <div
      data-slot="cart"
      className={cn('grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_340px]', className)}
    >
      <div className="flex flex-col gap-4">
        <CartLines
          lines={lines}
          currency={currency}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
        />
        {!!onContinueShopping && (
          <Button variant="ghost" className="self-start" onClick={onContinueShopping}>
            {t.continue}
          </Button>
        )}
      </div>
      <OrderSummary
        className="self-start lg:sticky lg:top-24"
        totals={totals}
        currency={currency}
        taxIncluded={taxIncluded}
        freeShippingFrom={freeShippingFrom}
        onApplyCode={onApplyCode}
        appliedCode={appliedCode}
        onRemoveCode={onRemoveCode}
        onCheckout={onCheckout}
      />
    </div>
  )
}

function CartSheet({
  open,
  onOpenChange,
  lines,
  currency = 'EUR',
  onQuantityChange,
  onRemove,
  onCheckout,
  onContinueShopping,
  ...pricing
}: Omit<CartProps, 'onApplyCode' | 'appliedCode' | 'onRemoveCode' | 'className'> & {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { messages, formatNumber } = useCoreloomI18n()
  const t = messages.shop
  const totals = cartTotals(lines, pricing)
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t.cart}</SheetTitle>
          <SheetDescription>{t.items(totals.count, formatNumber(totals.count))}</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          {lines.length === 0 ? (
            <EmptyCart onContinueShopping={onContinueShopping} />
          ) : (
            <CartLines
              lines={lines}
              currency={currency}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
            />
          )}
        </div>
        {lines.length > 0 && (
          <SheetFooter className="border-t border-border">
            <dl className="m-0 flex flex-col gap-2">
              <SummaryRow label={t.subtotal(totals.count)}>
                <Money amount={totals.subtotal - totals.discount} currency={currency} />
              </SummaryRow>
            </dl>
            <p className="m-0 text-[12.5px] text-muted-foreground">{t.taxesAtCheckout}</p>
            {!!onCheckout && (
              <Button size="lg" onClick={onCheckout}>
                {t.checkout}
              </Button>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

function CartButton({
  count,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'children'> & { count: number }) {
  const { messages, formatNumber } = useCoreloomI18n()
  const t = messages.shop
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`${t.cart}, ${t.items(count, formatNumber(count))}`}
      className={cn('relative', className)}
      {...props}
    >
      <ShoppingBagIcon aria-hidden />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute -end-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-primary px-1 font-mono text-[10.5px] font-semibold text-primary-foreground"
        >
          {count > 99 ? '99+' : formatNumber(count)}
        </span>
      )}
    </Button>
  )
}

export { Cart, CartButton, CartLines, type CartPricing, CartSheet, OrderSummary }
