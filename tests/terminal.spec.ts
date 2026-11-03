// Terminal, log viewer, terminal console and pipeline run: what people do and get.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

const output = (page: Page) => page.getByRole('log').first()

test('terminal: run a command, see its output, recall it with ↑', async ({ page }) => {
  await open(page, 'components-developer-terminal--default')
  const input = page.getByRole('textbox', { name: 'Command' })
  await input.click()
  await input.fill('echo hello there')
  await input.press('Enter')
  await expect(output(page)).toContainText('echo hello there')
  await expect(output(page).getByText('hello there', { exact: true })).toBeVisible()
  await expect(input).toHaveValue('')
  await expect(input).toBeFocused()
  await input.press('ArrowUp')
  await expect(input).toHaveValue('echo hello there')
  await input.press('ArrowDown')
  await expect(input).toHaveValue('')
})

test('terminal: an unknown command prints an error', async ({ page }) => {
  await open(page, 'components-developer-terminal--default')
  const input = page.getByRole('textbox', { name: 'Command' })
  await input.fill('nope')
  await input.press('Enter')
  await expect(output(page)).toContainText('nope: command not found')
})

test('terminal: Tab completes a command, then lists the choices', async ({ page }) => {
  await open(page, 'components-developer-terminal--default')
  const input = page.getByRole('textbox', { name: 'Command' })
  await input.fill('dep')
  await input.press('Tab')
  await expect(input).toHaveValue('deploy ')
  await input.fill('pnpm ')
  await input.press('Tab')
  await expect(output(page)).toContainText('build  test')
  await expect(input).toBeFocused()
  // After Escape, Tab leaves the terminal.
  await input.press('Escape')
  await input.press('Tab')
  await expect(input).not.toBeFocused()
})

test('terminal: Ctrl+C stops a running command', async ({ page }) => {
  await open(page, 'components-developer-terminal--default')
  const input = page.getByRole('textbox', { name: 'Command' })
  await input.fill('sleep 30')
  await input.press('Enter')
  await expect(page.getByRole('button', { name: 'Stop (Ctrl+C)' })).toBeVisible()
  // The input keeps focus while the command runs, so Ctrl+C reaches it.
  await expect(input).toBeFocused()
  await input.press('Control+c')
  await expect(output(page)).toContainText('^C')
  await expect(page.getByRole('textbox', { name: 'Command' })).toBeVisible()
})

test('terminal: a command asks a question and gets the answer', async ({ page }) => {
  await open(page, 'components-developer-terminal--question')
  const answer = page.getByRole('textbox', { name: /Deploy orbit to production/ })
  await expect(answer).toBeVisible()
  await answer.fill('n')
  await answer.press('Enter')
  await expect(output(page)).toContainText('Cancelled.')
  await expect(page.getByRole('textbox', { name: 'Command' })).toBeVisible()
})

test('terminal: a password question hides what is typed', async ({ page }) => {
  await open(page, 'components-developer-terminal--default')
  const input = page.getByRole('textbox', { name: 'Command' })
  await input.fill('login')
  await input.press('Enter')
  const password = page.getByLabel('Password:')
  await expect(password).toHaveAttribute('type', 'password')
  await password.fill('hunter2')
  await password.press('Enter')
  await expect(output(page)).toContainText('Signed in as matthieu')
  await expect(output(page)).not.toContainText('hunter2')
})

test('terminal: a session gets the line and prints what the process answers', async ({ page }) => {
  await open(page, 'components-developer-terminal--session')
  const input = page.getByRole('textbox', { name: 'Command' })
  await input.fill('uptime')
  await input.press('Enter')
  await expect(output(page)).toContainText('you typed: uptime')
})

test('terminal: Clear empties the output', async ({ page }) => {
  await open(page, 'components-developer-terminal--default')
  await expect(output(page)).toContainText('git status')
  await page.getByRole('button', { name: 'Clear' }).click()
  await expect(output(page)).toHaveText('')
  await expect(page.getByRole('textbox', { name: 'Command' })).toBeFocused()
})

