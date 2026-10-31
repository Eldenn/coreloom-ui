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

  test("forgot password: confirms without naming the account, moves focus, and goes back", async ({ page }) => {
    await open(page, "blocks-auth--forgot-password")
    await page.getByRole("button", { name: "Send reset link" }).click()
    await expect(page.getByText("Enter your email address.")).toBeVisible()
    await page.getByLabel("Email").fill("ada@coreloom.dev")
    await page.getByRole("button", { name: "Send reset link" }).click()
    const heading = page.getByRole("heading", { level: 1, name: "Check your inbox" })
    await expect(heading).toBeFocused()
    await expect(page.getByText("If an account uses ada@coreloom.dev", { exact: false })).toBeVisible()
    await page.getByRole("button", { name: "Use another email" }).click()
    await expect(page.getByLabel("Email")).toHaveValue("ada@coreloom.dev")
  })

  test("reset password: both fields must match, and stay checked as the first one changes", async ({ page }) => {
    await open(page, "blocks-auth--reset-password")
    await page.getByLabel("New password").fill("short")
    await page.getByLabel("New password").blur()
    await expect(page.getByText("Use at least 8 characters.")).toBeVisible()
    await page.getByLabel("New password").fill("long-enough")
    await page.getByLabel("Confirm the password").fill("long-enough")
    await page.getByLabel("Confirm the password").blur()
    await expect(page.getByText("The two passwords don’t match.")).toBeHidden()
    await page.getByLabel("New password").fill("long-enough!")
    await expect(page.getByText("The two passwords don’t match.")).toBeVisible()
    // The account's email goes to password managers with the new password.
    await expect(page.locator("input[autocomplete=username]")).toHaveValue("ada@coreloom.dev")
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

  test("the accent picker: arrow keys, html data-accent, remembered", async ({ page }) => {
    await open(page, "components-actions-theme-switch--accent")
    const group = page.getByRole("radiogroup", { name: "Accent colour" })
    await expect(group.getByRole("radio", { name: "Cyan" })).toBeChecked()
    // Click first so the group has keyboard focus (Radix selects on arrow-key focus only).
    await group.getByRole("radio", { name: "Cyan" }).click()
    await expect(group.getByRole("radio", { name: "Cyan" })).toBeFocused()
    await page.keyboard.press("ArrowRight")
    await expect(group.getByRole("radio", { name: "Blue" })).toBeChecked()
    await group.getByText("Rose").click()
    await expect(group.getByRole("radio", { name: "Rose" })).toBeChecked()
    expect(await page.evaluate(() => [document.documentElement.dataset.accent, localStorage.getItem("accent")])).toEqual(["rose", "rose"])
    await group.getByRole("radio", { name: "Cyan" }).click()
    expect(await page.evaluate(() => [document.documentElement.dataset.accent ?? null, localStorage.getItem("accent")])).toEqual([null, null])
  })

  test("French labels reach the controls", async ({ page }) => {
    await open(page, `${INPUTS}file-upload-story`, "fr")
    await expect(page.getByRole("button", { name: /Retirer/ }).first()).toBeVisible()
    await expect(page.getByText(/\d,\d\s?Mo/).first()).toBeVisible()
  })
})

const BUSINESS = "components-forms-multi-select-money-phone-typed-dates--"

