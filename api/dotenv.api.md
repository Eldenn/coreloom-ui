# @coreloom/dotenv

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/lib/dotenv.ts

```ts
type DotenvEntry = {}
DotenvEntry.key: string
DotenvEntry.value: string
type DotenvResult = {}
DotenvResult.entries: DotenvEntry[]
DotenvResult.errors: { line: number; text: string; }[]
const ENV_KEY: RegExp
function parseDotenv(text: string) => DotenvResult
```
