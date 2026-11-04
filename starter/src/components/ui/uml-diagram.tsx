'use client'

// Coreloom UI — UmlDiagram. Draws a software diagram from Coreloom's UML model: class, state,
// entity–relationship and C4 diagrams on a React Flow canvas (laid out automatically, zoomable,
// elements draggable when `editable`), sequence diagrams as an SVG. Feed it JSON you checked with
// `parseUmlJson`, or Mermaid text read with `parseMermaid`. Nothing is rendered as HTML.
import '@xyflow/react/dist/base.css'

import { type NodeChange, Panel, ReactFlow, ReactFlowProvider, useReactFlow } from '@xyflow/react'
import { LayoutGridIcon, MaximizeIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { SequenceDiagramView } from '@/components/ui/sequence-diagram'
import {
  type DiagramFlowEdge,
  type DiagramFlowNode,
  DiagramMarkers,
  EDGE_TYPES,
  NODE_TYPES,
  nodeLabel,
} from '@/components/ui/uml-diagram-parts'
import { type Messages, useCoreloomI18n } from '@/lib/i18n'
import type { SequenceDiagram, UmlLayout, UmlSpec } from '@/lib/uml'
import {
  type DiagramEdge,
  type DiagramGraph,
  type DiagramNode,
  toDiagramGraph,
} from '@/lib/uml-graph'
import { type LayoutBox, layoutDiagram } from '@/lib/uml-layout'
import { cn } from '@/lib/utils'

interface UmlDiagramProps {
  diagram: UmlSpec
  /** People can drag elements (and arrange them again). Default: false. */
  editable?: boolean
  /** The positions after a drag or "Arrange", to keep in the diagram's `layout`. */
  onLayoutChange?: (layout: UmlLayout) => void
  /** CSS height of the canvas; the sequence view scrolls past it. Default: 480. */
  height?: number | string
  /** Zoom, fit and arrange buttons. Default: true. */
  controls?: boolean
  /** The accessible name. Default: the diagram's kind ("Class diagram"). */
  label?: string
  className?: string
}

type DiagramText = Messages['diagram']

/** The diagrams drawn on the canvas (every kind but sequence). */
type GraphDiagram = Exclude<UmlSpec, SequenceDiagram>

/** Frames before what they hold: React Flow needs a parent before its children. */
function byDepth(nodes: readonly DiagramNode[]): DiagramNode[] {
  const parent = new Map(nodes.map((n) => [n.id, n.parent]))
  const depth = (id: string) => {
    let d = 0
    let p = parent.get(id)
    while (p && d < 50) {
      d++
      p = parent.get(p)
    }
    return d
  }
  return [...nodes].sort((a, b) => depth(a.id) - depth(b.id))
}

const NODE_TYPE = {
  box: 'box',
  rounded: 'box',
  person: 'box',
  note: 'box',
  start: 'pseudo',
  end: 'pseudo',
  choice: 'pseudo',
  bar: 'pseudo',
  frame: 'frame',
} as const

function flowNodes(input: {
  graph: DiagramGraph
  boxes: Map<string, LayoutBox>
  editable: boolean
  selected: ReadonlySet<string>
  t: DiagramText
}): DiagramFlowNode[] {
  const { graph, boxes, editable, selected, t } = input
  return byDepth(graph.nodes).map((node) => {
    const box = boxes.get(node.id) ?? { x: 0, y: 0, width: node.width, height: node.height }
    return {
      id: node.id,
      type: NODE_TYPE[node.shape],
      position: { x: box.x, y: box.y },
      width: box.width,
      height: box.height,
      style: { width: box.width, height: box.height },
      ...(node.parent && boxes.has(node.parent) ? { parentId: node.parent } : {}),
      data: { node },
      ariaLabel: nodeLabel(node, t),
      draggable: editable,
      selected: selected.has(node.id),
      className: 'rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring',
    }
  })
}

/** "Duck inherits from Animal: label, one to many" — what a line says, in words. */
function edgeLabel(edge: DiagramEdge, names: Map<string, string>, t: DiagramText): string {
  const name = (id: string) => names.get(id) ?? id
  let text = t.relations[edge.relation](name(edge.from), name(edge.to))
  if (edge.label) text = t.labelled(text, edge.label.replace(/\n/g, ' '))
  if (edge.cardinality) {
    text += `, ${t.cardinalities(t.cardinality[edge.cardinality[0]], t.cardinality[edge.cardinality[1]])}`
  }
  const ends = [edge.sourceLabel, edge.targetLabel].filter(Boolean)
  if (ends.length) text += ` (${ends.join(' – ')})`
  if (edge.technology) text += `, ${edge.technology}`
  return text
}

function flowEdges(graph: DiagramGraph, markers: string, t: DiagramText): DiagramFlowEdge[] {
  const names = new Map(graph.nodes.map((n) => [n.id, n.title || t.roles[n.role]]))
  const valid = graph.edges.filter((e) => names.has(e.source) && names.has(e.target))
  // Lines between the same two boxes fan out instead of lying on top of each other.
  const pair = (e: DiagramEdge) => [e.source, e.target].sort().join('\u0000')
  const counts = new Map<string, number>()
  for (const e of valid) counts.set(pair(e), (counts.get(pair(e)) ?? 0) + 1)
  const seen = new Map<string, number>()
  return valid.map((edge) => {
    const key = pair(edge)
    const i = seen.get(key) ?? 0
    seen.set(key, i + 1)
    const offset = (i - ((counts.get(key) ?? 1) - 1) / 2) * 16
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'uml',
      data: { edge, markers, offset, flow: graph.direction },
      ariaLabel: edgeLabel(edge, names, t),
    }
  })
}

