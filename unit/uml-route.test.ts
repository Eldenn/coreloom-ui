import { describe, expect, it } from 'vitest'

import { labelSize, roundedPath, type RouteBox, routeEdges } from '@/lib/uml-route'

const box = (id: string, x: number, y: number, parent?: string): RouteBox => ({
  id,
  x,
  y,
  width: 120,
  height: 60,
  ...(parent ? { parent } : {}),
})

/** Whether a run of the line goes through the inside of the box. */
function crosses(points: readonly { x: number; y: number }[], b: RouteBox): boolean {
  return points.slice(1).some((q, i) => {
    const p = points[i] ?? q
    return (
      Math.max(p.x, q.x) > b.x &&
      Math.min(p.x, q.x) < b.x + b.width &&
      Math.max(p.y, q.y) > b.y &&
      Math.min(p.y, q.y) < b.y + b.height
    )
  })
}

const rightAngles = (points: readonly { x: number; y: number }[]) =>
  points.slice(1).every((q, i) => points[i]?.x === q.x || points[i]?.y === q.y)

describe('routeEdges', () => {
  it('goes straight between two boxes in line', () => {
    const routes = routeEdges(
      [box('a', 0, 0), box('b', 0, 200)],
      [{ id: 'e', source: 'a', target: 'b' }],
    )
    expect(routes.get('e')).toMatchObject({
      points: [
        { x: 60, y: 60 },
        { x: 60, y: 200 },
      ],
      sides: ['bottom', 'top'],
    })
  })

  it('goes round a box that stands between the two ends', () => {
    const between = box('between', 0, 150)
    const boxes = [box('a', 0, 0), between, box('b', 0, 300)]
    const route = routeEdges(boxes, [{ id: 'e', source: 'a', target: 'b' }]).get('e')
    expect(route).toBeDefined()
    expect(rightAngles(route?.points ?? [])).toBe(true)
    expect(crosses(route?.points ?? [], between)).toBe(false)
    expect(route?.points.length).toBeGreaterThan(2)
  })

  it('crosses the frame an end sits in, and goes round a frame that holds neither end', () => {
    const frame: RouteBox = { id: 'frame', x: -40, y: 110, width: 200, height: 140 }
    const inner = box('inner', 0, 150, 'frame')
    const boxes = [box('a', 0, 0), frame, inner, box('b', 0, 320)]
    const routes = routeEdges(boxes, [
      { id: 'in', source: 'a', target: 'inner' },
      { id: 'past', source: 'a', target: 'b' },
    ])
    expect(routes.get('in')?.points).toHaveLength(2)
    expect(crosses(routes.get('past')?.points ?? [], frame)).toBe(false)
  })

  it('sets two lines between the same boxes side by side', () => {
    const routes = routeEdges(
      [box('a', 0, 0), box('b', 0, 200)],
      [
        { id: 'one', source: 'a', target: 'b' },
        { id: 'two', source: 'b', target: 'a' },
      ],
    )
    const x = (id: string) => routes.get(id)?.points[0]?.x ?? 0
    expect(Math.abs(x('one') - x('two'))).toBeGreaterThanOrEqual(8)
  })

  it('puts a label where it covers no box and no other label', () => {
    const boxes = [box('a', 0, 0), box('b', 0, 160)]
    const label = labelSize('A fairly long label')
    const routes = routeEdges(boxes, [
      { id: 'one', source: 'a', target: 'b', label },
      { id: 'two', source: 'a', target: 'b', label },
    ])
    const rect = (id: string) => {
      const p = routes.get(id)?.label ?? { x: 0, y: 0 }
      return { id, x: p.x - label.width / 2, y: p.y - label.height / 2, ...label }
    }
    const [one, two] = [rect('one'), rect('two')]
    expect(one.y + one.height <= two.y || two.y + two.height <= one.y).toBe(true)
  })

  it('joins two boxes that touch, and leaves out a line to a box that is not there', () => {
    const routes = routeEdges(
      [box('a', 0, 0), box('b', 130, 20)],
      [
        { id: 'near', source: 'a', target: 'b' },
        { id: 'gone', source: 'a', target: 'nowhere' },
        { id: 'self', source: 'a', target: 'a' },
      ],
    )
    expect(rightAngles(routes.get('near')?.points ?? [])).toBe(true)
    expect([...routes.keys()]).toEqual(['near'])
  })

  it('routes a busy diagram quickly', () => {
    const boxes = Array.from({ length: 40 }, (_, i) =>
      box(`n${String(i)}`, (i % 8) * 170, Math.floor(i / 8) * 140),
    )
    const edges = Array.from({ length: 60 }, (_, i) => ({
      id: `e${String(i)}`,
      source: `n${String(i % 40)}`,
      target: `n${String((i * 7 + 11) % 40)}`,
    }))
    const started = performance.now()
    const routes = routeEdges(boxes, edges)
    expect(performance.now() - started).toBeLessThan(500)
    for (const [id, route] of routes) {
      const edge = edges.find((e) => e.id === id)
      for (const b of boxes) {
        if (b.id === edge?.source || b.id === edge?.target) continue
        expect(crosses(route.points, b), `${id} crosses ${b.id}`).toBe(false)
      }
    }
  })
})

describe('roundedPath', () => {
  it('rounds each corner and keeps the ends', () => {
    expect(
      roundedPath([
        { x: 0, y: 0 },
        { x: 0, y: 20 },
        { x: 30, y: 20 },
      ]),
    ).toBe('M 0 0 L 0 14 Q 0 20 6 20 L 30 20')
  })
})
