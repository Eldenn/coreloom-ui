# @coreloom/site-footer

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/site-footer.tsx

```ts
type FooterColumn = {}
FooterColumn.title: string
FooterColumn.links?: FooterLink[] | undefined
FooterColumn.content?: React.ReactNode
type FooterLink = {}
FooterLink.label: string
FooterLink.href: string
type FooterSocialLink = {}
FooterSocialLink.icon: React.ReactNode
FooterSocialLink.label: string
FooterSocialLink.href: string
function SiteFooter
SiteFooter.note: React.ReactNode
SiteFooter.links?: FooterLink[] | undefined
SiteFooter.brand?: React.ReactNode
SiteFooter.columns?: FooterColumn[] | undefined
SiteFooter.social?: FooterSocialLink[] | undefined
SiteFooter.maxWidth?: string | undefined
SiteFooter.className?: string | undefined
```
