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
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze()
  expect(violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`)).toEqual([])
}

test("signed-out visitors go to the sign-in page, then back where they were going", async ({ page }) => {
  await page.goto("/projects?status=ready")
  await expect(page).toHaveURL(/\/login\?redirect=/)
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
  await expect(page.getByRole("heading", { level: 1, name: "my-api" })).toBeVisible()
  await expect(page.locator("[data-slot=breadcrumb]")).toContainText("Projects")
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

// One test per screen and theme, so a slow machine never runs out of time on a long chain.
const SCREENS = ["/login", "/", "/projects", "/projects?new=true", "/settings", "/settings?section=notifications", "/does/not/exist", "project"]

for (const theme of ["dark", "light"] as const) {
  for (const screen of SCREENS) {
    test(`axe · ${screen} · ${theme}`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem("theme", t), theme)
      if (screen === "/does/not/exist") {
        // Unknown paths render the 404 page for everyone, signed in or not.
        await page.goto(screen)
      } else if (screen === "/login") {
        await page.goto("/login")
        await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible()
      } else if (screen === "project") {
        await signIn(page, "/projects")
        await page.locator("tbody a").first().click()
        await expect(page).toHaveURL(/\/projects\/prj_/)
        await expect(page.locator("tbody tr")).toHaveCount(6)
      } else {
        await signIn(page, screen)
      }
      if (screen !== "/login") await expect(page.locator("h1, [role=dialog]").first()).toBeVisible()
      await expectNoViolations(page)
    })
  }
}
