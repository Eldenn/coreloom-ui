// A pretend shell for the terminal stories: a few commands that answer from memory, stream, ask
// questions and can be stopped with Ctrl+C. In an app, `onCommand` sends the command to your
// backend (a WebSocket, a fetch that streams) and passes `context.signal` along.
import type { LogEntry } from '@/components/ui/log-viewer'
import type { TerminalCommandContext, TerminalCommandResult } from '@/components/ui/terminal'

interface DemoFile {
  path: string
  content: string
}

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

/** Waits, or rejects as soon as the command is interrupted. */
function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(id)
      reject(new DOMException('Interrupted', 'AbortError'))
    })
  })
}

const demoPrompt = `${C.cyan}~/orbit${C.reset} ${C.green}❯${C.reset} `

const commands = [
  'help',
  'ls',
  'cat',
  'echo',
  'date',
  'git',
  'pnpm',
  'deploy',
  'login',
  'sleep',
  'clear',
]

const help = `${C.bold}Commands${C.reset}
  ${C.cyan}ls${C.reset} [folder]        list files
  ${C.cyan}cat${C.reset} <file>         print a file
  ${C.cyan}git status${C.reset}         what changed
  ${C.cyan}pnpm build${C.reset}         a build that streams
  ${C.cyan}pnpm test${C.reset}          tests, one failing
  ${C.cyan}deploy${C.reset}             asks before it runs
  ${C.cyan}login${C.reset}              asks for a password
  ${C.cyan}sleep${C.reset} <seconds>    try Ctrl+C
  ${C.cyan}clear${C.reset}              or Ctrl+L
Tab completes, ↑ and ↓ go through the history.`

function listFolder(files: readonly DemoFile[], folder: string) {
  const prefix = folder
    .replace(/^\.\/?/, '')
    .replace(/\/?$/, '/')
    .replace(/^\/$/, '')
  const names = new Set<string>()
  for (const file of files) {
    if (!file.path.startsWith(prefix)) continue
    const rest = file.path.slice(prefix.length)
    const slash = rest.indexOf('/')
    names.add(slash === -1 ? rest : `${rest.slice(0, slash)}/`)
  }
  return [...names].sort()
}

async function* build(signal: AbortSignal) {
  yield `${C.dim}$ tsc -b && vite build${C.reset}\n`
  await wait(300, signal)
  yield `${C.cyan}vite v7.1.4${C.reset} ${C.green}building for production…${C.reset}\n`
  for (let n = 0; n <= 42; n += 7) {
    await wait(120, signal)
    yield `\rtransforming (${String(n)}) ${C.dim}src/components/stat-card.tsx${C.reset}\x1b[K`
  }
  yield `\r\x1b[2K${C.green}✓${C.reset} 42 modules transformed.\n`
  await wait(200, signal)
  yield `${C.dim}dist/${C.reset}index.html                 ${C.dim}0.46 kB │ gzip:  0.30 kB${C.reset}\n`
  yield `${C.dim}dist/${C.reset}${C.magenta}assets/index-4f2a1c.css${C.reset}   ${C.dim}6.12 kB │ gzip:  1.84 kB${C.reset}\n`
  yield `${C.dim}dist/${C.reset}${C.cyan}assets/index-9b7e33.js${C.reset}  ${C.dim}196.40 kB │ gzip: 61.02 kB${C.reset}\n`
  yield `${C.green}✓ built in 1.24s${C.reset}\n`
}

async function* test(signal: AbortSignal) {
  yield `\n ${C.bold}${C.cyan}RUN${C.reset}  v5.0.5 ~/orbit\n\n`
  await wait(400, signal)
  yield ` ${C.green}✓${C.reset} src/lib/format.test.ts ${C.dim}(4 tests) 3ms${C.reset}\n`
  await wait(300, signal)
  yield ` ${C.red}❯${C.reset} src/app.test.tsx ${C.dim}(2 tests | ${C.reset}${C.red}1 failed${C.reset}${C.dim}) 18ms${C.reset}\n`
  yield `   ${C.red}×${C.reset} App > shows the visitors in compact form\n`
  yield `     ${C.red}→ expected '12840' to be '12.8K'${C.reset}\n\n`
  yield ` ${C.bold}Test Files${C.reset}  ${C.red}1 failed${C.reset} | ${C.green}1 passed${C.reset} (2)\n`
  yield `      ${C.bold}Tests${C.reset}  ${C.red}1 failed${C.reset} | ${C.green}5 passed${C.reset} (6)\n`
  throw new Error('Tests failed. Docs: https://vitest.dev/guide/')
}

async function* deploy(context: TerminalCommandContext) {
  const answer = await context.read({
    prompt: `Deploy ${C.bold}orbit${C.reset} to production? [y/N] `,
  })
  if (!/^y(es)?$/i.test(answer.trim())) {
    yield `${C.yellow}Cancelled.${C.reset}\n`
    return
  }
  for (const step of ['Uploading build', 'Running migrations', 'Switching traffic']) {
    yield `${C.cyan}›${C.reset} ${step}…`
    await wait(500, context.signal)
    yield ` ${C.green}done${C.reset}\n`
  }
  yield `${C.green}✓ Live at${C.reset} https://orbit.example.com\n`
}

