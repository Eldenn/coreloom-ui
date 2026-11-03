import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Ide, type IdeFile } from '@/components/ide'
import { Terminal, useTerminal } from '@/components/ui/terminal'

import { demoProject, lintFiles } from './ide-data'
import { createDemoShell } from './terminal-data'

const meta = {
  title: 'Blocks/Developer/IDE',
  component: Ide,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A code workspace laid out like VS Code: explorer, tabs, CodeMirror editor, bottom panel and status bar, all in the browser. The consumer provides the `files` (or `defaultFiles`) and wires `onFilesChange`, `onSave` (resolve to mark a file saved), `onRun`, `diagnostics` by path and extra bottom `panels` (an output, a terminal, a preview).',
      },
    },
  },
  args: {
    defaultFiles: demoProject,
    defaultOpen: ['src/app.tsx', 'src/lib/format.ts'],
    title: 'orbit-dashboard',
  },
} satisfies Meta<typeof Ide>
export default meta
type Story = StoryObj<typeof meta>

function OutputLog({ lines }: { lines: string[] }) {
  return (
    <div role="log" aria-label="Output" className="px-3 py-2 font-mono text-[12px] leading-[1.7]">
      {lines.length === 0 ? (
        <p className="text-muted-foreground">Press Run to build the project.</p>
      ) : (
        lines.map((line) => (
          <p key={line} className={line.startsWith('✓') ? 'text-success' : 'text-fg-secondary'}>
            {line}
          </p>
        ))
      )}
    </div>
  )
}

/**
 * Everything works: edit, save (Mod-S, with a short fake delay), find a file (Mod-P), run the
 * commands (Mod-Shift-P), create, rename and delete files. A toy linter fills Problems as you type,
 * and Run writes a fake build to Output.
 */
export const Default: Story = {
  render: function Render(args) {
    const [files, setFiles] = React.useState<IdeFile[]>(args.defaultFiles ?? [])
    const [running, setRunning] = React.useState(false)
    const [output, setOutput] = React.useState<string[]>([])
    const diagnostics = React.useMemo(() => lintFiles(files), [files])
    return (
      <Ide
        {...args}
        files={files}
        onFilesChange={setFiles}
        diagnostics={diagnostics}
        onSave={() =>
          new Promise<void>((resolve) => {
            setTimeout(resolve, 400)
          })
        }
        running={running}
        onRun={(all) => {
          setRunning(true)
          setOutput(['$ vite build', 'transforming…'])
          setTimeout(() => {
            setOutput([
              '$ vite build',
              `✓ ${String(all.length)} files checked`,
              '✓ built in 412 ms',
            ])
            setRunning(false)
          }, 900)
        }}
        panels={[{ id: 'output', label: 'Output', content: <OutputLog lines={output} /> }]}
      />
    )
  },
}

/**
 * A Terminal in the bottom panel. `useTerminal` lives in the page, so the output and the history
 * stay when the panel closes. Run opens the panel on the terminal and runs `pnpm build` in it.
 */
export const WithTerminal: Story = {
  render: function Render(args) {
    const [files, setFiles] = React.useState<IdeFile[]>(args.defaultFiles ?? [])
    const [panel, setPanel] = React.useState('terminal')
    const [panelOpen, setPanelOpen] = React.useState(true)
    const terminal = useTerminal({
      ...createDemoShell(files),
      welcome: 'Type help, or press Run.\n',
    })
    const { running } = React.useSyncExternalStore(
      terminal.subscribe,
      terminal.getState,
      terminal.getState,
    )
    return (
      <Ide
        {...args}
        files={files}
        onFilesChange={setFiles}
        panels={[
          {
            id: 'terminal',
            label: 'Terminal',
            content: (
              <Terminal
                terminal={terminal}
                toolbar={false}
                className="h-full rounded-none border-0"
              />
            ),
          },
        ]}
        panel={panel}
        onPanelChange={setPanel}
        panelOpen={panelOpen}
        onPanelOpenChange={setPanelOpen}
        running={running}
        onRun={() => {
          setPanel('terminal')
          setPanelOpen(true)
          void terminal.run('pnpm build')
        }}
      />
    )
  },
}

/** Problems open: click one to jump to its line. */
export const WithProblems: Story = {
  args: {
    defaultPanelOpen: true,
    defaultOpen: ['src/lib/format.ts'],
    diagnostics: lintFiles(demoProject),
  },
}

/** Nothing can be changed: no New file, Rename or Delete, and the editor is read only. */
export const ReadOnly: Story = {
  args: { readOnly: true, defaultOpen: ['README.md', 'src/components/stat-card.tsx'] },
}

/** No file open yet. */
export const NoFileOpen: Story = {
  args: { defaultOpen: [] },
}

/** An empty project. */
export const Empty: Story = {
  args: { defaultFiles: [], title: 'new-project' },
}

export const French: Story = {
  args: { defaultPanelOpen: true, diagnostics: lintFiles(demoProject) },
  globals: { locale: 'fr' },
}

/** At phone width the explorer moves into a sheet (the panel button at the top left). */
export const Phone: Story = {
  args: { className: 'h-[640px]' },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: (args) => (
    <div className="max-w-[390px]">
      <Ide {...args} />
    </div>
  ),
}
