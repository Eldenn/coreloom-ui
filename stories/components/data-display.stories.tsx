import type { Meta, StoryObj } from "@storybook/react-vite"
import { FolderIcon, InfoIcon, PackageIcon, PlusIcon, ZapIcon } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Badge, BadgeDot } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardIcon, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemSeparator, ItemTitle } from "@/components/ui/item"
import { Kbd } from "@/components/ui/kbd"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

const meta = { title: "Components/Data display", component: Card, tags: ["autodocs"] } satisfies Meta<typeof Card>
export default meta
type Story = StoryObj<typeof meta>

export const CardStory: Story = {
  name: "Card",
  render: () => (
    <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
      <Card accent>
        <CardIcon><ZapIcon /></CardIcon>
        <CardHeader><CardTitle>Zero-config theming</CardTitle><CardDescription>Every component inherits the tokens, dark mode included.</CardDescription></CardHeader>
        <CardFooter>@coreloom/theme</CardFooter>
      </Card>
      <Card>
        <CardIcon><PackageIcon /></CardIcon>
        <CardHeader><CardTitle>Copy, don’t import</CardTitle><CardDescription>Components land in your repo.</CardDescription></CardHeader>
      </Card>
    </div>
  ),
}

export const BadgesAndAvatars: Story = {
  name: "Badge, Avatar, Kbd",
  render: () => (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        <Badge variant="default"><BadgeDot />v3.0.0</Badge>
        <Badge>stable</Badge>
        <Badge variant="success"><BadgeDot />ready</Badge>
        <Badge variant="warning"><BadgeDot />queued</Badge>
        <Badge variant="destructive"><BadgeDot />failed</Badge>
        <Badge variant="outline">MIT</Badge>
      </div>
      <AvatarGroup>
        <Avatar><AvatarFallback>MC</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>AL</AvatarFallback></Avatar>
        <AvatarGroupCount>+4</AvatarGroupCount>
      </AvatarGroup>
      <div className="text-[14px]">Open the palette with <Kbd>⌘K</Kbd></div>
    </div>
  ),
}

export const AlertStory: Story = {
  name: "Alert",
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <Alert><InfoIcon /><AlertTitle>Heads up</AlertTitle><AlertDescription>Theming comes from the tokens.</AlertDescription></Alert>
      <Alert variant="success"><AlertTitle>Deployed</AlertTitle><AlertDescription>coreloom-web is live.</AlertDescription></Alert>
      <Alert variant="warning"><AlertTitle>Build minutes at 90%</AlertTitle><AlertDescription>Upgrade before Nov 30.</AlertDescription></Alert>
      <Alert variant="destructive"><AlertTitle>Deploy failed</AlertTitle><AlertDescription>Type error in src/theme.ts — see logs.</AlertDescription></Alert>
    </div>
  ),
}

export const Disclosure: Story = {
  name: "Accordion & Collapsible",
  render: () => (
    <div className="flex max-w-xl flex-col gap-8">
      <Accordion type="single" collapsible defaultValue="a">
        <AccordionItem value="a"><AccordionTrigger>Is it a fork of shadcn/ui?</AccordionTrigger><AccordionContent>No — a shadcn registry with Coreloom styling.</AccordionContent></AccordionItem>
        <AccordionItem value="b"><AccordionTrigger>Does it support light mode?</AccordionTrigger><AccordionContent>Set data-theme="light" on html.</AccordionContent></AccordionItem>
      </Accordion>
      <Collapsible className="flex flex-col gap-2">
        <CollapsibleTrigger asChild><Button variant="outline" size="sm" className="w-fit">Show variables</Button></CollapsibleTrigger>
        <CollapsibleContent className="rounded-md border border-border-subtle bg-surface px-3 py-2 font-mono text-[13px]">DATABASE_URL · REDIS_URL</CollapsibleContent>
      </Collapsible>
    </div>
  ),
}

export const ItemsAndEmpty: Story = {
  name: "Item & Empty",
  render: () => (
    <div className="grid max-w-3xl gap-6 md:grid-cols-2">
      <ItemGroup className="rounded-lg border border-border">
        <Item><ItemMedia variant="icon"><PackageIcon /></ItemMedia><ItemContent><ItemTitle>@coreloom/ui</ItemTitle><ItemDescription>53 components</ItemDescription></ItemContent><ItemActions><Button size="sm" variant="secondary">Open</Button></ItemActions></Item>
        <ItemSeparator />
        <Item><ItemMedia variant="icon"><ZapIcon /></ItemMedia><ItemContent><ItemTitle>@coreloom/cli</ItemTitle><ItemDescription>Scaffold a project</ItemDescription></ItemContent></Item>
      </ItemGroup>
      <Empty className="border">
        <EmptyHeader><EmptyMedia variant="icon"><FolderIcon /></EmptyMedia><EmptyTitle>No projects yet</EmptyTitle><EmptyDescription>Import a repository to deploy it.</EmptyDescription></EmptyHeader>
        <EmptyContent><Button><PlusIcon />New project</Button></EmptyContent>
      </Empty>
    </div>
  ),
}

export const Loading: Story = {
  name: "Progress, Spinner, Skeleton",
  render: () => (
    <div className="flex max-w-md flex-col gap-6">
      <Progress value={62} aria-label="Upload" />
      <div className="flex items-center gap-2 text-[14px] text-muted-foreground"><Spinner />Installing dependencies…</div>
      <div className="flex items-center gap-3"><Skeleton className="size-10 rounded-full" /><div className="flex flex-1 flex-col gap-2"><Skeleton className="h-4 w-3/5" /><Skeleton className="h-4 w-2/5" /></div></div>
    </div>
  ),
}
