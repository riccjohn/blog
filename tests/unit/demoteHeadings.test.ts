import { demoteHeadings } from '@/utils/demoteHeadings'
import { describe, expect, it } from 'vitest'

type Node = { type: string; depth?: number; children?: Node[] }

const heading = (depth: number): Node => ({ type: 'heading', depth })
const root = (...children: Node[]): Node => ({ type: 'root', children })

// Runs the plugin the way Sätteri does: `before` on the root, then the
// heading visitor on each heading. Returns the resulting depths.
const run = (tree: Node, headings: Node[]): number[] => {
    const plugin = demoteHeadings()
    plugin.before(tree)
    const ctx = {
        setProperty: (
            node: { depth?: number },
            _key: 'depth',
            value: number
        ) => {
            node.depth = value
        },
    }
    headings.forEach((node) => plugin.heading(node, ctx))
    return headings.flatMap((node) => node.depth ?? [])
}

describe('demoteHeadings', () => {
    it('moves every heading down a level when the post uses h1', () => {
        const h = [heading(1), heading(2), heading(3)]
        const nested = { type: 'mdxJsxFlowElement', children: [h[2]] }
        expect(run(root(h[0], h[1], nested), h)).toEqual([2, 3, 4])
    })

    it('finds an h1 nested inside a component', () => {
        const h = [heading(1), heading(2)]
        const nested = { type: 'mdxJsxFlowElement', children: [h[0]] }
        expect(run(root(nested, h[1]), h)).toEqual([2, 3])
    })

    it('leaves posts that start at h2 alone', () => {
        const h = [heading(2), heading(3)]
        expect(run(root(...h), h)).toEqual([2, 3])
    })

    it('keeps h6 at h6', () => {
        const h = [heading(1), heading(6)]
        expect(run(root(...h), h)).toEqual([2, 6])
    })
})
