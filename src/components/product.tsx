'use client'

// Coreloom UI — Product (shop block). A shop's product views: `ProductCard` in a listing,
// `ProductGrid` for a page of them, and `ProductDetail`, the product page with its images, option
// pickers (swatches for colours), stock, quantity and "Add to cart". Products come from the app;
// adding to the cart is `onAddToCart`. No payment here: the cart hands over to your checkout.
import * as React from 'react'

import {
  defaultSelection,
  findVariant,
  formatMoney,
  isValueAvailable,
  type Product,
  type ProductOption,
  type ProductVariant,
} from '@/components/commerce'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NumberInput } from '@/components/ui/number-input'
import { Rating } from '@/components/ui/rating'
import { type ActionStatus, StatusButton } from '@/components/ui/status-button'
import { useCoreloomI18n } from '@/lib/i18n'
import { AppLink } from '@/lib/link'
import { cn } from '@/lib/utils'

/** A price, and the former one struck through when it was higher, both named for screen readers. */
function Price({
  amount,
  compareAt,
  currency,
  size = 'default',
}: {
  amount: number
  compareAt?: number
  currency: string
  size?: 'default' | 'lg'
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.shop
  const reduced = compareAt !== undefined && compareAt > amount
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      {reduced && <span className="sr-only">{t.now}</span>}
      <span
        className={cn(
          'font-semibold text-foreground tabular-nums',
          size === 'lg' ? 'font-display text-[26px]' : 'text-[15px]',
        )}
      >
        {formatMoney(amount, currency, locale)}
      </span>
      {reduced && (
        <>
          <span className="sr-only">{t.was}</span>
          <s className="text-[13.5px] text-muted-foreground tabular-nums">
            {formatMoney(compareAt, currency, locale)}
          </s>
        </>
      )}
    </span>
  )
}

function ProductRating({ rating }: { rating: NonNullable<Product['rating']> }) {
  const { messages, formatNumber } = useCoreloomI18n()
  return (
    <span className="flex items-center gap-1.5">
      <Rating value={rating.value} readOnly size="sm" />
      <span className="text-[12.5px] text-muted-foreground">
        {messages.shop.reviews(rating.count, formatNumber(rating.count))}
      </span>
    </span>
  )
}

function ProductCard({
  product,
  currency = 'EUR',
  onAddToCart,
  className,
}: {
  product: Product
  /** ISO 4217 code. Default "EUR". */
  currency?: string
  /** Shows a quick "Add to cart" (for products without options). */
  onAddToCart?: (product: Product) => void
  className?: string
}) {
  const t = useCoreloomI18n().messages.shop
  const image = product.images.at(0)
  const soldOut = product.variants?.length
    ? product.variants.every((v) => v.stock === 0)
    : product.stock === 0
  return (
    <article
      data-slot="product-card"
      className={cn('group relative flex flex-col gap-3', className)}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-inset">
        {!!image && (
          <img
            src={image.src}
            alt={image.alt}
            className="size-full object-cover transition-transform duration-slow group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        )}
        {(!!product.badge || soldOut) && (
          <Badge variant={soldOut ? 'secondary' : 'default'} className="absolute start-3 top-3">
            {soldOut ? t.soldOut : product.badge}
          </Badge>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="m-0 text-[14.5px] font-medium text-foreground">
          {product.href ? (
            <AppLink
              href={product.href}
              className="rounded-xs outline-none after:absolute after:inset-0 after:content-[''] hover:underline hover:underline-offset-4 focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {product.name}
            </AppLink>
          ) : (
            product.name
          )}
        </h2>
        <Price amount={product.price} compareAt={product.compareAtPrice} currency={currency} />
        {!!product.rating && <ProductRating rating={product.rating} />}
      </div>
      {!!onAddToCart && !soldOut && (
        <Button
          variant="secondary"
          size="sm"
          // Above the card's link overlay, so it gets its own clicks.
          className="relative z-10"
          aria-label={t.addNamed(product.name)}
          onClick={() => {
            onAddToCart(product)
          }}
        >
          {t.add}
        </Button>
      )}
    </article>
  )
}

function ProductGrid({
  products,
  currency,
  onAddToCart,
  className,
  'aria-label': ariaLabel,
}: {
  products: Product[]
  currency?: string
  onAddToCart?: (product: Product) => void
  className?: string
  'aria-label'?: string
}) {
  const t = useCoreloomI18n().messages.shop
  return (
    <ul
      data-slot="product-grid"
      aria-label={ariaLabel ?? t.products}
      className={cn(
        'm-0 grid list-none grid-cols-2 gap-x-4 gap-y-8 p-0 md:grid-cols-3 lg:grid-cols-4',
        className,
      )}
    >
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} currency={currency} onAddToCart={onAddToCart} />
        </li>
      ))}
    </ul>
  )
}

