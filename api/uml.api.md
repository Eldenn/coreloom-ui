# @coreloom/uml

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/lib/uml.ts

```ts
type ActivityDiagram = {}
ActivityDiagram.kind: 'activity'
ActivityDiagram.title?: string | undefined
ActivityDiagram.direction?: UmlDirection | undefined
ActivityDiagram.elements: ActivityNode[]
ActivityDiagram.relations: ActivityFlow[]
ActivityDiagram.notes?: UmlNote[] | undefined
ActivityDiagram.layout?: UmlLayout | undefined
type C4Boundary = {}
C4Boundary.id: string
C4Boundary.label: string
C4Boundary.kind?: 'system' | 'container' | 'boundary' | 'enterprise' | undefined
C4Boundary.parent?: string | undefined
type C4Diagram = {}
C4Diagram.kind: 'c4'
C4Diagram.level: C4Level
C4Diagram.title?: string | undefined
C4Diagram.direction?: UmlDirection | undefined
C4Diagram.elements: C4Element[]
C4Diagram.boundaries?: C4Boundary[] | undefined
C4Diagram.relations: C4Relation[]
C4Diagram.layout?: UmlLayout | undefined
type C4Element = {}
C4Element.id: string
C4Element.kind: C4ElementKind
C4Element.label: string
C4Element.description?: string | undefined
C4Element.technology?: string | undefined
C4Element.external?: boolean | undefined
C4Element.shape?: 'database' | 'box' | 'queue' | undefined
C4Element.boundary?: string | undefined
type C4ElementKind = 'system' | 'component' | 'person' | 'container'
type C4Level = 'component' | 'container' | 'context'
type C4Relation = {}
C4Relation.from: string
C4Relation.to: string
C4Relation.label?: string | undefined
C4Relation.technology?: string | undefined
C4Relation.bidirectional?: boolean | undefined
type ClassDiagram = {}
ClassDiagram.kind: 'class'
ClassDiagram.title?: string | undefined
ClassDiagram.direction?: UmlDirection | undefined
ClassDiagram.classes: UmlClass[]
ClassDiagram.relations: ClassRelation[]
ClassDiagram.notes?: UmlNote[] | undefined
ClassDiagram.layout?: UmlLayout | undefined
type ClassMember = {}
ClassMember.text: string
ClassMember.visibility?: ClassVisibility | undefined
ClassMember.static?: boolean | undefined
ClassMember.abstract?: boolean | undefined
type ClassRelation = {}
ClassRelation.from: string
ClassRelation.to: string
ClassRelation.kind: ClassRelationKind
ClassRelation.label?: string | undefined
ClassRelation.fromCardinality?: string | undefined
ClassRelation.toCardinality?: string | undefined
type ClassRelationKind = 'link' | 'dependency' | 'association' | 'inheritance' | 'realization' | 'composition' | 'aggregation' | 'dashedLink'
type ClassVisibility = 'package' | 'public' | 'private' | 'protected'
type ComponentDiagram = {}
ComponentDiagram.kind: 'component'
ComponentDiagram.title?: string | undefined
ComponentDiagram.direction?: UmlDirection | undefined
ComponentDiagram.elements: ComponentElement[]
ComponentDiagram.relations: ComponentRelation[]
ComponentDiagram.notes?: UmlNote[] | undefined
ComponentDiagram.layout?: UmlLayout | undefined
type DeploymentDiagram = {}
DeploymentDiagram.kind: 'deployment'
DeploymentDiagram.title?: string | undefined
DeploymentDiagram.direction?: UmlDirection | undefined
DeploymentDiagram.elements: DeploymentNode[]
DeploymentDiagram.relations: DeploymentRelation[]
DeploymentDiagram.notes?: UmlNote[] | undefined
DeploymentDiagram.layout?: UmlLayout | undefined
type ErAttribute = {}
ErAttribute.type: string
ErAttribute.name: string
ErAttribute.keys?: ErKey[] | undefined
ErAttribute.comment?: string | undefined
type ErCardinality = 'zeroOrOne' | 'exactlyOne' | 'zeroOrMore' | 'oneOrMore'
type ErDiagram = {}
ErDiagram.kind: 'er'
ErDiagram.title?: string | undefined
ErDiagram.direction?: UmlDirection | undefined
ErDiagram.entities: ErEntity[]
ErDiagram.relations: ErRelation[]
ErDiagram.layout?: UmlLayout | undefined
type ErEntity = {}
ErEntity.id: string
ErEntity.label?: string | undefined
ErEntity.attributes?: ErAttribute[] | undefined
type ErKey = 'PK' | 'FK' | 'UK'
type ErRelation = {}
ErRelation.from: string
ErRelation.to: string
ErRelation.fromCardinality: ErCardinality
ErRelation.toCardinality: ErCardinality
ErRelation.label: string
ErRelation.identifying?: boolean | undefined
type PackageDiagram = {}
PackageDiagram.kind: 'package'
PackageDiagram.title?: string | undefined
PackageDiagram.direction?: UmlDirection | undefined
PackageDiagram.elements: PackageElement[]
PackageDiagram.relations: PackageRelation[]
PackageDiagram.notes?: UmlNote[] | undefined
PackageDiagram.layout?: UmlLayout | undefined
function parseUmlJson(input: string) => UmlParseResult
function parseUmlValue(raw: unknown) => UmlParseResult
type SequenceArrow = 'reply' | 'line' | 'sync' | 'dottedLine' | 'lost' | 'dottedLost' | 'async' | 'dottedAsync'
type SequenceBlockKind = 'loop' | 'alt' | 'opt' | 'par' | 'critical' | 'break'
type SequenceDiagram = {}
SequenceDiagram.kind: 'sequence'
SequenceDiagram.title?: string | undefined
SequenceDiagram.autonumber?: boolean | undefined
SequenceDiagram.participants: SequenceParticipant[]
SequenceDiagram.steps: SequenceStep[]
type SequenceParticipant = {}
SequenceParticipant.id: string
SequenceParticipant.label?: string | undefined
SequenceParticipant.kind?: 'actor' | 'participant' | undefined
type SequenceStep = { type: 'message'; from: string; to: string; text: string; arrow: SequenceArrow; activate?: boolean; deactivate?: boolean; } | { type: 'note'; position: 'left' | 'right' | 'over'; participants: string[]; text: string; } | { type: 'activation'; participant: string; active: boolean; } | { type: 'block'; kind: SequenceBlockKind; sections: { label: string; steps: SequenceStep[]; }[]; }
type StateDiagram = {}
StateDiagram.kind: 'state'
StateDiagram.title?: string | undefined
StateDiagram.direction?: UmlDirection | undefined
StateDiagram.states: UmlState[]
StateDiagram.transitions: StateTransition[]
StateDiagram.notes?: UmlNote[] | undefined
StateDiagram.layout?: UmlLayout | undefined
type StateKind = 'fork' | 'join' | 'state' | 'choice'
type StateTransition = {}
StateTransition.from: string
StateTransition.to: string
StateTransition.label?: string | undefined
StateTransition.parent?: string | undefined
function toUmlJson(diagram: UmlSpec) => string
type UmlClass = {}
UmlClass.id: string
UmlClass.label?: string | undefined
UmlClass.generic?: string | undefined
UmlClass.stereotype?: string | undefined
UmlClass.attributes?: ClassMember[] | undefined
UmlClass.methods?: ClassMember[] | undefined
UmlClass.namespace?: string | undefined
type UmlDiagramKind = 'component' | 'package' | 'class' | 'usecase' | 'state' | 'activity' | 'deployment' | 'sequence' | 'er' | 'c4'
type UmlDirection = 'TB' | 'BT' | 'LR' | 'RL'
function umlElementIds(diagram: UmlSpec) => string[]
type UmlLayout = { [x: string]: UmlPoint; }
type UmlNote = {}
UmlNote.text: string
UmlNote.for?: string | undefined
type UmlParseResult = { diagram: UmlSpec; problems: UmlProblem[]; } | { diagram: null; problems: UmlProblem[]; }
type UmlPoint = {}
UmlPoint.x: number
UmlPoint.y: number
type UmlProblem = {}
UmlProblem.line: number
UmlProblem.severity: 'error' | 'warning'
UmlProblem.code: 'json' | 'header' | 'empty' | 'unsupported' | 'syntax' | 'unclosed' | 'unexpected' | 'schema'
UmlProblem.text?: string | undefined
type UmlSpec = UseCaseDiagram | ActivityDiagram | DeploymentDiagram | ComponentDiagram | PackageDiagram | ClassDiagram | SequenceDiagram | StateDiagram | ErDiagram | C4Diagram
type UmlState = {}
UmlState.id: string
UmlState.label?: string | undefined
UmlState.kind?: StateKind | undefined
UmlState.description?: string | undefined
UmlState.parent?: string | undefined
type UseCaseDiagram = {}
UseCaseDiagram.kind: 'usecase'
UseCaseDiagram.title?: string | undefined
UseCaseDiagram.direction?: UmlDirection | undefined
UseCaseDiagram.elements: UseCaseElement[]
UseCaseDiagram.relations: UseCaseRelation[]
UseCaseDiagram.notes?: UmlNote[] | undefined
UseCaseDiagram.layout?: UmlLayout | undefined
```

