// Just enough of the mdast shape and Sätteri's visitor context for this
// plugin, so it needs no direct dependency on Sätteri's types
type MdastNode = {
    type: string
    depth?: number
    children?: readonly MdastNode[]
}

type HeadingContext = {
    setProperty: (node: MdastNode, key: 'depth', value: number) => void
}

const containsH1 = (node: MdastNode): boolean =>
    (node.type === 'heading' && node.depth === 1) ||
    (node.children ?? []).some(containsH1)

/**
 * Sätteri mdast plugin factory (one instance per document). The layout renders
 * the post title as the page's only <h1>, but some posts use `#` for their
 * sections. When a post does, every heading in it moves down one level (h6
 * stays h6), so the outline stays intact and section headings never compete
 * with the title. Posts that start at `##` are left alone.
 */
export const demoteHeadings = () => {
    let shift = 0
    return {
        name: 'demote-headings',
        before: (root: MdastNode) => {
            shift = containsH1(root) ? 1 : 0
        },
        heading: (node: MdastNode, ctx: HeadingContext) => {
            if (shift === 0 || node.depth === undefined) return
            ctx.setProperty(node, 'depth', Math.min(node.depth + shift, 6))
        },
    }
}
