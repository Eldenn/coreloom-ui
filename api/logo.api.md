# @coreloom/logo

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/logo.tsx

```ts
function assembleOffset(i: number, count: number) => { x: number; y: number; r: number; }
function Logo
Logo.label?: string | undefined
Logo.href?: string | undefined
Logo.src?: string | undefined
Logo.srcLight?: string | undefined
Logo.animation?: LogoAnimation | undefined
Logo.trigger?: LogoTrigger | undefined
Logo.parts?: 'auto' | 'groups' | 'shapes' | undefined
Logo.duration?: number | undefined
Logo.tint?: boolean | undefined
Logo.children?: React.ReactNode
Logo.*: react
type LogoAnimation = 'none' | 'fade' | 'stagger' | 'draw' | 'assemble' | 'wipe' | 'shine' | 'pulse'
function logoParts(svg: SVGSVGElement, parts?: 'auto' | 'groups' | 'shapes') => Element[]
type LogoTrigger = 'mount' | 'in-view' | 'hover'
```
