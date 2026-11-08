# @coreloom/reveal

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/reveal.tsx

```ts
type InViewOptions = {}
InViewOptions.once?: boolean | undefined
InViewOptions.threshold?: number | undefined
InViewOptions.rootMargin?: string | undefined
function Reveal
Reveal.effect?: RevealEffect | undefined
Reveal.delay?: number | undefined
Reveal.once?: boolean | undefined
Reveal.threshold?: number | undefined
Reveal.rootMargin?: string | undefined
Reveal.*: react
type RevealEffect = 'scale' | 'circle' | 'left' | 'right' | 'fade' | 'up' | 'down' | 'blur' | 'wipe-up' | 'wipe-down' | 'wipe-left' | 'wipe-right'
function Stagger
Stagger.effect?: RevealEffect | undefined
Stagger.step?: number | undefined
Stagger.delay?: number | undefined
Stagger.itemClassName?: string | undefined
Stagger.once?: boolean | undefined
Stagger.threshold?: number | undefined
Stagger.rootMargin?: string | undefined
Stagger.*: react
function useInView<T extends Element>(ref: React.RefObject<T | null>, { once, threshold, rootMargin }?: InViewOptions) => boolean
function useReducedMotion() => boolean
```
