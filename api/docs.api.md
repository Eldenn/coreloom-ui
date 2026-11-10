# @coreloom/docs

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/docs-layout.tsx

```ts
function DocsLayout
DocsLayout.header?: React.ReactNode
DocsLayout.nav: DocsNavGroup[]
DocsLayout.toc?: TocItem[] | undefined
DocsLayout.children: React.ReactNode
DocsLayout.className?: string | undefined
function DocsNav
DocsNav.groups: DocsNavGroup[]
DocsNav.onNavigate?: (() => void) | undefined
type DocsNavGroup = {}
DocsNavGroup.title: string
DocsNavGroup.items: { title: string; href: string; active?: boolean; }[]
function DocsPageHeader
DocsPageHeader.eyebrow?: React.ReactNode
DocsPageHeader.title: React.ReactNode
DocsPageHeader.lead?: React.ReactNode
```

## src/components/docs-toc.tsx

```ts
function DocsToc
DocsToc.items: TocItem[]
DocsToc.title?: string | undefined
type TocItem = {}
TocItem.id: string
TocItem.title: string
TocItem.depth?: 2 | 3 | undefined
```

## src/components/code-block.tsx

```ts
function CodeBlock
CodeBlock.code: string
CodeBlock.title?: string | undefined
CodeBlock.children?: React.ReactNode
CodeBlock.className?: string | undefined
```

## src/components/component-preview.tsx

```ts
function ComponentPreview
ComponentPreview.code: string
ComponentPreview.children: React.ReactNode
ComponentPreview.align?: 'center' | 'start' | undefined
ComponentPreview.className?: string | undefined
```
