'use client'

// Coreloom UI — SequenceDiagramView. A sequence diagram as an SVG: participants and actors at the
// top and bottom, lifelines, messages with their arrows (and numbers with autonumber), activation
// bars, notes, and loop / alt / opt / par / critical / break frames. Screen readers get the same
// steps as an ordered list. UmlDiagram uses it for `kind: 'sequence'`.
import * as React from 'react'

import { type Messages, useCoreloomI18n } from '@/lib/i18n'
import type { SequenceArrow, SequenceDiagram, SequenceStep } from '@/lib/uml'
import { layoutSequence, type SequenceColumn, type SequenceItem } from '@/lib/uml-sequence'
import { cn } from '@/lib/utils'

interface SequenceDiagramViewProps {
  diagram: SequenceDiagram
  /** CSS max height; taller diagrams scroll. */
  maxHeight?: number | string
  /** The accessible name. Default: "Sequence diagram". */
  label?: string
  className?: string
}

type SequenceText = Messages['diagram']['sequence']

const DASHED: ReadonlySet<SequenceArrow> = new Set([
  'reply',
  'dottedLine',
  'dottedLost',
  'dottedAsync',
])
const HEAD: Record<SequenceArrow, 'filled' | 'open' | 'cross' | null> = {
  sync: 'filled',
  reply: 'filled',
  line: null,
  dottedLine: null,
  lost: 'cross',
  dottedLost: 'cross',
  async: 'open',
  dottedAsync: 'open',
}

