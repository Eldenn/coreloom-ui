// Coreloom UI — StatCard (app-shell block). One metric: label, value, change and context.
import * as React from "react"
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function StatCard({
  label,
  value,
  delta,
  trend = "up",
  good = trend === "up",
  note,
  className,
}: {
  label: string
  value: React.ReactNode
  /** The change, as displayed: "+12.4%", "−8s". */
  delta?: string
  trend?: "up" | "down"
  /** Whether this change is good news (colors the badge). Defaults to "up is good". */
  good?: boolean
  /** Context for the change: "last 30 days". */
  note?: string
  className?: string
}) {
  const Icon = trend === "up" ? TrendingUpIcon : TrendingDownIcon
  return (
    <Card className={cn("gap-2", className)}>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-display text-[28px] tracking-[-0.02em] tabular-nums">{value}</CardTitle>
        {delta && (
          <CardAction>
            <Badge variant={good ? "success" : "warning"}>
              <Icon />
              {delta}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      {note && <div className="text-[12px] text-muted-foreground">{note}</div>}
    </Card>
  )
}

export { StatCard }
