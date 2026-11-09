# @coreloom/diagram-editor

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/diagram-editor.tsx

```ts
function canWrite(kind: UmlDiagramKind, format: DiagramFormat) => boolean
const DIAGRAM_TEMPLATES: readonly { kind: UmlDiagramKind; text: string; }[]
function DiagramEditor
DiagramEditor.value?: string | undefined
DiagramEditor.defaultValue?: string | undefined
DiagramEditor.onValueChange?: ((text: string) => void) | undefined
DiagramEditor.onChange?: ((text: string) => void) | undefined // deprecated
DiagramEditor.format?: DiagramFormat | undefined
DiagramEditor.defaultFormat?: DiagramFormat | undefined
DiagramEditor.onFormatChange?: ((format: DiagramFormat) => void) | undefined
DiagramEditor.onDiagramChange?: ((result: UmlParseResult) => void) | undefined
DiagramEditor.templates?: readonly { kind: UmlDiagramKind; label?: string; text: string; }[] | undefined
DiagramEditor.height?: string | undefined
DiagramEditor.fileName?: string | undefined
DiagramEditor.autoFocus?: boolean | undefined
DiagramEditor.view?: DiagramEditorView | undefined
DiagramEditor.defaultView?: DiagramEditorView | undefined
DiagramEditor.onViewChange?: ((view: DiagramEditorView) => void) | undefined
DiagramEditor.actions?: React.ReactNode
DiagramEditor.readOnly?: boolean | undefined
DiagramEditor.className?: string | undefined
type DiagramEditorProps = {}
DiagramEditorProps.value?: string | undefined
DiagramEditorProps.defaultValue?: string | undefined
DiagramEditorProps.onValueChange?: ((text: string) => void) | undefined
DiagramEditorProps.onChange?: ((text: string) => void) | undefined // deprecated
DiagramEditorProps.format?: DiagramFormat | undefined
DiagramEditorProps.defaultFormat?: DiagramFormat | undefined
DiagramEditorProps.onFormatChange?: ((format: DiagramFormat) => void) | undefined
DiagramEditorProps.onDiagramChange?: ((result: UmlParseResult) => void) | undefined
DiagramEditorProps.templates?: readonly { kind: UmlDiagramKind; label?: string; text: string; }[] | undefined
DiagramEditorProps.height?: string | undefined
DiagramEditorProps.fileName?: string | undefined
DiagramEditorProps.autoFocus?: boolean | undefined
DiagramEditorProps.view?: DiagramEditorView | undefined
DiagramEditorProps.defaultView?: DiagramEditorView | undefined
DiagramEditorProps.onViewChange?: ((view: DiagramEditorView) => void) | undefined
DiagramEditorProps.actions?: React.ReactNode
DiagramEditorProps.readOnly?: boolean | undefined
DiagramEditorProps.className?: string | undefined
type DiagramEditorView = 'text' | 'split' | 'drawing'
type DiagramFormat = 'json' | 'mermaid' | 'plantuml'
function parseDiagram(text: string, format: DiagramFormat) => UmlParseResult
function writeDiagram(diagram: UmlSpec, format: DiagramFormat) => string
```

## src/components/diagram-file-tools.tsx

```ts
function canWrite(kind: UmlDiagramKind, format: DiagramFormat) => boolean
type DiagramEditorView = 'text' | 'split' | 'drawing'
type DiagramFormat = 'json' | 'mermaid' | 'plantuml'
const EXTENSIONS: Record<DiagramFormat, string>
function FileTools
FileTools.t: {}
FileTools.t.label: string
FileTools.t.source: string
FileTools.t.preview: string
FileTools.t.fileTools: string
FileTools.t.view: string
FileTools.t.views: {}
FileTools.t.views.split: string
FileTools.t.views.drawing: string
FileTools.t.views.text: string
FileTools.t.readOnly: string
FileTools.t.format: string
FileTools.t.newDiagram: string
FileTools.t.importFile: string
FileTools.t.imported: (name: string) => string
FileTools.t.importFailed: (name: string) => string
FileTools.t.importTooLarge: (name: string) => string
FileTools.t.copy: string
FileTools.t.copied: string
FileTools.t.download: string
FileTools.t.downloadText: (ext: string) => string
FileTools.t.downloadSvg: string
FileTools.t.downloadPng: string
FileTools.t.imageFailed: string
FileTools.t.problems: (n: number) => string
FileTools.t.line: (n: number) => string
FileTools.t.status: (kind: string, elements: number) => string
FileTools.t.problem: {}
FileTools.t.problem.empty: string
FileTools.t.problem.header: string
FileTools.t.problem.syntax: string
FileTools.t.problem.unclosed: string
FileTools.t.problem.unexpected: string
FileTools.t.problem.unsupported: string
FileTools.t.problem.json: string
FileTools.t.problem.schema: string
FileTools.format: DiagramFormat
FileTools.onFormat: (f: DiagramFormat) => void
FileTools.onTemplate: (text: string) => void
FileTools.onImport: (file: File) => void
FileTools.onCopy: () => void
FileTools.copied: boolean
FileTools.onDownload: (what: DiagramFormat | UmlImageFormat) => void
FileTools.drawn: boolean
FileTools.templates: readonly { kind: UmlDiagramKind; label?: string; text: string; }[]
FileTools.status: string
FileTools.kinds: {}
FileTools.kinds.class: string
FileTools.kinds.sequence: string
FileTools.kinds.state: string
FileTools.kinds.er: string
FileTools.kinds.c4: string
FileTools.kinds.usecase: string
FileTools.kinds.activity: string
FileTools.kinds.deployment: string
FileTools.kinds.component: string
FileTools.kinds.package: string
FileTools.kind: 'component' | 'package' | 'class' | 'usecase' | 'state' | 'activity' | 'deployment' | 'sequence' | 'er' | 'c4' | null
FileTools.readOnly: boolean
FileTools.view: DiagramEditorView
FileTools.onView: (view: DiagramEditorView) => void
FileTools.actions: React.ReactNode
function ProblemList
ProblemList.problems: readonly UmlProblem[]
ProblemList.t: {}
ProblemList.t.label: string
ProblemList.t.source: string
ProblemList.t.preview: string
ProblemList.t.fileTools: string
ProblemList.t.view: string
ProblemList.t.views: {}
ProblemList.t.views.split: string
ProblemList.t.views.drawing: string
ProblemList.t.views.text: string
ProblemList.t.readOnly: string
ProblemList.t.format: string
ProblemList.t.newDiagram: string
ProblemList.t.importFile: string
ProblemList.t.imported: (name: string) => string
ProblemList.t.importFailed: (name: string) => string
ProblemList.t.importTooLarge: (name: string) => string
ProblemList.t.copy: string
ProblemList.t.copied: string
ProblemList.t.download: string
ProblemList.t.downloadText: (ext: string) => string
ProblemList.t.downloadSvg: string
ProblemList.t.downloadPng: string
ProblemList.t.imageFailed: string
ProblemList.t.problems: (n: number) => string
ProblemList.t.line: (n: number) => string
ProblemList.t.status: (kind: string, elements: number) => string
ProblemList.t.problem: {}
ProblemList.t.problem.empty: string
ProblemList.t.problem.header: string
ProblemList.t.problem.syntax: string
ProblemList.t.problem.unclosed: string
ProblemList.t.problem.unexpected: string
ProblemList.t.problem.unsupported: string
ProblemList.t.problem.json: string
ProblemList.t.problem.schema: string
```

