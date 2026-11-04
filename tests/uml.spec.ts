// UML diagrams and the diagram editor: elements and relations named for screen readers, the
// sequence steps as a list, dragging and arranging, problems by line, switching Mermaid ↔ JSON and
// templates. Runs on the built Storybook, in the dark theme.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test.describe('UML diagram (Components/Diagrams/UML diagram)', () => {
  test('names each class and each relation', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--class')
    const canvas = page.getByRole('application', { name: 'Class diagram' })
    await expect(
      canvas.getByRole('group', { name: /^Class: Order, «entity», 2 attributes, 2 methods/ }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('group', { name: 'Class: Payment, «abstract», 1 attribute, 1 method' }),
    ).toBeVisible()
    await expect(page.getByLabel('CardPayment inherits from Payment')).toHaveCount(1)
    await expect(page.getByLabel('LineItem is part of Order (1..*)')).toHaveCount(1)
    await expect(page.getByLabel('Customer is associated with Order: places (1 – *)')).toHaveCount(
      1,
    )
  })

  test('says C4 elements and relations in French', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--french', 'fr')
    await expect(page.getByRole('application', { name: 'Diagramme C4' })).toBeVisible()
    await expect(
      page.getByRole('group', { name: /^Conteneur : Database, PostgreSQL, Base de données/ }),
    ).toBeVisible()
    await expect(page.getByLabel('API utilise Database : Reads and writes, SQL')).toHaveCount(1)
  })

  test('gives a sequence diagram’s steps as a list, blocks nested', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--sequence')
    const region = page.getByRole('region', { name: 'Sequence diagram' })
    await expect(region).toBeVisible()
    const steps = region.getByRole('list').first()
    await expect(steps.getByRole('listitem').first()).toHaveText('Shopper to Web app, call: Pay')
    await expect(region.getByText('Payments to API, reply: 402 Payment required')).toBeAttached()
    await expect(region.getByText(/^Alternative \[card accepted\]/)).toBeAttached()
  })

  test('moves a selected element with the keyboard, and Arrange puts it back', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--editable')
    const review = page.getByRole('group', { name: 'State: In review' })
    const before = await review.boundingBox()
    await review.focus()
    await page.keyboard.press('Enter')
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight')
    await expect
      .poll(async () => (await review.boundingBox())?.x)
      .toBeGreaterThan((before?.x ?? 0) + 4)
    await page.getByRole('button', { name: 'Arrange automatically' }).click()
    await expect.poll(async () => (await review.boundingBox())?.x).toBeCloseTo(before?.x ?? 0, 0)
  })
})

test.describe('Diagram editor (Blocks/Diagrams/Diagram editor)', () => {
  test('lists problems by line and still draws the rest', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--with-problems')
    await expect(page.getByRole('status')).toHaveText('3 problems')
    await expect(page.getByText('Line 4 · This line wasn’t understood.')).toBeVisible()
    await expect(page.getByText('Line 6 · This block is never closed.')).toBeVisible()
    await expect(page.getByRole('group', { name: 'Class: Customer' })).toBeVisible()
  })

  test('switches to JSON and back without losing the diagram', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--default')
    await expect(page.getByRole('status')).toHaveText('Class diagram, 7 elements')
    await page.getByRole('radio', { name: 'JSON' }).click()
    const editor = page.getByRole('textbox', { name: 'Source' })
    await expect(editor).toContainText('"kind": "class"')
    await expect(page.getByRole('status')).toHaveText('Class diagram, 7 elements')
    await page.getByRole('radio', { name: 'Mermaid' }).click()
    await expect(editor).toContainText('classDiagram')
  })

  test('starts a new diagram from a template', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--default')
    await page.getByRole('button', { name: 'New diagram' }).click()
    await page.getByRole('menuitem', { name: 'Sequence diagram' }).click()
    await expect(page.getByRole('status')).toHaveText('Sequence diagram, 2 elements')
    await expect(page.getByRole('region', { name: 'Sequence diagram' })).toBeVisible()
  })

  test('says when the text isn’t a diagram type it reads', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--unknown-type')
    await expect(page.getByRole('status')).toHaveText('1 problem')
    await expect(
      page.getByText(/Line 1 · This isn’t a diagram type the editor reads/),
    ).toBeVisible()
    await expect(page.getByText('Nothing to draw yet.')).toBeVisible()
  })
})

test.describe('Diagram editor tools (Blocks/Diagrams/Diagram editor)', () => {
  test('adds a class from the toolbar and names it in the properties', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--default')
    const tools = page.getByRole('toolbar', { name: 'Drawing tools' })
    await tools.getByRole('button', { name: 'Add', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Interface' }).click()
    const name = page.getByRole('textbox', { name: 'Name' })
    await expect(name).toBeFocused()
    await expect(name).toHaveValue('Interface')
    await name.fill('Billing')
    await name.press('Enter')
    await expect(page.getByRole('status')).toHaveText('Change applied · Class diagram, 8 elements')
    await expect(page.getByRole('group', { name: /^Class: Billing, «interface»/ })).toBeVisible()
    await expect(name).toBeFocused()
  })

  test('connects two classes with the form, then changes the line’s kind', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--default')
    await page.getByRole('button', { name: 'Connect' }).click()
    await page.getByRole('combobox', { name: 'Kind' }).selectOption({ label: 'Inheritance' })
    await page.getByRole('combobox', { name: 'From' }).selectOption('LineItem')
    await page.getByRole('combobox', { name: 'To' }).selectOption('Customer')
    await page.getByRole('button', { name: 'Connect' }).last().click()
    await expect(page.getByLabel('LineItem inherits from Customer')).toHaveCount(1)
    const properties = page.getByRole('group', { name: 'Properties' })
    await expect(properties.getByText('LineItem to Customer')).toBeVisible()
    await properties.getByRole('combobox', { name: 'Kind' }).selectOption({ label: 'Dependency' })
    await expect(page.getByLabel('LineItem depends on Customer')).toHaveCount(1)
  })

  test('deletes the selection, keeps focus on the drawing, and undoes it', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--default')
    const customer = page.getByRole('group', { name: /^Class: Customer/ })
    await customer.click()
    await page.getByRole('button', { name: 'Delete' }).click()
    await expect(customer).toHaveCount(0)
    await expect(page.getByRole('status')).toHaveText('1 item deleted · Class diagram, 6 elements')
    await expect(page.getByRole('application', { name: /^Preview/ })).toBeFocused()
    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(customer).toBeVisible()
    await page.keyboard.press('ControlOrMeta+Shift+Z')
    await expect(customer).toHaveCount(0)
  })

  test('keeps the tools off while the text has problems', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--with-problems')
    const tools = page.getByRole('toolbar', { name: 'Drawing tools' })
    await expect(tools.getByRole('button', { name: 'Add', exact: true })).toBeDisabled()
    await expect(
      page.getByText('Fix the problems in the text to edit with the tools.'),
    ).toBeVisible()
  })
})
