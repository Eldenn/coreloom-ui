// Behaviour, not looks: what a user does with the keyboard and pointer, and what they (or a screen
// reader) get back. Runs on the built Storybook like the a11y and visual tests, in the dark theme.
import { expect, test, type Page } from "@playwright/test"

import { openStory } from "./stories"

const open = (page: Page, id: string, locale: "en" | "fr" = "en") => openStory(page, id, "dark", locale)
const INPUTS = "components-forms-files-tags-ranges-steps--"

test.describe("overlays", () => {
  test("a dialog traps focus, closes on Escape and gives focus back", async ({ page }) => {
    await open(page, "components-overlays--dialog-story")
    const trigger = page.getByRole("button", { name: "Publish package" })
    await trigger.click()
    const dialog = page.getByRole("dialog", { name: /Publish @coreloom\/ui/ })
    await expect(dialog).toBeVisible()
    // Tab cycles inside the dialog.
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab")
      expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true)
    }
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test("an alert dialog starts on Cancel and ignores clicks outside", async ({ page }) => {
    await open(page, "components-overlays--alert-dialog-story")
    await page.getByRole("button", { name: "Delete project" }).click()
    const dialog = page.getByRole("alertdialog")
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused()
    await page.mouse.click(5, 5)
    await expect(dialog).toBeVisible()
  })
})

test.describe("pickers", () => {
  test("the combobox filters as you type and selects with the keyboard", async ({ page }) => {
    await open(page, "components-forms-pickers--default")
    const trigger = page.getByRole("combobox", { name: "Region" })
    await trigger.click()
    await page.keyboard.type("tok")
    const options = page.getByRole("option")
    await expect(options).toHaveCount(1)
    await page.keyboard.press("Enter")
    await expect(trigger).toContainText("Tokyo")
  })

  test("a date range shortcut fills the range", async ({ page }) => {
    await open(page, `${INPUTS}date-range-picker-story`)
    const trigger = page.getByLabel("Report period")
    await trigger.click()
    await page.getByRole("button", { name: "Last 7 days" }).click()
    // The clock is frozen on Oct 14, 2026.
    await expect(trigger).toHaveText(/Oct 8, 2026 – Oct 14, 2026/)
  })

  test("the command palette narrows results and shows an empty state", async ({ page }) => {
    await open(page, "components-navigation--command-story")
    const input = page.getByPlaceholder("Search docs, components, commands…")
    await input.fill("dia")
    await expect(page.getByRole("option")).toHaveText(["Dialog"])
    await input.fill("zzz")
    await expect(page.getByText("No components match that search.")).toBeVisible()
  })
})

test.describe("inputs", () => {
  test("tags: Enter, comma and paste add; Backspace removes; changes are announced", async ({ page }) => {
    await open(page, `${INPUTS}tags-input-story`)
    const input = page.getByLabel("Topics")
    const tags = page.locator("[data-slot=tags-input-tag]")
    const before = await tags.count()
    await input.fill("nextjs, ")
    await input.pressSequentially("vite")
    await input.press("Enter")
    await expect(tags).toHaveCount(before + 2)
    await input.press("Backspace")
    await expect(tags).toHaveCount(before + 1)
    await expect(page.locator("[data-slot=tags-input] [role=status]")).toContainText("vite")
    // Duplicates are ignored, whatever their case.
    await input.pressSequentially("NextJS")
    await input.press("Enter")
    await expect(tags).toHaveCount(before + 1)
  })

  test("file upload rejects the wrong type and oversized files, with a message for each", async ({ page }) => {
    await open(page, `${INPUTS}file-upload-story`)
    const rows = page.locator("[data-slot=file-upload-list] li")
    const before = await rows.count()
    await page.setInputFiles("input[type=file]", [
      { name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("hi") },
      { name: "huge.png", mimeType: "image/png", buffer: Buffer.alloc(6 * 1024 * 1024) },
      { name: "logo.png", mimeType: "image/png", buffer: Buffer.from("x") },
    ])
    const alert = page.locator("[data-slot=file-upload] [role=alert]")
    await expect(alert).toContainText("notes.txt")
    await expect(alert).toContainText("huge.png")
    await expect(rows).toHaveCount(before + 1)
    await page.getByRole("button", { name: "Remove logo.png" }).click()
    await expect(rows).toHaveCount(before)
  })

  test("the one-time code takes digits only", async ({ page }) => {
    await open(page, "components-forms-pickers--one-time-code")
    const input = page.getByRole("textbox").first()
    await input.focus()
    // Letters are refused; digits fill the slots one after the other.
    await page.keyboard.type("12ab3456")
    await expect(input).toHaveValue("123456")
    await page.keyboard.press("Backspace")
    await expect(input).toHaveValue("12345")
  })
})

