// Node editor, workflow builder and agent builder: adding nodes from the list, connecting and
// disconnecting from the panel (the keyboard path), drawing a connection with the pointer, deleting
// and undoing, required settings, Run waiting on issues, and the LangGraph JSON round trip.
// Runs on the built Storybook, in the dark theme.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)
const canvas = (page: Page, name = 'Workflow') => page.getByRole('application', { name })
// A node is named "Name, kind, …".
const node = (page: Page, name: string, canvasName?: string) =>
  canvas(page, canvasName).getByRole('group', { name: new RegExp(`^${name}(,|$)`) })
const panel = (page: Page) => page.getByRole('complementary', { name: 'Node settings' })
const edges = (page: Page) => page.locator('.react-flow__edge')

test.describe('Node editor (Components/Workflow/Node editor)', () => {
  test('adds a node from the list after the selected one, connected to it', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--selected')
    await expect(edges(page)).toHaveCount(4)
    await page.getByRole('button', { name: 'Add node' }).click()
    await page.getByPlaceholder('Search nodes…').fill('wait')
    await page.keyboard.press('Enter')
    await expect(node(page, 'Wait')).toBeVisible()
    await expect(panel(page)).toContainText('Pauses before the next step.')
    await expect(
      panel(page).getByRole('listitem').filter({ hasText: 'Business email?' }),
    ).toBeVisible()
    await expect(edges(page)).toHaveCount(5)
    await expect(page.getByText('Wait added.')).toBeAttached()
  })

  test('connects and disconnects from the panel, and undo puts it back', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--selected')
    const p = panel(page)
    await p
      .getByRole('button', { name: 'Remove the connection from Business email? to Welcome email' })
      .click()
    await expect(edges(page)).toHaveCount(3)
    await expect(node(page, 'Welcome email')).toHaveAccessibleName(/1 issue/)

    await p.getByRole('combobox', { name: /“false” goes to/ }).click()
    await page.getByRole('option', { name: 'Welcome email' }).click()
    await expect(edges(page)).toHaveCount(4)
    await expect(p.getByRole('button', { name: /to Welcome email$/ })).toBeVisible()

    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(edges(page)).toHaveCount(3)
    await page.getByRole('button', { name: 'Redo' }).click()
    await expect(edges(page)).toHaveCount(4)
  })

  test('draws a connection from an output to an input with the pointer', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--default')
    await expect(edges(page)).toHaveCount(4)
    const from = node(page, 'Welcome email').locator('.react-flow__handle.source')
    const to = node(page, 'Tell sales').locator('.react-flow__handle.target')
    await from.hover()
    await page.mouse.down()
    const box = await to.boundingBox()
    if (!box) throw new Error('no target handle')
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 })
    await page.mouse.up()
    await expect(edges(page)).toHaveCount(5)
  })

  test('deletes the focused node with the keyboard; Ctrl+Z brings it back', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--default')
    const email = node(page, 'Welcome email')
    await email.focus()
    await page.keyboard.press('Enter')
    await expect(panel(page)).toContainText('Welcome email')
    await page.keyboard.press('Delete')
    await expect(email).toHaveCount(0)
    await expect(edges(page)).toHaveCount(3)
    // Focus doesn't fall to <body> with the node: it lands on "Add node", inside the editor.
    await expect(page.getByRole('button', { name: 'Add node' })).toBeFocused()
    await page.keyboard.press('ControlOrMeta+z')
    await expect(node(page, 'Welcome email')).toBeVisible()
    await expect(edges(page)).toHaveCount(4)
  })

  test('the panel deletes a node and focus stays in the editor', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--selected')
    await panel(page).getByRole('button', { name: 'Delete node' }).click()
    await expect(node(page, 'Business email?')).toHaveCount(0)
    await expect(panel(page)).toContainText('Select a node to configure it.')
    await expect(page.getByRole('button', { name: 'Add node' })).toBeFocused()
  })

  test('settings edit the node; a required one left empty is flagged', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--needs-attention')
    const p = panel(page)
    const to = p.getByRole('textbox', { name: /^To/ })
    await expect(to).toHaveAttribute('aria-invalid', 'true')
    await expect(to).toHaveAccessibleDescription('Required.')
    await to.fill('{{email}}')
    await expect(to).not.toHaveAttribute('aria-invalid')
    await p.getByRole('textbox', { name: 'Name' }).fill('Say hello')
    await expect(node(page, 'Say hello')).toBeVisible()
  })

  test('read-only: no list to add from, no editing in the panel', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--read-only')
    await expect(page.getByRole('button', { name: 'Add node' })).toHaveCount(0)
    await expect(panel(page).getByRole('textbox', { name: 'Name' })).toHaveAttribute('readonly', '')
    await expect(panel(page).getByRole('button', { name: 'Delete node' })).toHaveCount(0)
  })

  test('a run shows on the cards', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--failed')
    await expect(node(page, 'Enrich company')).toHaveAccessibleName(/Failed/)
    await expect(panel(page)).toContainText('Failed · 404 Not found')
  })

  test('French', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--french', 'fr')
    await expect(page.getByRole('button', { name: 'Ajouter un nœud' })).toBeVisible()
    await expect(page.getByRole('complementary', { name: 'Réglages du nœud' })).toContainText(
      '« true » va vers',
    )
  })
})

