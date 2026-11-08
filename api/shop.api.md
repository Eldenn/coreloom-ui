# @coreloom/shop

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/commerce.ts

```ts
type CartLine = {}
CartLine.id: string
CartLine.name: string
CartLine.variant?: string | undefined
CartLine.image?: ProductImage | undefined
CartLine.href?: string | undefined
CartLine.unitPrice: number
CartLine.quantity: number
CartLine.maxQuantity?: number | undefined
type CartTotals = {}
CartTotals.subtotal: number
CartTotals.discount: number
CartTotals.shipping: number | null
CartTotals.tax: number
CartTotals.total: number
CartTotals.count: number
function cartTotals(lines: CartLine[], { discount, shipping, freeShippingFrom, taxRate, taxIncluded, }?: { discount?: Discount; shipping?: number | null; freeShippingFrom?: number; taxRate?: number; taxIncluded?: boolean; }) => CartTotals
function defaultSelection(product: Product) => Record<string, string>
type Discount = { type: 'percent'; value: number; code?: string; } | { type: 'amount'; value: number; code?: string; }
function findVariant(product: Product, selection: Record<string, string>) => ProductVariant | undefined
function formatMoney(amount: number, currency: string, locale: string) => string
function isValueAvailable(product: Product, selection: Record<string, string>, optionId: string, value: string) => boolean
type Product = {}
Product.id: string
Product.name: string
Product.href?: string | undefined
Product.description?: React.ReactNode
Product.images: ProductImage[]
Product.price: number
Product.compareAtPrice?: number | undefined
Product.stock?: number | undefined
Product.options?: ProductOption[] | undefined
Product.variants?: ProductVariant[] | undefined
Product.rating?: {}
Product.rating.value: number
Product.rating.count: number
Product.badge?: React.ReactNode
type ProductImage = {}
ProductImage.src: string
ProductImage.alt: string
type ProductOption = {}
ProductOption.id: string
ProductOption.name: string
ProductOption.values: ProductOptionValue[]
type ProductOptionValue = {}
ProductOptionValue.value: string
ProductOptionValue.label: string
ProductOptionValue.color?: string | undefined
type ProductVariant = {}
ProductVariant.id: string
ProductVariant.options: Record<string, string>
ProductVariant.price: number
ProductVariant.compareAtPrice?: number | undefined
ProductVariant.stock?: number | undefined
ProductVariant.image?: number | undefined
```

## src/components/product.tsx

```ts
function Price
Price.amount: number
Price.compareAt?: number | undefined
Price.currency: string
Price.size?: 'lg' | 'default' | undefined
function ProductCard
ProductCard.product: Product
ProductCard.currency?: string | undefined
ProductCard.onAddToCart?: ((product: Product) => void) | undefined
ProductCard.className?: string | undefined
function ProductDetail
ProductDetail.product: Product
ProductDetail.currency?: string | undefined
ProductDetail.selection?: Record<string, string> | undefined
ProductDetail.defaultSelection?: Record<string, string> | undefined
ProductDetail.onSelectionChange?: ((selection: Record<string, string>, variant: ProductVariant | undefined) => void) | undefined
ProductDetail.onAddToCart: (item: { product: Product; variant?: ProductVariant; quantity: number; }) => Promise<void> | void
ProductDetail.children?: React.ReactNode
ProductDetail.className?: string | undefined
function ProductGrid
ProductGrid.products: Product[]
ProductGrid.currency?: string | undefined
ProductGrid.onAddToCart?: ((product: Product) => void) | undefined
ProductGrid.className?: string | undefined
ProductGrid.aria-label?: string | undefined
```

## src/components/cart.tsx

```ts
function Cart
Cart.discount?: Discount | undefined
Cart.shipping?: number | null | undefined
Cart.freeShippingFrom?: number | undefined
Cart.taxRate?: number | undefined
Cart.taxIncluded?: boolean | undefined
Cart.lines: CartLine[]
Cart.currency?: string | undefined
Cart.onQuantityChange: (id: string, quantity: number) => void
Cart.onRemove: (id: string) => void
Cart.onApplyCode?: ((code: string) => Promise<void> | void) | undefined
Cart.appliedCode?: string | undefined
Cart.onRemoveCode?: (() => void) | undefined
Cart.onCheckout?: (() => void) | undefined
Cart.onContinueShopping?: (() => void) | undefined
Cart.className?: string | undefined
function CartButton
CartButton.size?: 'sm' | 'lg' | 'default' | 'icon' | 'icon-sm' | 'icon-lg' | null | undefined
CartButton.variant?: 'link' | 'default' | 'destructive' | 'secondary' | 'outline' | 'ghost' | null | undefined
CartButton.asChild?: boolean | undefined
CartButton.count: number
CartButton.*: react
function CartLines
CartLines.lines: CartLine[]
CartLines.currency?: string | undefined
CartLines.onQuantityChange: (id: string, quantity: number) => void
CartLines.onRemove: (id: string) => void
CartLines.className?: string | undefined
type CartPricing = {}
CartPricing.discount?: Discount | undefined
CartPricing.shipping?: number | null | undefined
CartPricing.freeShippingFrom?: number | undefined
CartPricing.taxRate?: number | undefined
CartPricing.taxIncluded?: boolean | undefined
function CartSheet
CartSheet.currency?: string | undefined
CartSheet.shipping?: number | null | undefined
CartSheet.discount?: Discount | undefined
CartSheet.freeShippingFrom?: number | undefined
CartSheet.taxRate?: number | undefined
CartSheet.taxIncluded?: boolean | undefined
CartSheet.lines: CartLine[]
CartSheet.onQuantityChange: (id: string, quantity: number) => void
CartSheet.onRemove: (id: string) => void
CartSheet.onCheckout?: (() => void) | undefined
CartSheet.onContinueShopping?: (() => void) | undefined
CartSheet.open: boolean
CartSheet.onOpenChange: (open: boolean) => void
function OrderSummary
OrderSummary.totals: CartTotals
OrderSummary.currency?: string | undefined
OrderSummary.taxIncluded?: boolean | undefined
OrderSummary.freeShippingFrom?: number | undefined
OrderSummary.onApplyCode?: ((code: string) => Promise<void> | void) | undefined
OrderSummary.appliedCode?: string | undefined
OrderSummary.onRemoveCode?: (() => void) | undefined
OrderSummary.onCheckout?: (() => void) | undefined
OrderSummary.checkoutLabel?: React.ReactNode
OrderSummary.children?: React.ReactNode
OrderSummary.className?: string | undefined
```
