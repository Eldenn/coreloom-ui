// Node editor canvas comfort: finding a node, notes, groups (made from the selection, moved with what's
// inside, ungrouped) and the minimap. Runs on the built Storybook, in the dark theme.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const STORY = 'components-workflow-node-editor--notes-and-groups'
const open = (page: Page, id = STORY) => openStory(page, id, 'dark')
const canvas = (page: Page) => page.getByRole('application', { name: 'Workflow' })
const node = (page: Page, name: string) =>
  canvas(page).getByRole('group', { name: new RegExp(`^${name}(,|$)`) })
const panel = (page: Page) => page.getByRole('complementary', { name: 'Node settings' })
const notes = (page: Page) => canvas(page).getByRole('group', { name: /^(Note: |Empty note)/ })
const groupFrame = (page: Page, name: string) =>
  canvas(page).getByRole('group', { name: new RegExp(`^Group ${name},`) })

test.describe('Node editor canvas (Components/Workflow/Node editor)', () => {
  test('finds a node from the toolbar and lands on its card', async ({ page }) => {
    await open(page)
    await page.getByRole('button', { name: 'Find on the canvas' }).click()
    await page.getByPlaceholder('Find a node, note or group…').fill('welcome')
    await page.keyboard.press('Enter')
    await expect(node(page, 'Welcome email')).toBeFocused()
    await expect(panel(page).getByRole('textbox', { name: 'Name' })).toHaveValue('Welcome email')
    await expect(page.getByText('Welcome email selected.')).toBeAttached()
  })

  test('Ctrl+F opens the list, which also finds notes and groups', async ({ page }) => {
    await open(page)
    await node(page, 'New signup').focus()
    await page.keyboard.press('ControlOrMeta+f')
    const search = page.getByPlaceholder('Find a node, note or group…')
    await expect(search).toBeFocused()
    await search.fill('sales')
    await expect(page.getByRole('option', { name: /^Sales$/ })).toBeVisible()
    await expect(page.getByRole('option', { name: /Tell sales/ })).toBeVisible()
    await page.getByRole('option', { name: /^Sales$/ }).click()
    await expect(groupFrame(page, 'Sales')).toBeFocused()
  })

  test('adds a note, writes in it, and undo takes it away', async ({ page }) => {
    await open(page)
    await expect(notes(page)).toHaveCount(1)
    await page.getByRole('button', { name: 'Add note' }).click()
    const text = canvas(page).getByRole('textbox', { name: 'Note' }).last()
    await expect(text).toBeFocused()
    await text.fill('Ask legal about the email copy')
    await page.keyboard.press('Escape')
    await expect(
      canvas(page).getByRole('group', { name: 'Note: Ask legal about the email copy' }),
    ).toBeFocused()
    await page.keyboard.press('ControlOrMeta+z')
    await page.keyboard.press('ControlOrMeta+z')
    await expect(notes(page)).toHaveCount(1)
  })

  test('deletes a note from the keyboard', async ({ page }) => {
    await open(page)
    await notes(page).first().focus()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Delete')
    await expect(notes(page)).toHaveCount(0)
    await expect(page.getByText('Removed.')).toBeAttached()
  })

  test('groups the selected node and names the group', async ({ page }) => {
    await open(page)
    await node(page, 'Welcome email').click()
    await page.getByRole('button', { name: 'Add group' }).click()
    const name = canvas(page).getByRole('textbox', { name: 'Group name' }).last()
    await expect(name).toBeFocused()
    await expect(name).toHaveValue('Group')
    await name.fill('Onboarding')
    await page.keyboard.press('Enter')
    await expect(groupFrame(page, 'Onboarding')).toBeFocused()
    await expect(groupFrame(page, 'Onboarding')).toHaveAccessibleName(
      'Group Onboarding, 1 item inside',
    )
  })

  test('moving a group moves what is inside it; ungroup keeps the nodes', async ({ page }) => {
    await open(page)
    const card = node(page, 'Enrich company')
    const before = await card.boundingBox()
    const header = groupFrame(page, 'Sales').locator('.cl-canvas-drag')
    const h = await header.boundingBox()
    if (!before || !h) throw new Error('not laid out')
    await page.mouse.move(h.x + 6, h.y + h.height / 2)
    await page.mouse.down()
    await page.mouse.move(h.x + 46, h.y + h.height / 2 + 60, { steps: 6 })
    await page.mouse.up()
    await expect
      .poll(async () => ((await card.boundingBox())?.y ?? 0) - before.y)
      .toBeGreaterThan(20)

    await groupFrame(page, 'Sales').locator('.cl-canvas-drag').click({ button: 'right' })
    await page.getByRole('menuitem', { name: 'Ungroup' }).click()
    await expect(groupFrame(page, 'Sales')).toHaveCount(0)
    await expect(card).toBeVisible()
    await expect(page.getByText('Group Sales removed; its nodes stay.')).toBeAttached()
  })

  test('the minimap shows by default and the toolbar hides it', async ({ page }) => {
    await open(page)
    const toggle = page.getByRole('button', { name: 'Minimap' })
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('.react-flow__minimap')).toBeVisible()
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await expect(page.locator('.react-flow__minimap')).toHaveCount(0)
  })

  test('read-only: notes and group names show as text', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--notes-read-only')
    await expect(
      canvas(page).getByText('Signups come from the website form.', { exact: false }),
    ).toBeVisible()
    await expect(canvas(page).getByRole('textbox')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Add note' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Find on the canvas' })).toBeEnabled()
  })
})