function Lines({
  text,
  x,
  y,
  anchor = 'middle',
}: {
  text: string
  x: number
  y: number
  anchor?: 'middle' | 'start'
}) {
  const lines = text.split('\n')
  return (
    <text
      x={x}
      y={y - (lines.length - 1) * 16}
      textAnchor={anchor}
      className="fill-foreground text-[12.5px]"
    >
      {lines.map((line, i) => (
        // eslint-disable-next-line @eslint-react/no-array-index-key -- lines may repeat
        <tspan key={i} x={x} dy={i === 0 ? 0 : 16}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

function Participant({ col, y, actor }: { col: SequenceColumn; y: number; actor: boolean }) {
  if (col.kind === 'actor') {
    const cx = col.x
    return (
      <g className="stroke-fg-secondary" fill="none" strokeWidth={1.5}>
        <circle cx={cx} cy={y + 9} r={6} />
        <path
          d={`M${String(cx)} ${String(y + 15)} V${String(y + 30)} M${String(cx - 9)} ${String(y + 20)} H${String(cx + 9)} M${String(cx)} ${String(y + 30)} L${String(cx - 8)} ${String(y + 40)} M${String(cx)} ${String(y + 30)} L${String(cx + 8)} ${String(y + 40)}`}
        />
        <text
          x={cx}
          y={y + 56}
          textAnchor="middle"
          stroke="none"
          className="fill-foreground text-[13px] font-semibold"
        >
          {col.label}
        </text>
      </g>
    )
  }
  const top = actor ? y + 10 : y
  return (
    <g>
      <rect
        x={col.x - col.width / 2}
        y={top}
        width={col.width}
        height={40}
        rx={6}
        className="fill-card stroke-border-strong"
      />
      <text
        x={col.x}
        y={top + 25}
        textAnchor="middle"
        className="fill-foreground text-[13px] font-semibold"
      >
        {col.label}
      </text>
    </g>
  )
}

function Message({
  item,
  markers,
}: {
  item: Extract<SequenceItem, { type: 'message' }>
  markers: string
}) {
  const head = HEAD[item.arrow]
  const style = {
    stroke: 'var(--diagram-edge)',
    strokeWidth: 1.25,
    fill: 'none',
    ...(DASHED.has(item.arrow) ? { strokeDasharray: '5 4' } : {}),
  }
  const end = head ? `url(#${markers}-${head})` : undefined
  const left = Math.min(item.from, item.to)
  const mid = item.self ? item.from + 12 : left + Math.abs(item.to - item.from) / 2
  return (
    <g>
      {item.self ? (
        <path
          d={`M${String(item.from)} ${String(item.y)} H${String(item.from + 40)} V${String(item.y + 22)} H${String(item.from + 2)}`}
          style={style}
          markerEnd={end}
        />
      ) : (
        <line x1={item.from} y1={item.y} x2={item.to} y2={item.y} style={style} markerEnd={end} />
      )}
      {item.number !== undefined && (
        <g>
          <circle cx={item.from} cy={item.y} r={9} className="fill-foreground" />
          <text
            x={item.from}
            y={item.y + 3.5}
            textAnchor="middle"
            className="fill-background text-[10px] font-semibold"
          >
            {item.number}
          </text>
        </g>
      )}
      {item.text && (
        <Lines
          text={item.text}
          x={item.self ? item.from + 48 : mid}
          y={item.y - 8}
          anchor={item.self ? 'start' : 'middle'}
        />
      )}
    </g>
  )
}

function Block({ item, t }: { item: Extract<SequenceItem, { type: 'block' }>; t: SequenceText }) {
  const name = t.blocks[item.kind]
  const tab = name.length * 6.6 + 18
  return (
    <g>
      <rect
        x={item.x}
        y={item.y}
        width={item.width}
        height={item.height}
        rx={4}
        className="fill-inset/40 stroke-border-strong"
      />
      <path
        d={`M${String(item.x)} ${String(item.y + 20)} H${String(item.x + tab)} L${String(item.x + tab + 8)} ${String(item.y + 12)} V${String(item.y)}`}
        className="fill-secondary stroke-border-strong"
      />
      <text x={item.x + 8} y={item.y + 14} className="fill-foreground text-[11px] font-semibold">
        {name}
      </text>
      {item.sections[0]?.label && (
        <text x={item.x + tab + 16} y={item.y + 14} className="fill-fg-secondary text-[12px]">
          [{item.sections[0].label}]
        </text>
      )}
      {item.sections.slice(1).map((s) => (
        <g key={s.y}>
          <line
            x1={item.x}
            x2={item.x + item.width}
            y1={s.y}
            y2={s.y}
            strokeDasharray="5 4"
            className="stroke-border-strong"
          />
          <text x={item.x + 8} y={s.y + 16} className="fill-fg-secondary text-[12px]">
            [{[t.sections[item.kind], s.label].filter(Boolean).join(' ')}]
          </text>
        </g>
      ))}
    </g>
  )
}

function Item({ item, markers, t }: { item: SequenceItem; markers: string; t: SequenceText }) {
  switch (item.type) {
    case 'message':
      return <Message item={item} markers={markers} />
    case 'note':
      return (
        <g>
          <rect
            x={item.x}
            y={item.y}
            width={item.width}
            height={item.height}
            rx={3}
            className="fill-warning-subtle stroke-border-strong"
          />
          <Lines
            text={item.text}
            x={item.x + 10}
            y={item.y + 20 + (item.text.split('\n').length - 1) * 16}
            anchor="start"
          />
        </g>
      )
    case 'activation':
      return (
        <rect
          x={item.x - 5}
          y={item.y1}
          width={10}
          height={Math.max(8, item.y2 - item.y1)}
          className="fill-secondary stroke-border-strong"
        />
      )
    case 'block':
      return <Block item={item} t={t} />
  }
}

function Markers({ prefix }: { prefix: string }) {
  return (
    <defs>
      <marker
        id={`${prefix}-filled`}
        viewBox="0 0 10 10"
        refX={10}
        refY={5}
        markerWidth={10}
        markerHeight={10}
        markerUnits="userSpaceOnUse"
        orient="auto"
      >
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--diagram-edge)" />
      </marker>
      <marker
        id={`${prefix}-open`}
        viewBox="0 0 10 10"
        refX={10}
        refY={5}
        markerWidth={10}
        markerHeight={10}
        markerUnits="userSpaceOnUse"
        orient="auto"
      >
        <path d="M0 0 L10 5 L0 10" fill="none" stroke="var(--diagram-edge)" strokeWidth={1.25} />
      </marker>
      <marker
        id={`${prefix}-cross`}
        viewBox="0 0 10 10"
        refX={5}
        refY={5}
        markerWidth={10}
        markerHeight={10}
        markerUnits="userSpaceOnUse"
        orient="auto"
      >
        <path d="M1 1 L9 9 M9 1 L1 9" fill="none" stroke="var(--diagram-edge)" strokeWidth={1.5} />
      </marker>
    </defs>
  )
}

/** The steps in words, for screen readers. */
function StepList({
  steps,
  names,
  t,
}: {
  steps: readonly SequenceStep[]
  names: Map<string, string>
  t: SequenceText
}) {
  const name = (id: string) => names.get(id) ?? id
  return (
    <ol>
      {steps.map((step, i) => (
        // eslint-disable-next-line @eslint-react/no-array-index-key -- steps have no ids; order is meaning
        <li key={i}>
          <StepText step={step} name={name} names={names} t={t} />
        </li>
      ))}
    </ol>
  )
}

function StepText({
  step,
  name,
  names,
  t,
}: {
  step: SequenceStep
  name: (id: string) => string
  names: Map<string, string>
  t: SequenceText
}) {
  switch (step.type) {
    case 'message': {
      const kind = t.arrows[step.arrow]
      const who =
        step.from === step.to
          ? t.self(name(step.from), kind)
          : t.message(name(step.from), name(step.to), kind)
      return step.text ? `${who}: ${step.text.replace(/\n/g, ' ')}` : who
    }
    case 'note':
      return `${t.note(step.participants.map(name).join(` ${t.and} `))}: ${step.text.replace(/\n/g, ' ')}`
    case 'activation':
      return step.active ? t.activate(name(step.participant)) : t.deactivate(name(step.participant))
    case 'block':
      return (
        <>
          {t.blocks[step.kind]}
          {step.sections.map((s, i) => (
            // eslint-disable-next-line @eslint-react/no-array-index-key -- sections have no ids
            <React.Fragment key={i}>
              {(s.label || i > 0) &&
                ` [${[i > 0 ? t.sections[step.kind] : '', s.label].filter(Boolean).join(' ')}]`}
              <StepList steps={s.steps} names={names} t={t} />
            </React.Fragment>
          ))}
        </>
      )
  }
}

function SequenceDiagramView({ diagram, maxHeight, label, className }: SequenceDiagramViewProps) {
  const messages = useCoreloomI18n().messages.diagram
  const t = messages.sequence
  const markers = `seq${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const layout = layoutSequence(diagram)
  const names = new Map(layout.columns.map((c) => [c.id, c.label]))
  const actor = layout.columns.some((c) => c.kind === 'actor')
  return (
    <div
      data-slot="sequence-diagram"
      role="region"
      aria-label={label ?? messages.kinds.sequence}
      // A focusable region, so keyboard users can scroll a wide diagram.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- scrollable content must be reachable
      tabIndex={0}
      className={cn(
        'overflow-auto rounded-lg border border-border bg-background outline-none focus-visible:ring-[3px] focus-visible:ring-ring',
        className,
      )}
      style={
        { maxHeight, '--diagram-edge': 'var(--color-muted-foreground)' } as React.CSSProperties
      }
    >
      {diagram.title && (
        <p className="px-4 pt-3 text-[13px] font-semibold text-foreground">{diagram.title}</p>
      )}
      {layout.columns.length ? (
        <svg
          aria-hidden
          width={layout.width}
          height={layout.height}
          className="block"
          style={{ minWidth: layout.width }}
        >
          <Markers prefix={markers} />
          {layout.columns.map((c) => (
            <line
              key={c.id}
              x1={c.x}
              x2={c.x}
              y1={layout.top}
              y2={layout.bottom}
              strokeDasharray="4 4"
              className="stroke-border-strong"
            />
          ))}
          {layout.items.map((item, i) => (
            // eslint-disable-next-line @eslint-react/no-array-index-key -- drawn in order; no ids
            <Item key={i} item={item} markers={markers} t={t} />
          ))}
          {layout.columns.map((c) => (
            <React.Fragment key={c.id}>
              <Participant col={c} y={0} actor={actor} />
              <Participant col={c} y={layout.bottom} actor={actor} />
            </React.Fragment>
          ))}
        </svg>
      ) : (
        <p className="p-6 text-center text-[13px] text-muted-foreground">{messages.empty}</p>
      )}
      <div className="sr-only">
        <p>{t.steps}</p>
        <StepList steps={diagram.steps} names={names} t={t} />
      </div>
    </div>
  )
}

export { SequenceDiagramView, type SequenceDiagramViewProps }
