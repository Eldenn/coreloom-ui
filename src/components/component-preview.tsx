// Coreloom UI — ComponentPreview (docs block). Preview and Code tabs for a live example.
import * as React from "react"

import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/code-block"

function ComponentPreview({
  code,
  children,
  align = "center",
  className,
}: {
  code: string
  children: React.ReactNode
  align?: "center" | "start"
  className?: string
}) {
  return (
    <Tabs defaultValue="preview" className={cn("mt-4", className)}>
      <TabsList variant="line">
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview">
        <div
          className={cn(
            "flex min-h-[148px] flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-7",
            align === "center" ? "justify-center" : "justify-start"
          )}
        >
          {children}
        </div>
      </TabsContent>
      <TabsContent value="code">
        <CodeBlock code={code} />
      </TabsContent>
    </Tabs>
  )
}

export { ComponentPreview }
