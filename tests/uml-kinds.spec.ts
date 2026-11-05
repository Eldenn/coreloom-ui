// The newer diagram kinds (use case, activity, deployment, component, package), PlantUML in the
// diagram editor, and Mermaid or PlantUML blocks in a Markdown answer drawn as diagrams. Runs on
// the built Storybook, in the dark theme.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test.describe('Use case, activity and deployment diagrams (Components/Diagrams/UML diagram)', () => {
  test('names actors, use cases and «include» / «extend»', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--use-case')
    const canvas = page.getByRole('application', { name: 'Use case diagram' })
    await expect(canvas.getByRole('group', { name: 'Actor: Customer' })).toBeVisible()
    await expect(canvas.getByRole('group', { name: 'System: Online shop' })).toBeVisible()
    await expect(canvas.getByRole('group', { name: 'Use case: Place an order' })).toBeVisible()
    await expect(page.getByLabel('Place an order includes Pay: «include»')).toHaveCount(1)
    await expect(page.getByLabel('Apply a coupon extends Place an order: «extend»')).toHaveCount(1)
  })

  test('names an activity’s nodes and its guards', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--activity')
    const canvas = page.getByRole('application', { name: 'Activity diagram' })
    await expect(canvas.getByRole('group', { name: 'Start', exact: true })).toBeVisible()
    await expect(canvas.getByRole('group', { name: 'Decision: Paid?' })).toBeVisible()
    await expect(canvas.getByRole('group', { name: 'Partition: Warehouse' })).toBeVisible()
    await expect(page.getByLabel('From Paid? to Fork: [yes]')).toHaveCount(1)
  })

  test('names deployment nodes once, with a stereotype only when it adds something', async ({
    page,
  }) => {
    await open(page, 'components-diagrams-uml-diagram--deployment')
    const canvas = page.getByRole('application', { name: 'Deployment diagram' })
    await expect(canvas.getByRole('group', { name: 'Device: Phone', exact: true })).toBeVisible()
    await expect(
      canvas.getByRole('group', { name: 'Execution environment: App server', exact: true }),
    ).toBeVisible()
    await expect(page.getByLabel('Worker depends on PostgreSQL')).toHaveCount(1)
  })

  test('says use cases in French', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--french-use-case', 'fr')
    await expect(
      page.getByRole('application', { name: 'Diagramme de cas d’utilisation' }),
    ).toBeVisible()
  })
})

test.describe('Component and package diagrams (Components/Diagrams/UML diagram)', () => {
  test('names components, ports and interfaces, and what each line means', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--component')
    const canvas = page.getByRole('application', { name: 'Component diagram' })
    await expect(
      canvas.getByRole('group', { name: 'Component: Checkout, «subsystem»', exact: true }),
    ).toBeVisible()
    await expect(canvas.getByRole('group', { name: 'Component: Cart', exact: true })).toBeVisible()
    await expect(canvas.getByRole('group', { name: 'Port: orders', exact: true })).toBeVisible()
    await expect(
      canvas.getByRole('group', { name: 'Interface: Payments', exact: true }),
    ).toBeVisible()
    await expect(page.getByLabel('Payment service provides Payments')).toHaveCount(1)
    await expect(page.getByLabel('Checkout requires Payments')).toHaveCount(1)
    await expect(page.getByLabel('Web shop is wired to orders')).toHaveCount(1)
    await expect(page.getByLabel('orders delegates to Cart: «delegate»')).toHaveCount(1)
  })

  test('puts a port on its component’s edge', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--component')
    const canvas = page.getByRole('application', { name: 'Component diagram' })
    const port = await canvas.getByRole('group', { name: 'Port: orders' }).boundingBox()
    const frame = await canvas
      .getByRole('group', { name: 'Component: Checkout, «subsystem»' })
      .boundingBox()
    if (!port || !frame) throw new Error('not drawn')
    // The square straddles the frame's left side.
    expect(port.x).toBeLessThan(frame.x)
    expect(port.x + port.width).toBeGreaterThan(frame.x)
  })

  test('names packages and «import» / «merge»', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--package')
    const canvas = page.getByRole('application', { name: 'Package diagram' })
    await expect(canvas.getByRole('group', { name: 'Package: Domain, «model»' })).toBeVisible()
    await expect(canvas.getByRole('group', { name: 'Package: Shared kernel' })).toBeVisible()
    await expect(
      canvas.getByRole('group', { name: 'Interface: OrderRepository', exact: true }),
    ).toBeVisible()
    await expect(page.getByLabel('Web imports Domain: «import»')).toHaveCount(1)
    await expect(page.getByLabel('Domain merges Shared kernel: «merge»')).toHaveCount(1)
  })

  test('says components in French', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--french-component', 'fr')
    await expect(page.getByRole('application', { name: 'Diagramme de composants' })).toBeVisible()
    await expect(page.getByLabel('Checkout requiert Payments')).toHaveCount(1)
  })
})

