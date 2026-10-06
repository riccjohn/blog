// @ts-check
import { satteri } from '@astrojs/markdown-satteri'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import { demoteHeadings } from './src/utils/demoteHeadings'

// https://astro.build/config
export default defineConfig({
    site: 'https://arcanegrain.dev',
    markdown: {
        processor: satteri({ mdastPlugins: [demoteHeadings] }),
        shikiConfig: {
            transformers: [
                {
                    name: 'wrap-code-blocks',
                    pre(node) {
                        const meta = this.options.meta?.__raw ?? ''
                        if (
                            meta.split(/\s+/).includes('wrap') &&
                            typeof node.properties.style === 'string'
                        ) {
                            node.properties.style =
                                node.properties.style.concat(
                                    ';white-space:pre-wrap;word-break:break-word'
                                )
                        }
                    },
                },
            ],
        },
    },
    integrations: [mdx(), sitemap()],
    experimental: {
        contentIntellisense: true,
    },
    vite: {
        plugins: [tailwindcss()],
    },
})
