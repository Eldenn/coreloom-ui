import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { type PipelineJob, PipelineRun } from '@/components/pipeline-run'

import { ansi, buildLog } from './terminal-data'

const installLog = `${ansi.dim}$ pnpm install --frozen-lockfile${ansi.reset}
Packages: ${ansi.green}+412${ansi.reset}
Progress: resolved 412, reused 412, downloaded 0, added 412, ${ansi.bold}done${ansi.reset}
Done in 3.8s`

const testLog = `${ansi.dim}$ pnpm test${ansi.reset}
 ${ansi.green}✓${ansi.reset} src/lib/format.test.ts (4 tests) 3ms
 ${ansi.green}✓${ansi.reset} src/app.test.tsx (2 tests) 18ms
 Test Files  ${ansi.green}2 passed${ansi.reset} (2)`

const failedRun: PipelineJob[] = [
  {
    id: 'lint',
    name: 'Lint and typecheck',
    status: 'success',
    durationMs: 48_000,
    steps: [
      {
        id: 'checkout',
        name: 'Check out',
        status: 'success',
        durationMs: 2_000,
        log: 'Fetching main at 3f9c2e1… done',
      },
      { id: 'install', name: 'Install', status: 'success', durationMs: 21_000, log: installLog },
      {
        id: 'lint',
        name: 'pnpm lint',
        status: 'success',
        durationMs: 25_000,
        log: `${ansi.green}✓${ansi.reset} No problems`,
      },
    ],
  },
  {
    id: 'build',
    name: 'Build',
    status: 'failed',
    durationMs: 72_000,
    steps: [
      {
        id: 'checkout',
        name: 'Check out',
        status: 'success',
        durationMs: 2_000,
        log: 'Fetching main at 3f9c2e1… done',
      },
      { id: 'install', name: 'Install', status: 'success', durationMs: 22_000, log: installLog },
      { id: 'build', name: 'pnpm build', status: 'failed', durationMs: 48_000, log: buildLog },
      { id: 'upload', name: 'Upload artifact', status: 'skipped' },
    ],
  },
  {
    id: 'test',
    name: 'Test',
    status: 'success',
    durationMs: 64_000,
    steps: [
      {
        id: 'checkout',
        name: 'Check out',
        status: 'success',
        durationMs: 2_000,
        log: 'Fetching main at 3f9c2e1… done',
      },
      { id: 'test', name: 'pnpm test', status: 'success', durationMs: 62_000, log: testLog },
    ],
  },
  { id: 'deploy', name: 'Deploy to staging', status: 'cancelled', steps: [] },
]

const runningRun: PipelineJob[] = [
  {
    id: 'build',
    name: 'Build',
    status: 'success',
    durationMs: 51_000,
    steps: [
      {
        id: 'build',
        name: 'pnpm build',
        status: 'success',
        durationMs: 51_000,
        log: `${ansi.green}✓ built in 1.24s${ansi.reset}`,
      },
    ],
  },
  {
    id: 'deploy',
    name: 'Deploy to production',
    status: 'running',
    steps: [
      {
        id: 'upload',
        name: 'Upload build',
        status: 'success',
        durationMs: 8_000,
        log: 'Uploaded 14 files (1.2 MB)',
      },
      {
        id: 'migrate',
        name: 'Run migrations',
        status: 'running',
        log: `${ansi.cyan}›${ansi.reset} 0042_add_events_index … ${ansi.green}done${ansi.reset}\n${ansi.cyan}›${ansi.reset} 0043_backfill_workspaces …`,
      },
      { id: 'switch', name: 'Switch traffic', status: 'queued' },
    ],
  },
]

const meta = {
  title: 'Blocks/Developer/Pipeline run',
  component: PipelineRun,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One run of a CI pipeline or a deploy: status, jobs, steps and each step’s log (ANSI, searchable). The consumer passes `title`, `status`, `jobs` (`{ id, name, status, durationMs, steps: [{ id, name, status, durationMs, log }] }`), `meta`, `durationMs`, and wires `onRerun`, `onCancel` and `onRerunJob`. The failed step opens by itself.',
      },
    },
  },
  args: {
    title: 'CI · fix: compact visitor count',
    status: 'failed',
    jobs: failedRun,
    durationMs: 134_000,
    meta: 'main · 3f9c2e1 · pushed by Matthieu',
    timeZone: 'UTC',
    onRerun: () => undefined,
    onRerunJob: () => undefined,
  },
} satisfies Meta<typeof PipelineRun>
export default meta
type Story = StoryObj<typeof meta>

/** A failed run: the Build job and its failed step are open. */
export const Failed: Story = {}

/** A deploy in progress: Cancel instead of Re-run, the running step's log follows its end. */
export const Running: Story = {
  args: {
    title: 'Deploy #482',
    status: 'running',
    jobs: runningRun,
    durationMs: undefined,
    meta: 'v2.14.0 · production',
    onCancel: () => undefined,
  },
}

/** Re-run and Cancel change the run in your app; here they replay it with a short fake delay. */
export const Interactive: Story = {
  render: function Render(args) {
    const [status, setStatus] = React.useState(args.status)
    return (
      <PipelineRun
        {...args}
        status={status}
        onRerun={() => {
          setStatus('running')
          setTimeout(() => {
            setStatus('success')
          }, 1200)
        }}
        onCancel={() => {
          setStatus('cancelled')
        }}
      />
    )
  },
}

export const French: Story = {
  globals: { locale: 'fr' },
}

export const Phone: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: (args) => (
    <div className="max-w-[390px]">
      <PipelineRun {...args} />
    </div>
  ),
}
