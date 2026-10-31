import type { Meta, StoryObj } from '@storybook/react-vite'
import { BlocksIcon, BookOpenIcon, PaletteIcon, ZapIcon } from 'lucide-react'
import * as React from 'react'

import { CodeBlock } from '@/components/code-block'
import { CommandMenu } from '@/components/command-menu'
import { ComponentPreview } from '@/components/component-preview'
import { DocsLayout, DocsPageHeader } from '@/components/docs-layout'
import { SiteHeader } from '@/components/site-header'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge, BadgeDot } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const nav = [
  {
    title: 'Getting started',
    items: [
      { title: 'Installation', href: '#' },
      { title: 'Theming', href: '#' },
    ],
  },
  {
    title: 'Components',
    items: ['Alert', 'Badge', 'Button', 'Card'].map((t) => ({
      title: t,
      href: `#${t}`,
      active: t === 'Button',
    })),
  },
]

const meta = {
  title: 'Blocks/Docs',
  component: DocsLayout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    nav,
    toc: [
      { id: 'installation', title: 'Installation' },
      { id: 'usage', title: 'Usage' },
    ],
    children: null,
  },
} satisfies Meta<typeof DocsLayout>
export default meta
type Story = StoryObj<typeof meta>

export const ComponentPage: Story = {
  render: (args) => (
    <DocsLayout
      {...args}
      header={
        <SiteHeader
          maxWidth="max-w-[1240px]"
          brand={
            <span className="font-display text-[18px] font-bold text-foreground">
              Core<span className="text-primary-text">loom</span>
            </span>
          }
          actions={
            <>
              <CommandMenu
                triggerLabel="Search docs…"
                groups={[
                  {
                    heading: 'Components',
                    items: [{ label: 'Button', icon: BlocksIcon, onSelect: () => {} }],
                  },
                ]}
              />
              <ThemeToggle />
            </>
          }
        />
      }
    >
      <DocsPageHeader
        eyebrow={
          <Badge variant="default">
            <BadgeDot />
            shadcn/ui
          </Badge>
        }
        title="Button"
        lead="Triggers an action or event."
      />
      <h2
        id="installation"
        className="mt-10 mb-3 scroll-mt-20 font-display text-[24px] font-semibold"
      >
        Installation
      </h2>
      <CodeBlock code="pnpm dlx shadcn@latest add @coreloom/button" />
      <h2 id="usage" className="mt-10 mb-3 scroll-mt-20 font-display text-[24px] font-semibold">
        Usage
      </h2>
      <ComponentPreview code={'<Button>Get started</Button>'}>
        <Button>
          <ZapIcon />
          Get started
        </Button>
        <Button variant="secondary">Secondary</Button>
      </ComponentPreview>
      <CodeBlock
        className="mt-4"
        title="app/page.tsx"
        code={
          'import { Button } from "@/components/ui/button"\n\nexport default function Page() {\n  return <Button>Get started</Button>\n}'
        }
      />
    </DocsLayout>
  ),
}

const askAiGroups = [
  {
    heading: 'Components',
    items: ['Button group', 'Button', 'Badge', 'Card'].map((label) => ({
      label,
      icon: BlocksIcon,
      onSelect: () => {},
    })),
  },
  {
    heading: 'Guides',
    items: [
      { label: 'Theming', icon: PaletteIcon, onSelect: () => {} },
      { label: 'Installation', icon: BookOpenIcon, onSelect: () => {} },
    ],
  },
]

/** The palette with `onAskAi`: open it (⌘K), type a question, and "Ask AI: “…”" comes first. Here the question lands in the page; in an app it opens the assistant. */
export const AskAi: Story = {
  name: 'Ask AI from the palette',
  render: (args) => {
    const [asked, setAsked] = React.useState<string | null>(null)
    return (
      <DocsLayout
        {...args}
        header={
          <SiteHeader
            maxWidth="max-w-[1240px]"
            brand={
              <span className="font-display text-[18px] font-bold text-foreground">
                Core<span className="text-primary-text">loom</span>
              </span>
            }
            actions={
              <>
                <CommandMenu triggerLabel="Search docs…" groups={askAiGroups} onAskAi={setAsked} />
                <ThemeToggle />
              </>
            }
          />
        }
      >
        <DocsPageHeader
          title="Theming"
          lead="Open the search, type a question that isn't a page title, and ask the assistant instead."
        />
        <p role="status" className="mt-6 text-[14px] text-fg-secondary">
          {asked ? `The assistant would answer: “${asked}”` : 'Nothing asked yet.'}
        </p>
      </DocsLayout>
    )
  },
}
