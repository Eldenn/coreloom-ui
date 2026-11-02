'use client'

// Coreloom UI — AI agent teams (block). A multi-agent system at a glance: AgentGraph (agents, teams,
// who delegates and hands off to whom, the tools and knowledge they share) with a team filter and a
// panel on the selected agent — its role, model, links (with their labels) and where to go next.
// `onEdit` adds an "Edit graph" button for your agent builder (see `agentTeamToWorkflow`). Pass `activity` and
// `activePath` (or derive them from a run's spans with `agentActivityFromSpans`) to show a run live.
import { ActivityIcon, BookOpenIcon, BotIcon, PencilIcon, UserIcon, WrenchIcon } from 'lucide-react'
import * as React from 'react'

import {
  type AgentActivity,
  AgentGraph,
  type AgentGraphEdge,
  type AgentGraphNode,
  type AgentGraphTeam,
  agentRelations,
} from '@/components/ui/agent-graph'
import { Badge, BadgeDot } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCoreloomI18n } from '@/lib/i18n'
import { AppLink } from '@/lib/link'
import { cn } from '@/lib/utils'

interface AgentTeamMember extends AgentGraphNode {
  description?: string
}

/** The fields of a trace span this block reads (`TraceSpan` from ai-runs fits). */
interface AgentSpanLike {
  id: string
  parentId?: string
  kind: string
  name: string
  agentId?: string
  startMs: number
  status: 'ok' | 'error' | 'running'
}

/**
 * What each agent is doing in a run, from the run's spans: an agent span that is still running is
 * `working`, or `waiting` while an agent it started is running; finished spans are `done` or
 * `failed`. `path` is the order the agents took turns in. Spans are matched to agents by `agentId`,
 * else by name.
 */
function agentActivityFromSpans(
  spans: readonly AgentSpanLike[],
  agents: readonly Pick<AgentGraphNode, 'id' | 'name'>[],
): { activity: Partial<Record<string, AgentActivity>>; path: string[] } {
  const ids = new Set(agents.map((a) => a.id))
  const resolve = (s: AgentSpanLike) =>
    s.agentId !== undefined && ids.has(s.agentId)
      ? s.agentId
      : agents.find((a) => a.name === s.name)?.id
  const byId = new Map(spans.map((s) => [s.id, s]))
  const agentSpans = spans
    .filter((s) => s.kind === 'agent' && resolve(s) !== undefined)
    .sort((a, b) => a.startMs - b.startMs)

  // True when `span` sits (at any depth) under `ancestor`; the step bound guards against loops.
  const isUnder = (span: AgentSpanLike, ancestor: AgentSpanLike) => {
    let current = span.parentId !== undefined ? byId.get(span.parentId) : undefined
    for (let step = 0; current && step < spans.length; step++) {
      if (current.id === ancestor.id) return true
      current = current.parentId !== undefined ? byId.get(current.parentId) : undefined
    }
    return false
  }

  const activity: Partial<Record<string, AgentActivity>> = {}
  for (const span of agentSpans) {
    const id = resolve(span)
    if (id === undefined) continue
    if (span.status === 'running') {
      const delegating = agentSpans.some(
        (other) =>
          other !== span &&
          other.status === 'running' &&
          resolve(other) !== id &&
          isUnder(other, span),
      )
      activity[id] = delegating ? 'waiting' : 'working'
    } else activity[id] = span.status === 'error' ? 'failed' : 'done'
  }

  const path: string[] = []
  for (const span of agentSpans) {
    const id = resolve(span)
    if (id !== undefined && path.at(-1) !== id) path.push(id)
  }
  return { activity, path }
}

const STATUS_VARIANT = { active: 'success', paused: 'warning', draft: 'secondary' } as const
const ACTIVITY_VARIANT = {
  working: 'default',
  waiting: 'secondary',
  done: 'success',
  failed: 'destructive',
} as const
const NO_TEAMS: AgentGraphTeam[] = []
const KIND_ICON = { agent: BotIcon, human: UserIcon, tool: WrenchIcon, knowledge: BookOpenIcon }

