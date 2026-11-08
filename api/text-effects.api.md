# @coreloom/text-effects

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/text-effects.tsx

```ts
function GradientText
GradientText.animate?: boolean | undefined
GradientText.duration?: number | undefined
GradientText.*: react
function scrambleFrame(text: string, progress: number, tick: number) => string
function ScrambleText
ScrambleText.text: string
ScrambleText.duration?: number | undefined
ScrambleText.trigger?: 'mount' | 'in-view' | undefined
ScrambleText.*: react
function ShimmerText
ShimmerText.duration?: number | undefined
ShimmerText.*: react
function Typewriter
Typewriter.text: string | string[]
Typewriter.speed?: number | undefined
Typewriter.eraseSpeed?: number | undefined
Typewriter.hold?: number | undefined
Typewriter.loop?: boolean | undefined
Typewriter.caret?: boolean | undefined
Typewriter.frozen?: boolean | undefined
Typewriter.onDone?: (() => void) | undefined
Typewriter.*: react
function WordReveal
WordReveal.text: string
WordReveal.as?: 'div' | 'h1' | 'h2' | 'h3' | 'p' | 'span' | undefined
WordReveal.effect?: 'fade' | 'up' | 'blur' | undefined
WordReveal.step?: number | undefined
WordReveal.delay?: number | undefined
WordReveal.trigger?: 'mount' | 'in-view' | undefined
WordReveal.*: react
```
