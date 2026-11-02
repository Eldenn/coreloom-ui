import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnsiOutput } from '@/components/ui/ansi-output'

import { ansi, buildLog } from '../blocks/terminal-data'

const names = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']
const palette = [
  names.map((name, i) => `\x1b[${String(30 + i)}m${name.padEnd(8)}\x1b[0m`).join(' '),
  names.map((name, i) => `\x1b[${String(90 + i)}m${name.padEnd(8)}\x1b[0m`).join(' '),
  names
    .slice(1, 7)
    .map((name, i) => `\x1b[${String(41 + i)}m ${name} \x1b[0m`)
    .join(' '),
  `${ansi.bold}bold${ansi.reset} ${ansi.dim}dim${ansi.reset} \x1b[3mitalic\x1b[0m \x1b[4munderline\x1b[0m \x1b[9mstrike\x1b[0m \x1b[7m inverse \x1b[0m`,
  `\x1b]8;;https://coreloom.dev\x07a hyperlink (OSC 8)\x1b]8;;\x07 and a plain URL: https://vitest.dev/guide/`,
].join('\n')

const meta = {
  title: 'Components/Developer/ANSI output',
  component: AnsiOutput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Program output with its ANSI colours and styles, links and progress-bar rewrites. The consumer passes `text` (it can grow while it streams; the view follows the end), and optionally `wrap`, `follow`, `links` and `maxHeight`. `parseAnsi`, `writeAnsi` (streaming) and `stripAnsi` are exported.',
      },
    },
  },
  args: { text: buildLog, className: 'max-w-3xl' },
} satisfies Meta<typeof AnsiOutput>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The 16 base colours follow the theme's tokens; backgrounds are tints. */
export const Palette: Story = {
  args: { text: palette },
}

/** Carriage returns and erase-line rewrite the line, so a progress bar ends as its last state. */
export const Progress: Story = {
  args: {
    text: `Downloading… 10%\rDownloading… 55%\rDownloading… 100%\n\x1b[33m⠋\x1b[0m Resolving\r\x1b[2K${ansi.green}✓${ansi.reset} Resolved 412 packages\n`,
  },
}

/** A long output scrolls inside `maxHeight` and starts at the end. */
export const Scrolling: Story = {
  args: {
    text: Array.from(
      { length: 60 },
      (_, i) =>
        `${ansi.dim}[${String(i + 1).padStart(2, '0')}]${ansi.reset} step ${String(i + 1)} ${ansi.green}ok${ansi.reset}`,
    ).join('\n'),
    maxHeight: '220px',
  },
}