test.describe("forms", () => {
  test("submitting an empty form shows every error, and marks the invalid fields", async ({ page }) => {
    await open(page, "components-forms-form-tanstack--create-project")
    await page.getByRole("button", { name: "Create project" }).click()
    const errors = page.locator("[data-slot=field-error]")
    await expect(errors.first()).toBeVisible()
    await expect(errors).toContainText(["Pick a region.", "Accept the terms to continue."])
    // Invalid fields are marked for assistive technology.
    await expect(page.getByLabel("Project name")).toHaveAttribute("aria-invalid", "true")
  })

  test("a valid form submits, shows its busy state and confirms", async ({ page }) => {
    await open(page, "components-forms-form-tanstack--create-project")
    await page.getByLabel("Project name").fill("acme-web")
    await page.getByRole("combobox", { name: "Framework" }).click()
    await page.getByRole("option").first().click()
    await page.getByRole("combobox", { name: "Region" }).click()
    await page.getByRole("option").first().click()
    await page.getByLabel("I accept the terms of service").check()
    // The label changes while busy ("Creating…"), so hold on to the element, not its name.
    const submit = page.locator("button[type=submit]")
    await expect(submit).toHaveText("Create project")
    await submit.click()
    // Busy while the (simulated) server answers, then a toast confirms.
    await expect(submit).toHaveAttribute("aria-busy", "true")
    await expect(submit).toHaveText("Creating…")
    await expect(page.getByText("Created acme-web")).toBeVisible()
    await expect(submit).not.toHaveAttribute("aria-busy")
  })

  test("a server error is shown at the top of the form", async ({ page }) => {
    await open(page, "components-forms-form-tanstack--server-error")
    await expect(page.getByRole("alert").filter({ hasText: "at capacity" })).toBeVisible()
  })

  test("sign in: a wrong password shows the error, the right one clears it", async ({ page }) => {
    await open(page, "blocks-auth--sign-in-flow")
    await page.getByLabel("Email").fill("ada@coreloom.dev")
    await page.getByLabel("Password").fill("nope")
    await page.getByRole("button", { name: "Sign in", exact: true }).click()
    await expect(page.getByText("Wrong email or password.")).toBeVisible()
    await page.getByLabel("Password").fill("coreloom")
    await page.getByRole("button", { name: "Sign in", exact: true }).click()
    await expect(page.getByText("Wrong email or password.")).toBeHidden()
    // The story answers after 900 ms: the error must not come back once it has.
    await page.waitForTimeout(1200)
    await expect(page.locator("[data-submitting]")).toHaveCount(0)
    await expect(page.getByText("Wrong email or password.")).toBeHidden()
  })
})

test.describe("blocks", () => {
  test("the data list keeps its search, filters and page in the URL", async ({ page }) => {
    await open(page, "blocks-data-list--projects")
    await page.getByLabel("Search projects…").fill("core")
    await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe("core")
    await page.getByRole("button", { name: "Filter by Status" }).click()
    await page.getByRole("option", { name: /Ready/ }).click()
    await page.keyboard.press("Escape")
    await expect.poll(() => new URL(page.url()).searchParams.get("status")).toBe("ready")
    const rows = await page.locator("tbody tr").count()
    await page.reload()
    await expect(page.getByLabel("Search projects…")).toHaveValue("core")
    await expect(page.locator("tbody tr")).toHaveCount(rows)
    await page.getByRole("button", { name: "Clear filters" }).click()
    await expect.poll(() => new URL(page.url()).searchParams.has("q")).toBe(false)
  })

  test("onboarding validates the step on screen and moves focus to the next one", async ({ page }) => {
    await open(page, "blocks-onboarding--setup-wizard")
    const next = page.getByRole("button", { name: "Continue" })
    await next.click()
    await expect(page.locator("[data-slot=field-error]").first()).toBeVisible()
    await expect(page.locator("[aria-current=step]")).toContainText("Workspace")
    await page.getByLabel("Workspace name").fill("Acme")
    await page.getByLabel("URL").fill("acme")
    await next.click()
    await expect(page.locator("[aria-current=step]")).toContainText("Region")
    await expect(page.locator(":focus")).toHaveText(/region/i)
    // No errors carried over to the new step before it is submitted.
    await expect(page.locator("[data-slot=field-error]")).toHaveCount(0)
  })

  test("pricing switches to yearly prices", async ({ page }) => {
    await open(page, "blocks-pricing--plans")
    await expect(page.getByText("€24")).toBeVisible()
    await page.getByRole("radio", { name: /Yearly/ }).click()
    await expect(page.getByText("€19")).toBeVisible()
    await expect(page.getByText(/billed yearly/).first()).toBeVisible()
  })

  test("the data table filters its rows", async ({ page }) => {
    await open(page, "components-tables--data-table-story")
    await page.getByPlaceholder("Filter projects…").fill("api")
    await expect(page.getByRole("cell", { name: "coreloom-api" })).toHaveCount(2)
    await expect(page.getByRole("cell", { name: "docs" })).toHaveCount(0)
  })
})

test.describe("theme and language", () => {
  test("System follows the operating system live and is remembered", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" })
    await open(page, "components-actions-theme-switch--menu")
    await page.getByRole("button", { name: /Theme/ }).click()
    await page.getByRole("menuitemradio", { name: "System" }).click()
    const theme = () => page.evaluate(() => document.documentElement.dataset.theme ?? "dark")
    await expect.poll(theme).toBe("light")
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("system")
    await page.emulateMedia({ colorScheme: "dark" })
    await expect.poll(theme).toBe("dark")
  })

  test("French labels reach the controls", async ({ page }) => {
    await open(page, `${INPUTS}file-upload-story`, "fr")
    await expect(page.getByRole("button", { name: /Retirer/ }).first()).toBeVisible()
    await expect(page.getByText(/\d,\d\s?Mo/).first()).toBeVisible()
  })
})
