'use client'

// Coreloom UI — UmlDiagram. Draws a software diagram from Coreloom's UML model: class, state,
// entity–relationship and C4 diagrams on a React Flow canvas (laid out automatically, zoomable,
// elements draggable when `editable`), sequence diagrams as an SVG. Feed it JSON you checked with
// `parseUmlJson`, or Mermaid text read with `parseMermaid`. Nothing is rendered as HTML. When
// editable it can also select an area, align the selected boxes, rename in place and take
// elements dropped from a toolbar; its `ref` turns the drawing into an SVG or PNG image.
import '@xyflow/react/dist/base.css'

import {
  type Connection,
  ConnectionMode,
  type EdgeChange,
  type NodeChange,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  ViewportPortal,
} from '@xyflow/react'
import * as React from 'react'

import { SequenceDiagramView } from '@/components/ui/sequence-diagram'
import { flowEdges, flowNodes, movedLayout, nextSelection } from '@/components/ui/uml-diagram-flow'
import {
  type DiagramFlowEdge,
  type DiagramFlowNode,
  DiagramMarkers,
  EDGE_TYPES,
  NODE_TYPES,
} from '@/components/ui/uml-diagram-parts'
import {
  AlignBar,
  CanvasControls,
  RenameField,
  type RenameTarget,
} from '@/components/ui/uml-diagram-tools'
import { type Messages, useCoreloomI18n } from '@/lib/i18n'
import type { SequenceDiagram, UmlLayout, UmlPoint, UmlSpec } from '@/lib/uml'
import { alignBoxes, type UmlAlignment } from '@/lib/uml-arrange'
import { UML_DRAG_TYPE, type UmlSelection } from '@/lib/uml-edit'
import { type DiagramGraph, toDiagramGraph } from '@/lib/uml-graph'
import { elementImage, type UmlImageFormat } from '@/lib/uml-image'
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
  /** What's selected (controlled): element ids, and relation indexes in the diagram's list. */
  selection?: UmlSelection
  onSelectionChange?: (selection: UmlSelection) => void
  /**
   * With `editable`, each element shows a dot to drag onto another one; this gets both ends, and
   * the app adds the relation to its diagram (`addRelation`).
   */
  onConnect?: (from: string, to: string) => void
  /** Delete or Backspace on the canvas, with what's selected; the app removes it (`deleteItems`). */
  onDelete?: (selection: UmlSelection) => void
  /**
   * With `editable`, F2 or a double click on an element opens a name field over it; this gets
   * the new name (the app renames it, `renameElement`).
   */
  onRename?: (id: string, name: string) => void
  /**
   * With `editable`, something dragged with the `UML_DRAG_TYPE` data (an element type) and
   * dropped on the canvas; gets the type and where it was dropped, in diagram coordinates.
   */
  onElementDrop?: (type: string, position: UmlPoint) => void
  /** `toImage` draws the diagram as it shows now into an SVG or PNG data URL. */
  ref?: React.Ref<UmlDiagramHandle>
  className?: string
}

interface UmlDiagramHandle {
  toImage: (format: UmlImageFormat) => Promise<string>
}

const NOTHING: UmlSelection = { elements: [], relations: [] }

/** The diagrams drawn on the canvas (every kind but sequence). */
type GraphDiagram = Exclude<UmlSpec, SequenceDiagram>

/** The selection, controlled or not; both of React Flow's change streams update it in turn. */
function useSelection(
  controlled: UmlSelection | undefined,
  onChange: ((selection: UmlSelection) => void) | undefined,
) {
  const [own, setOwn] = React.useState<UmlSelection>(NOTHING)
  const current = controlled ?? own
  // Node and edge changes for one click arrive one after the other, before a render.
  const latest = React.useRef(current)
  React.useEffect(() => {
    latest.current = current
  }, [current])
  const update = (next: UmlSelection | null) => {
    if (!next) return
    latest.current = next
    setOwn(next)
    onChange?.(next)
  }
  return { selection: current, latest, update }
}

/** Resolves after two frames: React Flow has drawn what the last render changed. */
function nextFrames(): Promise<void> {
  return new Promise((done) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        done()
      })
    })
  })
}

/** Space around the boxes in an exported image. */
const IMAGE_PAD = 24

/** The canvas's boxes and lines as an image, framed to fit them at their real size. */
function canvasImage(
  root: HTMLElement | null,
  b: { x: number; y: number; width: number; height: number },
  format: UmlImageFormat,
): Promise<string> {
  const viewport = root?.querySelector<HTMLElement>('.react-flow__viewport')
  if (!viewport) return Promise.reject(new Error('Nothing drawn yet'))
  return elementImage(viewport, format, {
    width: b.width + 2 * IMAGE_PAD,
    height: b.height + 2 * IMAGE_PAD,
    style: {
      width: `${String(b.width + 2 * IMAGE_PAD)}px`,
      height: `${String(b.height + 2 * IMAGE_PAD)}px`,
      transform: `translate(${String(IMAGE_PAD - b.x)}px, ${String(IMAGE_PAD - b.y)}px) scale(1)`,
    },
  })
}

