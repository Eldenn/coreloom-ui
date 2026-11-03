// Gantt, status page, developer and security settings, integrations and the prompt manager: what
// people do and get.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test('gantt: arrow keys move a bar, Shift moves its end, and the change is announced', async ({
  page,
}) => {
  await open(page, 'blocks-gantt--roadmap')
  const bar = page.getByRole('button', { name: /^Write the spec, Oct 5, 2026 to Oct 16, 2026/ })
  await expect(bar).toHaveAccessibleName(/70% done, after User research$/)
  await bar.focus()
  await page.keyboard.press('ArrowRight')
  const moved = page.getByRole('button', { name: /^Write the spec, Oct 6, 2026 to Oct 17, 2026/ })
  await expect(moved).toBeFocused()
  await page.keyboard.press('Shift+ArrowLeft')
  await expect(
    page.getByRole('button', { name: /^Write the spec, Oct 6, 2026 to Oct 16, 2026/ }),
  ).toBeFocused()
  await expect(page.locator('[data-slot=gantt] [aria-live=polite]')).toHaveText(
    'Write the spec, Oct 6, 2026 to Oct 16, 2026',
  )
  await page.getByRole('button', { name: /^Kick-off, milestone on Oct 19, 2026/ }).click()
  await expect(page.getByRole('button', { name: /^Kick-off/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('gantt: the zoom changes the scale; a late dependency is drawn in red', async ({ page }) => {
  await open(page, 'blocks-gantt--late-dependency')
  await expect(page.locator('[data-slot=gantt] path[data-late]')).toHaveCount(1)
  await page.getByRole('radio', { name: 'Month' }).check()
  await expect(page.locator('[data-slot=gantt]')).toContainText('Nov')
  await page.getByRole('radio', { name: 'Day' }).check()
  await expect(page.getByRole('radio', { name: 'Day' })).toBeChecked()
})

test('status page: the uptime slider reads each day; past incidents open', async ({ page }) => {
  await open(page, 'blocks-status-page--default')
  await expect(page.locator('[data-slot=status-overall]')).toHaveText(
    /Some systems are slower than usual/,
  )
  const api = page.getByRole('slider', { name: /^API: 99\.96% uptime over 90 days/ })
  await api.focus()
  await expect(api).toHaveAttribute('aria-valuetext', /^Oct 14, 2026: 99\.40% uptime\. 1 incident/)
  await page.keyboard.press('ArrowLeft')
  await expect(api).toHaveAttribute('aria-valuetext', 'Oct 13, 2026: 100.00% uptime')
  await page.keyboard.press('Home')
  await expect(api).toHaveAttribute('aria-valuenow', '1')

  const toggle = page.getByRole('button', { name: '3 updates' })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await toggle.click()
  await expect(
    page.getByRole('list', { name: 'Updates on Errors on deploy webhooks' }).getByRole('listitem'),
  ).toHaveCount(3)
})

test('API keys: create shows the secret once, revoke asks first', async ({ page }) => {
  await open(page, 'blocks-developer-settings--api-keys-list')
  await page.getByRole('button', { name: 'Create key' }).click()
  const dialog = page.getByRole('dialog', { name: 'Create an API key' })
  await dialog.getByRole('button', { name: 'Create key' }).click()
  await expect(dialog.getByText('Give the key a name.')).toBeVisible()
  await dialog.getByRole('textbox', { name: 'Name' }).fill('Staging worker')
  await dialog.getByRole('button', { name: 'Create key' }).click()
  const created = page.getByRole('dialog', { name: 'Your new API key' })
  await expect(created.locator('[data-slot=secret-value] code')).toHaveText(/^cl_live_demo/)
  await expect(created.getByRole('button', { name: 'Copy the API key' })).toBeVisible()
  await created.getByRole('button', { name: 'Done' }).click()
  await expect(page.locator('[data-slot=api-key]').first()).toContainText('Staging worker')

  await page.getByRole('button', { name: 'Revoke GitHub Actions' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Revoke key' }).click()
  await expect(page.locator('[data-slot=api-key]')).toHaveCount(3)
  await expect(page.getByText('GitHub Actions')).toHaveCount(0)
})

test('webhooks: https only, failed filter, redeliver, details toggle', async ({ page }) => {
  await open(page, 'blocks-developer-settings--webhooks-list')
  const deliveries = page.getByRole('list', {
    name: 'Deliveries to https://hooks.acme.dev/coreloom/deploys',
  })
  await expect(deliveries.getByRole('listitem')).toHaveCount(3)
  await page.getByRole('radio', { name: 'Failed' }).check()
  await expect(deliveries.getByRole('listitem')).toHaveCount(1)
  await deliveries.getByRole('button', { name: /500/ }).click()
  await expect(deliveries.getByText('Internal Server Error')).toBeVisible()
  await deliveries.getByRole('button', { name: 'Redeliver deployment.failed' }).click()
  await expect(page.getByText('deployment.failed redelivered')).toBeVisible()

  await page.getByRole('button', { name: 'Add endpoint' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add a webhook endpoint' })
  await dialog.getByRole('textbox', { name: 'Endpoint URL' }).fill('http://example.com/hook')
  await dialog.getByRole('button', { name: 'Add endpoint' }).click()
  await expect(dialog.getByText('Enter an https:// URL.')).toBeVisible()
  await page.keyboard.press('Escape')

  const details = page.getByRole('button', { name: /^Details and deliveries of https:\/\/hooks/ })
  await expect(details).toHaveAttribute('aria-expanded', 'true')
  await details.click()
  await expect(details).toHaveAttribute('aria-expanded', 'false')
  await expect(deliveries).toHaveCount(0)
})

test('two-step sign-in: a wrong code says so, the right one shows recovery codes', async ({
  page,
}) => {
  await open(page, 'blocks-security--two-factor-off')
  await page.getByRole('button', { name: 'Set up' }).click()
  const dialog = page.getByRole('dialog', { name: 'Set up two-step sign-in' })
  await expect(dialog.getByRole('img', { name: 'QR code' })).toBeVisible()
  const code = dialog.getByRole('textbox', { name: 'Code from the app' })
  await code.pressSequentially('000000')
  await expect(dialog.getByText('That code didn’t work.', { exact: false })).toBeVisible()
  await code.pressSequentially('482913')
  const codes = page.getByRole('dialog', { name: 'Save your recovery codes' })
  await expect(
    codes.getByRole('list', { name: 'Recovery codes' }).getByRole('listitem'),
  ).toHaveCount(6)
  await codes.getByRole('button', { name: 'I’ve saved them' }).click()
  await expect(page.getByText('On', { exact: true })).toBeVisible()
})

test('sessions: sign out of one, then everywhere else', async ({ page }) => {
  await open(page, 'blocks-security--sessions')
  await expect(page.locator('[data-slot=session]')).toHaveCount(3)
  await page.getByRole('button', { name: 'Sign out of Safari on iPhone' }).click()
  await expect(page.locator('[data-slot=session]')).toHaveCount(2)
  await page.getByRole('button', { name: 'Sign out everywhere else' }).click()
  await page
    .getByRole('alertdialog', { name: 'Sign out of 1 other session?' })
    .getByRole('button', { name: 'Sign out' })
    .click()
  await expect(page.locator('[data-slot=session]')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Sign out everywhere else' })).toHaveCount(0)
})

test('audit log: search and filters narrow the events; details open', async ({ page }) => {
  await open(page, 'blocks-security--audit')
  await expect(page.locator('[data-slot=audit-event]')).toHaveCount(5)
  await page.getByRole('searchbox', { name: 'Search the log' }).fill('revoked')
  await expect(page.locator('[data-slot=audit-event]')).toHaveCount(1)
  await expect(page.locator('[data-slot=audit-log] [aria-live=polite]')).toHaveText('1 event')
  await page.getByRole('searchbox', { name: 'Search the log' }).fill('')
  await page.getByRole('combobox', { name: 'Who' }).click()
  await page.getByRole('option', { name: 'Ada Lovelace' }).click()
  await expect(page.locator('[data-slot=audit-event]')).toHaveCount(2)
  await page.getByRole('button', { name: /^Details: Ada Lovelace invited linus@acme\.dev/ }).click()
  await expect(page.getByText('inv_82k')).toBeVisible()
  await page.getByRole('button', { name: 'Load more' }).click()
  await expect(page.locator('[data-slot=audit-event]')).toHaveCount(2)
})

test('integrations: filter by category, connect shows progress', async ({ page }) => {
  await open(page, 'blocks-integrations--default')
  await expect(page.locator('[data-slot=integration]')).toHaveCount(8)
  await page.getByRole('radio', { name: /Connected/ }).check()
  await expect(page.locator('[data-slot=integration]')).toHaveCount(2)
  await page.getByRole('radio', { name: /^All/ }).check()
  await page.getByRole('searchbox', { name: 'Search integrations' }).fill('postgres')
  await expect(page.locator('[data-slot=integration]')).toHaveCount(1)
  await page.getByRole('button', { name: 'Connect Postgres' }).click()
  await expect(page.getByRole('button', { name: 'Configure Postgres' })).toBeVisible()
})

test('prompt manager: variables follow the text, save, compare, test', async ({ page }) => {
  await open(page, 'blocks-ai-prompt-manager--default')
  const editor = page.getByRole('textbox', { name: 'Prompt (v3)' })
  await editor.press('End')
  await editor.press('ControlOrMeta+End')
  await editor.pressSequentially('\nTone: {{tone}}')
  await expect(page.getByText('Unsaved changes')).toBeVisible()
  await expect(page.locator('code', { hasText: /^tone$/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Deploy v3 to production' })).toBeDisabled()

  await page.getByRole('tab', { name: 'Compare' }).click()
  await expect(page.locator('[data-slot=diff-viewer]')).toContainText('Tone: {{tone}}')

  await page.getByRole('tab', { name: 'Test' }).click()
  await page.getByRole('textbox', { name: 'tone' }).fill('warm')
  await page.getByRole('button', { name: 'Run' }).click()
  await expect(page.getByText('Thanks for asking!', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Run' })).toBeVisible({ timeout: 10_000 })

  await page.getByRole('tab', { name: 'Edit' }).click()
  await page.getByRole('textbox', { name: 'What changed' }).fill('Ask for a tone')
  await page.getByRole('button', { name: 'Save as v4' }).click()
  await expect(page.getByRole('button', { name: /^v4/ })).toHaveAttribute('aria-current', 'true')
  await expect(page.getByRole('textbox', { name: 'Prompt (v4)' })).toHaveValue(
    /Tone: \{\{tone\}\}$/,
  )
})
