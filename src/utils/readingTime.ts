const WORDS_PER_MINUTE = 200
const CODE_WORDS_PER_MINUTE = 80 // Code requires more careful reading

/**
 * Calculates the estimated reading time for a given text.
 * Uses 200 words per minute for prose and 80 words per minute for code.
 *
 * @param content - The text content to calculate reading time for
 * @returns The estimated reading time in minutes (minimum 1)
 */
export const calculateReadingTime = (content: string): number => {
    // Extract code blocks to calculate separately
    const codeBlocks: string[] = []
    const codeBlockRegex = /```[\s\S]*?```/g
    let match
    while ((match = codeBlockRegex.exec(content)) !== null) {
        codeBlocks.push(match[0])
    }

    // Remove code blocks from main content
    const textWithoutCode = content.replace(/```[\s\S]*?```/g, '')

    // Remove inline code (treat as regular text since it's usually short)
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

    // Count prose words
    const proseWords = textWithoutMarkdown
        .split(/\s+/)
        .filter((word) => word.length > 0)
    const proseWordCount = proseWords.length

    // Count code words (excluding the ``` markers and language identifiers)
    const codeText = codeBlocks
        .map((block) => block.replace(/```[a-z]*\n?/g, '').replace(/```/g, ''))
        .join(' ')
    const codeWords = codeText.split(/\s+/).filter((word) => word.length > 0)
    const codeWordCount = codeWords.length

    // Calculate reading time for prose and code separately
    const proseMinutes = proseWordCount / WORDS_PER_MINUTE
    const codeMinutes = codeWordCount / CODE_WORDS_PER_MINUTE
    const totalMinutes = Math.ceil(proseMinutes + codeMinutes)

    // Return at least 1 minute
    return Math.max(1, totalMinutes)
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
