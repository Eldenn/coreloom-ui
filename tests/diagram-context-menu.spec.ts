// The context menu of the diagram workspace and of a drawing: a right-click (or Shift+F10 on a
// focused target) on a view, an element, a member, a relation or a sequence step opens the
// component's own entries, then the app's, whose callback gets the target's type and label.
// Without `contextActions` no menu opens. Runs on the built Storybook, in the dark theme.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const WORKSPACE = 'blocks-diagrams-diagram-workspace--context-menu'
const ADD = 'Add to the assistant’s context'

const open = (page: Page, id: string) => openStory(page, id, 'dark')
const canvas = (page: Page) => page.getByRole('application', { name: /Class diagram/ })
const menu = (page: Page) => page.getByRole('menu')
const chips = (page: Page) =>
  page.getByRole('list', { name: 'Assistant’s context' }).getByRole('listitem')

/**
 * The key that adds a click to a canvas's selection. React Flow picks it from the platform the
 * browser reports, and Playwright's WebKit reports macOS on every machine.
 */
const also = (browserName: string) => (browserName === 'webkit' ? 'Meta' : 'ControlOrMeta')

/** Picks the app's entry of the open menu, and checks the chip it adds. */
async function addToContext(page: Page, type: string, label: string) {
  await menu(page).getByRole('menuitem', { name: ADD }).click()
  await expect(menu(page)).toHaveCount(0)
  const chip = chips(page).last()
  await expect(chip).toHaveAttribute('data-type', type)
  await expect(chip).toContainText(label)
}

