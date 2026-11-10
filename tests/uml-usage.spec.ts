// The diagram editor used the way people use it: dragging boxes, undoing, connecting by
// dragging a dot, selecting several, renaming in place, switching formats and views. Positions
// are read in the diagram's own coordinates, so a refit or a pan of the view doesn't count as a
// move. Runs on the built Storybook, in the dark theme.
import { expect, type Locator, type Page, test } from '@playwright/test'

import { allowClipboard, openStory } from './stories'

const EDITOR = 'blocks-diagrams-diagram-editor--default'
const open = (page: Page, id: string) => openStory(page, id, 'dark')
const status = (page: Page) => page.getByRole('status')
const source = (page: Page) => page.getByRole('textbox', { name: 'Source' })
const drawing = (page: Page) => page.getByRole('application', { name: /^Preview/ })
const classBox = (page: Page, name: string) =>
  page.getByRole('group', { name: new RegExp(`^Class: ${name}\\b`) })
const node = (page: Page, id: string) => page.locator(`.react-flow__node[data-id="${id}"]`)

/** Drags an element by its header with the mouse, in a few steps as a hand would. */
async function drag(page: Page, target: Locator, by: { x: number; y: number }) {
  const box = await target.boundingBox()
  if (!box) throw new Error('The element to drag is not on screen.')
  const from = { x: box.x + box.width / 2, y: box.y + 12 }
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await page.mouse.move(from.x + by.x / 2, from.y + by.y / 2, { steps: 5 })
  await page.mouse.move(from.x + by.x, from.y + by.y, { steps: 5 })
  await page.mouse.up()
}

/** Where an element sits in the diagram's own coordinates (React Flow's node transform). */
function place(target: Locator) {
  return target.evaluate((el) => {
    const wrapper = el.closest<HTMLElement>('.react-flow__node') ?? (el as HTMLElement)
    // Firefox writes `translate(86px)` when y is 0.
    const m = /translate\(([-\d.]+)px(?:,\s*([-\d.]+)px)?\)/.exec(wrapper.style.transform)
    return { x: Math.round(Number(m?.[1])), y: Math.round(Number(m?.[2] ?? 0)) }
  })
}

/** The whole source text (the editor only draws the lines on screen), through the clipboard. */
async function wholeSource(page: Page) {
  await allowClipboard(page)
  await source(page).click()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.press('ControlOrMeta+C')
  return page.evaluate(() => navigator.clipboard.readText())
}

/** True when the element's box lies inside the drawing's box. */
async function inView(page: Page, target: Locator) {
  const [outer, inner] = await Promise.all([drawing(page).boundingBox(), target.boundingBox()])
  if (!outer || !inner) return false
  return (
    inner.x >= outer.x - 1 &&
    inner.y >= outer.y - 1 &&
    inner.x + inner.width <= outer.x + outer.width + 1 &&
    inner.y + inner.height <= outer.y + outer.height + 1
  )
}

