'use client'

// Coreloom UI — UmlDiagram tools. What sits on the canvas around the drawing: the zoom, fit,
// select-an-area and arrange buttons; the bar that aligns and spaces the selected boxes; and the
// field that renames an element in place (F2 or a double click). UmlDiagram places them.
import { Panel, useReactFlow } from '@xyflow/react'
import {
  AlignCenterHorizontalIcon,
  AlignCenterVerticalIcon,
  AlignEndHorizontalIcon,
  AlignEndVerticalIcon,
  AlignHorizontalDistributeCenterIcon,
  AlignStartHorizontalIcon,
  AlignStartVerticalIcon,
  AlignVerticalDistributeCenterIcon,
  LayoutGridIcon,
  type LucideIcon,
  MaximizeIcon,
  SquareDashedMousePointerIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toolbar, ToolbarButton } from '@/components/ui/toolbar'
import { useCoreloomI18n } from '@/lib/i18n'
import { ALIGNMENTS, canAlign, type UmlAlignment } from '@/lib/uml-arrange'
import { cn } from '@/lib/utils'

function CanvasControls({
  editable,
  selecting,
  onSelecting,
  onArrange,
}: {
  editable: boolean
  /** Dragging on the canvas draws a selection box instead of moving the view. */
  selecting: boolean
  onSelecting: (on: boolean) => void
  onArrange: () => void
}) {
  const t = useCoreloomI18n().messages.diagram
  const flow = useReactFlow()
  const buttons = [
    { label: t.zoomIn, icon: ZoomInIcon, run: () => void flow.zoomIn() },
    { label: t.zoomOut, icon: ZoomOutIcon, run: () => void flow.zoomOut() },
    {
      label: t.fit,
      icon: MaximizeIcon,
      run: () => void flow.fitView({ padding: 0.15, maxZoom: 1 }),
    },
    ...(editable ? [{ label: t.arrange, icon: LayoutGridIcon, run: onArrange }] : []),
  ]
  return (
    <Panel position="top-right" className="!m-2 flex gap-1">
      {editable && (
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={t.selectArea}
          aria-pressed={selecting}
          title={t.selectArea}
          onClick={() => {
            onSelecting(!selecting)
          }}
          className={cn('bg-background', selecting && 'border-primary bg-primary-subtle')}
        >
          <SquareDashedMousePointerIcon aria-hidden />
        </Button>
      )}
      {buttons.map(({ label, icon: Icon, run }) => (
        <Button
          key={label}
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={label}
          title={label}
          onClick={run}
          className="bg-background"
        >
          <Icon aria-hidden />
        </Button>
      ))}
    </Panel>
  )
}

const ALIGN_ICONS: Record<UmlAlignment, LucideIcon> = {
  left: AlignStartVerticalIcon,
  center: AlignCenterVerticalIcon,
  right: AlignEndVerticalIcon,
  top: AlignStartHorizontalIcon,
  middle: AlignCenterHorizontalIcon,
  bottom: AlignEndHorizontalIcon,
  distributeHorizontally: AlignHorizontalDistributeCenterIcon,
  distributeVertically: AlignVerticalDistributeCenterIcon,
}

/** Shown while two boxes or more are selected: line them up, or space them evenly. */
function AlignBar({ count, onAlign }: { count: number; onAlign: (how: UmlAlignment) => void }) {
  const t = useCoreloomI18n().messages.diagram.align
  return (
    <Panel position="bottom-center" className="!mb-3">
      <Toolbar aria-label={t.label} className="bg-background shadow-sm">
        {ALIGNMENTS.map((how) => {
          const Icon = ALIGN_ICONS[how]
          return (
            <ToolbarButton
              key={how}
              aria-label={t[how]}
              tooltip={t[how]}
              disabled={!canAlign(how, count)}
              onClick={() => {
                onAlign(how)
              }}
            >
              <Icon aria-hidden />
            </ToolbarButton>
          )
        })}
      </Toolbar>
    </Panel>
  )
}

interface RenameTarget {
  id: string
  value: string
  /** Where the box's top edge is, in the canvas's own pixels. */
  left: number
  top: number
  width: number
}

/** A name field over an element's title. Enter or leaving applies; Escape puts the name back. */
function RenameField({
  target,
  label,
  onDone,
}: {
  target: RenameTarget
  label: string
  /** The new name, or null when it was cancelled. */
  onDone: (value: string | null) => void
}) {
  const [value, setValue] = React.useState(target.value)
  const input = React.useRef<HTMLInputElement>(null)
  const done = React.useRef(false)
  React.useEffect(() => {
    input.current?.focus()
    input.current?.select()
  }, [])
  const finish = (next: string | null) => {
    if (done.current) return
    done.current = true
    onDone(next)
  }
  return (
    <Input
      ref={input}
      aria-label={label}
      value={value}
      data-uml-export-skip=""
      className="absolute z-10 h-8 bg-background text-[13px] shadow-md"
      style={{ left: target.left, top: target.top + 4, width: target.width }}
      onChange={(e) => {
        setValue(e.target.value)
      }}
      onBlur={() => {
        finish(value)
      }}
      onKeyDown={(e) => {
        // The canvas mustn't read these keys as its own (Delete, arrows, F2).
        e.stopPropagation()
        if (e.key === 'Enter') finish(value)
        if (e.key === 'Escape') finish(null)
      }}
    />
  )
}

export { AlignBar, CanvasControls, RenameField, type RenameTarget }
