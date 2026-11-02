import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Terminal, type TerminalSession, useTerminal } from '@/components/ui/terminal'

import { demoProject } from '../blocks/ide-data'
import { ansi, createDemoShell, demoTranscript } from '../blocks/terminal-data'

const shell = createDemoShell(demoProject)

const meta = {
  title: 'Components/Developer/Terminal',
  component: Terminal,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A command line: prompt, history (↑ ↓), Tab completion and ANSI output. It runs nothing itself. The consumer wires `onCommand(command, context)` and returns text, a promise or an async iterable (a stream); `context.signal` aborts on Ctrl+C and `context.read()` asks a question. Or it connects a `session` (a process behind a WebSocket) that prints its own prompt. `useTerminal()` keeps the output when the terminal unmounts.',
      },
    },
  },
  args: { ...shell, welcome: demoTranscript, className: 'h-[380px] max-w-3xl' },
} satisfies Meta<typeof Terminal>
export default meta
type Story = StoryObj<typeof meta>

/** Try `help`, `pnpm build` (streams), `pnpm test` (fails), `deploy` (asks first), `sleep 10` then Ctrl+C. */
export const Default: Story = {}

/** No toolbar: for a panel that already has a title (an IDE's bottom panel). */
export const Bare: Story = {
  args: { toolbar: false, welcome: undefined, className: 'h-[220px] max-w-3xl' },
}

/** A command waiting for an answer through `context.read()`. */
export const Question: Story = {
  render: function Render(args) {
    const terminal = useTerminal({
      ...shell,
      welcome: `${ansi.dim}Deploys need a yes.${ansi.reset}\n`,
    })
    React.useEffect(() => {
      void terminal.run('deploy')
    }, [terminal])
    return (
      // A command is running (it waits for the answer), so the output stays busy.
      <div data-frozen>
        <Terminal {...args} terminal={terminal} />
      </div>
    )
  },
}

/**
 * A process that prints its own prompt, as a shell on a PTY does: here a pretend one that echoes
 * what it gets. In an app, `onData` and `write` go through a WebSocket (or Tauri, or VS Code).
 */
export const Session: Story = {
  render: function Render(args) {
    const [session] = React.useState<TerminalSession>(() => {
      const listeners = new Set<(data: string) => void>()
      const emit = (data: string) => {
        for (const listener of listeners) listener(data)
      }
      const prompt = `${ansi.green}matthieu@orbit${ansi.reset}:${ansi.blue}~${ansi.reset}$ `
      return {
        onData: (listener) => {
          listeners.add(listener)
          listener(`${ansi.dim}Connected to orbit (pretend PTY).${ansi.reset}\r\n${prompt}`)
          return () => listeners.delete(listener)
        },
        write: (data) => {
          if (data === '\x03') emit(`^C\r\n${prompt}`)
          else emit(`${data.replace(/\r$/, '')}\r\nyou typed: ${data.trim()}\r\n${prompt}`)
        },
      }
    })
    const terminal = useTerminal({ session })
    return <Terminal {...args} terminal={terminal} title="ssh orbit" />
  },
}

export const French: Story = {
  globals: { locale: 'fr' },
}
