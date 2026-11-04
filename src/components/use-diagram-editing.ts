'use client'

// Coreloom UI — useDiagramEditing. What the diagram editor's tools do: each change is made on the
// model (uml-edit.ts), written back as text in the current format, and kept so it can be undone.
// Typing in the text starts a new history: the text editor has its own undo.
import * as React from 'react'

import type { Messages } from '@/lib/i18n'
import { toUmlJson, type UmlLayout, type UmlSpec } from '@/lib/uml'
import {
  addElement,
  addRelation,
  type AddRelationInput,
  canDelete,
  deleteItems,
  relationTypes,
  takenIds,
  type UmlElementType,
  type UmlRelationType,
  type UmlSelection,
} from '@/lib/uml-edit'
import {
  elementFields,
  reverseRelation,
  setElementFields,
  setRelationFields,
  type UmlElementFields,
  type UmlRelationFields,
} from '@/lib/uml-edit-fields'

const NOTHING: UmlSelection = { elements: [], relations: [] }

/** A text as it was before a change, with the positions dragged then. */
interface Snapshot {
  text: string
  layout: UmlLayout | null
}

interface History {
  past: Snapshot[]
  future: Snapshot[]
}

const EMPTY: History = { past: [], future: [] }
/** Enough to undo a working session; older steps are dropped. */
const DEPTH = 100

function relationCount(d: UmlSpec): number {
  switch (d.kind) {
    case 'state':
      return d.transitions.length
    case 'sequence':
      return 0
    default:
      return d.relations.length
  }
}

/** The part of a selection the diagram still has (after a text edit, say). */
function present(d: UmlSpec, selection: UmlSelection): UmlSelection {
  const ids = takenIds(d)
  const elements = selection.elements.filter((id) => ids.has(id) || elementFields(d, id))
  const relations = selection.relations.filter((i) => i < relationCount(d))
  if (
    elements.length === selection.elements.length &&
    relations.length === selection.relations.length
  )
    return selection
  return { elements, relations }
}

function useDiagramEditing({
  diagram,
  text,
  layout,
  write,
  setText,
  setLayout,
  t,
}: {
  /** The diagram as drawn (with dragged positions); null when the text can't be read. */
  diagram: UmlSpec | null
  text: string
  layout: UmlLayout | null
  /** The diagram as text in the current format. */
  write: (diagram: UmlSpec) => string
  setText: (text: string) => void
  setLayout: (layout: UmlLayout | null) => void
  t: Messages['diagramTools']
}) {
  const [selected, setSelected] = React.useState<UmlSelection>(NOTHING)
  const [history, setHistory] = React.useState<History>(EMPTY)
  const [notice, setNotice] = React.useState<string | null>(null)
  const [lastType, setLastType] = React.useState<UmlRelationType | null>(null)
  const nameRef = React.useRef<HTMLInputElement>(null)
  // An element just added: its name field takes focus once the panel shows it.
  const focusName = React.useRef<string | null>(null)
  const selection = diagram ? present(diagram, selected) : NOTHING

  React.useEffect(() => {
    const id = focusName.current
    if (!id || !diagram || !elementFields(diagram, id)) return
    focusName.current = null
    // After a menu that closed has given focus back to its button.
    const timer = window.setTimeout(() => {
      nameRef.current?.focus()
      nameRef.current?.select()
    }, 0)
    return () => {
      window.clearTimeout(timer)
    }
  }, [diagram])

  const apply = (next: UmlSpec, message: string, select: UmlSelection) => {
    if (!diagram || toUmlJson(next) === toUmlJson(diagram)) return
    setHistory((h) => ({ past: [...h.past.slice(1 - DEPTH), { text, layout }], future: [] }))
    setText(write(next))
    setLayout(next.kind === 'sequence' ? null : (next.layout ?? null))
    setSelected(select)
    setNotice(message)
  }

  const step = (direction: 'undo' | 'redo') => {
    const from = direction === 'undo' ? history.past : history.future
    const target = direction === 'undo' ? from.at(-1) : from[0]
    if (!target) return
    const now = { text, layout }
    setHistory(
      direction === 'undo'
        ? { past: history.past.slice(0, -1), future: [now, ...history.future] }
        : { past: [...history.past, now], future: history.future.slice(1) },
    )
    setText(target.text)
    setLayout(target.layout)
    setNotice(direction === 'undo' ? t.undone : t.redone)
  }

  const add = (type: UmlElementType) => {
    if (!diagram) return
    const name = t.elements[type]
    const result = addElement(diagram, { type, name, near: selection.elements.at(0) })
    if (diagram.kind !== 'sequence') focusName.current = result.id
    apply(result.diagram, t.added(name), { elements: [result.id], relations: [] })
  }

  const connect = (input: AddRelationInput) => {
    if (!diagram) return
    const next = addRelation(diagram, input)
    setLastType(input.type)
    const index = relationCount(next) - 1
    apply(next, t.connected, index >= 0 ? { elements: [], relations: [index] } : NOTHING)
  }

  /** A line dragged on the canvas: the kind used last, or the usual one. */
  const connectDragged = (from: string, to: string) => {
    if (!diagram) return
    const type = lastType ?? relationTypes(diagram).at(0) ?? 'association'
    connect({ type, from, to })
  }

  const remove = (what: UmlSelection = selection) => {
    if (!diagram || !canDelete(diagram, what)) return
    const count = what.elements.length + what.relations.length
    apply(deleteItems(diagram, what), t.deleted(count), NOTHING)
  }

  const changeElement = (id: string, fields: UmlElementFields) => {
    if (!diagram) return
    const result = setElementFields(diagram, id, fields)
    apply(result.diagram, t.changed, { elements: [result.id], relations: [] })
  }

  const changeRelation = (index: number, fields: UmlRelationFields) => {
    if (diagram) apply(setRelationFields(diagram, index, fields), t.changed, selection)
  }

  const reverse = (index: number) => {
    if (diagram) apply(reverseRelation(diagram, index), t.changed, selection)
  }

  /** The person typed, switched format or started again: the tools' history no longer applies. */
  const reset = () => {
    setHistory(EMPTY)
    setNotice(null)
  }

  return {
    selection,
    select: setSelected,
    notice,
    nameRef,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    canDelete: diagram ? canDelete(diagram, selection) : false,
    undo: () => {
      step('undo')
    },
    redo: () => {
      step('redo')
    },
    add,
    connect,
    connectDragged,
    remove,
    changeElement,
    changeRelation,
    reverse,
    reset,
  }
}

export { useDiagramEditing }