## src/lib/uml-elements.ts

```ts
const ACTIVITY_KINDS: readonly ActivityNodeKind[]
type ActivityDiagram = {}
ActivityDiagram.kind: 'activity'
ActivityDiagram.title?: string | undefined
ActivityDiagram.direction?: UmlDirection | undefined
ActivityDiagram.elements: ActivityNode[]
ActivityDiagram.relations: ActivityFlow[]
ActivityDiagram.notes?: UmlNote[] | undefined
ActivityDiagram.layout?: UmlLayout | undefined
type ActivityFlow = {}
ActivityFlow.from: string
ActivityFlow.to: string
ActivityFlow.label?: string | undefined
ActivityFlow.kind?: 'flow' | undefined
type ActivityNode = {}
ActivityNode.id: string
ActivityNode.kind: ActivityNodeKind
ActivityNode.label?: string | undefined
ActivityNode.parent?: string | undefined
type ActivityNodeKind = 'end' | 'start' | 'action' | 'decision' | 'merge' | 'flowEnd' | 'fork' | 'join' | 'partition'
const activitySchema: z.ZodObject<{ kind: z.ZodLiteral<'activity'>; title: z.ZodOptional<z.ZodString>; direction: z.ZodOptional<z.ZodEnum<{ TB: 'TB'; BT: 'BT'; LR: 'LR'; RL: 'RL'; }>>; elements: z.ZodArray<z.ZodObject<{ id: z.ZodString; kind: z.ZodEnum<{ end: 'end'; start: 'start'; action: 'action'; decision: 'decision'; merge: 'merge'; flowEnd: 'flowEnd'; fork: 'fork'; join: 'join'; partition: 'partition'; }>; label: z.ZodOptional<z.ZodString>; parent: z.ZodOptional<z.ZodString>; }, z.core.$strip>>; relations: z.ZodArray<z.ZodObject<{ from: z.ZodString; to: z.ZodString; kind: z.ZodOptional<z.ZodEnum<{ flow: 'flow'; }>>; label: z.ZodOptional<z.ZodString>; }, z.core.$strip>>; notes: z.ZodOptional<z.ZodArray<z.ZodObject<{ text: z.ZodString; for: z.ZodOptional<z.ZodString>; }, z.core.$strip>>>; layout: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{ x: z.ZodNumber; y: z.ZodNumber; }, z.core.$strip>>>; }, z.core.$strip>
const COMPONENT_KINDS: readonly ComponentElementKind[]
const COMPONENT_RELATIONS: readonly ComponentRelationKind[]
type ComponentDiagram = {}
ComponentDiagram.kind: 'component'
ComponentDiagram.title?: string | undefined
ComponentDiagram.direction?: UmlDirection | undefined
ComponentDiagram.elements: ComponentElement[]
ComponentDiagram.relations: ComponentRelation[]
ComponentDiagram.notes?: UmlNote[] | undefined
ComponentDiagram.layout?: UmlLayout | undefined
type ComponentElement = {}
ComponentElement.id: string
ComponentElement.kind: ComponentElementKind
ComponentElement.label?: string | undefined
ComponentElement.stereotype?: string | undefined
ComponentElement.parent?: string | undefined
type ComponentElementKind = 'component' | 'interface' | 'port'
type ComponentRelation = {}
ComponentRelation.from: string
ComponentRelation.to: string
ComponentRelation.kind?: ComponentRelationKind | undefined
ComponentRelation.label?: string | undefined
type ComponentRelationKind = 'dependency' | 'provide' | 'require' | 'assembly' | 'delegate'
const componentSchema: z.ZodObject<{ kind: z.ZodLiteral<'component'>; title: z.ZodOptional<z.ZodString>; direction: z.ZodOptional<z.ZodEnum<{ TB: 'TB'; BT: 'BT'; LR: 'LR'; RL: 'RL'; }>>; elements: z.ZodArray<z.ZodObject<{ id: z.ZodString; kind: z.ZodEnum<{ component: 'component'; interface: 'interface'; port: 'port'; }>; label: z.ZodOptional<z.ZodString>; stereotype: z.ZodOptional<z.ZodString>; parent: z.ZodOptional<z.ZodString>; }, z.core.$strip>>; relations: z.ZodArray<z.ZodObject<{ from: z.ZodString; to: z.ZodString; kind: z.ZodOptional<z.ZodEnum<{ dependency: 'dependency'; provide: 'provide'; require: 'require'; assembly: 'assembly'; delegate: 'delegate'; }>>; label: z.ZodOptional<z.ZodString>; }, z.core.$strip>>; notes: z.ZodOptional<z.ZodArray<z.ZodObject<{ text: z.ZodString; for: z.ZodOptional<z.ZodString>; }, z.core.$strip>>>; layout: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{ x: z.ZodNumber; y: z.ZodNumber; }, z.core.$strip>>>; }, z.core.$strip>
const DEPLOYMENT_KINDS: readonly DeploymentNodeKind[]
const DEPLOYMENT_RELATIONS: readonly DeploymentRelationKind[]
type DeploymentDiagram = {}
DeploymentDiagram.kind: 'deployment'
DeploymentDiagram.title?: string | undefined
DeploymentDiagram.direction?: UmlDirection | undefined
DeploymentDiagram.elements: DeploymentNode[]
DeploymentDiagram.relations: DeploymentRelation[]
DeploymentDiagram.notes?: UmlNote[] | undefined
DeploymentDiagram.layout?: UmlLayout | undefined
type DeploymentNode = {}
DeploymentNode.id: string
DeploymentNode.kind: DeploymentNodeKind
DeploymentNode.label?: string | undefined
DeploymentNode.stereotype?: string | undefined
DeploymentNode.parent?: string | undefined
type DeploymentNodeKind = 'component' | 'node' | 'device' | 'environment' | 'artifact' | 'database' | 'cloud'
type DeploymentRelation = {}
DeploymentRelation.from: string
DeploymentRelation.to: string
DeploymentRelation.kind?: DeploymentRelationKind | undefined
DeploymentRelation.label?: string | undefined
type DeploymentRelationKind = 'link' | 'dependency' | 'deploy'
const deploymentSchema: z.ZodObject<{ kind: z.ZodLiteral<'deployment'>; title: z.ZodOptional<z.ZodString>; direction: z.ZodOptional<z.ZodEnum<{ TB: 'TB'; BT: 'BT'; LR: 'LR'; RL: 'RL'; }>>; elements: z.ZodArray<z.ZodObject<{ id: z.ZodString; kind: z.ZodEnum<{ component: 'component'; node: 'node'; device: 'device'; environment: 'environment'; artifact: 'artifact'; database: 'database'; cloud: 'cloud'; }>; label: z.ZodOptional<z.ZodString>; stereotype: z.ZodOptional<z.ZodString>; parent: z.ZodOptional<z.ZodString>; }, z.core.$strip>>; relations: z.ZodArray<z.ZodObject<{ from: z.ZodString; to: z.ZodString; kind: z.ZodOptional<z.ZodEnum<{ link: 'link'; dependency: 'dependency'; deploy: 'deploy'; }>>; label: z.ZodOptional<z.ZodString>; }, z.core.$strip>>; notes: z.ZodOptional<z.ZodArray<z.ZodObject<{ text: z.ZodString; for: z.ZodOptional<z.ZodString>; }, z.core.$strip>>>; layout: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{ x: z.ZodNumber; y: z.ZodNumber; }, z.core.$strip>>>; }, z.core.$strip>
const direction: z.ZodOptional<z.ZodEnum<{ TB: 'TB'; BT: 'BT'; LR: 'LR'; RL: 'RL'; }>>
type ElementDiagram = UseCaseDiagram | ActivityDiagram | DeploymentDiagram | ComponentDiagram | PackageDiagram
const id: z.ZodString
function isContainer(diagram: ElementDiagram, id: string) => boolean
const layout: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{ x: z.ZodNumber; y: z.ZodNumber; }, z.core.$strip>>>
const notes: z.ZodOptional<z.ZodArray<z.ZodObject<{ text: z.ZodString; for: z.ZodOptional<z.ZodString>; }, z.core.$strip>>>
const PACKAGE_KINDS: readonly PackageElementKind[]
const PACKAGE_RELATIONS: readonly PackageRelationKind[]
type PackageDiagram = {}
PackageDiagram.kind: 'package'
PackageDiagram.title?: string | undefined
PackageDiagram.direction?: UmlDirection | undefined
PackageDiagram.elements: PackageElement[]
PackageDiagram.relations: PackageRelation[]
PackageDiagram.notes?: UmlNote[] | undefined
PackageDiagram.layout?: UmlLayout | undefined
type PackageElement = {}
PackageElement.id: string
PackageElement.kind: PackageElementKind
PackageElement.label?: string | undefined
PackageElement.stereotype?: string | undefined
PackageElement.parent?: string | undefined
type PackageElementKind = 'component' | 'interface' | 'package' | 'class'
type PackageRelation = {}
PackageRelation.from: string
PackageRelation.to: string
PackageRelation.kind?: PackageRelationKind | undefined
PackageRelation.label?: string | undefined
type PackageRelationKind = 'merge' | 'dependency' | 'import'
const packageSchema: z.ZodObject<{ kind: z.ZodLiteral<'package'>; title: z.ZodOptional<z.ZodString>; direction: z.ZodOptional<z.ZodEnum<{ TB: 'TB'; BT: 'BT'; LR: 'LR'; RL: 'RL'; }>>; elements: z.ZodArray<z.ZodObject<{ id: z.ZodString; kind: z.ZodEnum<{ component: 'component'; interface: 'interface'; package: 'package'; class: 'class'; }>; label: z.ZodOptional<z.ZodString>; stereotype: z.ZodOptional<z.ZodString>; parent: z.ZodOptional<z.ZodString>; }, z.core.$strip>>; relations: z.ZodArray<z.ZodObject<{ from: z.ZodString; to: z.ZodString; kind: z.ZodOptional<z.ZodEnum<{ merge: 'merge'; dependency: 'dependency'; import: 'import'; }>>; label: z.ZodOptional<z.ZodString>; }, z.core.$strip>>; notes: z.ZodOptional<z.ZodArray<z.ZodObject<{ text: z.ZodString; for: z.ZodOptional<z.ZodString>; }, z.core.$strip>>>; layout: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{ x: z.ZodNumber; y: z.ZodNumber; }, z.core.$strip>>>; }, z.core.$strip>
const text: z.ZodString
const USE_CASE_KINDS: readonly UseCaseElementKind[]
const USE_CASE_RELATIONS: readonly UseCaseRelationKind[]
type UseCaseDiagram = {}
UseCaseDiagram.kind: 'usecase'
UseCaseDiagram.title?: string | undefined
UseCaseDiagram.direction?: UmlDirection | undefined
UseCaseDiagram.elements: UseCaseElement[]
UseCaseDiagram.relations: UseCaseRelation[]
UseCaseDiagram.notes?: UmlNote[] | undefined
UseCaseDiagram.layout?: UmlLayout | undefined
type UseCaseElement = {}
UseCaseElement.id: string
UseCaseElement.kind: UseCaseElementKind
UseCaseElement.label?: string | undefined
UseCaseElement.parent?: string | undefined
type UseCaseElementKind = 'system' | 'actor' | 'usecase'
type UseCaseRelation = {}
UseCaseRelation.from: string
UseCaseRelation.to: string
UseCaseRelation.kind?: UseCaseRelationKind | undefined
UseCaseRelation.label?: string | undefined
type UseCaseRelationKind = 'association' | 'include' | 'extend' | 'generalization'
const usecaseSchema: z.ZodObject<{ kind: z.ZodLiteral<'usecase'>; title: z.ZodOptional<z.ZodString>; direction: z.ZodOptional<z.ZodEnum<{ TB: 'TB'; BT: 'BT'; LR: 'LR'; RL: 'RL'; }>>; elements: z.ZodArray<z.ZodObject<{ id: z.ZodString; kind: z.ZodEnum<{ system: 'system'; actor: 'actor'; usecase: 'usecase'; }>; label: z.ZodOptional<z.ZodString>; parent: z.ZodOptional<z.ZodString>; }, z.core.$strip>>; relations: z.ZodArray<z.ZodObject<{ from: z.ZodString; to: z.ZodString; kind: z.ZodOptional<z.ZodEnum<{ association: 'association'; include: 'include'; extend: 'extend'; generalization: 'generalization'; }>>; label: z.ZodOptional<z.ZodString>; }, z.core.$strip>>; notes: z.ZodOptional<z.ZodArray<z.ZodObject<{ text: z.ZodString; for: z.ZodOptional<z.ZodString>; }, z.core.$strip>>>; layout: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{ x: z.ZodNumber; y: z.ZodNumber; }, z.core.$strip>>>; }, z.core.$strip>
```