## src/components/diagram-import.ts

```ts
const DIAGRAM_FILE_ACCEPT: '.mmd,.mermaid,.puml,.plantuml,.pu,.iuml,.wsd,.json,.txt,text/plain,application/json'
type DiagramFileRead = { status: 'read'; name: string; title: string; text: string; format: DiagramFormat; } | { status: 'error'; name: string; error: 'tooLarge' | 'unreadable'; }
function formatOfFile(name: string, text: string, fallback: DiagramFormat) => DiagramFormat
function importError(read: DiagramFileRead, t: Messages['diagramEditor']) => string | null
const MAX_DIAGRAM_FILE_BYTES: 1000000
function readDiagramFile(file: File, fallback: DiagramFormat) => Promise<DiagramFileRead>
function sniffFormat(text: string) => DiagramFormat | null
function titleOfFile(name: string) => string
function useFileDrop({ enabled, onFiles }: { enabled: boolean; onFiles: (files: File[]) => void; }) => { dragging: boolean; handlers: { onDragEnterCapture: (event: React.DragEvent) => void; onDragOverCapture: (event: React.DragEvent) => void; onDragLeaveCapture: (event: React.DragEvent) => void; onDropCapture: (event: React.DragEvent) => void; }; }
function useFileImport({ format, onRead, t, }: { format: DiagramFormat; onRead: (read: Extract<DiagramFileRead, { status: 'read'; }>) => void; t: Messages['diagramEditor']; }) => { importFile: (file: File) => void; notice: string | null; clear: () => void; }
```

## src/components/diagram-tools.tsx

```ts
function DiagramTools
DiagramTools.diagram: UmlSpec | null
DiagramTools.locked: boolean
DiagramTools.readOnly?: boolean | undefined
DiagramTools.selected: readonly string[]
DiagramTools.canDelete: boolean
DiagramTools.canCopy: boolean
DiagramTools.canPaste: boolean
DiagramTools.canUndo: boolean
DiagramTools.canRedo: boolean
DiagramTools.direction: UmlDirection | null
DiagramTools.directions?: readonly UmlDirection[] | undefined
DiagramTools.types?: readonly UmlElementType[] | undefined
DiagramTools.onAdd: (type: UmlElementType) => void
DiagramTools.onConnect: (input: AddRelationInput) => void
DiagramTools.onDelete: () => void
DiagramTools.onCopy: () => void
DiagramTools.onPaste: () => void
DiagramTools.onDuplicate: () => void
DiagramTools.onArrange: () => void
DiagramTools.onDirection: (direction: UmlDirection) => void
DiagramTools.onUndo: () => void
DiagramTools.onRedo: () => void
type DiagramToolsProps = {}
DiagramToolsProps.diagram: UmlSpec | null
DiagramToolsProps.locked: boolean
DiagramToolsProps.readOnly?: boolean | undefined
DiagramToolsProps.selected: readonly string[]
DiagramToolsProps.canDelete: boolean
DiagramToolsProps.canCopy: boolean
DiagramToolsProps.canPaste: boolean
DiagramToolsProps.canUndo: boolean
DiagramToolsProps.canRedo: boolean
DiagramToolsProps.direction: UmlDirection | null
DiagramToolsProps.directions?: readonly UmlDirection[] | undefined
DiagramToolsProps.types?: readonly UmlElementType[] | undefined
DiagramToolsProps.onAdd: (type: UmlElementType) => void
DiagramToolsProps.onConnect: (input: AddRelationInput) => void
DiagramToolsProps.onDelete: () => void
DiagramToolsProps.onCopy: () => void
DiagramToolsProps.onPaste: () => void
DiagramToolsProps.onDuplicate: () => void
DiagramToolsProps.onArrange: () => void
DiagramToolsProps.onDirection: (direction: UmlDirection) => void
DiagramToolsProps.onUndo: () => void
DiagramToolsProps.onRedo: () => void
```

