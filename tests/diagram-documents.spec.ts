// DiagramViewer and DiagramWorkspace: views in tabs, a side list or a menu, keys that change the
// view, downloads; the list of views (open, rename, delete, add, reorder), the editor and the save
// state, and the phone sheet. Runs on the built Storybook.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test.describe('Diagram viewer (Blocks/Diagrams/Diagram viewer)', () => {
  test('shows the views in tabs, with the title and date', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-viewer--default')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Checkout architecture' }),
    ).toBeVisible()
    await expect(page.getByText('Updated 2 hours ago')).toBeVisible()
    const tabs = page.getByRole('tablist', { name: 'Views' })
    await expect(tabs.getByRole('tab')).toHaveCount(4)
    await expect(tabs.getByRole('tab', { name: 'System context' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await tabs.getByRole('tab', { name: 'Checkout' }).click()
    await expect(page.getByRole('tabpanel', { name: 'Checkout' })).toBeVisible()
  })

  test('Page Down and the arrows change the view and say which', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-viewer--default')
    await page.getByRole('tab', { name: 'Orders' }).click()
    await page.getByRole('button', { name: 'Download' }).focus()
    await page.keyboard.press('PageDown')
    await expect(page.getByRole('tab', { name: 'Checkout' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByRole('status').filter({ hasText: 'View 3 of 4' })).toHaveText(
      'View 3 of 4: Checkout',
    )
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await expect(page.getByRole('tab', { name: 'System context' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    // At the first view, going back does nothing.
    await page.keyboard.press('PageUp')
    await expect(page.getByRole('tab', { name: 'System context' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  test('past six views, the tabs are a list at the side', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await open(page, 'blocks-diagrams-diagram-viewer--many-views')
    const tabs = page.getByRole('tablist', { name: 'Views' })
    await expect(tabs).toHaveAttribute('aria-orientation', 'vertical')
    await expect(tabs.getByRole('tab')).toHaveCount(9)
    await expect(tabs.getByRole('tab', { name: 'Data model' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByRole('combobox', { name: 'View' })).toBeHidden()
  })

  test('on a phone, a menu picks the view', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await open(page, 'blocks-diagrams-diagram-viewer--phone')
    await expect(page.getByRole('tablist')).toBeHidden()
    await page.getByRole('combobox', { name: 'View' }).click()
    await page.getByRole('option', { name: 'Order states' }).click()
    await expect(page.getByRole('combobox', { name: 'View' })).toHaveText('Order states')
    await expect(page.getByRole('tabpanel', { name: 'Order states' })).toBeVisible()
  })

  test('downloads the view as an SVG named after it', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-viewer--default')
    await page.getByRole('tab', { name: 'Orders' }).click()
    await page.getByRole('button', { name: 'Download' }).click()
    const download = page.waitForEvent('download')
    await page.getByRole('menuitem', { name: 'SVG image' }).click()
    expect((await download).suggestedFilename()).toBe('checkout-architecture-orders.svg')
  })

  test('French', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-viewer--french', 'fr')
    await expect(page.getByRole('tablist', { name: 'Vues' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Télécharger' })).toBeVisible()
  })
})

test.describe('Diagram workspace (Blocks/Diagrams/Diagram workspace)', () => {
  const views = (page: Page) => page.getByRole('navigation', { name: 'Views' })

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
  })

  test('opens a view in the editor', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-workspace--default')
    await expect(views(page).getByRole('button', { name: 'Orders', exact: true })).toHaveAttribute(
      'aria-current',
      'true',
    )
    await views(page).getByRole('button', { name: 'Checkout', exact: true }).click()
    await expect(
      views(page).getByRole('button', { name: 'Checkout', exact: true }),
    ).toHaveAttribute('aria-current', 'true')
    await expect(page.getByRole('textbox', { name: 'Source' })).toContainText('sequenceDiagram')
  })

  test('an edit is reported and saved', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-workspace--default')
    await expect(page.locator('[data-slot="save-status"]')).toContainText('Saved')
    const source = page.getByRole('textbox', { name: 'Source' })
    await source.click()
    await page.keyboard.press('ControlOrMeta+End')
    await page.keyboard.type('\n  class Refund')
    await expect(page.locator('[data-slot="save-status"]')).toContainText('Saving…')
    await expect(page.getByRole('status').filter({ hasText: /^Saved$/ })).toBeAttached({
      timeout: 5000,
    })
    await expect(page.locator('[data-slot="save-status"]')).toContainText('Saved')
  })

  test('renames a view in place', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-workspace--default')
    await views(page).getByRole('button', { name: 'Rename Orders' }).click()
    const field = page.getByRole('textbox', { name: 'View name' })
    await expect(field).toBeFocused()
    await field.fill('Order model')
    await page.keyboard.press('Enter')
    await expect(
      views(page).getByRole('button', { name: 'Order model', exact: true }),
    ).toBeFocused()
  })

  test('Escape keeps the old name', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-workspace--default')
    await views(page).getByRole('button', { name: 'Rename Checkout' }).click()
    await page.getByRole('textbox', { name: 'View name' }).fill('Payment')
    await page.keyboard.press('Escape')
    await expect(views(page).getByRole('button', { name: 'Checkout', exact: true })).toBeFocused()
  })

  test('deletes a view after asking, and focus goes to the open one', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-workspace--default')
    await views(page).getByRole('button', { name: 'Delete Checkout' }).click()
    const confirm = page.getByRole('alertdialog', { name: 'Delete “Checkout”?' })
    await expect(confirm.getByRole('button', { name: 'Cancel' })).toBeFocused()
    await confirm.getByRole('button', { name: 'Delete' }).click()
    await expect(views(page).getByRole('button', { name: 'Checkout', exact: true })).toHaveCount(0)
    await expect(views(page).getByRole('button', { name: 'Orders', exact: true })).toBeFocused()
  })

  test('the last view can’t be deleted', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-workspace--single-view')
    await expect(views(page).getByRole('button', { name: 'Delete Orders' })).toBeDisabled()
    await expect(views(page).getByRole('button', { name: 'Reorder' })).toBeDisabled()
  })

  test('adds a view of the kind picked', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-workspace--default')
    await views(page).getByRole('button', { name: 'Add a diagram' }).click()
    await page.getByRole('menuitem', { name: 'State diagram' }).click()
    await expect(
      views(page).getByRole('button', { name: 'State diagram', exact: true }),
    ).toHaveAttribute('aria-current', 'true')
    await expect(page.getByRole('textbox', { name: 'Source' })).toContainText('stateDiagram')
  })

  test('reorders the views', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-workspace--default')
    await views(page).getByRole('button', { name: 'Reorder' }).click()
    await page.getByRole('button', { name: 'Move Checkout up' }).click()
    await views(page).getByRole('button', { name: 'Done' }).click()
    await expect(views(page).locator('[data-view-id]')).toHaveText([
      'Checkout',
      'Orders',
      'Order states',
    ])
  })

  test('renames the document', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-workspace--default')
    await page.getByRole('button', { name: 'Checkout architecture, Edit document name' }).click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('Payments')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: 'Payments, Edit document name' })).toBeFocused()
  })

  test('on a phone, the views are in a sheet', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await open(page, 'blocks-diagrams-diagram-workspace--phone')
    await expect(views(page)).toBeHidden()
    await page.getByRole('button', { name: 'Views (3)' }).click()
    const sheet = page.getByRole('dialog', { name: 'Views' })
    await sheet.getByRole('button', { name: 'Order states', exact: true }).click()
    await expect(sheet).toHaveCount(0)
    await expect(page.getByRole('textbox', { name: 'Source' })).toContainText('stateDiagram')
    await expect(page.getByRole('button', { name: 'Views (3)' })).toBeFocused()
  })
})