## src/lib/uml-text.ts

```ts
function frontMatter(input: string) => { title?: string; body: string; offset: number; }
type Groups = readonly (string | undefined)[]
function layoutLine(diagram: UmlSpec, comment: '%%' | '\'') => string | null
function lineBreaks(value: string) => string
function macroArgs(input: string) => string[]
function match(re: RegExp, text: string) => Groups | null
function oneLine(value: string) => string
function problem(line: SourceLine, code: UmlProblem['code'], severity?: UmlProblem['severity']) => UmlProblem
function quote(value: string) => string
type SourceLine = {}
SourceLine.no: number
SourceLine.text: string
function sourceLines(input: string) => SourceLine[]
const STYLING: RegExp
function titleBlock(title: string | undefined) => string[]
function unquote(value: string) => string
function withLayoutLine(result: UmlParseResult, input: string) => UmlParseResult
function withoutColors(text: string) => string
```

## src/lib/uml-mermaid.ts

```ts
function isMermaidSpec(diagram: UmlSpec) => diagram is MermaidSpec
type MermaidSpec = ActivityDiagram | import("@/lib/uml").ClassDiagram | import("@/lib/uml").SequenceDiagram | import("@/lib/uml").StateDiagram | import("@/lib/uml").ErDiagram | import("@/lib/uml").C4Diagram
function parseMermaid(input: string) => UmlParseResult
function toMermaid(diagram: UmlSpec) => string
```