test.describe("business inputs", () => {
  test("multi-select: search, toggle, select all, clear, with the count announced", async ({ page }) => {
    await open(page, `${BUSINESS}multi-select-story`)
    const trigger = page.getByRole("combobox", { name: /Regions|Paris/ })
    await trigger.click()
    await page.keyboard.type("tok")
    await page.keyboard.press("Enter")
    await expect(page.getByRole("status").filter({ hasText: "selected" })).toHaveText("5 selected")
    await page.getByPlaceholder("Search…").fill("")
    await page.getByRole("button", { name: "Select all" }).click()
    await expect(page.getByRole("status").filter({ hasText: "selected" })).toHaveText("6 selected")
    await page.getByRole("button", { name: "Clear" }).click()
    await page.keyboard.press("Escape")
    await expect(trigger).toHaveText(/Select…/)
  })

  test("money: typed the locale's way, rounded and formatted on blur", async ({ page }) => {
    await open(page, `${BUSINESS}money-input-story`)
    const budget = page.getByLabel("Monthly budget")
    await budget.fill("2500.567")
    await budget.blur()
    await expect(budget).toHaveValue("2,500.57")
    await expect(page.getByText("Value: 2500.57")).toBeVisible()
    await budget.fill("-40")
    await budget.blur()
    await expect(budget).toHaveValue("40.00")
  })

  test("money in French reads commas and spaces", async ({ page }) => {
    await open(page, `${BUSINESS}money-input-story`, "fr")
    const budget = page.getByLabel("Monthly budget")
    await budget.fill("1 234,5")
    await budget.blur()
    await expect(page.getByText("Value: 1234.5")).toBeVisible()
  })

  test("phone: national digits become E.164; a pasted international number picks its country", async ({ page }) => {
    await open(page, `${BUSINESS}phone-input-story`)
    const phone = page.getByLabel("Mobile")
    const sent = page.locator("#storybook-root p code")
    await phone.fill("07 98 76 54 32")
    await expect(sent).toHaveText("+33798765432")
    await phone.fill("+44 20 7946 0958")
    await expect(sent).toHaveText("+442079460958")
    await expect(page.getByRole("button", { name: /Country: United Kingdom/ })).toBeVisible()
    await page.getByRole("button", { name: /Country:/ }).click()
    await page.keyboard.type("belg")
    await page.keyboard.press("Enter")
    await expect(phone).toBeFocused()
    await expect(sent).toHaveText(/^\+32/)
  })

  test("typed date: read in the locale's order, impossible dates rejected", async ({ page }) => {
    await open(page, `${BUSINESS}typed-date`, "fr")
    const input = page.getByLabel("Due date")
    await expect(input).toHaveValue("03/11/2026")
    await input.fill("14.10.26")
    await input.blur()
    await expect(input).toHaveValue("14/10/2026")
    await expect(page.getByText("Wed Oct 14 2026")).toBeVisible()
    await input.fill("31/02/2026")
    await input.blur()
    await expect(input).toHaveAttribute("aria-invalid", "true")
    await expect(page.getByText("Saisissez une date au format jj/mm/aaaa.")).toBeVisible()
    await page.getByRole("button", { name: "Choisir dans un calendrier" }).click()
    await page.getByRole("button", { name: /20 octobre 2026/ }).click()
    await expect(input).toHaveValue("20/10/2026")
    await expect(input).not.toHaveAttribute("aria-invalid", "true")
  })

  test("the form validates every new field", async ({ page }) => {
    await open(page, `${BUSINESS}in-a-form`)
    await page.getByRole("button", { name: "Save plan" }).click()
    await expect(page.locator("[data-slot=field-error]")).toHaveText([
      "Pick at least one region.",
      "Enter a budget.",
      "Enter a complete phone number.",
      "Enter a start date.",
    ])
  })
})

test.describe("server-driven table", () => {
  test("sorting, search and paging go through the query", async ({ page }) => {
    await open(page, "components-tables--server-driven")
    const table = page.locator("[data-slot=data-table] table")
    await expect(page.getByText("137 rows")).toBeVisible()
    await expect(page.getByText("Page 1 of 14")).toBeVisible()
    await page.getByRole("button", { name: "Next page" }).click()
    await expect(page.getByText("Page 2 of 14")).toBeVisible()
    await page.getByRole("button", { name: "Sort by Duration" }).click()
    await expect(table).not.toHaveAttribute("aria-busy", "true")
    await expect(page.getByText("Page 1 of 14")).toBeVisible()
    // Numbers sort largest first on the first click (TanStack's default for numeric columns).
    const durations = (await table.locator("tbody tr td:nth-child(4)").allInnerTexts()).map((d) => parseInt(d, 10))
    expect(durations).toEqual([...durations].sort((x, y) => y - x))
    await page.getByPlaceholder("Search deployments…").fill("docs")
    await expect(page.getByText(/^2\d rows$/)).toBeVisible()
    await expect(table).not.toHaveAttribute("aria-busy", "true")
    for (const cell of await table.locator("tbody tr td:nth-child(2)").allInnerTexts()) expect(cell).toBe("docs")
  })
})

