import type { Meta, StoryObj } from "@storybook/react-vite"

import { Icon, icons, type IconName } from "@/components/ui/icon"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const meta = { title: "Components/Layout & utilities", component: Separator, tags: ["autodocs"] } satisfies Meta<typeof Separator>
export default meta
type Story = StoryObj<typeof meta>

const pane = (label: string) => <div className="flex h-full items-center justify-center font-mono text-[12px] text-muted-foreground">{label}</div>

export const ResizableStory: Story = {
  name: "Resizable",
  render: () => (
    <ResizablePanelGroup orientation="horizontal" className="h-[260px] max-w-2xl rounded-md border border-border bg-surface">
      <ResizablePanel defaultSize="30%" minSize="20%">{pane("files")}</ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="70%">
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize="65%">{pane("editor")}</ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="35%">{pane("terminal")}</ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

export const ScrollAreaStory: Story = {
  name: "ScrollArea & Separator",
  render: () => (
    <ScrollArea className="h-56 w-60 rounded-md border border-border bg-surface">
      <div className="p-4">
        <div className="mb-3 text-[13px] font-semibold">Releases</div>
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i}>
            <div className="font-mono text-[13px] text-fg-secondary">v2.{24 - i}.0</div>
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const Icons: Story = {
  render: () => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
      {(Object.keys(icons) as IconName[]).map((name) => (
        <div key={name} className="flex flex-col items-center gap-2 rounded-md border border-border-subtle p-3">
          <Icon name={name} />
          <span className="font-mono text-[11px] text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  ),
}