/** The boxes to align: the selected ones that share the first one's frame. */
function alignable(
  ids: readonly string[],
  boxes: Map<string, LayoutBox>,
  graph: DiagramGraph | null,
) {
  const parentOf = new Map(graph?.nodes.map((n) => [n.id, n.parent]) ?? [])
  const first = ids.find((id) => boxes.has(id))
  if (first === undefined) return []
  const frame = parentOf.get(first)
  return ids.flatMap((id) => {
    const box = boxes.get(id)
    return box && parentOf.get(id) === frame ? [{ id, ...box }] : []
  })
}

function dropHandlers(
  onDrop: ((type: string, position: UmlPoint) => void) | undefined,
  toFlow: (p: UmlPoint) => UmlPoint,
) {
  if (!onDrop) return {}
  return {
    onDragOver: (event: React.DragEvent) => {
      if (!event.dataTransfer.types.includes(UML_DRAG_TYPE)) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
    },
    onDrop: (event: React.DragEvent) => {
      const type = event.dataTransfer.getData(UML_DRAG_TYPE)
      if (!type) return
      event.preventDefault()
      const p = toFlow({ x: event.clientX, y: event.clientY })
      onDrop(type, { x: Math.round(p.x), y: Math.round(p.y) })
    },
  }
}

/** Renaming in place: which element, where its field goes, and putting focus back after. */
function useRename(input: {
  canvas: React.RefObject<HTMLDivElement | null>
  graph: DiagramGraph | null
  onRename: ((id: string, name: string) => void) | undefined
  diagram: GraphDiagram
}) {
  const { canvas, graph, onRename, diagram } = input
  const [target, setTarget] = React.useState<RenameTarget | null>(null)
  const refocus = React.useRef(false)
  const nodeEl = (id: string) =>
    canvas.current?.querySelector<HTMLElement>(`.react-flow__node[data-id="${CSS.escape(id)}"]`)

  React.useEffect(() => {
    // The renamed element may have a new id: focus what's selected once React Flow drew it.
    if (!refocus.current) return
    refocus.current = false
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        const el = canvas.current?.querySelector<HTMLElement>('.react-flow__node.selected')
        ;(el ?? canvas.current)?.focus()
      })
    })
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [diagram, canvas])

  const start = (id: string) => {
    const node = graph?.nodes.find((n) => n.id === id)
    const el = nodeEl(id)
    const host = canvas.current?.getBoundingClientRect()
    if (!onRename || !node || !el || !host) return
    const r = el.getBoundingClientRect()
    const value = node.title ? node.title : (node.body ?? '')
    setTarget({
      id,
      value,
      left: r.left - host.left,
      top: r.top - host.top,
      width: Math.max(160, r.width),
    })
  }

  const done = (value: string | null) => {
    if (!target) return
    setTarget(null)
    const next = value?.trim()
    if (next && next !== target.value) {
      refocus.current = true
      onRename?.(target.id, next)
    } else nodeEl(target.id)?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'F2' || !(event.target instanceof Element)) return
    const id = event.target.closest('.react-flow__node')?.getAttribute('data-id')
    if (!id) return
    event.preventDefault()
    start(id)
  }

  return { target, start, done, onKeyDown }
}

/** Positions: those dragged here win over the diagram's own until it hands new ones back. */
function usePositions(layout: UmlLayout | undefined, graph: DiagramGraph | null) {
  const [dragged, setDragged] = React.useState<UmlLayout | null>(null)
  // New positions from the app (an undo, say) replace the ones dragged here.
  const handed = JSON.stringify(layout ?? null)
  const [seen, setSeen] = React.useState(handed)
  if (seen !== handed) {
    setSeen(handed)
    setDragged(null)
  }
  const fixed = React.useMemo(() => dragged ?? layout ?? {}, [dragged, layout])
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
  return { fixed, boxes, setDragged }
}

/** The image handle, and fitting the view again when elements come or go. */
function useCanvasEffects({
  ref,
  canvas,
  setExporting,
  ids,
}: {
  ref: React.Ref<UmlDiagramHandle> | undefined
  canvas: React.RefObject<HTMLDivElement | null>
  /** True while an image is made, so the selection isn't in it. */
  setExporting: (on: boolean) => void
  /** The node ids, joined: a change means elements were added or removed. */
  ids: string
}) {
  const flow = useReactFlow()
  React.useImperativeHandle(ref, () => ({
    toImage: async (format) => {
      setExporting(true)
      try {
        await nextFrames()
        return await canvasImage(canvas.current, flow.getNodesBounds(flow.getNodes()), format)
      } finally {
        setExporting(false)
      }
    },
  }))
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => void flow.fitView({ padding: 0.15, maxZoom: 1 }))
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [ids, flow])
}