## src/lib/uml-mermaid-class.ts

```ts
function classToMermaid(diagram: ClassDiagram) => string
function memberText(m: ClassMember) => string
function parseClassDiagram(lines: readonly SourceLine[], title?: string) => { diagram: ClassDiagram; problems: UmlProblem[]; }
function parseMember(input: string) => ClassMember
```

## src/lib/uml-mermaid-state.ts

```ts
function parseStateDiagram(lines: readonly SourceLine[], title?: string) => { diagram: StateDiagram; problems: UmlProblem[]; }
function stateToMermaid(diagram: StateDiagram) => string
```

## src/lib/uml-mermaid-er.ts

```ts
function erAttributeText(a: ErAttribute) => string
function erRelationMarks(r: ErRelation) => string
function erToMermaid(diagram: ErDiagram) => string
function parseErAttribute(text: string) => ErAttribute | null
function parseErDiagram(lines: readonly SourceLine[], title?: string) => { diagram: ErDiagram; problems: UmlProblem[]; }
```

## src/lib/uml-mermaid-sequence.ts

```ts
function parseSequenceDiagram(lines: readonly SourceLine[], title?: string) => { diagram: SequenceDiagram; problems: UmlProblem[]; }
function sequenceToMermaid(diagram: SequenceDiagram) => string
```

