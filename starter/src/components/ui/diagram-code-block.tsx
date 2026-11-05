'use client'

// Coreloom UI — DiagramCodeBlock. Draws a ```mermaid or ```plantuml block of a Markdown answer as a
// diagram (class, sequence, state, ER, C4, use case, activity, deployment, component, package),
// with a switch back to its source. While the answer is still streaming, and whenever the text
// can't be read whole, the plain code block shows instead. Register it once around a chat:
// `<MarkdownCodeBlocksContext value={diagramCodeBlocks}>`.
import * as React from 'react'

import type { MarkdownCodeBlockProps, MarkdownCodeRenderers } from '@/components/ui/markdown'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { UmlDiagram } from '@/components/ui/uml-diagram'
import { useCoreloomI18n } from '@/lib/i18n'
import type { UmlParseResult, UmlSpec } from '@/lib/uml'
import { parseMermaid } from '@/lib/uml-mermaid'
import { isPlantUml, parsePlantUml } from '@/lib/uml-plantuml'

/** The fence languages read as PlantUML; anything else registered is read as Mermaid. */
const PLANTUML = new Set(['plantuml', 'puml', 'uml'])

/** The diagram in a block, or null when it can't be drawn as written (any error). */
function readBlock(code: string, language: string): UmlSpec | null {
  const result: UmlParseResult =
    PLANTUML.has(language) || isPlantUml(code) ? parsePlantUml(code) : parseMermaid(code)
  if (result.problems.some((p) => p.severity === 'error')) return null
  return result.diagram
}

type View = 'diagram' | 'source'

function DiagramCodeBlock({
  code,
  language,
  streaming,
  children,
  height = 340,
}: MarkdownCodeBlockProps & {
  /** CSS height of the drawing. Default: 340. */
  height?: number | string
}) {
  const { messages } = useCoreloomI18n()
  const t = messages.diagram
  const [view, setView] = React.useState<View>('diagram')
  // Read once the block is complete: half a diagram would flicker with every token.
  const diagram = React.useMemo(
    () => (streaming ? null : readBlock(code, language)),
    [code, language, streaming],
  )
  if (streaming) return <>{children}</>
  if (!diagram) {
    return (
      <div data-slot="diagram-code-block" className="my-3 [&>[data-slot=markdown-code]]:mt-1.5">
        <p className="text-[12.5px] text-muted-foreground">{t.code.failed}</p>
        {children}
      </div>
    )
  }
  const kind = t.kinds[diagram.kind]
  return (
    <div data-slot="diagram-code-block" className="my-3">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {kind}
        </p>
        <SegmentedControl
          size="sm"
          aria-label={t.code.view}
          value={view}
          onValueChange={(v) => {
            setView(v === 'source' ? 'source' : 'diagram')
          }}
          options={[
            { value: 'diagram', label: t.code.diagram },
            { value: 'source', label: t.code.source },
          ]}
        />
      </div>
      {view === 'diagram' ? (
        <UmlDiagram diagram={diagram} height={height} label={kind} />
      ) : (
        <div className="[&>[data-slot=markdown-code]]:my-0">{children}</div>
      )}
    </div>
  )
}

/** The renderers to register: Mermaid and PlantUML fences drawn as diagrams. */
const diagramCodeBlocks: MarkdownCodeRenderers = {
  mermaid: DiagramCodeBlock,
  plantuml: DiagramCodeBlock,
  puml: DiagramCodeBlock,
}

export { DiagramCodeBlock, diagramCodeBlocks }