test.describe('Moving elements (Blocks/Diagrams/Diagram editor)', () => {
  test('a drag moves the class; Undo and Redo take it back and forth', async ({ page }) => {
    await open(page, EDITOR)
    const customer = classBox(page, 'Customer')
    const start = await place(customer)
    await drag(page, customer, { x: 80, y: 40 })
    await expect(status(page)).toHaveText('Moved · Class diagram, 7 elements')
    const moved = await place(customer)
    expect(moved).not.toEqual(start)
    await page.getByRole('button', { name: 'Undo' }).click()
    await expect.poll(() => place(customer)).toEqual(start)
    await page.getByRole('button', { name: 'Redo' }).click()
    await expect.poll(() => place(customer)).toEqual(moved)
  })

  test('two drags, two undos: back where it started', async ({ page }) => {
    await open(page, EDITOR)
    const customer = classBox(page, 'Customer')
    const start = await place(customer)
    await drag(page, customer, { x: 60, y: 0 })
    await drag(page, customer, { x: 0, y: 60 })
    await page.keyboard.press('ControlOrMeta+Z')
    await page.keyboard.press('ControlOrMeta+Z')
    await expect.poll(() => place(customer)).toEqual(start)
  })

  test('the position is written in the Mermaid text, and survives typing', async ({ page }) => {
    await open(page, EDITOR)
    const customer = classBox(page, 'Customer')
    await drag(page, customer, { x: 80, y: 40 })
    const moved = await place(customer)
    expect(await wholeSource(page)).toMatch(
      new RegExp(`^%% coreloom-layout \\{"Customer":\\{"x":${String(moved.x)},`, 'm'),
    )
    await page.keyboard.press('ControlOrMeta+End')
    await page.keyboard.type('\n  class Extra')
    await expect(classBox(page, 'Extra')).toBeVisible()
    await expect.poll(() => place(customer)).toEqual(moved)
  })

  test('switching to PlantUML, then JSON, keeps the position', async ({ page }) => {
    await open(page, EDITOR)
    const customer = classBox(page, 'Customer')
    await drag(page, customer, { x: 80, y: 40 })
    const moved = await place(customer)
    await page.getByRole('radio', { name: 'PlantUML' }).click()
    await expect(source(page)).toContainText('@startuml')
    await expect.poll(() => place(customer)).toEqual(moved)
    expect(await wholeSource(page)).toContain("' coreloom-layout {")
    await page.getByRole('radio', { name: 'JSON' }).click()
    await expect.poll(() => place(customer)).toEqual(moved)
    expect(await wholeSource(page)).toContain('"layout": {')
  })

  test('a deleted class comes back where it had been dragged', async ({ page }) => {
    await open(page, EDITOR)
    const customer = classBox(page, 'Customer')
    await drag(page, customer, { x: 80, y: 40 })
    const moved = await place(customer)
    await customer.click()
    await page.keyboard.press('Delete')
    await expect(customer).toHaveCount(0)
    // The shortcut is the drawing's: wait for focus to come back to it from the deleted class.
    await expect(drawing(page)).toBeFocused()
    await page.keyboard.press('ControlOrMeta+Z')
    await expect(customer).toBeVisible()
    await expect.poll(() => place(customer)).toEqual(moved)
  })

  test('renaming a dragged class keeps its position', async ({ page }) => {
    await open(page, EDITOR)
    const customer = classBox(page, 'Customer')
    await drag(page, customer, { x: 80, y: 40 })
    const moved = await place(customer)
    await customer.dblclick()
    await page.getByRole('textbox', { name: 'Rename Customer' }).fill('Client')
    await page.keyboard.press('Enter')
    await expect(classBox(page, 'Client')).toBeVisible()
    await expect.poll(() => place(classBox(page, 'Client'))).toEqual(moved)
  })

  test('Ctrl-click selects two classes: a drag moves both, Delete removes both', async ({
    page,
  }) => {
    await open(page, EDITOR)
    const customer = classBox(page, 'Customer')
    const order = classBox(page, 'Order')
    await customer.click()
    // The key is Command where the browser says it is a Mac, which Playwright's Safari does on
    // any machine: 'ControlOrMeta' would follow the machine instead.
    const mac = await page.evaluate(() => navigator.userAgent.includes('Mac'))
    await order.click({ modifiers: [mac ? 'Meta' : 'Control'] })
    const before = await Promise.all([place(customer), place(order)])
    await drag(page, order, { x: 60, y: 0 })
    const after = await Promise.all([place(customer), place(order)])
    expect(after[0].x - before[0].x).toBeGreaterThan(30)
    expect(after[1].x - before[1].x).toBe(after[0].x - before[0].x)
    await page.keyboard.press('Delete')
    await expect(customer).toHaveCount(0)
    await expect(order).toHaveCount(0)
    await page.keyboard.press('ControlOrMeta+Z')
    await expect(customer).toBeVisible()
    await expect(order).toBeVisible()
  })

  test('read only: dragging pans the view and moves nothing', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--read-only')
    const customer = classBox(page, 'Customer')
    const start = await place(customer)
    await drag(page, customer, { x: 80, y: 40 })
    expect(await place(customer)).toEqual(start)
  })

  test('a class dragged far right is back in view after Fit to view', async ({ page }) => {
    await open(page, EDITOR)
    const customer = classBox(page, 'Customer')
    await drag(page, customer, { x: 400, y: 0 })
    await page.getByRole('button', { name: 'Fit to view' }).click()
    await expect.poll(() => inView(page, customer)).toBe(true)
  })

  test('dragging a package moves what is inside it', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--package')
    const before = await Promise.all([place(node(page, 'web')), place(node(page, 'controller'))])
    const outside = await place(node(page, 'order'))
    await drag(page, node(page, 'web'), { x: 60, y: 30 })
    const after = await Promise.all([place(node(page, 'web')), place(node(page, 'controller'))])
    expect(after[0]).not.toEqual(before[0])
    expect(after[1].x - before[1].x).toBe(after[0].x - before[0].x)
    expect(after[1].y - before[1].y).toBe(after[0].y - before[0].y)
    expect(await place(node(page, 'order'))).toEqual(outside)
  })

  test('dragging a component carries its port', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--component')
    const frame = node(page, 'checkout')
    const port = node(page, 'orders')
    const before = await Promise.all([place(frame), place(port)])
    await drag(page, frame, { x: 60, y: 30 })
    const after = await Promise.all([place(frame), place(port)])
    expect(after[1].x - before[1].x).toBe(after[0].x - before[0].x)
    expect(after[1].y - before[1].y).toBe(after[0].y - before[0].y)
  })
})

