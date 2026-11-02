import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  CheckIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  MessageSquareIcon,
  PackageIcon,
  RocketIcon,
  TriangleAlertIcon,
  TruckIcon,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RelativeTime } from '@/components/ui/relative-time'
import { Timeline, TimelineItem } from '@/components/ui/timeline'

// The screenshots freeze the clock at this moment; the stories count from it too.
const NOW = new Date('2026-10-14T10:00:00+02:00')
const ago = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000)

const meta = {
  title: 'Components/Data display/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'What happened, in order. `Timeline` is the list; each `TimelineItem` takes a `title`, and optionally an `icon` (or a dot), a `tone`, a `time` (a RelativeTime), a `description` and children below.',
      },
    },
  },
} satisfies Meta<typeof Timeline>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Timeline className="max-w-xl" aria-label="Pull request history">
      <TimelineItem
        icon={<GitPullRequestIcon />}
        tone="primary"
        title={
          <>
            <strong className="font-medium">Léa Martin</strong> opened the pull request
          </>
        }
        time={<RelativeTime date={ago(60 * 26)} now={NOW} />}
      />
      <TimelineItem
        icon={
          <Avatar className="size-8">
            <AvatarFallback>TB</AvatarFallback>
          </Avatar>
        }
        title={
          <>
            <strong className="font-medium">Tom Bernard</strong> commented
          </>
        }
        time={<RelativeTime date={ago(60 * 3)} now={NOW} />}
      >
        <p className="m-0 rounded-md border border-border bg-card px-3 py-2 text-[13px] text-foreground">
          Looks good. Can we keep the old export for one more release?
        </p>
      </TimelineItem>
      <TimelineItem
        icon={<TriangleAlertIcon />}
        tone="warning"
        title="Checks failed on the first run"
        description="2 of 14 checks failed: visual, a11y."
        time={<RelativeTime date={ago(95)} now={NOW} />}
      />
      <TimelineItem
        icon={<CheckIcon />}
        tone="success"
        title="All checks passed"
        time={<RelativeTime date={ago(40)} now={NOW} />}
      />
      <TimelineItem
        icon={<GitMergeIcon />}
        tone="info"
        title={
          <>
            Merged into <Badge variant="outline">main</Badge>
          </>
        }
        time={<RelativeTime date={ago(4)} now={NOW} />}
      >
        <Button size="sm" variant="outline">
          <RocketIcon />
          Deploy
        </Button>
      </TimelineItem>
    </Timeline>
  ),
}

export const Dots: Story = {
  render: () => (
    <div className="grid max-w-3xl gap-10 sm:grid-cols-2">
      <Timeline aria-label="Order tracking">
        <TimelineItem tone="success" title="Order placed" time="Oct 10, 09:12" />
        <TimelineItem tone="success" title="Paid" time="Oct 10, 09:13" />
        <TimelineItem
          tone="primary"
          title="Shipped"
          description="Parcel 6A1 204 889, Colissimo."
          time="Oct 12, 16:40"
        />
        <TimelineItem title="Delivered" description="Expected Oct 15." />
      </Timeline>
      <Timeline aria-label="Deployment">
        <TimelineItem icon={<PackageIcon />} tone="success" title="Build" time="1 min 12 s" />
        <TimelineItem icon={<MessageSquareIcon />} tone="success" title="Tests" time="3 min 40 s" />
        <TimelineItem
          icon={<TruckIcon />}
          tone="danger"
          title="Deploy to production"
          description="Health check timed out after 60 s. Rolled back."
          time="1 min 05 s"
        />
      </Timeline>
    </div>
  ),
}
