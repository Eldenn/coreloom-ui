import type { Meta, StoryObj } from '@storybook/react-vite'

import { type CitationSource, InlineCitation } from '@/components/ui/inline-citation'

const guide: CitationSource = {
  type: 'source-url',
  sourceId: 's1',
  url: 'https://coreloom.dev/docs/deployments',
  title: 'Deployments guide',
}
const changelog: CitationSource = {
  type: 'source-url',
  sourceId: 's2',
  url: 'https://www.coreloom.dev/changelog#v0-8',
  title: 'Changelog: Workspace.handle',
}
const postmortem: CitationSource = {
  type: 'source-document',
  sourceId: 'd1',
  title: 'Incident 42 — postmortem',
  filename: 'incident-42.pdf',
  mediaType: 'application/pdf',
}
const untitled: CitationSource = {
  type: 'source-url',
  sourceId: 's3',
  url: 'https://status.coreloom.dev/incidents/42',
}

const meta = {
  title: 'Components/AI/Inline citation',
  component: InlineCitation,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The numbered pill a model leaves in its text ("[1]"), pointing at one of the message\'s sources. Hover, focus or tap it: a card shows the title, the site or file, and a link for web pages. Takes an AI SDK `source-url` or `source-document` part. `Markdown` places them for you when given `sources`.',
      },
    },
  },
  args: { index: 1, source: guide },
  argTypes: {
    index: { control: { type: 'number', min: 1 } },
    source: { control: 'object' },
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl pt-36 text-[14.5px] leading-[1.65] text-fg-secondary">
        {Story()}
      </div>
    ),
  ],
} satisfies Meta<typeof InlineCitation>
export default meta
type Story = StoryObj<typeof meta>

/** One citation inside a sentence: a web page. */
export const Default: Story = {
  render: (args) => (
    <p className="m-0">
      Rolling back replaces what's live with the last green build
      <InlineCitation {...args} />, and it takes about a minute.
    </p>
  ),
}

/** Two sources side by side, as models write them: "[1][2]". */
export const Several: Story = {
  render: () => (
    <p className="m-0">
      The property{' '}
      <code className="rounded-[5px] bg-secondary px-1.5 py-0.5 font-mono text-[0.88em] text-foreground">
        slug
      </code>{' '}
      was renamed to
      <code className="rounded-[5px] bg-secondary px-1.5 py-0.5 font-mono text-[0.88em] text-foreground">
        handle
      </code>{' '}
      in v0.8
      <InlineCitation index={1} source={guide} />
      <InlineCitation index={2} source={changelog} />. The status page tracked the outage
      <InlineCitation index={3} source={untitled} />.
    </p>
  ),
}

/** An uploaded document: its file name instead of a site, and no link. */
export const Document: Story = {
  args: { index: 1, source: postmortem },
  render: (args) => (
    <p className="m-0">
      The error rate jumps at 10:42, the minute the deployment went live
      <InlineCitation {...args} />.
    </p>
  ),
}

/** A long title wraps inside the card. */
export const LongTitle: Story = {
  args: {
    source: {
      type: 'source-url',
      sourceId: 's4',
      url: 'https://coreloom.dev/docs/guides/deployments/rollbacks-and-promotions-between-environments',
      title:
        'Rolling back and promoting deployments between preview, staging and production environments without downtime',
    },
  },
  render: Default.render,
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <p className="m-0">
      Un retour arrière remplace la version en ligne par le dernier déploiement réussi
      <InlineCitation index={1} source={guide} />
      <InlineCitation index={2} source={postmortem} />.
    </p>
  ),
}

/** A source whose address isn't http(s) or mailto (here `javascript:`) shows its title, but no link. */
export const UnsafeAddress: Story = {
  args: {
    source: {
      type: 'source-url',
      sourceId: 's5',
      url: 'javascript:alert(1)',
      title: 'Suspicious source',
    },
  },
  render: Default.render,
}
