You are working inside my React front-end project. Your task is to create a complete, accurate README.md in the project root, using the README template in my notes folder as the structural guide.

TEMPLATE

- Location: <path to the template README in the notes folder>
- Treat it as an outline only. Do not modify it, and do not copy it as-is into the root. The final README must be written fresh for this project.

HOW TO WORK

1. Read the template to learn the intended sections and their order.
2. Inspect the actual project before writing anything: package.json, lockfiles, config files (build tool, TypeScript, linter, formatter), .env files and .env.example, the src folder, the routes, the CI/CD files, and any existing docs or license file.
3. Create README.md in the project root with every section filled from what you actually found.

RULES

- Replace every placeholder (anything in <angle brackets>, "TBD", or generic descriptions) with real, project-specific content.
- Project name and description: derive them from package.json, the existing code, and the app's behavior. Write a clear one-line description and a short overview of the main features.
- Badges: add relevant badges based on what the project really uses (framework version, language, license, build status, deployment) and only where the data is available. Do not invent URLs.
- Browser support: fill it in from the browserslist config if present. Otherwise infer it from the build tool and target settings.
- Folder structure: do NOT keep the template's structure. Replace it with the real folder tree of this project, with a short comment per folder explaining its purpose. Leave out node_modules, build output, and hidden or generated folders.
- Tech stack, scripts, environment variables, routing, state management, styling, and deployment: document only what exists, using the exact commands and variable names from the project.
- REMOVE, do not skip or mark as "not found": if something does not exist in the project (for example, no testing tool, no router, no state library, no CI, no Storybook), delete that section or row entirely. Leave no placeholder, no "N/A", no "not configured" note, and no empty heading. Also remove the matching entry from the Table of Contents.
- Keep the Table of Contents in sync with the sections that remain, and keep the numbering and anchors correct.
- Fill every remaining gap yourself from the codebase. If something cannot be determined from the project and is essential, make a reasonable best inference. Do not leave blanks.
- Write in clear, concise, professional English. Do not add features, tools, or claims that are not in the project.

OUTPUT

- A single README.md at the project root, ready to commit.
- After writing it, give me a short list of: sections you removed (and why), and any assumptions you made that I should double-check.
