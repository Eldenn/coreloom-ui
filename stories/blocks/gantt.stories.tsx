import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Gantt, type GanttTask } from '@/components/gantt'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/sonner'

const day = (month: number, date: number) => new Date(2026, month - 1, date)
const today = day(10, 14)

const roadmap: GanttTask[] = [
  {
    id: 'research',
    name: 'User research',
    start: day(9, 21),
    end: day(10, 2),
    progress: 100,
    group: 'Discovery',
    tone: 'success',
  },
  {
    id: 'spec',
    name: 'Write the spec',
    start: day(10, 5),
    end: day(10, 16),
    progress: 70,
    group: 'Discovery',
    dependsOn: ['research'],
  },
  {
    id: 'kickoff',
    name: 'Kick-off',
    start: day(10, 19),
    end: day(10, 19),
    milestone: true,
    group: 'Discovery',
    dependsOn: ['spec'],
    tone: 'info',
  },
  {
    id: 'api',
    name: 'Billing API',
    start: day(10, 19),
    end: day(11, 6),
    progress: 20,
    group: 'Build',
    dependsOn: ['kickoff'],
  },
  {
    id: 'ui',
    name: 'Checkout screens',
    start: day(10, 26),
    end: day(11, 13),
    progress: 0,
    group: 'Build',
    dependsOn: ['kickoff'],
  },
  {
    id: 'qa',
    name: 'QA and fixes',
    start: day(11, 16),
    end: day(11, 25),
    group: 'Launch',
    dependsOn: ['api', 'ui'],
    tone: 'warning',
  },
  {
    id: 'launch',
    name: 'Public launch',
    start: day(11, 27),
    end: day(11, 27),
    milestone: true,
    group: 'Launch',
    dependsOn: ['qa'],
    tone: 'danger',
  },
]

const meta = {
  title: 'Blocks/Gantt',
  component: Gantt,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A roadmap on a timeline: bars with their progress, milestones, dependency arrows (red and dashed when a task starts before the one it waits for ends), groups and a today line, with a day / week / month zoom. Pass `onTaskChange` to let people move bars and drag their ends, with the mouse or the arrow keys (Alt moves the start, Shift the end); save the new dates in it. `onTaskClick` and `selectedId` open your own task panel.',
      },
    },
  },
  args: { tasks: roadmap, today, title: 'Checkout v2' },
} satisfies Meta<typeof Gantt>
export default meta
type Story = StoryObj<typeof meta>

/** Drag a bar or its ends (or focus it and use the arrows); click it to select it. */
export const Roadmap: Story = {
  render: (args) => {
    const [tasks, setTasks] = React.useState(args.tasks)
    const [selected, setSelected] = React.useState<string>()
    return (
      <Gantt
        {...args}
        tasks={tasks}
        selectedId={selected}
        onTaskClick={(task) => {
          setSelected(task.id)
        }}
        onTaskChange={(id, range) => {
          setTasks((list) => list.map((t) => (t.id === id ? { ...t, ...range } : t)))
        }}
        toolbar={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              toast('New task')
            }}
          >
            Add task
          </Button>
        }
      />
    )
  },
}

/** Read-only, by month: a quarter at a glance. */
export const Months: Story = { args: { defaultZoom: 'month' } }

/** By day, with weekends shaded. */
export const Days: Story = { args: { defaultZoom: 'day' } }

/** A dependency that is late: the arrow turns red and dashed, and the bar's name says it. */
export const LateDependency: Story = {
  args: {
    tasks: roadmap.map((t) => (t.id === 'qa' ? { ...t, start: day(11, 10) } : t)),
  },
}

export const Empty: Story = { args: { tasks: [] } }

export const French: Story = {
  globals: { locale: 'fr' },
  args: {
    title: 'Paiement v2',
    tasks: roadmap.map((t) => ({
      ...t,
      name:
        {
          research: 'Recherche utilisateurs',
          spec: 'Rédiger la spec',
          kickoff: 'Lancement',
          api: 'API de facturation',
          ui: 'Écrans de paiement',
          qa: 'Recette et corrections',
          launch: 'Sortie publique',
        }[t.id] ?? t.name,
      group: { Discovery: 'Cadrage', Build: 'Réalisation', Launch: 'Sortie' }[t.group ?? ''],
    })),
  },
}
