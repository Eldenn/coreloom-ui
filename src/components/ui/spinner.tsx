import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin text-muted-foreground motion-reduce:animate-[spin_1.5s_linear_infinite]", className)}
      {...props}
    />
  )
}

export { Spinner }
