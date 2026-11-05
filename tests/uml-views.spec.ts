// UML diagram thumbnails and full screen, and the diagram editor's views, actions and read-only
// mode. Runs on the built Storybook, in the dark theme.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test.describe('UML diagram preview and full screen (Components/Diagrams/UML diagram)', () => {
  test('a preview is one named image with nothing to focus inside', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--preview')
    await expect(page.getByRole('img', { name: 'Orders: classes' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Checkout: sequence' })).toBeVisible()
    await expect(page.getByRole('application')).toHaveCount(0)
    await expect(page.getByRole('region', { name: 'Sequence diagram' })).toHaveCount(0)
    await expect(page.getByRole('button')).toHaveCount(0)
    const focusable = page.locator('[data-slot="uml-diagram"] [tabindex="0"]')
    await expect(focusable).toHaveCount(0)
  })

  test('a preview without a label is named by its kind', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--french-preview', 'fr')
    await expect(page.getByRole('img', { name: 'Diagramme de classes' })).toBeVisible()
  })

  test('shows the diagram full screen and gives focus back to the button', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--class')
    await page.getByRole('button', { name: 'Full screen' }).click()
    const leave = page.getByRole('button', { name: 'Exit full screen' })
    await expect(leave).toHaveAttribute('aria-pressed', 'true')
    await expect
      .poll(() => page.evaluate(() => document.fullscreenElement?.getAttribute('data-slot')))
      .toBe('uml-diagram')
    await leave.click()
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull()
    await expect(page.getByRole('button', { name: 'Full screen' })).toBeFocused()
  })

  test('leaving full screen shows the whole diagram again', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--class')
    const frame = page.locator('[data-slot="uml-diagram"]')
    const nodes = frame.locator('.react-flow__node')
    // Every element's box lies inside the diagram's own box.
    const allInside = () =>
      frame.evaluate((el) => {
        const box = el.getBoundingClientRect()
        return [...el.querySelectorAll('.react-flow__node')].every((node) => {
          const r = node.getBoundingClientRect()
          return (
            r.left >= box.left - 1 &&
            r.right <= box.right + 1 &&
            r.top >= box.top - 1 &&
            r.bottom <= box.bottom + 1
          )
        })
      })
    await expect(nodes.first()).toBeVisible()
    await expect.poll(allInside).toBe(true)
    await page.getByRole('button', { name: 'Full screen' }).click()
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).not.toBeNull()
    await page.getByRole('button', { name: 'Exit full screen' }).click()
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull()
    await expect.poll(allInside).toBe(true)
  })

  test('a sequence diagram has its own full screen button', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--sequence')
    await page.getByRole('button', { name: 'Full screen' }).click()
    await expect(page.getByRole('button', { name: 'Exit full screen' })).toBeVisible()
  })
})

test.describe('Diagram editor views and read only (Blocks/Diagrams/Diagram editor)', () => {
  const source = (page: Page) => page.getByRole('textbox', { name: 'Source' })

  test('switches between the text, the drawing and both', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--default')
    const view = page.getByRole('radiogroup', { name: 'View' })
    await view.getByRole('radio', { name: 'Drawing', exact: true }).click()
    await expect(source(page)).toHaveCount(0)
    await expect(page.getByRole('application', { name: /^Preview/ })).toBeVisible()
    await view.getByRole('radio', { name: 'Text', exact: true }).click()
    await expect(source(page)).toContainText('classDiagram')
    await expect(page.getByRole('application')).toHaveCount(0)
    await page.getByRole('button', { name: 'Download' }).click()
    await expect(page.getByRole('menuitem', { name: 'PNG image' })).toBeDisabled()
    await page.keyboard.press('Escape')
    await view.getByRole('radio', { name: 'Text and drawing' }).click()
    await expect(source(page)).toBeVisible()
    await expect(page.getByRole('application', { name: /^Preview/ })).toBeVisible()
  })

  test('read only: the text and tools are off, Copy, zoom and actions stay', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--read-only')
    await expect(source(page)).toHaveAttribute('aria-readonly', 'true')
    await expect(page.getByRole('status')).toHaveText('Read only · Class diagram, 7 elements')
    const tools = page.getByRole('toolbar', { name: 'Drawing tools' })
    await expect(tools.getByRole('button', { name: 'Add', exact: true })).toBeDisabled()
    await expect(tools.getByRole('button', { name: 'Connect' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'New diagram' })).toBeDisabled()
    await expect(page.getByRole('radio', { name: 'JSON' })).toBeDisabled()
    const file = page.getByRole('toolbar', { name: 'Text and file' })
    await expect(file.getByRole('button', { name: 'Copy' })).toBeEnabled()
    await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Full screen' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Arrange automatically' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Share' })).toBeVisible()
    // Selecting still works, but the properties can't change anything.
    await page.getByRole('group', { name: /^Class: Customer/ }).click()
    const properties = page.getByRole('group', { name: 'Properties' })
    await expect(properties.getByRole('textbox', { name: 'Name' })).not.toBeEditable()
    await page.keyboard.press('Delete')
    await expect(page.getByRole('group', { name: /^Class: Customer/ })).toBeVisible()
  })
})