## src/lib/uml-mermaid-c4.ts

```ts
function c4Level(header: string) => C4Level | null
function c4ToMermaid(diagram: C4Diagram) => string
function parseC4Diagram(level: C4Level, lines: readonly SourceLine[], title?: string) => { diagram: C4Diagram; problems: UmlProblem[]; }
```

## src/lib/uml-mermaid-flowchart.ts

```ts
function activityToMermaid(d: ActivityDiagram) => string
function isFlowchart(header: string) => boolean
function parseFlowchart(header: string, lines: readonly SourceLine[], title: string | undefined) => { diagram: ActivityDiagram; problems: UmlProblem[]; }
```

## src/lib/uml-plantuml.ts

```ts
function isPlantUml(input: string) => boolean
function parsePlantUml(input: string) => UmlParseResult
function toPlantUml(diagram: UmlSpec) => string
```

## src/lib/uml-plantuml-activity.ts

```ts
const ACTIVITY_LINE: RegExp
function activityToPlantUml(d: ActivityDiagram) => string
function parsePlantActivity(lines: readonly SourceLine[], title?: string) => { diagram: ActivityDiagram; problems: UmlProblem[]; }
```

## src/lib/uml-plantuml-elements.ts

```ts
function arrowOf(m: readonly (string | undefined)[]) => { dotted: boolean; triangleAtFrom: boolean; triangleAtTo: boolean; }
function commonLine(p: ElementParse<unknown>, line: SourceLine) => boolean
function declaration(word: string, e: { id: string; label?: string; }, extra?: string) => string
function deploymentToPlantUml(d: DeploymentDiagram) => string
function directionLine(direction: UmlDirection | undefined, usual: UmlDirection) => string[]
type ElementParse<E> = {}
ElementParse.elements: Map<string, E>
ElementParse.problems: UmlProblem[]
ElementParse.notes: UmlNote[]
ElementParse.stack: { id: string; line: SourceLine; }[]
ElementParse.direction?: UmlDirection | undefined
ElementParse.title?: string | undefined
const END: string
function idOf(name: string) => string
function keyword(label: string | undefined, words: readonly string[]) => { label: string; word?: undefined; } | { word: string; label: string; }
const LINE: RegExp
function notesText(notes: readonly UmlNote[] | undefined) => string[]
function parsePlantDeployment(lines: readonly SourceLine[], title?: string) => { diagram: DeploymentDiagram; problems: UmlProblem[]; }
function parsePlantUseCase(lines: readonly SourceLine[], title?: string) => { diagram: UseCaseDiagram; problems: UmlProblem[]; }
function readNamed(text: string) => Named | null
const STEREOTYPE: RegExp
function usecaseToPlantUml(d: UseCaseDiagram) => string
function wrap(title: string | undefined, lines: readonly string[]) => string
```

## src/lib/uml-plantuml-structure.ts

```ts
function componentToPlantUml(d: ComponentDiagram) => string
function packageToPlantUml(d: PackageDiagram) => string
function parsePlantComponent(lines: readonly SourceLine[]) => { diagram: ComponentDiagram; problems: UmlProblem[]; }
function parsePlantPackage(lines: readonly SourceLine[]) => { diagram: PackageDiagram; problems: UmlProblem[]; }
```

## src/lib/uml-plantuml-write.ts

```ts
function toPlantUml(diagram: UmlSpec) => string
```

## src/lib/uml-graph-base.ts

