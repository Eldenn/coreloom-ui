import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { ImageInput, type ImageValue } from '@/components/ui/image-input'

// A saved logo, inline so the story works offline.
const savedLogo = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#0e7490"/><circle cx="40" cy="40" r="18" fill="none" stroke="#fff" stroke-width="6"/></svg>',
)}`

const meta = {
  title: 'Components/Forms/Image input',
  component: ImageInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One image with its preview. The consumer provides `value` + `onValueChange` (a File, a saved URL string, or null), a label (`id` for a FieldLabel), and optionally `shape` (circle, square, wide), `accept`, `maxSize` and `fallback`. It only collects the File: upload it yourself.',
      },
    },
  },
} satisfies Meta<typeof ImageInput>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [photo, setPhoto] = React.useState<ImageValue>(null)
    return (
      <Field className="max-w-md">
        <FieldLabel htmlFor="img-avatar">Profile photo</FieldLabel>
        <ImageInput
          id="img-avatar"
          value={photo}
          onValueChange={setPhoto}
          maxSize={2 * 1024 * 1024}
          fallback={<span className="text-[20px] font-medium">AL</span>}
        />
        <FieldDescription>
          {photo instanceof File ? `Chosen: ${photo.name}` : 'No photo yet'}
        </FieldDescription>
      </Field>
    )
  },
}

export const Shapes: Story = {
  render: () => (
    <FieldGroup className="max-w-lg">
      <Field>
        <FieldLabel htmlFor="img-logo">Workspace logo</FieldLabel>
        <ImageInput id="img-logo" shape="square" defaultValue={savedLogo} />
      </Field>
      <Field>
        <FieldLabel htmlFor="img-cover">Cover</FieldLabel>
        <ImageInput id="img-cover" shape="wide" maxSize={5 * 1024 * 1024} />
      </Field>
    </FieldGroup>
  ),
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <Field className="max-w-md">
      <FieldLabel htmlFor="img-fr">Photo de profil</FieldLabel>
      <ImageInput id="img-fr" maxSize={1024 * 1024} />
    </Field>
  ),
}