test.describe("virtual lists", () => {
  test("a virtual table keeps a few rows in the page, scrolls to the last, and still sorts and filters", async ({ page }) => {
    await open(page, "components-tables--virtual")
    const table = page.locator("[data-slot=data-table] table")
    await expect(table).toHaveAttribute("aria-rowcount", "5001")
    const rendered = table.locator("tbody tr[data-index]")
    expect(await rendered.count()).toBeLessThan(40)
    const region = page.getByRole("region", { name: "Deployments" })
    // The scrolling box takes keyboard focus, so End scrolls it.
    await region.focus()
    await page.keyboard.press("End")
    await expect(table.getByText("dpl_5000")).toBeVisible()
    await expect(rendered.last()).toHaveAttribute("aria-rowindex", "5001")
    await page.getByPlaceholder("Filter projects…").fill("docs")
    await expect(page.locator("[data-slot=data-table-count]")).toHaveText("625 rows")
    await page.getByRole("button", { name: "Sort by Deployment" }).click()
    await page.getByRole("button", { name: "Sort by Deployment" }).click()
    await region.evaluate((el) => (el.scrollTop = 0))
    await expect(rendered.first()).toContainText("dpl_4999")
  })

  test("a virtual list loads more near the end and says when it is done", async ({ page }) => {
    await open(page, "components-virtual-list--infinite-loading")
    const region = page.getByRole("region", { name: "Build log" })
    const last = page.locator("li[aria-posinset]").last()
    await expect(last).toHaveAttribute("aria-setsize", "-1")
    await expect
      .poll(
        async () => {
          await region.evaluate((el) => (el.scrollTop = el.scrollHeight))
          return Number(await last.getAttribute("aria-posinset"))
        },
        { timeout: 20_000, intervals: [400] }
      )
      .toBe(300)
    await expect(region.getByText("End of the list")).toBeVisible()
    await expect(last).toHaveAttribute("aria-setsize", "300")
  })
})

