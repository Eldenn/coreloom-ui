import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Cart, CartButton, CartSheet, OrderSummary } from '@/components/cart'
import { type CartLine, cartTotals } from '@/components/commerce'
import { ProductDetail, ProductGrid } from '@/components/product'
import { toast } from '@/components/ui/sonner'

import { cartLines, products } from './site-data'

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

/** A cart kept in state, the way an app would (or in a store, or on the server). */
function useDemoCart(initial: CartLine[]) {
  const [lines, setLines] = React.useState(initial)
  const [code, setCode] = React.useState<string>()
  return {
    lines,
    appliedCode: code,
    discount: code ? ({ type: 'percent', value: 10, code } as const) : undefined,
    onQuantityChange: (id: string, quantity: number) => {
      setLines((ls) => ls.map((l) => (l.id === id ? { ...l, quantity } : l)))
    },
    onRemove: (id: string) => {
      setLines((ls) => ls.filter((l) => l.id !== id))
    },
    onApplyCode: async (value: string) => {
      await wait(400)
      if (value.toUpperCase() !== 'LINEN10')
        throw new Error(`${value} isn’t a valid code. Try LINEN10.`)
      setCode('LINEN10')
    },
    onRemoveCode: () => {
      setCode(undefined)
    },
  }
}

const meta = {
  title: 'Blocks/Shop',
  component: ProductDetail,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A light shop, without payment: `ProductGrid` and `ProductCard` for a listing, `ProductDetail` for a product page (images, options as swatches or buttons, stock, quantity, "Add to cart"), `Cart` with an `OrderSummary` (promo code, shipping, tax, total), and `CartSheet` opened by `CartButton`. The consumer provides the products and the cart lines, and does the checkout (`onCheckout`). `cartTotals` and `findVariant` are exported for the server side of the same rules.',
      },
    },
  },
  args: {
    product: products[0],
    onAddToCart: async () => {
      await wait(500)
    },
  },
} satisfies Meta<typeof ProductDetail>
export default meta
type Story = StoryObj<typeof meta>

/** A product with colours and sizes: sold-out combinations are struck through but still selectable. */
export const ProductPage: Story = {}

/** A product without options. */
export const SimpleProduct: Story = { args: { product: products[1] } }

/** The listing: a sold-out product says so; "Add to cart" is there for products without options. */
export const Listing: Story = {
  render: () => (
    <ProductGrid
      products={products}
      onAddToCart={(p) => {
        toast(`${p.name} added to the cart`)
      }}
    />
  ),
}

/** The cart page: change quantities, remove a line (focus moves to the next), try the code LINEN10. */
export const CartPage: Story = {
  render: function Render() {
    const cart = useDemoCart(cartLines)
    return (
      <Cart
        {...cart}
        shipping={6.9}
        freeShippingFrom={150}
        taxRate={0.2}
        taxIncluded
        onCheckout={() => toast('Hand over to your checkout here')}
        onContinueShopping={() => toast('Back to the shop')}
      />
    )
  },
}

export const EmptyCart: Story = {
  render: () => (
    <Cart
      lines={[]}
      onQuantityChange={() => {}}
      onRemove={() => {}}
      onContinueShopping={() => {}}
    />
  ),
}

/** The summary alone, for a checkout page. */
export const Summary: Story = {
  render: () => (
    <div className="max-w-sm">
      <OrderSummary
        totals={cartTotals(cartLines, { shipping: 0, taxRate: 0.2, taxIncluded: true })}
        taxIncluded
        appliedCode="LINEN10"
        onRemoveCode={() => {}}
        onCheckout={() => {}}
        checkoutLabel="Pay €196.50"
      />
    </div>
  ),
}

/** The cart in a side panel, opened from the header's cart button. */
export const Sheet: Story = {
  render: function Render() {
    const cart = useDemoCart(cartLines)
    const [open, setOpen] = React.useState(false)
    const count = cart.lines.reduce((n, l) => n + l.quantity, 0)
    return (
      <div className="flex justify-end">
        <CartButton count={count} onClick={() => setOpen(true)} />
        <CartSheet
          open={open}
          onOpenChange={setOpen}
          lines={cart.lines}
          onQuantityChange={cart.onQuantityChange}
          onRemove={cart.onRemove}
          onCheckout={() => toast('Hand over to your checkout here')}
        />
      </div>
    )
  },
}

/** The lines of the open sheet, inline (axe doesn't reach into a closed panel). */
export const SheetContentInline: Story = {
  render: function Render() {
    const cart = useDemoCart(cartLines.slice(0, 2))
    return (
      <div className="max-w-md">
        <Cart {...cart} />
      </div>
    )
  },
}

export const French: Story = { globals: { locale: 'fr' } }

export const Phone: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } }
