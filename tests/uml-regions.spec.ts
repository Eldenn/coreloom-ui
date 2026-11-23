// Concurrent regions of a composite state and highlighted elements: each region has its own start
// and a line parts them, a highlighted element says so in its name, and the editor's properties
// move a state from one region to another. Runs on the built Storybook, in the dark theme.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test.describe('UML diagram regions (Components/Diagrams/UML diagram)', () => {
  test('draws a start per region and a line between the two', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--concurrent-regions')
    const canvas = page.getByRole('application', { name: 'State diagram' })
    // The diagram's own start, and one for each region of Active.
    await expect(canvas.getByRole('group', { name: 'Start', exact: true })).toHaveCount(3)
    const frame = canvas.getByRole('group', { name: /^Composite state: Active/ })
    await expect(frame.locator('.border-dashed')).toHaveCount(1)
  })

  test('a highlighted element says so, and the others do not', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--highlighted')
    const canvas = page.getByRole('application', { name: 'State diagram' })
    await expect(canvas.getByRole('group', { name: 'State: Playing, highlighted' })).toBeVisible()
    await expect(canvas.getByRole('group', { name: 'State: Muted, highlighted' })).toBeVisible()
    await expect(canvas.getByRole('group', { name: 'State: Paused', exact: true })).toBeVisible()
    await expect(canvas.getByRole('group', { name: /highlighted$/ })).toHaveCount(2)
  })

  test('says it in French', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--highlighted', 'fr')
    await expect(page.getByRole('group', { name: 'État : Playing, mis en évidence' })).toBeVisible()
  })
})

test.describe('Diagram editor regions (Blocks/Diagrams/Diagram editor)', () => {
  test('moves a state to another region from the properties', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--concurrent-regions')
    await page.getByRole('group', { name: 'State: Muted', exact: true }).click()
    const region = page
      .getByRole('group', { name: 'Properties' })
      .getByRole('combobox', { name: 'Region' })
    await expect(region.getByRole('option')).toHaveText(['Region 1', 'Region 2', 'New region'])
    await expect(region).toHaveValue('1')
    await region.selectOption({ label: 'New region' })
    // Muted is alone in the third region now: there is no newer one to offer.
    await expect(region.getByRole('option')).toHaveText(['Region 1', 'Region 2', 'Region 3'])
    await expect(region).toHaveValue('2')
    const frame = page.getByRole('group', { name: /^Composite state: Active/ })
    await expect(frame.locator('.border-dashed')).toHaveCount(2)
  })

  test('a state outside a composite has no region to choose', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--concurrent-regions')
    await page.getByRole('group', { name: /^Composite state: Active/ }).click({
      position: { x: 12, y: 12 },
    })
    const properties = page.getByRole('group', { name: 'Properties' })
    await expect(properties.getByRole('textbox', { name: 'Name' })).toHaveValue('Active')
    await expect(properties.getByRole('combobox', { name: 'Region' })).toHaveCount(0)
  })
})
