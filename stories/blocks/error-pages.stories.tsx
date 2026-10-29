import type { Meta, StoryObj } from "@storybook/react-vite"
import { LockIcon } from "lucide-react"

import { ErrorPage, MaintenancePage, NotFoundPage, ServerErrorPage } from "@/components/error-page"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner"

const brand = <span className="font-display text-[20px] font-bold tracking-[-0.03em] text-foreground">Core<span className="text-primary-text">loom</span></span>

const meta = {
  title: "Blocks/Error pages",
  component: NotFoundPage,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: { brand },
} satisfies Meta<typeof NotFoundPage>
export default meta
type Story = StoryObj<typeof meta>

export const NotFound: Story = {}

export const ServerError: Story = {
  render: () => <ServerErrorPage brand={brand} onRetry={() => toast("Retrying…")} reference="req_8f2k91" statusHref="#" />,
}

export const Maintenance: Story = {
  render: () => <MaintenancePage brand={brand} until={new Date(2026, 9, 14, 14, 30)} statusHref="#" />,
}

export const Forbidden: Story = {
  render: () => (
    <ErrorPage
      brand={brand}
      code="403"
      title="You don’t have access to this project"
      description="Ask a workspace owner to invite you, or switch to another workspace."
      actions={
        <>
          <Button>
            <LockIcon />
            Request access
          </Button>
          <Button variant="secondary">Switch workspace</Button>
        </>
      }
    />
  ),
}