/** One agent: who it is, what it runs on, who it works with. Related names select that agent. */
function AgentDetails({
  agent,
  agents,
  edges,
  teams = [],
  activity,
  href,
  runsHref,
  onSelect,
}: {
  agent: AgentTeamMember
  agents: AgentTeamMember[]
  edges: AgentGraphEdge[]
  teams?: AgentGraphTeam[]
  activity?: AgentActivity
  href?: (id: string) => string
  runsHref?: (id: string) => string
  onSelect: (id: string) => void
}) {
  const { messages } = useCoreloomI18n()
  const t = messages.ai.agentTeams
  const g = messages.ai.agentGraph
  const baseId = React.useId()
  const kind = agent.kind ?? 'agent'
  const Icon = KIND_ICON[kind]
  const rel = agentRelations(agent.id, edges)
  const team = teams.find((tm) => tm.id === agent.team)
  const nameOf = (id: string) => agents.find((a) => a.id === id)?.name ?? id
  // The word on the link ("Bugs"), read in the direction the section names.
  const linkLabel = (from: string, to: string, kind: AgentGraphEdge['kind']) =>
    edges.find((e) => e.from === from && e.to === to && e.kind === kind)?.label?.trim()
  const out = (kind: AgentGraphEdge['kind']) => (id: string) => linkLabel(agent.id, id, kind)
  const into = (kind: AgentGraphEdge['kind']) => (id: string) => linkLabel(id, agent.id, kind)
  const sections = [
    { key: 'reportsTo', label: t.reportsTo, ids: rel.reportsTo, word: into('delegates') },
    { key: 'delegatesTo', label: t.delegatesTo, ids: rel.delegatesTo, word: out('delegates') },
    { key: 'takesOverFrom', label: t.takesOverFrom, ids: rel.takesOverFrom, word: into('handoff') },
    { key: 'handsOffTo', label: t.handsOffTo, ids: rel.handsOffTo, word: out('handoff') },
    { key: 'uses', label: t.uses, ids: rel.uses, word: out('uses') },
    { key: 'usedBy', label: t.usedBy, ids: rel.usedBy, word: into('uses') },
  ].filter((s) => s.ids.length)
  const facts = [
    { label: t.role, value: agent.role },
    { label: t.team, value: team?.name },
    { label: t.model, value: agent.model },
  ].filter((f) => f.value)

  return (
    <div data-slot="agent-details" className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-fg-secondary"
        >
          <Icon className="size-5" />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="m-0 text-[15px] leading-6 font-semibold break-words text-foreground">
            {agent.name}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            {kind !== 'agent' && <Badge variant="outline">{g.kinds[kind]}</Badge>}
            {agent.status && (
              <Badge variant={STATUS_VARIANT[agent.status]}>
                <BadgeDot />
                {messages.ai.agents.status[agent.status]}
              </Badge>
            )}
            {activity && (
              <Badge variant={ACTIVITY_VARIANT[activity]}>
                <ActivityIcon aria-hidden />
                <span className="sr-only">{t.now}: </span>
                {g.activity[activity]}
              </Badge>
            )}
          </div>
        </div>
      </div>
      {agent.description && (
        <p className="m-0 text-[13px] leading-5 text-fg-secondary">{agent.description}</p>
      )}
      {facts.length > 0 && (
        <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[13px]">
          {facts.map((f) => (
            <React.Fragment key={f.label}>
              <dt className="text-muted-foreground">{f.label}</dt>
              <dd className="m-0 truncate text-foreground">{f.value}</dd>
            </React.Fragment>
          ))}
        </dl>
      )}
      {sections.map((s) => (
        <div key={s.key} className="flex flex-col gap-1.5">
          <p
            id={`${baseId}-${s.key}`}
            className="m-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
          >
            {s.label}
          </p>
          <ul
            aria-labelledby={`${baseId}-${s.key}`}
            className="m-0 flex list-none flex-wrap gap-1.5 p-0"
          >
            {s.ids.map((id) => {
              const word = s.word(id)
              return (
                <li key={id}>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={word ? `${nameOf(id)}, ${word}` : undefined}
                    onClick={() => {
                      onSelect(id)
                    }}
                  >
                    {nameOf(id)}
                    {word && <span className="font-normal text-muted-foreground">{word}</span>}
                  </Button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
      {kind === 'agent' && (href ?? runsHref) && (
        <div className="flex flex-wrap gap-2 border-t border-border-subtle pt-3">
          {href && (
            <Button asChild variant="outline" size="sm">
              <AppLink href={href(agent.id)}>{t.openAgent}</AppLink>
            </Button>
          )}
          {runsHref && (
            <Button asChild variant="ghost" size="sm">
              <AppLink href={runsHref(agent.id)}>{t.runs}</AppLink>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

/** The agents and their teams as a graph, a team filter, and the selected agent's details. */
function AgentTeams({
  agents,
  edges,
  teams = NO_TEAMS,
  activity,
  activePath,
  defaultSelectedId,
  defaultTeam = 'all',
  defaultView,
  href,
  runsHref,
  onEdit,
  className,
}: {
  agents: AgentTeamMember[]
  edges: AgentGraphEdge[]
  teams?: AgentGraphTeam[]
  /** What each agent is doing in the run being shown, by id. */
  activity?: Partial<Record<string, AgentActivity>>
  /** The agents the run went through, in order. */
  activePath?: string[]
  defaultSelectedId?: string
  /** A team id, or `'all'`. */
  defaultTeam?: string
  defaultView?: 'graph' | 'list'
  /** An agent's page: (id) => `/agents/${id}`. */
  href?: (id: string) => string
  /** An agent's runs: (id) => `/agents/${id}/runs`. */
  runsHref?: (id: string) => string
  /**
   * Shows "Edit graph": open your agent builder on these agents, with the selected one (if any).
   * `agentTeamToWorkflow` (ai-agent-builder) turns the team into the builder's graph.
   */
  onEdit?: (selectedId: string | null) => void
  className?: string
}) {
  const t = useCoreloomI18n().messages.ai.agentTeams
  const baseId = React.useId()
  const [team, setTeam] = React.useState(defaultTeam)
  const [selected, setSelected] = React.useState<string | null>(defaultSelectedId ?? null)

  // A team's view keeps its members and the tools and knowledge they use.
  const visible = React.useMemo(() => {
    if (team === 'all') return { agents, edges, teams }
    const members = new Set(agents.filter((a) => a.team === team).map((a) => a.id))
    for (const e of edges) if (e.kind === 'uses' && members.has(e.from)) members.add(e.to)
    return {
      agents: agents.filter((a) => members.has(a.id)),
      edges: edges.filter((e) => members.has(e.from) && members.has(e.to)),
      teams: teams.filter((tm) => tm.id === team),
    }
  }, [team, agents, edges, teams])
  const current = selected !== null ? agents.find((a) => a.id === selected) : undefined
  const shown = current && visible.agents.includes(current) ? current : undefined

  const selectAgent = (id: string) => {
    // Following a link to an agent outside the filtered team shows every team again.
    if (!visible.agents.some((a) => a.id === id)) setTeam('all')
    setSelected(id)
  }

  if (!agents.length)
    return (
      <div
        data-slot="agent-teams"
        className={cn(
          'flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center',
          className,
        )}
      >
        <BotIcon aria-hidden className="size-6 text-muted-foreground" />
        <p className="m-0 text-[14px] font-medium text-foreground">{t.empty}</p>
        <p className="m-0 max-w-sm text-[13px] text-muted-foreground">{t.emptyHint}</p>
      </div>
    )

  return (
    <div data-slot="agent-teams" className={cn('flex flex-col gap-3', className)}>
      {(teams.length > 1 || onEdit) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {teams.length > 1 ? (
            <div className="flex items-center gap-2">
              <label htmlFor={`${baseId}-team`} className="text-[13px] font-medium text-foreground">
                {t.team}
              </label>
              <Select value={team} onValueChange={setTeam}>
                <SelectTrigger id={`${baseId}-team`} size="sm" className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allTeams}</SelectItem>
                  {teams.map((tm) => (
                    <SelectItem key={tm.id} value={tm.id}>
                      {tm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <span />
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onEdit(shown ? shown.id : null)
              }}
            >
              <PencilIcon aria-hidden />
              {t.edit}
            </Button>
          )}
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <AgentGraph
          agents={visible.agents}
          edges={visible.edges}
          teams={visible.teams}
          selectedId={shown ? shown.id : null}
          onSelectedChange={setSelected}
          activity={activity}
          activePath={activePath}
          defaultView={defaultView}
        />
        <aside
          aria-label={t.details}
          className="flex min-w-0 flex-col rounded-lg border border-border bg-card p-4"
        >
          {shown ? (
            <AgentDetails
              agent={shown}
              agents={agents}
              edges={edges}
              teams={teams}
              activity={activity?.[shown.id]}
              href={href}
              runsHref={runsHref}
              onSelect={selectAgent}
            />
          ) : (
            <p className="m-0 text-[13px] text-muted-foreground">{t.selectAgent}</p>
          )}
        </aside>
      </div>
    </div>
  )
}

export {
  agentActivityFromSpans,
  AgentDetails,
  type AgentSpanLike,
  type AgentTeamMember,
  AgentTeams,
}