```ts
type DiagramEdge = {}
DiagramEdge.id: string
DiagramEdge.source: string
DiagramEdge.target: string
DiagramEdge.from: string
DiagramEdge.to: string
DiagramEdge.relation: DiagramRelation
DiagramEdge.dashed?: boolean | undefined
DiagramEdge.sourceMarker?: DiagramMarker | undefined
DiagramEdge.targetMarker?: DiagramMarker | undefined
DiagramEdge.label?: string | undefined
DiagramEdge.sourceLabel?: string | undefined
DiagramEdge.targetLabel?: string | undefined
DiagramEdge.cardinality?: [ErCardinality, ErCardinality] | undefined
DiagramEdge.technology?: string | undefined
type DiagramGraph = {}
DiagramGraph.direction: UmlDirection
DiagramGraph.nodes: DiagramNode[]
DiagramGraph.edges: DiagramEdge[]
type DiagramMarker = 'diamond' | 'assembly' | 'zeroOrOne' | 'zeroOrMore' | 'oneOrMore' | 'triangle' | 'diamondFilled' | 'arrow' | 'arrowFilled' | 'one' | 'socket'
type DiagramNode = {}
DiagramNode.id: string
DiagramNode.parent?: string | undefined
DiagramNode.border?: boolean | undefined
DiagramNode.shape: DiagramShape
DiagramNode.role: DiagramRole
DiagramNode.title: string
DiagramNode.stereotype?: string | undefined
DiagramNode.technology?: string | undefined
DiagramNode.variant?: 'component' | 'artifact' | 'database' | 'cloud' | 'queue' | undefined
DiagramNode.italicTitle?: boolean | undefined
DiagramNode.body?: string | undefined
DiagramNode.compartments?: DiagramRow[][] | undefined
DiagramNode.tone?: DiagramTone | undefined
DiagramNode.width: number
DiagramNode.height: number
type DiagramRelation = 'note' | 'merge' | 'provide' | 'require' | 'assembly' | 'delegate' | 'deploy' | 'import' | 'include' | 'extend' | 'generalization' | ClassRelationKind | 'er' | 'c4' | 'transition' | 'flow'
type DiagramRole = 'end' | 'note' | 'start' | 'action' | 'decision' | 'merge' | 'flowEnd' | 'fork' | 'join' | 'partition' | 'interface' | 'port' | 'node' | 'device' | 'environment' | 'artifact' | 'database' | 'cloud' | 'package' | 'class' | 'actor' | 'usecase' | C4ElementKind | 'state' | 'choice' | 'namespace' | 'composite' | 'entity' | 'boundary' | 'subject'
type DiagramRow = {}
DiagramRow.text: string
DiagramRow.prefix?: string | undefined
DiagramRow.suffix?: string | undefined
DiagramRow.underline?: boolean | undefined
DiagramRow.italic?: boolean | undefined
type DiagramShape = 'end' | 'ellipse' | 'frame' | 'note' | 'start' | 'decision' | 'flowEnd' | 'port' | 'actor' | 'person' | 'choice' | 'box' | 'rounded' | 'bar' | 'node3d' | 'lollipop' | 'folder'
type DiagramTone = 'primary' | 'default' | 'external'
function noteNodes(notes: readonly UmlNote[] | undefined, parentOf: (id: string) => string | undefined) => { nodes: DiagramNode[]; edges: DiagramEdge[]; }
function sizeBox(node: Omit<DiagramNode, 'width' | 'height'>, minWidth?: number) => { width: number; height: number; shape: DiagramShape; body?: string | undefined; title: string; id: string; parent?: string | undefined; stereotype?: string | undefined; border?: boolean | undefined; role: DiagramRole; technology?: string | undefined; variant?: 'database' | 'queue' | 'artifact' | 'component' | 'cloud' | undefined; italicTitle?: boolean | undefined; compartments?: DiagramRow[][] | undefined; tone?: DiagramTone | undefined; }
function textWidth(text: string, char?: number) => number
function wrappedLines(text: string, width: number) => number
```

## src/lib/uml-graph.ts

```ts
type DiagramEdge = {}
DiagramEdge.id: string
DiagramEdge.source: string
DiagramEdge.target: string
DiagramEdge.from: string
DiagramEdge.to: string
DiagramEdge.relation: DiagramRelation
DiagramEdge.dashed?: boolean | undefined
DiagramEdge.sourceMarker?: DiagramMarker | undefined
DiagramEdge.targetMarker?: DiagramMarker | undefined
DiagramEdge.label?: string | undefined
DiagramEdge.sourceLabel?: string | undefined
DiagramEdge.targetLabel?: string | undefined
DiagramEdge.cardinality?: [ErCardinality, ErCardinality] | undefined
DiagramEdge.technology?: string | undefined
type DiagramGraph = {}
DiagramGraph.direction: UmlDirection
DiagramGraph.nodes: DiagramNode[]
DiagramGraph.edges: DiagramEdge[]
type DiagramMarker = 'diamond' | 'assembly' | 'zeroOrOne' | 'zeroOrMore' | 'oneOrMore' | 'triangle' | 'diamondFilled' | 'arrow' | 'arrowFilled' | 'one' | 'socket'
type DiagramNode = {}
DiagramNode.id: string
DiagramNode.parent?: string | undefined
DiagramNode.border?: boolean | undefined
DiagramNode.shape: DiagramShape
DiagramNode.role: DiagramRole
DiagramNode.title: string
DiagramNode.stereotype?: string | undefined
DiagramNode.technology?: string | undefined
DiagramNode.variant?: 'component' | 'artifact' | 'database' | 'cloud' | 'queue' | undefined
DiagramNode.italicTitle?: boolean | undefined
DiagramNode.body?: string | undefined
DiagramNode.compartments?: DiagramRow[][] | undefined
DiagramNode.tone?: DiagramTone | undefined
DiagramNode.width: number
DiagramNode.height: number
type DiagramRelation = 'note' | 'merge' | 'provide' | 'require' | 'assembly' | 'delegate' | 'deploy' | 'import' | 'include' | 'extend' | 'generalization' | ClassRelationKind | 'er' | 'c4' | 'transition' | 'flow'
type DiagramRole = 'end' | 'note' | 'start' | 'action' | 'decision' | 'merge' | 'flowEnd' | 'fork' | 'join' | 'partition' | 'interface' | 'port' | 'node' | 'device' | 'environment' | 'artifact' | 'database' | 'cloud' | 'package' | 'class' | 'actor' | 'usecase' | C4ElementKind | 'state' | 'choice' | 'namespace' | 'composite' | 'entity' | 'boundary' | 'subject'
type DiagramRow = {}
DiagramRow.text: string
DiagramRow.prefix?: string | undefined
DiagramRow.suffix?: string | undefined
DiagramRow.underline?: boolean | undefined
DiagramRow.italic?: boolean | undefined
type DiagramShape = 'end' | 'ellipse' | 'frame' | 'note' | 'start' | 'decision' | 'flowEnd' | 'port' | 'actor' | 'person' | 'choice' | 'box' | 'rounded' | 'bar' | 'node3d' | 'lollipop' | 'folder'
type DiagramTone = 'primary' | 'default' | 'external'
function relationIndexOf(edgeId: string) => number | null
function toDiagramGraph(diagram: UmlSpec) => DiagramGraph | null
```

