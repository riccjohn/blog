<!--
# Blog Post Schema Validation Guide

This file demonstrates how the blog post frontmatter is validated and provides examples
of what will pass and fail schema checks.

See `src/content.config.ts` for the schema definition using Astro Content Collections + Zod.
-->

# Blog Post Schema Validation

## Schema Definition

From `src/content.config.ts`:

```typescript
const blog = defineCollection({
    loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(), // Coerced from string (e.g., "2025-01-15")
        updatedDate: z.coerce.date().optional(),
        heroImage: z.string().optional(),
    }),
})
```

## Validation Checks

### ✅ Valid Examples

**Minimal post (required fields only):**

```yaml
---
title: 'My First Post'
description: 'A short description for SEO'
pubDate: '2025-01-15'
---
```

**Complete post (all fields):**

```yaml
---
title: 'Advanced Astro Patterns'
description: 'Deep dive into content collections and dynamic routing'
pubDate: '2025-01-10'
updatedDate: '2025-01-15'
heroImage: '/blog-placeholder-1.jpg'
---
```

### ❌ Invalid Examples (will fail type-check)

**Missing required field:**

```yaml
---
title: 'My Post'
description: 'No pubDate field'
---
```

**Invalid date format:**

```yaml
---
title: 'My Post'
description: 'Invalid date'
pubDate: '01/15/2025' # Should be YYYY-MM-DD
---
```

**Non-string title:**

```yaml
---
title: 123 # Must be a string
description: 'Title is a number'
pubDate: '2025-01-15'
---
```

## Validation During Development

### Local Checks

Run `pnpm astro check` to validate all frontmatter against the schema:

```bash
pnpm astro check
```

This will report:

- Missing required fields
- Invalid field types
- Date parsing errors

### Type Safety

TypeScript in `src/pages/blog/[...slug].astro` provides autocomplete and type checking:

```typescript
type Props = CollectionEntry<'blog'>['data']
const { title, description, pubDate, updatedDate, heroImage } = Astro.props
```

If you add a post with invalid frontmatter, the type system will catch it during build.

## Common Mistakes

| Mistake                          | Fix                                                                      |
| -------------------------------- | ------------------------------------------------------------------------ |
| `pubDate: 2025-01-15` (unquoted) | Quote it: `pubDate: "2025-01-15"`                                        |
| `description: null`              | Provide a non-empty string                                               |
| `heroImage: ""` (empty string)   | Omit the field or provide a valid path                                   |
| `updatedDate` before `pubDate`   | Dates don't care about order, but `updatedDate` must be valid if present |

## Adding New Fields

To add a new field to the schema:

1. Update `src/content.config.ts`:

    ```typescript
    schema: z.object({
        // ...existing fields...
        author: z.string().optional(), // new field
    })
    ```

2. Update `src/layouts/BlogPost.astro` to display the new field if needed.

3. Run `pnpm astro check` to validate all existing posts.

4. Update existing posts' frontmatter if the new field is required.
