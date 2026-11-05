// Reading a diagram file picked for import: its format, its title, and what is refused.
import { describe, expect, it } from 'vitest'

import {
  formatOfFile,
  MAX_DIAGRAM_FILE_BYTES,
  readDiagramFile,
  sniffFormat,
  titleOfFile,
} from '@/components/diagram-import'

describe('formatOfFile', () => {
  it('takes the format from the extension, whatever the case', () => {
    expect(formatOfFile('a.MMD', '', 'json')).toBe('mermaid')
    expect(formatOfFile('a.mermaid', '', 'json')).toBe('mermaid')
    expect(formatOfFile('a.puml', '', 'mermaid')).toBe('plantuml')
    expect(formatOfFile('a.wsd', '', 'mermaid')).toBe('plantuml')
    expect(formatOfFile('a.iuml', '', 'mermaid')).toBe('plantuml')
    expect(formatOfFile('a.json', '', 'mermaid')).toBe('json')
  })

  it('trusts the extension over the first words', () => {
    expect(formatOfFile('a.puml', 'classDiagram\n  class A', 'json')).toBe('plantuml')
  })

  it('reads a .txt or a name without an extension from its first words', () => {
    expect(formatOfFile('a.txt', '@startuml\nA -> B\n@enduml', 'mermaid')).toBe('plantuml')
    expect(formatOfFile('notes', '  sequenceDiagram\n A->>B: hi', 'json')).toBe('mermaid')
    expect(formatOfFile('a.txt', '{ "kind": "class" }', 'mermaid')).toBe('json')
  })

  it('falls back when nothing says', () => {
    expect(formatOfFile('a.txt', 'hello', 'plantuml')).toBe('plantuml')
    expect(formatOfFile('.puml', '', 'mermaid')).toBe('mermaid')
  })
})

describe('sniffFormat', () => {
  it('knows the Mermaid headers and none else', () => {
    expect(sniffFormat('erDiagram\n')).toBe('mermaid')
    expect(sniffFormat('C4Context\n')).toBe('mermaid')
    expect(sniffFormat('pie title Pets')).toBeNull()
    expect(sniffFormat('')).toBeNull()
  })
})

describe('titleOfFile', () => {
  it('drops the last extension only', () => {
    expect(titleOfFile('order-flow.puml')).toBe('order-flow')
    expect(titleOfFile('v1.2 flow.mmd')).toBe('v1.2 flow')
  })

  it('keeps a name that is only an extension or has none', () => {
    expect(titleOfFile('.puml')).toBe('.puml')
    expect(titleOfFile('diagram')).toBe('diagram')
    expect(titleOfFile(' .mmd')).toBe(' .mmd')
  })
})

describe('readDiagramFile', () => {
  it('reads the text, its format and a title', async () => {
    const file = new File(['@startuml\nA -> B\n@enduml\n'], 'flow.txt', { type: 'text/plain' })
    expect(await readDiagramFile(file, 'mermaid')).toEqual({
      status: 'read',
      name: 'flow.txt',
      title: 'flow',
      text: '@startuml\nA -> B\n@enduml\n',
      format: 'plantuml',
    })
  })

  it('refuses a binary file', async () => {
    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0])], 'logo.png')
    expect(await readDiagramFile(file, 'mermaid')).toEqual({
      status: 'error',
      name: 'logo.png',
      error: 'unreadable',
    })
  })

  it('refuses a file over the limit without reading it', async () => {
    const file = new File(['a'.repeat(MAX_DIAGRAM_FILE_BYTES + 1)], 'big.mmd')
    expect(await readDiagramFile(file, 'mermaid')).toMatchObject({ error: 'tooLarge' })
  })

  it('reads an empty file as an empty text', async () => {
    const read = await readDiagramFile(new File([], 'empty.json'), 'mermaid')
    expect(read).toMatchObject({ status: 'read', text: '', format: 'json' })
  })
})
