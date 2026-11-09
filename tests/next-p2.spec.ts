// Load more, presence, image crop, notification preferences, environment variables, feature flags,
// version history, the SQL explorer and the agent run replay: what people do and get.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test('load more: pages load until the end, and focus lands on the end line', async ({ page }) => {
  await open(page, 'components-load-more--with-button')
  const items = page.getByRole('listitem')
  await expect(items).toHaveCount(8)
  await expect(page.getByText('8 of 26')).toBeVisible()
  const button = page.getByRole('button', { name: 'Load more' })
  await button.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Loading more…' })).toBeFocused()
  await expect(items).toHaveCount(16)
  await expect(button).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(items).toHaveCount(24)
  await page.keyboard.press('Enter')
  await expect(items).toHaveCount(26)
  await expect(page.getByText('You’ve reached the end.')).toBeFocused()
})

test('load more: a failed page turns the button into Try again, which keeps focus', async ({
  page,
}) => {
  await open(page, 'components-load-more--with-error')
  const button = page.getByRole('button', { name: 'Load more' })
  await button.click()
  await expect(page.getByRole('listitem')).toHaveCount(16)
  await page.getByRole('button', { name: 'Load more' }).click()
  const retry = page.getByRole('button', { name: 'Try again' })
  await expect(retry).toBeFocused()
  await expect(page.locator('[data-slot=load-more] [role=status]')).toHaveText(
    'The next items couldn’t load.',
  )
  await retry.click()
  await expect(page.getByRole('listitem')).toHaveCount(24)
})

test('load more: auto loads as the end scrolls into view', async ({ page }) => {
  await open(page, 'components-load-more--infinite-scroll')
  const items = page.getByRole('listitem')
  await expect(items).toHaveCount(8)
  await page.getByText('Project 08').scrollIntoViewIfNeeded()
  await page.locator('[data-slot=load-more]').scrollIntoViewIfNeeded()
  await expect(items).not.toHaveCount(8)
})

test('presence: the group says who is here; the extra ones are counted and named', async ({
  page,
}) => {
  await open(page, 'components-presence--avatars')
  const group = page.getByRole('group', { name: '7 people here' })
  await expect(group).toBeVisible()
  await expect(group.getByRole('img')).toHaveCount(4)
  await expect(group.getByRole('img', { name: 'Alan Turing (away)' })).toBeVisible()
  const more = group.getByRole('button', { name: /^3 more: Margaret Hamilton, Edsger Dijkstra/ })
  await expect(more).toHaveText('+3')
  await group.getByRole('img', { name: 'Ada Lovelace' }).focus()
  await expect(page.getByRole('tooltip')).toHaveText(/Ada Lovelace · editing/)
})

test('presence: activity names one, two, then counts the rest', async ({ page }) => {
  await open(page, 'components-presence--activity')
  await expect(page.getByText('Ada Lovelace is editing…')).toBeVisible()
  await expect(page.getByText('Ada Lovelace and Grace Hopper are editing…')).toBeVisible()
  await expect(
    page.getByText('Ada Lovelace, Grace Hopper, and 3 others are editing…'),
  ).toBeVisible()
})

test('image input: crop frames the chosen image, and focus comes back', async ({ page }) => {
  await open(page, 'components-forms-image-input--with-crop')
  const pixel = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  )
  const choose = page.getByRole('button', { name: 'Upload image' }).first()
  await choose.focus()
  const chooser = page.waitForEvent('filechooser')
  await choose.click()
  await (await chooser).setFiles({ name: 'me.png', mimeType: 'image/png', buffer: pixel })
  const dialog = page.getByRole('dialog', { name: 'Crop the image' })
  await expect(dialog).toBeVisible()
  const zoom = dialog.getByRole('slider', { name: 'Zoom' })
  await expect(zoom).toHaveAttribute('aria-valuetext', '100%')
  await dialog.getByRole('group', { name: 'Image framing' }).focus()
  await page.keyboard.press('+')
  await expect(zoom).toHaveAttribute('aria-valuetext', '110%')
  await dialog.getByRole('button', { name: 'Apply' }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByText('Cropped: me.png')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Replace' }).first()).toBeFocused()
})