function Controls({ editable, onArrange }: { editable: boolean; onArrange: () => void }) {
  const t = useCoreloomI18n().messages.diagram
  const flow = useReactFlow()
  const buttons = [
    { label: t.zoomIn, icon: ZoomInIcon, run: () => void flow.zoomIn() },
    { label: t.zoomOut, icon: ZoomOutIcon, run: () => void flow.zoomOut() },
    {
      label: t.fit,
      icon: MaximizeIcon,
      run: () => void flow.fitView({ padding: 0.15, maxZoom: 1 }),
    },
    ...(editable ? [{ label: t.arrange, icon: LayoutGridIcon, run: onArrange }] : []),
  ]
  return (
    <Panel position="top-right" className="!m-2 flex gap-1">
      {buttons.map(({ label, icon: Icon, run }) => (
        <Button
          key={label}
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={label}
          title={label}
          onClick={run}
          className="bg-background"
        >
          <Icon aria-hidden />
        </Button>
      ))}
    </Panel>
  )
}

/** Positions after React Flow's moves; null when nothing moved. */
function movedLayout(changes: NodeChange<DiagramFlowNode>[], current: UmlLayout): UmlLayout | null {
  let next: UmlLayout | null = null
  for (const c of changes) {
    if (c.type === 'position' && c.position) {
      next = {
        ...(next ?? current),
        [c.id]: { x: Math.round(c.position.x), y: Math.round(c.position.y) },
      }
    }
  }
  return next
}

