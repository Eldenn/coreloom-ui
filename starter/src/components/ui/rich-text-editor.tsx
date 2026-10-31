"use client"

// Coreloom UI — RichTextEditor. Tiptap (ProseMirror) with a toolbar: bold, italic, underline,
// strikethrough, inline code, two heading levels, lists, quote, code block, links, undo / redo.
// Optional AI (`ai`): an "AI" button and ⌘J / Ctrl+J open a panel that edits the selection
// through the app's own model call. The value is HTML. Sanitize it on the server before you
// render it anywhere else.
import * as React from "react"
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extensions"
import {
  BoldIcon,
  CodeIcon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  Redo2Icon,
  SquareCodeIcon,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2Icon,
  UnlinkIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Toggle } from "@/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AI_CONTENT,
  AiSelectionHighlight,
  RichTextAi,
  type RichTextAiAction,
  type RichTextAiCommand,
  type RichTextAiOptions,
  type RichTextAiRequest,
} from "@/components/ui/rich-text-ai"
import { useCoreloomI18n } from "@/lib/i18n"

function ToolbarToggle({
  label,
  shortcut,
  pressed,
  onPressedChange,
  disabled,
  children,
}: {
  label: string
  shortcut?: string
  pressed: boolean
  onPressedChange: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle size="sm" aria-label={label} pressed={pressed} onPressedChange={onPressedChange} disabled={disabled} className="size-8 min-w-8 px-0">
          {children}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent>
        {label}
        {shortcut && <span className="ml-2 font-mono text-muted-foreground">{shortcut}</span>}
      </TooltipContent>
    </Tooltip>
  )
}

function LinkButton({ editor, disabled }: { editor: Editor; disabled?: boolean }) {
  const t = useCoreloomI18n().messages.editor
  const [open, setOpen] = React.useState(false)
  const [url, setUrl] = React.useState("")
  const active = editor.isActive("link")
  const apply = () => {
    const href = url.trim()
    const chain = editor.chain().focus().extendMarkRange("link")
    if (!href) chain.unsetLink().run()
    else chain.setLink({ href: /^[a-z][a-z\d+.-]*:|^\/|^#/i.test(href) ? href : `https://${href}` }).run()
    setOpen(false)
  }
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setUrl((editor.getAttributes("link").href as string | undefined) ?? "")
        setOpen(next)
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Toggle size="sm" aria-label={t.link} pressed={active} disabled={disabled} className="size-8 min-w-8 px-0">
              <LinkIcon />
            </Toggle>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{t.link}</TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="w-80">
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            apply()
          }}
        >
          <label htmlFor="rte-link" className="text-[13px] font-medium text-foreground">
            {t.linkUrl}
          </label>
          <Input id="rte-link" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" autoFocus className="h-9" />
          <div className="flex justify-end gap-2">
            {active && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  editor.chain().focus().extendMarkRange("link").unsetLink().run()
                  setOpen(false)
                }}
              >
                <UnlinkIcon />
                {t.linkRemove}
              </Button>
            )}
            <Button type="submit" size="sm">
              {t.linkApply}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}

// Content styles live here, as Tailwind variants, so the component needs no global stylesheet.
const CONTENT = [
  "[&_.ProseMirror]:outline-none [&_.ProseMirror>*+*]:mt-2.5",
  "[&_.ProseMirror_h2]:font-display [&_.ProseMirror_h2]:text-[19px] [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:tracking-[-0.01em]",
  "[&_.ProseMirror_h3]:font-display [&_.ProseMirror_h3]:text-[16px] [&_.ProseMirror_h3]:font-semibold",
  "[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_li>p]:my-0.5",
  "[&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-primary [&_.ProseMirror_blockquote]:pl-3 [&_.ProseMirror_blockquote]:text-fg-secondary",
  "[&_.ProseMirror_code]:rounded-[4px] [&_.ProseMirror_code]:bg-secondary [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-[13px]",
  "[&_.ProseMirror_pre]:rounded-md [&_.ProseMirror_pre]:bg-surface [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_pre]:font-mono [&_.ProseMirror_pre]:text-[13px] [&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:p-0",
  "[&_.ProseMirror_a]:text-primary-text [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:underline-offset-4",
  "[&_.ProseMirror_hr]:my-4 [&_.ProseMirror_hr]:border-border",
  "[&_.ProseMirror_p.is-editor-empty:first-child]:before:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child]:before:float-left [&_.ProseMirror_p.is-editor-empty:first-child]:before:h-0 [&_.ProseMirror_p.is-editor-empty:first-child]:before:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
].join(" ")

