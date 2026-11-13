import { describe, expect, it } from 'vitest'

import { READABLE_ZOOM, readableViewport } from '@/components/ui/node-editor-canvas'

const pane = { width: 900, height: 500 }

describe.each([['node editor', readableViewport, READABLE_ZOOM, 13]] as const)(
  'readableViewport (%s)',
  (_, view, zoom, titlePx) => {
    it('keeps the title at 11px or more', () => {
      expect(titlePx * zoom).toBeGreaterThanOrEqual(11)
    })

    it('centers a graph that fits at the readable zoom', () => {
      const v = view({ x: 100, y: 40, width: 400, height: 200 }, pane, zoom)
      expect(v.zoom).toBe(zoom)
      // Same room left and right, above and below.
      expect(v.x + 100 * zoom).toBeCloseTo(pane.width - (v.x + 500 * zoom))
      expect(v.y + 40 * zoom).toBeCloseTo(pane.height - (v.y + 240 * zoom))
    })

    it('shows the top of a graph too tall to fit, still centered across', () => {
      const v = view({ x: 0, y: -300, width: 400, height: 2000 }, pane, zoom)
      // The first row sits 24px under the top edge; the bottom is past the canvas.
      expect(v.y + -300 * zoom).toBeCloseTo(24)
      expect(v.y + 1700 * zoom).toBeGreaterThan(pane.height)
      expect(v.x).toBeCloseTo((pane.width - 400 * zoom) / 2)
    })

    it('shows the left of a graph too wide to fit', () => {
      const v = view({ x: 50, y: 0, width: 3000, height: 100 }, pane, zoom)
      expect(v.x + 50 * zoom).toBeCloseTo(24)
      expect(v.x + 3050 * zoom).toBeGreaterThan(pane.width)
    })

    it('starts at the edge when the graph fits only without its margins', () => {
      const width = (pane.width - 20) / zoom
      const v = view({ x: 0, y: 0, width, height: 100 }, pane, zoom)
      expect(v.x).toBeCloseTo(24)
    })
  },
)
