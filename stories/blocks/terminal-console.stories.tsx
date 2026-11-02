import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { TerminalConsole, type TerminalConsoleProfile } from '@/components/terminal-console'
import { createTerminal } from '@/components/ui/terminal'

import { demoProject } from './ide-data'
import { ansi, createDemoShell, demoTranscript } from './terminal-data'

const shell = createDemoShell(demoProject)
const profiles: TerminalConsoleProfile[] = [
  { id: 'zsh', label: 'zsh' },
  { id: 'node', label: 'node' },
  { id: 'staging', label: 'ssh staging' },
]

/** One terminal per tab; in an app, each would open its own process or connection. */
function newSession(profile: TerminalConsoleProfile | undefined) {
  const label = profile?.label ?? 'zsh'
  return {
    title: label,
    terminal: createTerminal({
      ...shell,
      welcome: `${ansi.dim}${label} · type help${ansi.reset}\n`,
    }),
  }
}

function useSessions(count: number) {
  const [sessions] = React.useState(() =>
    [
      { id: 'main', title: 'zsh', terminal: createTerminal({ ...shell, welcome: demoTranscript }) },
      {
        id: 'server',
        title: 'pnpm dev',
        terminal: createTerminal({
          ...shell,
          welcome: `${ansi.cyan}VITE v7.1.4${ansi.reset}  ready in ${ansi.bold}312 ms${ansi.reset}\n\n  ${ansi.green}➜${ansi.reset}  Local:   ${ansi.cyan}http://localhost:5173/${ansi.reset}\n  ${ansi.dim}➜  press h + enter to show help${ansi.reset}\n`,
        }),
      },
    ].slice(0, count),
  )
  return sessions
}

const meta = {
  title: 'Blocks/Developer/Terminal console',
  component: TerminalConsole,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Several terminals in tabs, with New terminal (a menu of `profiles`), a side by side split and Close. The consumer provides `defaultSessions` (`{ id, title, terminal }`, the terminal from `createTerminal`), `createSession(profile)` and `onCloseSession` to stop a process.',
      },
    },
  },
  args: { createSession: newSession, profiles },
} satisfies Meta<typeof TerminalConsole>
export default meta
type Story = StoryObj<typeof meta>

/** Two terminals; their output stays when you switch tabs. New terminal offers three profiles. */
export const Default: Story = {
  render: function Render(args) {
    const sessions = useSessions(2)
    return <TerminalConsole {...args} defaultSessions={sessions} />
  },
}

/** Two terminals side by side (stacked when the console is narrow). */
export const Split: Story = {
  render: function Render(args) {
    const sessions = useSessions(2)
    return <TerminalConsole {...args} defaultSessions={sessions} defaultSplit />
  },
}

/** Every terminal closed. */
export const Empty: Story = {
  args: { profiles: [] },
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: function Render(args) {
    const sessions = useSessions(2)
    return <TerminalConsole {...args} defaultSessions={sessions} />
  },
}

export const Phone: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: function Render(args) {
    const sessions = useSessions(2)
    return (
      <div className="max-w-[390px]">
        <TerminalConsole {...args} defaultSessions={sessions} defaultSplit className="h-[560px]" />
      </div>
    )
  },
}
