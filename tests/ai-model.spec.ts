// The model picker and the context meter: keyboard, search, selection, and what screen readers get.
// Runs on the built Storybook like the other interaction tests, in the dark theme.
import { expect, test, type Page } from "@playwright/test"

import { openStory } from "./stories"

const open = (page: Page, id: string, locale: "en" | "fr" = "en") => openStory(page, id, "dark", locale)

test.describe("model picker", () => {
  test("opens with the keyboard, filters as you type, and Enter picks and closes", async ({ page }) => {
    await open(page, "components-ai-model-picker--default")
    const trigger = page.getByRole("combobox", { name: "Model: Claude Sonnet" })
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
    await trigger.focus()
    await page.keyboard.press("Enter")
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
    const search = page.getByRole("combobox", { name: "Search models" })
    await expect(search).toBeFocused()
    // Grouped by provider, every model listed.
    await expect(page.getByRole("group", { name: "Anthropic" }).getByRole("option")).toHaveCount(3)
    await expect(page.getByRole("option")).toHaveCount(6)

    await page.keyboard.type("openai")
    await expect(page.getByRole("option")).toHaveCount(1)
    await expect(page.getByRole("option")).toContainText("GPT mini")
    await expect(page.getByRole("option")).toContainText("128K context")
    await expect(page.getByRole("option")).toContainText("$0.15 / $0.60 per 1M")
    await page.keyboard.press("Enter")

    await expect(page.getByRole("listbox")).toHaveCount(0)
    const picked = page.getByRole("combobox", { name: "Model: GPT mini" })
    await expect(picked).toHaveAttribute("aria-expanded", "false")
    await expect(picked).toContainText("GPT mini")
    await expect(picked).toBeFocused()
  })

  test("arrows move from the chosen model, Escape closes and gives focus back", async ({ page }) => {
    await open(page, "components-ai-model-picker--default")
    const trigger = page.getByRole("combobox", { name: "Model: Claude Sonnet" })
    await trigger.click()
    const sonnet = page.getByRole("option").filter({ hasText: "Claude Sonnet" })
    // The chosen model starts highlighted, and says it is the selected one.
    await expect(sonnet).toHaveAttribute("aria-selected", "true")
    await expect(sonnet).toContainText("Selected")
    await page.keyboard.press("ArrowDown")
    await expect(page.getByRole("option").filter({ hasText: "Claude Haiku" })).toHaveAttribute("aria-selected", "true")
    await page.keyboard.press("Escape")
    await expect(page.getByRole("listbox")).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await expect(trigger).toContainText("Claude Sonnet")
  })

  test("search matches capabilities and says when nothing matches", async ({ page }) => {
    await open(page, "components-ai-model-picker--list")
    const search = page.getByRole("combobox", { name: "Search models" })
    await search.fill("fast")
    await expect(page.getByRole("option")).toHaveCount(2)
    await expect(page.getByRole("option").filter({ hasText: "Claude Haiku" })).toBeVisible()
    await expect(page.getByRole("option").filter({ hasText: "GPT mini" })).toBeVisible()
    await search.fill("zzz")
    await expect(page.getByText("No model matches.")).toBeVisible()
    // A disabled model is listed but can't be picked.
    await search.fill("llama")
    await expect(page.getByRole("option")).toHaveAttribute("aria-disabled", "true")
  })

  test("in a form, the label names it and the choice is submitted", async ({ page }) => {
    await open(page, "components-ai-model-picker--in-a-form")
    // Named by the form's label and the chosen model.
    const field = page.getByRole("combobox", { name: "Default model Claude Haiku", exact: true })
    await expect(field).toContainText("Claude Haiku")
    await expect(field).toHaveAccessibleDescription("New chats start with it.")
    await field.click()
    await page.getByRole("option").filter({ hasText: "Mistral Large" }).click()
    await expect(page.getByRole("combobox", { name: "Default model Mistral Large", exact: true })).toContainText("Mistral Large")
    await page.getByRole("button", { name: "Save" }).click()
    await expect(page.getByText("Saved: mistral-large")).toBeVisible()
  })

  test("French: translated labels and French number formats", async ({ page }) => {
    await open(page, "components-ai-model-picker--french", "fr")
    await expect(page.getByRole("combobox", { name: "Rechercher un modèle" })).toBeVisible()
    await expect(page.getByRole("option").filter({ hasText: "Claude Sonnet" })).toContainText(/Contexte 200\sk/)
    await expect(page.getByRole("option").filter({ hasText: "Claude Sonnet" })).toContainText(/3\s\$US \/ 15\s\$US par million de tokens/)
  })
})