## src/components/diagram-properties.tsx

```ts
function DiagramProperties
DiagramProperties.diagram: UmlSpec
DiagramProperties.selection: {}
DiagramProperties.selection.elements: readonly string[]
DiagramProperties.selection.relations: readonly number[]
DiagramProperties.locked: boolean
DiagramProperties.onElementChange: (id: string, fields: UmlElementFields) => void
DiagramProperties.onRelationChange: (index: number, fields: UmlRelationFields) => void
DiagramProperties.onReverse: (index: number) => void
DiagramProperties.steps?: Pick<StepFormProps, 'onChange' | 'onMove' | 'onAddSection' | 'onRemoveSection'> | undefined
DiagramProperties.nameRef?: React.Ref<NameField> | undefined
DiagramProperties.className?: string | undefined
type DiagramPropertiesProps = {}
DiagramPropertiesProps.diagram: UmlSpec
DiagramPropertiesProps.selection: {}
DiagramPropertiesProps.selection.elements: readonly string[]
DiagramPropertiesProps.selection.relations: readonly number[]
DiagramPropertiesProps.locked: boolean
DiagramPropertiesProps.onElementChange: (id: string, fields: UmlElementFields) => void
DiagramPropertiesProps.onRelationChange: (index: number, fields: UmlRelationFields) => void
DiagramPropertiesProps.onReverse: (index: number) => void
DiagramPropertiesProps.steps?: Pick<StepFormProps, 'onChange' | 'onMove' | 'onAddSection' | 'onRemoveSection'> | undefined
DiagramPropertiesProps.nameRef?: React.Ref<NameField> | undefined
DiagramPropertiesProps.className?: string | undefined
```

## src/components/diagram-drawing.tsx

```ts
function Drawing
Drawing.diagram: UmlSpec | null
Drawing.label: string
Drawing.locked: boolean
Drawing.readOnly: boolean
Drawing.editing: {}
Drawing.editing.reset: () => void
Drawing.editing.direction: UmlDirection | null
Drawing.editing.move: (layout: UmlLayout) => void
Drawing.editing.arrange: () => void
Drawing.editing.turn: (direction: UmlDirection) => void
Drawing.editing.canCopy: boolean
Drawing.editing.canPaste: boolean
Drawing.editing.copy: () => boolean
Drawing.editing.cut: () => void
Drawing.editing.paste: () => void
Drawing.editing.duplicate: () => void
Drawing.editing.changeStep: (id: string, step: import("@/lib/uml").SequenceStep) => void
Drawing.editing.moveStep: (id: string, delta: -1 | 1) => void
Drawing.editing.addSection: (id: string) => void
Drawing.editing.removeSection: (id: string, index: number) => void
Drawing.editing.connect: (input: import("@/lib/uml-edit").AddRelationInput) => void
Drawing.editing.connectDragged: (from: string, to: string) => void
Drawing.editing.remove: (what?: import("@/lib/uml-edit").UmlSelection) => void
Drawing.editing.changeElement: (id: string, fields: import("../lib/uml-edit-fields").UmlElementFields) => void
Drawing.editing.rename: (id: string, name: string) => void
Drawing.editing.changeRelation: (index: number, fields: import("../lib/uml-edit-fields").UmlRelationFields) => void
Drawing.editing.reverse: (index: number) => void
Drawing.editing.selection: import("@/lib/uml-edit").UmlSelection
Drawing.editing.select: React.Dispatch<React.SetStateAction<import("@/lib/uml-edit").UmlSelection>>
Drawing.editing.notice: string | null
Drawing.editing.nameRef: React.RefObject<import("./diagram-fields").NameField | null>
Drawing.editing.stepButtons: React.RefObject<Map<string, HTMLButtonElement>>
Drawing.editing.canUndo: boolean
Drawing.editing.canRedo: boolean
Drawing.editing.canDelete: boolean
Drawing.editing.undo: () => void
Drawing.editing.redo: () => void
Drawing.editing.add: (type: UmlElementType, at?: import("@/lib/uml").UmlPoint) => void
Drawing.onLayoutChange: (layout: UmlLayout) => void
Drawing.directions: readonly UmlDirection[]
Drawing.notes?: boolean | undefined
Drawing.imageRef: React.Ref<UmlDiagramHandle>
```

## src/components/diagram-commands.ts

```ts
function clipboardCommands({ diagram, selection, apply, t }: CommandInput, clip: UmlClip | null, setClip: (clip: UmlClip) => void, say: (message: string) => void) => { canCopy: boolean; canPaste: boolean; copy: () => boolean; cut: () => void; paste: () => void; duplicate: () => void; }
function editCommands({ diagram, selection, apply, t }: CommandInput, lastType: UmlRelationType | null, setLastType: (type: UmlRelationType) => void) => { connect: (input: AddRelationInput) => void; connectDragged: (from: string, to: string) => void; remove: (what?: UmlSelection) => void; changeElement: (id: string, fields: UmlElementFields) => void; rename: (id: string, name: string) => void; changeRelation: (index: number, fields: UmlRelationFields) => void; reverse: (index: number) => void; }
function layoutCommands({ diagram, selection, apply, t }: CommandInput) => { direction: UmlDirection | null; move: (layout: UmlLayout) => void; arrange: () => void; turn: (direction: UmlDirection) => void; }
function relationCount(d: UmlSpec) => number
function stepCommands({ diagram, selection, apply, t }: CommandInput) => { changeStep: (id: string, step: SequenceStep) => void; moveStep: (id: string, delta: -1 | 1) => void; addSection: (id: string) => void; removeSection: (id: string, index: number) => void; }
```