test('notification preferences: a cell, a whole channel, and locked cells', async ({ page }) => {
  await open(page, 'blocks-notification-preferences--default')
  const replyPush = page.getByRole('checkbox', { name: 'Replies to your comments by Push' })
  await expect(replyPush).not.toBeChecked()
  await replyPush.click()
  await expect(replyPush).toBeChecked()

  const allEmail = page.getByRole('checkbox', { name: 'E-mail for every notification' })
  await expect(allEmail).toHaveAttribute('aria-checked', 'mixed')
  await allEmail.click()
  await expect(
    page.getByRole('checkbox', { name: 'Replies to your comments by E-mail' }),
  ).toBeChecked()
  await allEmail.click()
  await expect(
    page.getByRole('checkbox', { name: 'Replies to your comments by E-mail' }),
  ).not.toBeChecked()
  // Required stays on; unavailable has no checkbox.
  await expect(
    page.getByRole('checkbox', { name: 'New sign-in by E-mail, always on' }),
  ).toBeChecked()
  await expect(
    page.getByRole('checkbox', { name: 'New sign-in by E-mail, always on' }),
  ).toBeDisabled()
  await expect(page.getByRole('checkbox', { name: 'Tasks assigned to you by Push' })).toHaveCount(0)
})

test('env vars: import a pasted .env after a preview, then compare', async ({ page }) => {
  await open(page, 'blocks-environment-variables--default')
  const importButton = page.getByRole('button', { name: 'Import .env' })
  await importButton.click()
  const dialog = page.getByRole('dialog', { name: 'Import into Production' })
  await dialog
    .getByRole('textbox', { name: '.env contents' })
    .fill('# new\nLOG_LEVEL=debug\nexport SENTRY_DSN="https://sentry.example/1"\nnot valid')
  await expect(dialog.getByRole('status')).toContainText('2 variables, 1 replacing a value.')
  await expect(dialog.getByRole('status')).toContainText('Line 4 couldn’t be read')
  await dialog.getByRole('button', { name: 'Import 2 variables' }).click()
  await expect(dialog).toBeHidden()
  await expect(importButton).toBeFocused()
  const list = page.getByRole('list', { name: 'Variables in Production' })
  await expect(list.getByText('SENTRY_DSN')).toBeVisible()

  await page.getByRole('tab', { name: 'Compare' }).click()
  const row = page.getByRole('row', { name: /^FEATURE_NEW_CHECKOUT/ })
  await expect(row.getByText('Missing')).toBeVisible()
  await expect(page.getByRole('row', { name: /^LOG_LEVEL/ }).getByText('Differs')).toBeVisible()
})