test.describe('Diagram workspace context menu (Blocks/Diagrams/Diagram workspace)', () => {
  test('on a view: Rename, Delete, then the app’s entry', async ({ page }) => {
    await open(page, WORKSPACE)
    const views = page.getByRole('navigation', { name: 'Views' })
    await views.getByRole('button', { name: 'Checkout', exact: true }).click({ button: 'right' })
    await expect(menu(page)).toHaveAccessibleName('Checkout')
    await expect(menu(page).getByRole('menuitem')).toHaveText(['Rename', 'Delete', ADD])
    await addToContext(page, 'view', 'Checkout')
  })

  test('Delete on a view asks first, as the button does', async ({ page }) => {
    await open(page, WORKSPACE)
    const views = page.getByRole('navigation', { name: 'Views' })
    await views
      .getByRole('button', { name: 'Order states', exact: true })
      .click({ button: 'right' })
    await menu(page).getByRole('menuitem', { name: 'Delete' }).click()
    const ask = page.getByRole('alertdialog', { name: 'Delete “Order states”?' })
    await expect(ask).toBeVisible()
    await ask.getByRole('button', { name: 'Delete' }).click()
    await expect(views.getByRole('button', { name: 'Order states', exact: true })).toHaveCount(0)
  })

  test('on an element: Rename, Duplicate, Delete, then the app’s entry', async ({ page }) => {
    await open(page, WORKSPACE)
    const payment = canvas(page).getByRole('group', { name: /^Class: Payment/ })
    await payment.locator('p', { hasText: /^Payment$/ }).click({ button: 'right' })
    await expect(menu(page).getByRole('menuitem')).toHaveText([
      'Rename',
      'Duplicate',
      'Delete',
      ADD,
    ])
    await addToContext(page, 'element', 'Payment')
    // The right-click selected it (read once the menu is closed: an open menu hides the rest).
    await expect(payment).toHaveClass(/selected/)
  })

  test('on a member, its element and the member as written', async ({ page }) => {
    await open(page, WORKSPACE)
    const payment = canvas(page).getByRole('group', { name: /^Class: Payment/ })
    await payment.getByText('Money amount').click({ button: 'right' })
    await expect(menu(page).getByRole('menuitem')).toHaveText(['Delete', ADD])
    await addToContext(page, 'member', 'Payment.Money amount')
  })

  test('Delete on a member removes it', async ({ page }) => {
    await open(page, WORKSPACE)
    const payment = canvas(page).getByRole('group', { name: /^Class: Payment/ })
    await payment.getByText('Money amount').click({ button: 'right' })
    await menu(page).getByRole('menuitem', { name: 'Delete' }).click()
    await expect(payment.getByText('Money amount')).toHaveCount(0)
    await expect(payment.getByText(/^capture\(\)/)).toBeVisible()
  })

  test('on a relation from the keyboard, its ends and its label', async ({ page }) => {
    await open(page, WORKSPACE)
    const line = canvas(page).getByRole('group', { name: /places/ })
    await line.focus()
    await page.keyboard.press('Shift+F10')
    await expect(menu(page).getByRole('menuitem')).toHaveText(['Delete', ADD])
    await addToContext(page, 'relation', 'Customer → Order: places')
  })

  test('on a sequence step, the line a reader would write', async ({ page }) => {
    await open(page, WORKSPACE)
    await page
      .getByRole('navigation', { name: 'Views' })
      .getByRole('button', { name: 'Checkout', exact: true })
      .click()
    const drawing = page.getByRole('region', { name: 'Checkout' })
    await drawing.locator('svg').getByText('Charge card').click({ button: 'right' })
    await expect(menu(page).getByRole('menuitem')).toHaveText(['Delete', ADD])
    await addToContext(page, 'step', 'API -> Payments: Charge card')
  })

  test('Delete on an element removes it, and focus stays on the drawing', async ({ page }) => {
    await open(page, WORKSPACE)
    const card = canvas(page).getByRole('group', { name: /^Class: CardPayment/ })
    await card.focus()
    await page.keyboard.press('Shift+F10')
    await menu(page).getByRole('menuitem', { name: 'Delete' }).click()
    await expect(card).toHaveCount(0)
    await expect(canvas(page)).toBeFocused()
  })

  test('on one of several selected elements, the menu is about all of them', async ({
    page,
    browserName,
  }) => {
    await open(page, WORKSPACE)
    const title = (name: string) =>
      canvas(page)
        .getByRole('group', { name: new RegExp(`^Class: ${name}`) })
        .locator('p', { hasText: new RegExp(`^${name}$`) })
    await title('Payment').click()
    await title('CardPayment').click({ modifiers: [also(browserName)] })
    await title('Payment').click({ button: 'right' })
    await expect(menu(page)).toHaveAccessibleName('2 selected')
    const add = 'Add 2 to the assistant’s context'
    await expect(menu(page).getByRole('menuitem')).toHaveText(['Duplicate', 'Delete', add])
    await menu(page).getByRole('menuitem', { name: add }).click()
    await expect(chips(page)).toHaveText([/Payment/, /CardPayment/])
    // Both are still selected, and Delete takes both.
    await title('Payment').click({ button: 'right' })
    await menu(page).getByRole('menuitem', { name: 'Delete' }).click()
    await expect(canvas(page).getByRole('group', { name: /^Class: (Card)?Payment/ })).toHaveCount(0)
  })

  test('on one of several selected sequence steps, all of them', async ({ page }) => {
    await open(page, WORKSPACE)
    await page
      .getByRole('navigation', { name: 'Views' })
      .getByRole('button', { name: 'Checkout', exact: true })
      .click()
    const svg = page.getByRole('region', { name: 'Checkout' }).locator('svg')
    await svg.getByText('Charge card').click()
    await svg.getByText('POST /orders/42/pay').click({ modifiers: ['Shift'] })
    await svg.getByText('Charge card').click({ button: 'right' })
    await expect(menu(page)).toHaveAccessibleName('2 selected')
    await expect(menu(page).getByRole('menuitem')).toHaveText([
      'Duplicate',
      'Delete',
      'Add 2 to the assistant’s context',
    ])
    await menu(page)
      .getByRole('menuitem', { name: /^Add 2/ })
      .click()
    await expect(chips(page)).toHaveCount(2)
    await expect(chips(page).first()).toHaveAttribute('data-type', 'step')
  })

  test('a right-click outside a selection lets it go', async ({ page, browserName }) => {
    await open(page, WORKSPACE)
    const title = (name: string) =>
      canvas(page)
        .getByRole('group', { name: new RegExp(`^Class: ${name}`) })
        .locator('p', { hasText: new RegExp(`^${name}$`) })
    await title('Payment').click()
    await title('CardPayment').click({ modifiers: [also(browserName)] })
    await title('Customer').click({ button: 'right' })
    await expect(menu(page)).toHaveAccessibleName('Customer')
    await expect(menu(page).getByRole('menuitem')).toHaveText([
      'Rename',
      'Duplicate',
      'Delete',
      ADD,
    ])
  })

  test('Escape closes the menu and gives focus back to the element', async ({ page }) => {
    await open(page, WORKSPACE)
    const order = canvas(page).getByRole('group', { name: /^Class: Order,/ })
    await order.focus()
    await page.keyboard.press('Shift+F10')
    await expect(menu(page)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(menu(page)).toHaveCount(0)
    await expect(order).toBeFocused()
  })

  test('without contextActions, no menu opens', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-workspace--default')
    await canvas(page)
      .getByRole('group', { name: /^Class: Payment/ })
      .locator('p', { hasText: /^Payment$/ })
      .click({ button: 'right' })
    await page
      .getByRole('navigation', { name: 'Views' })
      .getByRole('button', { name: 'Checkout', exact: true })
      .click({ button: 'right' })
    await expect(menu(page)).toHaveCount(0)
  })
})

test.describe('UML diagram context menu (Components/Diagrams/UML diagram)', () => {
  test('a drawing to read offers the app’s entries only', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--context-menu')
    const drawing = page.getByRole('application', { name: /Class diagram/ })
    await drawing
      .getByRole('group', { name: /^Class: Customer/ })
      .getByText('placeOrder(cart) Order')
      .click({ button: 'right' })
    await expect(menu(page).getByRole('menuitem')).toHaveText(['Show its label'])
    await menu(page).getByRole('menuitem').click()
    await expect(page.getByRole('status')).toHaveText('member: Customer.placeOrder(cart) Order')
  })
})
