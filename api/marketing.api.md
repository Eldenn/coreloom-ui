# @coreloom/marketing

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/hero.tsx

```ts
function Hero
Hero.announcement?: React.ReactNode
Hero.eyebrow?: React.ReactNode
Hero.title: React.ReactNode
Hero.highlight?: React.ReactNode
Hero.highlightStyle?: 'gradient' | 'solid' | undefined
Hero.description?: React.ReactNode
Hero.actions?: React.ReactNode
Hero.command?: string | undefined
Hero.media?: React.ReactNode
Hero.layout?: HeroLayout | undefined
Hero.mediaPosition?: 'end' | 'start' | undefined
Hero.glow?: boolean | undefined
Hero.children?: React.ReactNode
Hero.*: react
type HeroLayout = 'split' | 'centered' | 'cover'
```

## src/components/feature-grid.tsx

```ts
type Feature = {}
Feature.icon: IconLike
Feature.title: string
Feature.description: React.ReactNode
Feature.meta?: string | undefined
function FeatureGrid
FeatureGrid.eyebrow?: string | undefined
FeatureGrid.title: React.ReactNode
FeatureGrid.description?: React.ReactNode
FeatureGrid.features: Feature[]
FeatureGrid.featured?: number | undefined
FeatureGrid.className?: string | undefined
```

## src/components/faq.tsx

```ts
function Faq
Faq.title?: React.ReactNode
Faq.items: { question: string; answer: React.ReactNode; }[]
Faq.className?: string | undefined
```

## src/components/cta-section.tsx

```ts
function CtaSection
CtaSection.title: React.ReactNode
CtaSection.description?: React.ReactNode
CtaSection.actions?: React.ReactNode
CtaSection.className?: string | undefined
```