function RichTextEditor({
  value,
  defaultValue = "",
  onValueChange,
  placeholder,
  disabled = false,
  minHeight = 160,
  className,
  id,
  onBlur,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ai,
}: {
  /** HTML. Controlled: the editor follows it when it changes from outside. */
  value?: string
  defaultValue?: string
  onValueChange?: (html: string) => void
  placeholder?: string
  disabled?: boolean
  /** Height of the writing area before it grows, in px. */
  minHeight?: number
  className?: string
  /** Goes on the editable area, so a FieldLabel can point at it. */
  id?: string
  onBlur?: () => void
  "aria-invalid"?: boolean | "true" | "false"
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
  /** Turns on the AI panel: `onRequest` sends each request to your model and returns its text (streamed or whole). */
  ai?: RichTextAiOptions
}) {
  const t = useCoreloomI18n().messages.editor
  placeholder ??= t.placeholder
  const mac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
  const mod = mac ? "⌘" : "Ctrl+"
  const [aiOpen, setAiOpen] = React.useState(Boolean(ai?.defaultOpen))

  const editor = useEditor({
    // Render on the client after mount (no SSR mismatch in Next.js).
    immediatelyRender: false,
    editable: !disabled,
    content: value ?? defaultValue,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer nofollow" } },
      }),
      Placeholder.configure({ placeholder }),
      // Always there (inert until the AI panel paints a selection), so `ai` can be turned on after mount.
      AiSelectionHighlight,
    ],
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        class: "rte-content outline-none",
        style: `min-height:${minHeight}px`,
      },
    },
    onUpdate: ({ editor }) => onValueChange?.(editor.isEmpty ? "" : editor.getHTML()),
    onBlur: () => onBlur?.(),
  })

  // Keep the editable area's ARIA in step with the field (labels, errors, disabled).
  React.useEffect(() => {
    if (!editor) return
    const dom = editor.view.dom
    const set = (name: string, v?: string) => (v ? dom.setAttribute(name, v) : dom.removeAttribute(name))
    set("id", id)
    set("aria-label", ariaLabel)
    set("aria-labelledby", ariaLabelledBy)
    set("aria-describedby", ariaDescribedBy)
    set("aria-invalid", ariaInvalid ? String(ariaInvalid) : undefined)
    set("aria-disabled", disabled ? "true" : undefined)
    editor.setEditable(!disabled)
  }, [editor, id, ariaLabel, ariaLabelledBy, ariaDescribedBy, ariaInvalid, disabled])

  // Follow the value when it changes from outside (a form reset, loaded content).
  React.useEffect(() => {
    if (!editor || value === undefined) return
    const current = editor.isEmpty ? "" : editor.getHTML()
    if (value !== current) editor.commands.setContent(value || "", { emitUpdate: false })
  }, [editor, value])

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e && {
        bold: e.isActive("bold"),
        italic: e.isActive("italic"),
        underline: e.isActive("underline"),
        strike: e.isActive("strike"),
        code: e.isActive("code"),
        h2: e.isActive("heading", { level: 2 }),
        h3: e.isActive("heading", { level: 3 }),
        bullet: e.isActive("bulletList"),
        ordered: e.isActive("orderedList"),
        quote: e.isActive("blockquote"),
        codeBlock: e.isActive("codeBlock"),
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
      },
  })

  const run = (fn: (e: Editor) => void) => () => editor && fn(editor)

  return (
    <div
      data-slot="rich-text-editor"
      data-disabled={disabled || undefined}
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-md border border-input bg-inset transition-[border-color,box-shadow] duration-180 ease-out focus-within:border-primary focus-within:ring-[3px] focus-within:ring-ring has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:ring-[3px] has-[[aria-invalid=true]]:ring-destructive-subtle data-[disabled]:opacity-55",
        className
      )}
      onKeyDown={
        ai
          ? (e) => {
              // ⌘J / Ctrl+J opens the AI panel from the writing area or the toolbar.
              if (e.key.toLowerCase() !== "j" || !(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return
              e.preventDefault()
              if (!disabled && editor && !aiOpen) setAiOpen(true)
            }
          : undefined
      }
    >
      <div role="toolbar" aria-label={t.toolbar} className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface px-1.5 py-1">
        {editor && state ? (
          <>
            <ToolbarToggle label={t.bold} shortcut={`${mod}B`} pressed={state.bold} onPressedChange={run((e) => e.chain().focus().toggleBold().run())} disabled={disabled}>
              <BoldIcon />
            </ToolbarToggle>
            <ToolbarToggle label={t.italic} shortcut={`${mod}I`} pressed={state.italic} onPressedChange={run((e) => e.chain().focus().toggleItalic().run())} disabled={disabled}>
              <ItalicIcon />
            </ToolbarToggle>
            <ToolbarToggle label={t.underline} shortcut={`${mod}U`} pressed={state.underline} onPressedChange={run((e) => e.chain().focus().toggleUnderline().run())} disabled={disabled}>
              <UnderlineIcon />
            </ToolbarToggle>
            <ToolbarToggle label={t.strike} pressed={state.strike} onPressedChange={run((e) => e.chain().focus().toggleStrike().run())} disabled={disabled}>
              <StrikethroughIcon />
            </ToolbarToggle>
            <ToolbarToggle label={t.code} pressed={state.code} onPressedChange={run((e) => e.chain().focus().toggleCode().run())} disabled={disabled}>
              <CodeIcon />
            </ToolbarToggle>
            <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-5" />
            <ToolbarToggle label={t.heading2} pressed={state.h2} onPressedChange={run((e) => e.chain().focus().toggleHeading({ level: 2 }).run())} disabled={disabled}>
              <Heading2Icon />
            </ToolbarToggle>
            <ToolbarToggle label={t.heading3} pressed={state.h3} onPressedChange={run((e) => e.chain().focus().toggleHeading({ level: 3 }).run())} disabled={disabled}>
              <Heading3Icon />
            </ToolbarToggle>
            <ToolbarToggle label={t.bulletList} pressed={state.bullet} onPressedChange={run((e) => e.chain().focus().toggleBulletList().run())} disabled={disabled}>
              <ListIcon />
            </ToolbarToggle>
            <ToolbarToggle label={t.orderedList} pressed={state.ordered} onPressedChange={run((e) => e.chain().focus().toggleOrderedList().run())} disabled={disabled}>
              <ListOrderedIcon />
            </ToolbarToggle>
            <ToolbarToggle label={t.quote} pressed={state.quote} onPressedChange={run((e) => e.chain().focus().toggleBlockquote().run())} disabled={disabled}>
              <QuoteIcon />
            </ToolbarToggle>
            <ToolbarToggle label={t.codeBlock} pressed={state.codeBlock} onPressedChange={run((e) => e.chain().focus().toggleCodeBlock().run())} disabled={disabled}>
              <SquareCodeIcon />
            </ToolbarToggle>
            <LinkButton editor={editor} disabled={disabled} />
            <span className="ml-auto flex items-center gap-0.5">
              {ai && (
                <>
                  <RichTextAi editor={editor} options={ai} open={aiOpen} onOpenChange={setAiOpen} shortcut={`${mod}J`} disabled={disabled} />
                  <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-5" />
                </>
              )}
              <Button type="button" variant="ghost" size="icon-sm" aria-label={t.undo} disabled={disabled || !state.canUndo} onClick={run((e) => e.chain().focus().undo().run())}>
                <Undo2Icon />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={t.redo} disabled={disabled || !state.canRedo} onClick={run((e) => e.chain().focus().redo().run())}>
                <Redo2Icon />
              </Button>
            </span>
          </>
        ) : (
          <span className="h-8" />
        )}
      </div>
      <EditorContent editor={editor} className={cn("px-[13px] py-2.5 text-[14px] leading-[1.6] text-foreground", CONTENT, ai && AI_CONTENT)} />
    </div>
  )
}

export { RichTextEditor, type RichTextAiAction, type RichTextAiCommand, type RichTextAiOptions, type RichTextAiRequest }
