// Coreloom UI — commerce (shop block). The shapes a shop's components read (products, their
// options and variants, cart lines) and the arithmetic behind them: which variant a selection
// picks, which option values are still in stock, and a cart's totals. Prices are in the currency's
// main unit (12.5 is €12.50); totals are summed in cents so they never drift (0.1 + 0.2).
import type * as React from 'react'

interface ProductOptionValue {
  value: string
  label: string
  /** A CSS colour for a swatch ("#1f2937", "oklch(…)"): the option shows round swatches. */
  color?: string
}

interface ProductOption {
  /** "color", "size". */
  id: string
  /** "Colour", "Size". */
  name: string
  values: ProductOptionValue[]
}

interface ProductVariant {
  id: string
  /** Option id → value: { color: "sand", size: "m" }. */
  options: Record<string, string>
  price: number
  /** The price before a discount, shown struck through. */
  compareAtPrice?: number
  /** Units left; 0 is sold out; leave it out for no limit. */
  stock?: number
  /** Index in the product's images to show when this variant is picked. */
  image?: number
}

interface ProductImage {
  src: string
  alt: string
}

interface Product {
  id: string
  name: string
  /** The product's page. */
  href?: string
  description?: React.ReactNode
  images: ProductImage[]
  /** The price shown when no variant is picked (often the lowest). */
  price: number
  compareAtPrice?: number
  /** Units left when the product has no variants; 0 is sold out. */
  stock?: number
  options?: ProductOption[]
  variants?: ProductVariant[]
  /** Average score out of 5 and the number of reviews. */
  rating?: { value: number; count: number }
  /** A label on the image: "New", "−20%". */
  badge?: React.ReactNode
}

interface CartLine {
  id: string
  name: string
  /** "Sand / M". */
  variant?: string
  image?: ProductImage
  href?: string
  unitPrice: number
  quantity: number
  /** The most that can be ordered (the stock). */
  maxQuantity?: number
}

type Discount =
  | { type: 'percent'; value: number; code?: string }
  | { type: 'amount'; value: number; code?: string }

interface CartTotals {
  subtotal: number
  discount: number
  /** null: worked out at the next step. */
  shipping: number | null
  tax: number
  total: number
  /** Number of items (quantities added up). */
  count: number
}

const cents = (n: number) => Math.round(n * 100)
const units = (n: number) => n / 100

/** The variant matching every option of a selection, if the selection is complete. */
function findVariant(product: Product, selection: Record<string, string>) {
  const options = product.options ?? []
  if (options.some((o) => !(o.id in selection))) return undefined
  return product.variants?.find((v) => options.every((o) => v.options[o.id] === selection[o.id]))
}

const inStock = (stock: number | undefined) => stock === undefined || stock > 0

/**
 * Whether picking `value` for `optionId`, with the rest of the selection unchanged, leads to a
 * variant in stock. A product without variants is available unless its own stock is 0.
 */
function isValueAvailable(
  product: Product,
  selection: Record<string, string>,
  optionId: string,
  value: string,
) {
  if (!product.variants?.length) return inStock(product.stock)
  const wanted = { ...selection, [optionId]: value }
  return product.variants.some(
    (v) =>
      inStock(v.stock) &&
      Object.entries(wanted).every(
        ([id, picked]) => !(id in v.options) || v.options[id] === picked,
      ),
  )
}

/** The first in-stock variant's options, or the first variant's: a sensible starting selection. */
function defaultSelection(product: Product): Record<string, string> {
  const variant = product.variants?.find((v) => inStock(v.stock)) ?? product.variants?.at(0)
  if (variant) return { ...variant.options }
  return Object.fromEntries(
    (product.options ?? []).flatMap((o) => (o.values[0] ? [[o.id, o.values[0].value]] : [])),
  )
}

/** What a discount takes off a subtotal, in cents: never below 0 nor above the subtotal. */
function discountCents(subtotal: number, discount: Discount | undefined) {
  if (!discount) return 0
  if (discount.type === 'percent')
    return Math.round((subtotal * Math.min(100, Math.max(0, discount.value))) / 100)
  return Math.min(subtotal, cents(Math.max(0, discount.value)))
}

function shippingCents(shipping: number | null | undefined, free: boolean) {
  if (shipping === undefined || shipping === null) return null
  return free ? 0 : cents(shipping)
}

/**
 * A cart's totals. `taxRate` (0.2 for 20%) is added on top of the discounted subtotal unless
 * `taxIncluded`, where it is the part of the prices that is tax. Shipping is free from
 * `freeShippingFrom` (compared with the discounted subtotal); leave `shipping` out when it isn't
 * known yet.
 */
function cartTotals(
  lines: CartLine[],
  {
    discount,
    shipping,
    freeShippingFrom,
    taxRate = 0,
    taxIncluded = false,
  }: {
    discount?: Discount
    shipping?: number | null
    freeShippingFrom?: number
    taxRate?: number
    taxIncluded?: boolean
  } = {},
): CartTotals {
  const subtotal = lines.reduce((sum, l) => sum + cents(l.unitPrice) * Math.max(0, l.quantity), 0)
  const off = discountCents(subtotal, discount)
  const net = subtotal - off
  const free = freeShippingFrom !== undefined && net >= cents(freeShippingFrom)
  const ship = shippingCents(shipping, free || net === 0)
  const tax = taxIncluded ? Math.round(net - net / (1 + taxRate)) : Math.round(net * taxRate)
  const total = net + (ship ?? 0) + (taxIncluded ? 0 : tax)
  return {
    subtotal: units(subtotal),
    discount: units(off),
    shipping: ship === null ? null : units(ship),
    tax: units(tax),
    total: units(total),
    count: lines.reduce((n, l) => n + Math.max(0, l.quantity), 0),
  }
}

/** A price in the locale's format: formatMoney(12.5, "EUR", "fr") → "12,50 €". Whole amounts drop the cents. */
function formatMoney(amount: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export {
  type CartLine,
  type CartTotals,
  cartTotals,
  defaultSelection,
  type Discount,
  findVariant,
  formatMoney,
  isValueAvailable,
  type Product,
  type ProductImage,
  type ProductOption,
  type ProductOptionValue,
  type ProductVariant,
}
