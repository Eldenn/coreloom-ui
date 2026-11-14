# @coreloom/uml-diagram

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/uml-diagram.tsx

```ts
type UmlAnnotation = {}
UmlAnnotation.element: string
UmlAnnotation.status: UmlAnnotationStatus
UmlAnnotation.count?: number | undefined
UmlAnnotation.label?: string | undefined
type UmlAnnotationStatus = 'error' | 'warning' | 'ok' | 'unknown'
function UmlDiagram
UmlDiagram.diagram: UmlSpec
UmlDiagram.editable?: boolean | undefined
UmlDiagram.onLayoutChange?: ((layout: UmlLayout) => void) | undefined
UmlDiagram.height?: string | number | undefined
UmlDiagram.controls?: boolean | undefined
UmlDiagram.preview?: boolean | undefined
UmlDiagram.label?: string | undefined
UmlDiagram.selection?: UmlSelection | undefined
UmlDiagram.onSelectionChange?: ((selection: UmlSelection) => void) | undefined
UmlDiagram.onConnect?: ((from: string, to: string) => void) | undefined
UmlDiagram.onDelete?: ((selection: UmlSelection) => void) | undefined
UmlDiagram.onRename?: ((id: string, name: string) => void) | undefined
UmlDiagram.onElementDrop?: ((type: string, position: UmlPoint) => void) | undefined
UmlDiagram.annotations?: readonly UmlAnnotation[] | undefined
UmlDiagram.onAnnotationSelect?: ((element: string) => void) | undefined
UmlDiagram.ref?: React.Ref<UmlDiagramHandle> | undefined
UmlDiagram.className?: string | undefined
type UmlDiagramHandle = {}
UmlDiagramHandle.toImage: (format: UmlImageFormat) => Promise<string>
type UmlDiagramProps = {}
UmlDiagramProps.diagram: UmlSpec
UmlDiagramProps.editable?: boolean | undefined
UmlDiagramProps.onLayoutChange?: ((layout: UmlLayout) => void) | undefined
UmlDiagramProps.height?: string | number | undefined
UmlDiagramProps.controls?: boolean | undefined
UmlDiagramProps.preview?: boolean | undefined
UmlDiagramProps.label?: string | undefined
UmlDiagramProps.selection?: UmlSelection | undefined
UmlDiagramProps.onSelectionChange?: ((selection: UmlSelection) => void) | undefined
UmlDiagramProps.onConnect?: ((from: string, to: string) => void) | undefined
UmlDiagramProps.onDelete?: ((selection: UmlSelection) => void) | undefined
UmlDiagramProps.onRename?: ((id: string, name: string) => void) | undefined
UmlDiagramProps.onElementDrop?: ((type: string, position: UmlPoint) => void) | undefined
UmlDiagramProps.annotations?: readonly UmlAnnotation[] | undefined
UmlDiagramProps.onAnnotationSelect?: ((element: string) => void) | undefined
UmlDiagramProps.ref?: React.Ref<UmlDiagramHandle> | undefined
UmlDiagramProps.className?: string | undefined
```

## src/components/ui/uml-diagram-parts.tsx

