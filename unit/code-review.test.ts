// The code review block's data side: line counts, where a comment thread sits in a diff (and which
// threads fell out of it), and the folder tree of the changed files.
import { describe, expect, it } from 'vitest'

import {
  diffStats,
  lineAnchor,
  outdatedThreads,
  reviewStats,
  type ReviewThread,
  reviewTree,
  threadsByAnchor,
  threadsForLine,
} from '@/components/code-review-model'
import { diffLines } from '@/components/ui/diff-viewer'

const thread = (over: Partial<ReviewThread> & Pick<ReviewThread, 'id'>): ReviewThread => ({
  path: 'a.ts',
  line: 1,
  side: 'new',
  comments: [],
  ...over,
})

describe('diffStats and reviewStats', () => {
  it('counts added and removed lines', () => {
    expect(diffStats(diffLines('a\nb\nc', 'a\nB\nc\nd'))).toEqual({ added: 2, removed: 1 })
  })

  it('adds up every file, and an empty review is zero', () => {
    expect(
      reviewStats([
        { path: 'a', status: 'modified', before: 'x', after: 'y' },
        { path: 'b', status: 'added', before: '', after: '1\n2' },
        { path: 'c', status: 'deleted', before: '1', after: '' },
      ]),
    ).toEqual({ files: 3, added: 3, removed: 2 })
    expect(reviewStats([])).toEqual({ files: 0, added: 0, removed: 0 })
  })
})

describe('lineAnchor', () => {
  it('anchors removed lines in the old text and the others in the new one', () => {
    const lines = diffLines('a\nold\nc', 'a\nnew\nc')
    expect(lines.map(lineAnchor)).toEqual([
      { side: 'new', line: 1 },
      { side: 'old', line: 2 },
      { side: 'new', line: 2 },
      { side: 'new', line: 3 },
    ])
  })
})

describe('threads on lines', () => {
  // Line 1 removed, so the unchanged "b" is line 2 before and line 1 after.
  const lines = diffLines('x\nb', 'b')
  const threads = [
    thread({ id: 'removed', side: 'old', line: 1 }),
    thread({ id: 'by-new-number', side: 'new', line: 1 }),
    thread({ id: 'by-old-number', side: 'old', line: 2 }),
    thread({ id: 'gone', side: 'new', line: 40 }),
    thread({ id: 'other-file', path: 'b.ts' }),
  ]
  const byAnchor = threadsByAnchor(threads, 'a.ts')

  it('keeps only the file’s threads', () => {
    expect([...byAnchor.values()].flat().map((t) => t.id)).not.toContain('other-file')
  })

  it('finds a removed line’s threads by its old number', () => {
    expect(threadsForLine(byAnchor, lines[0]).map((t) => t.id)).toEqual(['removed'])
  })

  it('finds an unchanged line’s threads by either number', () => {
    expect(threadsForLine(byAnchor, lines[1]).map((t) => t.id)).toEqual([
      'by-new-number',
      'by-old-number',
    ])
  })

  it('reports threads whose line left the diff', () => {
    expect(outdatedThreads(byAnchor, lines).map((t) => t.id)).toEqual(['gone'])
  })

  it('keeps several threads on one line in order', () => {
    const two = threadsByAnchor([thread({ id: '1' }), thread({ id: '2' })], 'a.ts')
    expect(threadsForLine(two, diffLines('a', 'a')[0]).map((t) => t.id)).toEqual(['1', '2'])
  })
})

describe('reviewTree', () => {
  it('puts folders first, sorts by name and merges single-folder chains', () => {
    const tree = reviewTree([
      'src/components/ui/button.tsx',
      'src/components/ui/Badge.tsx',
      'README.md',
      'src/lib/utils.ts',
      'docs/guide/intro.md',
    ])
    expect(tree.map((n) => n.name)).toEqual(['docs/guide', 'src', 'README.md'])
    const src = tree[1]
    expect(src.children?.map((n) => n.name)).toEqual(['components/ui', 'lib'])
    expect(src.children?.[0].children?.map((n) => n.path)).toEqual([
      'src/components/ui/Badge.tsx',
      'src/components/ui/button.tsx',
    ])
    expect(src.children?.[0].id).toBe('dir:src/components/ui')
  })

  it('handles an empty list and files at the root', () => {
    expect(reviewTree([])).toEqual([])
    expect(reviewTree(['b', 'a'])).toEqual([
      { id: 'a', name: 'a', path: 'a' },
      { id: 'b', name: 'b', path: 'b' },
    ])
  })
})
