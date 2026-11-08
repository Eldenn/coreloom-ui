import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { ImageCrop, type ImageCropValue } from '@/components/ui/image-crop'

// A landscape picture drawn inline, so the story works offline and stays the same.
const landscape = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e7490"/><stop offset="1" stop-color="#a5f3fc"/></linearGradient></defs><rect width="960" height="600" fill="url(#s)"/><circle cx="700" cy="170" r="70" fill="#fde68a"/><path d="M0 460 L220 260 L380 420 L560 220 L960 520 L960 600 L0 600 Z" fill="#155e75"/><path d="M0 520 L300 380 L520 500 L760 360 L960 480 L960 600 L0 600 Z" fill="#164e63"/></svg>',
)}`

const meta = {
  title: 'Components/Forms/Image crop',
  component: ImageCrop,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Frame part of an image before upload. The consumer provides `src`, and optionally `aspect` (width ÷ height), `round` and `value` / `onValueChange` (the centre and zoom). `cropImage(file, value, { aspect })` draws the framed part into a new File; `ImageCropDialog` asks for it in a dialog, and ImageInput does it all with `crop`.',
      },
    },
  },
  args: { src: landscape },
} satisfies Meta<typeof ImageCrop>
export default meta
type Story = StoryObj<typeof meta>

/** A square frame: drag the picture, or focus it and use the arrow keys; + and − zoom. */
export const Square: Story = {
  render: function Render(args) {
    const [value, setValue] = React.useState<ImageCropValue>({ x: 0.6, y: 0.4, zoom: 1.4 })
    return (
      <div className="flex max-w-sm flex-col gap-2">
        <ImageCrop {...args} value={value} onValueChange={setValue} />
        <p className="m-0 font-mono text-[12px] text-muted-foreground">
          x {value.x.toFixed(2)} · y {value.y.toFixed(2)} · zoom {value.zoom.toFixed(2)}
        </p>
      </div>
    )
  },
}

/** A round frame for an avatar. */
export const Round: Story = {
  args: { round: true, defaultValue: { x: 0.73, y: 0.3, zoom: 2.2 } },
  render: (args) => (
    <div className="max-w-sm">
      <ImageCrop {...args} />
    </div>
  ),
}

/** A 16:9 cover. */
export const Wide: Story = {
  args: { aspect: 16 / 9 },
  render: (args) => (
    <div className="max-w-lg">
      <ImageCrop {...args} />
    </div>
  ),
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: (args) => (
    <div className="max-w-sm">
      <ImageCrop {...args} round />
    </div>
  ),
}