## src/lib/uml-graph-elements.ts

```ts
function elementGraph(diagram: ElementDiagram) => DiagramGraph
```

## src/lib/uml-layout.ts

```ts
const FRAME_HEAD: 40
const FRAME_PAD: 24
type LayoutBox = {}
LayoutBox.width: number
LayoutBox.height: number
LayoutBox.x: number
LayoutBox.y: number
function layoutDiagram(input: { nodes: readonly LayoutNode[]; edges: readonly LayoutEdge[]; direction?: UmlDirection; fixed?: UmlLayout; }) => Map<string, LayoutBox>
type LayoutEdge = {}
LayoutEdge.source: string
LayoutEdge.target: string
type LayoutNode = {}
LayoutNode.id: string
LayoutNode.parent?: string | undefined
LayoutNode.border?: boolean | undefined
LayoutNode.width: number
LayoutNode.height: number
```

## src/lib/uml-sequence.ts

```ts
function layoutSequence(d: SequenceDiagram) => SequenceLayout
type SequenceColumn = {}
SequenceColumn.id: string
SequenceColumn.label: string
SequenceColumn.kind: 'actor' | 'participant'
SequenceColumn.x: number
SequenceColumn.width: number
type SequenceItem = { type: 'message'; y: number; from: number; to: number; self: boolean; text: string; arrow: SequenceArrow; number?: number; fromId: string; toId: string; id: string; } | { type: 'note'; x: number; y: number; width: number; height: number; text: string; who: string[]; id: string; } | { type: 'block'; kind: SequenceBlockKind; x: number; y: number; width: number; height: number; sections: { label: string; y: number; }[]; depth: number; id: string; } | { type: 'activation'; participant: string; x: number; y1: number; y2: number; }
type SequenceLayout = {}
SequenceLayout.width: number
SequenceLayout.height: number
SequenceLayout.columns: SequenceColumn[]
SequenceLayout.items: SequenceItem[]
SequenceLayout.top: number
SequenceLayout.bottom: number
```

## src/lib/uml-edit.ts

```ts
function addElement(diagram: UmlSpec, input: AddElementInput) => EditResult
type AddElementInput = {}
AddElementInput.type: UmlElementType
AddElementInput.name: string
AddElementInput.near?: string | undefined
function addRelation(diagram: UmlSpec, input: AddRelationInput) => UmlSpec
type AddRelationInput = {}
AddRelationInput.type: UmlRelationType
AddRelationInput.from: string
AddRelationInput.to: string
AddRelationInput.label?: string | undefined
function canDelete(diagram: UmlSpec, selection: UmlSelection) => boolean
function deleteItems(diagram: UmlSpec, selection: UmlSelection) => UmlSpec
type EditResult = {}
EditResult.diagram: UmlSpec
EditResult.id: string
function elementTypes(diagram: UmlSpec) => readonly UmlElementType[]
const NAMESPACE: 'namespace:'
function noteIndex(id: string) => number | null
function relationEnds(diagram: UmlSpec) => { id: string; name: string; }[]
function relationTypes(diagram: UmlSpec) => readonly UmlRelationType[]
const START_END: '[*]'
function takenIds(diagram: UmlSpec) => Set<string>
function toIdentifier(name: string, fallback?: string) => string
const UML_DRAG_TYPE: 'application/x-coreloom-uml-element'
type UmlElementType = 'note' | 'system' | 'person' | 'container' | SequenceBlockKind | 'state' | 'choice' | 'entity' | 'boundary' | ElementTypeOfKinds | 'abstract' | 'enumeration' | 'participant' | 'externalPerson' | 'externalSystem' | 'queue'
type UmlRelationType = 'reply' | 'uses' | 'inheritance' | 'realization' | 'composition' | 'aggregation' | 'sync' | 'async' | 'transition' | RelationTypeOfKinds | 'oneToOne' | 'oneToMany' | 'manyToMany' | 'usesBoth'
type UmlSelection = {}
UmlSelection.elements: readonly string[]
UmlSelection.relations: readonly number[]
function uniqueId(base: string, taken: ReadonlySet<string>) => string
```

## src/lib/uml-edit-fields.ts

```ts
function elementFields(diagram: UmlSpec, id: string) => UmlElementFields | null
function memberFromText(text: string, current: ClassMember) => ClassMember
function relationFields(diagram: UmlSpec, index: number) => UmlRelationFields | null
function renameElement(diagram: UmlSpec, id: string, name: string) => EditResult
function reverseRelation(diagram: UmlSpec, index: number) => UmlSpec
function setElementFields(diagram: UmlSpec, id: string, fields: UmlElementFields) => EditResult
function setRelationFields(diagram: UmlSpec, index: number, f: UmlRelationFields) => UmlSpec
type UmlElementFields = {}
UmlElementFields.name: string
UmlElementFields.stereotype?: string | undefined
UmlElementFields.members?: ClassMember[] | undefined
UmlElementFields.attributes?: string | undefined
UmlElementFields.description?: string | undefined
UmlElementFields.technology?: string | undefined
UmlElementFields.external?: boolean | undefined
UmlElementFields.actor?: boolean | undefined
type UmlRelationFields = {}
UmlRelationFields.type?: UmlRelationType | undefined
UmlRelationFields.label: string
UmlRelationFields.fromCardinality?: string | undefined
UmlRelationFields.toCardinality?: string | undefined
UmlRelationFields.fromEnd?: ErCardinality | undefined
UmlRelationFields.toEnd?: ErCardinality | undefined
UmlRelationFields.technology?: string | undefined
```

