# @coreloom/description-list

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/description-list.tsx

```ts
function DescriptionItem
DescriptionItem.term: React.ReactNode
DescriptionItem.children?: React.ReactNode
DescriptionItem.copy?: string | undefined
DescriptionItem.hint?: React.ReactNode
DescriptionItem.wide?: boolean | undefined
DescriptionItem.*: react
type DescriptionItemData = {}
DescriptionItemData.term: React.ReactNode
DescriptionItemData.value?: React.ReactNode
DescriptionItemData.copy?: string | undefined
DescriptionItemData.hint?: React.ReactNode
DescriptionItemData.wide?: boolean | undefined
type DescriptionLayout = 'grid' | 'stacked' | 'inline'
function DescriptionList
DescriptionList.items?: DescriptionItemData[] | undefined
DescriptionList.layout?: DescriptionLayout | undefined
DescriptionList.columns?: 2 | 4 | 3 | undefined
DescriptionList.children?: React.ReactNode
DescriptionList.*: react
```