test.describe('PlantUML in the diagram editor (Blocks/Diagrams/Diagram editor)', () => {
  test('a component diagram: Mermaid off, its own tools, a line of the kind picked', async ({
    page,
  }) => {
    await open(page, 'blocks-diagrams-diagram-editor--component')
    await expect(page.getByRole('status')).toHaveText('Component diagram, 8 elements')
    await expect(page.getByRole('radio', { name: 'Mermaid' })).toBeDisabled()
    await page.getByRole('button', { name: 'Add: Port' }).click()
    const name = page.getByRole('group', { name: 'Properties' }).getByRole('textbox', {
      name: 'Name',
    })
    await expect(name).toBeFocused()
    await name.fill('events')
    await name.press('Enter')
    await expect(page.getByRole('textbox', { name: 'Source' })).toContainText('port "events"')
  })

  test('a package diagram reads back the same through JSON', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--package')
    const status = page.getByRole('status')
    await expect(status).toHaveText('Package diagram, 10 elements')
    await page.getByRole('radio', { name: 'JSON' }).click()
    await expect(page.getByRole('textbox', { name: 'Source' })).toContainText('"kind": "package"')
    await page.getByRole('radio', { name: 'PlantUML' }).click()
    await expect(page.getByRole('textbox', { name: 'Source' })).toContainText('<<import>>')
    await expect(status).toHaveText('Package diagram, 10 elements')
  })

  test('reads PlantUML and keeps Mermaid off for a use case diagram', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--plant-uml')
    await expect(page.getByRole('status')).toHaveText('Use case diagram, 9 elements')
    await expect(page.getByRole('radio', { name: 'PlantUML' })).toBeChecked()
    await expect(page.getByRole('radio', { name: 'Mermaid' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Add: Actor' })).toBeVisible()
  })

  test('switches PlantUML to JSON and back without losing the diagram', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--deployment')
    const status = page.getByRole('status')
    await expect(status).toHaveText('Deployment diagram, 7 elements')
    await page.getByRole('radio', { name: 'JSON' }).click()
    await expect(page.getByRole('textbox', { name: 'Source' })).toContainText(
      '"kind": "deployment"',
    )
    await page.getByRole('radio', { name: 'PlantUML' }).click()
    await expect(page.getByRole('textbox', { name: 'Source' })).toContainText('@startuml')
    await expect(status).toHaveText('Deployment diagram, 7 elements')
  })

  test('adds an action to a flowchart and writes it into the text', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-editor--activity')
    await page.getByRole('button', { name: 'Add: Action' }).click()
    const name = page.getByRole('group', { name: 'Properties' }).getByRole('textbox', {
      name: 'Name',
    })
    await expect(name).toBeFocused()
    await name.fill('Wrap the gift')
    await name.press('Enter')
    await expect(page.getByRole('textbox', { name: 'Source' })).toContainText('Wrap the gift')
    await expect(page.getByRole('group', { name: 'Action: Wrap the gift' })).toBeVisible()
  })
})

test.describe('Diagram code block (Components/Diagrams/Diagram code block)', () => {
  test('draws a mermaid block, and shows its source on demand', async ({ page }) => {
    await open(page, 'components-diagrams-diagram-code-block--default')
    await expect(page.getByRole('region', { name: 'Sequence diagram' })).toBeVisible()
    await page.getByRole('radio', { name: 'Source' }).click()
    await expect(page.getByRole('region', { name: 'Sequence diagram' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Copy code' })).toBeVisible()
    await expect(page.getByText('sequenceDiagram')).toBeVisible()
  })

  test('draws a plantuml block', async ({ page }) => {
    await open(page, 'components-diagrams-diagram-code-block--plant-uml')
    await expect(page.getByRole('application', { name: 'Use case diagram' })).toBeVisible()
  })

  test('keeps the code while the answer streams', async ({ page }) => {
    await open(page, 'components-diagrams-diagram-code-block--streaming')
    await expect(page.getByRole('radiogroup', { name: 'Show as' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Copy code' })).toBeVisible()
  })

  test('says when a block can’t be drawn and shows it as written', async ({ page }) => {
    await open(page, 'components-diagrams-diagram-code-block--unreadable')
    await expect(
      page.getByText('This diagram couldn’t be drawn, so here is its text.'),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Copy code' })).toBeVisible()
  })

  test('labels the switch in French', async ({ page }) => {
    await open(page, 'components-diagrams-diagram-code-block--french', 'fr')
    await expect(page.getByRole('radiogroup', { name: 'Afficher en' })).toBeVisible()
  })
})
