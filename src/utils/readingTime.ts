const WORDS_PER_MINUTE = 200

/**
 * Calculates the estimated reading time for a given text.
 * Uses 200 words per minute as the average reading speed.
 *
 * @param content - The text content to calculate reading time for
 * @returns The estimated reading time in minutes (minimum 1)
 */
export const calculateReadingTime = (content: string): number => {
    // Remove code blocks (they're scanned, not read word-by-word)
    const textWithoutCode = content.replace(/```[\s\S]*?```/g, '')

    // Remove inline code
    const textWithoutInlineCode = textWithoutCode.replace(/`[^`]+`/g, '')

    // Remove HTML/JSX tags
    const textWithoutTags = textWithoutInlineCode.replace(/<[^>]+>/g, '')

    // Remove URLs
    const textWithoutUrls = textWithoutTags.replace(/https?:\/\/[^\s]+/g, '')

    // Remove markdown syntax (links, images, etc.)
    const textWithoutMarkdown = textWithoutUrls
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Keep link text
        .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // Remove images
        .replace(/#{1,6}\s/g, '') // Remove heading markers
        .replace(/[*_~`]/g, '') // Remove emphasis markers

    // Count words (split by whitespace and filter empty strings)
    const words = textWithoutMarkdown
        .split(/\s+/)
        .filter((word) => word.length > 0)

    const wordCount = words.length
    const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE)

    // Return at least 1 minute
    return Math.max(1, minutes)
}

/**
 * Formats the reading time as a human-readable string.
 *
 * @param minutes - The reading time in minutes
 * @returns A formatted string like "5 min read"
 */
export const formatReadingTime = (minutes: number): string => {
    return `${minutes} min read`
}