test('terminal: words follow the locale', async ({ page }) => {
  await open(page, 'components-developer-terminal--french', 'fr')
  await expect(page.getByRole('textbox', { name: 'Commande' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Effacer' })).toBeVisible()
})

test('log viewer: search filters the lines and says how many are shown', async ({ page }) => {
  await open(page, 'components-developer-log-viewer--default')
  const log = page.getByRole('region', { name: 'Log' })
  await page.getByRole('searchbox', { name: 'Search the log' }).fill('export worker')
  await expect(page.getByRole('status').filter({ hasText: 'lines shown' })).toHaveText(
    '5 of 240 lines shown',
  )
  await expect(log.getByRole('listitem')).toHaveCount(5)
  await expect(log.locator('mark').first()).toHaveText('export')
})

test('log viewer: level buttons hide and show a level', async ({ page }) => {
  await open(page, 'components-developer-log-viewer--default')
  const levels = page.getByRole('group', { name: 'Levels shown' })
  const info = levels.getByRole('button', { name: /Info/ })
  await expect(info).toHaveAttribute('aria-pressed', 'true')
  await info.click()
  await levels.getByRole('button', { name: /Debug/ }).click()
  await expect(info).toHaveAttribute('aria-pressed', 'false')
  const log = page.getByRole('region', { name: 'Log' })
  await expect(log.locator('li[data-level=info], li[data-level=debug]')).toHaveCount(0)
  await expect(log.locator('li[data-level=error]').first()).toBeAttached()
})

test('log viewer: raw text gets its levels, and nothing matches says so', async ({ page }) => {
  await open(page, 'components-developer-log-viewer--from-text')
  const log = page.getByRole('region', { name: 'Log' })
  await expect(log.locator('li[data-level=error]')).toHaveCount(1)
  await expect(log.locator('li[data-level=warn]')).toHaveCount(1)
  await page.getByRole('searchbox', { name: 'Search the log' }).fill('zzz')
  await expect(log).toContainText('No line matches.')
})

test('terminal console: new terminal, switch tabs, output survives, close', async ({ page }) => {
  await open(page, 'blocks-developer-terminal-console--default')
  const tabs = page.getByRole('tablist', { name: 'Open terminals' })
  await expect(tabs.getByRole('tab')).toHaveCount(2)
  const input = page.getByRole('textbox', { name: 'Command' })
  await input.fill('echo kept')
  await input.press('Enter')
  await expect(output(page)).toContainText('kept')

  await page.getByRole('button', { name: 'New terminal' }).click()
  await page.getByRole('menuitem', { name: 'node' }).click()
  await expect(tabs.getByRole('tab', { name: 'node' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('textbox', { name: 'Command' })).toBeFocused()

  // Arrows move between tabs; the first terminal still has its output.
  await tabs.getByRole('tab', { name: 'node' }).focus()
  await page.keyboard.press('Home')
  await expect(tabs.getByRole('tab', { name: 'zsh' })).toBeFocused()
  await expect(output(page)).toContainText('kept')

  await page.getByRole('button', { name: 'Close zsh' }).click()
  await expect(tabs.getByRole('tab')).toHaveCount(2)
  await expect(tabs.getByRole('tab', { name: 'zsh' })).toHaveCount(0)
})

test('terminal console: split shows two terminals, closing all shows the empty state', async ({
  page,
}) => {
  await open(page, 'blocks-developer-terminal-console--default')
  await page.getByRole('button', { name: 'Split' }).click()
  await expect(page.getByRole('textbox', { name: 'Command' })).toHaveCount(2)
  await page.getByRole('button', { name: 'Close pnpm dev' }).click()
  await page.getByRole('button', { name: 'Close zsh' }).click()
  await expect(page.getByText('No terminal open')).toBeVisible()
  await expect(page.getByRole('button', { name: 'New terminal' }).first()).toBeFocused()
})

test('pipeline run: opens on the failed step, other jobs and steps on demand', async ({ page }) => {
  await open(page, 'blocks-developer-pipeline-run--failed')
  const jobs = page.getByRole('navigation', { name: 'Jobs' })
  await expect(jobs.getByRole('button', { name: /Build/ })).toHaveAttribute('aria-current', 'true')
  await expect(page.getByRole('region', { name: 'Log of pnpm build' })).toContainText('TS2322')
  // Statuses are words, not only colours.
  await expect(jobs.getByRole('button', { name: /Build/ })).toContainText('Failed')

  await jobs.getByRole('button', { name: /Test/ }).click()
  const step = page.getByRole('button', { name: /pnpm test/ })
  await expect(step).toHaveAttribute('aria-expanded', 'false')
  await step.click()
  await expect(page.getByRole('region', { name: 'Log of pnpm test' })).toContainText('2 passed')
  await expect(page.getByRole('button', { name: 'Re-run', exact: true })).toBeVisible()
})

test('pipeline run: a running deploy offers Cancel', async ({ page }) => {
  await open(page, 'blocks-developer-pipeline-run--running')
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Re-run', exact: true })).toHaveCount(0)
  await expect(page.getByRole('region', { name: 'Log of Run migrations' })).toBeVisible()
})

test('ide: Run opens the terminal panel and runs the build there', async ({ page }) => {
  await open(page, 'blocks-developer-ide--with-terminal')
  await page.getByRole('button', { name: 'Hide the panel', exact: true }).click()
  await page.getByRole('button', { name: /^Run/ }).click()
  await expect(output(page)).toContainText('built in 1.24s', { timeout: 10_000 })
  await expect(page.getByRole('textbox', { name: 'Command' })).toBeVisible()
})