test('env vars: a name is checked before anything is sent', async ({ page }) => {
  await open(page, 'blocks-environment-variables--default')
  await page.getByRole('button', { name: 'Add variable' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add a variable' })
  await dialog.getByRole('textbox', { name: 'Name' }).fill('1-BAD')
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(
    dialog.getByText('Letters, digits and _ only, not starting with a digit.'),
  ).toBeVisible()
  await dialog.getByRole('textbox', { name: 'Name' }).fill('REDIS_URL')
  await dialog.getByRole('textbox', { name: 'Value' }).fill('redis://cache:6379')
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(dialog).toBeHidden()
  await expect(
    page.getByRole('list', { name: 'Variables in Production' }).getByText('REDIS_URL'),
  ).toBeVisible()
})

test('feature flags: the switch saves, the panel edits rules, focus comes back', async ({
  page,
}) => {
  await open(page, 'blocks-feature-flags--default')
  const dark = page.getByRole('switch', { name: 'Dark mode v2 in Production' })
  await expect(dark).not.toBeChecked()
  await dark.click()
  await expect(dark).toBeChecked()

  const edit = page.getByRole('button', { name: 'Rollout and rules of AI summaries' })
  await edit.click()
  const panel = page.getByRole('dialog', { name: 'AI summaries' })
  await expect(panel.locator('[data-slot=feature-flag-rule]')).toHaveCount(1)
  await panel.getByRole('button', { name: 'Add rule' }).click()
  await panel.getByRole('textbox', { name: 'Rule 2: values' }).fill('FR')
  await page.keyboard.press('Enter')
  await panel.getByRole('button', { name: 'Remove rule 1' }).click()
  await expect(panel.getByRole('button', { name: 'Remove rule 1' })).toBeFocused()
  await panel.getByRole('button', { name: 'Save' }).click()
  await expect(panel).toBeHidden()
  await expect(edit).toBeFocused()
  await expect(page.locator('[data-slot=feature-flag]').nth(1)).toContainText('0% · 1 rule')

  await page.getByRole('searchbox', { name: 'Search flags' }).fill('billing')
  await expect(page.locator('[data-slot=feature-flag]')).toHaveCount(1)
})

test('version history: compare, rename and restore', async ({ page }) => {
  await open(page, 'blocks-version-history--default')
  const nav = page.getByRole('navigation', { name: 'Versions' })
  await expect(nav.getByRole('button', { name: /^Sent to legal/ })).toHaveAttribute(
    'aria-current',
    'true',
  )
  await expect(page.getByText('Changes since', { exact: false })).toBeVisible()
  await expect(page.getByText('Yearly billing saves two months.').first()).toBeVisible()

  await page.getByRole('combobox', { name: 'Compare with' }).click()
  await page.getByRole('option', { name: 'No comparison' }).click()
  await expect(page.locator('[data-slot=version-history] pre')).toContainText(
    'Coreloom has three plans, billed monthly or yearly.',
  )

  await nav.getByRole('button', { name: /^First draft/ }).click()
  await page.getByRole('button', { name: 'Restore' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Restore' }).click()
  await expect(nav.getByRole('button', { name: /Restored First draft/ })).toBeVisible()

  await page.getByRole('switch', { name: 'Named versions only' }).click()
  await expect(nav.getByRole('button')).toHaveCount(3)
})

test('sql explorer: run, see the rows, and Mod-Enter in the editor', async ({ page }) => {
  await open(page, 'blocks-developer-sql-explorer--default')
  await page.getByRole('button', { name: 'Run' }).click()
  const results = page.getByRole('region', { name: 'Result' })
  await expect(results.getByText(/^4 rows · \d+ ms$/)).toBeVisible()
  await expect(results.getByRole('cell', { name: 'Billing service' })).toBeVisible()
  await expect(page.locator('[data-slot=sql-explorer] > div > [role=status]')).toHaveText('4 rows')

  await page.getByRole('button', { name: 'Events', exact: true }).click()
  await expect(page.getByText('Run a query to see its result.')).toBeVisible()
  await page.getByRole('textbox', { name: 'SQL of Events' }).click()
  await page.keyboard.press('ControlOrMeta+Enter')
  await expect(page.getByText('2,000 rows', { exact: false }).first()).toBeVisible()

  // Clicking a column in the tree inserts its name at the cursor.
  await page.getByRole('button', { name: 'New query' }).click()
  await page.getByRole('treeitem', { name: 'users' }).click()
  await expect(page.getByRole('textbox', { name: 'SQL of Query 3' })).toHaveText('users')
})

test('sql explorer: the database’s error shows; Cancel stops a query', async ({ page }) => {
  await open(page, 'blocks-developer-sql-explorer--query-error')
  await page.getByRole('button', { name: 'Run' }).click()
  await expect(page.getByText('relation "project" does not exist')).toBeVisible()
  const run = page.getByRole('button', { name: 'Run' })
  await run.click()
  const cancel = page.getByRole('button', { name: 'Cancel' })
  await expect(cancel).toBeFocused()
  await cancel.click()
  await expect(page.getByText('Query cancelled.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Run' })).toBeFocused()
})

test('agent run replay: the slider reads the moment; a turn jumps there', async ({ page }) => {
  await open(page, 'blocks-ai-agent-run-replay--default')
  const slider = page.getByRole('slider', { name: 'Moment in the run' })
  await expect(slider).toHaveAttribute(
    'aria-valuetext',
    '6.4 sec of 14.2 sec, Tech support working',
  )
  const turns = page.getByRole('list', { name: 'Turns' })
  await expect(turns.getByRole('button')).toHaveCount(4)
  await turns.getByRole('button', { name: /Turn 3: Billing/ }).click()
  await expect(slider).toHaveAttribute('aria-valuenow', '2100')
  await expect(turns.getByRole('button', { name: /Turn 3: Billing/ })).toHaveAttribute(
    'aria-current',
    'step',
  )
  await expect(page.getByRole('row', { name: /^Tech support/ })).toContainText('3')
  const play = page.getByRole('button', { name: 'Play', exact: true })
  await play.click()
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeFocused()
})
