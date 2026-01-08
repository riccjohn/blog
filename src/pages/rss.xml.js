import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { SITE_TITLE, SITE_DESCRIPTION } from '@/consts'

export async function GET(context) {
    const posts = await getCollection('blog')
    return rss({
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        site: context.site,
        items: posts.map((post) => ({
            title: post.data.title,
            description: post.data.description,
            pubDate: post.data.pubDate,
            link: `/blog/${post.id}/`,
            // Extract image src from ImageMetadata object if present
            ...(post.data.heroImage && {
                customData: `<enclosure url="${new URL(post.data.heroImage.src, context.site).href}" type="image/${post.data.heroImage.format}" length="0"/>`,
            }),
        })),
    })
}
