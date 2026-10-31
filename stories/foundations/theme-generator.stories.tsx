import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckIcon, CopyIcon, DownloadIcon, SparklesIcon } from 'lucide-react'
import * as React from 'react'

import { Badge, BadgeDot } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardIcon,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  type AccentFamily,
  accentVariables,
  generateAccent,
  type GeneratedAccent,
  parseHex,
} from '@/lib/accent'

// A dev tool page: its strings stay in English (Storybook only), and it uses the components as an
// app would, under the generated variables.

interface GeneratorProps {
  /** The brand colour the page opens with. */
  colour: string
  /** The data-accent name the page opens with. */
  name: string
  /** Dark text on the light-theme fill instead of white (as Coreloom's cyan). */
  darkTextOnLight: boolean
}

/** One theme's preview: real components under the generated variables, scoped to this panel. */
function Preview({ theme, family }: { theme: 'dark' | 'light'; family: AccentFamily }) {
  const id = React.useId()
  const style = accentVariables(theme, family) as React.CSSProperties
  const label = theme === 'dark' ? 'Dark' : 'Light'
  return (
    <section
      aria-label={`${label} theme preview`}
      data-theme={theme}
      style={style}
      className="flex min-w-0 flex-col gap-5 rounded-lg border border-border bg-background p-5 text-foreground"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {label}
        </p>
        <Badge variant="default">
          <BadgeDot />
          New
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button>Deploy</Button>
        <Button variant="secondary">Cancel</Button>
        {/* The focus ring, drawn as keyboard focus draws it. */}
        <Button variant="outline" className="ring-[3px] ring-ring" tabIndex={-1}>
          Focus ring
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Switch id={`${id}-switch`} defaultChecked />
          <Label htmlFor={`${id}-switch`}>Auto-deploy main</Label>
        </div>
        <Slider defaultValue={[60]} aria-label={`Traffic share, ${label.toLowerCase()} preview`} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          Builds run on every push.{' '}
          <a href="#theme-generator" className="text-primary-text underline underline-offset-4">
            Read the docs
          </a>
        </TabsContent>
        <TabsContent value="logs">No logs yet.</TabsContent>
      </Tabs>

      <Card accent>
        <CardHeader>
          <CardIcon>
            <SparklesIcon aria-hidden />
          </CardIcon>
          <CardTitle>Pro plan</CardTitle>
          <CardDescription>The featured card: the accent glow instead of a border.</CardDescription>
        </CardHeader>
        <CardContent>
          <span className="font-semibold text-primary-text">Recommended</span> for teams.
        </CardContent>
      </Card>
    </section>
  )
}

// Tighter cells on phones, so all four columns fit at 390px.
const CELL = 'px-2 sm:px-4'

