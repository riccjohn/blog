---
name: Commit completeness check
description: Always run git status before committing to catch all modified files, not just the ones you think you changed
type: feedback
---

Before every commit, run `git status` and review all modified/untracked files. Deliberately decide which ones belong in the commit — don't just stage the files you remember touching.

**Why:** Claude has missed files (e.g. `package.json` after installing a dependency) multiple times, requiring follow-up commits.

**How to apply:** After staging the obvious files, scan the full `git status` output for anything unstaged that was affected by the same change. Package manager manifests (`package.json`, lockfiles) are easy to forget after installs.
