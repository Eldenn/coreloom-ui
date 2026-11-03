import type { Meta, StoryObj } from '@storybook/react-vite'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const PRESETS = [
  { surface: undefined, name: 'Graphite', note: 'The default: no attribute.' },
  { surface: 'mineral', name: 'Mineral blue', note: 'data-surface="mineral"' },
  { surface: 'bone', name: 'Bone', note: 'data-surface="bone"' },
] as const

/** One preset's surfaces, text and a few controls on them. */
function Swatch({ surface, name, note }: (typeof PRESETS)[number]) {
  const inputId = `surface-email-${surface ?? 'default'}`
  return (
    <div
      data-surface={surface}
      className="flex flex-col gap-4 rounded-xl border border-border bg-background p-5"
    >
      <div>
        <p className="m-0 font-display text-[18px] font-semibold text-foreground">{name}</p>
        <p className="m-0 font-mono text-[12px] text-muted-foreground">{note}</p>
      </div>
      <div className="grid grid-cols-4 gap-1.5" aria-hidden>
        {['bg-base', 'bg-background', 'bg-card', 'bg-inset'].map((c) => (
          <div key={c} className={`h-10 rounded-md border border-border-subtle ${c}`} />
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>First visit</CardTitle>
          <CardDescription>An hour, history and treatment.</CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={inputId}>Email</Label>
          <Input id={inputId} placeholder="you@example.com" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Book</Button>
          <Button size="sm" variant="secondary">
            Call
          </Button>
          <Badge variant="success">Open</Badge>
        </div>
      </Card>
      <p className="m-0 text-[13px] text-fg-secondary">
        Secondary text, <span className="text-muted-foreground">muted text</span> and{' '}
        <span className="text-primary-text">accent text</span>.
      </p>
    </div>
  )
}

const meta = {
  title: 'Foundations/Surfaces',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`surfaces.css` replaces the page’s backgrounds, borders and text greys in both themes: `data-surface="mineral"` or `"bone"` on `<html>`, or on a band of the page (with `bg-background`). Every pairing is checked AA with every accent preset by `build/gen-surfaces.py`.',
      },
    },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Presets: Story = {
  render: () => (
    <div className="grid gap-5 md:grid-cols-3">
      {PRESETS.map((p) => (
        <Swatch key={p.name} {...p} />
      ))}
    </div>
  ),
}

/** A light bone page with a dark mineral band: data-theme and data-surface on the same element. */
export const Bands: Story = {
  render: () => (
    <div
      data-theme="light"
      data-surface="bone"
      className="overflow-hidden rounded-xl bg-background"
    >
      <div className="p-8">
        <p className="m-0 font-display text-[22px] font-semibold text-foreground">Bone, light</p>
        <p className="m-0 mt-1 text-[14px] text-fg-secondary">The page.</p>
      </div>
      <div data-theme="dark" data-surface="mineral" className="bg-background p-8">
        <p className="m-0 font-display text-[22px] font-semibold text-foreground">
          Mineral blue, dark
        </p>
        <p className="m-0 mt-1 text-[14px] text-fg-secondary">A band inside it.</p>
        <Button size="sm" className="mt-4">
          Book a visit
        </Button>
      </div>
    </div>
  ),
}
