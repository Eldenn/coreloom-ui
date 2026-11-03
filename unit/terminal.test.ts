import { describe, expect, it } from 'vitest'

import { formatRunDuration } from '@/components/pipeline-run'
import {
  createAnsiScreen,
  lineText,
  parseAnsi,
  stripAnsi,
  writeAnsi,
} from '@/components/ui/ansi-output'
import { detectLevel, filterLogEntries, parseLogText } from '@/components/ui/log-viewer'
import { completeInput, createTerminal } from '@/components/ui/terminal'

const text = (screenLines: ReturnType<typeof parseAnsi>) => screenLines.map(lineText)

describe('parseAnsi', () => {
  it('reads basic, bright, 256 and true colours, and resets', () => {
    const line = parseAnsi(
      '\x1b[31mred\x1b[0m \x1b[1;92mok\x1b[39m \x1b[38;5;208mo\x1b[48;2;1;2;3mb',
    )[0]
    expect(line.map((s) => s.text)).toEqual(['red', ' ', 'ok', ' ', 'o', 'b'])
    expect(line[0].style).toEqual({ fg: 1 })
    expect(line[1].style).toEqual({})
    expect(line[2].style).toEqual({ bold: true, fg: 10 })
    expect(line[4].style.fg).toBe(208)
    expect(line[5].style.bg).toBe('rgb(1 2 3)')
  })

  it('merges plain text into one span and keeps lines', () => {
    expect(text(parseAnsi('a\nb\n'))).toEqual(['a', 'b'])
    expect(parseAnsi('plain text')[0]).toHaveLength(1)
  })

  it('overwrites with carriage return and erase line, as progress bars do', () => {
    expect(stripAnsi('progress 10%\rprogress 100%')).toBe('progress 100%')
    expect(stripAnsi('downloading…\r\x1b[2Kdone')).toBe('done')
    expect(stripAnsi('abc\rX')).toBe('Xbc')
    expect(stripAnsi('abcdef\r\x1b[3C\x1b[K')).toBe('abc')
  })

  it('moves up to rewrite an earlier line', () => {
    expect(stripAnsi('one\ntwo\n\x1b[1A\x1b[2Kthree\n')).toBe('one\nthree')
  })

  it('clears the screen', () => {
    expect(stripAnsi('old\nstuff\x1b[2Jnew')).toBe('new')
  })

  it('keeps safe OSC 8 links and drops the others', () => {
    const line = parseAnsi(
      '\x1b]8;;https://example.com\x07site\x1b]8;;\x07 \x1b]8;;javascript:alert(1)\x1b\\bad\x1b]8;;\x1b\\',
    )[0]
    expect(line[0]).toMatchObject({ text: 'site', href: 'https://example.com' })
    expect(line.find((s) => s.text === 'bad')?.href).toBeUndefined()
  })

  it('expands tabs and ignores other control characters', () => {
    expect(stripAnsi('a\tb')).toBe('a       b')
    expect(stripAnsi('ding\x07!')).toBe('ding!')
  })
})

describe('writeAnsi', () => {
  it('waits for an escape sequence cut between two chunks', () => {
    let screen = writeAnsi(createAnsiScreen(), 'a\x1b[3')
    expect(screen.pending).toBe('\x1b[3')
    screen = writeAnsi(screen, '2mb')
    expect(screen.pending).toBe('')
    expect(screen.lines[0]?.[1]).toMatchObject({ text: 'b', style: { fg: 2 } })
  })

  it('keeps unchanged lines as they were (cheap re-renders)', () => {
    const first = writeAnsi(createAnsiScreen(), 'one\ntwo')
    const next = writeAnsi(first, ' more')
    expect(next.lines[0]).toBe(first.lines[0])
    expect(lineText(next.lines[1] ?? [])).toBe('two more')
  })

  it('drops the oldest lines past maxLines and counts them', () => {
    const screen = writeAnsi(createAnsiScreen(), '1\n2\n3\n4\n', { maxLines: 2 })
    expect(text(screen.lines.slice())).toEqual(['4', ''])
    expect(screen.dropped).toBe(3)
  })

  it('gives up on an escape sequence that never ends', () => {
    const screen = writeAnsi(createAnsiScreen(), `\x1b]8;;${'x'.repeat(5000)}`)
    expect(screen.pending).toBe('')
  })
})

describe('completeInput', () => {
  it('completes a single match with a space, or a folder without one', () => {
    expect(completeInput('git sta', ['status', 'stash', 'stage'])).toEqual({
      input: 'git sta',
      candidates: ['stage', 'stash', 'status'],
    })
    expect(completeInput('git stat', ['status', 'stash'])).toEqual({
      input: 'git status ',
      candidates: [],
    })
    expect(completeInput('cd sr', ['src/'])).toEqual({ input: 'cd src/', candidates: [] })
  })

  it('fills in what the matches share', () => {
    expect(completeInput('pnpm run b', ['build', 'build:docs'])).toEqual({
      input: 'pnpm run build',
      candidates: ['build', 'build:docs'],
    })
  })

  it('leaves the input alone without a match', () => {
    expect(completeInput('xyz', ['abc'])).toEqual({ input: 'xyz', candidates: [] })
  })
})

