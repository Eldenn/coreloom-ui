# Shop

A light shop without payment: products, variants, cart and order summary. Experimental.

**Install** `pnpm dlx shadcn@latest add @coreloom/shop`. It writes `commerce.ts`, `product.tsx` and `cart.tsx`.

**The consumer provides** products `{ id, name, images, price, options?, variants?, stock? }` and cart lines `{ id, name, unitPrice, quantity }`, with `onAddToCart`, `onQuantityChange`, `onRemove` and `onCheckout`.

- Options are radio groups (swatches for colours); sold-out combinations are struck through and say so.
- `cartTotals` sums in cents: subtotal, discount, shipping, tax, total.

_On `window.CoreloomUIDesignSystem_ff5f32` as `ProductCard`, `ProductGrid`, `ProductDetail`, `Cart`, `CartSheet`, `CartButton`, `OrderSummary`._