/** The pretend shell: pass `onCommand` and `onComplete` to a terminal. */
function createDemoShell(files: readonly DemoFile[] = []) {
  const onCommand = (command: string, context: TerminalCommandContext): TerminalCommandResult => {
    const [name = '', ...args] = command.trim().split(/\s+/)
    const arg = args.join(' ')
    switch (name) {
      case 'help':
        return help
      case 'ls': {
        const names = listFolder(files, arg)
        if (!names.length) throw new Error(`ls: ${arg}: No such file or directory`)
        return names
          .map((n) => (n.endsWith('/') ? `${C.blue}${C.bold}${n}${C.reset}` : n))
          .join('  ')
      }
      case 'cat': {
        const file = files.find((f) => f.path === arg.replace(/^\.\//, ''))
        if (!file) throw new Error(`cat: ${arg || '(nothing)'}: No such file`)
        return file.content
      }
      case 'echo':
        return arg
      case 'date':
        return 'Wed Oct 14 10:00:00 CEST 2026'
      case 'git':
        if (args[0] !== 'status') throw new Error(`git: '${arg}' isn’t a command this demo knows`)
        return `On branch ${C.cyan}main${C.reset}
Changes not staged for commit:
	${C.red}modified:   src/app.tsx${C.reset}
	${C.red}modified:   src/lib/format.ts${C.reset}

Untracked files:
	${C.red}src/components/chart.tsx${C.reset}`
      case 'pnpm':
        if (args[0] === 'build') return build(context.signal)
        if (args[0] === 'test') return test(context.signal)
        throw new Error(`pnpm: try ${C.bold}pnpm build${C.reset} or ${C.bold}pnpm test${C.reset}`)
      case 'deploy':
        return deploy(context)
      case 'login':
        return context.read({ prompt: 'Password: ', secret: true }).then(async () => {
          await wait(400, context.signal)
          return `${C.green}✓${C.reset} Signed in as ${C.bold}matthieu${C.reset}`
        })
      case 'sleep':
        return wait(Number(arg || 5) * 1000, context.signal)
      case 'clear':
        context.clear()
        return
      default:
        throw new Error(`${name}: command not found. Type ${C.bold}help${C.reset}`)
    }
  }
  const onComplete = (input: string) => {
    const words = input.split(/\s+/)
    if (words.length <= 1) return commands
    if (words[0] === 'git') return ['status']
    if (words[0] === 'pnpm') return ['build', 'test']
    if (words[0] === 'cat' || words[0] === 'ls') {
      const last = words.at(-1) ?? ''
      const folder = last.includes('/') ? last.slice(0, last.lastIndexOf('/') + 1) : ''
      return listFolder(files, folder).map((n) => folder + n)
    }
    return []
  }
  return { onCommand, onComplete, prompt: demoPrompt }
}

/** What a terminal looks like after a few commands, for still stories. */
const demoTranscript = `${C.dim}Welcome to orbit's terminal. Type ${C.reset}${C.bold}help${C.reset}${C.dim} to see the commands.${C.reset}
${demoPrompt}git status
On branch ${C.cyan}main${C.reset}
Changes not staged for commit:
	${C.red}modified:   src/app.tsx${C.reset}

${demoPrompt}pnpm build
${C.cyan}vite v7.1.4${C.reset} ${C.green}building for production…${C.reset}
${C.green}✓${C.reset} 42 modules transformed.
${C.dim}dist/${C.reset}index.html                 ${C.dim}0.46 kB │ gzip:  0.30 kB${C.reset}
${C.dim}dist/${C.reset}${C.cyan}assets/index-9b7e33.js${C.reset}  ${C.dim}196.40 kB │ gzip: 61.02 kB${C.reset}
${C.green}✓ built in 1.24s${C.reset}
`

const buildLog = `${C.dim}$ pnpm install --frozen-lockfile${C.reset}
Lockfile is up to date, resolution step is skipped
Packages: ${C.green}+412${C.reset}
${C.green}++++++++++++++++++++++++++++++++++++++++++++${C.reset}
Progress: resolved 412, reused 412, downloaded 0, added 412, ${C.bold}done${C.reset}
${C.yellow}WARN${C.reset} deprecated inflight@1.0.6: This module is not supported
Done in 3.8s
${C.dim}$ pnpm build${C.reset}
${C.cyan}vite v7.1.4${C.reset} ${C.green}building for production…${C.reset}
${C.green}✓${C.reset} 42 modules transformed.
${C.red}${C.bold}error${C.reset} TS2322: Type 'string' is not assignable to type 'number'.
  src/lib/format.ts:4:3
${C.red}ELIFECYCLE${C.reset} Command failed with exit code 2.
`

/** A server log, 240 lines, the same every time. */
function serverLog(): LogEntry[] {
  const routes = [
    'GET /health',
    'GET /api/projects',
    'POST /api/events',
    'GET /api/me',
    'PATCH /api/projects/42',
  ]
  const start = Date.parse('2026-10-14T08:00:00Z')
  return Array.from({ length: 240 }, (_, i): LogEntry => {
    const time = new Date(start + i * 1537)
    const route = routes[i % routes.length] ?? ''
    if (i % 47 === 46)
      return {
        id: i,
        time,
        level: 'error',
        source: 'api',
        message: `POST /api/export 500: timeout waiting for the export worker (job ${String(1200 + i)})`,
      }
    if (i % 19 === 18)
      return {
        id: i,
        time,
        level: 'warn',
        source: 'db',
        message: `slow query: SELECT * FROM events WHERE workspace_id = $1 (${String(900 + i * 3)} ms)`,
      }
    if (i % 11 === 10)
      return {
        id: i,
        time,
        level: 'debug',
        source: 'cache',
        message: `hit projects:${String(i)} (ttl 60s)`,
      }
    return {
      id: i,
      time,
      level: 'info',
      source: 'api',
      message: `${route} ${route.startsWith('GET') ? '200' : '204'} ${String(2 + (i % 9))}ms`,
    }
  })
}

export { C as ansi, buildLog, createDemoShell, demoPrompt, demoTranscript, serverLog, wait }