```ts
function BoxShape
BoxShape.node: DiagramNode
type DiagramFlowEdge = import(".pnpm/@xyflow+system@0.0.83/node_modules/@xyflow/system").EdgeBase<{ edge: DiagramEdge; markers: string; offset: number; flow: UmlDirection; }, 'uml'> & import("@xyflow/react").EdgeLabelOptions & { style?: import("react").CSSProperties; className?: string; reconnectable?: boolean | import("@xyflow/react").HandleType; focusable?: boolean; ariaRole?: import("react").AriaRole; domAttributes?: Omit<import("react").SVGAttributes<SVGGElement>, 'id' | 'style' | 'className' | 'role' | 'aria-label' | 'dangerouslySetInnerHTML'>; }
type DiagramFlowNode = BoxNodeType | PseudoNodeType | FrameNodeType | Node<NodeData, 'actor'> | Node<NodeData, 'ellipse'> | Node<NodeData, 'decision'> | Node<NodeData, 'lollipop'> | Node<NodeData, 'port'> | Node<NodeData, 'folder'>
function DiagramMarkers
DiagramMarkers.prefix: string
const EDGE_TYPES: {}
EDGE_TYPES.uml: ({ source, target, data, selected }: EdgeProps<DiagramFlowEdge>) => import("react").JSX.Element | null
function eyebrow(node: DiagramNode, t: DiagramText) => string | null
const NODE_TYPES: {}
NODE_TYPES.box: (props: NodeProps<BoxNodeType>) => import("react").JSX.Element
NODE_TYPES.pseudo: (props: NodeProps<PseudoNodeType>) => import("react").JSX.Element
NODE_TYPES.frame: (props: NodeProps<FrameNodeType>) => import("react").JSX.Element
NODE_TYPES.actor: (props: NodeProps<{ id: string; position: import("@xyflow/react").XYPosition; data: NodeData; sourcePosition?: Position; targetPosition?: Position; hidden?: boolean; selected?: boolean; dragging?: boolean; draggable?: boolean; selectable?: boolean; connectable?: boolean; deletable?: boolean; dragHandle?: string; width?: number; height?: number; initialWidth?: number; initialHeight?: number; parentId?: string; zIndex?: number; extent?: 'parent' | import("@xyflow/react").CoordinateExtent | null; expandParent?: boolean; ariaLabel?: string; origin?: import("@xyflow/react").NodeOrigin; handles?: import("@xyflow/react").NodeHandle[]; measured?: { width?: number; height?: number; }; } & { type: 'actor'; } & { style?: import("react").CSSProperties; className?: string; resizing?: boolean; focusable?: boolean; ariaRole?: import("react").AriaRole; domAttributes?: Omit<import("react").HTMLAttributes<HTMLDivElement>, 'id' | 'style' | 'className' | 'draggable' | 'role' | 'aria-label' | 'defaultValue' | 'dangerouslySetInnerHTML' | keyof import("react").DOMAttributes<HTMLDivElement>>; }>) => import("react").JSX.Element
NODE_TYPES.ellipse: (props: NodeProps<{ id: string; position: import("@xyflow/react").XYPosition; data: NodeData; sourcePosition?: Position; targetPosition?: Position; hidden?: boolean; selected?: boolean; dragging?: boolean; draggable?: boolean; selectable?: boolean; connectable?: boolean; deletable?: boolean; dragHandle?: string; width?: number; height?: number; initialWidth?: number; initialHeight?: number; parentId?: string; zIndex?: number; extent?: 'parent' | import("@xyflow/react").CoordinateExtent | null; expandParent?: boolean; ariaLabel?: string; origin?: import("@xyflow/react").NodeOrigin; handles?: import("@xyflow/react").NodeHandle[]; measured?: { width?: number; height?: number; }; } & { type: 'ellipse'; } & { style?: import("react").CSSProperties; className?: string; resizing?: boolean; focusable?: boolean; ariaRole?: import("react").AriaRole; domAttributes?: Omit<import("react").HTMLAttributes<HTMLDivElement>, 'id' | 'style' | 'className' | 'draggable' | 'role' | 'aria-label' | 'defaultValue' | 'dangerouslySetInnerHTML' | keyof import("react").DOMAttributes<HTMLDivElement>>; }>) => import("react").JSX.Element
NODE_TYPES.decision: (props: NodeProps<{ id: string; position: import("@xyflow/react").XYPosition; data: NodeData; sourcePosition?: Position; targetPosition?: Position; hidden?: boolean; selected?: boolean; dragging?: boolean; draggable?: boolean; selectable?: boolean; connectable?: boolean; deletable?: boolean; dragHandle?: string; width?: number; height?: number; initialWidth?: number; initialHeight?: number; parentId?: string; zIndex?: number; extent?: 'parent' | import("@xyflow/react").CoordinateExtent | null; expandParent?: boolean; ariaLabel?: string; origin?: import("@xyflow/react").NodeOrigin; handles?: import("@xyflow/react").NodeHandle[]; measured?: { width?: number; height?: number; }; } & { type: 'decision'; } & { style?: import("react").CSSProperties; className?: string; resizing?: boolean; focusable?: boolean; ariaRole?: import("react").AriaRole; domAttributes?: Omit<import("react").HTMLAttributes<HTMLDivElement>, 'id' | 'style' | 'className' | 'draggable' | 'role' | 'aria-label' | 'defaultValue' | 'dangerouslySetInnerHTML' | keyof import("react").DOMAttributes<HTMLDivElement>>; }>) => import("react").JSX.Element
NODE_TYPES.lollipop: (props: NodeProps<{ id: string; position: import("@xyflow/react").XYPosition; data: NodeData; sourcePosition?: Position; targetPosition?: Position; hidden?: boolean; selected?: boolean; dragging?: boolean; draggable?: boolean; selectable?: boolean; connectable?: boolean; deletable?: boolean; dragHandle?: string; width?: number; height?: number; initialWidth?: number; initialHeight?: number; parentId?: string; zIndex?: number; extent?: 'parent' | import("@xyflow/react").CoordinateExtent | null; expandParent?: boolean; ariaLabel?: string; origin?: import("@xyflow/react").NodeOrigin; handles?: import("@xyflow/react").NodeHandle[]; measured?: { width?: number; height?: number; }; } & { type: 'lollipop'; } & { style?: import("react").CSSProperties; className?: string; resizing?: boolean; focusable?: boolean; ariaRole?: import("react").AriaRole; domAttributes?: Omit<import("react").HTMLAttributes<HTMLDivElement>, 'id' | 'style' | 'className' | 'draggable' | 'role' | 'aria-label' | 'defaultValue' | 'dangerouslySetInnerHTML' | keyof import("react").DOMAttributes<HTMLDivElement>>; }>) => import("react").JSX.Element
NODE_TYPES.port: (props: NodeProps<{ id: string; position: import("@xyflow/react").XYPosition; data: NodeData; sourcePosition?: Position; targetPosition?: Position; hidden?: boolean; selected?: boolean; dragging?: boolean; draggable?: boolean; selectable?: boolean; connectable?: boolean; deletable?: boolean; dragHandle?: string; width?: number; height?: number; initialWidth?: number; initialHeight?: number; parentId?: string; zIndex?: number; extent?: 'parent' | import("@xyflow/react").CoordinateExtent | null; expandParent?: boolean; ariaLabel?: string; origin?: import("@xyflow/react").NodeOrigin; handles?: import("@xyflow/react").NodeHandle[]; measured?: { width?: number; height?: number; }; } & { type: 'port'; } & { style?: import("react").CSSProperties; className?: string; resizing?: boolean; focusable?: boolean; ariaRole?: import("react").AriaRole; domAttributes?: Omit<import("react").HTMLAttributes<HTMLDivElement>, 'id' | 'style' | 'className' | 'draggable' | 'role' | 'aria-label' | 'defaultValue' | 'dangerouslySetInnerHTML' | keyof import("react").DOMAttributes<HTMLDivElement>>; }>) => import("react").JSX.Element
NODE_TYPES.folder: (props: NodeProps<{ id: string; position: import("@xyflow/react").XYPosition; data: NodeData; sourcePosition?: Position; targetPosition?: Position; hidden?: boolean; selected?: boolean; dragging?: boolean; draggable?: boolean; selectable?: boolean; connectable?: boolean; deletable?: boolean; dragHandle?: string; width?: number; height?: number; initialWidth?: number; initialHeight?: number; parentId?: string; zIndex?: number; extent?: 'parent' | import("@xyflow/react").CoordinateExtent | null; expandParent?: boolean; ariaLabel?: string; origin?: import("@xyflow/react").NodeOrigin; handles?: import("@xyflow/react").NodeHandle[]; measured?: { width?: number; height?: number; }; } & { type: 'folder'; } & { style?: import("react").CSSProperties; className?: string; resizing?: boolean; focusable?: boolean; ariaRole?: import("react").AriaRole; domAttributes?: Omit<import("react").HTMLAttributes<HTMLDivElement>, 'id' | 'style' | 'className' | 'draggable' | 'role' | 'aria-label' | 'defaultValue' | 'dangerouslySetInnerHTML' | keyof import("react").DOMAttributes<HTMLDivElement>>; }>) => import("react").JSX.Element
function nodeLabel(node: DiagramNode, t: DiagramText) => string
```

