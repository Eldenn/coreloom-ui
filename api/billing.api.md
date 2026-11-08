# @coreloom/billing

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/billing.tsx

```ts
type Invoice = {}
Invoice.id: string
Invoice.date: Date
Invoice.amount: number
Invoice.currency?: string | undefined
Invoice.status: 'failed' | 'paid' | 'due'
Invoice.href?: string | undefined
function InvoiceTable
InvoiceTable.invoices: Invoice[]
InvoiceTable.currency?: string | undefined
InvoiceTable.className?: string | undefined
function PaymentMethod
PaymentMethod.brand: string
PaymentMethod.last4: string
PaymentMethod.expires: Date
PaymentMethod.onUpdate?: (() => void) | undefined
PaymentMethod.className?: string | undefined
function PlanCard
PlanCard.name: string
PlanCard.price: number
PlanCard.currency?: string | undefined
PlanCard.interval?: 'month' | 'year' | undefined
PlanCard.renewsAt?: Date | undefined
PlanCard.endsAt?: Date | undefined
PlanCard.features?: string[] | undefined
PlanCard.onChangePlan?: (() => void) | undefined
PlanCard.onCancel?: (() => void) | undefined
PlanCard.className?: string | undefined
type UsageItem = {}
UsageItem.label: string
UsageItem.used: number
UsageItem.limit: number
UsageItem.unit?: string | undefined
function UsageMeters
UsageMeters.items: UsageItem[]
UsageMeters.className?: string | undefined
```
