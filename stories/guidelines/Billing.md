# Billing

The parts of a billing page: the current plan, usage against its limits, the card on file and the invoices.

**Install** `pnpm dlx shadcn@latest add @coreloom/billing`. It writes `billing.tsx`.

**The consumer provides**:

- `<PlanCard name price currency interval renewsAt endsAt features onChangePlan onCancel>` — an `accent` card with the price in `font-display`; a cancelled plan shows its end date instead of the renewal.
- `<UsageMeters items>` — `[{ label, used, limit, unit? }]`; a meter turns `warning` from 80 % and `danger` past 100 %, with a word, not only a colour.
- `<PaymentMethod brand last4 expires onUpdate>`.
- `<InvoiceTable invoices currency>` — `[{ id, date, amount, currency?, status: "paid" | "due" | "failed", href? }]`, with a download link per invoice.

- Amounts are numbers in major units, formatted in the reader's locale ("€24", "24,00 €"); dates are `Date`s.
- Send **Change plan**, **Cancel** and **Update** to your billing provider's customer portal; keep this page a summary.
