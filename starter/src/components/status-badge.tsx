import { Badge, BadgeDot } from "@/components/ui/badge"
import type { ProjectStatus } from "@/lib/api"
import { useT } from "@/lib/locale"

const variant = { ready: "success", building: "warning", failed: "destructive" } as const

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const t = useT()
  return (
    <Badge variant={variant[status]}>
      <BadgeDot />
      {t.status[status]}
    </Badge>
  )
}
