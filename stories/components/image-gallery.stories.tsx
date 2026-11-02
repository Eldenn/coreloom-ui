import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { type GalleryImage, ImageGallery, ImageLightbox } from '@/components/ui/image-gallery'

// Sample pictures drawn inline (the stories load nothing from the network).
const picture = (sky: string, hill: string, sun: string, w = 800, h = 600) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${String(w)}" height="${String(h)}" viewBox="0 0 800 600"><rect width="800" height="600" fill="${sky}"/><circle cx="600" cy="170" r="70" fill="${sun}"/><path d="M0 420 Q200 300 400 400 T800 380 V600 H0Z" fill="${hill}" opacity=".85"/><path d="M0 500 Q250 420 520 500 T800 470 V600 H0Z" fill="${hill}"/></svg>`,
  )}`

const images: GalleryImage[] = [
  {
    src: picture('#1d3b53', '#0fa89f', '#f5c451'),
    alt: 'Living room, morning light',
    caption: 'Living room · 32 m²',
  },
  {
    src: picture('#3b2b4f', '#9085e9', '#ff9f80'),
    alt: 'Kitchen',
    caption: 'Kitchen, renovated in 2024',
  },
  { src: picture('#21313d', '#3987e5', '#e8eef5'), alt: 'Bedroom', caption: 'Bedroom · 14 m²' },
  {
    src: picture('#3d2a21', '#d95926', '#f5c451'),
    alt: 'Balcony at sunset',
    caption: 'South-facing balcony',
  },
  { src: picture('#1f2b23', '#3dd68c', '#f0f0f0'), alt: 'Garden', caption: 'Shared garden' },
  {
    src: picture('#2f2433', '#d55181', '#f5c451'),
    alt: 'Street view',
    caption: 'Rue des Martyrs, Paris 9e',
  },
]

const meta = {
  title: 'Components/Data display/Image gallery',
  component: ImageGallery,
  tags: ['autodocs'],
  args: { images },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Thumbnails that open a full-screen viewer. The consumer provides `images` (`{ src, alt, thumbnail?, caption? }`), and optionally `columns` and `aspect`. `ImageLightbox` is the viewer alone (`images`, `index`, `open` and their handlers).',
      },
    },
  },
} satisfies Meta<typeof ImageGallery>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ImageGallery className="max-w-2xl" images={images} aria-label="Apartment photos" />
  ),
}

export const Viewer: Story = {
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 520 } } },
  render: () => {
    const [index, setIndex] = React.useState(1)
    const [open, setOpen] = React.useState(true)
    return (
      <>
        <p className="m-0 p-6 text-[14px] text-muted-foreground">The viewer opens over the page.</p>
        <ImageLightbox
          images={images}
          index={index}
          onIndexChange={setIndex}
          open={open}
          onOpenChange={setOpen}
        />
      </>
    )
  },
}