/** What React Flow's own live region and descriptions say, in the reader's language. */
function a11yConfig(t: Messages['diagram'], editable: boolean, renamable: boolean) {
  return {
    'node.a11yDescription.default': editable
      ? [t.a11y.node, renamable ? t.renameHint : ''].filter(Boolean).join(' ')
      : t.a11y.readOnlyNode,
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
}

/** The title, the canvas buttons, and the align bar while several boxes are selected. */
function CanvasPanels({
  title,
  controls,
  editable,
  selecting,
  onSelecting,
  onArrange,
  aligning,
  onAlign,
}: {
  title: string | undefined
  controls: boolean
  editable: boolean
  selecting: boolean
  onSelecting: (on: boolean) => void
  onArrange: () => void
  /** How many selected boxes can be aligned. */
  aligning: number
  onAlign: (how: UmlAlignment) => void
}) {
  return (
    <>
      {title && (
        <Panel position="top-left" className="!m-3 max-w-[60%]">
          <p className="truncate text-[13px] font-semibold text-foreground">{title}</p>
        </Panel>
      )}
      {controls && (
        <CanvasControls
          editable={editable}
          selecting={selecting}
          onSelecting={onSelecting}
          onArrange={onArrange}
        />
      )}
      {aligning > 1 && <AlignBar count={aligning} onAlign={onAlign} />}
    </>
  )
}

/** React Flow's changes, read back: positions, the selection, new lines, deletions. */
function useCanvasChanges(input: {
  fixed: UmlLayout
  setDragged: (layout: UmlLayout) => void
  controlled: UmlSelection | undefined
  onSelectionChange: ((selection: UmlSelection) => void) | undefined
  canvas: React.RefObject<HTMLDivElement | null>
  onLayoutChange: ((layout: UmlLayout) => void) | undefined
  onConnect: ((from: string, to: string) => void) | undefined
  onDelete: ((selection: UmlSelection) => void) | undefined
}) {
  const { fixed, setDragged, canvas, onLayoutChange, onConnect, onDelete } = input
  // `latest`: the selection as of the last change (two change streams arrive between renders).
  const {
    selection: current,
    latest: selection,
    update,
  } = useSelection(input.controlled, input.onSelectionChange)
  return {
    selection: current,
    moveTo: (next: UmlLayout) => {
      setDragged(next)
      onLayoutChange?.(next)
    },
    onNodesChange: (changes: NodeChange<DiagramFlowNode>[]) => {
      const next = movedLayout(changes, fixed)
      if (next) {
        setDragged(next)
        const done = changes.some((c) => c.type === 'position' && !c.dragging)
        if (done) onLayoutChange?.(next)
      }
      update(nextSelection(selection.current, changes, 'elements'))
    },
    onEdgesChange: (changes: EdgeChange<DiagramFlowEdge>[]) => {
      update(nextSelection(selection.current, changes, 'relations'))
    },
    connect: (c: Connection) => {
      if (c.source && c.target) onConnect?.(c.source, c.target)
    },
    remove: () => {
      const now = selection.current
      if (now.elements.length || now.relations.length) {
        onDelete?.(now)
        // The focused element is about to go: keep focus on the canvas, not the page.
        requestAnimationFrame(() => {
          if (!canvas.current?.contains(document.activeElement)) canvas.current?.focus()
        })
      }
      // React Flow's own deletion is off: the diagram changes when the app hands a new one back.
      return Promise.resolve(false)
    },
  }
}

/** What the rename field is about, in words ("Class Order"). */
function DiagramCanvas({
  diagram,
  editable = false,
  onLayoutChange,
  controls = true,
  label,
  selection: selectionProp,
  onSelectionChange,
  onConnect,
  onDelete,
  onRename,
  onElementDrop,
  ref,
}: Omit<UmlDiagramProps, 'diagram'> & { diagram: GraphDiagram }) {
  const t = useCoreloomI18n().messages.diagram
  const markers = `uml${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const graph = React.useMemo(() => toDiagramGraph(diagram), [diagram])
  const [selecting, setSelecting] = React.useState(false)
  const canvas = React.useRef<HTMLDivElement>(null)
  const { fixed, boxes, setDragged } = usePositions(diagram.layout, graph)
  const change = useCanvasChanges({
    fixed,
    setDragged,
    controlled: selectionProp,
    onSelectionChange,
    canvas,
    onLayoutChange,
    onConnect,
    onDelete,
  })
  const { selection } = change
  const connectable = editable && Boolean(onConnect)
  // While an image is made, nothing is drawn as selected.
  const [exporting, setExporting] = React.useState(false)
  const shown = exporting ? NOTHING : selection
  const selected = new Set(shown.elements)
  const nodes = graph ? flowNodes({ graph, boxes, editable, connectable, selected, t }) : []
  const pickedLines = new Set(shown.relations)
  const edges = graph ? flowEdges({ graph, markers, selected: pickedLines, t }) : []

  const flow = useReactFlow()
  const rename = useRename({ canvas, graph, onRename: editable ? onRename : undefined, diagram })
  useCanvasEffects({ ref, canvas, setExporting, ids: nodes.map((n) => n.id).join('\u0000') })

  const toAlign = editable ? alignable(selection.elements, boxes, graph) : []
  const align = (how: UmlAlignment) => {
    change.moveTo({ ...fixed, ...alignBoxes(toAlign, how) })
  }

  const ariaLabelConfig = a11yConfig(t, editable, Boolean(onRename))

  return (
    <>
      <ReactFlow<DiagramFlowNode, DiagramFlowEdge>
        ref={canvas}
        tabIndex={-1}
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        onNodesChange={change.onNodesChange}
        onEdgesChange={change.onEdgesChange}
        onConnect={change.connect}
        onBeforeDelete={change.remove}
        onNodeDoubleClick={(_, node) => {
          rename.start(node.id)
        }}
        onKeyDown={rename.onKeyDown}
        {...(editable ? dropHandlers(onElementDrop, flow.screenToFlowPosition) : {})}
        nodesDraggable={editable}
        nodesConnectable={connectable}
        connectionMode={ConnectionMode.Loose}
        nodesFocusable
        edgesFocusable
        elementsSelectable
        selectionOnDrag={selecting}
        panOnDrag={!selecting}
        zoomOnDoubleClick={!(editable && onRename)}
        deleteKeyCode={onDelete ? ['Delete', 'Backspace'] : null}
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
        <ViewportPortal>
          {/* Inside the viewport, so an exported image keeps the arrowheads. */}
          <DiagramMarkers prefix={markers} />
        </ViewportPortal>
        <CanvasPanels
          title={diagram.title}
          controls={controls}
          editable={editable}
          selecting={selecting}
          onSelecting={setSelecting}
          onArrange={() => {
            change.moveTo({})
          }}
          aligning={toAlign.length}
          onAlign={align}
        />
      </ReactFlow>
      {rename.target && (
        <RenameField
          key={rename.target.id}
          target={rename.target}
          label={t.rename(rename.target.value)}
          onDone={rename.done}
        />
      )}
      {!nodes.length && (
        <p className="pointer-events-none absolute inset-0 grid place-items-center text-[13px] text-muted-foreground">
          {t.empty}
        </p>
      )}
    </>
  )
}

/** A sequence diagram, with the same `ref` as the canvas: its SVG as an image. */
function SequencePane({
  diagram,
  height,
  label,
  className,
  selection,
  onSelectionChange,
  ref,
}: UmlDiagramProps & { diagram: SequenceDiagram }) {
  const root = React.useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = React.useState(false)
  React.useImperativeHandle(ref, () => ({
    toImage: async (format) => {
      const el = root.current
      if (!el) throw new Error('Nothing drawn yet')
      setExporting(true)
      try {
        await nextFrames()
        return await elementImage(el, format, {
          width: el.scrollWidth,
          height: el.scrollHeight,
          style: { maxHeight: 'none', overflow: 'visible', border: 'none', borderRadius: '0' },
        })
      } finally {
        setExporting(false)
      }
    },
  }))
  const select = onSelectionChange
    ? (id: string | null, additive: boolean) => {
        const now = selection?.elements ?? []
        let elements: string[] = id ? [id] : []
        if (id && additive) elements = now.includes(id) ? now.filter((x) => x !== id) : [...now, id]
        onSelectionChange({ elements, relations: [] })
      }
    : undefined
  return (
    <SequenceDiagramView
      ref={root}
      diagram={diagram}
      {...(height === undefined ? {} : { maxHeight: height })}
      {...(label ? { label } : {})}
      {...(className ? { className } : {})}
      {...(selection && !exporting ? { selected: selection.elements } : {})}
      {...(select ? { onSelect: select } : {})}
    />
  )
}

/** A class, state, ER or C4 diagram on a canvas, or a sequence diagram as an SVG. */
function UmlDiagram(props: UmlDiagramProps) {
  const { diagram, height = 480, className } = props
  if (diagram.kind === 'sequence')
    return <SequencePane {...props} diagram={diagram} height={height} />
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

export { UmlDiagram, type UmlDiagramHandle, type UmlDiagramProps }