test.describe("context meter", () => {
  test("exposes its value, and the breakdown on focus", async ({ page }) => {
    await open(page, "components-ai-context-meter--default")
    const meter = page.getByRole("meter", { name: "Context used" })
    await expect(meter).toHaveAttribute("aria-valuenow", "84592")
    await expect(meter).toHaveAttribute("aria-valuemax", "200000")
    await expect(meter).toHaveAttribute("aria-valuetext", "42%, 85K of 200K tokens")
    await expect(meter).toHaveText("42%")
    // Screen readers get the breakdown as the description, without opening anything.
    await expect(meter).toHaveAccessibleDescription(/Plenty of room left\. Input: 80,412\. Cached input: 61,200\. Output: 4,180\. Reasoning: 2,350\. Total: 85K of 200K\. Estimated cost: \$0\.30/)

    await page.keyboard.press("Tab")
    await expect(meter).toBeFocused()
    const card = page.locator('[data-slot="hover-card-content"]')
    await expect(card).toBeVisible()
    await expect(card).toContainText("Context window")
    await expect(card).toContainText("Cached input")
    await expect(card).toContainText("Estimated cost")
    await expect(card).toContainText("$0.30")
    await page.keyboard.press("Shift+Tab")
    await expect(card).toBeHidden()
  })

  test("says in words when the window fills up", async ({ page }) => {
    await open(page, "components-ai-context-meter--high")
    const high = page.getByRole("meter", { name: "Context used" })
    await expect(high).toHaveAttribute("data-level", "warning")
    await expect(high).toHaveText("85%")
    await expect(high).toHaveAccessibleDescription(/Filling up/)

    await open(page, "components-ai-context-meter--near-full")
    const full = page.getByRole("meter", { name: "Context used" })
    await expect(full).toHaveAttribute("data-level", "critical")
    await expect(full).toHaveText("97%")
    await full.hover()
    await expect(page.locator('[data-slot="hover-card-content"]')).toContainText("Almost full")
  })
})

test.describe("context meter on touch", () => {
  const touch = async (page: Page, moveBy: number) => {
    const meter = page.getByRole("meter", { name: "Context used" })
    const box = (await meter.boundingBox())!
    const at = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
    await meter.dispatchEvent("pointerdown", { pointerType: "touch", isPrimary: true, clientX: at.x, clientY: at.y })
    await meter.dispatchEvent("pointerup", { pointerType: "touch", isPrimary: true, clientX: at.x, clientY: at.y + moveBy })
  }

  test("a tap toggles the breakdown, a swipe that starts on it doesn't", async ({ page }) => {
    await open(page, "components-ai-context-meter--default")
    const card = page.locator('[data-slot="hover-card-content"]')
    await touch(page, 40)
    await expect(card).toHaveCount(0)
    await touch(page, 0)
    await expect(card).toBeVisible()
    await expect(card).toContainText("Estimated cost")
    await touch(page, 0)
    await expect(card).toBeHidden()
  })

  test("French: the screen-reader summary keeps French punctuation", async ({ page }) => {
    await open(page, "components-ai-context-meter--french", "fr")
    await expect(page.getByRole("meter", { name: "Contexte utilisé" })).toHaveAccessibleDescription(/Encore beaucoup de place\. Entrée : 80\s412\. Entrée en cache : 61\s200\./)
  })
})

test.describe("chat with a model picker", () => {
  test("picking a model with a smaller window moves the meter", async ({ page }) => {
    await open(page, "blocks-ai-chat--with-model-picker")
    const meter = page.getByRole("meter", { name: "Context used" })
    await expect(meter).toHaveAttribute("aria-valuetext", "42%, 85K of 200K tokens")
    await page.getByRole("combobox", { name: "Model: Claude Sonnet" }).click()
    await page.getByRole("combobox", { name: "Search models" }).fill("gpt")
    await page.keyboard.press("Enter")
    await expect(page.getByRole("combobox", { name: "Model: GPT mini" })).toBeVisible()
    await expect(meter).toHaveAttribute("aria-valuemax", "128000")
    await expect(meter).toHaveAttribute("aria-valuetext", "66%, 85K of 128K tokens")
    // The composer still works: the prompt is a textbox next to the toolbar.
    await expect(page.getByRole("textbox", { name: "Message" })).toBeVisible()
  })
})
