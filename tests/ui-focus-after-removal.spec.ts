// Where the focus goes when the control just used goes away or has nothing left to do: removing an
// image or an attachment, sending or cancelling a reply, "Select all" and "Clear", moving items,
// saving a view, leaving an inline edit. Each one is done from the keyboard, and the focus must
// land on something named, never on the page.
import { expect, type Page, test } from '@playwright/test'

import { addTabStops, openStory } from './stories'

const open = (page: Page, id: string) => openStory(page, id, 'dark')

// A 1×1 PNG.
const pixel = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
)

/** Lets a focus move scheduled for the next frame happen, so "not focused" means it never came. */
const nextFrames = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve()
          })
        })
      }),
  )

test('image input: Remove hands the focus to Upload and says the image is gone', async ({
  page,
}) => {
  await open(page, 'components-forms-image-input--default')
  await page
    .locator('input[type=file]')
    .setInputFiles({ name: 'me.png', mimeType: 'image/png', buffer: pixel })
  await expect(page.getByRole('img', { name: 'Image preview' })).toBeVisible()
  await page.getByRole('button', { name: 'Remove', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByText('No photo yet')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Upload image', exact: true })).toBeFocused()
  await expect(page.getByRole('status').filter({ hasText: 'Image removed' })).toBeAttached()
})

test('prompt input: removing an attachment focuses the next one, then the text box', async ({
  page,
}) => {
  await open(page, 'components-ai-prompt-input--default')
  await page.locator('input[type=file]').setInputFiles([
    { name: 'brief.txt', mimeType: 'text/plain', buffer: Buffer.from('brief') },
    { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('notes') },
  ])
  const removeBrief = page.getByRole('button', { name: 'Remove brief.txt' })
  const removeNotes = page.getByRole('button', { name: 'Remove notes.txt' })
  await expect(removeNotes).toBeVisible()
  await removeBrief.focus()
  await page.keyboard.press('Enter')
  await expect(removeBrief).toHaveCount(0)
  await expect(removeNotes).toBeFocused()
  await expect(page.getByRole('status').filter({ hasText: 'brief.txt removed' })).toBeAttached()
  await page.keyboard.press('Enter')
  await expect(removeNotes).toHaveCount(0)
  await expect(page.getByRole('textbox', { name: 'Message' })).toBeFocused()
  await expect(page.getByRole('status').filter({ hasText: 'notes.txt removed' })).toBeAttached()
})

test('comment thread: a cancelled or sent reply returns the focus to its Reply button', async ({
  page,
}) => {
  await open(page, 'components-data-display-comment-thread--default')
  const thread = page.getByRole('region', { name: 'Comments' })
  const reply = thread.getByRole('button', { name: 'Reply to Tom Bernard' })
  // Tom's comment is a reply to Léa's: the box answers her thread.
  const box = thread.getByRole('textbox', { name: 'Reply to Léa Martin' })

  await reply.focus()
  await page.keyboard.press('Enter')
  await expect(box).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(box).toHaveCount(0)
  await expect(reply).toBeFocused()

  await page.keyboard.press('Enter')
  await expect(box).toBeFocused()
  await box.fill('On it.')
  await page.keyboard.press('ControlOrMeta+Enter')
  await expect(thread.getByText('On it.')).toBeVisible()
  await expect(box).toHaveCount(0)
  await expect(reply).toBeFocused()
})

test('multi-select: Select all and Clear keep the focus once they have nothing left to do', async ({
  page,
}) => {
  await open(page, 'components-forms-multi-select-money-phone-typed-dates--multi-select-story')
  await page.getByRole('combobox', { name: /Regions/ }).click()
  const count = page.getByRole('status').filter({ hasText: 'selected' })
  await expect(count).toHaveText('4 selected')

  const selectAll = page.getByRole('button', { name: 'Select all' })
  await selectAll.focus()
  await page.keyboard.press('Enter')
  await expect(count).toHaveText('6 selected')
  await expect(selectAll).toBeFocused()
  await expect(selectAll).toHaveAttribute('aria-disabled', 'true')

  const clear = page.getByRole('button', { name: 'Clear' })
  await clear.focus()
  await page.keyboard.press('Enter')
  await expect(count).toHaveText('0 selected')
  await expect(clear).toBeFocused()
  await expect(clear).toHaveAttribute('aria-disabled', 'true')
  await expect(selectAll).not.toHaveAttribute('aria-disabled', 'true')
})

test('transfer list: a move button keeps the focus after it empties its own selection', async ({
  page,
}) => {
  await open(page, 'components-forms-transfer-list--default')
  await page.getByRole('checkbox', { name: 'Role' }).check()
  await page.getByRole('button', { name: 'Add 1 ticked' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByText('Shown: name, email, role, plan')).toBeVisible()
  const add = page.getByRole('button', { name: 'Add ticked' })
  await expect(add).toBeFocused()
  await expect(add).toHaveAttribute('aria-disabled', 'true')
  // With nothing ticked, a press does nothing.
  await page.keyboard.press('Enter')
  await expect(page.getByText('Shown: name, email, role, plan')).toBeVisible()
})

test('filter bar: Save view hands the focus to Add filter once the view is stored', async ({
  page,
}) => {
  await open(page, 'components-forms-filter-bar--with-views')
  const bar = page.getByRole('group', { name: 'Filters' })
  const view = bar.getByRole('combobox', { name: 'View' })
  await view.click()
  await page.getByRole('option', { name: 'Enterprise' }).click()
  await bar.getByRole('button', { name: 'Remove filter: Tags is any of Enterprise' }).click()
  await bar.getByRole('button', { name: 'Add filter' }).click()
  await page.getByRole('option', { name: 'Recurring' }).click()
  await page.keyboard.press('Escape')
  await expect(view).toHaveText('Custom')
  await bar.getByRole('button', { name: 'Save view' }).focus()
  await page.keyboard.press('Enter')
  await expect(view).toHaveText('My view')
  await expect(bar.getByRole('button', { name: 'Save view' })).toHaveCount(0)
  await expect(bar.getByRole('button', { name: 'Add filter' })).toBeFocused()
})

test.describe('editable text', () => {
  test('Tab saves and leaves the focus where it went', async ({ page }) => {
    await open(page, 'components-forms-editable-text--default')
    await addTabStops(page)
    await page.getByRole('button', { name: /Edit project name/ }).focus()
    await page.keyboard.press('Enter')
    const input = page.getByRole('textbox', { name: 'project name' })
    await expect(input).toBeFocused()
    await input.fill('Acme v2')
    await page.keyboard.press('Tab')
    await expect(page.getByText('Saved 1 times · value: Acme v2')).toBeVisible()
    const button = page.getByRole('button', { name: /Acme v2, Edit project name/ })
    await expect(button).toBeVisible()
    await nextFrames(page)
    await expect(button).not.toBeFocused()
  })

  test('Enter and Escape return the focus to the text', async ({ page }) => {
    await open(page, 'components-forms-editable-text--default')
    await page.getByRole('button', { name: /Edit project name/ }).focus()
    await page.keyboard.press('Enter')
    const input = page.getByRole('textbox', { name: 'project name' })
    await input.fill('Acme v2')
    await page.keyboard.press('Enter')
    const button = page.getByRole('button', { name: /Acme v2, Edit project name/ })
    await expect(button).toBeFocused()
    await page.keyboard.press('Enter')
    await input.fill('Nope')
    await page.keyboard.press('Escape')
    await expect(button).toBeFocused()
    await expect(page.getByText('Saved 1 times · value: Acme v2')).toBeVisible()
  })

  test('a required text emptied is put back, and says so', async ({ page }) => {
    await open(page, 'components-forms-editable-text--default')
    await page.getByRole('button', { name: /Edit project name/ }).focus()
    await page.keyboard.press('Enter')
    const input = page.getByRole('textbox', { name: 'project name' })
    await expect(input).toHaveAttribute('aria-required', 'true')
    await input.fill('')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: /Acme launch, Edit project name/ })).toBeFocused()
    await expect(page.getByText('Saved 0 times · value: Acme launch')).toBeVisible()
    await expect(page.getByText('It can’t be empty: the previous text is back.')).toBeAttached()
  })
})

test('carousel: a field in a slide keeps its arrow keys; the buttons still page', async ({
  page,
}) => {
  await open(page, 'components-charts-media--carousel-with-field')
  const carousel = page.getByRole('region', { name: 'Set up your workspace' })
  const previous = carousel.getByRole('button', { name: 'Previous slide' })
  const next = carousel.getByRole('button', { name: 'Next slide' })
  await expect(next).toBeEnabled()
  const field = carousel.getByRole('textbox', { name: 'Workspace name' })
  await field.fill('Acme')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.type('X')
  await expect(field).toHaveValue('AcmXe')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  // The caret moved; the carousel didn't.
  await expect(previous).toBeDisabled()
  await next.focus()
  await page.keyboard.press('ArrowRight')
  await expect(previous).toBeEnabled()
})