function DiagramCanvas({
  diagram,
  editable = false,
  onLayoutChange,
  controls = true,
  label,
}: Omit<UmlDiagramProps, 'diagram'> & { diagram: GraphDiagram }) {
  const t = useCoreloomI18n().messages.diagram
  const markers = `uml${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const graph = React.useMemo(() => toDiagramGraph(diagram), [diagram])
  // Positions dragged here win over the diagram's own until it hands new ones back.
  const [dragged, setDragged] = React.useState<UmlLayout | null>(null)
  const [selected, setSelected] = React.useState<ReadonlySet<string>>(() => new Set())
  const fixed = React.useMemo(() => dragged ?? diagram.layout ?? {}, [dragged, diagram.layout])
  const boxes = React.useMemo(
    () =>
      graph
        ? layoutDiagram({
            nodes: graph.nodes,
            edges: graph.edges,
            direction: graph.direction,
            fixed,
          })
        : new Map<string, LayoutBox>(),
    [graph, fixed],
  )
  const nodes = graph ? flowNodes({ graph, boxes, editable, selected, t }) : []
  const edges = graph ? flowEdges(graph, markers, t) : []

  const flow = useReactFlow()
  const ids = nodes.map((n) => n.id).join('\u0000')
  React.useEffect(() => {
    // New or removed elements: show the whole diagram again.
    const frame = requestAnimationFrame(() => void flow.fitView({ padding: 0.15, maxZoom: 1 }))
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [ids, flow])

  const onNodesChange = (changes: NodeChange<DiagramFlowNode>[]) => {
    const next = movedLayout(changes, fixed)
    if (next) {
      setDragged(next)
      const done = changes.some((c) => c.type === 'position' && !c.dragging)
      if (done) onLayoutChange?.(next)
    }
    const picks = changes.filter((c) => c.type === 'select')
    if (picks.length) {
      setSelected((prev) => {
        const out = new Set(prev)
        for (const c of picks) {
          if (c.selected) out.add(c.id)
          else out.delete(c.id)
        }
        return out
      })
    }
  }

  const arrange = () => {
    setDragged({})
    onLayoutChange?.({})
  }

  const ariaLabelConfig = {
    'node.a11yDescription.default': editable ? t.a11y.node : t.a11y.readOnlyNode,
    'node.a11yDescription.keyboardDisabled': t.a11y.readOnlyNode,
    'node.a11yDescription.ariaLiveMessage': ({
      x,
      y,
    }: {
      direction: string
      x: number
      y: number
    }) => t.a11y.moved(Math.round(x), Math.round(y)),
    'edge.a11yDescription.default': t.a11y.edge,
    'handle.ariaLabel': t.a11y.handle,
  }

  return (
    <>
      <DiagramMarkers prefix={markers} />
      <ReactFlow<DiagramFlowNode, DiagramFlowEdge>
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        onNodesChange={onNodesChange}
        nodesDraggable={editable}
        nodesConnectable={false}
        nodesFocusable
        edgesFocusable
        elementsSelectable
        deleteKeyCode={null}
        // A selected frame must stay behind what it holds.
        elevateNodesOnSelect={false}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
        minZoom={0.15}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        ariaLabelConfig={ariaLabelConfig}
        aria-label={label ?? t.kinds[diagram.kind]}
      >
        {diagram.title && (
          <Panel position="top-left" className="!m-3 max-w-[60%]">
            <p className="truncate text-[13px] font-semibold text-foreground">{diagram.title}</p>
          </Panel>
        )}
        {controls && <Controls editable={editable} onArrange={arrange} />}
      </ReactFlow>
      {!nodes.length && (
        <p className="pointer-events-none absolute inset-0 grid place-items-center text-[13px] text-muted-foreground">
          {t.empty}
        </p>
      )}
    </>
  )
}

/** A class, state, ER or C4 diagram on a canvas, or a sequence diagram as an SVG. */
function UmlDiagram(props: UmlDiagramProps) {
  const { diagram, height = 480, className } = props
  if (diagram.kind === 'sequence') {
    return (
      <SequenceDiagramView
        diagram={diagram}
        maxHeight={height}
        {...(props.label ? { label: props.label } : {})}
        {...(className ? { className } : {})}
      />
    )
  }
  return (
    <div
      data-slot="uml-diagram"
      className={cn(
        'relative overflow-hidden rounded-lg border border-border bg-background',
        className,
      )}
      style={{ height, '--diagram-edge': 'var(--color-muted-foreground)' } as React.CSSProperties}
    >
      <ReactFlowProvider>
        <DiagramCanvas {...props} diagram={diagram} />
      </ReactFlowProvider>
    </div>
  )
}

export { UmlDiagram, type UmlDiagramProps }
