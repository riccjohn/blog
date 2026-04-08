---
name: Run quality checks after making changes
description: Always run pnpm astro check (and other quality gates) after making code changes, without waiting to be asked
type: feedback
---

Always run `pnpm astro check` (and `pnpm run prettier:write` when relevant) after making any code changes to verify nothing is broken.

**Why:** User expects proactive verification — don't make a change and leave it unconfirmed.

**How to apply:** After every edit to .astro, .ts, .tsx, or config files, run `pnpm astro check` before declaring the task done.