/** One option as a row of radios: round swatches when its values have colours, buttons otherwise. */
function OptionPicker({
  product,
  option,
  selection,
  onPick,
}: {
  product: Product
  option: ProductOption
  selection: Record<string, string>
  onPick: (value: string) => void
}) {
  const t = useCoreloomI18n().messages.shop
  const nameId = React.useId()
  const picked = option.values.find((v) => v.value === selection[option.id])
  const swatches = option.values.some((v) => v.color)
  return (
    <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
      <legend className="mb-2.5 p-0 text-[13.5px] text-fg-secondary">
        <span className="font-medium text-foreground">{option.name}</span>
        {!!picked && <span>: {picked.label}</span>}
      </legend>
      <div className="flex flex-wrap gap-2">
        {option.values.map((v) => {
          const available = isValueAvailable(product, selection, option.id, v.value)
          return (
            <label
              key={v.value}
              title={swatches ? v.label : undefined}
              className={cn(
                'relative flex cursor-pointer items-center justify-center border border-border text-[13.5px] text-foreground transition-colors duration-fast',
                'has-checked:border-foreground has-focus-visible:ring-[3px] has-focus-visible:ring-ring',
                swatches
                  ? 'size-9 rounded-full p-1'
                  : 'h-10 min-w-12 rounded-md px-3.5 hover:bg-accent',
                !available && 'text-muted-foreground',
              )}
            >
              <input
                type="radio"
                name={nameId}
                value={v.value}
                checked={selection[option.id] === v.value}
                onChange={() => {
                  onPick(v.value)
                }}
                className="absolute inset-0 m-0 cursor-[inherit] appearance-none rounded-[inherit] opacity-0"
              />
              {swatches ? (
                <span
                  aria-hidden
                  className="pointer-events-none size-full rounded-full border border-border-subtle"
                  style={{ background: v.color }}
                />
              ) : (
                <span
                  aria-hidden
                  className={cn('pointer-events-none', !available && 'line-through')}
                >
                  {v.label}
                </span>
              )}
              <span className="sr-only">
                {v.label}
                {!available && `, ${t.soldOut}`}
              </span>
              {swatches && !available && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 m-auto h-px w-[130%] -rotate-45 bg-muted-foreground"
                />
              )}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

function Gallery({
  product,
  active,
  onActive,
}: {
  product: Product
  active: number
  onActive: (i: number) => void
}) {
  const t = useCoreloomI18n().messages.shop
  const image = product.images.at(active) ?? product.images.at(0)
  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square overflow-hidden rounded-xl border border-border bg-inset">
        {!!image && <img src={image.src} alt={image.alt} className="size-full object-cover" />}
      </div>
      {product.images.length > 1 && (
        <ul aria-label={t.images} className="m-0 grid list-none grid-cols-5 gap-2 p-0">
          {product.images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                aria-label={t.showImage(i + 1, img.alt)}
                aria-current={i === active || undefined}
                onClick={() => {
                  onActive(i)
                }}
                className={cn(
                  'block aspect-square w-full overflow-hidden rounded-md border-2 outline-none focus-visible:ring-[3px] focus-visible:ring-ring',
                  i === active
                    ? 'border-foreground'
                    : 'border-transparent opacity-80 hover:opacity-100',
                )}
              >
                <img src={img.src} alt="" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** "Only 3 left", "Sold out", or nothing when there is plenty. */
function StockNote({ stock }: { stock: number | undefined }) {
  const t = useCoreloomI18n().messages.shop
  if (stock === undefined || stock > 5) return null
  return (
    <p className={cn('m-0 text-[13px]', stock === 0 ? 'text-destructive' : 'text-warning')}>
      {stock === 0 ? t.soldOut : t.fewLeft(stock)}
    </p>
  )
}

/** The add-to-cart request in flight, and what came of it. */
function useAddToCart(add: () => Promise<void> | void) {
  const [status, setStatus] = React.useState<ActionStatus>('idle')
  React.useEffect(() => {
    if (status !== 'success' && status !== 'error') return
    const timer = setTimeout(() => {
      setStatus('idle')
    }, 2000)
    return () => {
      clearTimeout(timer)
    }
  }, [status])
  async function run() {
    if (status === 'loading') return
    setStatus('loading')
    try {
      await add()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }
  return { status, run }
}

function ProductHeading({
  product,
  variant,
  currency,
}: {
  product: Product
  variant: ProductVariant | undefined
  currency: string
}) {
  return (
    <div className="flex flex-col gap-3">
      {!!product.badge && <Badge className="w-fit">{product.badge}</Badge>}
      <h1 className="m-0 font-display text-[clamp(26px,3vw,34px)] leading-[1.15] font-semibold tracking-[-0.02em] text-foreground">
        {product.name}
      </h1>
      <Price
        amount={variant?.price ?? product.price}
        compareAt={variant ? variant.compareAtPrice : product.compareAtPrice}
        currency={currency}
        size="lg"
      />
      {!!product.rating && <ProductRating rating={product.rating} />}
    </div>
  )
}

/** Quantity and "Add to cart", with the request's wait and outcome. */
function BuyRow({
  stock,
  unavailable,
  quantity,
  onQuantity,
  onAdd,
}: {
  stock: number | undefined
  unavailable: boolean
  quantity: number
  onQuantity: (quantity: number) => void
  onAdd: () => Promise<void> | void
}) {
  const t = useCoreloomI18n().messages.shop
  const adding = useAddToCart(onAdd)
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <NumberInput
        aria-label={t.quantity}
        value={quantity}
        onValueChange={(q) => {
          onQuantity(Math.max(1, q ?? 1))
        }}
        min={1}
        max={stock && stock > 0 ? stock : undefined}
        stepper="sides"
        className="sm:w-36"
        disabled={unavailable}
      />
      <StatusButton
        size="lg"
        className="sm:flex-1"
        status={adding.status}
        disabled={unavailable}
        loadingLabel={t.adding}
        successLabel={t.added}
        errorLabel={t.addFailed}
        onClick={() => void adding.run()}
      >
        {unavailable ? t.unavailable : t.add}
      </StatusButton>
    </div>
  )
}

function ProductDetail({
  product,
  currency = 'EUR',
  selection: selectionProp,
  defaultSelection: defaultSelectionProp,
  onSelectionChange,
  onAddToCart,
  children,
  className,
}: {
  product: Product
  /** ISO 4217 code. Default "EUR". */
  currency?: string
  /** Option id → value. Defaults to the first variant in stock. */
  selection?: Record<string, string>
  defaultSelection?: Record<string, string>
  onSelectionChange?: (
    selection: Record<string, string>,
    variant: ProductVariant | undefined,
  ) => void
  /** Adds to the cart. Return a promise to show the wait; throw to show it failed. */
  onAddToCart: (item: {
    product: Product
    variant?: ProductVariant
    quantity: number
  }) => Promise<void> | void
  /** More under the button: delivery, returns, an accordion of details. */
  children?: React.ReactNode
  className?: string
}) {
  const [innerSelection, setInnerSelection] = React.useState(
    () => defaultSelectionProp ?? defaultSelection(product),
  )
  const selection = selectionProp ?? innerSelection
  const [quantity, setQuantity] = React.useState(1)
  const variant = findVariant(product, selection)
  const [image, setImage] = React.useState(variant?.image ?? 0)
  const stock = product.variants?.length ? variant?.stock : product.stock
  const unavailable = (!!product.variants?.length && !variant) || stock === 0

  function pick(optionId: string, value: string) {
    const next = { ...selection, [optionId]: value }
    const nextVariant = findVariant(product, next)
    setInnerSelection(next)
    if (nextVariant?.image !== undefined) setImage(nextVariant.image)
    onSelectionChange?.(next, nextVariant)
  }

  return (
    <div
      data-slot="product-detail"
      className={cn('grid w-full gap-8 md:grid-cols-2 md:gap-12', className)}
    >
      <Gallery product={product} active={image} onActive={setImage} />
      <div className="flex flex-col gap-6">
        <ProductHeading product={product} variant={variant} currency={currency} />
        {!!product.description && (
          <div className="text-[15px] leading-[1.65] text-fg-secondary [&_p]:my-2">
            {product.description}
          </div>
        )}
        {product.options?.map((option) => (
          <OptionPicker
            key={option.id}
            product={product}
            option={option}
            selection={selection}
            onPick={(value) => {
              pick(option.id, value)
            }}
          />
        ))}
        <StockNote stock={stock} />
        <BuyRow
          stock={stock}
          unavailable={unavailable}
          quantity={quantity}
          onQuantity={setQuantity}
          onAdd={() => onAddToCart({ product, variant, quantity })}
        />
        {children}
      </div>
    </div>
  )
}

export { Price, ProductCard, ProductDetail, ProductGrid }