## src/components/diagram-fields.tsx

```ts
function Choice
Choice.label: string
Choice.value: T
Choice.options: readonly { value: T; label: string; }[]
Choice.disabled: boolean
Choice.onValueChange: (value: T) => void
type NameField = HTMLInputElement | HTMLTextAreaElement
function TextField
TextField.label: string
TextField.value: string
TextField.hint?: string | undefined
TextField.multiline?: boolean | undefined
TextField.mono?: boolean | undefined
TextField.disabled: boolean
TextField.onValueChange: (value: string) => void
TextField.onCommit: () => void
TextField.inputRef?: React.Ref<NameField> | undefined
function useDrafts<T extends object>(key: string) => { drafts: Partial<T>; set: <K extends keyof T>(k: K, value: T[K]) => void; take: () => Partial<T>; }
```

## src/components/diagram-members.tsx

```ts
function MemberList
MemberList.members: readonly ClassMember[]
MemberList.disabled: boolean
MemberList.onValueChange: (members: ClassMember[]) => void
MemberList.p: PropertiesText
```

## src/components/diagram-sequence.tsx

```ts
function SequenceOutline
SequenceOutline.diagram: SequenceDiagram
SequenceOutline.selected: readonly string[]
SequenceOutline.onSelect: (ids: string[]) => void
SequenceOutline.buttons: React.RefObject<Map<string, HTMLButtonElement>>
SequenceOutline.t: {}
SequenceOutline.t.label: string
SequenceOutline.t.add: string
SequenceOutline.t.connect: string
SequenceOutline.t.delete: string
SequenceOutline.t.undo: string
SequenceOutline.t.redo: string
SequenceOutline.t.copy: string
SequenceOutline.t.paste: string
SequenceOutline.t.duplicate: string
SequenceOutline.t.layout: string
SequenceOutline.t.arrange: string
SequenceOutline.t.flow: string
SequenceOutline.t.directions: {}
SequenceOutline.t.directions.TB: string
SequenceOutline.t.directions.LR: string
SequenceOutline.t.directions.BT: string
SequenceOutline.t.directions.RL: string
SequenceOutline.t.dragHint: (what: string) => string
SequenceOutline.t.copied: (n: number) => string
SequenceOutline.t.pasted: (n: number) => string
SequenceOutline.t.moved: string
SequenceOutline.t.arranged: string
SequenceOutline.t.steps: {}
SequenceOutline.t.steps.label: string
SequenceOutline.t.steps.participants: string
SequenceOutline.t.steps.empty: string
SequenceOutline.t.steps.text: string
SequenceOutline.t.steps.arrow: string
SequenceOutline.t.steps.activateTarget: string
SequenceOutline.t.steps.deactivateSender: string
SequenceOutline.t.steps.position: string
SequenceOutline.t.steps.positions: {}
SequenceOutline.t.steps.positions.left: string
SequenceOutline.t.steps.positions.right: string
SequenceOutline.t.steps.positions.over: string
SequenceOutline.t.steps.participant: string
SequenceOutline.t.steps.second: string
SequenceOutline.t.steps.none: string
SequenceOutline.t.steps.change: string
SequenceOutline.t.steps.activates: string
SequenceOutline.t.steps.deactivates: string
SequenceOutline.t.steps.kind: string
SequenceOutline.t.steps.condition: string
SequenceOutline.t.steps.sectionLabel: (word: string, n: number) => string
SequenceOutline.t.steps.addSection: (word: string) => string
SequenceOutline.t.steps.removeSection: (word: string, n: number) => string
SequenceOutline.t.steps.moveUp: string
SequenceOutline.t.steps.moveDown: string
SequenceOutline.t.elements: {}
SequenceOutline.t.elements.class: string
SequenceOutline.t.elements.interface: string
SequenceOutline.t.elements.abstract: string
SequenceOutline.t.elements.enumeration: string
SequenceOutline.t.elements.note: string
SequenceOutline.t.elements.state: string
SequenceOutline.t.elements.choice: string
SequenceOutline.t.elements.fork: string
SequenceOutline.t.elements.join: string
SequenceOutline.t.elements.entity: string
SequenceOutline.t.elements.participant: string
SequenceOutline.t.elements.actor: string
SequenceOutline.t.elements.person: string
SequenceOutline.t.elements.externalPerson: string
SequenceOutline.t.elements.system: string
SequenceOutline.t.elements.externalSystem: string
SequenceOutline.t.elements.container: string
SequenceOutline.t.elements.database: string
SequenceOutline.t.elements.queue: string
SequenceOutline.t.elements.component: string
SequenceOutline.t.elements.boundary: string
SequenceOutline.t.elements.loop: string
SequenceOutline.t.elements.alt: string
SequenceOutline.t.elements.opt: string
SequenceOutline.t.elements.par: string
SequenceOutline.t.elements.critical: string
SequenceOutline.t.elements.break: string
SequenceOutline.t.elements.usecase: string
SequenceOutline.t.elements.subject: string
SequenceOutline.t.elements.action: string
SequenceOutline.t.elements.decision: string
SequenceOutline.t.elements.merge: string
SequenceOutline.t.elements.start: string
SequenceOutline.t.elements.end: string
SequenceOutline.t.elements.flowEnd: string
SequenceOutline.t.elements.partition: string
SequenceOutline.t.elements.node: string
SequenceOutline.t.elements.device: string
SequenceOutline.t.elements.environment: string
SequenceOutline.t.elements.artifact: string
SequenceOutline.t.elements.cloud: string
SequenceOutline.t.elements.port: string
SequenceOutline.t.elements.package: string
SequenceOutline.t.relations: {}
SequenceOutline.t.relations.association: string
SequenceOutline.t.relations.inheritance: string
SequenceOutline.t.relations.realization: string
SequenceOutline.t.relations.composition: string
SequenceOutline.t.relations.aggregation: string
SequenceOutline.t.relations.dependency: string
SequenceOutline.t.relations.transition: string
SequenceOutline.t.relations.oneToOne: string
SequenceOutline.t.relations.oneToMany: string
SequenceOutline.t.relations.manyToMany: string
SequenceOutline.t.relations.uses: string
SequenceOutline.t.relations.usesBoth: string
SequenceOutline.t.relations.sync: string
SequenceOutline.t.relations.reply: string
SequenceOutline.t.relations.async: string
SequenceOutline.t.relations.include: string
SequenceOutline.t.relations.extend: string
SequenceOutline.t.relations.generalization: string
SequenceOutline.t.relations.flow: string
SequenceOutline.t.relations.link: string
SequenceOutline.t.relations.deploy: string
SequenceOutline.t.relations.provide: string
SequenceOutline.t.relations.require: string
SequenceOutline.t.relations.assembly: string
SequenceOutline.t.relations.delegate: string
SequenceOutline.t.relations.import: string
SequenceOutline.t.relations.merge: string
SequenceOutline.t.form: {}
SequenceOutline.t.form.title: string
SequenceOutline.t.form.kind: string
SequenceOutline.t.form.from: string
SequenceOutline.t.form.to: string
SequenceOutline.t.form.label: string
SequenceOutline.t.form.start: string
SequenceOutline.t.form.end: string
SequenceOutline.t.form.submit: string
SequenceOutline.t.form.hint: string
SequenceOutline.t.needsFix: string
SequenceOutline.t.added: (what: string) => string
SequenceOutline.t.connected: string
SequenceOutline.t.deleted: (n: number) => string
SequenceOutline.t.changed: string
SequenceOutline.t.undone: string
SequenceOutline.t.redone: string
SequenceOutline.t.properties: {}
SequenceOutline.t.properties.label: string
SequenceOutline.t.properties.empty: string
SequenceOutline.t.properties.several: (n: number) => string
SequenceOutline.t.properties.name: string
SequenceOutline.t.properties.text: string
SequenceOutline.t.properties.stereotype: string
SequenceOutline.t.properties.stereotypeHint: string
SequenceOutline.t.properties.deploymentStereotypeHint: string
SequenceOutline.t.properties.componentStereotypeHint: string
SequenceOutline.t.properties.packageStereotypeHint: string
SequenceOutline.t.properties.members: string
SequenceOutline.t.properties.attributes: string
SequenceOutline.t.properties.attributesHint: string
SequenceOutline.t.properties.description: string
SequenceOutline.t.properties.technology: string
SequenceOutline.t.properties.external: string
SequenceOutline.t.properties.kind: string
SequenceOutline.t.properties.lineLabel: string
SequenceOutline.t.properties.endAt: (name: string) => string
SequenceOutline.t.properties.reverse: string
SequenceOutline.t.properties.relation: (from: string, to: string) => string
SequenceOutline.t.properties.actor: string
SequenceOutline.t.properties.visibility: string
SequenceOutline.t.properties.visibilities: {}
SequenceOutline.t.properties.visibilities.none: string
SequenceOutline.t.properties.visibilities.public: string
SequenceOutline.t.properties.visibilities.private: string
SequenceOutline.t.properties.visibilities.protected: string
SequenceOutline.t.properties.visibilities.package: string
SequenceOutline.t.properties.member: (n: number) => string
SequenceOutline.t.properties.memberActions: (text: string) => string
SequenceOutline.t.properties.static: string
SequenceOutline.t.properties.abstract: string
SequenceOutline.t.properties.addAttribute: string
SequenceOutline.t.properties.addMethod: string
SequenceOutline.t.properties.newAttribute: string
SequenceOutline.t.properties.newMethod: string
SequenceOutline.t.properties.remove: string
SequenceOutline.t.properties.noMembers: string
function StepForm
StepForm.diagram: SequenceDiagram
StepForm.id: string
StepForm.step: SequenceStep
StepForm.locked: boolean
StepForm.onChange: (id: string, step: SequenceStep) => void
StepForm.onMove: (id: string, delta: -1 | 1) => void
StepForm.onAddSection: (id: string) => void
StepForm.onRemoveSection: (id: string, index: number) => void
StepForm.t: {}
StepForm.t.label: string
StepForm.t.add: string
StepForm.t.connect: string
StepForm.t.delete: string
StepForm.t.undo: string
StepForm.t.redo: string
StepForm.t.copy: string
StepForm.t.paste: string
StepForm.t.duplicate: string
StepForm.t.layout: string
StepForm.t.arrange: string
StepForm.t.flow: string
StepForm.t.directions: {}
StepForm.t.directions.TB: string
StepForm.t.directions.LR: string
StepForm.t.directions.BT: string
StepForm.t.directions.RL: string
StepForm.t.dragHint: (what: string) => string
StepForm.t.copied: (n: number) => string
StepForm.t.pasted: (n: number) => string
StepForm.t.moved: string
StepForm.t.arranged: string
StepForm.t.steps: {}
StepForm.t.steps.label: string
StepForm.t.steps.participants: string
StepForm.t.steps.empty: string
StepForm.t.steps.text: string
StepForm.t.steps.arrow: string
StepForm.t.steps.activateTarget: string
StepForm.t.steps.deactivateSender: string
StepForm.t.steps.position: string
StepForm.t.steps.positions: {}
StepForm.t.steps.positions.left: string
StepForm.t.steps.positions.right: string
StepForm.t.steps.positions.over: string
StepForm.t.steps.participant: string
StepForm.t.steps.second: string
StepForm.t.steps.none: string
StepForm.t.steps.change: string
StepForm.t.steps.activates: string
StepForm.t.steps.deactivates: string
StepForm.t.steps.kind: string
StepForm.t.steps.condition: string
StepForm.t.steps.sectionLabel: (word: string, n: number) => string
StepForm.t.steps.addSection: (word: string) => string
StepForm.t.steps.removeSection: (word: string, n: number) => string
StepForm.t.steps.moveUp: string
StepForm.t.steps.moveDown: string
StepForm.t.elements: {}
StepForm.t.elements.class: string
StepForm.t.elements.interface: string
StepForm.t.elements.abstract: string
StepForm.t.elements.enumeration: string
StepForm.t.elements.note: string
StepForm.t.elements.state: string
StepForm.t.elements.choice: string
StepForm.t.elements.fork: string
StepForm.t.elements.join: string
StepForm.t.elements.entity: string
StepForm.t.elements.participant: string
StepForm.t.elements.actor: string
StepForm.t.elements.person: string
StepForm.t.elements.externalPerson: string
StepForm.t.elements.system: string
StepForm.t.elements.externalSystem: string
StepForm.t.elements.container: string
StepForm.t.elements.database: string
StepForm.t.elements.queue: string
StepForm.t.elements.component: string
StepForm.t.elements.boundary: string
StepForm.t.elements.loop: string
StepForm.t.elements.alt: string
StepForm.t.elements.opt: string
StepForm.t.elements.par: string
StepForm.t.elements.critical: string
StepForm.t.elements.break: string
StepForm.t.elements.usecase: string
StepForm.t.elements.subject: string
StepForm.t.elements.action: string
StepForm.t.elements.decision: string
StepForm.t.elements.merge: string
StepForm.t.elements.start: string
StepForm.t.elements.end: string
StepForm.t.elements.flowEnd: string
StepForm.t.elements.partition: string
StepForm.t.elements.node: string
StepForm.t.elements.device: string
StepForm.t.elements.environment: string
StepForm.t.elements.artifact: string
StepForm.t.elements.cloud: string
StepForm.t.elements.port: string
StepForm.t.elements.package: string
StepForm.t.relations: {}
StepForm.t.relations.association: string
StepForm.t.relations.inheritance: string
StepForm.t.relations.realization: string
StepForm.t.relations.composition: string
StepForm.t.relations.aggregation: string
StepForm.t.relations.dependency: string
StepForm.t.relations.transition: string
StepForm.t.relations.oneToOne: string
StepForm.t.relations.oneToMany: string
StepForm.t.relations.manyToMany: string
StepForm.t.relations.uses: string
StepForm.t.relations.usesBoth: string
StepForm.t.relations.sync: string
StepForm.t.relations.reply: string
StepForm.t.relations.async: string
StepForm.t.relations.include: string
StepForm.t.relations.extend: string
StepForm.t.relations.generalization: string
StepForm.t.relations.flow: string
StepForm.t.relations.link: string
StepForm.t.relations.deploy: string
StepForm.t.relations.provide: string
StepForm.t.relations.require: string
StepForm.t.relations.assembly: string
StepForm.t.relations.delegate: string
StepForm.t.relations.import: string
StepForm.t.relations.merge: string
StepForm.t.form: {}
StepForm.t.form.title: string
StepForm.t.form.kind: string
StepForm.t.form.from: string
StepForm.t.form.to: string
StepForm.t.form.label: string
StepForm.t.form.start: string
StepForm.t.form.end: string
StepForm.t.form.submit: string
StepForm.t.form.hint: string
StepForm.t.needsFix: string
StepForm.t.added: (what: string) => string
StepForm.t.connected: string
StepForm.t.deleted: (n: number) => string
StepForm.t.changed: string
StepForm.t.undone: string
StepForm.t.redone: string
StepForm.t.properties: {}
StepForm.t.properties.label: string
StepForm.t.properties.empty: string
StepForm.t.properties.several: (n: number) => string
StepForm.t.properties.name: string
StepForm.t.properties.text: string
StepForm.t.properties.stereotype: string
StepForm.t.properties.stereotypeHint: string
StepForm.t.properties.deploymentStereotypeHint: string
StepForm.t.properties.componentStereotypeHint: string
StepForm.t.properties.packageStereotypeHint: string
StepForm.t.properties.members: string
StepForm.t.properties.attributes: string
StepForm.t.properties.attributesHint: string
StepForm.t.properties.description: string
StepForm.t.properties.technology: string
StepForm.t.properties.external: string
StepForm.t.properties.kind: string
StepForm.t.properties.lineLabel: string
StepForm.t.properties.endAt: (name: string) => string
StepForm.t.properties.reverse: string
StepForm.t.properties.relation: (from: string, to: string) => string
StepForm.t.properties.actor: string
StepForm.t.properties.visibility: string
StepForm.t.properties.visibilities: {}
StepForm.t.properties.visibilities.none: string
StepForm.t.properties.visibilities.public: string
StepForm.t.properties.visibilities.private: string
StepForm.t.properties.visibilities.protected: string
StepForm.t.properties.visibilities.package: string
StepForm.t.properties.member: (n: number) => string
StepForm.t.properties.memberActions: (text: string) => string
StepForm.t.properties.static: string
StepForm.t.properties.abstract: string
StepForm.t.properties.addAttribute: string
StepForm.t.properties.addMethod: string
StepForm.t.properties.newAttribute: string
StepForm.t.properties.newMethod: string
StepForm.t.properties.remove: string
StepForm.t.properties.noMembers: string
type StepFormProps = {}
StepFormProps.diagram: SequenceDiagram
StepFormProps.id: string
StepFormProps.step: SequenceStep
StepFormProps.locked: boolean
StepFormProps.onChange: (id: string, step: SequenceStep) => void
StepFormProps.onMove: (id: string, delta: -1 | 1) => void
StepFormProps.onAddSection: (id: string) => void
StepFormProps.onRemoveSection: (id: string, index: number) => void
StepFormProps.t: {}
StepFormProps.t.label: string
StepFormProps.t.add: string
StepFormProps.t.connect: string
StepFormProps.t.delete: string
StepFormProps.t.undo: string
StepFormProps.t.redo: string
StepFormProps.t.copy: string
StepFormProps.t.paste: string
StepFormProps.t.duplicate: string
StepFormProps.t.layout: string
StepFormProps.t.arrange: string
StepFormProps.t.flow: string
StepFormProps.t.directions: {}
StepFormProps.t.directions.TB: string
StepFormProps.t.directions.LR: string
StepFormProps.t.directions.BT: string
StepFormProps.t.directions.RL: string
StepFormProps.t.dragHint: (what: string) => string
StepFormProps.t.copied: (n: number) => string
StepFormProps.t.pasted: (n: number) => string
StepFormProps.t.moved: string
StepFormProps.t.arranged: string
StepFormProps.t.steps: {}
StepFormProps.t.steps.label: string
StepFormProps.t.steps.participants: string
StepFormProps.t.steps.empty: string
StepFormProps.t.steps.text: string
StepFormProps.t.steps.arrow: string
StepFormProps.t.steps.activateTarget: string
StepFormProps.t.steps.deactivateSender: string
StepFormProps.t.steps.position: string
StepFormProps.t.steps.positions: {}
StepFormProps.t.steps.positions.left: string
StepFormProps.t.steps.positions.right: string
StepFormProps.t.steps.positions.over: string
StepFormProps.t.steps.participant: string
StepFormProps.t.steps.second: string
StepFormProps.t.steps.none: string
StepFormProps.t.steps.change: string
StepFormProps.t.steps.activates: string
StepFormProps.t.steps.deactivates: string
StepFormProps.t.steps.kind: string
StepFormProps.t.steps.condition: string
StepFormProps.t.steps.sectionLabel: (word: string, n: number) => string
StepFormProps.t.steps.addSection: (word: string) => string
StepFormProps.t.steps.removeSection: (word: string, n: number) => string
StepFormProps.t.steps.moveUp: string
StepFormProps.t.steps.moveDown: string
StepFormProps.t.elements: {}
StepFormProps.t.elements.class: string
StepFormProps.t.elements.interface: string
StepFormProps.t.elements.abstract: string
StepFormProps.t.elements.enumeration: string
StepFormProps.t.elements.note: string
StepFormProps.t.elements.state: string
StepFormProps.t.elements.choice: string
StepFormProps.t.elements.fork: string
StepFormProps.t.elements.join: string
StepFormProps.t.elements.entity: string
StepFormProps.t.elements.participant: string
StepFormProps.t.elements.actor: string
StepFormProps.t.elements.person: string
StepFormProps.t.elements.externalPerson: string
StepFormProps.t.elements.system: string
StepFormProps.t.elements.externalSystem: string
StepFormProps.t.elements.container: string
StepFormProps.t.elements.database: string
StepFormProps.t.elements.queue: string
StepFormProps.t.elements.component: string
StepFormProps.t.elements.boundary: string
StepFormProps.t.elements.loop: string
StepFormProps.t.elements.alt: string
StepFormProps.t.elements.opt: string
StepFormProps.t.elements.par: string
StepFormProps.t.elements.critical: string
StepFormProps.t.elements.break: string
StepFormProps.t.elements.usecase: string
StepFormProps.t.elements.subject: string
StepFormProps.t.elements.action: string
StepFormProps.t.elements.decision: string
StepFormProps.t.elements.merge: string
StepFormProps.t.elements.start: string
StepFormProps.t.elements.end: string
StepFormProps.t.elements.flowEnd: string
StepFormProps.t.elements.partition: string
StepFormProps.t.elements.node: string
StepFormProps.t.elements.device: string
StepFormProps.t.elements.environment: string
StepFormProps.t.elements.artifact: string
StepFormProps.t.elements.cloud: string
StepFormProps.t.elements.port: string
StepFormProps.t.elements.package: string
StepFormProps.t.relations: {}
StepFormProps.t.relations.association: string
StepFormProps.t.relations.inheritance: string
StepFormProps.t.relations.realization: string
StepFormProps.t.relations.composition: string
StepFormProps.t.relations.aggregation: string
StepFormProps.t.relations.dependency: string
StepFormProps.t.relations.transition: string
StepFormProps.t.relations.oneToOne: string
StepFormProps.t.relations.oneToMany: string
StepFormProps.t.relations.manyToMany: string
StepFormProps.t.relations.uses: string
StepFormProps.t.relations.usesBoth: string
StepFormProps.t.relations.sync: string
StepFormProps.t.relations.reply: string
StepFormProps.t.relations.async: string
StepFormProps.t.relations.include: string
StepFormProps.t.relations.extend: string
StepFormProps.t.relations.generalization: string
StepFormProps.t.relations.flow: string
StepFormProps.t.relations.link: string
StepFormProps.t.relations.deploy: string
StepFormProps.t.relations.provide: string
StepFormProps.t.relations.require: string
StepFormProps.t.relations.assembly: string
StepFormProps.t.relations.delegate: string
StepFormProps.t.relations.import: string
StepFormProps.t.relations.merge: string
StepFormProps.t.form: {}
StepFormProps.t.form.title: string
StepFormProps.t.form.kind: string
StepFormProps.t.form.from: string
StepFormProps.t.form.to: string
StepFormProps.t.form.label: string
StepFormProps.t.form.start: string
StepFormProps.t.form.end: string
StepFormProps.t.form.submit: string
StepFormProps.t.form.hint: string
StepFormProps.t.needsFix: string
StepFormProps.t.added: (what: string) => string
StepFormProps.t.connected: string
StepFormProps.t.deleted: (n: number) => string
StepFormProps.t.changed: string
StepFormProps.t.undone: string
StepFormProps.t.redone: string
StepFormProps.t.properties: {}
StepFormProps.t.properties.label: string
StepFormProps.t.properties.empty: string
StepFormProps.t.properties.several: (n: number) => string
StepFormProps.t.properties.name: string
StepFormProps.t.properties.text: string
StepFormProps.t.properties.stereotype: string
StepFormProps.t.properties.stereotypeHint: string
StepFormProps.t.properties.deploymentStereotypeHint: string
StepFormProps.t.properties.componentStereotypeHint: string
StepFormProps.t.properties.packageStereotypeHint: string
StepFormProps.t.properties.members: string
StepFormProps.t.properties.attributes: string
StepFormProps.t.properties.attributesHint: string
StepFormProps.t.properties.description: string
StepFormProps.t.properties.technology: string
StepFormProps.t.properties.external: string
StepFormProps.t.properties.kind: string
StepFormProps.t.properties.lineLabel: string
StepFormProps.t.properties.endAt: (name: string) => string
StepFormProps.t.properties.reverse: string
StepFormProps.t.properties.relation: (from: string, to: string) => string
StepFormProps.t.properties.actor: string
StepFormProps.t.properties.visibility: string
StepFormProps.t.properties.visibilities: {}
StepFormProps.t.properties.visibilities.none: string
StepFormProps.t.properties.visibilities.public: string
StepFormProps.t.properties.visibilities.private: string
StepFormProps.t.properties.visibilities.protected: string
StepFormProps.t.properties.visibilities.package: string
StepFormProps.t.properties.member: (n: number) => string
StepFormProps.t.properties.memberActions: (text: string) => string
StepFormProps.t.properties.static: string
StepFormProps.t.properties.abstract: string
StepFormProps.t.properties.addAttribute: string
StepFormProps.t.properties.addMethod: string
StepFormProps.t.properties.newAttribute: string
StepFormProps.t.properties.newMethod: string
StepFormProps.t.properties.remove: string
StepFormProps.t.properties.noMembers: string
function stepSummary(step: SequenceStep, name: (id: string) => string, t: SummaryText) => string
```

