'use client'

// Coreloom UI — TerminalConsole. Several terminals in one place, as in an IDE's panel: a tab per
// terminal, a New terminal button (with a menu when there are several shells or targets), a side
// by side split, and Close. Each terminal is a `TerminalController` your app creates, so its output
// and history survive switching tabs, and its commands go wherever your app sends them.
//
//   <TerminalConsole
//     defaultSessions={[{ id: 'main', title: 'bash', terminal: createTerminal({ onCommand }) }]}
//     createSession={(profile) => ({ title: profile?.label ?? 'bash', terminal: createTerminal({ onCommand }) })}
//   />
import { ChevronDownIcon, Columns2Icon, PlusIcon, SquareTerminalIcon, XIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { Terminal, type TerminalController, useTerminalState } from '@/components/ui/terminal'
import { Toggle } from '@/components/ui/toggle'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface TerminalConsoleSession {
  id: string
  /** The tab's name: a shell, a server, a target. */
  title: string
  terminal: TerminalController
}

/** An entry of the New terminal menu: a shell (bash, node), a machine, an environment. */
interface TerminalConsoleProfile {
  id: string
  label: string
}

function SessionTab({
  session,
  selected,
  inSplit,
  onSelect,
  onKeyDown,
  panelId,
  tabId,
}: {
  session: TerminalConsoleSession
  selected: boolean
  inSplit: boolean
  onSelect: () => void
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void
  panelId: string
  tabId: string
}) {
  const t = useCoreloomI18n().messages.terminalConsole
  const { running } = useTerminalState(session.terminal)
  return (
    <button
      type="button"
      role="tab"
      id={tabId}
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      data-active={selected || undefined}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className={cn(
        'relative flex max-w-[200px] shrink-0 items-center gap-1.5 border-r border-border-subtle px-3 text-[12.5px] text-muted-foreground outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring [&_svg]:size-3.5 [&_svg]:shrink-0',
        (selected || inSplit) && 'bg-inset text-foreground',
        selected && 'after:absolute after:inset-x-0 after:top-0 after:h-0.5 after:bg-primary',
      )}
    >
      <SquareTerminalIcon aria-hidden />
      <span className="truncate">{session.title}</span>
      {running ? (
        <>
          <Spinner aria-hidden className="text-muted-foreground" />
          <span className="sr-only">{`, ${t.running}`}</span>
        </>
      ) : null}
    </button>
  )
}

function TerminalConsole({
  defaultSessions = [],
  createSession,
  profiles = [],
  onCloseSession,
  defaultSplit = false,
  actions,
  className,
  'aria-label': ariaLabel,
}: {
  /** The terminals open at first. */
  defaultSessions?: TerminalConsoleSession[]
  /** Makes a terminal for New terminal (with the profile picked, when there are profiles). */
  createSession: (
    profile: TerminalConsoleProfile | undefined,
  ) => Omit<TerminalConsoleSession, 'id'> & { id?: string }
  /** Shells or targets offered by New terminal's menu. */
  profiles?: TerminalConsoleProfile[]
  /** Called when a terminal is closed: stop its process there. */
  onCloseSession?: (session: TerminalConsoleSession) => void
  /** Starts with two terminals side by side (needs two sessions). */
  defaultSplit?: boolean
  /** More buttons at the end of the bar. */
  actions?: React.ReactNode
  className?: string
  'aria-label'?: string
}) {
  const t = useCoreloomI18n().messages.terminalConsole
  const id = React.useId()
  const counter = React.useRef(0)
  const [sessions, setSessions] = React.useState(defaultSessions)
  const [active, setActive] = React.useState(defaultSessions.at(0)?.id)
  const [split, setSplit] = React.useState<string | undefined>(
    defaultSplit ? defaultSessions.at(1)?.id : undefined,
  )
  const consoleRef = React.useRef<HTMLDivElement>(null)
  // A terminal picked from the menu takes focus; the menu must not hand it back to its button.
  const addedFromMenu = React.useRef(false)

  const sessionOf = (sessionId: string | undefined) => sessions.find((s) => s.id === sessionId)
  const activeSession = sessionOf(active) ?? sessions.at(0)
  const splitSession = split !== activeSession?.id ? sessionOf(split) : undefined

  const focusInput = (sessionId: string) => {
    // After the new terminal renders, put the cursor in it.
    requestAnimationFrame(() => {
      consoleRef.current
        ?.querySelector<HTMLInputElement>(
          `[data-session="${CSS.escape(sessionId)}"] [data-slot=terminal-input]`,
        )
        ?.focus()
    })
  }

  const add = (profile?: TerminalConsoleProfile, asSplit = false) => {
    const made = createSession(profile)
    counter.current++
    const session: TerminalConsoleSession = {
      ...made,
      id: made.id ?? `${id}-${String(counter.current)}`,
    }
    setSessions((list) => [...list, session])
    if (asSplit) setSplit(session.id)
    else setActive(session.id)
    focusInput(session.id)
  }

  const close = (session: TerminalConsoleSession) => {
    const index = sessions.findIndex((s) => s.id === session.id)
    const rest = sessions.filter((s) => s.id !== session.id)
    setSessions(rest)
    onCloseSession?.(session)
    if (split === session.id) setSplit(undefined)
    if (activeSession?.id === session.id) {
      // The split partner takes over; otherwise the neighbour tab.
      const next =
        (splitSession && rest.find((s) => s.id === splitSession.id)) ??
        rest.at(Math.max(0, index - 1))
      setActive(next?.id)
      if (next?.id === split) setSplit(undefined)
      if (next) document.getElementById(`${id}-tab-${next.id}`)?.focus()
      else document.getElementById(`${id}-new`)?.focus()
    }
  }

  const select = (sessionId: string) => {
    // Picking the split partner's tab swaps the two panes.
    if (sessionId === split) setSplit(activeSession?.id)
    setActive(sessionId)
  }

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = sessions.length - 1
    const target =
      event.key === 'ArrowRight'
        ? index === last
          ? 0
          : index + 1
        : event.key === 'ArrowLeft'
          ? index === 0
            ? last
            : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null
    if (target === null) return
    event.preventDefault()
    const next = sessions.at(target)
    if (!next) return
    select(next.id)
    document.getElementById(`${id}-tab-${next.id}`)?.focus()
  }

  const newButton =
    profiles.length > 1 ? (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                id={`${id}-new`}
                data-slot="terminal-console-new"
                aria-label={t.newTerminal}
                className="gap-0.5 px-1.5"
              >
                <PlusIcon />
                <ChevronDownIcon className="size-3" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>{t.newTerminal}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          align="end"
          onCloseAutoFocus={(event) => {
            if (addedFromMenu.current) event.preventDefault()
            addedFromMenu.current = false
          }}
        >
          {profiles.map((profile) => (
            <DropdownMenuItem
              key={profile.id}
              onSelect={() => {
                addedFromMenu.current = true
                add(profile)
              }}
            >
              <SquareTerminalIcon />
              {profile.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            id={`${id}-new`}
            data-slot="terminal-console-new"
            aria-label={t.newTerminal}
            onClick={() => {
              add(profiles[0])
            }}
          >
            <PlusIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t.newTerminal}</TooltipContent>
      </Tooltip>
    )

  const pane = (session: TerminalConsoleSession, primary: boolean) => (
    <div
      key={session.id}
      data-session={session.id}
      role={primary ? 'tabpanel' : 'group'}
      id={primary ? `${id}-panel` : undefined}
      aria-labelledby={primary ? `${id}-tab-${session.id}` : undefined}
      aria-label={primary ? undefined : session.title}
      className="flex min-h-0 min-w-0 flex-col"
    >
      <Terminal
        terminal={session.terminal}
        title={session.title}
        className="h-full rounded-none border-0"
        actions={
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t.close(session.title)}
                onClick={() => {
                  close(session)
                }}
              >
                <XIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.close(session.title)}</TooltipContent>
          </Tooltip>
        }
      />
    </div>
  )

  return (
    <section
      ref={consoleRef}
      data-slot="terminal-console"
      aria-label={ariaLabel ?? t.label}
      className={cn(
        '@container flex h-[420px] min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card',
        className,
      )}
    >
      <div className="flex h-9 shrink-0 items-stretch border-b border-border-subtle">
        <div
          role="tablist"
          aria-label={t.sessions}
          className="flex min-w-0 flex-1 [scrollbar-width:thin] items-stretch overflow-x-auto"
        >
          {sessions.map((session, index) => (
            <SessionTab
              key={session.id}
              session={session}
              selected={session.id === activeSession?.id}
              inSplit={session.id === splitSession?.id}
              tabId={`${id}-tab-${session.id}`}
              panelId={`${id}-panel`}
              onSelect={() => {
                select(session.id)
              }}
              onKeyDown={(event) => {
                onTabKeyDown(event, index)
              }}
            />
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-0.5 px-1.5">
          {newButton}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                aria-label={t.split}
                pressed={!!splitSession}
                disabled={!activeSession}
                onPressedChange={(on) => {
                  if (!on) setSplit(undefined)
                  else {
                    const other = sessions.find((s) => s.id !== activeSession?.id)
                    if (other) setSplit(other.id)
                    else add(profiles[0], true)
                  }
                }}
              >
                <Columns2Icon />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>{t.split}</TooltipContent>
          </Tooltip>
          {actions}
        </div>
      </div>
      {activeSession ? (
        <div
          className={cn(
            'grid min-h-0 flex-1 grid-rows-1',
            splitSession &&
              'grid-rows-2 divide-y divide-border @2xl:grid-cols-2 @2xl:grid-rows-1 @2xl:divide-x @2xl:divide-y-0',
          )}
        >
          {pane(activeSession, true)}
          {splitSession ? pane(splitSession, false) : null}
        </div>
      ) : (
        <Empty className="flex-1 border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SquareTerminalIcon />
            </EmptyMedia>
            <EmptyTitle>{t.empty}</EmptyTitle>
            <EmptyDescription>{t.emptyHint}</EmptyDescription>
          </EmptyHeader>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              add(profiles[0])
            }}
          >
            <PlusIcon />
            {t.newTerminal}
          </Button>
        </Empty>
      )}
    </section>
  )
}

export { TerminalConsole, type TerminalConsoleProfile, type TerminalConsoleSession }
