import type { Meta, StoryObj } from '@storybook/react-vite'

import { FileCard, FileCardList } from '@/components/ui/file-card'

const meta = {
  title: 'Components/Data display/File card',
  component: FileCard,
  tags: ['autodocs'],
  args: { name: 'Q3 report.pdf', size: 482113 },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'An attached file. The consumer provides the `name`, and optionally `size` (bytes), `type` (MIME), `preview` (an image URL), `href`, `progress` (0–100 while uploading), `error`, `onRemove`, `onRetry` and an `action`. `FileCardList` lays cards out as a `list` or a `grid`; `fileKind` is exported.',
      },
    },
  },
} satisfies Meta<typeof FileCard>
export default meta
type Story = StoryObj<typeof meta>

const swatch = (c: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4"><rect width="4" height="4" fill="${c}"/><circle cx="2.6" cy="1.6" r=".7" fill="#fff" fill-opacity=".7"/></svg>`,
  )
const noop = () => undefined

export const Default: Story = {
  render: () => (
    <FileCardList className="max-w-md">
      <FileCard
        name="Q3 report — board version final.pdf"
        size={482113}
        href="#q3"
        onRemove={noop}
      />
      <FileCard
        name="storefront.png"
        size={1_840_000}
        type="image/png"
        preview={swatch('#3987e5')}
        onRemove={noop}
      />
      <FileCard name="customers-2026.csv" size={92_400} progress={64} onRemove={noop} />
      <FileCard
        name="brand assets.zip"
        size={248_000_000}
        error="Too large: 100 MB at most."
        onRetry={noop}
        onRemove={noop}
      />
    </FileCardList>
  ),
}

export const Grid: Story = {
  render: () => (
    <FileCardList layout="grid" className="max-w-3xl">
      <FileCard name="Kickoff deck.pptx" size={6_200_000} />
      <FileCard name="Contract.docx" size={84_000} />
      <FileCard name="api.ts" size={12_300} />
      <FileCard name="Interview.m4a" size={18_400_000} />
      <FileCard name="Demo.mp4" size={128_000_000} />
      <FileCard name="README" size={2_100} />
    </FileCardList>
  ),
}