## src/components/ui/uml-diagram-nodes.tsx

```ts
function ActorNode
ActorNode.*: @xyflow/system
function DecisionNode
DecisionNode.*: @xyflow/system
function EllipseNode
EllipseNode.*: @xyflow/system
function Ends
Ends.connectable?: boolean | undefined
function FolderNode
FolderNode.*: @xyflow/system
function LollipopNode
LollipopNode.*: @xyflow/system
function PortNode
PortNode.*: @xyflow/system
```

## src/components/ui/uml-diagram-markers.tsx

```ts
function DiagramMarkers
DiagramMarkers.prefix: string
```

## src/components/ui/uml-diagram-flow.ts

```ts
function flowEdges(input: { graph: DiagramGraph; markers: string; selected: ReadonlySet<number>; t: DiagramText; }) => DiagramFlowEdge[]
function flowNodes(input: { graph: DiagramGraph; boxes: Map<string, LayoutBox>; editable: boolean; connectable: boolean; selected: ReadonlySet<string>; layer?: AnnotationLayer; t: DiagramText; }) => DiagramFlowNode[]
function movedLayout(changes: NodeChange<DiagramFlowNode>[], current: UmlLayout) => UmlLayout | null
function nextSelection(current: UmlSelection, changes: (NodeChange<DiagramFlowNode> | EdgeChange<DiagramFlowEdge>)[], kind: 'elements' | 'relations') => UmlSelection | null
```