describe('createTerminal', () => {
  const output = (terminal: ReturnType<typeof createTerminal>) => terminal.getText()

  it('echoes the command after the prompt and prints a string result', async () => {
    const terminal = createTerminal({ prompt: '$ ', onCommand: (c) => `you said ${c}` })
    await terminal.run('hello')
    expect(output(terminal)).toBe('$ hello\nyou said hello')
    expect(terminal.getState().history).toEqual(['hello'])
    expect(terminal.getState().exitCode).toBe(0)
  })

  it('streams an async iterable and ends on a new line', async () => {
    const terminal = createTerminal({
      onCommand: async function* () {
        yield 'a'
        await Promise.resolve()
        yield 'b'
      },
    })
    await terminal.run('stream')
    expect(output(terminal)).toBe('$ stream\nab')
    expect(terminal.getState().screen.col).toBe(0)
  })

  it('prints a thrown error in red and records a failure', async () => {
    const terminal = createTerminal({
      onCommand: () => {
        throw new Error('nope')
      },
    })
    await terminal.run('fail')
    expect(output(terminal)).toBe('$ fail\nnope')
    expect(terminal.getState().screen.lines[1]?.[0]?.style.fg).toBe(1)
    expect(terminal.getState().exitCode).toBe(1)
  })

  it('interrupts: aborts the signal, prints ^C and drops later output', async () => {
    let signal: AbortSignal | undefined
    let release: () => void = () => undefined
    const terminal = createTerminal({
      onCommand: async (_, context) => {
        signal = context.signal
        await new Promise<void>((resolve) => {
          release = resolve
        })
        context.write('too late')
      },
    })
    const done = terminal.run('sleep 10')
    expect(terminal.getState().running).toBe(true)
    terminal.interrupt()
    expect(signal?.aborted).toBe(true)
    release()
    await done
    expect(output(terminal)).toBe('$ sleep 10\n^C')
    expect(terminal.getState()).toMatchObject({ running: false, exitCode: 130 })
  })

  it('asks a question with read() and answers through submit', async () => {
    const terminal = createTerminal({
      onCommand: async (_, { read }) => {
        const answer = await read({ prompt: 'Sure? ' })
        const secret = await read({ prompt: 'Password: ', secret: true })
        return `${answer}/${secret.length.toString()}`
      },
    })
    const done = terminal.run('deploy')
    await Promise.resolve()
    expect(terminal.getState().reading).toEqual({ prompt: 'Sure? ', secret: false })
    await terminal.submit('yes')
    await Promise.resolve()
    expect(terminal.getState().reading?.secret).toBe(true)
    await terminal.submit('hunter2')
    await done
    expect(output(terminal)).toBe('$ deploy\nSure? yes\nPassword: \nyes/7')
  })

  it('keeps control characters out of the echo', async () => {
    const terminal = createTerminal({})
    await terminal.run('ls\x1b[2J')
    expect(output(terminal)).toBe('$ ls[2J')
  })

  it('talks to a session: data in, lines and Ctrl+C out', () => {
    const sent: string[] = []
    let emit: (data: string) => void = () => undefined
    const terminal = createTerminal({})
    const disconnect = terminal.connect({
      onData: (listener) => {
        emit = listener
        return () => undefined
      },
      write: (data) => sent.push(data),
    })
    emit('user@box:~$ ')
    void terminal.submit('ls')
    terminal.interrupt()
    expect(sent).toEqual(['ls\r', '\x03'])
    expect(output(terminal)).toBe('user@box:~$')
    expect(terminal.getState().connected).toBe(true)
    disconnect()
    expect(terminal.getState().connected).toBe(false)
  })
})

describe('log text', () => {
  it('reads timestamps and levels', () => {
    const [first, second, third] = parseLogText(
      '2026-10-14T08:03:41Z ERROR export failed\n[2026-10-14 08:03:42] warn: slow\nplain line\n',
    )
    expect(first).toMatchObject({ level: 'error', message: 'ERROR export failed' })
    expect((first.time as Date).toISOString()).toBe('2026-10-14T08:03:41.000Z')
    expect(second).toMatchObject({ level: 'warn', message: 'warn: slow' })
    expect(third).toEqual({ message: 'plain line', level: undefined })
    expect(parseLogText('')).toEqual([])
  })

  it('detects levels inside colours', () => {
    expect(detectLevel(stripAnsi('\x1b[31mERROR\x1b[0m boom'))).toBe('error')
    expect(detectLevel('DEBUG cache hit')).toBe('debug')
    expect(detectLevel('nothing to see')).toBeUndefined()
  })

  it('filters by level and by every word of the query', () => {
    const entries = parseLogText('INFO GET /health\nERROR POST /export timeout\nWARN slow query')
    expect(filterLogEntries(entries, { query: 'export TIMEOUT' }).map((r) => r.index)).toEqual([1])
    expect(
      filterLogEntries(entries, { levels: new Set(['warn', 'error'] as const) }).map(
        (r) => r.index,
      ),
    ).toEqual([1, 2])
  })
})

describe('formatRunDuration', () => {
  it('uses the largest units that matter', () => {
    expect(formatRunDuration(950, 'en')).toBe('950ms')
    expect(formatRunDuration(42_000, 'en')).toBe('42s')
    expect(formatRunDuration(72_000, 'en')).toBe('1m 12s')
    expect(formatRunDuration(3_900_000, 'en')).toBe('1h 5m')
  })
})
