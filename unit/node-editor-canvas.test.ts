import { describe, expect, it } from 'vitest'

import { layoutWorkflow, removeNodes, type Workflow } from '@/components/ui/node-editor'
import {
  addGroup,
  addNote,
  groupMembers,
  moveGroup,
  refitGroups,
  removeCanvasItems,
  updateGroup,
  updateNote,
} from '@/components/ui/node-editor-canvas'

const wf: Workflow = {
  nodes: [
    { id: 'a', type: 'step', position: { x: 0, y: 0 } },
    { id: 'b', type: 'step', position: { x: 400, y: 0 } },
    { id: 'c', type: 'step', position: { x: 1200, y: 600 } },
  ],
  edges: [{ id: 'e1', source: 'a', target: 'b' }],
}

describe('addNote', () => {
  it('adds a note with a free id and a default size', () => {
    const { workflow, id } = addNote(wf, { position: { x: 10.4, y: 20.6 }, text: 'Hi' })
    expect(id).toBe('note-1')
    expect(workflow.notes).toEqual([
      { id: 'note-1', position: { x: 10, y: 21 }, width: 240, height: 140, text: 'Hi' },
    ])
    expect(addNote(workflow, { position: { x: 0, y: 0 } }).id).toBe('note-2')
  })

  it('never reuses a node id', () => {
    const taken: Workflow = { ...wf, nodes: [...wf.nodes, { ...wf.nodes[0], id: 'note-1' }] }
    expect(addNote(taken, { position: { x: 0, y: 0 } }).id).toBe('note-2')
  })
})

describe('addGroup', () => {
  it('frames the given nodes with room around them and a header', () => {
    const { workflow, id } = addGroup(wf, { label: 'Pair', nodeIds: ['a', 'b'] })
    const g = workflow.groups?.find((x) => x.id === id)
    // Nodes span 0..640 × 0..72 (unmeasured cards are 240 × 72).
    expect(g).toEqual({
      id: 'group-1',
      label: 'Pair',
      position: { x: -32, y: -68 },
      width: 704,
      height: 172,
    })
  })

  it('uses measured sizes', () => {
    const sizes = new Map([['a', { width: 240, height: 200 }]])
    const g = addGroup(wf, { label: 'A', nodeIds: ['a'], sizes }).workflow.groups?.[0]
    expect(g?.height).toBe(200 + 64 + 36)
  })

  it('makes an empty frame at a position when no node is given', () => {
    const g = addGroup(wf, { label: 'Empty', position: { x: 5, y: 6 } }).workflow.groups?.[0]
    expect(g).toMatchObject({ position: { x: 5, y: 6 }, width: 420, height: 260 })
    // Unknown ids frame nothing.
    const h = addGroup(wf, { label: 'X', nodeIds: ['nope'], position: { x: 1, y: 1 } }).workflow
      .groups?.[0]
    expect(h).toMatchObject({ position: { x: 1, y: 1 }, width: 420 })
  })
})

describe('groupMembers and moveGroup', () => {
  const grouped = addGroup(
    addNote(wf, { position: { x: 100, y: 100 }, width: 100, height: 40 }).workflow,
    { label: 'G', position: { x: -50, y: -50 }, nodeIds: [] },
  ).workflow
  const sized = updateGroup(grouped, 'group-1', { width: 400, height: 300 })

  it('lists the nodes and notes whose middle is inside', () => {
    // a's middle (120, 36) and the note's (150, 120) are inside; b's (520, 36) isn't.
    expect(groupMembers(sized, 'group-1')).toEqual(['a', 'note-1'])
    expect(groupMembers(sized, 'nope')).toEqual([])
  })

  it('moves the group and what is inside, except what already moved', () => {
    const moved = moveGroup(sized, 'group-1', { x: 10, y: 20 })
    expect(moved.groups?.[0]?.position).toEqual({ x: -40, y: -30 })
    expect(moved.nodes.find((n) => n.id === 'a')?.position).toEqual({ x: 10, y: 20 })
    expect(moved.nodes.find((n) => n.id === 'b')?.position).toEqual({ x: 400, y: 0 })
    expect(moved.notes?.[0]?.position).toEqual({ x: 110, y: 120 })

    const skipped = moveGroup(sized, 'group-1', { x: 10, y: 0 }, { skip: new Set(['a']) })
    expect(skipped.nodes.find((n) => n.id === 'a')?.position).toEqual({ x: 0, y: 0 })

    const pinned = moveGroup(sized, 'group-1', { x: 10, y: 0 }, { members: ['b'] })
    expect(pinned.nodes.find((n) => n.id === 'b')?.position).toEqual({ x: 410, y: 0 })
    expect(pinned.nodes.find((n) => n.id === 'a')?.position).toEqual({ x: 0, y: 0 })
  })

  it('returns the graph unchanged for no move or an unknown group', () => {
    expect(moveGroup(sized, 'group-1', { x: 0, y: 0 })).toBe(sized)
    expect(moveGroup(sized, 'nope', { x: 5, y: 5 })).toBe(sized)
  })
})

describe('update and remove', () => {
  const both = addGroup(addNote(wf, { position: { x: 0, y: 0 } }).workflow, {
    label: 'G',
    nodeIds: ['a'],
  }).workflow

  it('updates a note or a group, and ignores unknown ids', () => {
    expect(updateNote(both, 'note-1', { text: 'x', color: 'red' }).notes?.[0]).toMatchObject({
      text: 'x',
      color: 'red',
    })
    expect(updateGroup(both, 'group-1', { label: 'H' }).groups?.[0]?.label).toBe('H')
    expect(updateNote(both, 'group-1', { text: 'x' })).toBe(both)
    expect(updateGroup(wf, 'group-1', { label: 'x' })).toBe(wf)
  })

  it('removes notes and groups but never nodes', () => {
    const after = removeCanvasItems(both, ['note-1', 'group-1', 'a'])
    expect(after.notes).toEqual([])
    expect(after.groups).toEqual([])
    expect(after.nodes).toHaveLength(3)
    expect(removeCanvasItems(both, ['nope'])).toBe(both)
  })

  it('removing nodes keeps the notes and groups', () => {
    const after = removeNodes(both, ['a'])
    expect(after.notes).toHaveLength(1)
    expect(after.groups).toHaveLength(1)
  })
})

describe('refitGroups', () => {
  it('fits a group around its nodes after Tidy up moved them', () => {
    const grouped = addGroup(wf, { label: 'G', nodeIds: ['a', 'b'] }).workflow
    const tidied = layoutWorkflow(grouped)
    const fitted = refitGroups(grouped, tidied)
    const a = tidied.nodes.find((n) => n.id === 'a')!
    expect(fitted.groups?.[0]?.position).toEqual({ x: a.position.x - 32, y: a.position.y - 68 })
    // A graph without groups comes back as is.
    expect(refitGroups(wf, wf)).toBe(wf)
  })
})