test.describe('Editing on the drawing (Blocks/Diagrams/Diagram editor)', () => {
  test('connects two classes by dragging the dot of one onto the other', async ({ page }) => {
    await open(page, EDITOR)
    const from = classBox(page, 'LineItem')
    await from.hover()
    const dot = await from.locator('.react-flow__handle.source').boundingBox()
    const target = await classBox(page, 'Customer').boundingBox()
    if (!dot || !target) throw new Error('Nothing to connect.')
    await page.mouse.move(dot.x + dot.width / 2, dot.y + dot.height / 2)
    await page.mouse.down()
    await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, {
      steps: 10,
    })
    await page.mouse.up()
    await expect(status(page)).toHaveText('Relation added · Class diagram, 7 elements')
    expect(await wholeSource(page)).toMatch(/LineItem .*Customer/)
  })

  test('deletes a line from the keyboard', async ({ page }) => {
    await open(page, EDITOR)
    const lines = page.locator('.react-flow__edge')
    const count = await lines.count()
    await lines.first().focus()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Delete')
    await expect(status(page)).toHaveText('1 item deleted · Class diagram, 7 elements')
    await expect(lines).toHaveCount(count - 1)
  })

  test('double-click renames; Escape cancels and keeps focus on the class', async ({ page }) => {
    await open(page, EDITOR)
    const order = classBox(page, 'Order')
    await order.dblclick()
    const field = page.getByRole('textbox', { name: 'Rename Order' })
    await field.fill('Nope')
    await field.press('Escape')
    await expect(order).toBeFocused()
    await expect(classBox(page, 'Nope')).toHaveCount(0)
    // An empty name changes nothing either.
    await order.dblclick()
    await field.fill('')
    await field.press('Enter')
    await expect(order).toBeVisible()
  })

  test('Backspace and Delete inside the name field edit the name only', async ({ page }) => {
    await open(page, EDITOR)
    const order = classBox(page, 'Order')
    await order.dblclick()
    const field = page.getByRole('textbox', { name: 'Rename Order' })
    await field.press('End')
    await field.press('Backspace')
    await field.press('Delete')
    await expect(field).toHaveValue('Orde')
    await field.press('Escape')
    await expect(order).toBeVisible()
  })

  test('pasting twice puts each copy in its own place', async ({ page }) => {
    await open(page, EDITOR)
    await classBox(page, 'Customer').click()
    await page.keyboard.press('ControlOrMeta+C')
    await expect(status(page)).toContainText('copied')
    await page.keyboard.press('ControlOrMeta+V')
    await expect(status(page)).toContainText('8 elements')
    await page.keyboard.press('ControlOrMeta+V')
    await expect(status(page)).toContainText('9 elements')
    const copies = page.getByRole('group', { name: /^Class: Customer/ })
    await expect(copies).toHaveCount(3)
    const places = await Promise.all([0, 1, 2].map((i) => place(copies.nth(i))))
    expect(new Set(places.map((p) => `${String(p.x)},${String(p.y)}`)).size).toBe(3)
  })

  test('zoomed in, a class added from the toolbar shows in the drawing', async ({ page }) => {
    await open(page, EDITOR)
    for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Zoom in' }).click()
    const tools = page.getByRole('toolbar', { name: 'Drawing tools' })
    await tools.getByRole('button', { name: 'Add', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Class', exact: true }).click()
    await page.getByRole('textbox', { name: 'Name' }).fill('Zed')
    await page.keyboard.press('Enter')
    await expect.poll(() => inView(page, classBox(page, 'Zed'))).toBe(true)
  })
})

test.describe('Moving elements in the workspace (Blocks/Diagrams/Diagram workspace)', () => {
  test('a dragged class keeps its place after opening another view and back', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-workspace--default')
    const views = page.getByRole('navigation', { name: 'Views' })
    const customer = classBox(page, 'Customer')
    await drag(page, customer, { x: 80, y: 40 })
    const moved = await place(customer)
    await views.getByRole('button', { name: 'Checkout', exact: true }).click()
    await expect(customer).toHaveCount(0)
    await views.getByRole('button', { name: 'Orders', exact: true }).click()
    await expect(customer).toBeVisible()
    await expect.poll(() => place(customer)).toEqual(moved)
  })
})
