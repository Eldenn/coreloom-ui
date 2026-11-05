import type { Meta, StoryObj } from '@storybook/react-vite'

import { DiagramViewer, type DiagramViewerItem } from '@/components/diagram-viewer'
import { Alert, AlertDescription } from '@/components/ui/alert'

import {
  activityText,
  c4ContainerText,
  c4ContextText,
  classText,
  deploymentText,
  erText,
  fromMermaid,
  fromPlantUml,
  sequenceText,
  stateText,
  usecaseText,
} from '../components/uml-data'

// The screenshots freeze the clock at this moment.
const NOW = new Date('2026-10-14T10:00:00+02:00')

const views: DiagramViewerItem[] = [
  { id: 'context', title: 'System context', diagram: fromMermaid(c4ContextText) },
  { id: 'classes', title: 'Orders', diagram: fromMermaid(classText) },
  { id: 'checkout', title: 'Checkout', diagram: fromMermaid(sequenceText) },
  { id: 'states', title: 'Order states', diagram: fromMermaid(stateText) },
]

const manyViews: DiagramViewerItem[] = [
  ...views,
  { id: 'containers', title: 'Containers', diagram: fromMermaid(c4ContainerText) },
  { id: 'data', title: 'Data model', diagram: fromMermaid(erText) },
  { id: 'returns', title: 'Returns flow', diagram: fromMermaid(activityText) },
  { id: 'use-cases', title: 'Use cases', diagram: fromPlantUml(usecaseText) },
  { id: 'deployment', title: 'Deployment', diagram: fromPlantUml(deploymentText) },
]

const meta = {
  title: 'Blocks/Diagrams/Diagram viewer',
  component: DiagramViewer,
  tags: ['autodocs'],
  args: {
    title: 'Checkout architecture',
    description: 'How an order goes from the cart to the warehouse, as of the October release.',
    updatedAt: new Date(NOW.getTime() - 2 * 3_600_000),
    diagrams: views,
    fileName: 'Checkout architecture',
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A document of several diagrams, read only: what a shared link opens. The consumer passes `title`, `description`, `updatedAt` and `diagrams` (`{ id, title, diagram, layout? }`), and optionally controls the view with `activeId` / `onActiveChange`, adds a `banner` and names downloads with `fileName`. Past six views the tabs become a side list; on a phone, a menu. Arrows or Page Up / Page Down change the view.',
      },
    },
  },
} satisfies Meta<typeof DiagramViewer>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Past six views, the list moves to the side. */
export const ManyViews: Story = {
  args: { diagrams: manyViews, defaultActiveId: 'data' },
}

export const WithBanner: Story = {
  args: {
    banner: (
      <Alert>
        <AlertDescription>Shared by Matthieu Chane · read only</AlertDescription>
      </Alert>
    ),
  },
}

export const SingleView: Story = {
  args: { diagrams: views.slice(1, 2), description: undefined },
}

export const French: Story = {
  globals: { locale: 'fr' },
  args: {
    title: 'Architecture du paiement',
    description: 'Le trajet d’une commande, du panier à l’entrepôt.',
  },
}

export const Phone: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}
