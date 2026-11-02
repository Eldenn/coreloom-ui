import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { EvalRunReport, EvalSuiteList } from '@/components/ai-evals'

import { baselineRun, candidateRun, evalSuites, runWithError } from './ai-evals-data'

const meta = {
  title: 'Blocks/AI/Evaluations',
  component: EvalRunReport,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Evaluations for prompts and agents. `EvalSuiteList` shows your suites with their last pass rate against a threshold, the trend and a Run button (`onRun`). `EvalRunReport` shows one run case by case: score, the judge’s verdict and reasoning, per-metric scores, input, expected and output. Pass a `baseline` run to compare two runs side by side: deltas, regressions and improvements (`compareEvalRuns`), and each case’s outputs in a split diff. Map your eval tool’s results to `EvalRun`; nothing is fetched.',
      },
    },
  },
  args: { run: candidateRun, baseline: baselineRun },
} satisfies Meta<typeof EvalRunReport>
export default meta
type Story = StoryObj<typeof meta>

/** Prompt v12 against v11: it opens on the regressions. */
export const Compare: Story = {}

/** One run on its own: pass rate, mean score, cost, and every case. */
export const SingleRun: Story = { args: { baseline: undefined, defaultFilter: 'all' } }

/** A case that couldn’t be scored shows its error; Run again calls `onRerunCase`. */
export const WithError: Story = {
  args: {
    run: runWithError,
    baseline: undefined,
    defaultFilter: 'failed',
    defaultSelectedId: 'vat',
    onRerunCase: () => undefined,
  },
}

/** The improvements, with a case whose score went up. */
export const Improvements: Story = {
  args: { defaultFilter: 'improved', defaultSelectedId: 'student' },
}

export const Empty: Story = { args: { run: { ...candidateRun, cases: [] }, baseline: undefined } }

export const French: Story = { globals: { locale: 'fr' } }

export const Phone: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: (args) => (
    <div className="max-w-[390px]">
      <EvalRunReport {...args} />
    </div>
  ),
}

/** Your suites; Run starts one (here it finishes after two seconds). */
export const Suites: Story = {
  render: function Render() {
    const [running, setRunning] = React.useState<string[]>([])
    return (
      <EvalSuiteList
        suites={evalSuites}
        href={(id) => `#evals/${id}`}
        running={running}
        onRun={(id) => {
          setRunning((r) => [...r, id])
          setTimeout(() => {
            setRunning((r) => r.filter((x) => x !== id))
          }, 2000)
        }}
      />
    )
  },
}

export const SuitesEmpty: Story = {
  render: () => <EvalSuiteList suites={[]} />,
}

export const SuitesFrench: Story = {
  globals: { locale: 'fr' },
  render: () => <EvalSuiteList suites={evalSuites} onRun={() => undefined} />,
}