test.describe("workspace blocks", () => {
  test("notifications: count, unread filter, mark one and all as read", async ({ page }) => {
    await open(page, "blocks-workspace--notifications")
    await page.getByRole("button", { name: "Notifications, 3 unread" }).click()
    await expect(page.locator("[data-slot=notification]")).toHaveCount(4)
    await page.getByRole("radio", { name: /Unread/ }).click()
    await expect(page.locator("[data-slot=notification]")).toHaveCount(3)
    await page.getByRole("button", { name: "Mark as read" }).first().click()
    await expect(page.locator("[data-slot=notification]")).toHaveCount(2)
    await page.getByRole("button", { name: "Mark all as read" }).click()
    await expect(page.getByText("No unread notifications.")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("button", { name: "Notifications", exact: true })).toBeFocused()
  })

  test("team: invite validates emails, adds pending invites; removal asks first", async ({ page }) => {
    await open(page, "blocks-workspace--team")
    await page.getByRole("button", { name: "Invite", exact: true }).click()
    const dialog = page.getByRole("dialog")
    const emails = dialog.getByLabel("Email addresses")
    await emails.fill("linus.torvalds, ")
    await dialog.getByRole("button", { name: "Send invites" }).click()
    await expect(dialog.getByText("Not an email address: linus.torvalds.")).toBeVisible()
    await dialog.getByRole("button", { name: "Remove linus.torvalds" }).click()
    await emails.fill("margaret@acme.dev, ")
    await dialog.getByRole("button", { name: "Send invites" }).click()
    await expect(dialog).toBeHidden()
    await expect(page.getByText("margaret@acme.dev")).toBeVisible()
    await page.getByRole("button", { name: "Remove Alan Turing" }).click()
    await expect(page.getByRole("alertdialog", { name: "Remove Alan Turing?" })).toBeVisible()
    await page.getByRole("button", { name: "Remove", exact: true }).click()
    await expect(page.getByText("alan@coreloom.dev")).toBeHidden()
    // The signed-in member can't remove or demote themselves.
    await expect(page.getByRole("button", { name: "Remove Matthieu C." })).toHaveCount(0)
  })

  test("kanban: a card moves with the keyboard, and from its menu", async ({ page }) => {
    await open(page, "blocks-workspace--kanban")
    const column = (name: string) => page.locator("[data-slot=kanban-column]").filter({ has: page.getByRole("heading", { name }) })
    await page.getByRole("button", { name: "Move Spanish dictionary" }).focus()
    // dnd-kit measures the layout between key presses; a person is never faster than this.
    for (const key of ["Space", "ArrowRight", "Space"]) {
      await page.keyboard.press(key)
      await page.waitForTimeout(250)
    }
    await expect(column("In progress")).toContainText("Spanish dictionary")
    await expect(column("In progress")).toContainText("3 of 2")
    await page.getByRole("button", { name: "Actions for Kanban block" }).click()
    await page.getByRole("menuitem", { name: "Done" }).click()
    await expect(column("Done")).toContainText("Kanban block")
    await expect(page.getByRole("status").filter({ hasText: "Kanban block moved to Done." })).toHaveCount(1)
  })

  test("calendar: months move, a busy day expands, today is marked", async ({ page }) => {
    await open(page, "blocks-workspace--calendar")
    await expect(page.getByRole("heading", { name: "October 2026" })).toBeVisible()
    await expect(page.locator("[aria-current=date]")).toHaveText("14")
    await page.getByRole("button", { name: "1 more" }).click()
    await expect(page.getByRole("button", { name: /Incident review/ })).toBeVisible()
    await page.getByRole("button", { name: "Next month" }).click()
    await expect(page.getByRole("heading", { name: "November 2026" })).toBeVisible()
    await page.getByRole("button", { name: "Today" }).click()
    await expect(page.getByRole("heading", { name: "October 2026" })).toBeVisible()
  })
})

test.describe("rich text editor", () => {
  test("formats from the toolbar and shortcuts; the value is HTML", async ({ page }) => {
    await open(page, "components-forms-rich-text-editor--empty")
    const editor = page.getByRole("textbox", { name: "Comment" })
    await editor.click()
    await page.keyboard.type("## Plan")
    await page.keyboard.press("Enter")
    await page.getByRole("button", { name: "Bold" }).click()
    await page.keyboard.type("bold")
    await expect(page.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true")
    await expect(editor.locator("h2")).toHaveText("Plan")
    await expect(editor.locator("strong")).toHaveText("bold")
    await page.keyboard.press("ControlOrMeta+z")
    await expect(editor.locator("strong")).toHaveCount(0)
  })

  test("adds a link from the popover", async ({ page }) => {
    await open(page, "components-forms-rich-text-editor--empty")
    const editor = page.getByRole("textbox", { name: "Comment" })
    await editor.click()
    await page.keyboard.type("docs")
    await page.keyboard.press("Shift+Home")
    await page.getByRole("button", { name: "Link" }).click()
    await page.getByLabel("Link address").fill("eldenn.github.io/coreloom-ui")
    await page.getByRole("button", { name: "Apply" }).click()
    await expect(editor.locator("a")).toHaveAttribute("href", "https://eldenn.github.io/coreloom-ui")
  })

  test("in a form: required text, labelled for assistive tech", async ({ page }) => {
    await open(page, "components-forms-rich-text-editor--in-a-form")
    const editor = page.getByRole("textbox", { name: "Description" })
    await page.getByRole("button", { name: "Post" }).click()
    await expect(page.locator("[data-slot=field-error]")).toHaveText("Write at least 10 characters.")
    await expect(editor).toHaveAttribute("aria-invalid", "true")
    await editor.click()
    await page.keyboard.type("A real description.")
    await expect(page.locator("[data-slot=field-error]")).toHaveCount(0)
  })
})

test.describe("AI components", () => {
  test("the prompt sends on Enter, breaks lines on Shift + Enter, and turns Send into Stop", async ({ page }) => {
    await open(page, "components-ai-prompt-input--default")
    const box = page.getByRole("textbox", { name: "Message" })
    await expect(box).toHaveAccessibleDescription(/Enter to send/)
    await box.click()
    await page.keyboard.press("Enter")
    await expect(page.getByRole("list", { name: "Sent" }).getByRole("listitem")).toHaveCount(0)
    await page.keyboard.type("First line")
    await page.keyboard.press("Shift+Enter")
    await page.keyboard.type("second line")
    await expect(box).toHaveValue("First line\nsecond line")
    await page.keyboard.press("Enter")
    await expect(page.getByRole("list", { name: "Sent" })).toContainText("First line")
    await expect(box).toHaveValue("")
    const stop = page.getByRole("button", { name: "Stop" })
    await expect(stop).toBeVisible()
    await stop.click()
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible()
  })

  test("a tool waiting for approval runs only once allowed", async ({ page }) => {
    await open(page, "components-ai-tool-call--states")
    const card = page.locator('[data-slot="tool-call"]').filter({ hasText: "Roll back production" })
    await expect(card).toContainText("Needs your approval")
    await card.getByRole("button", { name: "Allow" }).click()
    await expect(card).toContainText("Done")
    await expect(card.getByRole("button", { name: "Allow" })).toHaveCount(0)
    // A finished tool opens to show what went in and out.
    const done = page.locator('[data-slot="tool-call"]').filter({ hasText: "searchDeployments" })
    const trigger = done.getByRole("button").first()
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
    await trigger.click()
    await expect(done).toContainText("dpl_8f2k")
  })

  test("reasoning folds and unfolds", async ({ page }) => {
    await open(page, "components-ai-reasoning--done")
    const done = page.getByRole("button", { name: "Thought for 6 s" })
    await expect(done).toHaveAttribute("aria-expanded", "false")
    await done.click()
    await expect(done).toHaveAttribute("aria-expanded", "true")
    await expect(page.getByText("a type error in settings.tsx")).toBeVisible()
  })

  test("a tool's output can be drawn as UI instead of JSON", async ({ page }) => {
    await open(page, "components-ai-tool-call--custom-output")
    const card = page.locator('[data-slot="tool-call"]')
    await expect(card.getByRole("listitem")).toHaveCount(3)
    await expect(card).not.toContainText('"branch"')
  })

  test("markdown drops raw HTML", async ({ page }) => {
    await open(page, "components-ai-markdown--untrusted-html")
    await expect(page.locator("#storybook-root img")).toHaveCount(0)
    await expect(page.locator("#storybook-root b")).toHaveCount(0)
  })
})

test.describe("AI blocks", () => {
  test("chat: the conversation is a log, and feedback is a pressed toggle", async ({ page }) => {
    await open(page, "blocks-ai-chat--conversation-story")
    await expect(page.getByRole("log", { name: "Conversation" })).toBeVisible()
    const bad = page.getByRole("button", { name: "Bad response" }).last()
    await bad.click()
    await expect(bad).toHaveAttribute("aria-pressed", "true")
    await expect(page.getByRole("button", { name: "Good response" }).last()).toHaveAttribute("aria-pressed", "false")
  })

  test("conversations: search, rename in place, delete after asking", async ({ page }) => {
    await open(page, "blocks-ai-chat--with-history")
    const search = page.getByRole("textbox", { name: "Search conversations" })
    await search.fill("incident")
    await expect(page.getByText("Incident 42 postmortem")).toBeVisible()
    await expect(page.getByText("Onboarding checklist")).toHaveCount(0)
    await search.fill("")

    await page.getByRole("button", { name: "Actions for Release notes for v0.8" }).click()
    await page.getByRole("menuitem", { name: "Rename" }).click()
    const title = page.getByRole("textbox", { name: "Conversation title" })
    await title.fill("Release notes for v0.9")
    await title.press("Enter")
    await expect(page.getByText("Release notes for v0.9")).toBeVisible()

    await page.getByRole("button", { name: "Actions for Onboarding checklist" }).click()
    await page.getByRole("menuitem", { name: "Delete" }).click()
    const dialog = page.getByRole("alertdialog", { name: "Delete this conversation?" })
    await dialog.getByRole("button", { name: "Delete" }).click()
    await expect(page.getByText("Onboarding checklist")).toHaveCount(0)
  })

  test("agent settings: required fields, variables, and sensitive tools ask first", async ({ page }) => {
    await open(page, "blocks-ai-workspace--agent-settings")
    const name = page.getByRole("textbox", { name: "Name" })
    await name.fill("")
    await name.blur()
    await expect(page.getByText("Give the agent a name.")).toBeVisible()
    await page.getByRole("textbox", { name: "Instructions" }).fill("Answer {{customer}} about {{plan}}.")
    await expect(page.getByText("customer", { exact: true }).or(page.getByText("{{customer}}", { exact: true })).first()).toBeVisible()

    await page.getByRole("checkbox", { name: /createTicket/ }).click()
    await expect(page.getByRole("switch", { name: "Ask first: createTicket" })).toBeChecked()
  })

  test("trace: the failed step is selected first; another one shows its details", async ({ page }) => {
    await open(page, "blocks-ai-workspace--trace")
    await expect(page.getByRole("button", { name: /rollback/, pressed: true })).toBeVisible()
    await expect(page.getByText("Rollback refused")).toBeVisible()
    await page.getByRole("button", { name: /searchDeployments/ }).click()
    await expect(page.getByRole("button", { name: /searchDeployments/, pressed: true })).toBeVisible()
    await expect(page.getByText("TS2339").first()).toBeVisible()
  })

  test("chat: while thinking, the reasoning is open and Send is Stop", async ({ page }) => {
    await open(page, "blocks-ai-chat--thinking")
    await expect(page.getByRole("button", { name: "Thinking…" })).toHaveAttribute("aria-expanded", "true")
    await expect(page.getByRole("button", { name: "Stop" })).toBeVisible()
  })

  test("chat: a tool result drawn as UI shows unfolded", async ({ page }) => {
    await open(page, "blocks-ai-chat--with-header-and-generative-ui")
    await expect(page.getByRole("log").getByRole("listitem")).toHaveCount(3)
  })

  test("empty lists say so", async ({ page }) => {
    await open(page, "blocks-ai-workspace--empty-states")
    await expect(page.getByText("No agents yet.")).toBeVisible()
    await expect(page.getByText("No documents yet.", { exact: false })).toBeVisible()
  })

  test("playground: Run all streams into every variant; variants come and go", async ({ page }) => {
    await open(page, "blocks-ai-workspace--playground-story")
    await page.getByRole("button", { name: "Add a variant" }).click()
    await expect(page.getByRole("button", { name: "Add a variant" })).toBeDisabled()
    await page.getByRole("button", { name: "Remove variant 3" }).click()
    await page.getByRole("button", { name: "Run all" }).click()
    // Both answers stream at once: allow for a busy machine.
    await expect(page.getByText("it is now called").first()).toBeVisible({ timeout: 15_000 })
  })

  test("knowledge: removing asks first; retrieval shows scored passages", async ({ page }) => {
    await open(page, "blocks-ai-workspace--knowledge")
    await page.getByRole("button", { name: "Actions for Scanned contract.pdf" }).click()
    await page.getByRole("menuitem", { name: "Remove" }).click()
    await page.getByRole("alertdialog").getByRole("button", { name: "Remove" }).click()
    await expect(page.getByRole("cell", { name: "Scanned contract.pdf" })).toHaveCount(0)

    await page.getByRole("textbox", { name: "Question" }).fill("How do I roll back?")
    await page.getByRole("button", { name: "Search" }).click()
    await expect(page.getByText("86%").or(page.getByText("86 %"))).toBeVisible()
  })
})