## src/components/use-diagram-editing.ts

```ts
function useDiagramEditing({ diagram, text, layout, write, setText, setLayout, t, }: { diagram: UmlSpec | null; text: string; layout: UmlLayout | null; write: (diagram: UmlSpec) => string; setText: (text: string) => void; setLayout: (layout: UmlLayout | null) => void; t: Messages['diagramTools']; }) => { reset: () => void; direction: import("@/lib/uml").UmlDirection | null; move: (layout: UmlLayout) => void; arrange: () => void; turn: (direction: import("@/lib/uml").UmlDirection) => void; canCopy: boolean; canPaste: boolean; copy: () => boolean; cut: () => void; paste: () => void; duplicate: () => void; changeStep: (id: string, step: import("@/lib/uml").SequenceStep) => void; moveStep: (id: string, delta: -1 | 1) => void; addSection: (id: string) => void; removeSection: (id: string, index: number) => void; connect: (input: import("@/lib/uml-edit").AddRelationInput) => void; connectDragged: (from: string, to: string) => void; remove: (what?: UmlSelection) => void; changeElement: (id: string, fields: import("@/lib/uml-edit-fields").UmlElementFields) => void; rename: (id: string, name: string) => void; changeRelation: (index: number, fields: import("@/lib/uml-edit-fields").UmlRelationFields) => void; reverse: (index: number) => void; selection: UmlSelection; select: React.Dispatch<React.SetStateAction<UmlSelection>>; notice: string | null; nameRef: React.RefObject<NameField | null>; stepButtons: React.RefObject<Map<string, HTMLButtonElement>>; canUndo: boolean; canRedo: boolean; canDelete: boolean; undo: () => void; redo: () => void; add: (type: UmlElementType, at?: UmlPoint) => void; }
```
