# @coreloom/ai-artifact

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ai-artifact.tsx

```ts
type Artifact = {}
Artifact.id: string
Artifact.title: string
Artifact.kind: ArtifactKind
Artifact.language?: string | undefined
Artifact.filename?: string | undefined
Artifact.versions: readonly ArtifactVersion[]
function ArtifactCard
ArtifactCard.title: string
ArtifactCard.kind: ArtifactKind
ArtifactCard.language?: string | undefined
ArtifactCard.versions?: number | undefined
ArtifactCard.streaming?: boolean | undefined
ArtifactCard.active?: boolean | undefined
ArtifactCard.onOpen: () => void
ArtifactCard.className?: string | undefined
function artifactFilename(artifact: Pick<Artifact, 'title' | 'kind' | 'language' | 'filename'>) => string
type ArtifactKind = 'text' | 'code' | 'markdown'
function ArtifactLayout
ArtifactLayout.open: boolean
ArtifactLayout.panel: React.ReactNode
ArtifactLayout.children: React.ReactNode
ArtifactLayout.defaultSize?: string | number | undefined
ArtifactLayout.minSize?: string | number | undefined
ArtifactLayout.stackBelow?: number | undefined
ArtifactLayout.className?: string | undefined
function ArtifactPanel
ArtifactPanel.artifact: Artifact
ArtifactPanel.version?: string | undefined
ArtifactPanel.defaultVersion?: string | undefined
ArtifactPanel.onVersionChange?: ((versionId: string) => void) | undefined
ArtifactPanel.view?: ArtifactView | undefined
ArtifactPanel.defaultView?: ArtifactView | undefined
ArtifactPanel.onViewChange?: ((view: ArtifactView) => void) | undefined
ArtifactPanel.streaming?: boolean | undefined
ArtifactPanel.onRestore?: ((version: ArtifactVersion) => void) | undefined
ArtifactPanel.onClose?: (() => void) | undefined
ArtifactPanel.actions?: React.ReactNode
ArtifactPanel.className?: string | undefined
type ArtifactVersion = {}
ArtifactVersion.id: string
ArtifactVersion.content: string
ArtifactVersion.label?: string | undefined
ArtifactVersion.createdAt?: string | Date | undefined
type ArtifactView = 'source' | 'preview' | 'changes'
type DiffLine = {}
DiffLine.type: 'equal' | 'add' | 'remove'
DiffLine.text: string
DiffLine.oldLine?: number | undefined
DiffLine.newLine?: number | undefined
function diffLines(before: string, after: string) => DiffLine[]
```