function Checks({ result }: { result: GeneratedAccent }) {
  return (
    <Table>
      <TableCaption className="whitespace-normal">
        WCAG 2 contrast, measured on the worst of the theme&apos;s surfaces (as
        build/gen-accents.py).
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className={CELL}>Pair</TableHead>
          <TableHead className={`${CELL} text-right`}>Ratio</TableHead>
          <TableHead className={`${CELL} text-right`}>Needs</TableHead>
          <TableHead className={CELL}>Result</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {result.checks.map((c) => (
          <TableRow key={`${c.theme} ${c.pair}`}>
            <TableCell className={`${CELL} min-w-[7rem] whitespace-normal`}>
              <span className="block text-[12px] text-muted-foreground">
                {c.theme === 'dark' ? 'Dark' : 'Light'}
              </span>
              {c.pair.replace(/ \([\d.]+\)$/, '')}
            </TableCell>
            <TableCell className={`${CELL} text-right font-mono tabular-nums`}>
              {c.ratio.toFixed(2)}:1
            </TableCell>
            <TableCell className={`${CELL} text-right font-mono tabular-nums`}>{c.min}:1</TableCell>
            <TableCell className={CELL}>
              <Badge variant={c.pass ? 'success' : 'destructive'}>{c.pass ? 'Pass' : 'Fail'}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function ThemeGenerator({ colour, name, darkTextOnLight }: GeneratorProps) {
  const id = React.useId()
  const [hex, setHex] = React.useState(colour)
  const [rawName, setRawName] = React.useState(name)
  const [darkText, setDarkText] = React.useState(darkTextOnLight)
  const [copied, setCopied] = React.useState(false)
  // The last valid colour keeps the preview up while someone is typing a new one.
  const [valid, setValid] = React.useState(() => parseHex(colour) ?? '#1ce0d3')
  const parsed = parseHex(hex)
  const invalid = parsed === null

  const result = React.useMemo(
    () => generateAccent(valid, { name: rawName, lightText: darkText ? 'dark' : 'white' }),
    [valid, rawName, darkText],
  )
  const failing = result.checks.filter((c) => !c.pass).length

  React.useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => {
      setCopied(false)
    }, 1600)
    return () => {
      clearTimeout(timer)
    }
  }, [copied])

  const changeHex = (value: string) => {
    setHex(value)
    const next = parseHex(value)
    if (next) setValid(next)
  }

  return (
    <div id="theme-generator" className="flex max-w-6xl flex-col gap-8">
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-start">
        <Field data-invalid={invalid || undefined}>
          <FieldLabel htmlFor={`${id}-hex`}>Brand colour</FieldLabel>
          <div className="flex gap-2">
            <input
              type="color"
              aria-label="Pick the brand colour"
              value={valid}
              onChange={(e) => {
                changeHex(e.target.value)
              }}
              className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-border-strong bg-transparent p-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            />
            <Input
              id={`${id}-hex`}
              value={hex}
              spellCheck={false}
              autoComplete="off"
              aria-invalid={invalid}
              aria-describedby={`${id}-hex-help`}
              onChange={(e) => {
                changeHex(e.target.value)
              }}
              className="font-mono"
            />
          </div>
          {invalid ? (
            <FieldError id={`${id}-hex-help`}>
              Enter a hex colour such as #ff5a1f. The preview keeps {valid}.
            </FieldError>
          ) : (
            <FieldDescription id={`${id}-hex-help`}>
              The colour as your brand uses it; #rgb or #rrggbb.
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor={`${id}-name`}>Name</FieldLabel>
          <Input
            id={`${id}-name`}
            value={rawName}
            spellCheck={false}
            autoComplete="off"
            aria-describedby={`${id}-name-help`}
            onChange={(e) => {
              setRawName(e.target.value)
            }}
          />
          <FieldDescription id={`${id}-name-help`}>
            Used as{' '}
            <code className="font-mono text-foreground">data-accent=&quot;{result.name}&quot;</code>
          </FieldDescription>
        </Field>

        <div className="flex items-center gap-3 md:pt-[30px]">
          <Switch id={`${id}-dark-text`} checked={darkText} onCheckedChange={setDarkText} />
          <Label htmlFor={`${id}-dark-text`}>Dark text on the light fill</Label>
        </div>
      </div>

      <p role="status" className="text-[14px] text-fg-secondary">
        {result.pass
          ? `All ${result.checks.length} contrast checks pass for ${result.input}.`
          : `${failing} of ${result.checks.length} contrast checks fail for ${result.input}: this accent can't ship.`}
      </p>

      <section aria-labelledby={`${id}-preview`} className="flex flex-col gap-3">
        <h2 id={`${id}-preview`} className="font-display text-[19px] font-semibold">
          Preview
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Preview theme="dark" family={result.dark} />
          <Preview theme="light" family={result.light} />
        </div>
      </section>

      <section aria-labelledby={`${id}-checks`} className="flex flex-col gap-3">
        <h2 id={`${id}-checks`} className="font-display text-[19px] font-semibold">
          Contrast checks
        </h2>
        <Checks result={result} />
      </section>

      <section aria-labelledby={`${id}-adjusted`} className="flex flex-col gap-3">
        <h2 id={`${id}-adjusted`} className="font-display text-[19px] font-semibold">
          What was adjusted
        </h2>
        {result.adjustments.length === 0 ? (
          <p className="text-[14px] text-fg-secondary">Nothing: the colour passes as it is.</p>
        ) : (
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[13px] text-fg-secondary">
            {result.adjustments.map((a) => (
              <li key={`${a.theme} ${a.token}`} className="break-words">
                {a.message}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby={`${id}-css`} className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id={`${id}-css`} className="font-display text-[19px] font-semibold">
            brand.css
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(result.css)
                  setCopied(true)
                } catch {
                  /* clipboard refused: the text stays selectable below */
                }
              }}
            >
              {copied ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <a
                href={`data:text/css;charset=utf-8,${encodeURIComponent(result.css)}`}
                download="brand.css"
              >
                <DownloadIcon aria-hidden />
                Download
              </a>
            </Button>
          </div>
        </div>
        <pre
          role="region"
          aria-label="brand.css source"
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard-reachable; axe requires it.
          tabIndex={0}
          className="max-h-[420px] overflow-auto rounded-md border border-border bg-inset p-4 font-mono text-[12.5px] leading-[1.6] text-fg-secondary outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {result.css}
        </pre>
      </section>
    </div>
  )
}

const meta = {
  title: 'Foundations/Theme generator',
  component: ThemeGenerator,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Make a brand accent from one colour. The generator (`src/lib/accent.ts`, also `node build/gen-brand.mjs`) derives the whole accent family for both themes, checks every contrast pairing the theming guide requires, nudges lightness until they pass, and writes a `brand.css` to import after `accents.css`. The preview runs the real components under the generated variables.',
      },
    },
  },
  args: { colour: '#ff5a1f', name: 'orange', darkTextOnLight: false },
  argTypes: {
    colour: { control: 'color', description: 'The brand colour the page opens with.' },
    name: { control: 'text', description: 'The data-accent name.' },
    darkTextOnLight: { control: 'boolean', description: 'Dark text on the light-theme fill.' },
  },
  // A new colour from Controls restarts the page with it.
  render: (args) => <ThemeGenerator key={JSON.stringify(args)} {...args} />,
} satisfies Meta<typeof ThemeGenerator>
export default meta
type Story = StoryObj<typeof meta>

/** A brand orange: lightened a little for dark, darkened to a burnt orange for white text in light. */
export const Generator: Story = {}

/** Coreloom's own cyan with dark text on the light fill: the default accent, rebuilt. */
export const Cyan: Story = {
  args: { colour: '#1ce0d3', name: 'cyan-again', darkTextOnLight: true },
}

/** Pure yellow: fine as it is on dark; the light fill leans to amber so it doesn't turn olive. */
export const Yellow: Story = { args: { colour: '#ffff00', name: 'yellow' } }

/** A colour picked for light backgrounds: kept in light, lightened for dark. */
export const LightThemeBlue: Story = { args: { colour: '#2563eb', name: 'ocean' } }

/** Half-typed colour: the field says what's wrong, the preview keeps the last valid colour. */
export const InvalidInput: Story = { args: { colour: '#ff5a', name: 'orange' } }
