import type { Meta, StoryObj } from '@storybook/react-vite'
import { CopyIcon, ExternalLinkIcon, Share2Icon, Trash2Icon } from 'lucide-react'

import { DiagramCard, type DiagramCardAction } from '@/components/diagram-card'

import {
  classText,
  deploymentText,
  fromMermaid,
  fromPlantUml,
  sequenceText,
} from '../components/uml-data'

// The screenshots freeze the clock at this moment.
const NOW = new Date('2026-10-14T10:00:00+02:00')
const ago = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000)

const actions: DiagramCardAction[] = [
  { label: 'Open', icon: <ExternalLinkIcon aria-hidden />, onSelect: () => undefined },
  { label: 'Duplicate', icon: <CopyIcon aria-hidden />, onSelect: () => undefined },
  { label: 'Share', icon: <Share2Icon aria-hidden />, onSelect: () => undefined },
  {
    label: 'Delete',
    icon: <Trash2Icon aria-hidden />,
    destructive: true,
    onSelect: () => undefined,
  },
]

// A small picture standing in for a thumbnail the app made on its server.
const thumbnail = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100"><rect x="20" y="20" width="50" height="28" rx="3" fill="none" stroke="#8a8f98"/><rect x="92" y="54" width="50" height="28" rx="3" fill="none" stroke="#8a8f98"/><path d="M70 34h11v34h11" fill="none" stroke="#8a8f98"/></svg>',
)}`

const meta = {
  title: 'Blocks/Diagrams/Diagram card',
  component: DiagramCard,
  tags: ['autodocs'],
  args: {
    title: 'Checkout',
    href: '#checkout',
    diagram: fromMermaid(classText),
    visibility: 'public',
    updatedAt: ago(5),
    diagramCount: 4,
    actions,
  },
  argTypes: {
    visibility: { control: 'inline-radio', options: ['private', 'public', 'protected'] },
    diagramCount: { control: 'number' },
  },
  decorators: [
    // One card at the width of a gallery column; galleries take the whole width.
    (Story, { parameters }) =>
      parameters.gallery === true ? (
        <Story />
      ) : (
        <div className="max-w-xs">
          <Story />
        </div>
      ),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A gallery card for a diagram document. The app passes `title`, `href`, `visibility`, `updatedAt`, a `diagram` to draw small (or an `image` URL it already made), `diagramCount` and the `actions` of the … menu. The whole card is the link; the menu stays its own button.',
      },
    },
  },
} satisfies Meta<typeof DiagramCard>
export default meta
type Story = StoryObj<typeof meta>

/** A public document drawn from its first diagram. */
export const Default: Story = {}

/** Protected by a code, with a thumbnail image from the app. */
export const WithImage: Story = {
  args: { diagram: undefined, image: thumbnail, visibility: 'protected', diagramCount: 2 },
}

/** Nothing drawn yet: a neutral drawing stands in. */
export const Empty: Story = {
  args: { diagram: undefined, title: 'New architecture', visibility: 'private', diagramCount: 1 },
}

/** No menu when there are no actions. */
export const NoActions: Story = { args: { actions: [] } }

/** A long title is cut with an ellipsis; the link keeps the whole title as its name. */
export const LongTitle: Story = {
  args: {
    title: 'Payment platform — services, queues and the reconciliation jobs that run at night',
  },
}

/** A gallery: cards in a responsive grid. */
export const Gallery: Story = {
  parameters: { gallery: true },
  render: () => (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li>
        <DiagramCard
          title="Checkout"
          href="#checkout"
          diagram={fromMermaid(sequenceText)}
          visibility="public"
          updatedAt={ago(5)}
          diagramCount={4}
          actions={actions}
        />
      </li>
      <li>
        <DiagramCard
          title="Hosting"
          href="#hosting"
          diagram={fromPlantUml(deploymentText)}
          visibility="protected"
          updatedAt={ago(60 * 26)}
          diagramCount={2}
          actions={actions}
        />
      </li>
      <li>
        <DiagramCard
          title="New architecture"
          href="#new"
          visibility="private"
          updatedAt={ago(1)}
          diagramCount={1}
          actions={actions}
        />
      </li>
    </ul>
  ),
}

export const French: Story = {
  args: { visibility: 'protected', diagramCount: 1 },
  globals: { locale: 'fr' },
}

/** At phone width. */
export const Phone: Story = {
  render: Gallery.render,
  parameters: { gallery: true, viewport: { defaultViewport: 'mobile1' } },
}
