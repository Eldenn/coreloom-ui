import type { Meta, StoryObj } from "@storybook/react-vite"
import { ArrowRightIcon, BlocksIcon, BookOpenIcon, CommandIcon, ZapIcon } from "lucide-react"

import { CtaSection } from "@/components/cta-section"
import { Faq } from "@/components/faq"
import { FeatureGrid } from "@/components/feature-grid"
import { Hero } from "@/components/hero"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

const brand = <a href="#" className="font-display text-[19px] font-bold tracking-[-0.03em] text-foreground">Core<span className="text-primary">loom</span></a>

const meta = {
  title: "Blocks/Marketing",
  component: Hero,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    announcement: "v3.0 — now built on shadcn/ui",
    title: "The component layer",
    highlight: "developers reach for.",
    description: "Coreloom UI is a dark-first shadcn registry — Radix primitives, Tailwind v4 and one token layer.",
    command: "pnpm dlx shadcn@latest add @coreloom/all",
  },
} satisfies Meta<typeof Hero>
export default meta
type Story = StoryObj<typeof meta>

export const LandingPage: Story = {
  render: (args) => (
    <div className="bg-background">
      <SiteHeader brand={brand} links={[{ label: "Docs", href: "#" }, { label: "Components", href: "#" }, { label: "Pricing", href: "#" }]} actions={<><ThemeToggle /><Button variant="secondary" size="sm">Sign in</Button></>} />
      <Hero {...args} actions={<><Button size="lg">Get started<ArrowRightIcon /></Button><Button size="lg" variant="secondary"><BookOpenIcon />Read the docs</Button></>} />
      <FeatureGrid eyebrow="Why Coreloom" title="Everything wired, nothing in your way" features={[
        { icon: BlocksIcon, title: "shadcn/ui underneath", description: "Every component is shadcn source you own.", meta: "@coreloom registry" },
        { icon: ZapIcon, title: "Zero-config theming", description: "One theme layer maps shadcn colors onto the tokens.", meta: "data-theme" },
        { icon: CommandIcon, title: "Keyboard-first", description: "Radix focus management and a ⌘K palette.", meta: "Radix" },
      ]} />
      <Faq items={[{ question: "Is Coreloom UI a fork of shadcn/ui?", answer: "No — a shadcn registry with Coreloom styling." }, { question: "Does it support light mode?", answer: "Set data-theme=\"light\" on html." }]} />
      <CtaSection title="Start your next app on Coreloom" description="Add the registry and every component arrives on-brand." actions={<Button size="lg">Get started<ArrowRightIcon /></Button>} />
      <SiteFooter note="© 2026 Coreloom — MIT licensed" links={[{ label: "GitHub", href: "#" }]} />
    </div>
  ),
}
