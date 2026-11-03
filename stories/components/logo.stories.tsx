import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Logo, type LogoAnimation } from '@/components/ui/logo'
import { LogoCloud } from '@/components/ui/logo-cloud'
import { LogoLoader } from '@/components/ui/logo-loader'

import { AtlasLogo, AtlasMark, CoreloomCat } from './logo-assets'

const ANIMATIONS: LogoAnimation[] = [
  'fade',
  'stagger',
  'draw',
  'assemble',
  'wipe',
  'shine',
  'pulse',
]

const meta = {
  title: 'Components/Motion/Logo',
  component: Logo,
  tags: ['autodocs'],
  args: { label: 'Atlas', animation: 'stagger', trigger: 'mount', parts: 'auto', tint: false },
  argTypes: {
    animation: { control: 'inline-radio', options: ['none', ...ANIMATIONS] },
    trigger: { control: 'inline-radio', options: ['mount', 'in-view', 'hover'] },
    parts: { control: 'inline-radio', options: ['auto', 'groups', 'shapes'] },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A logo handled once for the app. The consumer provides an inline SVG as children (or `src` and `srcLight` image files), a `label` for screen readers and optionally `href`, `tint` (paint it in the text colour), `animation` (`fade`, `stagger`, `draw`, `assemble`, `wipe`, `shine`, `pulse`), `trigger` (`mount`, `in-view`, `hover`), `parts` and `duration`. `LogoLoader` shows it as a loading screen; `LogoCloud` lays out other brands’ logos.',
      },
    },
  },
} satisfies Meta<typeof Logo>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Logo {...args} className="h-40 text-[#ebe7e3] light:text-foreground">
      <AtlasLogo />
    </Logo>
  ),
}

/** Every entrance, at rest (the visual tests show the end state). */
export const Animations: Story = {
  render: function Render() {
    // Replay: a new key mounts the logos again.
    const [run, setRun] = React.useState(0)
    return (
      <div className="flex flex-col gap-4">
        <Button
          variant="outline"
          className="self-start"
          onClick={() => {
            setRun(run + 1)
          }}
        >
          Replay
        </Button>
        <div key={run} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {ANIMATIONS.map((animation) => (
            <figure
              key={animation}
              className="m-0 flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4"
            >
              <Logo
                label="Atlas"
                animation={animation === 'pulse' ? 'none' : animation}
                className="h-24 text-foreground"
              >
                <AtlasLogo />
              </Logo>
              <figcaption className="font-mono text-[11px] text-muted-foreground">
                {animation}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    )
  },
}

/** In a header: linked home, replays its entrance on hover and focus. */
export const InAHeader: Story = {
  render: () => (
    <header className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
      <Logo label="Atlas, home" href="#" animation="stagger" trigger="hover" className="h-9">
        <AtlasMark />
      </Logo>
      <nav aria-label="Main" className="flex gap-4 text-[14px] text-fg-secondary">
        <a href="#" className="hover:text-foreground">
          Programs
        </a>
        <a href="#" className="hover:text-foreground">
          Team
        </a>
      </nav>
    </header>
  ),
}

/** A logo that keeps its own colours, and one painted in the text colour. */
export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <Logo label="Coreloom" animation="assemble" className="h-16">
        <CoreloomCat />
      </Logo>
      <Logo label="Coreloom" tint animation="assemble" className="h-16 text-primary-text">
        <CoreloomCat />
      </Logo>
      <Logo label="Atlas" animation="draw" className="h-16 text-fg-secondary">
        <AtlasMark />
      </Logo>
    </div>
  ),
}

/** The app's loading screen: toggle it. */
export const Loader: Story = {
  render: function Render() {
    const [loading, setLoading] = React.useState(true)
    return (
      <div className="flex flex-col gap-3">
        <Button
          variant="outline"
          className="self-start"
          onClick={() => {
            setLoading(!loading)
          }}
        >
          {loading ? 'Finish loading' : 'Load again'}
        </Button>
        <div className="overflow-hidden rounded-xl border border-border" data-frozen>
          <LogoLoader
            loading={loading}
            logo={<AtlasMark />}
            label="Atlas"
            message="Preparing your programs…"
          >
            <p className="m-0 p-6 text-[14px]">Your programs are ready.</p>
          </LogoLoader>
        </div>
      </div>
    )
  },
}

const customers = [
  'Northwind',
  'Acme',
  'Globex',
  'Initech',
  'Umbrella',
  'Hooli',
  'Vandelay',
  'Stark',
].map((name) => ({ name, href: '#' }))

/** Customer logos in a grid (names stand in for logos here). */
export const Cloud: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <p className="m-0 text-center text-[13px] text-muted-foreground">Trusted by teams at</p>
      <LogoCloud
        label="Customers"
        items={[{ name: 'Atlas', logo: <AtlasMark />, href: '#' }, ...customers.slice(0, 7)]}
      />
    </div>
  ),
}

/** The same, scrolling. */
export const CloudMarquee: Story = {
  render: () => (
    <LogoCloud
      label="Customers"
      layout="marquee"
      items={[{ name: 'Atlas', logo: <AtlasMark /> }, ...customers]}
    />
  ),
}
