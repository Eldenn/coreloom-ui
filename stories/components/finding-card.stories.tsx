import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import {
  FindingCard,
  type FindingCardProps,
  type FindingResolution,
} from '@/components/ui/finding-card'
import { type UmlAnnotation, UmlDiagram } from '@/components/ui/uml-diagram'

import { classText, fromMermaid } from './uml-data'

const REPO = 'https://github.com/acme/shop/blob/main'

/** The findings of a review that compared the Orders diagram with the code. */
const FINDINGS: (FindingCardProps & { id: string; element: string })[] = [
  {
    id: 'f1',
    element: 'Order',
    title: 'Order',
    status: 'warning',
    statusLabel: 'Differs from the code',
    severity: 'medium',
    comment:
      'The diagram shows cancel(), but the code cancels an order through OrderService.cancel. The class has no such method.',
    evidence: [
      { path: 'app/orders/order.ts', line: 12, href: `${REPO}/app/orders/order.ts#L12` },
      {
        path: 'app/orders/order_service.ts',
        line: 48,
        href: `${REPO}/app/orders/order_service.ts#L48`,
      },
    ],
  },
  {
    id: 'f2',
    element: 'OrderRepository',
    title: 'OrderRepository',
    status: 'error',
    statusLabel: 'Missing from the code',
    severity: 'high',
    comment: 'No interface or class by this name. Orders are read and saved through Lucid models.',
    evidence: [{ path: 'app/orders/models/order.ts', line: 1 }],
  },
  {
    id: 'f3',
    element: 'Payment',
    title: 'Payment',
    status: 'ok',
    severity: 'low',
    comment: 'Matches app/payments/payment.ts, with both subclasses.',
    evidence: [{ path: 'app/payments/payment.ts', line: 5 }],
  },
]

const meta = {
  title: 'Components/Diagrams/Finding card',
  component: FindingCard,
  tags: ['autodocs'],
  args: {
    ...FINDINGS[0],
    onSelect: () => {
      // The app selects the element in the diagram.
    },
    disabled: false,
    selected: false,
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['ok', 'warning', 'error', 'unknown'] },
    severity: { control: 'inline-radio', options: ['low', 'medium', 'high'] },
    resolution: { control: 'inline-radio', options: ['open', 'done', 'dismissed'] },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One finding of a review, such as a diagram checked against the code: what it is about (`title`), its `status` (`ok`, `warning`, `error`, `unknown`, with `statusLabel` to name it), `severity`, a plain-text `comment`, and `evidence` as `path` and `line`, with an `href` to open the place (http and https only). People mark it done or ignore it, then reopen it: the app saves `onResolutionChange` and hands `resolution` back. `onSelect` adds “Show in diagram”; `selected` outlines the finding of the element selected there. Pair it with `UmlDiagram` `annotations`.',
      },
    },
  },
  decorators: [
    // One card reads best at the width of a side panel; `wide` stories lay out their own page.
    (Story, { parameters }) =>
      parameters.wide ? (
        <Story />
      ) : (
        <div className="max-w-xl">
          <Story />
        </div>
      ),
  ],
} satisfies Meta<typeof FindingCard>
export default meta
type Story = StoryObj<typeof meta>

/** An open finding with links to the code. */
export const Default: Story = {}

/** Every status, from no issue to not checked. */
export const Statuses: Story = {
  render: function Render() {
    return (
      <div className="grid gap-3">
        <FindingCard {...FINDINGS[2]} />
        <FindingCard {...FINDINGS[0]} />
        <FindingCard {...FINDINGS[1]} />
        <FindingCard
          title="NotificationQueue"
          status="unknown"
          comment="Nothing in the code map is linked to this element yet."
        />
      </div>
    )
  },
}

/** Marked as done: the title is struck through, and Reopen takes the buttons' place. */
export const Done: Story = { args: { defaultResolution: 'done' } }

/** Ignored. */
export const Dismissed: Story = { args: { ...FINDINGS[1], defaultResolution: 'dismissed' } }

/** The finding of the element selected in the diagram. */
export const Selected: Story = { args: { selected: true } }

/** While the app saves a resolution. */
export const Disabled: Story = { args: { disabled: true } }

/** A long name, a long comment and long paths wrap inside the card. */
export const LongContent: Story = {
  args: {
    title: 'CheckoutPaymentAuthorizationAndCaptureOrchestratorWithRetries',
    comment:
      'The diagram says the orchestrator captures the payment right after authorizing it, but the code waits for the warehouse to confirm the stock first, through a job that runs when the reservation is saved; the diagram should show that wait, or the job should be documented in its own sequence diagram so the two can be compared.',
    evidence: [
      {
        path: 'app/checkout/payments/orchestrators/authorization_and_capture_orchestrator_with_retries.ts',
        line: 214,
      },
      { path: 'app/jobs/confirm_stock_reservation_job.ts', line: 33 },
    ],
  },
}

/** The diagram and its findings, wired like an app: a badge selects its finding, "Show in diagram" the element. */
export const WithDiagram: Story = {
  render: function Render() {
    const [element, setElement] = React.useState<string | null>(null)
    const [resolutions, setResolutions] = React.useState<Record<string, FindingResolution>>({})
    // Resolved findings leave the drawing; open ones show there.
    const annotations: UmlAnnotation[] = FINDINGS.filter(
      (f) => (resolutions[f.id] ?? 'open') === 'open',
    ).map((f) => ({
      element: f.element,
      status: f.status,
      ...(f.statusLabel ? { label: f.statusLabel } : {}),
    }))
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <UmlDiagram
          diagram={fromMermaid(classText)}
          height={520}
          annotations={annotations}
          onAnnotationSelect={setElement}
          selection={{ elements: element ? [element] : [], relations: [] }}
          onSelectionChange={(next) => {
            setElement(next.elements[0] ?? null)
          }}
        />
        <div className="grid content-start gap-3">
          {FINDINGS.map(({ id, element: about, ...finding }) => (
            <FindingCard
              key={id}
              {...finding}
              resolution={resolutions[id] ?? 'open'}
              onResolutionChange={(next) => {
                setResolutions((now) => ({ ...now, [id]: next }))
              }}
              selected={element === about}
              onSelect={() => {
                setElement(about)
              }}
            />
          ))}
        </div>
      </div>
    )
  },
  parameters: { wide: true },
}

export const French: Story = {
  args: {
    title: 'Order',
    status: 'warning',
    statusLabel: 'Diffère du code',
    severity: 'medium',
    comment:
      'Le diagramme montre cancel(), mais le code annule une commande avec OrderService.cancel.',
  },
  globals: { locale: 'fr' },
}

/** Narrow screens: the buttons wrap under the evidence. */
export const Phone: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}
