I just finished a feature in this React project and I'm about to commit. Do two things: update the README, then give me a commit message.

STEP 1: UPDATE README.md (project root)

1. Inspect what changed: run `git status` and `git diff` (staged and unstaged), and read any new or modified files.
2. Compare the changes against the current README.md and update only the sections the changes affect. Examples:
   - New or removed dependency, tool, or library -> Tech Stack
   - New or changed npm script -> Available Scripts
   - New or changed environment variable -> Environment Variables
   - New folder or restructured folders -> Project Structure (keep it matching the real tree)
   - New route or page -> Routing
   - New feature -> Overview / key features
   - New testing, CI, or deployment setup -> the matching section
   - Changes to conventions, state management, or styling -> the matching section
3. If a new tool or area appears that has no section yet, add a section for it and update the Table of Contents.
4. If something was removed from the project, delete it from the README completely. Leave no leftovers.
5. Keep the existing structure, order, tone, and formatting. Do not rewrite or reformat parts that are unaffected.
6. Document only what actually exists. No placeholders, no "TBD", no invented details.
7. If nothing in the README needs to change, leave it untouched and tell me.

STEP 2: COMMIT MESSAGE

- Give me on
- e commit message, 2 to 4 words.
- Use a production-style Conventional Commit prefix: feat, fix, refactor, perf, style, docs, chore, or build.
- Format: `type: short action phrase`, lowercase, imperative mood, no period.
- It must describe the actual change, specific rather than vague (not "update files" or "fix stuff").
- If the changes cover several unrelated things, pick the main one, and tell me if I should split them into separate commits.

OUTPUT FORMAT

1. A short list of the README sections you changed (or "no README changes needed").
2. The commit message on its own line, ready to copy.
