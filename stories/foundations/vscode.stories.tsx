import type { Meta, StoryObj } from '@storybook/react-vite'
import { MoreHorizontalIcon, PlayIcon, RefreshCwIcon } from 'lucide-react'
import * as React from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge, BadgeDot } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { VsCodeThemeKind } from '@/lib/vscode'

import { VSCODE_THEME_LABELS as LABELS, VSCODE_THEMES as THEMES } from './vscode-themes'

// A dev tool page: its strings stay in English (Storybook only). Inside a real webview VS Code sets
// the --vscode-* variables and syncVsCodeTheme() puts data-vscode on <html>; here each preview
// carries a copy of the variables of one built-in theme, scoped to its panel.

/** A webview-sized panel under one VS Code theme: the components an extension view typically uses. */
function WebviewPreview({ kind }: { kind: Extract<VsCodeThemeKind, keyof typeof THEMES> }) {
  const id = React.useId()
  const [watch, setWatch] = React.useState(true)
  return (
    <section
      aria-label={`${LABELS[kind]} preview`}
      data-vscode={kind}
      data-theme={kind === 'light' ? 'light' : 'dark'}
      style={THEMES[kind]}
      className="flex max-w-xl min-w-0 flex-col gap-4 rounded-md border border-border bg-background p-4 font-sans text-[13px] text-foreground"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {LABELS[kind]}
        </p>
        <div className="flex items-center gap-1">
          <Badge variant="success">
            <BadgeDot />
            Connected
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More actions">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Refresh</DropdownMenuItem>
              <DropdownMenuItem>Open settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="run">
        <TabsList>
          <TabsTrigger value="run">Run</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="run" className="flex flex-col gap-4 pt-2">
          <Card>
            <CardHeader>
              <CardTitle>Test task</CardTitle>
              <CardDescription>Runs on the file open in the editor.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${id}-pattern`}>Pattern</Label>
                <Input id={`${id}-pattern`} defaultValue="src/**/*.test.ts" />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id={`${id}-coverage`} defaultChecked />
                <Label htmlFor={`${id}-coverage`}>Collect coverage</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id={`${id}-watch`} checked={watch} onCheckedChange={setWatch} />
                <Label htmlFor={`${id}-watch`}>Watch mode</Label>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-muted-foreground">
                  48 of 64 tests · <code className="font-mono">vitest run</code>
                </p>
                <Progress value={75} aria-label="Test progress" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button>
                  <PlayIcon />
                  Run tests
                </Button>
                <Button variant="secondary">
                  <RefreshCwIcon />
                  Rerun failed
                </Button>
                <span className="text-muted-foreground">
                  or <Kbd>⌘</Kbd> <Kbd>R</Kbd>
                </span>
              </div>
            </CardContent>
          </Card>
          <Alert variant="destructive">
            <AlertTitle>2 tests failed</AlertTitle>
            <AlertDescription>
              <p>
                <a href="#parser" className="underline underline-offset-2">
                  parser.test.ts
                </a>{' '}
                expected 3 tokens, got 2.
              </p>
            </AlertDescription>
          </Alert>
          <div className="flex flex-wrap gap-2">
            <Badge>Info</Badge>
            <Badge variant="warning">Slow</Badge>
            <Badge variant="destructive">Failed</Badge>
          </div>
        </TabsContent>
        <TabsContent value="history" className="pt-2 text-muted-foreground">
          No earlier runs.
        </TabsContent>
      </Tabs>
    </section>
  )
}

const meta = {
  title: 'Foundations/VS Code',
  component: WebviewPreview,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'vscode.css maps the Coreloom tokens onto the `--vscode-*` variables of a VS Code webview: colours, fonts, corners and high contrast follow the editor’s theme. `syncVsCodeTheme()` (from `@coreloom/vscode`) sets `<html data-vscode>` from VS Code’s body class. Each preview here carries a copy of one built-in theme’s variables.',
      },
    },
  },
  args: { kind: 'dark' },
  argTypes: {
    kind: { control: 'inline-radio', options: ['dark', 'light', 'high-contrast'] },
  },
} satisfies Meta<typeof WebviewPreview>
export default meta
type Story = StoryObj<typeof meta>

export const DarkModern: Story = {}

export const LightModern: Story = { args: { kind: 'light' } }

export const HighContrast: Story = { args: { kind: 'high-contrast' } }