## src/components/ui/uml-diagram-tools.tsx

```ts
function AlignBar
AlignBar.count: number
AlignBar.onAlign: (how: UmlAlignment) => void
function CanvasControls
CanvasControls.editable: boolean
CanvasControls.selecting: boolean
CanvasControls.onSelecting: (on: boolean) => void
CanvasControls.onArrange: () => void
CanvasControls.fullscreen: Fullscreen | null
function dropHandlers(onDrop: ((type: string, position: UmlPoint) => void) | undefined, toFlow: (p: UmlPoint) => UmlPoint) => { onDragOver?: undefined; onDrop?: undefined; } | { onDragOver: (event: React.DragEvent) => void; onDrop: (event: React.DragEvent) => void; }
type Fullscreen = {}
Fullscreen.supported: boolean
Fullscreen.active: boolean
Fullscreen.toggle: () => void
function FullscreenButton
FullscreenButton.fullscreen: Fullscreen
FullscreenButton.className?: string | undefined
function RenameField
RenameField.target: RenameTarget
RenameField.label: string
RenameField.onDone: (value: string | null) => void
type RenameTarget = {}
RenameTarget.id: string
RenameTarget.value: string
RenameTarget.left: number
RenameTarget.top: number
RenameTarget.width: number
function useFitDiagram() => (padding?: number) => void
function useFullscreen(target: React.RefObject<HTMLElement | null>) => Fullscreen
function useRename(input: { canvas: React.RefObject<HTMLDivElement | null>; graph: DiagramGraph | null; onRename: ((id: string, name: string) => void) | undefined; diagram: UmlSpec; }) => { target: RenameTarget | null; start: (id: string) => void; done: (value: string | null) => void; onKeyDown: (event: React.KeyboardEvent) => void; }
```

## src/components/ui/uml-diagram-annotations.tsx

```ts
const ANNOTATION_RING: Record<UmlAnnotationStatus, string>
const ANNOTATION_STROKE: Record<UmlAnnotationStatus, string>
function AnnotationContext
AnnotationContext.*: react
type AnnotationLayer = {}
AnnotationLayer.marks: ReadonlyMap<string, UmlAnnotation>
AnnotationLayer.scope: AnnotationScope
AnnotationLayer.t: {}
AnnotationLayer.t.status: {}
AnnotationLayer.t.status.ok: string
AnnotationLayer.t.status.warning: string
AnnotationLayer.t.status.error: string
AnnotationLayer.t.status.unknown: string
AnnotationLayer.t.withCount: (what: string, count: number) => string
AnnotationLayer.t.show: (name: string, what: string) => string
AnnotationLayer.t.described: (label: string, what: string) => string
function annotationMap(annotations: readonly UmlAnnotation[] | undefined) => ReadonlyMap<string, UmlAnnotation>
function annotationText(annotation: UmlAnnotation, t: AnnotationText) => string
function SequenceAnnotations
SequenceAnnotations.layout: SequenceLayout
SequenceAnnotations.annotations: ReadonlyMap<string, UmlAnnotation>
SequenceAnnotations.top?: number | undefined
type UmlAnnotation = {}
UmlAnnotation.element: string
UmlAnnotation.status: UmlAnnotationStatus
UmlAnnotation.count?: number | undefined
UmlAnnotation.label?: string | undefined
type UmlAnnotationStatus = 'error' | 'warning' | 'ok' | 'unknown'
function useAnnotationLayer({ annotations, onAnnotationSelect, exporting, preview, }: { annotations: readonly UmlAnnotation[] | undefined; onAnnotationSelect: ((element: string) => void) | undefined; exporting: boolean; preview: boolean; }) => AnnotationLayer
function withAnnotation<P extends AnnotatedProps>(Shape: React.ComponentType<P>) => (props: P) => React.JSX.Element
```

## src/components/ui/sequence-diagram.tsx

```ts
function SequenceDiagramView
SequenceDiagramView.diagram: SequenceDiagram
SequenceDiagramView.maxHeight?: string | number | undefined
SequenceDiagramView.label?: string | undefined
SequenceDiagramView.selected?: readonly string[] | undefined
SequenceDiagramView.onSelect?: ((id: string | null, additive: boolean) => void) | undefined
SequenceDiagramView.annotations?: readonly UmlAnnotation[] | undefined
SequenceDiagramView.onAnnotationSelect?: ((element: string) => void) | undefined
SequenceDiagramView.fit?: boolean | undefined
SequenceDiagramView.ref?: React.Ref<HTMLDivElement> | undefined
SequenceDiagramView.className?: string | undefined
type SequenceDiagramViewProps = {}
SequenceDiagramViewProps.diagram: SequenceDiagram
SequenceDiagramViewProps.maxHeight?: string | number | undefined
SequenceDiagramViewProps.label?: string | undefined
SequenceDiagramViewProps.selected?: readonly string[] | undefined
SequenceDiagramViewProps.onSelect?: ((id: string | null, additive: boolean) => void) | undefined
SequenceDiagramViewProps.annotations?: readonly UmlAnnotation[] | undefined
SequenceDiagramViewProps.onAnnotationSelect?: ((element: string) => void) | undefined
SequenceDiagramViewProps.fit?: boolean | undefined
SequenceDiagramViewProps.ref?: React.Ref<HTMLDivElement> | undefined
SequenceDiagramViewProps.className?: string | undefined
```

## src/lib/uml-image.ts

```ts
function elementImage(node: HTMLElement, format: UmlImageFormat, area: ImageArea) => Promise<string>
type ImageArea = {}
ImageArea.width: number
ImageArea.height: number
ImageArea.style?: Partial<CSSStyleDeclaration> | undefined
type UmlImageFormat = 'svg' | 'png'
```
