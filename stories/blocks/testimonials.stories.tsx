import type { Meta, StoryObj } from '@storybook/react-vite'

import { TestimonialCard, TestimonialGrid, TestimonialWall } from '@/components/testimonials'

import { testimonials } from './site-data'

const meta = {
  title: 'Blocks/Testimonials',
  component: TestimonialGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'What customers say, as cards. `TestimonialGrid` lines them up in even rows (a `featured` one spans two columns); `TestimonialWall` stacks many in columns of different heights and shows the rest behind "Show more". Each `Testimonial` has a quote, an author, and optionally a byline, an avatar, a logo, a rating out of 5 and its source. The consumer provides the content; nothing is fetched.',
      },
    },
  },
  args: { testimonials: testimonials.slice(0, 5), columns: 3 },
  argTypes: { columns: { control: 'inline-radio', options: [2, 3] } },
} satisfies Meta<typeof TestimonialGrid>
export default meta
type Story = StoryObj<typeof meta>

/** Five quotes; the first is featured and spans two columns. */
export const Grid: Story = {}

/** Two columns, no featured quote. */
export const TwoColumns: Story = {
  args: {
    columns: 2,
    testimonials: testimonials.slice(1, 5),
  },
}

/** Eleven quotes in columns of different heights; two wait behind "Show more". */
export const Wall: Story = {
  render: () => (
    <TestimonialWall
      testimonials={testimonials.map((t) => ({ ...t, featured: false }))}
      initialCount={9}
    />
  ),
}

/** One card, for a sidebar or between two sections. */
export const Card: Story = {
  render: () => (
    <div className="max-w-md">
      <TestimonialCard testimonial={testimonials[0]} />
    </div>
  ),
}

export const French: Story = { globals: { locale: 'fr' } }

export const Phone: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } }
