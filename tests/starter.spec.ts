// The starter app (starter/), built and served by `vite preview`: its flows work end to end and
// every screen passes axe. Skipped when starter/dist doesn't exist (CI builds it first).
import fs from "node:fs"
import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

import { STARTER_PORT } from "./starter-server"

test.skip(!fs.existsSync("starter/dist/index.html"), "Build the starter first: pnpm --dir starter build")
test.use({ baseURL: `http://127.0.0.1:${STARTER_PORT}` })

async function signIn(page: Page, to = "/") {
  await page.goto(to)
  await page.getByLabel("Email").fill("ada.lovelace@acme.dev")
  await page.getByLabel("Password").fill("long-enough")
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  await page.waitForURL((url) => !url.pathname.startsWith("/login"))
}

async function expectNoViolations(page: Page) {
  await page.waitForLoadState("networkidle")
  // A dialog fading in is half transparent: axe would measure contrast mid-animation.
  // (Looping animations — the code field's blinking caret, spinners — never finish: skip those.)
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== "running" || a.effect?.getTiming().iterations === Infinity)
  )
  // Animations start a frame after the DOM changes: check twice, a moment apart.
  await page.waitForTimeout(250)
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== "running" || a.effect?.getTiming().iterations === Infinity)
  )
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze()
  expect(violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`)).toEqual([])
}

test("signed-out visitors go to the sign-in page, then back where they were going", async ({ page }) => {
  await page.goto("/projects?status=ready")
  await expect(page).toHaveURL(/\/login\?redirect=/)
  await expect(page.getByRole("heading", { level: 1, name: "Sign in" })).toBeVisible()
  await page.getByLabel("Email").fill("ada@acme.dev")
  await page.getByLabel("Password").fill("short")
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  await expect(page.getByText("Wrong email or password.")).toBeVisible()
  await page.getByLabel("Password").fill("long-enough")
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  await expect(page).toHaveURL(/\/projects\?status=ready$/)
  await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible()
})

test("block links navigate without reloading the page", async ({ page }) => {
  await signIn(page)
  await page.evaluate(() => ((window as unknown as { marker: number }).marker = 1))
  await page.getByRole("link", { name: "Projects" }).first().click()
  await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible()
  await page.getByRole("link", { name: "Settings" }).first().click()
  await page.getByRole("link", { name: "Notifications" }).click()
  await expect(page).toHaveURL(/section=notifications/)
  expect(await page.evaluate(() => (window as unknown as { marker?: number }).marker)).toBe(1)
})

test("the project list keeps its filters in the URL", async ({ page }) => {
  await signIn(page, "/projects")
  await page.getByLabel("Search projects…").fill("core")
  await expect(page).toHaveURL(/q=core/)
  await page.getByRole("button", { name: "Filter by Status" }).click()
  await page.getByRole("option", { name: /Ready/ }).click()
  await page.keyboard.press("Escape")
  await expect(page).toHaveURL(/status=ready/)
  await page.reload()
  await expect(page.getByLabel("Search projects…")).toHaveValue("core")
  await expect(page.locator("tbody tr")).toHaveCount(2)
})

test("creating a project: validation, an API error on its field, then the new page", async ({ page }) => {
  await signIn(page, "/projects")
  await page.getByRole("button", { name: "New project" }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByRole("button", { name: "Create project" }).click()
  await expect(dialog.locator("[data-slot=field-error]")).toHaveText(["Enter a project name.", "Choose a framework."])
  await dialog.getByLabel("Name").fill("docs")
  await dialog.getByRole("combobox", { name: "Framework" }).click()
  await page.getByRole("option", { name: "AdonisJS" }).click()
  await dialog.getByRole("button", { name: "Create project" }).click()
  await expect(dialog.getByText("A project already uses this name.")).toBeVisible()
  await dialog.getByLabel("Name").fill("my-api")
  await dialog.getByRole("button", { name: "Create project" }).click()
  // Saving, navigating and loading the new page: allow for a busy CI machine.
  await expect(page.getByRole("heading", { level: 1, name: "my-api" })).toBeVisible({ timeout: 10_000 })
  await expect(page.locator("[data-slot=breadcrumb]")).toContainText("Projects")
})

test("deployments: the API pages, sorts and searches; the URL keeps the query", async ({ page }) => {
  await signIn(page, "/deployments")
  const table = page.locator("[data-slot=data-table] table")
  await expect(page.getByText("84 rows")).toBeVisible()
  await page.getByRole("button", { name: "Next page" }).click()
  await expect(page).toHaveURL(/page=2/)
  await page.getByRole("button", { name: "Sort by Build" }).click()
  await expect(page).toHaveURL(/sort=duration/)
  await expect(page).not.toHaveURL(/page=/)
  // The sorted page arrives after the URL changes: poll until the rows are in order.
  await expect
    .poll(async () => {
      const durations = (await table.locator("tbody tr td:nth-child(5)").allInnerTexts()).map((d) => parseInt(d, 10))
      return durations.length > 1 && durations.every((d, i) => i === 0 || durations[i - 1] >= d)
    })
    .toBe(true)
  await page.getByPlaceholder("Search by project, commit or branch…").fill("docs")
  await expect(page).toHaveURL(/q=docs/)
  await expect(page.getByText("6 rows")).toBeVisible()
  await page.reload()
  await expect(page.getByPlaceholder("Search by project, commit or branch…")).toHaveValue("docs")
  await expect(table.locator("tbody tr")).toHaveCount(6)
})

test("notifications: unread count, a link marks it read and goes there", async ({ page }) => {
  await signIn(page)
  await page.getByRole("button", { name: "Notifications, 3 unread" }).click()
  await page.getByRole("link", { name: /coreloom-api build failed/ }).click()
  await expect(page).toHaveURL(/\/deployments\?q=coreloom-api/)
  await expect(page.getByRole("button", { name: "Notifications, 2 unread" })).toBeVisible()
})

test("members: invite through the API, already-invited addresses refused", async ({ page }) => {
  await signIn(page, "/settings?section=members")
  await expect(page.getByRole("main").getByText("Ada Lovelace", { exact: true })).toBeVisible({ timeout: 10_000 })
  await page.getByRole("button", { name: "Invite", exact: true }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByLabel("Email addresses").fill("linus@acme.dev, ")
  await dialog.getByRole("button", { name: "Send invites" }).click()
  await expect(page.getByText("Already in the workspace: linus@acme.dev")).toBeVisible()
  await dialog.getByRole("button", { name: "Remove linus@acme.dev" }).click()
  await dialog.getByLabel("Email addresses").fill("margaret@acme.dev, ")
  await dialog.getByRole("button", { name: "Send invites" }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByText("margaret@acme.dev")).toBeVisible()
})

test("signing up: a taken email is refused, then the emailed code signs you in", async ({ page }) => {
  await page.goto("/login")
  await page.getByRole("link", { name: "Create one" }).click()
  await expect(page.getByRole("heading", { level: 1, name: "Create your account" })).toBeVisible()
  await page.getByLabel("Name").fill("Grace Hopper")
  await page.getByLabel("Work email").fill("taken@acme.dev")
  await page.getByLabel("Password").fill("long-enough")
  await page.getByRole("button", { name: "Create account" }).click()
  await expect(page.getByText("An account already uses this email.", { exact: false })).toBeVisible()
  await page.getByLabel("Work email").fill("grace@acme.dev")
  await page.getByRole("button", { name: "Create account" }).click()
  await expect(page).toHaveURL(/\/verify$/)
  await expect(page.getByText("g•••@acme.dev")).toBeVisible()
  await page.keyboard.type("000000")
  await expect(page.getByText("That code isn’t right.", { exact: false })).toBeVisible()
  // The digits stay in the field: clear them and type the right code (it submits on the last digit).
  await page.getByLabel("Verification code").focus()
  for (let i = 0; i < 6; i++) await page.keyboard.press("Backspace")
  await page.keyboard.type("424242")
  await expect(page.getByRole("heading", { level: 1, name: "Overview" })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText("grace@acme.dev")).toBeVisible()
})

test("forgot password: the confirmation takes focus; the link resets it; an expired link says so", async ({ page }) => {
  await page.goto("/login")
  await page.getByRole("link", { name: "Forgot password?" }).click()
  // Wait for the page to be the reset page before typing (the link navigates client-side).
  await expect(page.getByRole("heading", { level: 1, name: "Reset your password" })).toBeVisible()
  await page.getByLabel("Email").fill("ada@acme.dev")
  await expect(page.getByLabel("Email")).toHaveValue("ada@acme.dev")
  await page.getByRole("button", { name: "Send reset link" }).click()
  // The demo request takes 600 ms; allow for a busy CI machine.
  await expect(page.getByRole("heading", { level: 1, name: "Check your inbox" })).toBeFocused({ timeout: 10_000 })
  await page.getByRole("link", { name: "Open the link from the email" }).click()
  await expect(page).toHaveURL(/\/reset-password\?token=demo/)
  await page.getByLabel("New password").fill("a-new-password")
  await page.getByLabel("Confirm the password").fill("a-new-passwor")
  await page.getByLabel("Confirm the password").blur()
  await expect(page.getByText("The two passwords don’t match.")).toBeVisible()
  await page.getByLabel("Confirm the password").fill("a-new-password")
  await page.getByRole("button", { name: "Save password" }).click()
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByText("Password changed.", { exact: false })).toBeVisible()

  await page.goto("/reset-password?token=expired")
  await page.getByLabel("New password").fill("a-new-password")
  await page.getByLabel("Confirm the password").fill("a-new-password")
  await page.getByRole("button", { name: "Save password" }).click()
  await expect(page.getByText("This link has expired.", { exact: false })).toBeVisible()
  await page.getByRole("link", { name: "Ask for a new link" }).click()
  await expect(page).toHaveURL(/\/forgot-password$/)
})

test("appearance: theme and accent apply at once and survive a reload", async ({ page }) => {
  await signIn(page, "/settings?section=appearance")
  await page.getByRole("radio", { name: "Light" }).click()
  const accents = page.getByRole("radiogroup", { name: "Accent colour" })
  await accents.getByRole("radio", { name: "Cyan" }).click()
  await expect(accents.getByRole("radio", { name: "Cyan" })).toBeFocused()
  // Arrow keys move through the swatches, like any radio group.
  await page.keyboard.press("ArrowRight")
  await expect(accents.getByRole("radio", { name: "Blue" })).toBeFocused()
  await page.keyboard.press("ArrowRight")
  await expect(accents.getByRole("radio", { name: "Violet" })).toBeFocused()
  await expect(accents.getByRole("radio", { name: "Violet" })).toBeChecked()
  expect(await page.evaluate(() => [document.documentElement.dataset.theme, document.documentElement.dataset.accent])).toEqual(["light", "violet"])
  await page.reload()
  await expect(page.getByRole("radio", { name: "Violet" })).toBeChecked()
  expect(await page.evaluate(() => [document.documentElement.dataset.theme, document.documentElement.dataset.accent])).toEqual(["light", "violet"])
  await page.getByRole("radio", { name: "Cyan" }).click()
  expect(await page.evaluate(() => document.documentElement.dataset.accent)).toBeUndefined()
})

test("project notes: the editor loads with the project page only, and saves", async ({ page }) => {
  const scripts: string[] = []
  page.on("request", (request) => {
    if (request.resourceType() === "script") scripts.push(request.url())
  })
  await signIn(page, "/projects")
  expect(scripts.some((url) => url.includes("project-notes"))).toBe(false)
  await page.locator("tbody a").first().click()
  const editor = page.getByRole("textbox", { name: "Notes" })
  await expect(editor).toBeVisible({ timeout: 10_000 })
  expect(scripts.some((url) => url.includes("project-notes"))).toBe(true)
  await editor.click()
  await page.keyboard.type("Owned by the platform team.")
  await page.getByRole("button", { name: "Save notes" }).click()
  await expect(page.getByText("Notes saved")).toBeVisible()
  // Back and forth: the saved notes come from the query cache.
  await page.getByRole("link", { name: "All projects" }).click()
  await page.goBack()
  await expect(page.getByRole("textbox", { name: "Notes" })).toContainText("Owned by the platform team.")
})

test("unknown pages and projects show the 404 page", async ({ page }) => {
  await signIn(page, "/projects/nope")
  await expect(page.getByRole("heading", { level: 1, name: "Project not found" })).toBeVisible()
  await page.goto("/does/not/exist")
  await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible()
})

test("language and theme are remembered", async ({ page }) => {
  await signIn(page)
  await page.getByRole("button", { name: "Language" }).click()
  await page.getByRole("menuitemradio", { name: "Français" }).click()
  await page.getByRole("button", { name: "Thème" }).click()
  await page.getByRole("menuitemradio", { name: "Clair" }).click()
  await page.reload()
  await expect(page.getByRole("heading", { level: 1, name: "Vue d’ensemble" }).or(page.getByRole("heading", { level: 1, name: "Vue d'ensemble" }))).toBeVisible()
  expect(await page.evaluate(() => [document.documentElement.lang, document.documentElement.dataset.theme])).toEqual(["fr", "light"])
})

test("signing out protects the app again", async ({ page }) => {
  await signIn(page)
  await page.locator("[data-sidebar=footer] button").first().click()
  await page.getByRole("menuitem", { name: "Log out" }).click()
  await expect(page).toHaveURL(/\/login/)
  await page.goto("/settings")
  await expect(page).toHaveURL(/\/login\?redirect=/)
})

test("assistant: an answer streams in with its tool call; the conversation joins the list", async ({ page }) => {
  await signIn(page, "/assistant")
  await expect(page.getByRole("heading", { name: "How can I help?" })).toBeVisible()
  const box = page.getByRole("textbox", { name: "Message" })
  await box.fill("Why did the last deployment fail?")
  await box.press("Enter")
  const log = page.getByRole("log", { name: "Conversation" })
  await expect(page.getByRole("button", { name: "Stop" })).toBeVisible()
  await expect(log.getByText("Rename the property")).toBeVisible({ timeout: 10_000 })
  await expect(log.getByText("searchDocs")).toBeVisible()
  await expect(page).toHaveURL(/\/assistant\?c=c/)
  await expect(page.getByRole("navigation", { name: "Conversations" }).getByText("Why did the last deployment fail?")).toBeVisible()

  // A sensitive tool waits for approval, then the answer resumes.
  await box.fill("Roll back coreloom-api")
  await box.press("Enter")
  await expect(log.getByText("Needs your approval")).toBeVisible({ timeout: 10_000 })
  await log.getByRole("button", { name: "Allow" }).click()
  await expect(log.getByText("is back on")).toBeVisible({ timeout: 10_000 })
})

test("agents: a new agent opens its settings; saving and a run's trace", async ({ page }) => {
  await signIn(page, "/agents")
  await page.getByRole("button", { name: "New agent" }).click()
  await expect(page).toHaveURL(/\/agents\/agt_/)
  await expect(page.getByRole("heading", { level: 1, name: "New agent" })).toBeVisible()
  await page.getByRole("button", { name: "Save agent" }).click()
  await expect(page.getByText("Write the agent's instructions.").first()).toBeVisible()
  await page.getByRole("textbox", { name: "Instructions" }).fill("Answer questions about {{project}}.")
  await page.getByRole("button", { name: "Save agent" }).click()
  await expect(page.getByText("Agent saved")).toBeVisible()

  await page.goto("/agents/agt_deploy")
  await page.locator("tbody a").first().click()
  await expect(page).toHaveURL(/\/runs\/run_/)
  await expect(page.getByRole("heading", { level: 1, name: /^Run run_/ })).toBeVisible()
})

test("knowledge: an upload is indexed in the background; retrieval finds passages", async ({ page }) => {
  await signIn(page, "/knowledge")
  await page.locator('input[type="file"]').setInputFiles({ name: "Rollbacks FAQ.md", mimeType: "text/markdown", buffer: Buffer.from("# FAQ\n".repeat(400)) })
  const row = page.getByRole("row", { name: /Rollbacks FAQ\.md/ })
  await expect(row).toContainText(/Queued|Processing/)
  await expect(row).toContainText("Indexed", { timeout: 15_000 })
  await page.getByRole("textbox", { name: "Question" }).fill("When should I roll back production?")
  await page.getByRole("button", { name: "Search", exact: true }).click()
  await expect(page.getByText(/^\d passages?$/)).toBeVisible()
})

test("playground: every variant streams an answer with its metrics", async ({ page }) => {
  await signIn(page, "/playground")
  await page.getByRole("button", { name: "Run all" }).click()
  await expect(page.getByText("Latency").first()).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText("Rename the property")).toHaveCount(2, { timeout: 15_000 })
})

test("Ask AI in the palette opens the assistant with the question answered", async ({ page }) => {
  await signIn(page, "/")
  await page.getByRole("button", { name: /Search or jump to/ }).click()
  await page.keyboard.type("why did the build fail")
  await page.getByRole("option", { name: "Ask AI: “why did the build fail”" }).click()
  await expect(page).toHaveURL(/\/assistant/)
  const log = page.getByRole("log", { name: "Conversation" })
  await expect(log.getByText("why did the build fail", { exact: true })).toBeVisible()
  await expect(log.getByText("Rename the property")).toBeVisible({ timeout: 10_000 })
  // The answer cites its source inline, and the composer shows the model and the context used.
  await expect(log.getByRole("button", { name: /Source 1/ }).first()).toBeVisible()
  await expect(page.getByRole("combobox", { name: /Model: Claude Sonnet/ })).toBeVisible()
  await expect(page.getByRole("meter")).toBeVisible()
})

test("project notes: AI rewrites the selection with ⌘J", async ({ page }) => {
  await signIn(page, "/projects")
  await page.locator("tbody a").first().click()
  const editor = page.getByRole("textbox", { name: "Notes" })
  await expect(editor).toBeVisible({ timeout: 10_000 })
  await editor.click()
  await page.keyboard.type("Owned by the platform team. Deploys on Mondays.")
  await page.keyboard.press("ControlOrMeta+a")
  await page.keyboard.press("ControlOrMeta+j")
  await page.getByRole("button", { name: "Make shorter" }).click()
  await page.getByRole("button", { name: "Replace selection" }).click()
  await expect(editor).toHaveText("Owned by the platform team.")
})

// One test per screen and theme, so a slow machine never runs out of time on a long chain.
const SIGNED_OUT = ["/login", "/signup", "/forgot-password", "/reset-password?token=demo"]
const SCREENS = [...SIGNED_OUT, "verify", "/", "/projects", "/deployments", "/projects?new=true", "/settings", "/settings?section=appearance", "/settings?section=members", "/settings?section=billing", "/settings?section=notifications", "/does/not/exist", "project", "/assistant?c=c1", "/agents", "/agents/agt_deploy", "/runs", "/runs/run_1ycy", "/playground", "/knowledge"]

for (const theme of ["dark", "light"] as const) {
  for (const screen of SCREENS) {
    test(`axe · ${screen} · ${theme}`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem("theme", t), theme)
      if (screen === "/does/not/exist") {
        // Unknown paths render the 404 page for everyone, signed in or not.
        await page.goto(screen)
      } else if (SIGNED_OUT.includes(screen)) {
        await page.goto(screen)
        await expect(page.locator("h1")).toBeVisible()
      } else if (screen === "verify") {
        await page.goto("/signup")
        await page.getByLabel("Name").fill("Grace Hopper")
        await page.getByLabel("Work email").fill("grace@acme.dev")
        await page.getByLabel("Password").fill("long-enough")
        await page.getByRole("button", { name: "Create account" }).click()
        await expect(page.getByRole("heading", { level: 1, name: "Check your inbox" })).toBeVisible()
      } else if (screen === "project") {
        await signIn(page, "/projects")
        await page.locator("tbody a").first().click()
        await expect(page).toHaveURL(/\/projects\/prj_/)
        await expect(page.locator("tbody tr")).toHaveCount(6)
        await expect(page.getByRole("textbox", { name: "Notes" })).toBeVisible({ timeout: 10_000 })
      } else {
        await signIn(page, screen)
      }
      await expect(page.locator("h1, [role=dialog]").first()).toBeVisible()
      await expectNoViolations(page)
    })
  }
}
