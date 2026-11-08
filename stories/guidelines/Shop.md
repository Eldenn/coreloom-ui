# Shop

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

A light shop, without payment: product cards and a grid for the listing, a product page with images, options (colour swatches, sizes), stock, quantity and "Add to cart", and a cart with its order summary, as a page or in a side panel. The app keeps the products and the cart and hands over to its own checkout.

**The consumer provides** the products, each `{ id, name, href?, description?, images, price, compareAtPrice?, stock?, options?, variants?, rating?, badge? }`: `images` are `{ src, alt }`, `options` `{ id, name, values: { value, label, color? }[] }` (a `color` makes swatches), `variants` `{ id, options, price, compareAtPrice?, stock?, image? }` (`stock` 0 is sold out; leave it out for no limit). Cart lines are `{ id, name, variant?, image?, href?, unitPrice, quantity, maxQuantity? }`. Prices are in the currency's main unit (12.5 is €12.50); `currency` is an ISO 4217 code (default EUR).

**`ProductDetail` takes** `product`, `currency`, `selection`, `defaultSelection` (default: the first variant in stock), `onSelectionChange(selection, variant)`, `onAddToCart({ product, variant, quantity })` (return a promise to show the wait, throw to show it failed) and `children` (delivery, returns, details under the button). **`ProductCard`** and **`ProductGrid`** take `product` / `products`, `currency` and `onAddToCart(product)` for a quick add.

**`Cart` takes** `lines`, `currency`, `onQuantityChange(id, quantity)`, `onRemove(id)`, `onCheckout`, `onContinueShopping`, the promo code (`onApplyCode(code)`, throw an `Error` to refuse it; `appliedCode`, `onRemoveCode`) and the pricing: `discount` (`{ type: "percent" | "amount", value }`), `shipping` (leave it out for "Calculated at checkout"), `freeShippingFrom`, `taxRate` (0.2 for 20%) and `taxIncluded`. **`CartSheet`** takes the same with `open` and `onOpenChange`; **`CartButton`** takes `count`. **`OrderSummary`** takes `totals` (from `cartTotals(lines, pricing)`), `checkoutLabel` and `children`.

- Options are radio groups: arrows move between values; a sold-out combination is struck through and says "sold out", but stays selectable so people see the price; "Add to cart" then reads "Unavailable".
- A reduced price reads "Now €89, was €110". Stock under 6 shows "Only 3 left".
- Removing a line announces it and moves focus to the next line's Remove button.
- `cartTotals` sums in cents and `findVariant`, `isValueAvailable` and `formatMoney` are exported: use the same rules on your server, which stays the source of truth for prices.
- No payment, addresses or accounts here: hand over to your checkout (Stripe Checkout, your PSP's hosted page).

**In an app:** `pnpm dlx shadcn@latest add @coreloom/shop`.
