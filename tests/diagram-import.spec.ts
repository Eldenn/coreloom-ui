// Importing a diagram file: the editor's Import button and the workspace's "Import a file…". The
// file is picked through the browser's file chooser and read in the page. Runs on the built
// Storybook.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string) => openStory(page, id, 'dark', 'en')

interface PickedFile {
  name: string
  mimeType: string
  buffer: Buffer
}

const textFile = (name: string, text: string): PickedFile => ({
  name,
  mimeType: 'text/plain',
  buffer: Buffer.from(text),
})

const PLANTUML = `@startuml
actor Customer
usecase "Place order" as Place
Customer --> Place
@enduml
`

const MERMAID = `classDiagram
  class Invoice
  class Payment
  Invoice --> Payment
`

/** Clicks what opens the file chooser and picks `file` in it. */
async function pick(page: Page, opener: () => Promise<void>, file: PickedFile) {
  const chooser = page.waitForEvent('filechooser')
  await opener()
  await (await chooser).setFiles(file)
}

test.describe('Import in the diagram editor (Blocks/Diagrams/Diagram editor)', () => {
  const importButton = (page: Page) => page.getByRole('button', { name: 'Import' })

  test('a PlantUML file replaces the text and switches the format', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--default')
    await pick(page, () => importButton(page).click(), textFile('orders.puml', PLANTUML))
    await expect(page.getByRole('radio', { name: 'PlantUML' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await expect(page.getByRole('textbox', { name: 'Source' })).toContainText('Place order')
    await expect(page.getByRole('status').filter({ hasText: 'Imported orders.puml' })).toHaveText(
      /Use case diagram/,
    )
  })

  test('a .txt file takes its format from its first words', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--plant-uml')
    await pick(page, () => importButton(page).click(), textFile('billing.txt', MERMAID))
    await expect(page.getByRole('radio', { name: 'Mermaid' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await expect(page.getByRole('textbox', { name: 'Source' })).toContainText('Invoice')
  })

  test('a binary file is refused and the text stays', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--default')
    const source = page.getByRole('textbox', { name: 'Source' })
    const before = await source.textContent()
    await pick(page, () => importButton(page).click(), {
      name: 'logo.png',
      mimeType: 'image/png',
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x00, 0x0d, 0x0a]),
    })
    await expect(
      page.getByRole('status').filter({ hasText: 'logo.png can’t be read as text.' }),
    ).toBeVisible()
    await expect(source).toHaveText(before ?? '')
  })

  test('a file over 1 MB is refused', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--default')
    await pick(
      page,
      () => importButton(page).click(),
      textFile('huge.mmd', `classDiagram\n${'  class A\n'.repeat(120_000)}`),
    )
    await expect(
      page.getByRole('status').filter({ hasText: 'huge.mmd is too large: 1 MB at most.' }),
    ).toBeVisible()
  })

  test('read only, Import is off', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--read-only')
    await expect(importButton(page)).toBeDisabled()
  })
})

test.describe('Import in the diagram workspace (Blocks/Diagrams/Diagram workspace)', () => {
  const views = (page: Page) => page.getByRole('navigation', { name: 'Views' })
  const importItem = (page: Page) => async () => {
    await views(page).getByRole('button', { name: 'Add a diagram' }).click()
    await page.getByRole('menuitem', { name: 'Import a file…' }).click()
  }

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
  })

  test('a file becomes a new view named after it', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-workspace--default')
    await pick(page, importItem(page), textFile('use-cases.puml', PLANTUML))
    await expect(
      views(page).getByRole('button', { name: 'use-cases', exact: true }),
    ).toHaveAttribute('aria-current', 'true')
    await expect(page.getByRole('radio', { name: 'PlantUML' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await expect(page.getByRole('textbox', { name: 'Source' })).toContainText('Place order')
  })

  test('a file that can’t be read adds nothing and says why', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-workspace--default')
    await pick(page, importItem(page), {
      name: 'archive.zip',
      mimeType: 'application/zip',
      buffer: Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]),
    })
    await expect(views(page).getByRole('status')).toHaveText('archive.zip can’t be read as text.')
    await expect(views(page).locator('[data-view-id]')).toHaveCount(3)
  })
})
