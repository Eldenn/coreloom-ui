import type { Meta, StoryObj } from '@storybook/react-vite'

import { FormBuilder } from '@/components/form-builder'

import { demoSpec } from './form-data'

const meta = {
  title: 'Blocks/Forms/Form builder',
  component: FormBuilder,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Makes a form without code: add fields from the palette, drag them into place on the live canvas, set them in the inspector, try the form in Preview and read or paste its JSON. It edits a FormSpec, the JSON that `FormRenderer` draws.',
      },
    },
  },
  args: { defaultValue: demoSpec },
} satisfies Meta<typeof FormBuilder>
export default meta
type Story = StoryObj<typeof meta>

/** A form being edited. Click a field to set it; drag the handle (or Space and the arrows) to move it. */
export const Default: Story = {}

/** Starting from nothing. */
export const Empty: Story = { args: { defaultValue: undefined } }
