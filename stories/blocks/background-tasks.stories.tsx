import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import {
  type BackgroundTask,
  BackgroundTaskList,
  BackgroundTasks,
} from '@/components/background-tasks'
import { Button } from '@/components/ui/button'

// Stories run with the clock frozen on 2026-10-14 at 08:00 UTC.
const mixed: BackgroundTask[] = [
  {
    id: 'refresh',
    label: 'Catalog search',
    status: 'running',
    detail: 'skills-refresh queue',
    startedAt: '2026-10-14T07:57:00Z',
  },
  {
    id: 'scan',
    label: 'Skill scans',
    status: 'running',
    detail: '12 of 40 copies',
    startedAt: '2026-10-14T07:52:00Z',
    progress: 30,
  },
  {
    id: 'import',
    label: 'Import from GitHub',
    status: 'queued',
    startedAt: '2026-10-14T07:59:00Z',
  },
  {
    id: 'map',
    label: 'Code map of coreloom-api',
    status: 'done',
    startedAt: '2026-10-14T07:30:00Z',
    finishedAt: '2026-10-14T07:41:00Z',
  },
  {
    id: 'tags',
    label: 'Skill tags',
    status: 'failed',
    detail: 'attempt 3 of 3',
    startedAt: '2026-10-14T06:10:00Z',
    finishedAt: '2026-10-14T06:12:00Z',
    error: 'The embedding model could not be downloaded.',
  },
]

/** A header bar to sit the trigger in, tall enough for the open popover. */
function Header({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[520px]">
      <div className="flex h-14 items-center justify-end gap-2 border-b border-border px-4">
        {children}
      </div>
    </div>
  )
}

const meta = {
  title: 'Blocks/Background tasks',
  component: BackgroundTasks,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, iframeHeight: 560 },
      description: {
        component:
          'An icon button for the app header that spins while long jobs the person launched are queued or running, with their count, and a popover listing them: running, queued, then the ones that just ended. The consumer provides `tasks` (`{ id, label, status, detail?, startedAt?, finishedAt?, progress?, error? }`, polled from its API), optionally `open` / `defaultOpen` / `onOpenChange` to open it when a task is launched, and `onDismiss(id)` to remove a finished one. When a task finishes or fails it is announced, popover open or not. `BackgroundTaskList` is the list alone, for a page or a panel.',
      },
    },
  },
  args: { tasks: mixed, defaultOpen: true },
  argTypes: {
    tasks: { control: 'object' },
    open: { control: 'boolean' },
    defaultOpen: { control: 'boolean' },
    onOpenChange: { control: false },
    onDismiss: { control: false },
  },
  render: function Render(args) {
    const [tasks, setTasks] = React.useState(args.tasks)
    return (
      <Header>
        <BackgroundTasks
          {...args}
          tasks={tasks}
          onDismiss={(id) => {
            setTasks((list) => list.filter((task) => task.id !== id))
          }}
        />
      </Header>
    )
  },
} satisfies Meta<typeof BackgroundTasks>
export default meta
type Story = StoryObj<typeof meta>

/** Two running (one with progress), one queued, one done and one failed; finished ones can be dismissed. */
export const Default: Story = {}

export const Empty: Story = { args: { tasks: [] } }

export const AllRunning: Story = {
  args: {
    tasks: [
      {
        id: 'a',
        label: 'Skill scans',
        status: 'running',
        progress: 72,
        startedAt: '2026-10-14T07:40:00Z',
      },
      {
        id: 'b',
        label: 'Import from GitHub',
        status: 'running',
        detail: 'Cloning eldenn/coreloom',
        progress: 15,
        startedAt: '2026-10-14T07:58:00Z',
      },
      {
        id: 'c',
        label: 'Code map of coreloom-web',
        status: 'running',
        progress: 0,
        startedAt: '2026-10-14T07:59:30Z',
      },
    ],
  },
}

const longError: BackgroundTask = {
  id: 'scan-failed',
  label: 'Skill scan of anthropics/skills/pdf',
  status: 'failed',
  detail: 'attempt 3 of 3 · skill-scans queue',
  startedAt: '2026-10-14T07:20:00Z',
  finishedAt: '2026-10-14T07:35:00Z',
  error:
    'SkillSpector exited with code 2 after 900 seconds: the report at /tmp/skill-scan-8f3a2c91d4e5b6a7/report.json could not be read because the scan was stopped before it wrote its ledger_exceptions section. Queue the copy again from its sheet, or approve it with a written reason.',
}

export const FailureWithLongError: Story = { args: { tasks: [longError] } }

const longLabels: BackgroundTask[] = [
  {
    id: 'l1',
    label:
      'Import from GitHub of eldenn/coreloom-uml-with-a-really-long-repository-name-that-keeps-going at branch feature/very-long-branch-name',
    status: 'running',
    detail: 'code-maps queue · waiting for a sandbox to start on the self-hosted install',
    startedAt: '2026-10-14T07:50:00Z',
    progress: 48,
  },
  {
    id: 'l2',
    label: 'Weekly refresh of every trusted skill source and every skill they list',
    status: 'done',
    detail: '1,284 skills read, 37 new, 4 no longer eligible',
    startedAt: '2026-10-14T05:00:00Z',
    finishedAt: '2026-10-14T05:42:00Z',
  },
]

export const LongLabels: Story = { args: { tasks: longLabels } }

export const French: Story = { globals: { locale: 'fr' } }

export const Phone: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } }

/**
 * Launching a task opens the popover (controlled `open`); finishing it is announced, closed or
 * not. The app would set the status from its API instead of these buttons.
 */
export const Launching: Story = {
  args: { tasks: [], defaultOpen: false },
  render: function Render() {
    const [tasks, setTasks] = React.useState<BackgroundTask[]>([])
    const [open, setOpen] = React.useState(false)
    const running = tasks.find((task) => task.status === 'running')
    return (
      <Header>
        <Button
          variant="outline"
          size="sm"
          disabled={!!running}
          onClick={() => {
            setTasks((list) => [
              {
                id: `import-${String(list.length + 1)}`,
                label: 'Import from GitHub',
                status: 'running',
                startedAt: new Date(),
              },
              ...list,
            ])
            setOpen(true)
          }}
        >
          Import a repository
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!running}
          onClick={() => {
            setTasks((list) =>
              list.map((task) =>
                task.status === 'running'
                  ? { ...task, status: 'done', finishedAt: new Date() }
                  : task,
              ),
            )
          }}
        >
          Finish the import
        </Button>
        <BackgroundTasks
          tasks={tasks}
          open={open}
          onOpenChange={setOpen}
          onDismiss={(id) => {
            setTasks((list) => list.filter((task) => task.id !== id))
          }}
        />
      </Header>
    )
  },
}

/** The list alone, inline: for a page or a side panel (and for axe, which can't see a popover). */
export const List: Story = {
  render: function Render() {
    const [tasks, setTasks] = React.useState([...mixed, longError, ...longLabels])
    return (
      <div className="mx-auto max-w-[420px] p-4">
        <div className="rounded-lg border border-border bg-card">
          <BackgroundTaskList
            tasks={tasks}
            onDismiss={(id) => {
              setTasks((list) => list.filter((task) => task.id !== id))
            }}
          />
        </div>
      </div>
    )
  },
}

export const ListEmpty: Story = {
  render: () => (
    <div className="mx-auto max-w-[420px] p-4">
      <div className="rounded-lg border border-border bg-card">
        <BackgroundTaskList tasks={[]} />
      </div>
    </div>
  ),
}
