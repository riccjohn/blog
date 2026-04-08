#!/usr/bin/env node

import { writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const title = process.argv.slice(2).join(' ')

if (!title) {
    console.error('Usage: pnpm new-post "My Post Title"')
    process.exit(1)
}

const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

const today = new Date().toISOString().split('T')[0]

const frontmatter = `---
title: '${title}'
description: ''
pubDate: '${today}'
# updatedDate: '${today}'
# heroImage: '../../assets/images/your-image.jpg'
---
`

const outputPath = join(
    __dirname,
    '..',
    'src',
    'content',
    'blog',
    `${slug}.mdx`
)

if (existsSync(outputPath)) {
    console.error(`File already exists: ${outputPath}`)
    process.exit(1)
}

writeFileSync(outputPath, frontmatter)
console.log(`Created: src/content/blog/${slug}.mdx`)
