// Coreloom UI — dotenv. Reads the text of a `.env` file into entries, without throwing: what the
// env-vars block uses to import a pasted file. Pure, no dependencies.

interface DotenvEntry {
  key: string
  value: string
}

interface DotenvResult {
  entries: DotenvEntry[]
  /** Lines that could not be read, 1-based. */
  errors: { line: number; text: string }[]
}

/** A variable name: letters, digits and _, not starting with a digit. */
const ENV_KEY = /^[A-Za-z_][A-Za-z0-9_]*$/
const ESCAPES: Record<string, string> = { n: '\n', r: '\r', t: '\t', '"': '"', '\\': '\\' }

function unquote(raw: string): string | null {
  const quote = raw[0]
  if (quote !== '"' && quote !== "'" && quote !== '`') {
    // Unquoted: a ` #` starts a comment.
    return raw.replace(/\s+#.*$/, '').trim()
  }
  const end = raw.indexOf(quote, 1)
  if (end < 0) return null
  const inner = raw.slice(1, end)
  return quote === '"' ? inner.replace(/\\([nrt"\\])/g, (_, c: string) => ESCAPES[c]) : inner
}

/**
 * Reads a `.env` file: `KEY=value` lines, `export KEY=value`, comments, blank lines, single, double
 * and backtick quotes (`\n` and friends unescaped in double quotes). A later line wins over an
 * earlier one with the same key. Lines it can't read are listed in `errors`, never thrown.
 */
function parseDotenv(text: string): DotenvResult {
  const byKey = new Map<string, string>()
  const errors: DotenvResult['errors'] = []
  text.split(/\r?\n/).forEach((source, i) => {
    const line = source.trim()
    if (!line || line.startsWith('#')) return
    const eq = line.indexOf('=')
    const key = (eq < 0 ? '' : line.slice(0, eq)).replace(/^export\s+/, '').trim()
    const value = eq < 0 ? null : unquote(line.slice(eq + 1).trim())
    if (!ENV_KEY.test(key) || value === null) {
      errors.push({ line: i + 1, text: source })
      return
    }
    byKey.delete(key)
    byKey.set(key, value)
  })
  return { entries: [...byKey].map(([key, value]) => ({ key, value })), errors }
}

export { type DotenvEntry, type DotenvResult, ENV_KEY, parseDotenv }
