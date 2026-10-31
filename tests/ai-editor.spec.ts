// Editor AI and Ask AI: what a person does with the keyboard and pointer in the rich text editor's
// AI panel and in the ⌘K palette, and what a screen reader hears. Runs on the built Storybook.
import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

import { openStory } from "./stories"

const open = (page: Page, id: string, locale: "en" | "fr" = "en") => openStory(page, id, "dark", locale)
const EDITOR = "components-forms-rich-text-editor--"

/** Opens the With AI story and selects the first paragraph. */
async function selectFirstParagraph(page: Page) {
  await open(page, `${EDITOR}with-ai`)
  const editor = page.getByRole("textbox", { name: "Announcement" })
  await editor.locator("p").first().click({ clickCount: 3 })
  return editor
}

test.describe("editor AI", () => {
  test("Ctrl / ⌘ + J opens the panel on the selection; a quick action streams, Replace rewrites it", async ({ page }) => {
    const editor = await selectFirstParagraph(page)
    await page.keyboard.press("ControlOrMeta+j")
    const panel = page.getByRole("dialog", { name: "AI assistant" })
    await expect(panel).toBeVisible()
    await expect(page.getByRole("button", { name: "Ask AI" })).toHaveAttribute("aria-expanded", "true")
    await expect(panel.getByRole("textbox", { name: "What should AI do?" })).toBeFocused()
    await expect(panel).toContainText("Selected text")

    await panel.getByRole("group", { name: "Quick actions" }).getByRole("button", { name: "Improve writing" }).click()
    const status = panel.getByRole("status")
    await expect(status).toHaveText("Writing…")
    const preview = panel.getByRole("region", { name: "Suggestion" })
    await expect(preview).toHaveAttribute("aria-busy", "true")
    // Focus moved off the vanished quick action onto Stop, then onto the main action.
    await expect(panel.getByRole("button", { name: "Stop" })).toBeFocused()
    await expect(status).toHaveText("Suggestion ready.")
    await expect(preview).not.toHaveAttribute("aria-busy")
    await expect(preview.locator("strong")).toHaveText("faster")
    const replace = panel.getByRole("button", { name: "Replace selection" })
    await expect(replace).toBeFocused()
    await expect(page.getByTestId("ai-last-request")).toHaveText(/Last request: improve on the selection/)

    await page.keyboard.press("Enter")
    await expect(panel).toBeHidden()
    await expect(editor).toBeFocused()
    // The sentence was rewritten in place (inline, bold kept as a mark), the next paragraph untouched.
    await expect(editor.locator("p")).toHaveCount(2)
    await expect(editor.locator("p").first()).toHaveText("Our new release makes builds faster and fixes the small bugs you reported over the past month.")
    await expect(editor.locator("p").first().locator("strong")).toHaveText("faster")
    await expect(editor.locator("p").nth(1)).toHaveText("Thanks to everyone who tested the beta — three four weeks of it.")
    // One undo step brings the original back.
    await page.keyboard.press("ControlOrMeta+z")
    await expect(editor.locator("p").first()).toContainText("our new release make the build faster")
  })

  test("Stop aborts the stream and keeps what was written", async ({ page }) => {
    await selectFirstParagraph(page)
    await page.keyboard.press("ControlOrMeta+j")
    const panel = page.getByRole("dialog", { name: "AI assistant" })
    await panel.getByRole("button", { name: "Make longer" }).click()
    const preview = panel.getByRole("region", { name: "Suggestion" })
    await expect(preview).toContainText("Our new release")
    await panel.getByRole("button", { name: "Stop" }).click()
    await expect(panel.getByRole("status")).toHaveText("Stopped")
    await expect(panel.getByRole("region", { name: "Suggestion · Stopped" })).toBeVisible()
    const kept = await preview.textContent()
    await page.waitForTimeout(600)
    await expect(preview).toHaveText(kept ?? "")
    await expect(preview).not.toContainText("dark mode")
    await expect(panel.getByRole("button", { name: "Replace selection" })).toBeVisible()
    await expect(panel.getByRole("button", { name: "Try again" })).toBeVisible()
  })

  test("Escape closes the panel and returns focus to the editor, selection intact", async ({ page }) => {
    const editor = await selectFirstParagraph(page)
    const selected = await page.evaluate(() => window.getSelection()?.toString())
    await page.keyboard.press("ControlOrMeta+j")
    const panel = page.getByRole("dialog", { name: "AI assistant" })
    await expect(panel).toBeVisible()
    await page.keyboard.press("Tab")
    await page.keyboard.press("Escape")
    await expect(panel).toBeHidden()
    await expect(editor).toBeFocused()
    expect(await page.evaluate(() => window.getSelection()?.toString())).toBe(selected)
  })

  test("a custom instruction on the whole document; Translate inserts below; Discard leaves the text alone", async ({ page }) => {
    await open(page, `${EDITOR}with-ai`)
    const editor = page.getByRole("textbox", { name: "Announcement" })
    const before = await editor.innerHTML()
    // Nothing selected: the toolbar button works on the whole document.
    await page.getByRole("button", { name: "Ask AI" }).click()
    const panel = page.getByRole("dialog", { name: "AI assistant" })
    await expect(panel).toContainText("Whole document")
    await panel.getByRole("textbox", { name: "What should AI do?" }).fill("Release notes")
    await page.keyboard.press("Enter")
    await expect(panel.getByRole("status")).toHaveText("Suggestion ready.")
    await expect(panel.getByRole("region", { name: "Suggestion" }).locator("ol li")).toHaveCount(3)
    await expect(page.getByTestId("ai-last-request")).toHaveText(/custom on the document/)
    await panel.getByRole("button", { name: "Discard" }).click()
    await expect(panel).toBeHidden()
    await expect(editor).toBeFocused()
    expect(await editor.innerHTML()).toBe(before)

    await editor.locator("p").first().click({ clickCount: 3 })
    await page.keyboard.press("ControlOrMeta+j")
    const translate = panel.getByRole("button", { name: "Translate", exact: true })
    await expect(translate).toHaveAttribute("aria-expanded", "false")
    await translate.click()
    await expect(translate).toHaveAttribute("aria-expanded", "true")
    await panel.getByRole("group", { name: "Languages" }).getByRole("button", { name: "Translate to French" }).click()
    await panel.getByRole("button", { name: "Insert below" }).click()
    await expect(editor.locator("p")).toHaveCount(3)
    await expect(editor.locator("p").nth(1)).toHaveText(/^Notre nouvelle version/)
    await expect(editor.locator("p").first()).toContainText("our new release make the build faster")
  })

  test("a failed request shows its error inline, with Try again", async ({ page }) => {
    await open(page, `${EDITOR}ai-error`)
    const panel = page.getByRole("dialog", { name: "AI assistant" })
    const alert = panel.getByRole("alert")
    await expect(alert).toContainText("The suggestion couldn’t be written.")
    await expect(alert).toContainText("The model is busy. Try again in a minute.")
    await panel.getByRole("button", { name: "Try again" }).click()
    await expect(alert).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(panel).toBeHidden()
    await expect(page.getByRole("textbox", { name: "Announcement" })).toBeFocused()
  })

  test("the open panel passes axe, in English and French", async ({ page }) => {
    for (const [id, locale] of [["ai-panel-open", "en"], ["ai-error", "en"], ["ai-panel-french", "fr"]] as const) {
      await open(page, `${EDITOR}${id}`, locale)
      await expect(page.getByRole("dialog")).toBeVisible()
      const { violations } = await new AxeBuilder({ page })
        .include("[data-slot=popover-content]")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
        .disableRules(["region", "landmark-one-main", "page-has-heading-one"])
        .analyze()
      expect(violations.map((v) => `${id}: ${v.id} ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([])
    }
    await expect(page.getByRole("dialog", { name: "Assistant IA" }).getByRole("button", { name: "Traduire" })).toBeVisible()
  })

  test("fix grammar keeps links and strikethrough through the round trip", async ({ page }) => {
    await open(page, `${EDITOR}with-ai`)
    const editor = page.getByRole("textbox", { name: "Announcement" })
    await editor.locator("p").nth(1).click({ clickCount: 3 })
    await page.keyboard.press("ControlOrMeta+j")
    const panel = page.getByRole("dialog", { name: "AI assistant" })
    await panel.getByRole("button", { name: "Fix spelling and grammar" }).click()
    await expect(panel.getByRole("status")).toHaveText("Suggestion ready.")
    await expect(panel.getByRole("region", { name: "Suggestion" }).getByRole("link", { name: "the beta" })).toHaveAttribute("href", "https://eldenn.github.io/coreloom-ui/")
    await panel.getByRole("button", { name: "Replace selection" }).click()
    const fixed = editor.locator("p").nth(1)
    await expect(fixed).toHaveText("Thank you to everyone who tested the beta — three four weeks of it.")
    await expect(fixed.locator("a")).toHaveAttribute("href", "https://eldenn.github.io/coreloom-ui/")
    await expect(fixed.locator("a")).toHaveText("the beta")
    await expect(fixed.locator("s")).toHaveText("three")
  })

  test("when the selection is edited away, Replace and Insert turn off and say why", async ({ page }) => {
    const editor = await selectFirstParagraph(page)
    await page.keyboard.press("ControlOrMeta+j")
    const panel = page.getByRole("dialog", { name: "AI assistant" })
    await panel.getByRole("button", { name: "Improve writing" }).click()
    await expect(panel.getByRole("status")).toHaveText("Suggestion ready.")
    // The app reloads the content while the panel is open (a controlled value, a collaborator).
    await page.evaluate(() => {
      const dom = document.querySelector(".ProseMirror") as HTMLElement & { editor: { commands: { setContent: (html: string) => void } } }
      dom.editor.commands.setContent("<p>Reloaded from the server.</p>")
    })
    await expect(panel.getByRole("alert")).toHaveText(/The selected text changed/)
    await expect(panel.getByRole("button", { name: "Replace selection" })).toBeDisabled()
    await expect(panel.getByRole("button", { name: "Insert below" })).toBeDisabled()
    await expect(panel.getByRole("button", { name: "Try again" })).toBeDisabled()
    await expect(panel.getByRole("button", { name: "Discard" })).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(panel).toBeHidden()
    await expect(editor.locator("p")).toHaveText(["Reloaded from the server."])
  })

  test("Stop before any text arrives goes back to the prompt, focused", async ({ page }) => {
    await selectFirstParagraph(page)
    await page.keyboard.press("ControlOrMeta+j")
    const panel = page.getByRole("dialog", { name: "AI assistant" })
    await panel.getByRole("button", { name: "Improve writing" }).click()
    await panel.getByRole("button", { name: "Stop" }).click()
    await expect(panel.getByRole("region", { name: /Suggestion/ })).toHaveCount(0)
    await expect(panel.getByRole("group", { name: "Quick actions" })).toBeVisible()
    await expect(panel.getByRole("textbox", { name: "What should AI do?" })).toBeFocused()
  })

  test("AI turned on after mount still works on the selection", async ({ page }) => {
    await open(page, `${EDITOR}ai-added-later`)
    await expect(page.getByRole("button", { name: "Ask AI" })).toHaveCount(0)
    await page.getByRole("switch", { name: "Writing help" }).click()
    const editor = page.getByRole("textbox", { name: "Announcement" })
    await editor.locator("p").first().click({ clickCount: 3 })
    await page.keyboard.press("ControlOrMeta+j")
    const panel = page.getByRole("dialog", { name: "AI assistant" })
    await expect(panel).toContainText("Selected text")
    await expect(editor.locator(".rte-ai-selection").first()).toBeVisible()
    await panel.getByRole("button", { name: "Make shorter" }).click()
    await panel.getByRole("button", { name: "Replace selection" }).click()
    await expect(editor.locator("p").first()).toHaveText("Faster builds, and last month's reported bugs fixed.")
    await expect(editor.locator("p")).toHaveCount(2)
  })

  test("without `ai` the toolbar has no AI button and ⌘J does nothing", async ({ page }) => {
    await open(page, `${EDITOR}empty`)
    await expect(page.getByRole("button", { name: "Ask AI" })).toHaveCount(0)
    await page.getByRole("textbox", { name: "Comment" }).click()
    await page.keyboard.press("ControlOrMeta+j")
    await expect(page.getByRole("dialog")).toHaveCount(0)
  })
})

test.describe("Ask AI in the command palette", () => {
  test("a typed question comes first as Ask AI and is handed back on Enter", async ({ page }) => {
    await open(page, "blocks-docs--ask-ai")
    await page.getByRole("button", { name: "Search docs…" }).click()
    const palette = page.getByRole("dialog")
    const input = palette.getByRole("combobox")
    // Nothing typed: no Ask AI item.
    await expect(palette.getByRole("option", { name: /Ask AI/ })).toHaveCount(0)
    await input.fill("butt")
    await expect(palette.getByRole("option")).toHaveCount(3)
    await expect(palette.getByRole("option").first()).toHaveText("Ask AI: “butt”")
    // An exact match outranks a longer one listed before it ("Button group").
    await input.fill("button")
    await expect(palette.getByRole("option")).toHaveText(["Ask AI: “button”", "Button", "Button group"])
    await input.fill("how do I theme dark mode")
    const ask = palette.getByRole("option", { name: "Ask AI: “how do I theme dark mode”" })
    await expect(palette.getByRole("option")).toHaveCount(1)
    await expect(ask).toHaveAttribute("aria-selected", "true")
    // When Ask AI is there, the empty state isn't.
    await expect(palette.getByText("No results found.")).toHaveCount(0)
    await page.keyboard.press("Enter")
    await expect(palette).toBeHidden()
    await expect(page.getByRole("status").filter({ hasText: "assistant" })).toHaveText("The assistant would answer: “how do I theme dark mode”")
    // Reopened, the search starts empty.
    await page.keyboard.press("ControlOrMeta+k")
    await expect(page.getByRole("dialog").getByRole("combobox")).toHaveValue("")
  })
})
