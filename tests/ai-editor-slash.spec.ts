// The rich text editor's "/" menu: what a person does with the keyboard and pointer, and what a
// screen reader gets (a listbox the editor points at with aria-activedescendant). Runs on the built Storybook.
import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

// The fake model thinks for 1.5 s, then writes a word every 45 ms: allow for a busy machine.
const SUGGESTION_TIMEOUT = 15_000
const ALL = [
  'Ask AI…',
  'Continue writing',
  'Improve writing',
  'Fix spelling and grammar',
  'Make shorter',
  'Make longer',
  'Summarise',
]

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)
const EDITOR = 'components-forms-rich-text-editor--'

/** Opens the Slash command story with the caret on its empty last line. */
async function onEmptyLine(page: Page) {
  await open(page, `${EDITOR}slash-command`)
  const editor = page.getByRole('textbox', { name: 'Announcement' })
  await editor.locator('p').last().click()
  return editor
}

test.describe('editor slash command', () => {
  test('"/" on an empty line opens the AI commands; the editor keeps focus and points at the active one', async ({
    page,
  }) => {
    const editor = await onEmptyLine(page)
    // Closed, the editor is a plain textbox.
    await expect(editor).not.toHaveAttribute('aria-autocomplete')
    await expect(editor).not.toHaveAttribute('aria-activedescendant')
    await page.keyboard.type('/')
    await expect(editor).toHaveAttribute('aria-autocomplete', 'list')
    const menu = page.getByRole('listbox', { name: 'AI commands' })
    await expect(menu).toBeVisible()
    await expect(menu.getByRole('option')).toHaveText(ALL)
    const first = menu.getByRole('option', { name: 'Ask AI…' })
    await expect(first).toHaveAttribute('aria-selected', 'true')
    await expect(editor).toBeFocused()
    await expect(editor).toHaveAttribute('aria-controls', (await menu.getAttribute('id')) ?? '')
    await expect(editor).toHaveAttribute(
      'aria-activedescendant',
      (await first.getAttribute('id')) ?? '',
    )
    await expect(page.getByRole('status').filter({ hasText: 'AI commands' })).toHaveText(
      '7 AI commands. Up and down arrows to choose, Enter to run.',
    )
    // Under the slash.
    const line = await editor.locator('p').last().boundingBox()
    const box = await menu.boundingBox()
    expect(box!.y).toBeGreaterThanOrEqual(line!.y + line!.height - 1)
  })

  test('typing filters the list; no match hides it and the text stays literal', async ({
    page,
  }) => {
    const editor = await onEmptyLine(page)
    const menu = page.getByRole('listbox', { name: 'AI commands' })
    await page.keyboard.type('/ai')
    await expect(menu.getByRole('option')).toHaveText(ALL)
    await expect(menu.getByRole('option').first()).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('Backspace')
    await page.keyboard.press('Backspace')
    await page.keyboard.type('sum')
    await expect(menu.getByRole('option')).toHaveText(['Summarise'])
    await expect(page.getByRole('status').filter({ hasText: 'AI command' })).toHaveText(
      '1 AI command. Up and down arrows to choose, Enter to run.',
    )
    await page.keyboard.type('x')
    await expect(menu).toHaveCount(0)
    await expect(editor).not.toHaveAttribute('aria-activedescendant')
    await expect(editor.locator('p').last()).toHaveText('/sumx')
    await page.keyboard.press('Backspace')
    await expect(menu.getByRole('option')).toHaveText(['Summarise'])
    // A space ends the command: the menu closes, the text is just text.
    await page.keyboard.type(' ')
    await expect(menu).toHaveCount(0)
    await page.keyboard.press('Enter')
    await expect(editor.locator('p').nth(-2)).toHaveText('/sum')
  })

  test('"/" after a space opens it; inside a word or a URL it is a slash', async ({ page }) => {
    const editor = await onEmptyLine(page)
    const menu = page.getByRole('listbox', { name: 'AI commands' })
    await page.keyboard.type('and/or')
    await expect(menu).toHaveCount(0)
    await page.keyboard.type(' /')
    await expect(menu).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(editor.locator('p').last()).toHaveText('and/or /')
  })

  test('arrows move and wrap; Enter on Ask AI removes the "/…" and opens the panel there, prompt focused', async ({
    page,
  }) => {
    const editor = await onEmptyLine(page)
    const before = await editor.locator('p').count()
    await page.keyboard.type('/a')
    const menu = page.getByRole('listbox', { name: 'AI commands' })
    const options = menu.getByRole('option')
    await page.keyboard.press('ArrowDown')
    await expect(options.nth(1)).toHaveAttribute('aria-selected', 'true')
    await expect(options.first()).toHaveAttribute('aria-selected', 'false')
    await expect(editor).toHaveAttribute(
      'aria-activedescendant',
      (await options.nth(1).getAttribute('id')) ?? '',
    )
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await expect(options.last()).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('ArrowDown')
    await expect(options.first()).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('Enter')

    const panel = page.getByRole('dialog', { name: 'AI assistant' })
    await expect(panel).toBeVisible()
    await expect(menu).toHaveCount(0)
    await expect(panel.getByRole('textbox', { name: 'What should AI do?' })).toBeFocused()
    // The typed "/a" is gone and Enter didn't split the line.
    await expect(editor.locator('p')).toHaveCount(before)
    await expect(editor.locator('p').last()).toHaveText('')
    await expect(panel).toContainText('Whole document')

    await page.keyboard.type('Release notes')
    await page.keyboard.press('Enter')
    await expect(panel.getByRole('status')).toHaveText('Suggestion ready.', {
      timeout: SUGGESTION_TIMEOUT,
    })
    await expect(page.getByTestId('slash-last-request')).toHaveText(/custom on the document/)
    // From the "/" menu, the answer goes where the slash was: in place of the empty line.
    await panel.getByRole('button', { name: 'Insert here' }).click()
    await expect(panel).toBeHidden()
    await expect(editor).toBeFocused()
    await expect(editor.locator('h2')).toHaveText('Release notes')
    await expect(editor.locator('ol li')).toHaveCount(3)
    await expect(editor.locator('p').first()).toContainText('our new release make the build')
  })

  test('Continue writing runs at once on the text before the cursor and inserts at it', async ({
    page,
  }) => {
    const editor = await onEmptyLine(page)
    await page.keyboard.type('/cont')
    const menu = page.getByRole('listbox', { name: 'AI commands' })
    await expect(menu.getByRole('option')).toHaveText(['Continue writing'])
    await page.keyboard.press('Tab')
    const panel = page.getByRole('dialog', { name: 'AI assistant' })
    await expect(panel).toContainText('Text before the cursor')
    await expect(panel.getByRole('status')).toHaveText('Suggestion ready.', {
      timeout: SUGGESTION_TIMEOUT,
    })
    await expect(page.getByTestId('slash-last-request')).toHaveText(/continue on the document/)
    // A continuation can't replace the document: Insert here is the one way in, and it's focused.
    await expect(panel.getByRole('button', { name: /Replace/ })).toHaveCount(0)
    await expect(panel.getByRole('button', { name: 'Insert here' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(panel).toBeHidden()
    await expect(editor.locator('p').last()).toHaveText(
      'Next up: the same speed-up for the test runner, and a dark mode audit of every chart.',
    )
    await expect(editor.locator('p')).toHaveCount(3)
  })

  test('a quick action from the menu runs on the whole document; the pointer can choose too', async ({
    page,
  }) => {
    const editor = await onEmptyLine(page)
    await page.keyboard.type('/')
    const menu = page.getByRole('listbox', { name: 'AI commands' })
    await menu.getByRole('option', { name: 'Summarise' }).hover()
    await expect(menu.getByRole('option', { name: 'Summarise' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await menu.getByRole('option', { name: 'Summarise' }).click()
    const panel = page.getByRole('dialog', { name: 'AI assistant' })
    await expect(panel.getByRole('status')).toHaveText('Suggestion ready.', {
      timeout: SUGGESTION_TIMEOUT,
    })
    await expect(page.getByTestId('slash-last-request')).toHaveText(/summarise on the document/)
    await expect(panel.getByRole('button', { name: 'Insert here' })).toBeFocused()
    await expect(panel.getByRole('button', { name: 'Replace all' })).toBeVisible()
    // Discard puts the person back where they were typing, without the "/".
    await panel.getByRole('button', { name: 'Discard' }).click()
    await expect(panel).toBeHidden()
    await expect(editor).toBeFocused()
    await expect(editor.locator('p').last()).toHaveText('')
    await page.keyboard.type('Done.')
    await expect(editor.locator('p').last()).toHaveText('Done.')
  })

  test('Escape closes the menu and leaves the "/" text; a click outside closes it too', async ({
    page,
  }) => {
    const editor = await onEmptyLine(page)
    const menu = page.getByRole('listbox', { name: 'AI commands' })
    await page.keyboard.type('/imp')
    await expect(menu).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)
    await expect(editor).toBeFocused()
    await expect(editor).not.toHaveAttribute('aria-activedescendant')
    await expect(editor).not.toHaveAttribute('aria-controls')
    await expect(editor).not.toHaveAttribute('aria-autocomplete')
    await expect(editor.locator('p').last()).toHaveText('/imp')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    // Closed, Enter is a new line again.
    await page.keyboard.press('Enter')
    await expect(editor.locator('p').nth(-2)).toHaveText('/imp')

    await page.keyboard.type('/')
    await expect(menu).toBeVisible()
    await page.getByTestId('slash-last-request').click()
    await expect(menu).toHaveCount(0)
    await expect(editor.locator('p').last()).toHaveText('/')
  })

  test('near the bottom of the window the menu opens above the line', async ({ page }) => {
    await open(page, `${EDITOR}slash-command`)
    const editor = page.getByRole('textbox', { name: 'Announcement' })
    const line = editor.locator('p').last()
    const box = await line.boundingBox()
    await page.setViewportSize({ width: 1280, height: Math.round(box!.y + box!.height + 40) })
    await line.click()
    // Filtered to one row, so there is room above the line.
    await page.keyboard.type('/sum')
    const menu = page.locator('[data-slot=rich-text-ai-slash-menu]')
    await expect(menu).toHaveAttribute('data-side', 'top')
    const placed = await menu.boundingBox()
    expect(placed!.y + placed!.height).toBeLessThanOrEqual(box!.y + 1)
    expect(placed!.y).toBeGreaterThanOrEqual(0)
  })

  test('the open menu passes axe, in English and French', async ({ page }) => {
    for (const locale of ['en', 'fr'] as const) {
      await open(page, `${EDITOR}slash-menu-open`, locale)
      const menu = page.locator('[data-slot=rich-text-ai-slash-menu]')
      await expect(menu.getByRole('option').first()).toHaveAttribute('aria-selected', 'true')
      const { violations } = await new AxeBuilder({ page })
        .include('[data-slot=rich-text-ai-slash-menu]')
        .include('[data-slot=rich-text-editor]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .disableRules(['region', 'landmark-one-main', 'page-has-heading-one'])
        .analyze()
      expect(
        violations.map(
          (v) => `${locale}: ${v.id} ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
        ),
      ).toEqual([])
    }
    await expect(page.getByRole('listbox', { name: 'Commandes IA' })).toBeVisible()
    await expect(page.getByRole('option').first()).toHaveText('Demander à l’IA…')
  })

  test('without `ai`, "/" is a slash and nothing opens', async ({ page }) => {
    await open(page, `${EDITOR}empty`)
    const editor = page.getByRole('textbox', { name: 'Comment' })
    await editor.click()
    await page.keyboard.type('/ai')
    await page.keyboard.press('Enter')
    await page.keyboard.type('x')
    await expect(page.getByRole('listbox')).toHaveCount(0)
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(editor.locator('p')).toHaveText(['/ai', 'x'])
    await expect(editor).not.toHaveAttribute('aria-autocomplete')
  })
  test('Enter right after a lone "/" is a new line; after the arrows it chooses', async ({
    page,
  }) => {
    const editor = await onEmptyLine(page)
    const menu = page.getByRole('listbox', { name: 'AI commands' })
    await page.keyboard.type('Ratio 1 /')
    await expect(menu).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(menu).toHaveCount(0)
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(editor.locator('p').nth(-2)).toHaveText('Ratio 1 /')
    await expect(editor.locator('p').last()).toHaveText('')
    await expect(editor).toBeFocused()
    // Tab on a lone "/" doesn't choose either.
    await page.keyboard.type('/')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(editor.locator('p').last()).toHaveText('/')
    // Once the person moves with the arrows, Enter chooses.
    await editor.locator('p').last().click()
    await page.keyboard.press('End')
    await page.keyboard.press('Enter')
    await page.keyboard.type('/')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog', { name: 'AI assistant' })).toBeVisible()
    await expect(editor.locator('p').last()).toHaveText('')
  })

  test('a quick action from "/" makes Insert here the focused action; Enter keeps the rest of the document', async ({
    page,
  }) => {
    const editor = await onEmptyLine(page)
    await page.keyboard.type('/imp')
    await page.keyboard.press('Enter')
    const panel = page.getByRole('dialog', { name: 'AI assistant' })
    await expect(panel.getByRole('status')).toHaveText('Suggestion ready.', {
      timeout: SUGGESTION_TIMEOUT,
    })
    await expect(panel.getByRole('button', { name: 'Insert here' })).toBeFocused()
    await expect(panel.getByRole('button', { name: 'Replace all' })).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(panel).toBeHidden()
    await expect(editor.locator('p')).toHaveCount(3)
    await expect(editor.locator('p').first()).toContainText('our new release make the build')
    await expect(editor.locator('p').nth(1)).toContainText('Thanks to everyone')
    await expect(editor.locator('p').last()).toHaveText(
      'Our new release makes builds faster and fixes the small bugs you reported over the past month.',
    )
  })

  test('undo after Discard brings the typed "/…" back', async ({ page }) => {
    const editor = await onEmptyLine(page)
    await page.keyboard.type('/imp')
    await page.keyboard.press('Enter')
    const panel = page.getByRole('dialog', { name: 'AI assistant' })
    await expect(editor.locator('p').last()).toHaveText('')
    await panel.getByRole('button', { name: 'Stop' }).click()
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    await expect(editor).toBeFocused()
    await page.keyboard.press('ControlOrMeta+z')
    await expect(editor.locator('p').last()).toHaveText('/imp')
  })

  test('inside a modal dialog the menu takes clicks, and Escape closes the menu before the dialog', async ({
    page,
  }) => {
    await open(page, `${EDITOR}slash-in-dialog`)
    await page.getByRole('button', { name: 'Edit announcement' }).click()
    const dialog = page.getByRole('dialog', { name: 'Edit announcement' })
    const editor = dialog.getByRole('textbox', { name: 'Announcement' })
    await editor.locator('p').last().click()
    const menu = page.getByRole('listbox', { name: 'AI commands' })
    await page.keyboard.type('/')
    await expect(menu).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)
    await expect(dialog).toBeVisible()
    await expect(editor).toBeFocused()
    await expect(editor.locator('p').last()).toHaveText('/')

    await page.keyboard.press('Backspace')
    await page.keyboard.type('/')
    await menu.getByRole('option', { name: 'Summarise' }).click()
    const panel = page.getByRole('dialog', { name: 'AI assistant' })
    await expect(panel.getByRole('status')).toHaveText('Suggestion ready.')
    await panel.getByRole('button', { name: 'Insert here' }).click()
    await expect(panel).toBeHidden()
    await expect(dialog).toBeVisible()
    await expect(editor.locator('p').last()).toHaveText(
      'In short: faster builds and many small fixes.',
    )
    // With nothing else open, Escape closes the dialog.
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('the menu closes when the "/" scrolls out of view', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 320 })
    const editor = await onEmptyLine(page)
    const menu = page.getByRole('listbox', { name: 'AI commands' })
    await page.keyboard.type('/s')
    await expect(menu).toBeVisible()
    await page.mouse.move(640, 100)
    await page.mouse.wheel(0, 600)
    await expect(menu).toHaveCount(0)
    await expect(editor.locator('p').last()).toHaveText('/s')
  })
})