test.describe('Workflow builder (Blocks/Workflow/Workflow builder)', () => {
  test('Run waits until the flagged nodes are fixed', async ({ page }) => {
    await open(page, 'blocks-workflow-workflow-builder--needs-attention')
    const run = page.getByRole('button', { name: 'Run' })
    await expect(run).toBeDisabled()
    await expect(run).toHaveAccessibleDescription('Fix 3 nodes before running.')
  })

  test('Run reports each node; Save confirms', async ({ page }) => {
    await open(page, 'blocks-workflow-workflow-builder--default')
    await page.getByRole('button', { name: 'Run' }).click()
    await expect(node(page, 'Tell sales')).toHaveAccessibleName(/Done/, { timeout: 5000 })
    await expect(node(page, 'Welcome email')).toHaveAccessibleName(/Skipped/)
    await page.getByRole('textbox', { name: 'Workflow name' }).fill('Signups')
    await expect(page.getByRole('status').filter({ hasText: 'Unsaved changes' })).toBeVisible()
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible()
  })

  test('a failed save says so', async ({ page }) => {
    await open(page, 'blocks-workflow-workflow-builder--save-failed')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('status')).toContainText('Couldn’t save. Try again.')
  })
})

test.describe('Agent builder (Blocks/AI/Agent builder)', () => {
  const graph = 'Agent graph'

  test('a router has one output per route; removing a route drops its connection', async ({
    page,
  }) => {
    await open(page, 'blocks-ai-agent-builder--default')
    await node(page, 'Who’s next\\?', graph).click()
    const p = panel(page)
    await expect(p.getByText('“write” goes to')).toBeVisible()
    const before = await edges(page).count()
    await p.getByRole('button', { name: /Remove write/i }).click()
    await expect(p.getByText('“write” goes to')).toHaveCount(0)
    await expect(edges(page)).toHaveCount(before - 1)
  })

  test('the agent panel lists the {{variables}} in its instructions', async ({ page }) => {
    await open(page, 'blocks-ai-agent-builder--agent-selected')
    const instructions = panel(page).getByRole('textbox', { name: /^Instructions/ })
    await instructions.fill('Research {{topic}} for {{audience}}.')
    await expect(panel(page)).toContainText('Variables: topic, audience')
  })

  test('state fields: add one, then remove it', async ({ page }) => {
    await open(page, 'blocks-ai-agent-builder--default')
    await page.getByRole('button', { name: 'State' }).click()
    const dialog = page.getByRole('dialog', { name: 'State' })
    await expect(dialog.getByRole('textbox', { name: 'Name' })).toHaveCount(3)
    await dialog.getByRole('button', { name: 'Add a field' }).click()
    await expect(dialog.getByRole('textbox', { name: 'Name' }).last()).toBeFocused()
    await page.keyboard.type('x')
    await dialog.getByRole('button', { name: 'Remove fieldx' }).click()
    await expect(dialog.getByRole('textbox', { name: 'Name' })).toHaveCount(3)
  })

  test('LangGraph JSON: export shows the conditional edges, import rebuilds the graph', async ({
    page,
  }) => {
    await open(page, 'blocks-ai-agent-builder--default')
    await page.getByRole('button', { name: 'LangGraph JSON' }).click()
    const dialog = page.getByRole('dialog', { name: 'LangGraph JSON' })
    const json = dialog.getByRole('textbox', { name: 'LangGraph JSON' })
    await expect(json).toHaveValue(/"conditional": true/)
    await expect(json).toHaveValue(/"data": "research"/)

    await json.fill('{"nodes": []}')
    await dialog.getByRole('button', { name: 'Import' }).click()
    await expect(dialog.getByRole('alert')).toContainText('This isn’t a LangGraph graph')

    await json.fill(
      JSON.stringify({
        nodes: [
          { id: '__start__', type: 'schema', data: '__start__' },
          { id: 'agent', type: 'runnable', data: { name: 'agent' } },
          {
            id: 'tools',
            type: 'runnable',
            data: { id: ['langgraph', 'prebuilt', 'tool_node', 'ToolNode'] },
          },
          { id: '__end__', type: 'schema', data: '__end__' },
        ],
        edges: [
          { source: '__start__', target: 'agent' },
          { source: 'agent', target: 'tools', conditional: true },
          { source: 'agent', target: '__end__', conditional: true },
          { source: 'tools', target: 'agent' },
        ],
      }),
    )
    await dialog.getByRole('button', { name: 'Import' }).click()
    await expect(dialog).toHaveCount(0)
    await expect(node(page, 'Router', graph)).toBeVisible()
    await expect(node(page, 'Tools', graph)).toBeVisible()
    await expect(node(page, 'Researcher', graph)).toHaveCount(0)
  })
})
