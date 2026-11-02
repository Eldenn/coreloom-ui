import { Text } from '@codemirror/state'
import { describe, expect, it } from 'vitest'

import { checkFilePath, fileTree } from '@/components/ide'
import { diagnosticsToOffsets, languageFromPath } from '@/components/ui/code-editor'

describe('languageFromPath', () => {
  it('reads the extension, in any case', () => {
    expect(languageFromPath('src/app.tsx')).toBe('tsx')
    expect(languageFromPath('lib/format.TS')).toBe('typescript')
    expect(languageFromPath('package.json')).toBe('json')
    expect(languageFromPath('scripts/seed.py')).toBe('python')
    expect(languageFromPath('index.html')).toBe('html')
    expect(languageFromPath('notes.md')).toBe('markdown')
  })
  it('falls back to text for unknown names, dotfiles and no extension', () => {
    expect(languageFromPath('Makefile')).toBe('text')
    expect(languageFromPath('.env')).toBe('text')
    expect(languageFromPath('data.xyz')).toBe('text')
    expect(languageFromPath('')).toBe('text')
  })
})

describe('diagnosticsToOffsets', () => {
  const doc = Text.of(['const a = 1', '', 'console.log(a)'])
  it('turns 1-based lines and columns into offsets', () => {
    const [d] = diagnosticsToOffsets(doc, [
      { line: 3, column: 1, endColumn: 12, severity: 'warning', message: 'console' },
    ])
    expect(d).toMatchObject({ from: 13, to: 24, severity: 'warning', message: 'console' })
  })
  it('marks the whole line without a column', () => {
    const [d] = diagnosticsToOffsets(doc, [{ line: 1, severity: 'error', message: 'x' }])
    expect(d).toMatchObject({ from: 0, to: 11 })
  })
  it('clamps stale positions into the document', () => {
    const [past, before, empty] = diagnosticsToOffsets(doc, [
      { line: 99, column: 99, severity: 'info', message: 'past the end' },
      { line: -4, column: -2, endLine: 1, endColumn: 3, severity: 'info', message: 'before' },
      { line: 2, severity: 'info', message: 'empty line' },
    ])
    expect(past).toMatchObject({ from: doc.length, to: doc.length })
    expect(before).toMatchObject({ from: 0, to: 2 })
    expect(empty).toMatchObject({ from: 12, to: 12 })
  })
  it('never ends before it starts', () => {
    const [d] = diagnosticsToOffsets(doc, [
      { line: 3, column: 8, endLine: 1, endColumn: 1, severity: 'error', message: 'backwards' },
    ])
    expect(d.to).toBe(d.from)
  })
})

describe('checkFilePath', () => {
  const existing = ['src/app.tsx', 'src/lib/format.ts', 'README.md']
  it('accepts a new relative path, trimmed', () => {
    expect(checkFilePath('  src/lib/date.ts ', existing)).toEqual({ path: 'src/lib/date.ts' })
    expect(checkFilePath('docs/guide.md', existing)).toEqual({ path: 'docs/guide.md' })
  })
  it('refuses empty, absolute, parent, empty-segment and backslash paths', () => {
    expect(checkFilePath('   ', existing)).toEqual({ error: 'empty' })
    for (const bad of [
      '/etc/passwd',
      '../secret',
      'src/../x.ts',
      'src//x.ts',
      'src/',
      'a\\b.ts',
      './x',
    ])
      expect(checkFilePath(bad, existing)).toEqual({ error: 'invalid' })
  })
  it('refuses a taken path, a folder, or a path inside a file', () => {
    expect(checkFilePath('README.md', existing)).toEqual({ error: 'exists' })
    expect(checkFilePath('src/lib', existing)).toEqual({ error: 'exists' })
    expect(checkFilePath('src/app.tsx/x.ts', existing)).toEqual({ error: 'exists' })
  })
})

describe('fileTree', () => {
  it('builds folders from paths, folders first, sorted by name', () => {
    const tree = fileTree([
      'src/lib/format.ts',
      'README.md',
      'src/app.tsx',
      'package.json',
      'Src2/b.ts',
    ])
    expect(tree.map((n) => n.id)).toEqual([
      'dir:src',
      'dir:Src2',
      'file:package.json',
      'file:README.md',
    ])
    const src = tree[0]
    expect(src.children?.map((n) => n.id)).toEqual(['dir:src/lib', 'file:src/app.tsx'])
    expect(src.children?.[0].children?.map((n) => n.label)).toEqual(['format.ts'])
  })
  it('is empty without files', () => {
    expect(fileTree([])).toEqual([])
  })
})
