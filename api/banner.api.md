# @coreloom/banner

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/banner.tsx

```ts
function Banner
Banner.tone?: BannerTone | undefined
Banner.icon?: React.ReactNode
Banner.title?: React.ReactNode
Banner.action?: React.ReactNode
Banner.onDismiss?: (() => void) | undefined
Banner.floating?: boolean | undefined
Banner.children?: React.ReactNode
Banner.*: react
type BannerTone = 'primary' | 'neutral' | 'success' | 'info' | 'warning' | 'danger'
```
