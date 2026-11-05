// What a person does with the UML editor from start to end: starts every kind of diagram, adds
// each element its toolbar offers, names things the way people do, switches between Mermaid,
// PlantUML and JSON, drags elements in the workspace and moves between views. Each journey checks
// that nothing is lost on the way: the element count, the names, the lines, the focus. Runs on
// the built Storybook.
import { expect, type Locator, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const EDITOR = 'blocks-diagrams-diagram-editor--default'
const WORKSPACE = 'blocks-diagrams-diagram-workspace--default'

const KINDS = [
  'Class diagram',
  'Sequence diagram',
  'State diagram',
  'Entity–relationship diagram',
  'C4 diagram',
  'Use case diagram',
  'Activity diagram',
  'Deployment diagram',
  'Component diagram',
  'Package diagram',
] as const

const FORMATS = ['Mermaid', 'PlantUML', 'JSON'] as const

/** `text` as a regular expression that matches it literally. */
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const status = (page: Page) => page.getByRole('status').filter({ hasText: /diagram|problem/ })
const tools = (page: Page) => page.getByRole('toolbar', { name: 'Drawing tools' })

async function startNew(page: Page, kind: string) {
  await page.getByRole('button', { name: 'New diagram' }).click()
  await page.getByRole('menuitem', { name: kind, exact: true }).click()
}

/** The formats this diagram can be written in (the others are off). */
async function writableFormats(page: Page) {
  const out: string[] = []
  for (const name of FORMATS)
    if (await page.getByRole('radio', { name }).isEnabled()) out.push(name)
  return out
}

/** Clicks each format in turn and checks the status line says the same thing every time. */
async function expectSameInEveryFormat(page: Page, expected: RegExp | string) {
  for (const name of [...(await writableFormats(page)), 'JSON']) {
    await page.getByRole('radio', { name }).click()
    await expect(page.getByRole('radio', { name })).toHaveAttribute('aria-checked', 'true')
    await expect(status(page), `in ${name}`).toHaveText(expected)
  }
}

/** Drags an element by its top with the mouse, in small steps as a hand would. */
async function drag(page: Page, target: Locator, by: { x: number; y: number }) {
  const box = await target.boundingBox()
  if (!box) throw new Error('The element to drag is not on screen.')
  const from = { x: box.x + box.width / 2, y: box.y + 12 }
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await page.mouse.move(from.x + by.x, from.y + by.y, { steps: 12 })
  await page.mouse.up()
}

test.describe('Every kind of diagram, every format (Blocks/Diagrams/Diagram editor)', () => {
  for (const kind of KINDS)
    test(`a new ${kind.toLowerCase()} reads the same in each format it can be written in`, async ({
      page,
    }) => {
      await openStory(page, EDITOR, 'dark')
      await startNew(page, kind)
      const start = (await status(page).textContent()) ?? ''
      expect(start).toMatch(new RegExp(`^${kind}, \\d+ elements$`))
      await expectSameInEveryFormat(page, start)
    })

  test('the entity–relationship template in PlantUML: entities without attributes read', async ({
    page,
  }) => {
    await openStory(page, EDITOR, 'dark')
    await page.getByRole('radio', { name: 'PlantUML' }).click()
    await startNew(page, 'Entity–relationship diagram')
    await expect(status(page)).toHaveText('Entity–relationship diagram, 2 elements')
    // With no problem, the tools stay on.
    await expect(tools(page).getByRole('button', { name: 'Add', exact: true })).toBeEnabled()
  })
})

test.describe('Adding every element (Blocks/Diagrams/Diagram editor)', () => {
  for (const kind of KINDS)
    test(`each element a ${kind.toLowerCase()} offers is added, and survives the formats`, async ({
      page,
    }) => {
      test.slow()
      await openStory(page, EDITOR, 'dark')
      await startNew(page, kind)
      const add = tools(page).getByRole('button', { name: 'Add', exact: true })
      await add.click()
      const entries = await page.getByRole('menuitem').allTextContents()
      await page.keyboard.press('Escape')
      for (const entry of entries) {
        await add.click()
        await page.getByRole('menuitem', { name: entry, exact: true }).click()
        await expect(status(page)).toHaveText(new RegExp(`^${entry} added · ${kind}`))
        // Focus lands on what was added (its name or its text), never on the page.
        await expect(page.locator('body')).not.toBeFocused()
      }
      const after = (await status(page).textContent())?.replace(/^.* · /, '') ?? ''
      await expectSameInEveryFormat(page, new RegExp(`${after}$`))
    })

  test('a new note takes focus in its text box, ready to type', async ({ page }) => {
    await openStory(page, EDITOR, 'dark')
    await tools(page).getByRole('button', { name: 'Add', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Note', exact: true }).click()
    const text = page.getByRole('textbox', { name: 'Text' })
    await expect(text).toBeFocused()
    await page.keyboard.type('Paid within 30 days')
    await text.blur()
    await expect(page.getByRole('group', { name: /Paid within 30 days/ })).toBeVisible()
  })
})

test.describe('Names people type (Blocks/Diagrams/Diagram editor)', () => {
  const NAMES = ['Order #42 (v2)', 'Prix : 10 € {TTC}', 'Say "hi"'] as const

  for (const name of NAMES)
    test(`a class named ${name} keeps its name through PlantUML and JSON`, async ({ page }) => {
      await openStory(page, EDITOR, 'dark')
      await page.getByRole('group', { name: /^Class: Customer\b/ }).click()
      const field = page.getByRole('textbox', { name: 'Name' })
      await field.fill(name)
      await field.press('Enter')
      await expect(status(page)).toHaveText(/Class diagram, 7 elements$/)
      for (const format of ['JSON', 'Mermaid', 'PlantUML'] as const) {
        await page.getByRole('radio', { name: format }).click()
        await expect(status(page), `in ${format}`).toHaveText('Class diagram, 7 elements')
        // PlantUML has no quote inside a quoted name: it keeps the words with ' instead.
        const shown = format === 'PlantUML' ? name.replaceAll('"', "'") : name
        await expect(
          page.getByRole('group', { name: new RegExp(`^Class: ${escape(shown)}`) }),
          `in ${format}`,
        ).toBeVisible()
      }
    })

  test('an action named with braces and a guard with a pipe stay readable', async ({ page }) => {
    await openStory(page, EDITOR, 'dark')
    await startNew(page, 'Activity diagram')
    await page.getByRole('group', { name: /^Action: Fill the cart/ }).click()
    const field = page.getByRole('textbox', { name: 'Name' })
    await field.fill('Fill the cart {max 10} (v2)')
    await field.press('Enter')
    await expect(status(page)).toHaveText(/Activity diagram, 5 elements$/)
    await page.getByRole('radio', { name: 'JSON' }).click()
    await page.getByRole('radio', { name: 'Mermaid' }).click()
    await expect(status(page)).toHaveText('Activity diagram, 5 elements')
    await expect(
      page.getByRole('group', { name: /^Action: Fill the cart \{max 10\} \(v2\)/ }),
    ).toBeVisible()
  })
})

test.describe('Dragging and the lines (Blocks/Diagrams/Diagram workspace)', () => {
  test('lines stay drawn while an element is dragged, and after', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await openStory(page, WORKSPACE, 'dark')
    await page.getByRole('button', { name: 'Add a diagram' }).click()
    await page.getByRole('menuitem', { name: 'Use case diagram' }).click()
    const lines = page.locator('.react-flow__edge')
    await expect(lines).toHaveCount(2)
    // Count every line React Flow takes out of the page during the drag: a blink is one.
    await page.evaluate(() => {
      const w = window as Window & { removedLines?: number }
      w.removedLines = 0
      new MutationObserver((records) => {
        for (const r of records)
          for (const n of r.removedNodes)
            if (n instanceof Element && n.matches('.react-flow__edge, .react-flow__edge *'))
              w.removedLines = (w.removedLines ?? 0) + 1
      }).observe(document.body, { childList: true, subtree: true })
    })
    for (const name of ['Customer', 'Place an order', 'Pay']) {
      await drag(page, page.locator('.react-flow__node', { hasText: name }).first(), {
        x: 40,
        y: 60,
      })
      await expect(status(page)).toHaveText('Moved · Use case diagram, 4 elements')
    }
    await expect(lines).toHaveCount(2)
    expect(
      await page.evaluate(() => (window as Window & { removedLines?: number }).removedLines),
    ).toBe(0)
  })
})

test.describe('Moving between views (Blocks/Diagrams/Diagram workspace)', () => {
  test('an element added in one view is still there after opening another and back', async ({
    page,
  }) => {
    await openStory(page, WORKSPACE, 'dark')
    await tools(page).getByRole('button', { name: 'Add', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Class', exact: true }).click()
    await expect(status(page)).toHaveText(/Class diagram, 8 elements$/)
    await page.getByRole('button', { name: 'Checkout', exact: true }).click()
    await expect(status(page)).toHaveText('Sequence diagram, 4 elements')
    await page.getByRole('button', { name: 'Orders', exact: true }).click()
    await expect(status(page)).toHaveText('Class diagram, 8 elements')
  })

  test('each view keeps the format it was switched to', async ({ page }) => {
    await openStory(page, WORKSPACE, 'dark')
    await page.getByRole('radio', { name: 'JSON' }).click()
    await page.getByRole('button', { name: 'Checkout', exact: true }).click()
    await expect(page.getByRole('radio', { name: 'Mermaid' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await page.getByRole('button', { name: 'Orders', exact: true }).click()
    await expect(page.getByRole('radio', { name: 'JSON' })).toHaveAttribute('aria-checked', 'true')
    await expect(status(page)).toHaveText('Class diagram, 7 elements')
  })

  test('a new view of each kind opens with no problem', async ({ page }) => {
    test.slow()
    await openStory(page, WORKSPACE, 'dark')
    for (const kind of KINDS) {
      await page.getByRole('button', { name: 'Add a diagram' }).click()
      await page.getByRole('menuitem', { name: kind, exact: true }).click()
      await expect(status(page), kind).toHaveText(new RegExp(`^${kind}, \\d+ elements$`))
    }
  })
})
