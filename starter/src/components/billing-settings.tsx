// Settings → Billing: the billing block with demo figures. Wire PlanCard's actions to your billing
// provider's customer portal, and the invoices to its API.
import { InvoiceTable, PaymentMethod, PlanCard, UsageMeters } from "@/components/billing"
import { toast } from "@/components/ui/sonner"
import { useT } from "@/lib/locale"

const month = (offset: number) => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + offset, 1)
}

export function BillingSettings() {
  const t = useT()
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PlanCard
        name="Pro"
        price={24}
        renewsAt={month(1)}
        features={t.settings.planFeatures}
        onChangePlan={() => toast(t.settings.billing)}
        onCancel={() => toast(t.settings.billing)}
      />
      <UsageMeters
        items={[
          { label: t.settings.usage.builds, used: 1840, limit: 3000, unit: "min" },
          { label: t.settings.usage.bandwidth, used: 86, limit: 100, unit: "GB" },
          { label: t.settings.usage.seats, used: 4, limit: 10 },
        ]}
      />
      <PaymentMethod brand="Visa" last4="4242" expires={new Date(month(0).getFullYear() + 2, 3, 1)} onUpdate={() => toast(t.settings.billing)} />
      <InvoiceTable
        className="lg:col-span-2"
        invoices={[0, -1, -2, -3].map((offset, i) => ({
          id: `INV-${month(offset).getFullYear()}-${String(month(offset).getMonth() + 1).padStart(3, "0")}`,
          date: month(offset),
          amount: 24,
          status: i === 0 ? ("due" as const) : ("paid" as const),
        }))}
      />
    </div>
  )
}