## src/lib/uml-edit-sequence.ts

```ts
function addSection(diagram: SequenceDiagram, id: string) => SequenceDiagram
function canAddSection(kind: SequenceBlockKind) => boolean
function insertAt(diagram: SequenceDiagram, path: readonly number[], steps: readonly SequenceStep[]) => SequenceDiagram
function insertBlock(diagram: SequenceDiagram, kind: SequenceBlockKind, near?: string) => StepResult
function insertMessage(diagram: SequenceDiagram, input: MessageInput, near?: string) => StepResult
function insertNote(diagram: SequenceDiagram, text: string, near?: string) => StepResult
function insertStep(diagram: SequenceDiagram, step: SequenceStep, near?: string) => StepResult
function keepSteps(steps: readonly SequenceStep[], removed: ReadonlySet<string>, prefix?: readonly number[]) => SequenceStep[]
function listOf(steps: readonly SequenceStep[], path: readonly number[]) => readonly SequenceStep[]
type MessageInput = {}
MessageInput.from: string
MessageInput.to: string
MessageInput.text?: string | undefined
MessageInput.arrow?: SequenceArrow | undefined
function moveStep(diagram: SequenceDiagram, id: string, delta: -1 | 1) => StepResult
function participantOptions(diagram: SequenceDiagram) => { id: string; name: string; }[]
function placeFor(diagram: SequenceDiagram, near: string | undefined) => number[]
function removeSection(diagram: SequenceDiagram, id: string, index: number) => SequenceDiagram
function setStep(diagram: SequenceDiagram, id: string, step: SequenceStep) => SequenceDiagram
function stepAt(steps: readonly SequenceStep[], path: readonly number[]) => SequenceStep | undefined
function stepId(path: readonly number[]) => string
function stepIds(steps: readonly SequenceStep[], prefix?: readonly number[]) => string[]
function stepOf(diagram: SequenceDiagram, id: string) => SequenceStep | undefined
function stepPath(id: string) => number[] | null
type StepResult = {}
StepResult.diagram: SequenceDiagram
StepResult.id: string
```

## src/lib/uml-edit-clipboard.ts

```ts
function canCopy(diagram: UmlSpec, selection: UmlSelection) => boolean
function copyItems(diagram: UmlSpec, selection: UmlSelection) => UmlClip | null
function duplicateItems(diagram: UmlSpec, selection: UmlSelection) => PasteResult
function pasteItems(diagram: UmlSpec, clip: UmlClip, near?: string) => PasteResult
type PasteResult = {}
PasteResult.diagram: UmlSpec
PasteResult.selection: UmlSelection
type UmlClip = {}
UmlClip.diagram: UmlSpec
UmlClip.namespaces?: string[] | undefined
```

## src/lib/uml-edit-elements.ts

```ts
function addTo(d: ElementDiagram, input: { type: string; id: string; label?: string; near?: string; }) => ElementDiagram | null
function copyIn(d: ElementDiagram, picked: ReadonlySet<string>) => ElementDiagram | null
function deleteIn(d: ElementDiagram, removed: ReadonlySet<string>, rel: ReadonlySet<number>) => ElementDiagram
type ElementTypeOfKinds = 'end' | 'start' | 'action' | 'decision' | 'merge' | 'flowEnd' | 'fork' | 'join' | 'partition' | 'component' | 'interface' | 'port' | 'node' | 'device' | 'environment' | 'artifact' | 'database' | 'cloud' | 'package' | 'class' | 'actor' | 'usecase' | 'subject'
function elementTypesOf(d: ElementDiagram) => readonly (ElementTypeOfKinds | 'note')[]
function fieldsIn(d: ElementDiagram, id: string) => { name: string; stereotype?: string; } | null
function hasStereotypes(d: ElementDiagram) => boolean
function isElementDiagram(diagram: UmlSpec) => diagram is ElementDiagram
function pasteIn(d: ElementDiagram, clip: ElementDiagram, fresh: (ids: readonly string[]) => ReadonlyMap<string, string>) => { diagram: ElementDiagram; ids: string[]; } | null
function relateIn(d: ElementDiagram, input: { type: string; from: string; to: string; label: string; }) => ElementDiagram
function relationFieldsIn(d: ElementDiagram, index: number) => { type?: RelationTypeOfKinds; label: string; } | null
type RelationTypeOfKinds = 'link' | 'merge' | 'dependency' | 'provide' | 'require' | 'assembly' | 'delegate' | 'deploy' | 'import' | 'association' | 'include' | 'extend' | 'generalization' | 'flow'
function relationTypesOf(d: ElementDiagram) => readonly RelationTypeOfKinds[]
function renameIdIn(d: ElementDiagram, from: string, to: string) => ElementDiagram
function reverseIn(d: ElementDiagram, index: number) => ElementDiagram
function setElementField(d: ElementDiagram, id: string, key: 'label' | 'stereotype', value: string | null) => ElementDiagram
function setRelationIn(d: ElementDiagram, index: number, fields: { type?: string; label: string; }) => ElementDiagram
```

## src/lib/uml-arrange.ts

```ts
function alignBoxes(boxes: readonly ArrangeBox[], how: UmlAlignment) => UmlLayout
const ALIGNMENTS: readonly UmlAlignment[]
type ArrangeBox = {}
ArrangeBox.id: string
ArrangeBox.x: number
ArrangeBox.y: number
ArrangeBox.width: number
ArrangeBox.height: number
function canAlign(how: UmlAlignment, count: number) => boolean
function clearLayout(diagram: UmlSpec) => UmlSpec
const DIRECTIONS: readonly UmlDirection[]
function setDirection(diagram: UmlSpec, direction: UmlDirection) => UmlSpec
type UmlAlignment = 'center' | 'left' | 'right' | 'top' | 'middle' | 'bottom' | 'distributeHorizontally' | 'distributeVertically'
```
